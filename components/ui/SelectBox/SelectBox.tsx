"use client";

import MenuItem from "@mui/material/MenuItem";
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

export interface SelectBoxOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export type SelectBoxProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  TextFieldProps,
  "children" | "defaultValue" | "name" | "select"
> & {
  control?: Control<TFieldValues>;
  name: Path<TFieldValues>;
  options: SelectBoxOption[];
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
};

function renderOptions(options: SelectBoxOption[]) {
  return options.map((option) => (
    <MenuItem disabled={option.disabled} key={option.value} value={option.value}>
      {option.label}
    </MenuItem>
  ));
}

function SelectBoxInner<TFieldValues extends FieldValues = FieldValues>(
  { className, control, helperText, name, options, rules, ...props }: SelectBoxProps<TFieldValues>,
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
            select
            value={field.value ?? ""}
          >
            {renderOptions(options)}
          </TextField>
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
      select
    >
      {renderOptions(options)}
    </TextField>
  );
}

export const SelectBox = forwardRef(SelectBoxInner) as <
  TFieldValues extends FieldValues = FieldValues,
>(
  props: SelectBoxProps<TFieldValues> & RefAttributes<HTMLInputElement>,
) => ReactElement;
