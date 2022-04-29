import { recHit } from "../conexion/mssql";
import { fechaParaSqlServer } from "src/funciones/fechas";
import { logger } from "../logger/logger.class";
import { ParametrosInterface } from "../parametros/parametros.interface";
import { TicketsInterface } from "./tickets.interface";

class TicketsClass {
    /* Comprueba que estén todos los datos necesarios del ticket */
    datosCorrectosTicket(ticket: TicketsInterface) {
        let error = false;
        let mensaje = '';

        if (ticket != undefined && ticket != null) {
            /* Comprobación de la lista */
            if (ticket.lista == undefined || ticket.lista == null) {
                error = true;
                mensaje += 'lista es undefined o null\n';
            } else if (ticket.lista.length == 0) {
                error = true;
                mensaje += 'lista está vacía\n';
            }

            /* Comprobación del idTrabajador */
            if (ticket.idTrabajador == undefined || ticket.idTrabajador == null) {
                error = true;
                mensaje += 'idTrabajador es undefined o null\n';
            } else if (typeof ticket.idTrabajador != "number") {
                error = true;
                mensaje += 'idTrabajador no es tipo number\n';
            }

            /* Comprobación tipoPago */
            if (ticket.tipoPago == undefined || ticket.tipoPago == null) {
                error = true;
                mensaje += 'tipoPago es undefined o null\n';
            } else if (ticket.tipoPago == "TICKET_RESTAURANT") {
                if (ticket.cantidadTkrs == undefined || ticket.cantidadTkrs == null) {
                    error = true;
                    mensaje += 'cantidadTkrs es undefined o null\n';
                } else if (typeof ticket.cantidadTkrs != "number") {
                    error = true;
                    mensaje += 'cantidadTkrs no es tipo number\n';
                }
            }

            /* Comprobación cliente */
            if (ticket.cliente === undefined) {
                error = true;
                mensaje += 'cliente no es valido\n';
            }

            /* Comprobación de id */
            if (ticket._id == undefined || ticket._id == null) {
                error = true;
                mensaje += '_id es undefined o null\n';
            } else if (typeof ticket._id != "number") {
                error = true;
                mensaje += '_id no es number\n';
            }
        } else {
            error = true;
            mensaje += 'El propio ticket está null o undefined\n';
        }

        return { error, mensaje };
    }

    datosCorrectosParametros(parametros: ParametrosInterface) {
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

    async insertarTickets(arrayTickets: TicketsInterface[], parametros: ParametrosInterface, server: any) {
        let error = false;
        let mensaje = '';

        if (this.datosCorrectosParametros(parametros).error == false) {

            /* ----- Recorro array de tickets ----- */
            for (let i = 0; i < 1; i++) {

                if (this.datosCorrectosTicket(arrayTickets[0]).error == false) {

                    arrayTickets[0].enTransito = false;
                    arrayTickets[0].comentario = '';
                    let sql = '';
                    let campoOtros = '';

                    /* Construcción objeto de tiempo */
                    const infoTime = fechaParaSqlServer(new Date(arrayTickets[0].timestamp));

                    /* Construcción nombre de la tabla destino del ticket indidivual */
                    let nombreTabla = `[V_Venut_${infoTime.year}-${infoTime.month}]`;

                    let numArticulos = arrayTickets[0].lista.length;
                    /* Recorro la cesta del ticket */
                    for (let j = 0; j < arrayTickets[0].lista.length; j++) {
                        campoOtros = '';
                        if (typeof arrayTickets[0].lista[j] == 'object') {
                            /* Tipo tarjeta (tanto 3G como ClearONE) */
                            if (arrayTickets[0].tipoPago == 'TARJETA') {
                                campoOtros = '[Visa]';
                            }

                            /* Tipo ticket restaurante */
                            if(arrayTickets[0].tipoPago == 'TKRS') {
                                campoOtros += `[TkRs:${arrayTickets[0].cantidadTkrs}]`;
                            }

                            /* Tipo cliente seleccionado */
                            if(arrayTickets[0].cliente !== undefined && arrayTickets[0].cliente != '' && arrayTickets[0].cliente !== null) {
                                campoOtros += `[Id:${arrayTickets[0].cliente}]`;
                            }

                            /* Tipo consumo personal */
                            let idFinalTrabajadorAux = null;
                            let idFinalTrabajador = null;

                            if(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") {
                                try {
                                    idFinalTrabajadorAux = await recHit(parametros.database, `SELECT valor FROM dependentesExtes WHERE id = ${arrayTickets[0].idTrabajador} AND nom = 'CODICFINAL'`);
                                    idFinalTrabajador = `[Id:${idFinalTrabajadorAux.recordset[0].valor}]`;
                                } catch(err) {
                                    console.log(err);
                                    arrayTickets[0].comentario = 'ERROR EN LA CONSULTA CONSUMO_PERSONAL > idTrabajador a CODIFINAL';
                                }
                            }

                            /* Obtener el ID a insertar, si es tipo promocion combo, habrá dos inserts. El campo es 'plu' */
                            let idArticulo = null;

                            /* Tipo es promoción */
                            if (arrayTickets[0].lista[j].promocion != undefined && arrayTickets[0].lista[j].promocion != null) {
                                if (typeof arrayTickets[0].lista[j]._id == "number") {
                                    if (typeof arrayTickets[0].lista[j].promocion.esPromo == 'boolean') {
                                        if (arrayTickets[0].lista[j].promocion.esPromo === false) {
                                            /* CASO NO ES PROMO (ARTICULO NORMAL) */
                                            idArticulo = arrayTickets[0].lista[j]._id;
                                            sql += ` INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Num_tick, Estat, Plu, Quantitat, Import, Tipus_venta, FormaMarcar, Otros) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${arrayTickets[0].idTrabajador}, ${arrayTickets[0]._id}, '', ${idArticulo}, ${arrayTickets[0].lista[j].unidades}, ${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") ? 0 : arrayTickets[0].lista[j].subtotal}, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? "Desc_100" : "V"}', 0, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") ? (idFinalTrabajador) : campoOtros}');`;
                                        } else if (arrayTickets[0].lista[j].promocion.esPromo == true) {
                                            /* CASO ES PROMO */
                                            if (typeof arrayTickets[0].lista[j].promocion.infoPromo == 'object') {
                                                if (typeof arrayTickets[0].lista[j].promocion.infoPromo.tipoPromo == 'string') {
                                                    if (arrayTickets[0].lista[j].promocion.infoPromo.tipoPromo == 'COMBO') {
                                                        if (arrayTickets[0].lista[j].promocion.infoPromo.idPrincipal != 0 && arrayTickets[0].lista[j].promocion.infoPromo.idSecundario != 0 && typeof arrayTickets[0].lista[j].promocion.infoPromo.idPrincipal == 'number' && typeof arrayTickets[0].lista[j].promocion.infoPromo.idSecundario == 'number') {
                                                            let importePrincipal = arrayTickets[0].lista[j].promocion.infoPromo.cantidadPrincipal*arrayTickets[0].lista[j].promocion.infoPromo.unidadesOferta*arrayTickets[0].lista[j].promocion.infoPromo.precioRealPrincipal;
                                                            let importeSecundario = arrayTickets[0].lista[j].promocion.infoPromo.cantidadSecundario*arrayTickets[0].lista[j].promocion.infoPromo.unidadesOferta*arrayTickets[0].lista[j].promocion.infoPromo.precioRealSecundario;
                                                            if (importePrincipal == null || importeSecundario == null) {
                                                                importePrincipal = 0;
                                                                importeSecundario = 0;
                                                                console.log("Es lo que busco, soy la tienda: ", parametros.codigoTienda, parametros.nombreTienda, arrayTickets[0]._id);
                                                            }
                                                            sql += ` INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Num_tick, Estat, Plu, Quantitat, Import, Tipus_venta, FormaMarcar, Otros) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${arrayTickets[0].idTrabajador}, ${arrayTickets[0]._id}, '', ${arrayTickets[0].lista[j].promocion.infoPromo.idPrincipal}, ${arrayTickets[0].lista[j].promocion.infoPromo.cantidadPrincipal*arrayTickets[0].lista[j].promocion.infoPromo.unidadesOferta}, ${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") ? 0: importePrincipal}, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? "Desc_100" : "V"}', 0, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? idFinalTrabajador : campoOtros}');`; 
                                                            sql += ` INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Num_tick, Estat, Plu, Quantitat, Import, Tipus_venta, FormaMarcar, Otros) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${arrayTickets[0].idTrabajador}, ${arrayTickets[0]._id}, '', ${arrayTickets[0].lista[j].promocion.infoPromo.idSecundario}, ${arrayTickets[0].lista[j].promocion.infoPromo.cantidadSecundario*arrayTickets[0].lista[j].promocion.infoPromo.unidadesOferta}, ${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") ? 0: importeSecundario}, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? "Desc_100" : "V"}', 0, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? idFinalTrabajador : campoOtros}');`; 
                                                            numArticulos += 1;
                                                        } else {
                                                            arrayTickets[0].comentario = 'ERROR, idPrincipal o idSecundario NO ES NUMBER o bien ALGUNO DE LOS DOS IDS ES 0';
                                                        }
                                                    } else if (arrayTickets[0].lista[j].promocion.infoPromo.tipoPromo == 'INDIVIDUAL') {
                                                        if (arrayTickets[0].lista[j].promocion.infoPromo.precioRealPrincipal == null) {
                                                            arrayTickets[0].lista[j].promocion.infoPromo.precioRealPrincipal = 0;
                                                            console.log("Es lo que busco, soy la tienda 2: ", parametros.codigoTienda, parametros.nombreTienda, arrayTickets[0]._id, arrayTickets[0].lista[j].promocion._id);
                                                        }

                                                        if (typeof arrayTickets[0].lista[j].promocion.infoPromo.idPrincipal == 'number' && arrayTickets[0].lista[j].promocion.infoPromo.idPrincipal != 0) {
                                                            sql += ` INSERT  INTO ${nombreTabla} (Botiga, Data, Dependenta, Num_tick, Estat, Plu, Quantitat, Import, Tipus_venta, FormaMarcar, Otros) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${arrayTickets[0].idTrabajador}, ${arrayTickets[0]._id}, '', ${arrayTickets[0].lista[j].promocion.infoPromo.idPrincipal}, ${arrayTickets[0].lista[j].promocion.infoPromo.cantidadPrincipal*arrayTickets[0].lista[j].promocion.infoPromo.unidadesOferta}, ${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") ? 0: arrayTickets[0].lista[j].promocion.infoPromo.precioRealPrincipal}, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? "Desc_100" : "V"}', 0, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? idFinalTrabajador : campoOtros}');`;
                                                        } else {
                                                            arrayTickets[0].comentario = 'ERROR, idPrincipal NO ES NUMBER o ES 0';
                                                        }
                                                    } else {
                                                        arrayTickets[0].comentario = "ERROR, infoPromo.tipoPromo NO ES 'COMBO' NI 'INDIVIDUAL'";
                                                    }
                                                } else {
                                                    arrayTickets[0].comentario = 'ERROR, infoPromo.tipoPromo NO ES STRING';
                                                }
                                            } else {
                                                arrayTickets[0].comentario = 'ERROR, promocion.infoPromos NO ES OBJECT';
                                            }
                                        }
                                    } else {
                                        arrayTickets[0].comentario = 'ERROR, EL OBJETO promocion.esPromo NO ES UN BOOLEAN';
                                    }
                                } else {
                                    arrayTickets[0].comentario = 'ERROR, EL _ID DE LA LISTA NO ES UN NUMBER';
                                }
                            } else {
                                arrayTickets[0].comentario = 'ERROR, EL OBJETO PROMOCIÓN ES NULL O UNDEFINED';
                            }
                        } else {
                            arrayTickets[0].comentario = 'ERROR, LA POSICIÓN DE LA LISTA NO ES UN OBJETO';
                        }
                    } // Final for j

                    /* Si hay algún comentario es que hay error */
                    if (arrayTickets[0].comentario != '') {
                        error = true;
                        break; // Rompe bucle i
                    }
                    // server.emit('resSincroTickets', { error: false, arrayTickets });
                    // console.log("NO HAY NINGÚN ERROR");
                    sql = `
                        IF ((SELECT COUNT(*) FROM ${nombreTabla} WHERE botiga =  ${parametros.codigoTienda} AND Num_tick = ${arrayTickets[0]._id}) = ${numArticulos})
                            BEGIN
                                DELETE FROM ${nombreTabla} WHERE botiga = ${parametros.codigoTienda} AND Num_tick = ${arrayTickets[0]._id};
                                ${sql}
                                SELECT 'YA_EXISTE' as resultado;
                            END
                        ELSE
                            BEGIN
                                DELETE FROM ${nombreTabla} WHERE botiga = ${parametros.codigoTienda} AND Num_tick = ${arrayTickets[0]._id};
                                ${sql}
                                SELECT 'OK' as resultado;
                            END
                    `;
                    try {
                        logger.Info(`tienda: ${parametros.codigoTienda} idTicket: ${arrayTickets[0]._id} sql: ${sql}`);
                        arrayTickets[0].intentos += 1;
                        const res = await recHit(parametros.database, sql);
                        if (res.recordset.length > 0) {
                            if (res.recordset[0].resultado == 'YA_EXISTE') {
                                arrayTickets[0]["intentaRepetir"] = 'YES';
                                arrayTickets[0].enviado = true;
                                arrayTickets[0].comentario = 'Se ha vuelto a enviar. OK';
                                
                            } else if (res.recordset[0].resultado == 'OK') {
                                arrayTickets[0].enviado = true;                     
                                /* Esta consulta es obligatoria. Actualiza la tabla tocGameInfo */
                                let sql2 = `IF EXISTS (SELECT * FROM tocGameInfo WHERE licencia = ${parametros.licencia}) 
                                                BEGIN
                                                    IF ((SELECT ultimoIdTicket FROM tocGameInfo WHERE licencia = ${parametros.licencia}) < ${arrayTickets[0]._id})
                                                        BEGIN
                                                            UPDATE tocGameInfo SET ultimoIdTicket = ${arrayTickets[0]._id}, ultimaConexion = ${Date.now()}, nombreTienda = '${parametros.nombreTienda}' WHERE licencia = ${parametros.licencia}
                                                        END
                                                    END
                                            ELSE
                                                BEGIN
                                                    INSERT INTO tocGameInfo (licencia, bbdd, ultimoIdTicket, codigoInternoTienda, nombreTienda, token, version, ultimaConexion) 
                                                        VALUES (${parametros.licencia}, '${parametros.database}', ${arrayTickets[0]._id}, ${parametros.codigoTienda}, '${parametros.nombreTienda}', NEWID(), '2.0.0', ${Date.now()})
                                                END`;
                                
                                recHit('Hit', sql2).then((res2) => {
                                    arrayTickets[0].enviado = true;
                                }).catch((err) => {
                                    console.log(err);
                                    arrayTickets[0].comentario = 'Genera error SQL';
                                    error = true;
                                    mensaje = 'SanPedro: Error, sql2 falla. Mirar en log.';
                                });
                                if (error) {
                                    break;
                                }
                            } else {
                                arrayTickets[0].comentario = 'Respuesta SQL incontrolada';
                                server.emit('resSincroTickets', { error: true, mensaje: 'SanPedro: Error, caso incontrolado. Respuesta desconocida.', arrayTickets, idTicketProblematico: arrayTickets[0]._id });
                                break;
                            }
                        } else {
                            arrayTickets[0].comentario = 'Caso no controlado de repuesta SQL';
                            server.emit('resSincroTickets', { error: true, mensaje: 'SanPedro: ERROR en recHit 1. recordset.length = 0', idTicketProblematico: arrayTickets[0]._id });
                            break;
                        }
                    } catch(err) {
                        logger.Error(`tienda: ${parametros.codigoTienda} idTicket: ${arrayTickets[0]._id} sql: ${sql}`);
                        arrayTickets[0].comentario = 'Error en try catch';
                        server.emit('resSincroTickets', { error: true, mensaje: 'SanPedro: SQL ERROR 1. Mirar log', arrayTickets, idTicketProblematico: arrayTickets[0]._id });
                        break;
                    }

                } else { // Error general de datos del ticket
                    error = true;
                    mensaje = 'SanPedro: Error general de datos del ticket';
                    console.log(this.datosCorrectosTicket(arrayTickets[0]).mensaje, "ID: ", arrayTickets[0]._id);
                    if (arrayTickets[0] != undefined) {
                        arrayTickets[0]["comentario"] = mensaje;
                    }
                    break;
                }
            } // Final for i
            if (error) { // Solo para las primeras comprobaciones
                server.emit('resSincroTickets', { error: true, arrayTickets, mensaje });
            } else {
                server.emit('resSincroTickets', { error: false, arrayTickets });
            }
        } else {
            // DEVOLVER TAL CUAL EL ARRAY DE TICKETS PORQUE NO SE HA MODIFICADO NADA DEBIDO A UN ERROR
            server.emit('resSincroTickets', { error: true, arrayTickets, mensaje: 'SanPedro: Error, parámetros incorrectos' });
        }
    }

    // async insertarTickets(arrayTickets: TicketsInterface[], parametros: ParametrosInterface, server: any) {
    //     try {
    //         for(let i = 0; i < arrayTickets.length; i++) {
    //             let sql = '';
    //             let campoOtros = '';
    //             /* Comprobación de ticket individual tiene algo válido */
    //             if (arrayTickets[0] == undefined || arrayTickets[0] == null) {
    //                 throw Error("Error, arrayTickets[0] está undefined o null");
    //             }

    //             /* Construcción objeto de tiempo */
    //             const infoTime = fechaParaSqlServer(new Date(arrayTickets[0].timestamp));

    //             /* Construcción nombre de la tabla destino del ticket indidivual */
    //             let nombreTabla = `[V_Venut_${infoTime.year}-${infoTime.month}]`;

    //             /* Recorro la cesta del ticket */
    //             for (let j = 0; j < arrayTickets[0].lista.length; j++) {  
    //                 // Esto es chapuza, arreglarlo!!!
    //                 if (arrayTickets[0].idTrabajador == undefined) {
    //                     arrayTickets[0].idTrabajador = 975;
    //                 }

    //                 if (arrayTickets[0].tipoPago == 'TARJETA')
    //                 {
    //                     campoOtros = '[Visa]';
    //                 } else {
    //                     campoOtros = '';
    //                 }

    //                 if(arrayTickets[0].tipoPago == 'TICKET_RESTAURANT') {
    //                     campoOtros = `[TkRs:${arrayTickets[0].cantidadTkrs}]`;
    //                 }

    //                 if(arrayTickets[0].cliente !== null && arrayTickets[0].cliente !== undefined) {
    //                     campoOtros += `[Id:${arrayTickets[0].cliente}]`;
    //                 }
                    
    //                 if(typeof arrayTickets[0].lista[j]._id === "object") {
    //                     var idLista = arrayTickets[0].lista[j]._id;
    //                 }

    //                 if(typeof arrayTickets[0].lista[j]._id === "undefined") {
    //                     var idLista = arrayTickets[0].lista[j]._id;
    //                 }
                    
    //                 if(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") {                
    //                     var idFinalTrabajadorAux = await recHit(parametros.database, `SELECT valor FROM dependentesExtes WHERE id = ${arrayTickets[0].idTrabajador} AND nom = 'CODICFINAL'`);//await recHit(parametros.database, `SELECT valor FROM dependentesExtes WHERE id = ${arrayTickets[0].idTrabajador} AND nom = 'CODICFINAL'`).recordset[0].valor;
    //                     var idFinalTrabajador = `[Id:${idFinalTrabajadorAux.recordset[0].valor}]`;
    //                 }                
                    
    //                 if(arrayTickets[0].lista[j].promocion.esPromo) {
    //                     if(arrayTickets[0].lista[j].promocion.infoPromo.idSecundario != 0) { //OFERTA COMBO
    //                         sql += ` INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Num_tick, Estat, Plu, Quantitat, Import, Tipus_venta, FormaMarcar, Otros) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${arrayTickets[0].idTrabajador}, ${arrayTickets[0]._id}, '', ${arrayTickets[0].lista[j].promocion.infoPromo.idPrincipal}, ${arrayTickets[0].lista[j].promocion.infoPromo.cantidadPrincipal*arrayTickets[0].lista[j].promocion.infoPromo.unidadesOferta}, ${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") ? 0: arrayTickets[0].lista[j].promocion.infoPromo.precioRealPrincipal.toFixed(2)}, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? "Desc_100" : "V"}', 0, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? idFinalTrabajador : campoOtros}');`; 
    //                         sql += ` INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Num_tick, Estat, Plu, Quantitat, Import, Tipus_venta, FormaMarcar, Otros) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${arrayTickets[0].idTrabajador}, ${arrayTickets[0]._id}, '', ${arrayTickets[0].lista[j].promocion.infoPromo.idSecundario}, ${arrayTickets[0].lista[j].promocion.infoPromo.cantidadSecundario*arrayTickets[0].lista[j].promocion.infoPromo.unidadesOferta}, ${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") ? 0: arrayTickets[0].lista[j].promocion.infoPromo.precioRealSecundario.toFixed(2)}, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? "Desc_100" : "V"}', 0, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? idFinalTrabajador : campoOtros}');`; 
    //                     } else { //OFERTA INDIVIDUAL
    //                         sql += ` INSERT  INTO ${nombreTabla} (Botiga, Data, Dependenta, Num_tick, Estat, Plu, Quantitat, Import, Tipus_venta, FormaMarcar, Otros) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${arrayTickets[0].idTrabajador}, ${arrayTickets[0]._id}, '', ${arrayTickets[0].lista[j].promocion.infoPromo.idPrincipal}, ${arrayTickets[0].lista[j].promocion.infoPromo.cantidadPrincipal*arrayTickets[0].lista[j].promocion.infoPromo.unidadesOferta}, ${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") ? 0: arrayTickets[0].lista[j].promocion.infoPromo.precioRealPrincipal.toFixed(2)}, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? "Desc_100" : "V"}', 0, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? idFinalTrabajador : campoOtros}');`; 
    //                     }
    //                 } else {
    //                     sql += ` INSERT INTO ${nombreTabla} (Botiga, Data, Dependenta, Num_tick, Estat, Plu, Quantitat, Import, Tipus_venta, FormaMarcar, Otros) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${arrayTickets[0].idTrabajador}, ${arrayTickets[0]._id}, '', ${idLista}, ${arrayTickets[0].lista[j].unidades}, ${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL") ? 0 : arrayTickets[0].lista[j].subtotal}, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? "Desc_100" : "V"}', 0, '${(arrayTickets[0].tipoPago === "CONSUMO_PERSONAL")? idFinalTrabajador : campoOtros}');`;
    //                 }
    //             }

    //             sql = `
    //                 IF NOT EXISTS (SELECT * FROM ${nombreTabla} WHERE botiga = ${parametros.codigoTienda} AND Num_tick = ${arrayTickets[0]._id})
    //                     BEGIN
    //                         ${sql}
    //                         SELECT 'OK' as resultado;
    //                     END
    //                 ELSE
    //                     BEGIN
    //                         SELECT 'YA_EXISTE' as resultado;
    //                     END
    //             `

    //             recHit(parametros.database, sql).then((res) => {
    //                 if (res.recordset[0].resultado == 'YA_EXISTE') {
    //                     socket.emit('confirmarEnvioTicket', {
    //                         idTicket: arrayTickets[0]._id
    //                     });
    //                 } else {
    //                     if(res.rowsAffected.length > 0 && res.recordset[0].resultado == 'OK') {
    //                         socket.emit('confirmarEnvioTicket', {
    //                             idTicket: arrayTickets[0]._id
    //                         });
    //                         let sql2 = `IF EXISTS (SELECT * FROM tocGameInfo WHERE licencia = ${parametros.licencia}) 
    //                                         BEGIN
    //                                             IF ((SELECT ultimoIdTicket FROM tocGameInfo WHERE licencia = ${parametros.licencia}) < ${arrayTickets[0]._id})
    //                                                 BEGIN
    //                                                     UPDATE tocGameInfo SET ultimoIdTicket = ${arrayTickets[0]._id}, ultimaConexion = ${Date.now()}, nombreTienda = '${parametros.nombreTienda}' WHERE licencia = ${parametros.licencia}
    //                                                 END
    //                                             END
    //                                     ELSE
    //                                         BEGIN
    //                                             INSERT INTO tocGameInfo (licencia, bbdd, ultimoIdTicket, codigoInternoTienda, nombreTienda, token, version, ultimaConexion) 
    //                                                 VALUES (${parametros.licencia}, '${parametros.database}', ${arrayTickets[0]._id}, ${parametros.codigoTienda}, '${parametros.nombreTienda}', NEWID(), '2.0.0', ${Date.now()})
    //                                         END`;
                            
    //                         recHit('Hit', sql2);
    //                     } else {
    //                         console.log("Caso sin importancia");
    //                     }
    //                 }                        
    //             }).catch((err) => {
    //                 console.log(err);
    //             });
    //         }
    //     } catch(err) {
    //         console.log("Error al pasar");
    //     }
    // }
}
const ticketsInstance = new TicketsClass();
export { ticketsInstance };