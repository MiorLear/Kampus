import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "../../validation/authSchemas";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type Props = {
  onSubmitRegister: (data: RegisterInput) => Promise<void> | void;
};

export default function RegisterForm({ onSubmitRegister }: Props) {
  const { register, handleSubmit, formState, watch, setValue } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "student" },
  });

  const pwd = watch("password");

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmitRegister)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Tu nombre" {...register("name")} />
            {formState.errors.name && <p className="text-sm text-red-500">{formState.errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" placeholder="tucorreo@dominio.com" {...register("email")} />
            {formState.errors.email && <p className="text-sm text-red-500">{formState.errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="Mínimo 8, may/min y número" {...register("password")} />
            {formState.errors.password && <p className="text-sm text-red-500">{formState.errors.password.message}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" placeholder="Repite la contraseña" {...register("confirmPassword")} />
            {!formState.errors.confirmPassword && pwd && (
              <p className="text-xs text-gray-500 mt-1">Asegúrate de que coincida con la anterior.</p>
            )}
            {formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">{formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Rol</Label>
            <Select value={watch("role")} onValueChange={(v) => setValue("role", v as any, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {formState.errors.role && <p className="text-sm text-red-500">{formState.errors.role.message as string}</p>}
          </div>

          <Button type="submit" disabled={formState.isSubmitting} className="w-full">
            {formState.isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
