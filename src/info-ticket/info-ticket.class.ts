import { IResult } from 'mssql';
import { recHit } from '../conexion/mssql';

export class InfoTicketClass {
    /* Obtiene la información fiscal del ticket en papel (para imprimir) */
    getInfoTicket(database: string, codigoCliente: number) {
        return recHit(database, `select Variable AS nombreDato, Valor AS valorDato from paramsTpv where CodiClient = ${codigoCliente} AND (Variable = 'Capselera_1' OR Variable = 'Capselera_2')`).then((res: IResult<any>) => {
            if (res) {
                if (res.recordset.length > 0) {
                    return res.recordset;
                }
            }
            return [];
        }).catch((err) => {
            console.log(err);
            return [];
        });
    }
}
export const infoTicketInstance = new InfoTicketClass();
