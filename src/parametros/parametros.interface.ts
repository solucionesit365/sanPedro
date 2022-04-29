export interface ParametrosInterface {
    _id: string,
    codigoTienda: number,
    database: string,
    licencia: number,
    nombreEmpresa: string,
    nombreTienda: string,
    tipoDatafono: string,
    tipoImpresora: string,
    impresoraCafeteria: string,
    clearOneCliente?: number,
    clearOneTienda?: number,
    clearOneTpv?: number,
    botonesConPrecios: string,
    prohibirBuscarArticulos: string,
    ultimoTicket: number,
    idCurrentTrabajador: number,
    token: string
}
