export interface User {
  id?: number;
  email: string;
  password: string;
}

export interface UserWithoutPassword {
  id: number;
  email: string;
}
