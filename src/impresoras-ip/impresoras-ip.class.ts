import { recHit } from "../conexion/mssql";

const IMPRIME = {
    jobReady: true, 
    mediaTypes: ["text/plain"]	
};

export const NO_IMPRIME = {
    jobReady: false, 
    mediaTypes: ["application/vnd.star.line"]				
};

export class ImpresorasIpClass {
    getMacString(req: any): string {
        return req.headers['x-star-mac'];
    }

    /* Devuelve true si se ha pulsado el botón, devuelve false en caso contrario. Si está pulsado, cambia el estado */
    private async botonPulsado(status: string, mac: string): Promise<boolean> {
        const arrayStatus = status.split(' ');
        if (arrayStatus[2] == '4') {
            await this.setInfoImpresora(mac);
            return true;
        }
        return false
    }

    /* Establece el estado de la impresora: 1 está imprimiendo, 0 está parada */
    private setInfoImpresora(mac: string) {
        const sql = `
            IF EXISTS (SELECT * FROM ImpresorasIp WHERE Mac = UPPER('${mac}'))
                BEGIN 
                    DECLARE @estado tinyint
                    SELECT @estado = estado FROM ImpresorasIP WHERE Mac = UPPER('${mac}');
                    IF (@estado = 0)
                        BEGIN 
                            UPDATE ImpresorasIp SET estado = 1 WHERE Mac = UPPER('${mac}');
                        END
                    ELSE
                        BEGIN 
                            UPDATE ImpresorasIp SET estado = 0 WHERE Mac = UPPER('${mac}');
                        END
                END
        `;
        return recHit('Hit', sql).then(() => {
            return true;
        }).catch((err) => {
            console.log(err);
            return false;
        });
    }

    private detenerImpresora(mac: string): void {
        const sql = `
            IF EXISTS (SELECT * FROM ImpresorasIp WHERE Mac = UPPER('${mac}'))
                BEGIN 
                    UPDATE ImpresorasIp SET estado = 0 WHERE Mac = UPPER('${mac}');
                END
        `;
        try {
            recHit('Hit', sql);
        } catch(err) {
            console.log(err);
        }
    }

    /* Obtiene la información de la impresora con esa Mac. Si no existe, crea el registro. */
    private getInfoImpresora(mac: string): Promise<any[]> {
        const sql = `
            IF EXISTS (SELECT * FROM ImpresorasIp WHERE Mac = UPPER('${mac}'))
                BEGIN 
                    SELECT *, 'YES' as configurada FROM ImpresorasIp WHERE Mac = UPPER('${mac}')
                END
            ELSE
                BEGIN 
                    INSERT INTO ImpresorasIp VALUES (NEWID(), '', UPPER('${mac}'), 'Hit', 'IMPRESORA NUEVA', 0, GETDATE())
                    SELECT 'NO' as configurada
                END
        `;
        return recHit('Hit', sql).then((res) => {
            return res.recordset;
        }).catch((err) => {
            console.log(err);
            return [];
        });
    }

    /* Devuelve si está imprimiendo no */
    public async imprimiendo(mac: string): Promise<boolean> {
        const infoImpresora = await this.getInfoImpresora(mac);
        if (infoImpresora.length > 0) {
            if (infoImpresora[0].configurada == 'YES') {
                return (Number(infoImpresora[0].estado) === 1) ? (true) : (false);
            }
        }
        return false;
    }

    quienSoy(mac: string): any {
        const sql = `SELECT empresa as bbdd, nom as nombre FROM ImpresorasIp WHERE mac = '${mac}'`;

        return recHit('Hit', sql).then((res) => {
            if (res.recordset.length > 0) {
                return { error: false, info: res.recordset[0] };
            }
            return { error: true, mensaje: 'No existe ninguna impresora con esa MAC Address' };
        }).catch((err) => {
            console.log(err);
            return { error: true, mensaje: 'Error CATCH quienSoy()' };
        });
    }

    public async main(mac: string, status: string) {
        if (await this.botonPulsado(status, mac)) {
            return IMPRIME;
        } else {
            if (await this.imprimiendo(mac)) {
                return IMPRIME
            } else {
                return NO_IMPRIME;
            }
        }
    }

    public async mainForGet(mac: string) {
        try {
            const infoImpresora = await this.quienSoy(mac);

            if (!infoImpresora.error) {
                if (infoImpresora.info.nombre == 'IMPRESORA NUEVA') {
                    return `IMPRESORA NO CONFIGURADA. LLAMA AL 937161010
                    MAC: ${mac}
                    `;
                }
                const mensaje = await this.pop(infoImpresora.info.bbdd, infoImpresora.info.nombre, mac);
                if (!mensaje.error) {
                    return mensaje.info;
                } else {
                    return JSON.stringify('Error 450, contacta con informática');
                }
            } else {
                return JSON.stringify('Error 452, contacta con informática');
            }
        } catch(err) {
            console.log(err);
            return JSON.stringify('Error 454, contacta con informática');
        }
        
    }

    /* Procesa la cola FIFO. Elimina siempre el dato. */
    private pop(database: string, nombreImpresora: string, mac: string): any {
        const sql = `
            DECLARE @idBorrar nvarchar(255)
            DECLARE @texto nvarchar(MAX)
    
            SELECT TOP 1 @idBorrar = id, @texto = Texte FROM ImpresoraCola WHERE Impresora = '${nombreImpresora}'
            DELETE FROM ImpresoraCola WHERE id = @idBorrar
            SELECT @idBorrar as id, @texto as texto
        `;
        return recHit(database, sql).then((res) => {
            if (res.recordset.length > 0) {
                return { error: false, info: res.recordset[0].texto};
            } else {
                this.detenerImpresora(mac);
                return { error: false, info: 'NADA QUE IMPRIMIR' };
            }
        }).catch((err) => {
            console.log(err);
            return { error: true, mensaje: 'Error catch impresora pop()' };
        });
    }
}

export const impresorasInstance = new ImpresorasIpClass();
