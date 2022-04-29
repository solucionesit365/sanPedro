import { IResult } from 'mssql';
import { TurnosClass } from '../turnos/turnos.class';
import { recHit } from '../conexion/mssql';
import { fechaParaSqlServer } from "src/funciones/fechas";

export class DependientasClass {
    getDependientas(database: string) {
        return recHit(database, 'select Codi as idTrabajador, Codi as _id, nom as nombre, memo as nombreCorto from dependentes').then((res: IResult<any>) => {
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

    crearPlan(database: string, codigoCliente: string, horaEntrada: string, horaSalida: string) {
        const fechaActual = new Date();
        const infoTime = fechaParaSqlServer(fechaActual);
        const turnosInstance = new TurnosClass();
        const lunes = turnosInstance.getLunes(fechaActual);
        const nombreTablaPlanificacion = turnosInstance.nombreTablaPlanificacion(lunes);
        const sql = `
        DECLARE @idTurno nvarchar(255);
        select TOP 1 @idTurno = idTurno from cdpTurnos WHERE horaInicio = '${horaEntrada}' AND horaFin = '${horaSalida}';

        IF @idTurno IS NOT NULL
        BEGIN
            INSERT INTO ${nombreTablaPlanificacion.nombreTabla} VALUES (NEWID(), CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), ${codigoCliente}, '${(fechaActual.getHours() >= 13) ? ('T') : ('M')}', @idTurno, NULL, 'TocGameResponsable', CONVERT(datetime, '${infoTime.year}-${infoTime.month}-${infoTime.day} ${infoTime.hours}:${infoTime.minutes}:${infoTime.seconds}', 120), 1)
            SELECT 'OK' as resultado
        END
        ELSE
        BEGIN 
            SELECT 'ERROR' as resultado
        END
        `;

        return recHit(database, sql).then((res) => {
            if (res.recordset[0].resultado == 'OK') {
                return { error: false };
            } else {
                return { error: true, mensaje: 'Error, el turno no existe' };
            }
        }).catch((err) => {
            console.log(err);
            return { error: true, mensaje: 'Error, en CATCH crearPlan sanpedro' };
        });
        
    }

    async getHorasExtraCoordinacion(arrayTrabajadores: any[], fecha: number, codigoTienda: number, idTrabajador: number, database: string) {
        const turnosInstance = new TurnosClass();
        const lunes = turnosInstance.getLunes(new Date(fecha));
        const nombreTablaPlanificacion = turnosInstance.nombreTablaPlanificacion(lunes);

        for (let i = 0; i < arrayTrabajadores.length; i++) {
            let sql = `
                DECLARE @horasCoordinacion nvarchar(255);
                DECLARE @horasExtra nvarchar(255);
                
                select @horasCoordinacion = idTurno from ${nombreTablaPlanificacion} where botiga = ${codigoTienda} and idTurno like '%_Coordinacion' AND idEmpleado = ${idTrabajador};
                select @horasExtra = idTurno from ${nombreTablaPlanificacion} where botiga = ${codigoTienda} and idTurno like '%_Extra' AND idEmpleado = ${idTrabajador};
                
                SELECT @horasCoordinacion as horasCoordinacion, @horasExtra as horasExtra 
            `;
            const horasTrabajadorX = await recHit(database, sql);
        }
    }
}
export const dependientasInstance = new DependientasClass();
