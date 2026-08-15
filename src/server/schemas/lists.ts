import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().optional(),
});

export const renameListSchema = z.object({
  name: z.string().min(1),
});

export const addItemSchema = z.object({
  comment: z.string().max(1000).optional(),
  image: z.instanceof(File).optional(),
  foundAt: z.iso.datetime().optional(),
  location: z.string().max(200).optional(),
});

export const updateCommentSchema = z.object({
  comment: z.string().max(1000),
});
