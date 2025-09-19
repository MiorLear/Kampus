// src/validation/authSchemas.ts
import { z } from "zod";

/* ===============================
   Reglas para campos individuales
   =============================== */
export const emailSchema = z
  .string()
  .min(1, { message: "El correo es obligatorio" })
  .email({ message: "Correo inválido" });

export const passwordSchema = z
  .string()
  .min(1, { message: "La contraseña es obligatoria" })
  .min(8, { message: "Mínimo 8 caracteres" })
  .max(72, { message: "Máximo 72 caracteres" })
  .regex(/[A-Z]/, { message: "Debe tener al menos una mayúscula" })
  .regex(/[a-z]/, { message: "Debe tener al menos una minúscula" })
  .regex(/\d/, { message: "Debe tener al menos un número" });

/* ===============================
   Login
   =============================== */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "La contraseña es obligatoria" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

/* ===============================
   Registro
   =============================== */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Tu nombre es obligatorio" })
      .min(2, { message: "Mínimo 2 caracteres" }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Confirma tu contraseña" }),
    role: z.enum(["student", "teacher", "admin"]), // 👈 sin opciones extra
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/* ===============================
   Recuperar contraseña
   =============================== */
export const forgotSchema = z.object({
  email: emailSchema,
});
export type ForgotInput = z.infer<typeof forgotSchema>;

/* ===============================
   Verificación de correo
   =============================== */
export const emailVerificationSchema = z.object({
  email: emailSchema,
});
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
