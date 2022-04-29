import { Controller, Body, Post } from '@nestjs/common';
import { recHit } from '../conexion/mssql';
import { PASSWORD_INSTALLWIZARD } from '../secrets';
@Controller('parametros')
export class ParametrosController {
    @Post('instaladorLicencia')
    async instaladorLicencia(@Body() data) {
        if (data.password == PASSWORD_INSTALLWIZARD) {
            const sqlParaImprimir = `SELECT ll.Llicencia, ll.Empresa, ll.LastAccess, we.Db, ISNULL(ti.ultimoIdTicket, 0) as ultimoIdTicket, ti.token FROM llicencies ll LEFT JOIN Web_Empreses we ON ll.Empresa = we.Nom LEFT JOIN tocGameInfo ti ON ti.licencia = ${data.numLlicencia} WHERE ll.Llicencia = ${data.numLlicencia}`;
            const res1 = await recHit('Hit', sqlParaImprimir);
            const sqlParaImprimir2 = `SELECT Nom, Codi as codigoTienda FROM clients WHERE Codi = (SELECT Valor1 FROM ParamsHw WHERE Codi = ${res1.recordset[0].Llicencia})`;
            const data2 = await recHit(res1.recordset[0].Db, sqlParaImprimir2);

            if (res1.recordset.length === 1) {
                const dataF = await recHit(res1.recordset[0].Db, `SELECT Valor FROM paramstpv WHERE CodiClient = ${res1.recordset[0].Llicencia} AND (Variable = 'BotonsPreu' OR Variable = 'ProhibirCercaArticles')`);
                return {
                    info: {
                        licencia: parseInt(res1.recordset[0].Llicencia),
                        nombreEmpresa: res1.recordset[0].Empresa,
                        database: res1.recordset[0].Db,
                        nombreTienda: data2.recordset[0].Nom,
                        codigoTienda: data2.recordset[0].codigoTienda,
                        ultimoTicket: res1.recordset[0].ultimoIdTicket,
                        botonesConPrecios: dataF.recordset[0] ? dataF.recordset[0].Valor : 'No',
                        prohibirBuscarArticulos: dataF.recordset[1] ? dataF.recordset[1].Valor : 'Si',
                        token: res1.recordset[0].token
                    },
                    error: false
                };                
            }
            
            return {
                error: true,
                mensaje: "No hay UN resultado con estos datos"
            };
        }
        return {
            error: true,
            mensaje: "Contraseña incorrecta"
        };
    }
}
