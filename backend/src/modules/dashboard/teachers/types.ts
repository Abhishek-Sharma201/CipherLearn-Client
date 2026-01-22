export interface CreateTeacherInput {
  name: string;
  email: string;
}

export interface UpdateTeacherInput {
  name?: string;
  email?: string;
}

export interface TeacherResponse {
  id: number;
  name: string;
  email: string;
  isPasswordSet: boolean;
  createdAt: Date | null;
}
