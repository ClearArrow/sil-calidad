import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import { finalize, take } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private storage: AngularFireStorage) { }

  subirArchivo(carpeta: string, archivo: File) {
    const filePath = `${carpeta}/${(Math.random() + 1).toString(36).substring(2) + '-' + archivo.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, archivo);
    return {
      storageRef,
      uploadTask
    };
  }

  iniciarSesion(email: string, password: string) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((result) => {
      console.log(result);
    }).catch((error) => {
      console.log(error);
    });
  }

  // Para subir las facturas
  /*subirBase64(carpeta: string, base64: string, nombreArchivo: string) {
    base64 = base64.split(',')[1]; // Quitar el data:[...];base64,
    const filePath = `${carpeta}/${nombreArchivo}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, base64);
    return {
      storageRef,
      uploadTask
    };
  }*/
}
