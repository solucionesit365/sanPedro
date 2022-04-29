import { Body, Controller, Post } from '@nestjs/common';
import { infoTicketInstance } from './info-ticket.class';

@Controller('info-ticket')
export class InfoTicketController {
    @Post('getInfoTicket')
    getInfoTicket(@Body() params) {
        if (params.database != undefined && params.idCliente != undefined) {
            return infoTicketInstance.getInfoTicket(params.database, params.idCliente).then((res) => {
                return { error: false, info: res };
            }).catch((err) => {
                console.log(err);
                return { error: true, mensaje: 'SanPedro: Error en catch info-ticket/getInfoTicket' };
            });
        } else {
            return { error: true, mensaje: 'SanPedro: Faltan datos en info-ticket/getInfoTicket' };
        }
    }
}
