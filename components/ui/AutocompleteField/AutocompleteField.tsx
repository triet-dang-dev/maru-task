"use client";

import Autocomplete, {
  type AutocompleteProps,
  type AutocompleteValue,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
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

type MuiAutocompleteProps<TOption> = AutocompleteProps<
  TOption,
  boolean | undefined,
  boolean | undefined,
  false
>;

export type AutocompleteFieldProps<TOption, TFieldValues extends FieldValues = FieldValues> = Omit<
  MuiAutocompleteProps<TOption>,
  "name" | "renderInput"
> & {
  control?: Control<TFieldValues>;
  error?: boolean;
  helperText?: React.ReactNode;
  label: string;
  name: Path<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
};

function AutocompleteFieldInner<TOption, TFieldValues extends FieldValues = FieldValues>(
  {
    className,
    control,
    error,
    helperText,
    label,
    name,
    onChange,
    rules,
    ...props
  }: AutocompleteFieldProps<TOption, TFieldValues>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  if (control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Autocomplete
            {...props}
            className={cn("w-full", className)}
            onBlur={field.onBlur}
            onChange={(event, value, reason, details) => {
              field.onChange(value);
              onChange?.(event, value, reason, details);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                error={Boolean(fieldState.error) || error}
                helperText={fieldState.error?.message ?? helperText}
                inputRef={mergeRefs(field.ref, ref)}
                label={label}
                name={field.name}
              />
            )}
            value={
              (field.value ?? (props.multiple ? [] : null)) as AutocompleteValue<
                TOption,
                boolean | undefined,
                boolean | undefined,
                false
              >
            }
          />
        )}
        rules={rules}
      />
    );
  }

  return (
    <Autocomplete
      {...props}
      className={cn("w-full", className)}
      onChange={onChange}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          helperText={helperText}
          inputRef={ref}
          label={label}
          name={name}
        />
      )}
    />
  );
}

export const AutocompleteField = forwardRef(AutocompleteFieldInner) as <
  TOption,
  TFieldValues extends FieldValues = FieldValues,
>(
  props: AutocompleteFieldProps<TOption, TFieldValues> & RefAttributes<HTMLInputElement>,
) => ReactElement;
