"use client";

import * as React from "react";
import { cn } from "@toolshare/lib";
import { Label } from "./label";

/**
 * FormField
 * ----------------------------------------------------------------------
 * Wraps a single form control with its label, helper text, and error
 * message, wiring up `id`, `aria-describedby`, and `aria-invalid`
 * automatically via React.cloneElement on the single child control.
 *
 * Usage:
 *   <FormField label="Tool name" error={errors.name}>
 *     <Input placeholder="e.g. Cordless drill" />
 *   </FormField>
 */
export interface FormFieldProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** A single form control element (Input, Textarea, Select, etc.) */
  children: React.ReactElement<React.InputHTMLAttributes<HTMLElement>>;
  htmlFor?: string;
}

function useFieldId(explicit?: string) {
  const generated = React.useId();
  return explicit ?? generated;
}

export function FormField({
  label,
  helperText,
  error,
  required,
  className,
  children,
  htmlFor,
}: FormFieldProps) {
  const id = useFieldId(htmlFor ?? children.props.id);
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const control = React.cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  } as React.InputHTMLAttributes<HTMLElement>);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {control}
      {error ? (
        <p id={errorId} className="text-sm text-danger-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
