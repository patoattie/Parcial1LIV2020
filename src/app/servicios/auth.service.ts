import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import {DatePipe} from '@angular/common';
import * as firebase from 'firebase/app';
import { Subject } from 'rxjs';

import { User } from '../clases/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: User; // Save logged in user data
  loginEvent = new Subject<boolean>();
  private error: string;

  constructor(
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public afs: AngularFirestore,   // Inject Firestore service
    public storage: AngularFireStorage,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public router: Router,
    public pipe: DatePipe
    )
    {
      /* Saving user data in localstorage when
      logged in and setting up null when logged out */
      this.afAuth.authState.subscribe(user =>
      {
        if (user)
        {
          this.loginEvent.next(true);
          this.userData = user;
          localStorage.setItem('usuario', JSON.stringify(this.userData));
        }
        else
        {
          this.loginEvent.next(false);
          localStorage.setItem('usuario', null);
        }

        // JSON.parse(localStorage.getItem('usuario'));
      });
    }

  // Sign in with email/password
  public SignIn(email: string, password: string): Promise<any>
  {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) =>
      {
        this.SetUserData(result.user)
        .then(() => {
          console.log('Login OK');
          this.error = '';

          this.ngZone.run(() =>
          {
            this.router.navigate(['Principal']);
          });
        });
      })
      .catch((error) =>
      {
        console.log(error.code);
        this.error = error.code;
      });
  }

  // Sign up with email/password
  public SignUp(email: string, password: string, nombre?: string, archivoFoto?: any)
  {
    return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((result) =>
      {
        if (nombre !== undefined)
        {
          result.user.updateProfile({
            displayName: nombre
          })
          .then(() =>
          {
            this.SetUserData(result.user);
          });
        }

        if (archivoFoto !== undefined)
        {
          const metadata =
          {
            contentType: 'image/png',
            customMetadata:
            {
              usuario: email,
              id: result.user.uid
            }
          };

          const uploadTask = this.storage.upload(
            'avatares/' + this.pipe.transform(new Date(), 'yyyyMMddHHmmssSSS') + archivoFoto.name, archivoFoto, metadata);

          uploadTask.task.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            (snapshot) =>
            {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (E) => {},
            () =>
            {
              uploadTask.task.snapshot.ref.getDownloadURL()
              .then((downloadURL) =>
              {
                console.log('File available at', downloadURL);

                // result.user.photoURL = downloadURL;
                result.user.updateProfile({
                  photoURL: downloadURL
                })
                .then(() =>
                {
                  this.SetUserData(result.user);
                });
              });
            });
        }

        // Call the SendVerificaitonMail() function when new user sign up and returns promise
        // this.SendVerificationMail();
        this.SetUserData(result.user);
        console.log('Login OK');
        this.error = '';

        /*this.ngZone.run(() =>
        {
          this.router.navigate(['Principal']);
        });*/
      })
      .catch((error) =>
      {
        console.log(error.code);
        this.error = error.code;
      });
      /*console.info("nombre", nombre);
      console.info("urlFoto", urlFoto);*/
  }

  // Send email verfificaiton when new user sign up
  /*public SendVerificationMail() {
    return this.afAuth.currentUser.sendEmailVerification()
    .then(() => {
      this.router.navigate(['verify-email-address']);
    })
  }*/

  // Reset Forggot password
  /*public ForgotPassword(passwordResetEmail) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email sent, check your inbox.');
    }).catch((error) => {
      window.alert(error);
    });
  }*/

  // Returns true when user is looged in and email is verified
  public isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('usuario'));
    return user !== null && user !== undefined;
  }

  // Sign in with Google
  /*public GoogleAuth() {
    return this.AuthLogin(new firebase.GoogleAuthProvider());
  }*/

  // Auth logic to run auth providers
  /*public AuthLogin(provider) {
    return this.afAuth.signInWithPopup(provider)
    .then((result) => {
       this.ngZone.run(() => {
          this.router.navigate(['inicio']);
        });
       this.SetUserData(result.user);
    }).catch((error) => {
      window.alert(error);
    });
  }*/

  /* Setting up user data when sign in with username/password,
  sign up with username/password and sign in with social auth
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  public SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`usuarios/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
    return userRef.set(userData, {
      merge: true
    });
  }

  // Sign out
  public SignOut()
  {
    return this.afAuth.signOut()
    .then(() =>
    {
      localStorage.setItem('usuario', null);
      this.router.navigate(['']);
      console.log('Logout OK');
      // this.loginEvent.next(false);
    })
    .catch((error) =>
    {
      console.log(error.code);
    });
  }

  public getUserData(): User
  {
    return JSON.parse(localStorage.getItem('usuario'));
  }

  public getFireUser(): Promise<firebase.User> {
    return this.afAuth.currentUser;
  }

  public getError(): string
  {
    let retorno: string;

    switch (this.error)
    {
      case 'auth/wrong-password':
        retorno = 'E-Mail inexistente o Clave incorrecta';
        break;
      case 'auth/email-already-in-use':
        retorno = 'El usuario ya se encuentra registrado';
        break;
      case 'auth/user-not-found':
        retorno = 'E-Mail inexistente o Clave incorrecta';
        break;
      case '':
        retorno = '';
        break;
      default:
        retorno = this.error;
        break;
    }

    return retorno;
  }

  public getUid(): string
  {
    return this.userData.uid;
  }

  public getEmail(): string
  {
    return this.userData.email;
  }
}
