import { Body, Controller, Get, Post } from '@nestjs/common';
import { ordatic } from './ordatic.class';
import axios from "axios";
import { UtilesModule } from 'src/utiles/utiles.module';

@Controller('ordatic')
export class OrdaticController {
    // @Get('getToken')
    // getToken() {
    //     return ordatic.generateToken();
    // }

    @Get('getApp')
    getApp() {
        return ordatic.getApp();
    }

    @Post('webhook')
    getInfoWebhook(@Body() params) {
        console.log("ORDATIC WEBHOOK: ", params);
    }

    @Post('getCatalogo')
    getCatalogo(@Body() params) {
        if (UtilesModule.checkVariable(params.idTienda)) {
            return ordatic.getCatalogo(params.idTienda);
        } else {
            return { error: true, mensaje: "SanPedro: Faltan datos" };
        }
    }
}
