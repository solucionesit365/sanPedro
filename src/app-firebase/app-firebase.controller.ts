import { Body, Controller, Get, Post } from '@nestjs/common';
import { clientesInstance } from '../clientes/clientes.class';
import { UtilesModule } from '../utiles/utiles.module';
import { AppClass } from './app.class';

@Controller('app-firebase')
export class AppFirebaseController {
    @Post('actualizarListaClientes')
    async actualizarListaClientes(@Body() params) {
        const nivelAccesoRequerido = ["ADMIN_TPV", "SUPER_ADMIN"];
        if (UtilesModule.checkVariable(params.token)) {
            if (typeof params.token === "string") {
                const firebaseAppInstance = new AppClass();
                try {
                    const resComprobacion: any = await firebaseAppInstance.comprobarToken(params.token);
                    const resPermiso = await firebaseAppInstance.permisosUsuario(resComprobacion.info.uid, nivelAccesoRequerido);
                    if (resPermiso.error === false) {
                        if (resComprobacion.error === false) {
                            return clientesInstance.getClientesEspeciales("Fac_Tena", "").then((resClientes: any) => {
                                if (resClientes.error === false) {
                                    return firebaseAppInstance.actualizarClientesEspeciales(resPermiso.infoUsuario.database, resClientes.info).then((res) => {
                                        if (res) {
                                            return { error: false };
                                        } else {
                                            return {  error: true, mensaje: "SanPedro: Error en firebaseAppInstance.actualizarClientesEspeciales()" };
                                        }
                                    }).catch((err) => {
                                        return { error: true, mensaje: "SanPedro: " + err.message };
                                    });
                                } else {
                                    return { error: true, mensaje: resClientes.mensaje };
                                }                            
                            }).catch((err) => {
                                return { error: true, mensaje: "SanPedro: " + err.message };
                            });
                            // return { error: false, info: resComprobacion };
                        } else {
                            return { error: true, mensaje: "SanPedro: Token incorrecto (1)" };
                        }
                    } else {
                        return { error: true, mensaje: resPermiso.mensaje };
                    }
                } catch(err) {
                    return { error: true, mensaje: "SanPedro: " + err.message };
                }
            } else {
                return { error: true, mensaje: "SanPedro: Token incorrecto (2)" };
            }
        } else {
            return { error: true, mensaje: "SanPedro: Falta información (token)" };
        }

        /* Los params son para pasar los tokens de autentificación */
        // clientesInstance.getClientesEspeciales("Fac_Tena", "").then((resClientes) => {

        // }).catch((err) => {
        //     return { error: true, mensaje: err.message };
        // });

    }

    @Post('getClientesEspeciales')
    getClientes(@Body() params) {
        if (UtilesModule.checkVariable(params.token, params.busqueda)) {
            return clientesInstance.getClientesEspecialesMongo();
        } else {
            return { error: true, mensaje: 'Error backend: Faltan los parámetros'};
        }
    }

    @Post('getArrayPermisosCrear')
    getArrayPermisosCrear(@Body() params) {
        if (UtilesModule.checkVariable(params.token)) {
            const firebaseAppInstance = new AppClass();
            return firebaseAppInstance.getArrayPermisosCrear(params.token);
        } else {
            return { error: true, mensaje: 'Error backend: Faltan los parámetros'};
        }
    }

    @Post('registroUsuario')
    registroUsuario(@Body() params) {
        if (UtilesModule.checkVariable(params.token)) {
            const firebaseAppInstance = new AppClass();
            return firebaseAppInstance.crearUsuario(params.email, params.phoneNumber, params.password, params.displayName, params.nivelAcceso, params.token);
        }
        return { error: true, mensaje: 'San Pedro: Error, faltan datos en la petición' };
    }

    @Post('getInfoUsuarios')
    getInfoUsuario(@Body() params) {
        if (UtilesModule.checkVariable(params.token)) {
            const firebaseAppInstance = new AppClass();
            return firebaseAppInstance.getInfoUsuario(params.token).then((res) => {
                return res;
            }).catch((err) => {
                return { error: true, mensaje: 'San Pedro: ' + err.message };
            });
        }
        return { error: true, mensaje: 'San Pedro: Error, faltan datos en la petición' };
    }

    @Post('getTiendas')
    getTiendas(@Body() params) {
        if (UtilesModule.checkVariable(params.token)) {
            const firebaseAppInstance = new AppClass();
            return firebaseAppInstance.getTiendas(params.token).then((res) => {
                return res;
            }).catch((err) => {
                return { error: true, mensaje: 'San Pedro: ' + err.message };
            });
        }
        return { error: true, mensaje: 'San Pedro: Error, faltan datos en la petición' };
    }

    @Post('getTrabajaronAyer')
    getTrabajaronAyer(@Body() params) {
        if (UtilesModule.checkVariable(params.idToken, params.idTienda)) {
            const firebaseAppInstance = new AppClass();
            return firebaseAppInstance.getTrabajaronAyer(params.idToken, params.idTienda).then((res) => {
                return res;
            }).catch((err) => {
                return { error: true, mensaje: 'San Pedro: ' + err.message };
            });
        }
        return { error: true, mensaje: 'San Pedro: Error, faltan datos en la petición' };
    }
}
