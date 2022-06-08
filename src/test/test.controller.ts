import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { recHit } from 'src/conexion/mssql';
import { logger } from '../logger/logger.class';
import * as fs from 'fs';
import { join } from 'path';

@Controller('test')
export class TestController {
    @Post('test')
    async test(@Body() params) {
        
        const tienda = 91;
        const lol = "dsfaffdsdsaa"
        logger.Info(tienda, lol);
        // logger.Error('wow');
        return recHit('Fac_Tena', "select * from archivo where id = ''").then((res) => {
            fs.writeFile('C:\\Users\\Eze\\Documents\\GitHub\\sanPedro\\nomina.pdf', res.recordset[0].archivo, function() {
                console.log("lolaso");
            });
            
            return res.recordset[0]
        }).catch((err) => {
            return err.message
        })
    }

    @Get('nomina')
    getFile(@Res() res: any) {
      const file = fs.createReadStream(join(process.cwd(), 'nomina.pdf'));
      file.pipe(res);
    }
}
