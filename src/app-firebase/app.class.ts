import { serviceAccount } from '../adminsdk';
import * as admin from "firebase-admin";
import { insertarClientesEspeciales } from './app-firebase.mongodb';

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export class AppClass {
    comprobarToken(tokenId: string) {
        return app.auth().verifyIdToken(tokenId).then((res) => {
            return { error: false, info: res };
        }).catch((err) => {
            return { error: true, mensaje: "SanPedro: " + err.message };
        });
    }

    actualizarClientesEspeciales(arrayClientes: any[]) {
        return insertarClientesEspeciales(arrayClientes).then((res) => {
            return res.acknowledged;
        }).catch((err) => {
            console.log(err);
            return false;
        });
    }
}
