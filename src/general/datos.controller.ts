import { Controller, Post, Body } from '@nestjs/common';
import { menusInstance } from '../menus/menus.class';
import { articulosInstance } from '../articulos/articulos.class';
import { generalInstance } from './general.class';
import { teclasInstance } from '../teclas/teclas.class';
import { dependientasInstance } from '../dependientas/dependientas.class';
import { familiasInstance } from '../familias/familias.class';
import { promocionesInstance } from '../promociones/promociones.class';
import { infoTicketInstance } from '../info-ticket/info-ticket.class';
import { clientesInstance } from '../clientes/clientes.class';
import { cestasInstance } from 'src/cestas/cestas.class';

@Controller('datos')
export class DatosController {
    @Post('test')
    test(@Body() params) {
        generalInstance.getCodigoTiendaFromLicencia('Fac_Tena', 842).then((res) => {
            console.log(res);
        });
    }
    @Post('cargarTodo')
    async cargarTodo(@Body() data) {
        if (data.database != undefined && data.codigoTienda != undefined && data.licencia != undefined) {
            const database = data.database;
            const licencia = data.licencia;
            const codigoTienda = data.codigoTienda;

            try {
                let articulosAux = await articulosInstance.getArticulos(database);
                let tarifasEspeciales = await articulosInstance.getTarifaEspecial(database, codigoTienda);
                const articulos = articulosInstance.fusionarArticulosConTarifasEspeciales(articulosAux, tarifasEspeciales);
                const menus = await menusInstance.getMenus(database, codigoTienda);
                const teclas = await teclasInstance.getTeclas(database, licencia);
                const dependientas = await dependientasInstance.getDependientas(database);
                const familias = await familiasInstance.getFamilias(database);
                const promociones = await promocionesInstance.getPromociones(database, codigoTienda);
                const parametrosTicket = await infoTicketInstance.getInfoTicket(database, codigoTienda);
                const clientes = await clientesInstance.getClientes(database);
                const cestas = await cestasInstance.getCestas(database, codigoTienda);
                const dobleMenus = await menusInstance.getDobleMenus(database, codigoTienda);

                return {
                    error: false,
                    info: {
                        articulos,
                        menus,
                        teclas,
                        dependientas,
                        familias,
                        promociones,
                        parametrosTicket,
                        clientes,
                        cestas,
                        dobleMenus,
                    }
                };
            } catch (err) {
                console.log(err);
                return { error: true, mensaje: 'SanPedro: TryCatch datos/cargarTodo: mirar log' };
            }

        } else {
            return { error: true, mensaje: 'SanPedro: Faltan datos en datos/cargarTodo' };
        }
    }
}
