export interface CreateUserData {
  email: string;
  name: string;
  phoneNumber: string;
  acceptTerms: boolean;
  passwordHash: string;
}

export interface UpdateProfileData {
  name?: string;
  phoneNumber?: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}
