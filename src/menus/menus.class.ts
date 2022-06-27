import { IResult } from 'mssql';
import { recHit } from '../conexion/mssql';

export class MenusClass {
    // getMenus(database: string, codigoCliente: number) {
    //     return recHit(database, `SELECT DISTINCT Ambient as nomMenu FROM TeclatsTpv WHERE Llicencia = ${codigoCliente} AND Data = (select MAX(Data) FROM TeclatsTpv WHERE Llicencia = ${codigoCliente} )`).then((res: IResult<any>) => {
    //         if (res) {
    //             if (res.recordset.length > 0) {
    //                 if(this.checkDobleMenus(database, codigoCliente)) {
    //                     return res.recordset.map(i => ({nomMenu: i.nomMenu.substring(3), tag: i.nomMenu.substring(0, 2)}));
    //                 }
    //                 return res.recordset;
    //             }
    //         }
    //         return [];
    //     }).catch((err) => {
    //         console.log(err);
    //         return [];
    //     });
    // }


    getMenus(database: string, codigoCliente: number) {
        return recHit(database, `SELECT DISTINCT Ambient as nomMenu FROM TeclatsTpv WHERE Llicencia = ${codigoCliente} AND Data = (select MAX(Data) FROM TeclatsTpv WHERE Llicencia = ${codigoCliente} )`).then( async (res: any) => {
            if (res) {
               
                if (res.recordset.length > 0) {
            
                    let doble_menus = await this.checkDobleMenus(database, codigoCliente);
                    if(doble_menus) {

                            return this.getMenusDobles(database, codigoCliente)  
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
    getMenusDobles(database: string, codigoCliente: number) {
        if(!this.checkDobleMenus(database, codigoCliente)) return [];
        return recHit(database, `SELECT Variable, Valor FROM ParamsTpv WHERE CodiClient = ${codigoCliente} AND Variable LIKE 'DosNivells%'`).then((params) => {
            if(params) {
               
                    
                return recHit(database, `SELECT DISTINCT Ambient  FROM TeclatsTpv WHERE Llicencia = ${codigoCliente} AND Data = (select MAX(Data) FROM TeclatsTpv WHERE Llicencia = ${codigoCliente}) `).then((teclats) => {
                    if(teclats) {

                         let  menu = []
                        for (let paramsindex = 0; paramsindex < params.recordset.length; paramsindex++) {
                           if ( params.recordset[paramsindex].Variable.includes("Tag")){
                        for (let index = 0; index < teclats.recordset.length; index++) {
                            if (teclats.recordset[index].Ambient.includes(params.recordset[paramsindex].Valor) && params.recordset[paramsindex].Valor !="" ){
                           // const element = teclats.recordset[index].Ambient.replace(params.recordset[paramsindex].Valor, "");
                            // let nommenu =element.slice(1)
                            const element = teclats.recordset[index].Ambient
                            menu.push({"nomMenu":element,"tag":params.recordset[paramsindex].Valor})
                            }
                        }

                           }
                        }
                        return menu
                    } else {
                        return { error: true, mensaje: 'Error en menu.class/getDobleMenus '};
                    }
                }).catch((err) => {
                    console.log(err);
                    return [];
                })
            } else {
                return { error: true, mensaje: 'Error en menu.class/getDobleMenus '};
            }
        }).catch((err) => {
            console.log(err);
            return [];
        })
    }
    // getDobleMenus(database: string, codigoCliente: number) {
    //     if(!this.checkDobleMenus(database, codigoCliente)) return [];
    //     return recHit(database, `SELECT Variable, Valor FROM ParamsTpv WHERE CodiClient = ${codigoCliente} AND Variable LIKE 'DosNivells%'`).then((params) => {
    //         if(params) {
               
                    
    //             return recHit(database, `SELECT Ambient FROM TeclatsTpv WHERE Llicencia = ${codigoCliente} `).then((teclats) => {
    //                 if(teclats) {

                     
    //                     let  menu ={}
    //                     for (let paramsindex = 0; paramsindex < params.recordset.length; paramsindex++) {
    //                        menu[params.recordset[paramsindex].Variable]=params.recordset[paramsindex].Valor
    //                     }
    //                     console.log(menu)
    //                    let menus =[]
    //                     for (let index = 0; index < 7; index++) {
    //                         const element = menu[`DosNivells_${index}_Tag`];

    //                         if(menu[`DosNivells_${index}_Texte`]!=""){
    //                             menus.push({"nomMenu":menu[`DosNivells_${index}_Texte`]})
    //                             console.log(menu[`DosNivells_${index}_Texte`])
    //                         }else{
    //                             console.log("no hay na ")
    //                         }
    //                     }
                     





                      
    //                 } else {
    //                     return { error: true, mensaje: 'Error en menu.class/getDobleMenus '};
    //                 }
    //             }).catch((err) => {
    //                 console.log(err);
    //                 return [];
    //             })
    //         } else {
    //             return { error: true, mensaje: 'Error en menu.class/getDobleMenus '};
    //         }
    //     }).catch((err) => {
    //         console.log(err);
    //         return [];
    //     })
    // }

    async getDobleMenus(database: string, codigoCliente: number) {
       
        if(!await this.checkDobleMenus(database, codigoCliente)){
            return[]
        };
        return recHit(database, `SELECT Variable, Valor FROM ParamsTpv WHERE CodiClient = ${codigoCliente} AND Variable LIKE 'DosNivells%'`).then((res) => {
            if(res) {
                if(res.recordset.length > 0) {
                    const data = res.recordset;
                    const dobleMenus = data.filter(o => o.Valor !== '');
                        let  menu ={}
                        for (let paramsindex = 0; paramsindex < dobleMenus.length; paramsindex++) {
                           menu[dobleMenus[paramsindex].Variable]=dobleMenus[paramsindex].Valor
                        }

                       let menus =[]
                        for (let index = 0; index < 7; index++) {
                       
                            if(menu[`DosNivells_${index}_Texte`]!="" && menu[`DosNivells_${index}_Texte`]!= undefined){
                                let id = `DosNivells_${index}`
                                let nombre = menu[`DosNivells_${index}_Texte`]
                                let tag =  menu[`DosNivells_${index}_Tag`]
                               if (nombre === undefined){
                                nombre = tag
                               }
                                menus.push({id: id, nombre :nombre, tag:tag })
                            }
                        }
                        // {
                        //     id: nombresubstring(0, 12),
                        //     nombre: item[1].Valor,
                        //     tag: item[0].Valor,
                        // }
                return menus;
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
    async checkDobleMenus(database: string, codigoCliente: number) {
        return await recHit(database, `SELECT Valor FROM ParamsTpv WHERE CodiClient = ${codigoCliente} AND Variable = 'DosNivells'`).then((res) => {
            if(res) if(res.recordset.length > 0) return res.recordset[0].Valor === 'Si' ? true : false;
            return false;
        }).catch((err) => {
            console.log(err);
            return false;
        })
    }
}
export const menusInstance = new MenusClass();