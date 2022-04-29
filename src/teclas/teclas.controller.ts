import { Body, Controller, Post } from '@nestjs/common';
import { teclasInstance } from './teclas.class';

@Controller('teclas')
export class TeclasController {
    @Post('descargarTeclados')
    descargarTeclados(@Body() params) {
        if (params != null || params != undefined) {
            if (params.database != null || params.database != undefined || params.licencia != null || params.licencia != undefined) {
                return teclasInstance.getTeclas(params.database, params.licencia).then((res) => {
                    return { error: false, info: res };
                }).catch((err) => {
                    console.log(err);
                    return { error: true, mensaje: 'SanPedro: Error, teclas/descargarTeclados getTeclas CATCH' };
                });
            } else {
                return { error: true, mensaje: 'SanPedro: Error, teclas/descargarTeclados faltan datos' };
            }
        } else {
            return { error: true, mensaje: 'SanPedro: Error, teclas/descargarTeclados faltan todos los datos' };
        }
    }
}
