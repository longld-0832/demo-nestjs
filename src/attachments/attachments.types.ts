export type ImageType = 'image/jpeg' | 'image/png' | 'image/webp';

export interface StoredFile {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}
