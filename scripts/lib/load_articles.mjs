import fs from "node:fs";
import path from "node:path";

function sanitiseArticlesModule(source) {
  return source
    .replace(/^import[\s\S]*?;\s*$/gm, "")
    .replace(/\bexport\s+/g, "");
}

export function loadArticlesFromSource(filePath = path.resolve("src/data/articles.js")) {
  const source = fs.readFileSync(filePath, "utf8");
  const transformed = sanitiseArticlesModule(source);

  const sandbox = new Proxy({}, {
    has: () => true,
    get: (_target, key) => {
      if (key === Symbol.unscopables) return undefined;
      if (key in globalThis) return globalThis[key];
      return null;
    },
  });

  const evaluator = new Function(
    "sandbox",
    `with (sandbox) {\n${transformed}\nreturn typeof articles === "object" && articles ? articles : {};\n}`,
  );

  const articles = evaluator(sandbox);
  if (!articles || typeof articles !== "object") {
    throw new Error("Failed to parse articles object from src/data/articles.js");
  }
  return articles;
}

export function getArticleRecords(filePath) {
  const articles = loadArticlesFromSource(filePath);
  return Object.entries(articles).map(([slug, article]) => ({ slug, ...(article || {}) }));
}
