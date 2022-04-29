import { IResult } from 'mssql';
import { recHit } from '../conexion/mssql';

export class General {
    /* Transforma el codigo de licencia en el codigo de tienda.
    Normalmente es el mismo, pero por si acaso lo comprueba en ParamsHw */
    getCodigoTiendaFromLicencia(database: string, licencia: number): Promise<boolean|number> {
        return recHit(database, `SELECT Valor1 as codigoCliente FROM ParamsHw WHERE Codi = ${licencia}`).then((res: IResult<any>) => {
            if(res) {
                if (res.recordset.length > 0) {
                    return res.recordset[0].codigoCliente;
                } else {
                    return false
                }
            }
            return false;
        }).catch((err) => {
            console.log(err);
            return false;
        });
    }
}

export const generalInstance = new General();