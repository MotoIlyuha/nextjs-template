import * as React from 'react';
import { FormProvider, useFormContext, type ControllerProps, Controller } from 'react-hook-form';

export { FormProvider as Form } from 'react-hook-form';

export function FormField<TFieldValues extends Record<string, any>>(
  props: Omit<ControllerProps<TFieldValues>, 'render' | 'control'> & { children: (field: any) => React.ReactNode },
) {
  const { control } = useFormContext<TFieldValues>();
  const { name, rules, defaultValue, shouldUnregister, disabled } = props as any;
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      disabled={disabled}
      render={({ field }) => (props as any).children(field)}
    />
  );
}

export function FormItem({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`space-y-2 ${className}`} {...props} />;
}


