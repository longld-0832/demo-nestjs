/** Max length of the title-based part of a slug (before the random suffix). */
export const SLUG_MAX_BASE_LENGTH = 100;

/** Columns returned in lists; content is left out to keep responses small. */
export const ARTICLE_LIST_COLUMNS = [
  'article.id',
  'article.slug',
  'article.title',
  'article.description',
  'article.published',
  'article.createdAt',
  'article.updatedAt',
  'author.id',
  'author.name',
];
