import { Body, Controller, Get, Param, Post, Res, StreamableFile } from '@nestjs/common';
import { recHit } from 'src/conexion/mssql';
import { logger } from '../logger/logger.class';
import * as fs from 'fs';
import { join } from 'path';

@Controller('test')
export class TestController {
    @Post('test')
    async test(@Body() params) {
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

    @Post('testGuapo')
    testlol(): Promise<StreamableFile> {
        // const file = fs.createReadStream(join(process.cwd(), 'package.json'));
        return recHit('Fac_Tena', "select archivo from archivo where id = '{F4ECC181-C24F-49A6-8AFA-18DE9F242F9E}' ").then((res) => {
            return new StreamableFile(res.recordset[0].archivo);
        })

    }
}
