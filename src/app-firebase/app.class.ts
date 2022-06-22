import { serviceAccount } from '../adminsdk';
import * as admin from "firebase-admin";
import { insertarClientesEspeciales, getUsuario, getBajasLaborales, insertarBajaLaboral, insertarUsuarioNuevo, nuevaSolicitudVacaciones, getSolicitudesVacaciones, setEstadoVacaciones } from './app-firebase.mongodb';
import { Devolver, SolicitudVacaciones, TrabajadorFichajes, UsuarioInterface } from './app-firebase.interfaces';
import { recHit } from 'src/conexion/mssql';
import * as moment from "moment";
import { TurnosClass } from 'src/turnos/turnos.class';
import { fechaParaSqlServer, fechaParaSqlServerMoment } from 'src/funciones/fechas';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { StreamableFile } from '@nestjs/common';

moment.locale("es", {
    week: {
      dow: 1, // First day of week is Monday
      doy: 4 // First week of year must contain 4 January (7 + 1 - 4)
    }
});
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export class AppClass {
    getSolicitudesVacaciones(token: string, nivelAccesoRequerido: number, tipoUsuarioRequerido: string) {
        return this.getInfoUsuario(token).then((res: any) => {
            if (!res.error) {
                const database: string = res.info.database;
                if (this.aprobarOperacionNivel(nivelAccesoRequerido, res.info.nivelAcceso) && this.aprobarOperacionTipo(tipoUsuarioRequerido, res.info.tipoUsuario)) {
                    return getSolicitudesVacaciones(database).then((res) => {
                        return { error: false, info: res };
                    }).catch((err) => {
                        return { error: true, mensaje: err.message };
                    });
                } else {
                    return { error: true, mensaje: 'San Pedro: No tienes permisos para realizar esta acción' };
                }
            } else {
                return res;
            }
        }).catch((err) => {
            return { error: true, mensaje: err.message };
        });
    }

    solicitarVacaciones(token: string, fechaInicio: number, fechaFinal: number, observaciones: string, displayName: string) {
        return this.getInfoUsuario(token).then((res: any) => {
            if (!res.error) {
                const nuevaSolicitud: SolicitudVacaciones = {
                    uuid: res.info.uuid,
                    fechaInicio: fechaInicio,
                    fechaFinal: fechaFinal,
                    observaciones: observaciones,
                    estado: 'PENDIENTE',
                    displayName
                }

                return nuevaSolicitudVacaciones(nuevaSolicitud, res.info.database).then((res) => {
                    if (res.acknowledged) return { error: false }
                    return { error: true, mensaje: 'San Pedro: Error en nuevaSolicitudVacaciones MongoDB' };
                }).catch((err) => {
                    return { error: true, mensaje: err.message };
                });
            } else {
                return res;
            }
        }).catch((err) => {
            return { error: true, mensaje: err.message };
        });
    }

    setEstadoVacaciones(token: string, idPeticionVacaciones: string, nivelAccesoRequerido: number, tipoUsuarioRequerido: string, nuevoEstado: string) {
        return this.getInfoUsuario(token).then((res: any) => {
            if (!res.error) {
                if (this.aprobarOperacionNivel(nivelAccesoRequerido, res.info.nivelAcceso) && this.aprobarOperacionTipo(tipoUsuarioRequerido, res.info.tipoUsuario)) {
                    if (nuevoEstado == 'APROBADA' || nuevoEstado == 'PENDIENTE' || nuevoEstado == 'RECHAZADA') {
                        return setEstadoVacaciones(nuevoEstado, res.info.database, idPeticionVacaciones).then((resMongo) => {
                            if (resMongo.acknowledged) {
                                return  { error: false };
                            } else {
                                return { error: true, mensaje: 'San Pedro: Error al actualizar el estado en MongoDB' };
                            };
                        }).catch((err) => {
                            return { error: true, mensaje: err.message };
                        });
                    } else {
                        return { error: true, mensaje: 'San Pedro: El nuevo estado no es válido' };
                    }
                } else {
                    return { error: true, mensaje: 'San Pedro: no tienes permisos para realizar esta acción' };
                }
            } else {
                return res;
            }
        }).catch((err) => {
            return { error: true, mensaje: err.message };
        });
    }

    enviarBajaLaboral(token: string, fechaInicio: number, fechaFinal: number, archivo: string, observaciones: string) {
        return this.getInfoUsuario(token).then((res: any) => {
            if (!res.error) {
                const user: UsuarioInterface = res.info;
                return insertarBajaLaboral(user.uuid, user.database, fechaInicio, fechaFinal, observaciones, archivo).then((res) => {
                    if (res.acknowledged) {
                        return { error: false };
                    } else {
                        return { error: true, mensaje: 'San Pedro: No se ha podido insertar la baja laboral' };
                    }
                }).catch((err) => {
                    return { error: true, mensaje: 'San Pedro: ' + err.message };
                });
            } else {
                return res;
            }
        }).catch((err) => {
            return { error: true, mensaje: err.message };
        });
    }

    getBajasLaborales(token: string, nivelAccesoRequerido: number, tipoUsuarioRequerido: string) {
        return this.getInfoUsuario(token).then((res: any) => {
            if (!res.error) {
                const user: UsuarioInterface = res.info;
                if (this.aprobarOperacionNivel(nivelAccesoRequerido, user.nivelAcceso) && this.aprobarOperacionTipo(tipoUsuarioRequerido, user.tipoUsuario)) {
                    return getBajasLaborales(user.database).then((res) => {
                        return { error: false, info: res };
                    }).catch((err) => {
                        return { error: true, mensaje: 'San Pedro: ' + err.message };
                    })
                } else {
                    return { error: true, mensaje: 'San Pedro: no tienes permisos para realizar esta acción' };
                }
            } else {
                return res;
            }
        }).catch((err) => {
            return { error: true, mensaje: 'San Pedro: ' + err.message };
        });
    }

    getArrayPermisosCrear(token: string) {
        return this.getInfoUsuario(token).then((res) => {
            if (!res.error) {
                const nivelAcceso = res.info.nivelAcceso;
                const tipoUsuario = res.info.tipoUsuario;
                const objPermisos = {
                    tipoUsuario: ["RRHH", "TPV", "TIENDA"],
                    niveles: [{
                        nivelNombre: "COORDINADOR/A",
                        valor: 0
                    }, {
                        nivelNombre: "SUPERVISOR/A",
                        valor: 1
                    }, {
                        nivelNombre: "BÁSICO",
                        valor: 2
                    }]
                }

                if (tipoUsuario === "SUPER_ADMIN") {
                    return { error: false, info: objPermisos };
                } else {
                    let nivelesAccesoReales = [];
                    for (let i = 0; i < objPermisos.niveles.length; i++) {
                        if (nivelAcceso <= objPermisos.niveles[i].valor) {
                            nivelesAccesoReales.push(objPermisos.niveles[i]);
                        }
                    }
                    return {
                        error: false,
                        info: {
                            tipoUsuario: [tipoUsuario],
                            niveles: nivelesAccesoReales
                        }
                    }
                }
            }
        });
    }

    comprobarToken(token: string) {
        return app.auth().verifyIdToken(token).then((res) => {
            return { error: false, info: res }; // 'info' tiene el documento completo del usuario que envía el token
        }).catch((err) => {
            return { error: true, mensaje: "SanPedro: " + err.message };
        });
    }

    getUltimasNominas(token: string) {
        return this.getInfoUsuario(token).then((res: any) => {
            if (res.error === false) {
                const database: string = res.info.database;
                const dni: string = res.info.dni;
                const sql = `
                DECLARE @idUsuario int = null
                SELECT @idUsuario = id from dependentesExtes WHERE nom = 'DNI' and valor like '${dni}'
                SELECT id, nombre, extension, descripcion, mime from archivo WHERE propietario = convert(nvarchar, @idUsuario)
                `;

                return recHit(database, sql).then((resNominas) => {
                    if (resNominas.recordset.length > 0) return { error: false, info: resNominas.recordset };
                    return { error: false, info: [] };
                }).catch((err) => {
                    return { error: true, mensaje: err.message };
                });
            } else {
                return res;
            }
        }).catch((err) => {
            return { error: true, mensaje: err.message }
        });
    }

    getArchivoNomina(token: string, idArchivo: string) {

        return this.getInfoUsuario(token).then((res: any) => {
            if (!res.error) {
                const dni: string = res.info.dni;
                const database: string = res.info.database;
                const sql = `
                    DECLARE @idUsuario int = null
                    select @idUsuario = id from dependentesExtes where nom = 'DNI' and valor like '${dni}'
                    select archivo from archivo where propietario = convert(nvarchar, @idUsuario) AND id = '${idArchivo}'
                `;
                return recHit(database, sql).then((res) => {
                    if (res.recordset.length > 0) {
                        return new StreamableFile(res.recordset[0].archivo);
                    } else {
                        return null;
                    }
                })
            } else {
                console.log("STEP 3: ERROR", res.mensaje);
                return null;
            }
        }).catch((err) => {
            console.log(err.message);
            return null;
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

    // comprobarNivelAcceso(nivelAccesoTengo: string, nivelAccesoNecesito: string) {
    //     const arrNivelAccesoTengo = nivelAccesoTengo.split('_');
    //     const arrNivelAccesoNecesito = nivelAccesoNecesito.split('_');

    //     if (arrNivelAccesoTengo.length === 2 && arrNivelAccesoNecesito.length === 2) {
    //         /* Compruebo que sea del área correspondiente o super admin */
    //         if (arrNivelAccesoTengo[1] === arrNivelAccesoNecesito[1] || nivelAccesoNecesito === 'SUPER_ADMIN') {

    //             if (arrNivelAccesoTengo[1] === 'TPV') {
    //                 switch(arrNivelAccesoTengo[0]) {
    //                     case "SUPER_ADMIN":
    //                     case "ADMIN": return { error: false };
    //                     case "TECNICO": if (arrNivelAccesoNecesito[0] === "TECNICO" || arrNivelAccesoNecesito[0] === "OFICINA" ) { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
    //                     case "OFICINA": if (arrNivelAccesoNecesito[0] === "OFICINA" ) { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
    //                 }
    //             } else if (arrNivelAccesoTengo[1] === 'RRHH') {
    //                 switch(arrNivelAccesoTengo[0]) {
    //                     case "SUPER_ADMIN":
    //                     case "ADMIN": return { error: false };
    //                     case "GESTOR": if (arrNivelAccesoNecesito[0] === "GESTOR") { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
    //                 }
    //             } else if (arrNivelAccesoTengo[1] === 'TIENDA') {
    //                 switch(arrNivelAccesoTengo[0]) {
    //                     case "SUPER_ADMIN":
    //                     case "COORDINADORA":return { error: false };
    //                     case "SUPERVISORA": if (arrNivelAccesoNecesito[0] === "SUPERVISORA" || arrNivelAccesoNecesito[0] === "TRABAJADOR" ) { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
    //                     case "TRABAJADOR": if (arrNivelAccesoNecesito[0] === "TRABAJADOR" ) { return { error: false }; } else { return { error: true, mensaje: "SanPedro: Error, no puedes acceder a este nivel de acceso" }; };
    //                 }
    //             } else {
    //                 return { error: true, mensaje: 'SanPedro: Error, nivel de acceso mal asignado' };
    //             }
    //         } else {
    //             return false;
    //         }

    //     } else {
    //         return { error: true, mensaje: 'SanPedro: Permiso creador incorrecto' };
    //     }
    // }

    crearUsuario(token: string, email: string, phoneNumber: string, password: string, displayName: string, nivelAcceso: number, tipoSeleccionado: string, dni: string) {
        /* Comprueba y devuelve la info del usuario */
        return this.comprobarToken(token).then((resUsuario: any) => {
            if (resUsuario.error === false) {
                return getUsuario(resUsuario.info.uid).then((infoUsuario: UsuarioInterface) => {
                    if (infoUsuario) {
                        if (this.aprobarOperacionNivel(nivelAcceso, infoUsuario.nivelAcceso) && this.aprobarOperacionTipo(tipoSeleccionado, infoUsuario.tipoUsuario)) { //this.comprobarNivelAcceso(infoUsuario.nivelAcceso, nivelAcceso)) {
                            return app.auth().createUser({
                                email,
                                emailVerified: false,
                                phoneNumber,
                                password,
                                displayName,
                                disabled: false,
                            }).then((res) => {
                                /* Si entra aquí y luego falla de cualquier manera, hay que eliminar el usuario desde Firebase */
                                /* El nuevo usuario hereda la base de datos del usuario creador */
                                return insertarUsuarioNuevo(res.uid, email, nivelAcceso, tipoSeleccionado, infoUsuario.database, dni).then((resInsertUsuario) => {
                                    if (resInsertUsuario.acknowledged) {
                                        return { error: false };
                                    }
                                    app.auth().deleteUser(res.uid);
                                    return { error: true, mensaje: "San Pedro: Error, no se ha podido crear el usuario " };
                                }).catch((err) => {
                                    app.auth().deleteUser(resUsuario.info.uid);
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
                const sql = `select fi.tmst, fi.usuari as idTrabajador, de.NOM as nombre, fi.lloc as idTienda from cdpDadesFichador fi LEFT JOIN Dependentes de ON fi.usuari = de.CODI WHERE DAY(tmst) = ${ayer.date()} AND MONTH(tmst) = ${ayer.month()+1} AND YEAR(tmst) = ${ayer.year()} 
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
                        const sqlInicios = `select tmst, usuari as idTrabajador, lloc as idTienda from cdpDadesFichador WHERE DAY(tmst) = ${ayer.date()} AND MONTH(tmst) = ${ayer.month()+1} AND YEAR(tmst) = ${ayer.year()} 
                        AND accio = 1 AND lloc = ${idTienda}`;
                        return recHit(database, sqlInicios).then((resInicios) => {
                            if (resInicios.recordset.length > 0) {
                                return { error: false, info: { fichajesEntrada: resInicios.recordset, arrayTrabajadores: arrayTrabajadores } };
                            }
                            return { error: true, mensaje: 'San Pedro: No hay fichajes de tipo entrada' };
                        }).catch((err) => {
                            return { error: true, mensaje: 'San Pedro: ' + err.message };
                        });          
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

    // async guardarHoras(horasExtra: number, horasCoordinacion: number, horaFichaje: number, codigoTienda: number, database: string, idEmpleado: number) {
    async guardarHoras(arrayInfoTrabajadores: TrabajadorFichajes[], idToken: string) {
        const turnosInstance = new TurnosClass();
        const nivelAccesoRequerido = 1;
        const tipoUsuarioRequerido = 'TIENDA';
        let sql = '';

        try {
            const resInfoUsuario = await this.getInfoUsuario(idToken);
            if (resInfoUsuario.error === false) {
                if (this.aprobarOperacionNivel(nivelAccesoRequerido, resInfoUsuario.info.nivelAcceso) && this.aprobarOperacionTipo(tipoUsuarioRequerido, resInfoUsuario.info.tipoUsuario)) {
                    console.log(arrayInfoTrabajadores);
                    for (let i = 0; i < arrayInfoTrabajadores.length; i++) {
                        const horaFichajeDate = moment(arrayInfoTrabajadores[i].tmst); //.startOf("week").isoWeekday(1);;
                        const lunes = moment(arrayInfoTrabajadores[i].tmst).weekday(0); //turnosInstance.getLunesMoment(horaFichajeDate);
                        const infoTabla = turnosInstance.nombreTablaPlanificacionMoment(lunes);
                        const fechaSQL = fechaParaSqlServerMoment(horaFichajeDate);
                        const ayer = moment().subtract(1, 'days');
                        sql += `

                            DELETE FROM ${infoTabla.nombreTabla} WHERE botiga = ${arrayInfoTrabajadores[i].idTienda} and idTurno like '%_Extra' AND DAY(fecha) = ${ayer.date()} AND MONTH(fecha) = ${ayer.month()+1} AND YEAR(fecha) = ${ayer.year()} AND idEmpleado = ${arrayInfoTrabajadores[i].idTrabajador};
                            DELETE FROM ${infoTabla.nombreTabla} WHERE botiga = ${arrayInfoTrabajadores[i].idTienda} and idTurno like '%_Coordinacion' AND DAY(fecha) = ${ayer.date()} AND MONTH(fecha) = ${ayer.month()+1} AND YEAR(fecha) = ${ayer.year()} AND idEmpleado = ${arrayInfoTrabajadores[i].idTrabajador};
                            -- hora fichaje: ${arrayInfoTrabajadores[i].tmst} --- ${horaFichajeDate.date()}/${horaFichajeDate.month()+1}/${horaFichajeDate.year()} ${horaFichajeDate.hours()}:${horaFichajeDate.minutes()}
                            INSERT INTO ${infoTabla.nombreTabla} VALUES (NEWID(), CONVERT(datetime, '${fechaSQL.year}-${fechaSQL.month}-${fechaSQL.day} ${fechaSQL.hours}:${fechaSQL.minutes}:${fechaSQL.seconds}', 120), ${arrayInfoTrabajadores[i].idTienda}, '${(horaFichajeDate.hours() >= 13) ? ('T') : ('M')}', '${arrayInfoTrabajadores[i].horasExtra}_Extra', ${arrayInfoTrabajadores[i].idTrabajador}, 'SAN PEDRO', GETDATE(), 1);
                
                            INSERT INTO ${infoTabla.nombreTabla} VALUES (NEWID(), CONVERT(datetime, '${fechaSQL.year}-${fechaSQL.month}-${fechaSQL.day} ${fechaSQL.hours}:${fechaSQL.minutes}:${fechaSQL.seconds}', 120), ${arrayInfoTrabajadores[i].idTienda}, '${(horaFichajeDate.hours() >= 13) ? ('T') : ('M')}', '${arrayInfoTrabajadores[i].horasCoordinacion}_Coordinacion', ${arrayInfoTrabajadores[i].idTrabajador}, 'SAN PEDRO', GETDATE(), 1);
                        `;
                    }

                    return recHit(resInfoUsuario.info.database, sql).then((res) => {
                        return { error: false };
                    }).catch((err) => {
                        console.log(err);
                        return { error: true, mensaje: 'San Pedro: ' + err.message };
                    });
                } else {
                    return { error: true, mensaje: 'San Pedro: no tienes permisos para realizar esta acción' };
                }
            } else {
                return resInfoUsuario;
            }
        } catch(err) {
            return { error: true, mensaje: err.message };
        }
    }
}
