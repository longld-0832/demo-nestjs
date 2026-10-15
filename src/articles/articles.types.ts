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
