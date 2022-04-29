import { Body, Controller, Post } from '@nestjs/common';
import { logger } from '../logger/logger.class';

@Controller('test')
export class TestController {
    @Post('test')
    async test(@Body() params) {
        
        const tienda = 91;
        const lol = "dsfaffdsdsaa"
        logger.Info(tienda, lol);
        // logger.Error('wow');
        return 69;
    }
}
