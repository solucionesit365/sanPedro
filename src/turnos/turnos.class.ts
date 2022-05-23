import { Moment } from 'moment';
import { recHit } from '../conexion/mssql';
import { fechaParaSqlServer } from "../funciones/fechas";

export class TurnosClass {
    /* Devuelve todos los planes de la semana de una tienda en concreto */
    getPlanes(database: string, codigoTienda: number) {
        const nombreTablaPlanificacion = this.nombreTablaPlanificacion(this.getLunes(new Date()));
        const fechaActual = new Date();
        const sql = `select pl.idPlan, pl.fecha, (select nombre from cdpTurnos WHERE idTurno = pl.idTurno) as turno, pl.idTurno from ${nombreTablaPlanificacion.nombreTabla} pl where botiga = ${codigoTienda} AND pl.idEmpleado IS NULL AND activo = 1`;
        // console.log(sql);
        return recHit(database, sql).then((res) => {
            return res.recordset;
        }).catch((err) => {
            console.log(err);
            return [];
        });
    }

    getLunes(d: Date) {
        var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1);
        return new Date(d.setDate(diff));
    }

    getLunesMoment(d: Moment) {
        return d.weekday(0);
    }
    
    nombreTablaPlanificacion(d: Date) {
        var nombre = 'cdpPlanificacion_' + d.getFullYear();
        var mes = (d.getMonth() + 1 >= 10) ? String(d.getMonth() + 1) : '0' + String(d.getMonth() + 1);
        var dia = (d.getDate() >= 10) ? String(d.getDate()) : '0' + String(d.getDate());
    
        return {
            nombreTabla: nombre + '_' + mes + '_' + dia,
            dia: d.getDate(),
            mes: d.getMonth() + 1,
            year: d.getFullYear()
        };
    }
    nombreTablaPlanificacionMoment(d: Moment) {
        var nombre = 'cdpPlanificacion_' + d.year();
        var mes = (d.month() + 1 >= 10) ? String(d.month() + 1) : '0' + String(d.month() + 1);
        var dia = (d.date() >= 10) ? String(d.date()) : '0' + String(d.date());
    
        return {
            nombreTabla: nombre + '_' + mes + '_' + dia,
            dia: d.date(),
            mes: d.month() + 1,
            year: d.year()
        };
    }

    traductorTipoTurno(tipo: string) {
        switch(tipo) {
            case 'M': return 'Mañana';
            case 'T': return 'Tarde';
            case 'N': return 'Noche';
        }
    }

    /* Obtiene las horas extra y de coordinación de la bbdd para un trabajador. */
    async getHorasExtraCoordinacion(idTrabajador: number, horaFichaje: number, codigoTienda: number, database: string) {
        const fechaFichaje = new Date(horaFichaje);
        const lunes = this.getLunes(fechaFichaje);
        const nombreTabla = this.nombreTablaPlanificacion(lunes);
        // 1_Extra        3_Coordinacion
        const sql = `
        DECLARE @horasExtra nvarchar(255)
        DECLARE @horasCoordinacion nvarchar(255)

        select @horasCoordinacion = idTurno from ${nombreTabla.nombreTabla} where botiga = ${codigoTienda} and idTurno like '%_Coordinacion' and idEmpleado = ${idTrabajador}
        select @horasExtra = idTurno from ${nombreTabla.nombreTabla} where botiga = ${codigoTienda} and idTurno like '%_Extra' and idEmpleado = ${idTrabajador}
        select ISNULL(@horasCoordinacion, 'NO_HAY') as horasCoordinacion, ISNULL(@horasExtra, 'NO_HAY') as horasExtra
        `;

        try {
            const res = await recHit(database, sql);
            if (res.recordset.length > 0) {
                let horasCoordinacion = 0;
                let horasExtra = 0;

                if (res.recordset[0].horasCoordinacion != 'NO_HAY') {
                    horasCoordinacion = Number(res.recordset[0].horasCoordinacion.split('_')[0]);
                    if (isNaN(horasCoordinacion)) horasCoordinacion = 0;
                }

                if (res.recordset[0].horasExtra != 'NO_HAY') {
                    horasExtra = Number(res.recordset[0].horasExtra.split('_')[0]);
                    if (isNaN(horasExtra)) horasExtra = 0;
                }
                return { error: false, info: { horasExtra, horasCoordinacion } };
            } else {
                return { error: true, mensaje: 'Error, no hay resultados para getHorasExtraCoordinacion' };
            }
        } catch(err) {
            console.log(err);
            return { error: true, mensaje: err.message };
        };
    }
}
