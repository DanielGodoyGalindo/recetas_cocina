export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Recipe {
  id?: number;
  title: string;
  description: string;
  ingredients: Record<string, string>;
  imageUrl: string;
  created_by: string;
}