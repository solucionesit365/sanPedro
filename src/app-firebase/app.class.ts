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

/*
    ADMIN_TPV, TECNICO_TPV, OFICINA_TPV
    ADMIN_RRHH, EDITOR_RRHH
    COORDINADORA_TIENDA, SUPERVISORA_TIENDA, TRABAJADOR_TIENDA
*/

    

    crearUsuario(email: string, phoneNumber: string, password: string, displayName: string, nivelAcceso: string, token: string) {
        const arrAcceso = nivelAcceso.split('_');
        if (arrAcceso.length === 2) {
            return this.comprobarToken(token).then((resUsuario: any) => {
                if (resUsuario.error === false) {
                    return getUsuario(resUsuario.info.uid).then((infoUsuario) => {
                        if (infoUsuario) {
                            const arrAccesoCreador = infoUsuario.nivelAcceso.split('_');
                            if (arrAccesoCreador.length === 2) {
                                if (arrAcceso[1] === 'TPV') {
                                    switch(arrAcceso[0]) {
                                        
                                    }
                                } else if (arrAcceso[1] === 'RRHH') {
                    
                                } else if (arrAcceso[1] === 'TIENDA') {
                    
                                } else {
                                    return { error: true, mensaje: 'SanPedro: Error, nivel de acceso mal asignado' };
                                }
                            } else {
                                return { error: true, mensaje: 'SanPedro: Permiso creador incorrecto' };
                            }
                        } else {
                            return { error: true, mensaje: 'SanPedro: Error, el usuario creador no existe en la BBDD' };
                        }
                    }).catch((err) => {
                        return { error: true, mensaje: 'SanPedro: ' + err.message };
                    });
                } else {
                    return resUsuario.mensaje;
                }

            }).catch((err) => {
                return { error: true, mensaje: 'SanPedro: ' + err.message };
            });
        } else {
            return { error: true, mensaje: 'SanPedro: Permiso nuevo incorrecto' };
        }

        return app.auth().createUser({
            email,
            emailVerified: false,
            phoneNumber,
            password,
            displayName,
            disabled: false,
        }).then((res) => {
            
        }).catch((err) => {
            return { error: true, mensaje: 'San Pedro: '  + err.message};
        });
    }
}
