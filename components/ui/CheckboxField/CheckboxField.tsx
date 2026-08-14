"use client";

import Checkbox, { type CheckboxProps } from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { forwardRef, type ReactElement, type ReactNode, type RefAttributes } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

import { cn } from "@/utils/cn";

export type CheckboxFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  CheckboxProps,
  "name"
> & {
  control?: Control<TFieldValues>;
  error?: boolean;
  helperText?: ReactNode;
  label: ReactNode;
  name: Path<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
};

function CheckboxFieldInner<TFieldValues extends FieldValues = FieldValues>(
  {
    className,
    control,
    error,
    helperText,
    label,
    name,
    rules,
    ...props
  }: CheckboxFieldProps<TFieldValues>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  if (control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormControl className={cn("w-full", className)} error={Boolean(fieldState.error)}>
            <FormControlLabel
              control={
                <Checkbox
                  {...props}
                  checked={Boolean(field.value)}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(_, checked) => field.onChange(checked)}
                  ref={ref}
                  slotProps={{
                    ...props.slotProps,
                    input: {
                      ...props.slotProps?.input,
                      ref: field.ref,
                    },
                  }}
                />
              }
              label={label}
            />
            {fieldState.error?.message || helperText ? (
              <FormHelperText>{fieldState.error?.message ?? helperText}</FormHelperText>
            ) : null}
          </FormControl>
        )}
        rules={rules}
      />
    );
  }

  return (
    <FormControl className={cn("w-full", className)} error={error}>
      <FormControlLabel control={<Checkbox {...props} name={name} ref={ref} />} label={label} />
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}

export const CheckboxField = forwardRef(CheckboxFieldInner) as <
  TFieldValues extends FieldValues = FieldValues,
>(
  props: CheckboxFieldProps<TFieldValues> & RefAttributes<HTMLButtonElement>,
) => ReactElement;
