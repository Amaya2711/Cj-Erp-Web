import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z.string().min(3, "Nombre demasiado corto"),
  ruc: z
    .string()
    .min(8, "RUC invalido")
    .max(15, "RUC invalido")
    .regex(/^[0-9]+$/, "El RUC debe contener solo numeros"),
  direccion: z.string().max(200, "Direccion demasiado larga").optional(),
  telefono: z
    .string()
    .max(20, "Telefono demasiado largo")
    .regex(/^[0-9+\-\s()]*$/, "Formato de telefono no valido")
    .optional(),
  estado: z.boolean(),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
