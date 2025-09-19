// src/components/auth/ForgotForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema, type ForgotInput } from "../../validation/authSchemas";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type Props = {
  onSubmitForgot: (data: ForgotInput) => Promise<void> | void;
};

export default function ForgotForm({ onSubmitForgot }: Props) {
  const { register, handleSubmit, formState } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: { email: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmitForgot)} className="space-y-4">
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          placeholder="tucorreo@dominio.com"
          {...register("email")}
        />
        {formState.errors.email && (
          <p className="text-sm text-red-500">{formState.errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={formState.isSubmitting}
        className="w-full"
      >
        {formState.isSubmitting ? "Enviando…" : "Enviar enlace de recuperación"}
      </Button>
    </form>
  );
}
