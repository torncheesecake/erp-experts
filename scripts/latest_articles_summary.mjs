import { getArticleRecords } from "./lib/load_articles.mjs";

const list = getArticleRecords()
  .filter((a) => a?.publishedAt)
  .filter((a) => !Number.isNaN(new Date(a.publishedAt).getTime()))
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  .slice(0, 3)
  .map((a) => `${a.slug} | ${a.title || "(untitled)"} | ${a.publishedAt}`);

console.log(list.length ? list.join("\n") : "No valid published articles found.");
