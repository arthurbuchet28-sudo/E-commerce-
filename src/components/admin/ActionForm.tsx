"use client";

import {
  createContext,
  useActionState,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";

import type { FormState } from "@/app/compte/actions";
import { FormMessage } from "@/components/account/FormMessage";
import { Button } from "@/components/ui/Button";
import { Checkbox, SelectField, TextAreaField, TextField } from "@/components/ui/Field";

const ErrorsContext = createContext<Record<string, string> | undefined>(undefined);

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Back-office form: runs a server action, announces the result and passes field errors to
 * the Admin* fields below it. Hidden inputs carry ids; nothing else is trusted server-side.
 */
export function ActionForm({
  action,
  submitLabel,
  children,
  variant = "primary",
  className,
  encType,
}: {
  action: Action;
  submitLabel: string;
  children?: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  encType?: "multipart/form-data";
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as FormState);
  return (
    <form
      action={formAction}
      className={className ?? "flex flex-col gap-4"}
      noValidate
      encType={encType}
    >
      <FormMessage state={state} />
      <ErrorsContext.Provider value={state.fieldErrors}>{children}</ErrorsContext.Provider>
      <div>
        <Button type="submit" variant={variant} disabled={pending}>
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

const useError = (name?: string) => {
  const errors = useContext(ErrorsContext);
  return name ? errors?.[name] : undefined;
};

export function AdminTextField(props: Omit<ComponentProps<typeof TextField>, "error">) {
  return <TextField {...props} error={useError(props.name)} />;
}

export function AdminTextArea(props: Omit<ComponentProps<typeof TextAreaField>, "error">) {
  return <TextAreaField {...props} error={useError(props.name)} />;
}

export function AdminSelect(props: Omit<ComponentProps<typeof SelectField>, "error">) {
  return <SelectField {...props} error={useError(props.name)} />;
}

export function AdminCheckbox(props: Omit<ComponentProps<typeof Checkbox>, "error">) {
  return <Checkbox {...props} error={useError(props.name)} />;
}
