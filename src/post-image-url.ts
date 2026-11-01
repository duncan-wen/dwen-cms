/** Where an image stored next to a Post is served: `/posts/<slug>/<file>`. */
export function postImageUrl(slug: string, file: string): string {
  return `/posts/${slug}/${file.split("/").map(encodeURIComponent).join("/")}`;
}
