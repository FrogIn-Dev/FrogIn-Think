// src/app/services/auth.service.ts
import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  reload,
  updatePassword, deleteUser
} from '@angular/fire/auth';
import {Firestore, doc, setDoc, serverTimestamp, docData, deleteDoc} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { UserInterface } from '../data/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private firebaseAuth = inject(Auth);
  private firestore = inject(Firestore);
  user$ = user(this.firebaseAuth);

  // Optionnel: expose l'user courant si tu veux lier ça à l’UI
  currentUserSig = signal<UserInterface | null>(null);

  private lastSyncedEmail: string | null = null;

  constructor() {
    this.user$.subscribe(async (u) => {
      if (!u) return;
      const nextEmail = u.email ?? null;
      if (nextEmail === this.lastSyncedEmail) return;

      const userRef = doc(this.firestore, `users/${u.uid}`);
      await setDoc(userRef, { email: nextEmail, updatedAt: serverTimestamp() }, { merge: true });
      this.lastSyncedEmail = nextEmail;
    });
  }



  // Inscription + création du document Firestore users/{uid}
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

  userDoc$(uid: string) {
    const ref = doc(this.firestore, `users/${uid}`);
    return docData(ref, { idField: 'uid' }) as unknown as Observable<UserInterface & { uid: string }>;
  }

  async refreshCurrentUser() {
    const u = this.firebaseAuth.currentUser;
    if (!u) return;
    await reload(u);           // force la récupération des champs (email, displayName…)
    await u.getIdToken(true);  // force un nouveau jeton avec les bonnes claims/email
  }

  private async reauthWithPassword(currentPassword: string) {
    const u = this.firebaseAuth.currentUser;
    if (!u || !u.email) throw new Error('Not authenticated');
    const cred = EmailAuthProvider.credential(u.email, currentPassword);
    await reauthenticateWithCredential(u, cred);
  }

  // Met à jour le username dans Auth.displayName et Firestore
  updateUsername(uid: string, newUsername: string): Observable<void> {
    const p = (async () => {
      const u = this.firebaseAuth.currentUser;
      if (!u) throw new Error('Not authenticated');

      // 1) Auth (displayName)
      await updateProfile(u, { displayName: newUsername });

      // 2) Firestore
      const userRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userRef, {
        username: newUsername,
        updatedAt: serverTimestamp()
      }, { merge: true });
    })();

    return from(p);
  }

  // Change l’email: réauth + Auth + Firestore
  changeEmail(newEmail: string, currentPassword: string): Observable<void> {
    const p = (async () => {
      const u = this.firebaseAuth.currentUser;
      if (!u) throw new Error('Not authenticated');

      await this.reauthWithPassword(currentPassword);

      const actionCodeSettings = {
        url: `${window.location.origin}/account?changedEmail=1`,
        handleCodeInApp: true,
        // dynamicLinkDomain: 'tonapp.page.link', // si tu utilises Firebase Dynamic Links (mobile)
      };

      await verifyBeforeUpdateEmail(u, newEmail, actionCodeSettings);
      // Firestore sera sync par ton watcher user$ quand Auth aura basculé l’email.
    })();

    return from(p);
  }

  //Change le mot de passe: réauth + Auth
  changePassword(newPassword: string, currentPassword: string): Observable<void> {
    const p = (async () => {
      const u = this.firebaseAuth.currentUser;
      if (!u) throw new Error('Not authenticated');

      await this.reauthWithPassword(currentPassword);
      await updatePassword(u, newPassword);
    })();

    return from(p);
  }

  deleteAccount(currentPassword: string): Observable<void> {
    const p = (async () => {
      const u = this.firebaseAuth.currentUser;
      if (!u) throw new Error('Not authenticated');

      // 1) Réauth (sécurité + évite auth/requires-recent-login)
      await this.reauthWithPassword(currentPassword);

      // 2) (optionnel) supprimer d’autres données de l’utilisateur ici
      // ex: await this.deleteUserData(u.uid);

      // 3) Supprimer le document Firestore pendant que l’utilisateur est encore authentifié
      await deleteDoc(doc(this.firestore, `users/${u.uid}`));

      // 4) Supprimer le compte Auth
      await deleteUser(u);

      // Après ça, user$ émettra null automatiquement
    })();

    return from(p);
  }


}
