import { Query, Controller, Get } from '@nestjs/common';
import { cestasInstance } from './cestas.class';

@Controller('cestas')
export class CestasController {
    @Get('getCestas')
    getInfoTicket(@Query() params) {
        return cestasInstance.getCestas('Fac_Saborit', 288).then((res) => {
            // Nada
        })
    }
}
