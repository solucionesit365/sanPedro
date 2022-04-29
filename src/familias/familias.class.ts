import { IResult } from 'mssql';
import { recHit } from '../conexion/mssql';

export class FamiliasClass {
    getFamilias(database: string) {
        return recHit(database, 'SELECT Nom as nombre, Pare as padre FROM Families WHERE Nivell > 0').then((res: IResult<any>) => {
            if (res) {
                if (res.recordset.length) {
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
export const familiasInstance = new FamiliasClass();
