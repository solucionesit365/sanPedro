import { Body, Controller, Post } from '@nestjs/common';
import { UtilesModule } from '../utiles/utiles.module';
import { dependientasInstance } from './dependientas.class';

@Controller('dependientas')
export class DependientasController {
    @Post('descargar')
    descargarTrabajadores(@Body() params) {
        if (params != undefined && params != null) {
            if (params.database != undefined && params.database != null) {
                return dependientasInstance.getDependientas(params.database).then((res) => {
                    return { error: false, info: res };
                }).catch((err) => {
                    console.log(err);
                    return { error: true, mensaje: 'SanPedro: dependientas/descargar error catch' };
                });
            } else {
                return { error: true, mensaje: 'SanPedro: dependientas/descargar faltan datos' };
            }
        } else {
            return { error: true, mensaje: 'SanPedro: dependientas/descargar faltan todos los datos' };
        }
    }

    @Post('crearPlan')
    crearPlan(@Body() params) {
        if (UtilesModule.checkVariable(params.parametros, params.horaEntrada, params.horaSalida)) {
            return dependientasInstance.crearPlan(params.parametros.database, params.parametros.codigoTienda, params.horaEntrada, params.horaSalida).then((res) => {
                return res;
            });
        } else {
            return { error: true, mensaje: 'Error, faltan datos en dependientas/crearPlan SAN PEDRO' };
        }
    }
}
