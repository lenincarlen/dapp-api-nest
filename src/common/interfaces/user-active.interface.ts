export interface UserActiveInterface {
  sub: string; // ID del usuario desde el JWT
  id?: string; // Para compatibilidad
  email: string;
  name: string;
  roles: string[];
  role: string;
}