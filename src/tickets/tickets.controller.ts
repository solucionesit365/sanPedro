import { Body, Controller } from '@nestjs/common';
import { ticketsInstance } from './tickets.class';

@Controller('tickets')
export class TicketsController {
    // sincroTickets(@Body() params) {
    //     if (params != undefined) {
    //         if (params.arrayTickets != undefined && params.arrayTickets != null && params.parametros != undefined && params.parametros != null) {
    //           ticketsInstance.insertarTickets(params.arrayTickets, params.parametros, this.server);
    //         } else {
    //           return { error: true, mensaje:  'SanPedro: arrayTickets o parametros indefinidos o null'};
    //         }
    //       } else {
    //         return { error: true, mensaje:  'SanPedro: Error en sockets > sincroTickets. ¡Faltan datos!'};
    //       }
    //     }
}
