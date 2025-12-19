
export type Language = 'zh-CN' | 'zh-TW';

export interface BookInfo {
  isbn: string;
  author: string;
  title: string;
  publisher: string;
  location: string;
  year: string;
  formatted: string;
}

export interface SearchHistory {
  id: string;
  timestamp: number;
  data: BookInfo;
  language: Language;
}
