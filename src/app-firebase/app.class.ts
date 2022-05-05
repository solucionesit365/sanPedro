import { serviceAccount } from '../adminsdk';
import * as admin from "firebase-admin";
import { insertarClientesEspeciales, getUsuario } from './app-firebase.mongodb';

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

    actualizarClientesEspeciales(databaseString: string, arrayClientes: any[]) {
        return insertarClientesEspeciales(databaseString, arrayClientes).then((res) => {
            return res.acknowledged;
        }).catch((err) => {
            console.log(err);
            return false;
        });
    }

    permisosUsuario(uuid: string, nivelAccesoSolicitado: string[]): any {
        return getUsuario(uuid).then((resUsuario) => {
            if (resUsuario) {
                for (let i = 0; i < nivelAccesoSolicitado.length; i++) {
                    if (resUsuario.nivelAcceso === nivelAccesoSolicitado[i] ) {
                        return { error: false, infoUsuario: resUsuario };
                    }
                }
                return { error: true, mensaje: 'SanPedro: No tienes permisos para este nivel de acceso' };
            }
            return { error: true, mensaje: 'SanPedro: El usuario no existe en la base de datos' };
        }).catch((err) => {
            return { error: true, mensaje: 'SanPedro: ' + err.message};
        });
    }
}
