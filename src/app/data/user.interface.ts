export interface UserInterface {
  email: string;
  username: string;
}

export type UserDoc = UserInterface & { uid: string; createdAt?: any; updatedAt?: any };
