import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
  displayName: z.string().trim().min(2, "Nome muito curto").max(60),
});

export const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

export const birthProfileSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  timeUnknown: z.boolean(),
  placeLabel: z.string().trim().min(2, "Escolha uma cidade"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const drawSchema = z.object({
  spread: z.enum(["single", "three"]),
});

export const noteSchema = z.object({
  drawId: z.string().min(1),
  note: z.string().max(500),
});
