// src/app/services/auth.service.ts
import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  serverTimestamp,
  docData
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { UserInterface } from '../data/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private firebaseAuth = inject(Auth);
  private firestore = inject(Firestore);
  user$ = user(this.firebaseAuth);

  // Optionnel: expose l'user courant si tu veux lier ça à l’UI
  currentUserSig = signal<UserInterface | null>(null);

  // Inscription + création du document Firestore users/{uid}
  // AuthService.register (extrait)
  register(username: string, email: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async ({ user }) => {
        await updateProfile(user, { displayName: username });

        try {
          const userRef = doc(this.firestore, `users/${user.uid}`);
          await setDoc(userRef, {
            uid: user.uid,
            email,
            username,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (err) {
          console.error('⚠️ Firestore write failed:', err);
          // on continue quand même, pas de throw
        }
      });

    return from(promise);
  }



  // Connexion
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(() => {});
    return from(promise);
  }

  // Déconnexion
  logout(): Observable<void> {
    return from(signOut(this.firebaseAuth));
  }

  // (Optionnel) Récupérer les données Firestore du user connecté
  userDoc$(uid: string) {
    const ref = doc(this.firestore, `users/${uid}`);
    return docData(ref, { idField: 'uid' }) as unknown as Observable<UserInterface & { uid: string }>;
  }
}
