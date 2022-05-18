import { serviceAccount } from '../adminsdk';
import * as admin from "firebase-admin";
import { insertarClientesEspeciales, getUsuario, insertarUsuarioNuevo } from './app-firebase.mongodb';
import { Devolver, UsuarioInterface } from './app-firebase.interfaces';
import { recHit } from 'src/conexion/mssql';
import * as moment from "moment";
import { TurnosClass } from 'src/turnos/turnos.class';
/*
    ADMIN_TPV, TECNICO_TPV, OFICINA_TPV
    ADMIN_RRHH, GESTOR_RRHH
    COORDINADORA_TIENDA, SUPERVISORA_TIENDA, TRABAJADOR_TIENDA
*/

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export class AppClass {
    getArrayPermisosCrear(token: string) {
        return this.getInfoUsuario(token).then((res) => {
            if (!res.error) {
                const arrNivelAccso = res.info.nivelAcceso.split('_');
                if (arrNivelAccso[1] === "TPV") {
                    switch(arrNivelAccso[0]) {
                        case "ADMIN": return ["ADMIN_TPV", "TECNICO_TPV", "OFICINA_TPV"];
                        case "TECNICO": return ["TECNICO_TPV", "OFICINA_TPV"];
                        default: return []
                    }
                }

                if (arrNivelAccso[1] === "TIENDA") {
                    switch(arrNivelAccso[0]) {
                        case "COORDINADORA": return ["COORDINADORA_TIENDA", "SUPERVISORA_TIENDA", "TRABAJADOR_TIENDA"];
                        case "SUPERVISORA": return ["TECNICO_TPV", "OFICINA_TPV"];
                        case "TRABAJADOR": return ["TECNICO_TPV", "OFICINA_TPV"];
                        default: return []
                    }
                }

                if (arrNivelAccso[1] === "RRHH") {

                }                

            } else {

            }
        });
    }

    comprobarToken(token: string): Promise<Devolver> {
        return app.auth().verifyIdToken(token).then((res) => {
            return { error: false, info: res }; // 'info' tiene el documento completo del usuario que envía el token
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

    /* Según el nivel de acceso, aprobar o no la operación 
       Nivel -1 máximo nivel de acceso (el número más bajo) */
    aprobarOperacionNivel(requerido: number, actual: number) {
        if (actual <= requerido) return true;
        return false;
    }

    /* Según el tipo de acceso, aprobar o no la operación
       TPV, RRHH, TIENDA */
    aprobarOperacionTipo(requerido: string, actual: string) {
        if (requerido === actual) return true;
        if (actual === 'SUPER_ADMIN') return true;

        return false;
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

    comprobarNivelAcceso(nivelAccesoTengo: string, nivelAccesoNecesito: string) {
        const arrNivelAccesoTengo = nivelAccesoTengo.split('_');
        const arrNivelAccesoNecesito = nivelAccesoNecesito.split('_');

        if (arrNivelAccesoTengo.length === 2 && arrNivelAccesoNecesito.length === 2) {
            /* Compruebo que sea del área correspondiente o super admin */
            if (arrNivelAccesoTengo[1] === arrNivelAccesoNecesito[1] || nivelAccesoNecesito === 'SUPER_ADMIN') {

                if (arrNivelAccesoTengo[1] === 'TPV') {
                    switch(arrNivelAccesoTengo[0]) {
                        case "SUPER_ADMIN":
                        case "ADMIN": return { error: false };
                        case "TECNICO": if (arrNivelAccesoNecesito[0] === "TECNICO" || arrNivelAccesoNecesito[0] === "OFICINA" ) { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
                        case "OFICINA": if (arrNivelAccesoNecesito[0] === "OFICINA" ) { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
                    }
                } else if (arrNivelAccesoTengo[1] === 'RRHH') {
                    switch(arrNivelAccesoTengo[0]) {
                        case "SUPER_ADMIN":
                        case "ADMIN": return { error: false };
                        case "GESTOR": if (arrNivelAccesoNecesito[0] === "GESTOR") { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
                    }
                } else if (arrNivelAccesoTengo[1] === 'TIENDA') {
                    switch(arrNivelAccesoTengo[0]) {
                        case "SUPER_ADMIN":
                        case "COORDINADORA":return { error: false };
                        case "SUPERVISORA": if (arrNivelAccesoNecesito[0] === "SUPERVISORA" || arrNivelAccesoNecesito[0] === "TRABAJADOR" ) { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
                        case "TRABAJADOR": if (arrNivelAccesoNecesito[0] === "TRABAJADOR" ) { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
                    }
                } else {
                    return { error: true, mensaje: 'SanPedro: Error, nivel de acceso mal asignado' };
                }
            } else {
                return false;
            }

        } else {
            return { error: true, mensaje: 'SanPedro: Permiso creador incorrecto' };
        }
    }

    crearUsuario(email: string, phoneNumber: string, password: string, displayName: string, nivelAcceso: string, token: string) {
        const arrAcceso = nivelAcceso.split('_');
        if (arrAcceso.length === 2) {
            return this.comprobarToken(token).then((resUsuario: any) => {
                if (resUsuario.error === false) {
                    return getUsuario(resUsuario.info.uid).then((infoUsuario) => {
                        if (infoUsuario) {
                            if (this.comprobarNivelAcceso(infoUsuario.nivelAcceso, nivelAcceso)) {
                                return app.auth().createUser({
                                    email,
                                    emailVerified: false,
                                    phoneNumber,
                                    password,
                                    displayName,
                                    disabled: false,
                                }).then((res) => {
                                    return insertarUsuarioNuevo(res.uid, email, nivelAcceso).then((resInsertUsuario) => {
                                        if (resInsertUsuario.acknowledged) {
                                            return { error: false };
                                        }
                                        return { error: true, mensaje: "San Pedro: Error, no se ha podido crear el usuario " };
                                    }).catch((err) => {
                                        return { error: true, mensaje: 'San Pedro: '  + err.message};
                                    });
                                }).catch((err) => {
                                    return { error: true, mensaje: 'San Pedro: '  + err.message};
                                });
                            } else {
                                return { error: true, mensaje: "SanPedro: Permiso creador incorrecto" };
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
    }

    /* Devuelve en info toda la info del usuario */
    getInfoUsuario(token: string): Promise<Devolver> {
        return this.comprobarToken(token).then((resUser: any) => {
            if (resUser.error === false) {
                return getUsuario(resUser.info.uid).then((res: UsuarioInterface) => {
                    if (res != null) {
                        return { error: false, info: res };
                    } else {
                        return { error: true, mensaje: 'San Pedro: El usuario no existe' };
                    }
                }).catch((err) => {
                    return { error: true, mensaje: err.message };
                })
            } else {
                return resUser;
            }
        })

    }

    getTiendas(token: string) {
        const nivelAccesoRequerido = 1;
        const tipoUsuarioRequerido = 'TIENDA';

        return this.getInfoUsuario(token).then((resGetInfo: any) => {
            if (resGetInfo.error === false) {
                const usuario: UsuarioInterface = resGetInfo.info;
                if (this.aprobarOperacionTipo(tipoUsuarioRequerido, usuario.tipoUsuario) && this.aprobarOperacionNivel(nivelAccesoRequerido, usuario.nivelAcceso)) {
                    return recHit(usuario.database, 'select cli.Codi as id, cli.nom as nombre, cli.adresa as direccion from paramsHw ph left join clients cli ON cli.Codi = ph.Valor1 where cli.codi IS NOT NULL order by cli.nom').then((res) => {
                        return { error: false, info: res.recordset };
                    }).catch((err) => {
                        return { error: true, mensaje: 'San Pedro: ' + err.message };
                    });
                }
                return { error: true, mensaje: 'San Pedro: no tienes los permisos necesarios para consultar todas las tiendas' };

            }
            return resGetInfo;
        }).catch((err) => {
            return { error: true, mensaje: 'San Pedro: ' +  err.message };
        })

    }

    /* Devuelve la lista de los trabadores que ficharon ayer (y salieron) + sus horas extras/coordinacion */
    getTrabajaronAyer(idToken: string, idTienda: number) {
        return this.getInfoUsuario(idToken).then((resInfoUsuario: any) => {
            if (resInfoUsuario.error === false) {
                const database = resInfoUsuario.info.database;
                const ayer = moment().subtract(1, 'days');
                const sql = `select fi.tmst, fi.usuari as idTrabajador, de.NOM as nombre, fi.lloc as idTienda from cdpDadesFichador fi LEFT JOIN Dependentes de ON fi.usuari = de.CODI WHERE DAY(tmst) = ${ayer.date()} AND MONTH(tmst) = ${ayer.month()} AND YEAR(tmst) = ${ayer.year()} 
                AND fi.accio = 2 AND fi.lloc = ${idTienda}`;
                return recHit(database, sql).then(async (resTrabajaronAyer) => {
                    if (resTrabajaronAyer.recordset.length > 0) {
                        const turnosInstance = new TurnosClass();
                        const arrayTrabajadores = resTrabajaronAyer.recordset;
                        for (let i = 0; i < resTrabajaronAyer.recordset.length; i++) {
                            let horasTrabajadas = await turnosInstance.getHorasExtraCoordinacion(resTrabajaronAyer.recordset[i].idTrabajador, ayer.valueOf(), idTienda, database);
                            if (horasTrabajadas.error === false) {
                                arrayTrabajadores[i]["horasExtra"] = horasTrabajadas.info.horasExtra;
                                arrayTrabajadores[i]["horasCoordinacion"] = horasTrabajadas.info.horasCoordinacion;
                            } else {
                                throw Error('Fallo en obtener horas del trabajador 456');
                            }
                        }
                        return { error: false, info: arrayTrabajadores };                
                    }
                    return { error: false, info: [] };
                }).catch((err) => {
                    console.log(err);
                    return { error: true, mensaje: 'San Pedro: ' + err.message + ' sql:' + sql };
                });
            } else {
                return resInfoUsuario;
            }
        }).catch((err) => {
            return { error: true, mensaje: 'San Pedro: 1 ' + err.message };
        });
    }
}
