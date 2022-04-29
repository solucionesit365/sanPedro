import { recHit } from "src/conexion/mssql";
import { fechaParaSqlServer } from "../funciones/fechas";
import { ParametrosInterface } from "../parametros/parametros.interface";
import { CajaForSincroInterface, CajaInterface } from "./cajas.interface";

function datosCorrectosParametros(parametros: ParametrosInterface) {
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

function comprobarDatosCaja(caja: CajaForSincroInterface) {

    if (caja._id == undefined || caja._id == null || typeof caja._id != "number") {
        return { error: true, mensaje: '_id no es correcto' };
    }

    if (caja.inicioTime == undefined || caja.inicioTime == null || typeof caja.inicioTime != "number") {
        return { error: true, mensaje: 'inicioTime no es correcto' };
    }

    if (caja.finalTime == undefined || caja.finalTime == null || typeof caja.finalTime != "number") {
        return { error: true, mensaje: 'finalTime no es correcto' };
    }

    if (caja.idDependienta == undefined || caja.idDependienta == null || typeof caja.idDependienta != "number") {
        return { error: true, mensaje: 'idDependienta no es correcto' };
    }
    
    if (caja.detalleApertura == undefined || caja.detalleApertura == null) {
        return { error: true, mensaje: 'detalleApertura no es correcto' };
    }

    if (caja.detalleCierre == undefined || caja.detalleCierre == null) {
        return { error: true, mensaje: 'detalleCierre no es correcto' };
    }
    
    if (caja.descuadre == undefined || caja.descuadre == null || typeof caja.descuadre != "number") {
        return { error: true, mensaje: 'descuadre no es correcto' };
    }

    if (caja.nClientes == undefined || caja.nClientes == null || typeof caja.nClientes != "number") {
        return { error: true, mensaje: 'nClientes no es correcto' };
    }

    if (caja.primerTicket == undefined || caja.primerTicket == null || typeof caja.primerTicket != "number") {
        return { error: true, mensaje: `primerTicket no es correcto. Caja: ${caja._id } primerTicket: ${caja.primerTicket}`};
    }

    if (caja.ultimoTicket == undefined || caja.ultimoTicket == null || typeof caja.ultimoTicket != "number") {
        return { error: true, mensaje: 'ultimoTicket no es correcto' };
    }

    if (caja.calaixFetZ == undefined || caja.calaixFetZ == null || typeof caja.calaixFetZ != "number") {
        return { error: true, mensaje: 'calaixFetZ no es correcto' };
    }

    return { error: false };
}

class CajasClass {
    /* Guarda una caja en el SQL WEB */
    async insertarCajas(parametros: ParametrosInterface, infoCaja: CajaForSincroInterface, server: any) {     
        if (datosCorrectosParametros(parametros).error == false) {
            if (comprobarDatosCaja(infoCaja).error == false) {
                const fechaInicio = fechaParaSqlServer(new Date(infoCaja.inicioTime));
                const fechaFinal = fechaParaSqlServer(new Date(infoCaja.finalTime));
                let sqlZGJ = '';
                let sqlW = '';
                let sqlWi = '';
                let sqlO = '';
                let sqlAna = '';
                let sqlAna2 = '';
                let sqlPrevisiones = '';
                let nombreTabla = '[V_Moviments_' + fechaFinal.year + '-' + fechaFinal.month + ']';
                sqlZGJ = `
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'DATAFONO_3G', ${infoCaja.totalDatafono3G}, '');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'Z', ${infoCaja.calaixFetZ}, '');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'G', ${infoCaja.nClientes}, '');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'J', ${infoCaja.descuadre}, '');
                `;
                sqlW = `
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[0].valor}, 'En : 0.01');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[1].valor}, 'En : 0.02');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[2].valor}, 'En : 0.05');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[3].valor}, 'En : 0.1');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[4].valor}, 'En : 0.2');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[5].valor}, 'En : 0.5');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[6].valor}, 'En : 1');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[7].valor}, 'En : 2');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[8].valor}, 'En : 5');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[9].valor}, 'En : 10');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[10].valor}, 'En : 20');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[11].valor}, 'En : 50');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[12].valor}, 'En : 100');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[13].valor}, 'En : 200');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaFinal.year}-${fechaFinal.month}-${fechaFinal.day} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}', 120), ${infoCaja.idDependienta}, 'W', ${infoCaja.detalleCierre[14].valor}, 'En : 500');
            `;
                sqlWi = `
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[0].valor}, 'En : 0.01');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[1].valor}, 'En : 0.02');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[2].valor}, 'En : 0.05');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[3].valor}, 'En : 0.1');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[4].valor}, 'En : 0.2');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[5].valor}, 'En : 0.5');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[6].valor}, 'En : 1');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[7].valor}, 'En : 2');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[8].valor}, 'En : 5');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[9].valor}, 'En : 10');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[10].valor}, 'En : 20');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[11].valor}, 'En : 50');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[12].valor}, 'En : 100');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[13].valor}, 'En : 200');
                INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Tipus_moviment, Import, Motiu) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120), ${infoCaja.idDependienta}, 'Wi', ${infoCaja.detalleApertura[14].valor}, 'En : 500');
                `;
                sqlAna = `INSERT INTO feinesafer VALUES (newid(), 'VigilarAlertes', 0, 'Caixa', '[${fechaInicio.day}-${fechaInicio.month}-${fechaInicio.year} de ${fechaInicio.hours}:${fechaInicio.minutes} a ${fechaFinal.hours}:${fechaFinal.minutes}]', '[${parametros.codigoTienda}]', '${infoCaja.descuadre}', '${infoCaja.calaixFetZ}', getdate());`;
                sqlAna2 = `insert into feinesafer values (newid(), 'SincroMURANOCaixaOnLine', 0, '[${parametros.codigoTienda}]', '[${fechaInicio.day}-${fechaInicio.month}-${fechaInicio.year} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}]', '[${fechaFinal.day}-${fechaFinal.month}-${fechaFinal.year} ${fechaFinal.hours}:${fechaFinal.minutes}:${fechaFinal.seconds}]', '[${infoCaja.primerTicket},${infoCaja.ultimoTicket}]', '[${infoCaja.calaixFetZ}]', getdate());`;
                sqlPrevisiones =  `INSERT INTO feinesafer values (newid(), 'PrevisionsVendesDiari', 0, '${fechaFinal.day}/${fechaFinal.month}/${fechaFinal.year}', '${parametros.codigoTienda}', '${(Number(fechaFinal.hours) < 16) ? 'MATI': 'TARDA'}', '' ,'', GETDATE());`;
                let sqlCompleta = sqlZGJ + sqlW + sqlWi + sqlAna + sqlAna2 + sqlPrevisiones;

                /* Primero comprobamos que no se repita la caja */
                /* IMPORTANTE: NO MODIFICAR LOS MENSAJES DEL SELECT!!! */
                const sqlRepeticion = `
                DECLARE @ultimaCaja bigint;
                IF EXISTS (select * from tocGameInfo where licencia = ${parametros.licencia} AND codigoInternoTienda = ${parametros.codigoTienda})
                    BEGIN
                        SELECT @ultimaCaja = ultimaCaja FROM tocGameInfo WHERE licencia = ${parametros.licencia} AND codigoInternoTienda = ${parametros.codigoTienda}
                        IF (${infoCaja._id} > @ultimaCaja)
                            BEGIN
                                IF NOT EXISTS (select * from [${parametros.database}].[dbo].${nombreTabla} where botiga = ${parametros.codigoTienda} AND Data = CONVERT(datetime, '${fechaInicio.year}-${fechaInicio.month}-${fechaInicio.day} ${fechaInicio.hours}:${fechaInicio.minutes}:${fechaInicio.seconds}', 120))
                                    BEGIN
                                        UPDATE tocGameInfo SET ultimaCaja = ${infoCaja._id} WHERE licencia = ${parametros.licencia} AND codigoInternoTienda = ${parametros.codigoTienda} 
                                        SELECT 'OK' as resultado
                                    END
                                ELSE
                                    BEGIN
                                        --Prohibido cambiar 'Ya existe o es antigua'
                                        SELECT 'NOP' as resultado, 'Ya existe o es antigua' as mensaje
                                    END
                            END
                        ELSE
                            BEGIN
                                --Prohibido cambiar 'Ya existe o es antigua'
                                SELECT 'NOP' as resultado, 'Ya existe o es antigua' as mensaje
                            END
                    END
                ELSE
                    BEGIN
                        SELECT 'NOP' as resultado, 'No existe la fila para esta tienda en tocGameInfo' as mensaje
                    END
                `;
                let resSqlRepeticion = null;
                let errorSalir = false;
                try {
                    resSqlRepeticion = await recHit('hit', sqlRepeticion);
                } catch(err) {
                    console.log(err);
                    errorSalir = true;
                    server.emit("resCajas", { error: true, mensaje: 'SanPedro: Error al ejecutar sqlRepeticion' });
                }

                if (errorSalir == false) {
                    if (resSqlRepeticion.recordset.length == 1) {
                        if (resSqlRepeticion.recordset[0].resultado == 'OK') {
                            recHit(parametros.database, sqlCompleta).then((aux) => {
                                if (aux.rowsAffected.length > 0) {
                                    infoCaja.enviado = true;
                                    server.emit("resCajas", { error: false, infoCaja, repetir: false });
                                } else {
                                    server.emit("resCajas", { error: true, mensaje: 'SanPedro: Error, inserción incorrecta sqlCompleta' });
                                }
                            }).catch((err) => {
                                console.log(err);
                                server.emit("resCajas", { error: true, mensaje: 'SanPedro: Error al ejecutar sqlCompleta' });
                            });
                        } else if (resSqlRepeticion.recordset[0].resultado == 'NOP' && resSqlRepeticion.recordset[0].mensaje == 'Ya existe o es antigua') {
                            infoCaja.enviado = true;
                            infoCaja.comentario = 'Se ha intentado enviar otra vez';
                            server.emit("resCajas", { error: false, infoCaja, repetir: true });
                        }
                    } else {
                        server.emit("resCajas", { error: true, mensaje: 'SanPedro: Error respuesta incorrecta sqlRepeticion' });
                    }
                } //else no hacer nada
            } else {
                const errMsg = comprobarDatosCaja(infoCaja).mensaje;
                infoCaja["comentario"] = errMsg;
                server.emit("resCajas", { error: true, mensaje: errMsg, infoCaja });
            }
        } else {
            const errMsg = datosCorrectosParametros(parametros).mensaje;
            infoCaja["comentario"] = errMsg;
            console.log(errMsg);
            server.emit("resCajas", { error: true, mensaje: errMsg, infoCaja });
        }
    }
}
const  cajasInstance = new CajasClass();
export { cajasInstance };