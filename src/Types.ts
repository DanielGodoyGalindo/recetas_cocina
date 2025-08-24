// Intefaces that are used in the App to define properties and data types for the objects

// E.g User objects contains id property that has a number data type
export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Recipe {
  id?: number;
  title: string;
  description: string;
  ingredients: Record<string, string>; // property with key and value
  imageUrl: string;
  created_by: string;
}