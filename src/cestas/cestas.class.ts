import { IResult } from "mssql";
import { recHit } from "src/conexion/mssql";

export class Cestas {
    getCestas(database: string, codigoCliente: number) {
        console.log('Entro aqui')
        const sql = `SELECT variable, valor FROM ParamsTpv WHERE CodiClient = ${codigoCliente} AND variable LIKE '%Taula%' ORDER BY variable ASC`;
        return recHit(database, sql).then((res) => {
            if(res) {
                if(res.recordset.length > 0) {
                    const data = res.recordset;
                    const cestasActivadas = data.filter(item => item.valor === 'No');
                    let cestas = cestasActivadas.filter(item => item.variable.match(/TaulaDesactivada.*/)).map(item => data.find(i => i.variable === `TaulaNom${(item.variable).match(/(\d+)/)[0]}`));
                    // Borrar posibles undefineds o nulls
                    cestas = cestas.filter(i => i);
                    return { error: false, info: cestas };
                } else {
                    return { error: true, mensaje: 'SanPedro: Esta tienda no tiene mesas' };
                }
            }
            return { error: true, mensaje: 'SanPedro: Error no controlado en CestasClass -> getCestas' };
        }).catch((err) => {
            console.log(err);
            return { error: true, mensaje: 'SanPedro: Error en catch getCestas (cestas.class)' };
        })
    }
}
export const cestasInstance = new Cestas();
