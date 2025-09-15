// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: telegram-auth
// Responsibilities:
// - Validate internal Bearer secret
// - Upsert auth user based on Telegram user payload
// - Ensure a corresponding row exists in public.teachers
// - Create and return a Supabase auth session (access/refresh tokens)

// @ts-ignore - Deno std import is resolved in the Edge Function runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore - Supabase client import is resolved in the Edge Function runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type TelegramVerifiedPayload = {
  user_id: string; // stringified Telegram id
  first_name: string;
  username?: string;
  photo_url?: string;
};

type AuthResponse = {
  user: {
    id: string;
    first_name: string;
    username?: string;
    photo_url?: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
};

// Provide a minimal Deno typing so TypeScript in the repo doesn't error
declare const Deno: { env: { get(key: string): string | undefined } };

// Note: Supabase disallows secrets starting with the SUPABASE_ prefix.
// Use neutral names and document them in deployment scripts.
const SB_URL = Deno.env.get("SB_URL");
const SB_ANON_KEY = Deno.env.get("SB_ANON_KEY");
const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY");
const EDGE_AUTH_TELEGRAM_SECRET = Deno.env.get("EDGE_AUTH_TELEGRAM_SECRET");

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function assertEnv(): void {
  if (!SB_URL) throw new Error("SB_URL is not set");
  if (!SB_ANON_KEY) throw new Error("SB_ANON_KEY is not set");
  if (!SB_SERVICE_ROLE_KEY) throw new Error("SB_SERVICE_ROLE_KEY is not set");
  if (!EDGE_AUTH_TELEGRAM_SECRET) throw new Error("EDGE_AUTH_TELEGRAM_SECRET is not set");
}

async function ensureAuthUser(payload: TelegramVerifiedPayload) {
  const admin = createClient(SB_URL!, SB_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const email = `tg_${payload.user_id}@telegram.local`;
  const randomPassword = crypto.randomUUID();

  // Try to create user first. If it already exists, we'll locate it via listUsers.
  const created = await admin.auth.admin.createUser({
    email,
    password: randomPassword,
    email_confirm: true,
    user_metadata: {
      telegram_id: payload.user_id,
      first_name: payload.first_name,
      username: payload.username ?? null,
      photo_url: payload.photo_url ?? null,
      provider: "telegram",
    },
  });

  if (!created.error && created.data?.user) {
    return { user: created.data.user, email, password: randomPassword } as const;
  }

  // If user already exists, find by email using paginated listUsers
  // We'll scan up to 10 pages x 200 users each (reasonable upper bound for this app)
  let foundUser: any | null = null;
  for (let page = 1; page <= 10; page++) {
    const listed = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (listed.error) break;
    const match = listed.data.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) {
      foundUser = match;
      break;
    }
    if (!listed.data.users || listed.data.users.length === 0) break;
  }

  if (!foundUser) {
    throw new Error(`Failed to locate existing user for email ${email}: ${created.error?.message ?? "unknown"}`);
  }

  // Update metadata and rotate password so that we can create a session
  const updated = await admin.auth.admin.updateUserById(foundUser.id, {
    password: randomPassword,
    user_metadata: {
      ...(foundUser.user_metadata ?? {}),
      telegram_id: payload.user_id,
      first_name: payload.first_name,
      username: payload.username ?? null,
      photo_url: payload.photo_url ?? null,
      provider: "telegram",
    },
  });
  if (updated.error || !updated.data.user) {
    throw new Error(`Failed to update user: ${updated.error?.message ?? "unknown"}`);
  }
  return { user: updated.data.user, email, password: randomPassword } as const;
}

async function ensureTeacherRow(userId: string, payload: TelegramVerifiedPayload) {
  const admin = createClient(SB_URL!, SB_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { error } = await admin
    .from("teachers")
    .upsert(
      {
        id: userId,
        telegram_id: payload.user_id,
        first_name: payload.first_name,
        username: payload.username ?? null,
        photo_url: payload.photo_url ?? null,
      },
      { onConflict: "id" },
    );
  if (error) throw new Error(`Failed to upsert teacher: ${error.message}`);
}

async function createSession(email: string, password: string) {
  const anon = createClient(SB_URL!, SB_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data?.session) {
    throw new Error(`Failed to create session: ${error?.message ?? "unknown"}`);
  }
  return data.session;
}

serve(async (req: Request) => {
  try {
    assertEnv();

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }

    const authz = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authz || !authz.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authz.slice("Bearer ".length).trim();
    if (token !== EDGE_AUTH_TELEGRAM_SECRET) {
      return jsonResponse({ error: "Forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, { status: 400 });
    }

    const { user_id, first_name, username, photo_url } = (body ?? {}) as Record<string, any>;
    if (
      typeof user_id !== "string" ||
      user_id.length === 0 ||
      typeof first_name !== "string" ||
      first_name.length === 0
    ) {
      return jsonResponse({ error: "Invalid payload" }, { status: 400 });
    }

    const payload: TelegramVerifiedPayload = {
      user_id,
      first_name,
      username: typeof username === "string" && username.length > 0 ? username : undefined,
      photo_url: typeof photo_url === "string" && photo_url.length > 0 ? photo_url : undefined,
    };

    const { user, email, password } = await ensureAuthUser(payload);
    await ensureTeacherRow(user.id, payload);

    const session = await createSession(email, password);
    // Log successful login in Edge logs
    console.info('[telegram-auth] login success for telegram_id:', payload.user_id, 'name:', payload.first_name);

    const response: AuthResponse = {
      user: {
        id: user.id,
        first_name: payload.first_name,
        username: payload.username,
        photo_url: payload.photo_url,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token!,
      },
    };

    return jsonResponse(response, { status: 200 });
  } catch (e) {
    console.error("[telegram-auth] error:", e);
    return jsonResponse({ error: "Internal error" }, { status: 500 });
  }
});


