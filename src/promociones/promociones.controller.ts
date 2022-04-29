import { Body, Controller, Post } from '@nestjs/common';
import { promocionesInstance } from './promociones.class';

@Controller('promociones')
export class PromocionesController {
    @Post('getPromociones')
    getPromociones(@Body() params) {
        if (params != null && params != undefined) {
            if (params.database != null && params.database != undefined && params.codigoTienda != null && params.codigoTienda != undefined) {
                return promocionesInstance.getPromociones(params.database, params.codigoTienda).then((promociones) => {
                    return { error: false, info: promociones };
                }).catch((err) => {
                    console.log(err);
                    return { error: true, mensaje: 'SanPedro: Faltan datos promociones/getPromociones > getPromociones() CATCH' };
                });
            } else {
                return { error: true, mensaje: 'SanPedro: Faltan datos promociones/getPromociones' };
            }
        } else {
            return { error: true, mensaje: 'SanPedro: Faltan todos los datos promociones/getPromociones' };
        }
    }
}
