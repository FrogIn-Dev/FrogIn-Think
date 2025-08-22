import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, doc, setDoc, serverTimestamp,
  updateDoc,deleteDoc,query,where, orderBy, DocumentReference
} from '@angular/fire/firestore';
import { Project } from '../data/project.interface';
import {Observable} from 'rxjs';
import { collectionData } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private firestore = inject(Firestore);

  async createProject(params: {
    ownerUid: string;
    title: string;
    collab?: boolean;
  }): Promise<string> {
    const projectsCol = collection(this.firestore, 'projects');
    const ref = doc(projectsCol);              // on crée la ref -> on a l'id
    const now = serverTimestamp();

    const data: Omit<Project, 'createdAt'|'updatedAt'> & { createdAt: any; updatedAt: any } = {
      id: ref.id,
      ownerUid: params.ownerUid,
      title: params.title.trim(),
      collab: [],
      done: false,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(ref, data);
    return ref.id;
  }

  async touch(projectId: string): Promise<void> {
    const ref = doc(this.firestore, 'projects', projectId) as DocumentReference;
    await updateDoc(ref, { updatedAt: serverTimestamp() });
  }



  userProjects$(ownerUid: string): Observable<Project[]> {
    const projectsCol = collection(this.firestore, 'projects');
    const q = query(
      projectsCol,
      where('ownerUid', '==', ownerUid),
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q, { }) as unknown as Observable<Project[]>;
  }


  async renameProject(projectId: string, newTitle: string): Promise<void> {
    const ref = doc(this.firestore, 'projects', projectId) as DocumentReference;
    await updateDoc(ref, {
      title: newTitle.trim(),
      updatedAt: serverTimestamp(),
    });
  }


  async setDone(projectId: string, done = true): Promise<void> {
    const ref = doc(this.firestore, 'projects', projectId) as DocumentReference;
    await updateDoc(ref, {
      done,
      updatedAt: serverTimestamp(),
    });
  }


  async deleteProject(projectId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'projects', projectId));
  }
}

