import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().optional(),
});

export const renameListSchema = z.object({
  name: z.string().min(1),
});

// Shared by item creation and item update — both forms expose the same fields.
export const itemFormSchema = z.object({
  comment: z.string().max(1000).optional(),
  image: z.instanceof(File).optional(),
  foundAt: z.iso.datetime().optional(),
  location: z.string().max(200).optional(),
});
