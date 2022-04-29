import { recHit } from "src/conexion/mssql";
import { fechaParaSqlServer } from "src/funciones/fechas";
import { ParametrosInterface } from "src/parametros/parametros.interface";
import { DevolucionesInterface } from "./devoluciones.interface";

class DevolucionesClass {
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
    async insertarDevoluciones(parametros: ParametrosInterface, devolucion: DevolucionesInterface, server: any) {
        let error = false;
        let mensaje = '';
        const resParametros = this.datosCorrectosParametros(parametros);
        if (resParametros.error == false) {
                devolucion.comentario = '';
                let sqlServit  = ' ';
                let sqlTornat = '';
                const infoTime = fechaParaSqlServer(new Date(devolucion.timestamp));
                let nombreTablaServit = `[Servit-${infoTime.year.substring(2)}-${infoTime.month}-${infoTime.day}]`;
                let nombreTablaTornat = `[V_Tornat_${infoTime.year}-${infoTime.month}]`;
                for(let j = 0; j < devolucion.lista.length; j++) {
                    let devolucionActual = devolucion;
                    if(typeof devolucionActual.lista[j] === 'object') {
                        let idArticulo = null;
                        if(devolucionActual.lista[j].promocion !== undefined && devolucionActual.lista[j].promocion !== null) {
                            if(typeof devolucionActual.lista[j]._id === 'number') {
                                if(typeof devolucionActual.lista[j].promocion.esPromo === 'boolean') {
                                    if(!devolucionActual.lista[j].promocion.esPromo) {
                                        idArticulo = devolucionActual.lista[j]._id;
                                        sqlTornat += `INSERT INTO ${nombreTablaTornat} (Botiga, Data, Dependenta, Num_tick, Estat, Plu, Quantitat, Import, Tipus_venta) VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${devolucion.idTrabajador}, 0, '', ${devolucionActual.lista[j]._id}, ${devolucionActual.lista[j].unidades}, ${devolucionActual.lista[j].subtotal}, 'V');`;
                                        sqlServit += `INSERT INTO ${nombreTablaServit} VALUES (newid(), CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), 'Botiga ${parametros.nombreTienda}', ${parametros.codigoTienda}, ${idArticulo}, ${idArticulo}, 'AUTO', 'AUTO', 0, ${devolucionActual.lista[j].unidades}, 0, '', 0, 2, '', '', 0, '', '', '')`;
                                    }
                                }
                            }
                        } else {
                            if(typeof devolucionActual.lista[j].promocion.infoPromo === 'object') {
                                if(typeof devolucionActual.lista[j].promocion.infoPromo.tipoPromo === 'string') {
                                    if(devolucionActual.lista[j].promocion.infoPromo.tipoPromo === 'COMBO') {
                                        if (devolucionActual.lista[j].promocion.infoPromo.idPrincipal != 0 && devolucionActual.lista[j].promocion.infoPromo.idSecundario != 0 && typeof devolucionActual.lista[j].promocion.infoPromo.idPrincipal == 'number' && typeof devolucionActual.lista[j].promocion.infoPromo.idSecundario == 'number') {
                                            const importePrincipal = devolucionActual.lista[j].promocion.infoPromo.cantidadPrincipal*devolucionActual.lista[j].promocion.infoPromo.unidadesOferta*devolucionActual.lista[j].promocion.infoPromo.precioRealPrincipal;
                                            const importeSecundario = devolucionActual.lista[j].promocion.infoPromo.cantidadSecundario*devolucionActual.lista[j].promocion.infoPromo.unidadesOferta*devolucionActual.lista[j].promocion.infoPromo.precioRealSecundario;

                                            sqlServit += ` INSERT INTO ${nombreTablaServit} VALUES (newid(), CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), 'Botiga ${parametros.nombreTienda}', ${parametros.codigoTienda}, ${idArticulo}, ${idArticulo}, 'AUTO', 'AUTO', 0, ${devolucionActual.lista[j].promocion.infoPromo.cantidadPrincipal}, 0, '', 0, 2, '', '', 0, '', '', '')`;
                                            //
                                            sqlServit += ` INSERT INTO ${nombreTablaServit} VALUES (newid(), CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), 'Botiga ${parametros.nombreTienda}', ${parametros.codigoTienda}, ${idArticulo}, ${idArticulo}, 'AUTO', 'AUTO', 0, ${devolucionActual.lista[j].promocion.infoPromo.cantidadSecundario}, 0, '', 0, 2, '', '', 0, '', '', '')`;

                                            sqlTornat += ` INSERT INTO ${nombreTablaTornat} VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${devolucionActual.idTrabajador}, ${devolucionActual._id}, '', ${devolucionActual.lista[j].promocion.infoPromo.idPrincipal}, ${devolucionActual.lista[j].promocion.infoPromo.cantidadPrincipal*devolucionActual.lista[j].promocion.infoPromo.unidadesOferta}, ${importePrincipal.toFixed(2)}, 'V');`;
                                            //
                                            sqlTornat += ` INSERT INTO ${nombreTablaTornat} VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${devolucionActual.idTrabajador}, ${devolucionActual._id}, '', ${devolucionActual.lista[j].promocion.infoPromo.idSecundario}, ${devolucionActual.lista[j].promocion.infoPromo.cantidadSecundario*devolucionActual.lista[j].promocion.infoPromo.unidadesOferta}, ${importeSecundario.toFixed(2)}, 'V');`;
                                        } else {
                                            devolucionActual.comentario = 'ERROR, idPrincipal o idSecundario NO ES NUMBER o bien ALGUNO DE LOS DOS IDS ES 0';
                                        }
                                    } else if(devolucionActual.lista[j].promocion.infoPromo.tipoPromo === 'INDIVIDUAL') {
                                        if (typeof devolucionActual.lista[j].promocion.infoPromo.idPrincipal == 'number' && devolucionActual.lista[j].promocion.infoPromo.idPrincipal != 0) {
                                            sqlTornat += ` INSERT  INTO ${nombreTablaTornat} VALUES (${parametros.codigoTienda}, CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${devolucionActual.idTrabajador}, ${devolucionActual._id}, '', ${devolucionActual.lista[j].promocion.infoPromo.idPrincipal}, ${devolucionActual.lista[j].promocion.infoPromo.cantidadPrincipal*devolucionActual.lista[j].promocion.infoPromo.unidadesOferta}, ${(devolucionActual.tipoPago === "CONSUMO_PERSONAL") ? 0: devolucionActual.lista[j].promocion.infoPromo.precioRealPrincipal.toFixed(2)}, 'V';`;
                                        } else {
                                            devolucionActual.comentario = 'ERROR, idPrincipal NO ES NUMBER o ES 0';
                                        }
                                    } else {
                                        devolucionActual.comentario = "ERROR, infoPromo.tipoPromo NO ES 'COMBO' NI 'INDIVIDUAL'";
                                    }
                                } else {
                                    devolucionActual.comentario = 'ERROR, infoPromo.tipoPromo NO ES STRING';
                                }
                            } else {
                                devolucionActual.comentario = 'ERROR, LA POSICIÓN DE LA LISTA NO ES UN OBJETO';
                            }
                        }
                    }
                }
                const sql = `
                    IF NOT EXISTS (SELECT * FROM ${nombreTablaTornat} WHERE botiga = ${parametros.codigoTienda} AND Plu = ${devolucion.lista[0]._id} AND Data = CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120))
                        BEGIN
                            ${sqlTornat+sqlServit}
                            SELECT 'OK' as resultado;
                        END
                    ELSE
                    BEGIN
                        SELECT 'YA_EXISTE' as resultado;
                    END
                `;
                // recHit(parametros.database, sql).then((res) => {
                //     devolucionActual.enviado = true;
                // }).catch((err) => {
                //     console.log(err);
                //     devolucionActual.comentario = 'Generar error SQL';
                //     error = true;
                //     mensaje = 'SanPedro: Error, sqlServit falla. Mirar en log.';
                // });
                // if(error) break;
                try {
                    devolucion.intentos += 1;
                    const res = await recHit(parametros.database, sql);
                    if(res.recordset.length > 0) {
                        if(res.recordset[0].resultado === 'YA_EXISTE')  {
                            devolucion['intentaRepetir'] = 'YES';
                            devolucion.enviado = true;
                            devolucion.comentario = 'Se ha vuelto a enviar. OK';
                        } else if(res.recordset[0].resultado === 'OK') {
                            devolucion.enviado = true;
                        } else {
                            devolucion.comentario = 'Respuesta SQL incontrolada.';
                            server.emit('resSincroDevoluciones', { error: true, mensaje: 'SanPedro: Error, caso incontrolado. Respuesta desconocida.', devolucion, idDevolucionProblematica: devolucion._id});
                        }
                    } else {
                        devolucion.comentario = 'Caso no controlado de repuesta SQL';
                        server.emit('resSincroDevoluciones', { error: true, mensaje: 'SanPedro: ERROR en recHit 1. recordset.length = 0', idDevolucionProblematica: devolucion._id });
                    }
                } catch(err) {
                    console.log(err);
                    devolucion.comentario = 'Error en try catch';
                    server.emit('resSincroDevoluciones', { error: true, mensaje: 'SanPedro: SQL ERROR 1. Mirar log', devolucion, idDevolucionProblematica: devolucion._id });
                }

                if(!error) {
                    server.emit('resSincroDevoluciones', { error: false, devolucion });
                }
            } else {
                // DEVOLVER TAL CUAL LA DEVOLUCIÓN PORQUE NO SE HA MODIFICADO NADA DEBIDO A UN ERROR
                devolucion["comentario"] = resParametros.mensaje;
                server.emit('resSincroDevoluciones', { error: true, devolucion, mensaje: devolucion["comentario"] });
            }
    }
}

const devolucionesInstance = new DevolucionesClass();
export { devolucionesInstance };
