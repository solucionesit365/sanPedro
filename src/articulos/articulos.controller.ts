import { Controller, Post, Body } from '@nestjs/common';
import { UtilesModule } from 'src/utiles/utiles.module';
import { articulosInstance } from './articulos.class';

@Controller('articulos')
export class ArticulosController {
    @Post('descargarArticulosEspeciales')
    async descargarArticulosEspeciales(@Body() params) {
        if (params.database != undefined && params.codigoCliente != undefined) {
            try {
                const articulos = await articulosInstance.getArticulos(params.database);
                const tarifaEspecial = await articulosInstance.getTarifaEspecial(params.database, params.codigoCliente);                
                return { error: false, info: articulosInstance.fusionarArticulosConTarifasEspeciales(articulos, tarifaEspecial) };            
            } catch(err) {
                console.log(err);
                return { error: true, mensaje: 'SanPedro: Error en CATCH articulos/descargarArticulosEspeciales' };
            }
        } else {
            return { error: true, mensaje: 'SanPedro: Error, faltan datos en articulos/descargarArticulosEspeciales' };
        }
    }

    /* Solo se utiliza para la app silema */
    @Post('buscarArticulos')
    getArticulos(@Body() params) {
        if (UtilesModule.checkVariable(params.database, params.busqueda)) {
            return articulosInstance.buscarArticulos(params.database, params.busqueda).then((res) => {
                return { error: false, info: res };
            }).catch((err) => {
                console.log(err);
                return { error: true, mensaje: 'Error backend: articulos/getArticulos => CATCH' };
            })
        } else {
            return { error: true, mensaje: 'Error backend: Faltan datos en la petición' };
        }
    }
}
