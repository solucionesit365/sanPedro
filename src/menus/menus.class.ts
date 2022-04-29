import { IResult } from 'mssql';
import { recHit } from '../conexion/mssql';

export class MenusClass {
    getMenus(database: string, codigoCliente: number) {
        return recHit(database, `SELECT DISTINCT Ambient as nomMenu FROM TeclatsTpv WHERE Llicencia = ${codigoCliente} AND Data = (select MAX(Data) FROM TeclatsTpv WHERE Llicencia = ${codigoCliente} )`).then((res: IResult<any>) => {
            if (res) {
                if (res.recordset.length > 0) {
                    if(this.checkDobleMenus(database, codigoCliente)) {
                        return res.recordset.map(i => ({nomMenu: i.nomMenu.substring(3), tag: i.nomMenu.substring(0, 2)}));
                    }
                    return res.recordset;
                }
            }
            return [];
        }).catch((err) => {
            console.log(err);
            return [];
        });
    }
    getDobleMenus(database: string, codigoCliente: number) {
        if(!this.checkDobleMenus(database, codigoCliente)) return [];
        return recHit(database, `SELECT Variable, Valor FROM ParamsTpv WHERE CodiClient = ${codigoCliente} AND Variable LIKE 'DosNivells%'`).then((res) => {
            if(res) {
                if(res.recordset.length > 0) {
                    const data = res.recordset;
                    const dobleMenus = data.filter(o => o.Valor !== '');
                    const sch_dobleMenus = [];
                    for(let i in dobleMenus) {
                        const item = dobleMenus.filter(j => j.Variable.match(`DosNivells_${i}.*`));
                        if(item.length > 0)  {
                            sch_dobleMenus.push({
                                id: item[0].Variable.substring(0, 12),
                                nombre: item[1].Valor,
                                tag: item[0].Valor,
                            });
                        }
                    }
                    return sch_dobleMenus;
                } else {
                    return { error: true, mensaje: 'No hay datos de doble menu.'}
                }
            } else {
                return { error: true, mensaje: 'Error en menu.class/getDobleMenus '};
            }
        }).catch((err) => {
            console.log(err);
            return [];
        })
    }
    checkDobleMenus(database: string, codigoCliente: number) {
        return recHit(database, `SELECT Valor FROM ParamsTpv WHERE CodiClient = ${codigoCliente} AND Variable = 'DosNivells'`).then((res) => {
            if(res) if(res.recordset.length > 0) return res.recordset[0].Valor === 'Si' ? true : false;
            return false;
        }).catch((err) => {
            console.log(err);
            return false;
        })
    }
}
export const menusInstance = new MenusClass();