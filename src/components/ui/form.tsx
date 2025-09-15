import * as React from 'react';
import { FormProvider, useFormContext, type ControllerProps, Controller } from 'react-hook-form';

export { FormProvider as Form } from 'react-hook-form';

export function FormField<TFieldValues extends Record<string, any>, TName extends string>(
  props: ControllerProps<TFieldValues, TName> & { children: (field: any) => React.ReactNode },
) {
  const { control } = useFormContext<TFieldValues>();
  return <Controller control={control} {...props} render={({ field }) => props.children(field)} />;
}

export function FormItem({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`space-y-2 ${className}`} {...props} />;
}


