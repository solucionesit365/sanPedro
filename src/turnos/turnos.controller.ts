import { Body, Controller, Post } from '@nestjs/common';
import { UtilesModule } from '../utiles/utiles.module';
import { TurnosClass } from './turnos.class';


@Controller('turnos')
export class TurnosController {
    @Post('getPlanes')
    getPlanes(@Body() params) {
        if (params != undefined && params != null) {
            if (params.codigoTienda != undefined && params.codigoTienda != null && params.database != undefined && params.database != null) {
                const turnosInstance = new TurnosClass();
                return turnosInstance.getPlanes(params.database, params.codigoTienda).then((res) => {
                    return { error: false, info: res };
                }).catch((err) => {
                    console.log(err);
                    return { error: true, mensaje: 'Error: SanPedro turnos/getPlanes > Catch de getPlanes()' };
                });
            } else {
                return { error: true, mensaje: 'Error: SanPedro turnos/getPlanes > Faltan datos' };
            }
        } else {
            return { error: true, mensaje: 'Error: SanPedro turnos/getPlanes > Faltan todos los datos' };
        }
    }

    @Post('getHorasExtraCoordinacion')
    async getHorasExtraCoord(@Body() params) {
        if (UtilesModule.checkVariable(params.parametros, params.arrayTrabajaronAyer)) {
            const turnosInstance = new TurnosClass();
            for (let i = 0; i < params.arrayTrabajaronAyer.length; i++) {
                try {

                } catch(err) {
                    console.log(err);
                    return { error: true, mensaje: 'Error en CATCH turnos/getHorasExtraCoordinacion' };
                }
                // console.log(params.arrayTrabajaronAyer);
                const resultado = await turnosInstance.getHorasExtraCoordinacion(params.arrayTrabajaronAyer[i].infoTrabajador.idTrabajador, params.ayer, params.parametros.codigoTienda, params.parametros.database);
                if (resultado.error == false) {
                    params.arrayTrabajaronAyer[i] = {
                        fichado: params.arrayTrabajaronAyer[i].infoTrabajador.fichado,
                        idTrabajador: params.arrayTrabajaronAyer[i].infoTrabajador.idTrabajador,
                        nombre: params.arrayTrabajaronAyer[i].infoTrabajador.nombre,
                        nombreCorto: params.arrayTrabajaronAyer[i].infoTrabajador.nombreCorto,
                        _id: params.arrayTrabajaronAyer[i].infoTrabajador._id,
                        horasExtra: resultado.info.horasExtra,
                        horasCoordinacion: resultado.info.horasCoordinacion,
                        timestamp: params.arrayTrabajaronAyer[i].timestamp
                    };
                } else {
                    return { error: true, mensaje: 'Error en turnos/getHorasExtraCoordinacion getHoras ()' };
                }
                
            }
            return { error: false, info: params.arrayTrabajaronAyer };
        } else {
            return { error: true, mensaje: 'Faltan datos en turnos/getHorasExtraCoordinacion' };
        }
    }
}
