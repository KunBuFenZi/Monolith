/**
 * Jekyll 博客数据导入转换器
 * 支持 Jekyll 的 Markdown 文件（_posts/ 目录下的 .md 文件）。
 *
 * Jekyll 文件命名约定：YYYY-MM-DD-slug.md
 * Frontmatter 格式（YAML）：
 * ---
 * layout: post
 * title: "Post Title"
 * date: 2023-01-01 12:00:00 +0800
 * tags: [tag1, tag2]
 * categories: [category1]
 * published: true
 * ---
 */
import type { ImportResult, PlatformInfo } from "./types";
import { parseMarkdownFile } from "./frontmatter";
import type { FrontmatterData } from "./frontmatter";

async function convertJekyllFiles(files: File[]): Promise<ImportResult> {
  const allTags = new Set<string>();
  const parsedPosts = await Promise.all(
    files.map(async (file) => {
      if (!file.name.match(/\.(md|markdown|html)$/i)) return null;

      const text = await file.text();
      const { frontmatter, content } = parseMarkdownFile(text, file.name);

      if ((frontmatter as any).layout === "page") return null;
      if (!content.trim() && !frontmatter.title) return null;

      const tags = [...new Set([...frontmatter.tags, ...frontmatter.categories])];
      tags.forEach((tag) => allTags.add(tag));

      let slug = frontmatter.slug;
      if (!slug) {
        const baseName = file.name.replace(/\.(md|markdown|html)$/i, "");
        const match = baseName.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
        slug = match ? match[1] : baseName;
      }

      const frontmatterWithPublished = frontmatter as FrontmatterData & { published?: unknown };
      const explicitPublished = typeof frontmatterWithPublished.published === "boolean"
        ? frontmatterWithPublished.published
        : undefined;

      return {
        slug,
        title: frontmatter.title || slug,
        content,
        excerpt: frontmatter.excerpt,
        published: explicitPublished ?? !frontmatter.draft,
        pinned: false,
        listed: true,
        tags,
      };
    })
  );

  const posts = parsedPosts.filter((post): post is NonNullable<typeof post> => Boolean(post));

  const tagNames = Array.from(allTags);

  return {
    posts,
    tags: tagNames.map((name) => ({ name })),
    preview: {
      platform: "Jekyll",
      postCount: posts.length,
      tagCount: tagNames.length,
      categoryCount: 0,
      commentCount: 0,
      postTitles: posts
        .slice(0, 20)
        .map((p) => ({ title: p.title, slug: p.slug })),
      tagNames,
      warnings:
        files.length !== posts.length
          ? [
              `共上传 ${files.length} 个文件，其中 ${posts.length} 个为有效文章`,
            ]
          : [],
    },
  };
}

export const jekyllPlatform: PlatformInfo = {
  id: "jekyll",
  name: "Jekyll",
  description: "选择 _posts/ 目录下的 .md 文件（支持多选）",
  accept: ".md,.markdown,.html",
  multiple: true,
  color: "red",
  parse: convertJekyllFiles,
};
