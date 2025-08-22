import { Timestamp } from '@angular/fire/firestore';

export interface Project {
  id: string;
  ownerUid: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  collab: string[];
  done: boolean;
}
