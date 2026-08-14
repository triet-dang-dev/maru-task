"use client";

import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { forwardRef, type ReactElement, type RefAttributes } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

import { mergeRefs } from "@/components/ui/form-field-utils";
import { cn } from "@/utils/cn";

export type InputFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  TextFieldProps,
  "defaultValue" | "name"
> & {
  control?: Control<TFieldValues>;
  name: Path<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
};

function InputFieldInner<TFieldValues extends FieldValues = FieldValues>(
  { className, control, helperText, name, rules, ...props }: InputFieldProps<TFieldValues>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  if (control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <TextField
            {...props}
            className={cn("w-full", className)}
            error={Boolean(fieldState.error) || props.error}
            helperText={fieldState.error?.message ?? helperText}
            inputRef={mergeRefs(field.ref, ref)}
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value ?? ""}
          />
        )}
        rules={rules}
      />
    );
  }

  return (
    <TextField
      {...props}
      className={cn("w-full", className)}
      helperText={helperText}
      inputRef={ref}
      name={name}
    />
  );
}

export const InputField = forwardRef(InputFieldInner) as <
  TFieldValues extends FieldValues = FieldValues,
>(
  props: InputFieldProps<TFieldValues> & RefAttributes<HTMLInputElement>,
) => ReactElement;
