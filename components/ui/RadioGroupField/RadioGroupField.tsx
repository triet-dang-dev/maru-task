"use client";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import MuiRadioGroup, { type RadioGroupProps } from "@mui/material/RadioGroup";
import { forwardRef, type ReactElement, type ReactNode, type RefAttributes, useId } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

import { cn } from "@/utils/cn";

export interface RadioGroupFieldOption {
  disabled?: boolean;
  label: ReactNode;
  value: string;
}

export type RadioGroupFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  RadioGroupProps,
  "name" | "value"
> & {
  control?: Control<TFieldValues>;
  error?: boolean;
  helperText?: ReactNode;
  label: ReactNode;
  name: Path<TFieldValues>;
  options: RadioGroupFieldOption[];
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
};

function RadioGroupFieldInner<TFieldValues extends FieldValues = FieldValues>(
  {
    className,
    control,
    error,
    helperText,
    label,
    name,
    options,
    rules,
    ...props
  }: RadioGroupFieldProps<TFieldValues>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const labelId = useId();
  const helperTextId = useId();

  const renderOptions = (fieldRef?: (element: HTMLInputElement | null) => void) =>
    options.map((option, index) => (
      <FormControlLabel
        control={
          <Radio
            ref={index === 0 ? ref : undefined}
            slotProps={index === 0 && fieldRef ? { input: { ref: fieldRef } } : undefined}
          />
        }
        disabled={option.disabled}
        key={option.value}
        label={option.label}
        value={option.value}
      />
    ));

  if (control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const resolvedHelperText = fieldState.error?.message ?? helperText;

          return (
            <FormControl
              className={cn("w-full", className)}
              error={Boolean(fieldState.error) || error}
            >
              <FormLabel id={labelId}>{label}</FormLabel>
              <MuiRadioGroup
                {...props}
                aria-describedby={resolvedHelperText ? helperTextId : undefined}
                aria-labelledby={labelId}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? ""}
              >
                {renderOptions(field.ref)}
              </MuiRadioGroup>
              {resolvedHelperText ? (
                <FormHelperText id={helperTextId}>{resolvedHelperText}</FormHelperText>
              ) : null}
            </FormControl>
          );
        }}
        rules={rules}
      />
    );
  }

  return (
    <FormControl className={cn("w-full", className)} error={error}>
      <FormLabel id={labelId}>{label}</FormLabel>
      <MuiRadioGroup
        {...props}
        aria-describedby={helperText ? helperTextId : undefined}
        aria-labelledby={labelId}
        name={name}
      >
        {renderOptions()}
      </MuiRadioGroup>
      {helperText ? <FormHelperText id={helperTextId}>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}

export const RadioGroupField = forwardRef(RadioGroupFieldInner) as <
  TFieldValues extends FieldValues = FieldValues,
>(
  props: RadioGroupFieldProps<TFieldValues> & RefAttributes<HTMLButtonElement>,
) => ReactElement;
