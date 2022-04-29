import { Body, Controller, Get, Header, HttpCode, Post, Req } from '@nestjs/common';
import { UtilesModule } from 'src/utiles/utiles.module';
import { impresorasInstance, NO_IMPRIME } from './impresoras-ip.class';
import * as rawbody from 'raw-body';

@Controller('impresoras-ip')
export class ImpresorasIpController {
    @Post('main')
    @HttpCode(200)
    mainPost(@Body() params, @Req() req) {
        const mac = impresorasInstance.getMacString(req);
        if (UtilesModule.checkVariable(params.status, mac)) {
            return impresorasInstance.main(mac, params.status);
        } else {
            return NO_IMPRIME;
        }
    }

    @Get('main')
    @Header('Content-Type', "text/plain")
    mainGet(@Req() req) {
        return impresorasInstance.mainForGet(impresorasInstance.getMacString(req));
    }
}
