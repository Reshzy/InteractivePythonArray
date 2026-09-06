export const SITE_TITLE =
  "Python Lists Playground — Learn Python List Methods Visually";
export const SITE_DESCRIPTION =
  "Learn Python lists interactively. Visualize append, pop, remove, insert, sort, reverse, count, index and more as your list updates in real time.";

export function getSiteUrl(): URL {
  return new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  );
}
