import { recHit } from "../conexion/mssql";
import { TurnosClass } from "../turnos/turnos.class";
import { ParametrosInterface } from "../parametros/parametros.interface";
import { FichajeInterface } from "./fichajes.interface";

function comprobarParametros(parametros: ParametrosInterface) {
    let error = false;
    let mensaje = '';

    if (parametros != undefined && parametros != null) {
        /* Comprobación database */
        if (parametros.database == null || parametros.database == undefined) {
            error = true;
            mensaje += 'database es null o undefined\n';
        } else if (typeof parametros.database != "string") {
            error = true;
            mensaje += 'database no es tipo string\n';
        } else if (parametros.database.length == 0) {
            error = true;
            mensaje += 'database está vacío\n';
        }

        /* Comprobación codigoTienda */
        if (parametros.codigoTienda == null || parametros.codigoTienda == undefined) {
            error = true;
            mensaje += 'codigoTienda es null o undefined\n';
        }

        /* Comprobación licencia */
        if (parametros.licencia == null || parametros.licencia == undefined) {
            error = true;
            mensaje += 'licencia es null o undefined\n';
        }
        /* Comprobación nombreTienda */
        if (parametros.nombreTienda == null || parametros.nombreTienda == undefined) {
            error = true;
            mensaje += 'nombreTienda es null o undefined\n';
        }
    } else {
        error = true;
        mensaje += 'parametros en si no está definido o nulo\n';
    }

    return { error, mensaje };
}

function comprobarFichaje(fichaje: FichajeInterface) {
    let error = false;
    let mensaje = '';

    if (fichaje._id == null || fichaje._id == undefined) {
        error = true;
        mensaje += '_id incorrecto\n';
    }

    if (fichaje.tipo == null || fichaje.tipo == undefined) {
        error = true;
        mensaje += 'tipo incorrecto\n';
    }

    if (fichaje.infoFichaje == null  || fichaje.infoFichaje == undefined) {
        error = true;
        mensaje += 'infoFichaje incorrecto\n';
    } else { 
        if (fichaje.infoFichaje.idTrabajador == null || fichaje.infoFichaje.idTrabajador == undefined) {
            error = true;
            mensaje += 'infoFichaje.idTrabajador incorrecto \n';
        }

        if (fichaje.infoFichaje.fecha == null  || fichaje.infoFichaje.fecha == undefined) {
            error = true;
            mensaje += 'fichaje.infoFichaje.fecha incorrecto\n';
        } else {
            if (fichaje.infoFichaje.fecha.year == null || fichaje.infoFichaje.fecha.year == undefined) {
                error = true;
                mensaje += 'fichaje.infoFichaje.fecha.year incorrecto\n';
            }
            if (fichaje.infoFichaje.fecha.month == null || fichaje.infoFichaje.fecha.month == undefined) {
                error = true;
                mensaje += 'fichaje.infoFichaje.fecha.month incorrecto\n';
            }
            if (fichaje.infoFichaje.fecha.day == null || fichaje.infoFichaje.fecha.day == undefined) {
                error = true;
                mensaje += 'fichaje.infoFichaje.fecha.day incorrecto\n';
            }
            if (fichaje.infoFichaje.fecha.hours == null || fichaje.infoFichaje.fecha.hours == undefined) {
                error = true;
                mensaje += 'fichaje.infoFichaje.fecha.hours incorrecto\n';
            }
            if (fichaje.infoFichaje.fecha.minutes == null || fichaje.infoFichaje.fecha.minutes == undefined) {
                error = true;
                mensaje += 'fichaje.infoFichaje.fecha.minutes incorrecto\n';
            }
            if (fichaje.infoFichaje.fecha.seconds == null || fichaje.infoFichaje.fecha.seconds == undefined) {
                error = true;
                mensaje += 'fichaje.infoFichaje.fecha.seconds incorrecto\n';
            }
        }
    }
    return { error, mensaje };
}

class FichajesClass {
    insertarFichaje(parametros: ParametrosInterface, fichaje: FichajeInterface, server: any) {
        const resParametros = comprobarParametros(parametros);
        const resFichaje = comprobarFichaje(fichaje);

        if (!resParametros.error) {
            if (!resFichaje.error) {
                let sql = '';
                const fechaEntrada = new Date(fichaje.infoFichaje.fecha.year, fichaje.infoFichaje.fecha.month, fichaje.infoFichaje.fecha.day, fichaje.infoFichaje.fecha.hours, fichaje.infoFichaje.fecha.minutes, fichaje.infoFichaje.fecha.seconds);
                let year = `${fechaEntrada.getFullYear()}`;
                let month = `${fechaEntrada.getMonth() + 1}`;
                let day = `${fechaEntrada.getDate()}`;
                let hours = `${fechaEntrada.getHours()}`;
                let minutes = `${fechaEntrada.getMinutes()}`;
                let seconds = `${fechaEntrada.getSeconds()}`;
                if (month.length === 1) {
                    month = '0' + month;
                }
                if (day.length === 1) {
                    day = '0' + day;
                }
                if (hours.length === 1) {
                    hours = '0' + hours;
                }
                if (minutes.length === 1) {
                    minutes = '0' + minutes;
                }
                if (seconds.length === 1) {
                    seconds = '0' + seconds;
                }

                if (fichaje.tipo === 'ENTRADA') {
                    sql += `INSERT INTO cdpDadesFichador (id, tmst, accio, usuari, idr, lloc, comentari) VALUES (0, CONVERT(datetime, '${year}-${month}-${day} ${hours}:${minutes}:${seconds}', 120), 1, ${fichaje.infoFichaje.idTrabajador}, NEWID(), ${parametros.codigoTienda}, '${parametros.nombreTienda}')`;
                } else if (fichaje.tipo === 'SALIDA') {
                    sql += `INSERT INTO cdpDadesFichador (id, tmst, accio, usuari, idr, lloc, comentari) VALUES (0, CONVERT(datetime, '${year}-${month}-${day} ${hours}:${minutes}:${seconds}', 120), 2, ${fichaje.infoFichaje.idTrabajador}, NEWID(), ${parametros.codigoTienda}, '${parametros.nombreTienda}')`;
                } else {
                    fichaje["comentario"] = 'Error sanPedro en fichajes, caso desconocido 1';
                    server.emit('resFichajes', { error: true, fichaje, mensaje: fichaje["comentario"] });
                }


                let sqlTurno = '';
                /* El idPlan debe estar definido */
                if (fichaje.idPlan != undefined && fichaje.idPlan != null && fichaje.tipo == 'ENTRADA' && parametros.database.toUpperCase() == 'FAC_TENA') {
                    const turnosInstance = new TurnosClass();
                    const lunes = turnosInstance.getLunes(fechaEntrada);
                    const nombreTablaPlanificacion = turnosInstance.nombreTablaPlanificacion(lunes);
                    sqlTurno = `UPDATE ${nombreTablaPlanificacion.nombreTabla} SET idEmpleado = ${fichaje.infoFichaje.idTrabajador}, fecha = CONVERT(datetime, '${year}-${month}-${day} ${hours}:${minutes}:${seconds}', 120) WHERE idPlan = '${fichaje.idPlan}';`;
                }

                const sqlCompleto = `
                    IF EXISTS (SELECT * FROM cdpDadesFichador WHERE tmst = CONVERT(datetime, '${year}-${month}-${day} ${hours}:${minutes}:${seconds}', 120) AND usuari = ${fichaje.infoFichaje.idTrabajador} AND lloc = ${parametros.codigoTienda})
                        BEGIN
                            ${sqlTurno}
                            SELECT 'YA_EXISTE' as resultado
                        END
                    ELSE
                        BEGIN
                            ${sqlTurno}
                            ${sql} 
                            SELECT 'OK' as resultado
                        END
                    --database: ${parametros.database} tienda: ${parametros.codigoTienda}
                `;

                /* Controlador de intentos nulo o indefinido */
                if (fichaje.intentos == null || fichaje.intentos == undefined) {
                    fichaje.intentos = 1;
                } else {
                    fichaje.intentos += 1;
                }
                /* Controlador para reiniciar comentario */
                fichaje["comentario"] = '';

                recHit(parametros.database, sqlCompleto).then((res) => {
                    if (res.recordset[0].resultado == 'OK') {
                        if (res.rowsAffected.length > 0) {
                            fichaje.enviado = true;
                            server.emit('resFichajes', { error: false, fichaje });
                        } else {
                            fichaje["comentario"] = 'Error sanPedro fichajes: Caso desconocido sqlCompleta2';
                            server.emit('resFichajes', { error: true, fichaje, mensaje: fichaje["comentario"] });
                        }
                    } else if (res.recordset[0].resultado == 'YA_EXISTE') {
                        fichaje.enviado = true;
                        server.emit('resFichajes', { error: false, fichaje });
                    } else {
                        fichaje["comentario"] = 'Error sanPedro fichajes: Caso desconocido sqlCompleta';
                        server.emit('resFichajes', { error: true, fichaje, mensaje: fichaje["comentario"] });
                    }
                }).catch((err) => {
                    console.log(err);
                    fichaje["comentario"] = 'Error sanPedro fichajes: Error en catch sqlCompleta';
                    server.emit('resFichajes', { error: true, fichaje, mensaje: fichaje["comentario"] });
                });

            } else {
                fichaje["comentario"] = resFichaje.mensaje;
                server.emit('resFichajes', { error: true, fichaje, mensaje: resFichaje.mensaje });
            }
        } else {
            fichaje["comentario"] = resFichaje.mensaje;
            server.emit('resFichajes', { error: true, fichaje, mensaje: resParametros.mensaje });
        }
    }
}
const fichajeInstance = new FichajesClass();
export { fichajeInstance };
