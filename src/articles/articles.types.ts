export interface CreateArticleData {
  title: string;
  description: string;
  content: string;
  published?: boolean;
}

export type UpdateArticleData = Partial<CreateArticleData>;

export interface DeleteArticleResponse {
  message: string;
}

export interface ListArticlesFilter {
  page: number;
  limit: number;
  author?: string;
  search?: string;
}
