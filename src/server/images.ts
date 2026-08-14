// Maps a stored R2 object key to the URL that serves it via imagesRoute.
// Shared by the Hono API and the Astro SSR pages so the scheme lives in one place.
export function imageUrl(key: string | null | undefined): string | null {
  return key ? `/api/images/${key}` : null;
}

// Replaces a row's stored imageKey with the public imageUrl it resolves to.
// Shared by the Hono API and the Astro SSR pages so the mapping lives in one place.
export function withImageUrl<T extends { imageKey: string | null }>(
  item: T,
): Omit<T, "imageKey"> & { imageUrl: string | null } {
  const { imageKey, ...rest } = item;
  return { ...rest, imageUrl: imageUrl(imageKey) };
}

// Builds the R2 object key for a newly uploaded image. Always prefixed with the
// list's publicId (never its admin id) — the key is exposed in image URLs on the
// public room page, so an admin id here would let anyone with the public link
// derive the register URL.
export function buildImageKey(publicId: string, filename: string): string {
  return `${publicId}/${crypto.randomUUID()}-${filename}`;
}

// Resolves an item for rendering on a public surface: strips the stored imageKey
// in favor of imageUrl (via withImageUrl) and replaces the admin listId with the
// list's publicId, since both are serialized into public page/props output.
export function toPublicItem<
  T extends { imageKey: string | null; listId: string },
>(
  item: T,
  publicId: string,
): Omit<T, "imageKey"> & { imageUrl: string | null; listId: string } {
  const { imageKey, ...rest } = item;
  return { ...rest, imageUrl: imageUrl(imageKey), listId: publicId };
}
