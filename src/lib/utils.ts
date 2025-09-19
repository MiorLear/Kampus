// Pequeño helper para concatenar clases de forma segura
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
