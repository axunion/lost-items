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
