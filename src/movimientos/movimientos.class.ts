import { ParametrosInterface } from  '../parametros/parametros.interface';
import { MovimientosInterface } from './movimientos.interface';
import { fechaParaSqlServer } from "../funciones/fechas";
import { recHit } from '../conexion/mssql';

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

function comprobarMovimiento(movimiento: MovimientosInterface) {
    let error = false;
    let mensaje = '';

    if (movimiento._id == null || movimiento._id == undefined) {
        error = true;
        mensaje += '_id incorrecto\n';
    }

    if (movimiento.tipo == null || movimiento.tipo == undefined) {
        error = true;
        mensaje += 'tipo incorrecto\n';
    }

    if (movimiento.valor == null || movimiento.valor == undefined) {
        error = true;
        mensaje += 'valor incorrecto\n';
    }

    if (movimiento.concepto == null || movimiento.concepto == undefined) {
        error = true;
        mensaje += 'concepto incorrecto\n';
    }

    if (movimiento.idTrabajador == null || movimiento.idTrabajador == undefined) {
        error = true;
        mensaje += 'idTrabajador incorrecto\n';
    }

    if (movimiento.tipoExtra == null || movimiento.tipoExtra == undefined) {
        error = true;
        mensaje += 'tipoExtra incorrecto\n';
    }

    if (movimiento.idTicket == null || movimiento.idTicket == undefined) {
        error = true;
        mensaje += 'idTicket incorrecto\n';
    }

    return { error, mensaje };
}

/* Elimina los caracteres especiales que rompen la consulta SQL */
function limpiarStringCaracteresEspeciales(cadena: string) {
    let cadenaLimpia = cadena.replace("'", " ");
    cadenaLimpia = cadenaLimpia.replace('"', " ");
    return cadenaLimpia;
}

class Movimientos {
    insertarMovimiento(parametros: ParametrosInterface, movimiento: MovimientosInterface, server: any) {
        const resParametros = comprobarParametros(parametros);
        const resMovimiento = comprobarMovimiento(movimiento);

        if (resParametros.error == false) {
            if (resMovimiento.error == false) {
                let sql = '';
                let sqlBarras = '';
                let error = false;
                const fecha = fechaParaSqlServer(new Date(movimiento._id));
                const nombreTabla = `[V_Moviments_${fecha.year}-${fecha.month}]`;
                let concepto = movimiento.concepto;

                if(movimiento.idTicket != -100) {
                    switch(movimiento.tipoExtra) {
                        case 'TARJETA': concepto = `Pagat Targeta: ${movimiento.idTicket}`; break;
                        case 'TKRS_CON_EXCESO': 
                            concepto = `Excs.TkRs:  [${movimiento.idTicket}]`;
                            break;
                        case 'TKRS_SIN_EXCESO': 
                            concepto = `Pagat TkRs:  [${movimiento.idTicket}]`;
                            break;
                        case 'CONSUMO_PERSONAL': break;
                        case 'DEUDA': break; //el concepto de deuda se controla desde el tocGame
                        default: error = true; break;
                    }                   
                }

                if (!error) {
                    if(movimiento.codigoBarras != "" && movimiento.codigoBarras != undefined) {
                        sqlBarras = `INSERT INTO CodisBarresReferencies (Num, Tipus, Estat, Data, TmSt, Param1, Param2, Param3, Param4) VALUES (${movimiento.codigoBarras}, 'Moviments', 'Creat', CONVERT(datetime, '${fecha.year}-${fecha.month}-${fecha.day} ${fecha.hours}:${fecha.minutes}:${fecha.seconds}', 120), CONVERT(datetime, '${fecha.year}-${fecha.month}-${fecha.day} ${fecha.hours}:${fecha.minutes}:${fecha.seconds}', 120), ${parametros.licencia}, ${movimiento.idTrabajador}, ${-movimiento.valor}, '${fecha.day}/${fecha.month}/${fecha.year} ${fecha.hours}:${fecha.minutes}:${fecha.seconds}');`;
                    }
                    sql = `
                    IF EXISTS (select  * from ${nombreTabla} WHERE botiga = ${parametros.codigoTienda} AND Import = ${(movimiento.tipo == "SALIDA") ? -movimiento.valor : movimiento.valor} AND Tipus_moviment = '${(movimiento.tipo == "SALIDA") ? 'O':'A'}' AND Data = CONVERT(datetime, '${fecha.year}-${fecha.month}-${fecha.day} ${fecha.hours}:${fecha.minutes}:${fecha.seconds}', 120))
                        BEGIN
                            SELECT 'YA_EXISTE' as resultado
                        END
                    ELSE
                        BEGIN
                            DELETE FROM ${nombreTabla} WHERE Botiga = ${parametros.codigoTienda} AND Data = CONVERT(datetime, '${fecha.year}-${fecha.month}-${fecha.day} ${fecha.hours}:${fecha.minutes}:${fecha.seconds}', 120) AND  Dependenta = ${movimiento.idTrabajador} AND Import = ${(movimiento.tipo == "SALIDA") ? -movimiento.valor : movimiento.valor};
                            INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fecha.year}-${fecha.month}-${fecha.day} ${fecha.hours}:${fecha.minutes}:${fecha.seconds}', 120), ${movimiento.idTrabajador}, '${(movimiento.tipo == "SALIDA") ? 'O':'A'}', ${(movimiento.tipo == "SALIDA") ? -movimiento.valor : movimiento.valor}, '${limpiarStringCaracteresEspeciales(concepto)}'); 
                            ${sqlBarras} 
                            SELECT 'OK' as resultado
                        END
                    `;
                    
                    /* Controlador de intentos nulo o indefinido */
                    if (movimiento.intentos == null || movimiento.intentos == undefined) {
                        movimiento.intentos = 1;
                    } else {
                        movimiento.intentos += 1;
                    }
                    /* Controlador para reiniciar comentario */
                    movimiento["comentario"] = '';
                    
                    recHit(parametros.database, sql).then((res) => {
                        if (res.recordset[0].resultado == 'OK' && res.rowsAffected.length > 0) {
                            movimiento.enviado = true;
                            server.emit('resMovimientos', { error: false, movimiento });
                        } else if (res.recordset[0].resultado == 'YA_EXISTE') {
                            movimiento.enviado = true;
                            server.emit('resMovimientos', { error: false, movimiento });
                        } else {
                            movimiento["comentario"] = 'Error desconocido';
                            server.emit('resMovimientos', { error: true,  movimiento, mensaje : 'Error desconocido'});
                        }
                    }).catch((err) => {
                        console.log(err);
                        movimiento["comentario"] = 'Error en la consulta SQL 1: ' + sql;
                        server.emit('resMovimientos', { error: true,  movimiento, mensaje : 'Error en SQL 2: ' + sql});
                    });
                } else {
                    movimiento["comentario"] = 'Error en tipoExtra';
                    server.emit('resMovimientos', { error: true, movimiento, mensaje: 'Error en tipoExtra: ' + movimiento.tipoExtra });
                }

            } else {
                movimiento["comentario"] = resMovimiento.mensaje;
                server.emit('resMovimientos', { error: true, movimiento, mensaje: resMovimiento.mensaje });
            }
        } else {
            server.emit('resMovimientos', { error: true, movimiento, mensaje: resParametros.mensaje });
        }
    }
}

const movimientosInstance = new Movimientos();
export { movimientosInstance };