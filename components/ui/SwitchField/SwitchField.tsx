"use client";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Switch, { type SwitchProps } from "@mui/material/Switch";
import { forwardRef, type ReactElement, type ReactNode, type RefAttributes, useId } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

import { cn } from "@/utils/cn";

export type SwitchFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  SwitchProps,
  "name"
> & {
  control?: Control<TFieldValues>;
  error?: boolean;
  helperText?: ReactNode;
  label: ReactNode;
  name: Path<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
};

function SwitchFieldInner<TFieldValues extends FieldValues = FieldValues>(
  {
    className,
    control,
    error,
    helperText,
    label,
    name,
    rules,
    ...props
  }: SwitchFieldProps<TFieldValues>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const helperTextId = useId();

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
              <FormControlLabel
                control={
                  <Switch
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
                        "aria-describedby": resolvedHelperText ? helperTextId : undefined,
                        ref: field.ref,
                      },
                    }}
                  />
                }
                label={label}
              />
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
      <FormControlLabel
        control={
          <Switch
            {...props}
            name={name}
            ref={ref}
            slotProps={{
              ...props.slotProps,
              input: {
                ...props.slotProps?.input,
                "aria-describedby": helperText ? helperTextId : undefined,
              },
            }}
          />
        }
        label={label}
      />
      {helperText ? <FormHelperText id={helperTextId}>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}

export const SwitchField = forwardRef(SwitchFieldInner) as <
  TFieldValues extends FieldValues = FieldValues,
>(
  props: SwitchFieldProps<TFieldValues> & RefAttributes<HTMLButtonElement>,
) => ReactElement;
