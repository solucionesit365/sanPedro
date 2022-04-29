import { Controller, Post, Body } from '@nestjs/common';
import { entregasInstance } from './entregas.class';

@Controller('entregas')
export class EntregasController {
    @Post('getEntregas')
    getEntregas(@Body() params) {
        if(params.database && params.licencia) {
            return entregasInstance.getEntregas(params.database, params.licencia).then((res) => {
                if(res) return { error: false, info: res };
                return {
                    error: true,
                    info: 'Error en newSanPedro - entregas/getEntregas',
                };
            });
        } else {
            return {
                error: true,
                info: 'Faltan datos en newSanPedro - entregas/getEntregas',
            };
        }
    }
}