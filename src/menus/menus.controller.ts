import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { menusInstance } from './menus.class';

@Controller('menus')
export class MenusController {
    @Post('getMenus')
    getMenus(@Body() params) {
        if (params != undefined && params != null) {
            if (params.database != null && params.database != undefined && params.codigoTienda != null && params.codigoTienda != undefined) {
                return menusInstance.getMenus(params.database, params.codigoTienda).then((res) => {
                    return { error: false, info: res };
                }).catch((err) => {
                    console.log(err);
                    return { error: true, mensaje: 'SanPedro: Error menus/getMenus CATCH' };
                })
            } else {
                return { error: true, mensaje: 'SanPedro: faltan algunos datos menus/getMenus' };
            }
        } else {
            return { error: true, mensaje: 'SanPedro: faltan todos los datos menus/getMenus' };
        }
    }
    @Post('getDobleMenu')
    getDobleMenu(@Body() params) {
        if (params != undefined && params != null) {
            if (params.database != null && params.database != undefined && params.codigoTienda != null && params.codigoTienda != undefined) {
                return menusInstance.getDobleMenus(params.database, params.codigoTienda)
            } else {
                return { error: true, mensaje: 'SanPedro: faltan algunos datos menus/getMenus' };
            }
        } else {
            return { error: true, mensaje: 'SanPedro: faltan todos los datos menus/getMenus' };
        }
    }
}
