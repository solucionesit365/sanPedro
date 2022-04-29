export interface CajaInterface {
    _id: string, //siempre es 'CAJA'
    inicioTime: number,
    finalTime: number,
    idDependienta: number,
    totalApertura: number,
    totalCierre: number,
    descuadre: number,
    recaudado: number,
    nClientes: number,
    primerTicket: number,
    infoExtra: {
        cambioInicial: number,
        cambioFinal: number,
        totalSalidas: number,
        totalEntradas: number,
        totalEnEfectivo: number,
        totalTarjeta: number,
        totalDeuda: number
    },
    ultimoTicket: number,
    calaixFetZ: number,
    detalleApertura: {
        _id: string,
        valor: number,
        unidades: number
    }[],
    detalleCierre: {
        _id: string,
        valor: number,
        unidades: number
    }[],
    enviado: boolean,
    enTransito: boolean,
    totalDatafono3G: number,
    totalClearOne: number,
    comentario?: string
}

export interface CajaForSincroInterface {
    _id: number,
    inicioTime: number,
    finalTime: number,
    idDependienta: number,
    totalApertura: number,
    totalCierre: number,
    descuadre: number,
    recaudado: number,
    nClientes: number,
    primerTicket: number,
    infoExtra: {
        cambioInicial: number,
        cambioFinal: number,
        totalSalidas: number,
        totalEntradas: number,
        totalEnEfectivo: number,
        totalTarjeta: number,
        totalDeuda: number
    },
    ultimoTicket: number,
    calaixFetZ: number,
    detalleApertura: {
        _id: string,
        valor: number,
        unidades: number
    }[],
    detalleCierre: {
        _id: string,
        valor: number,
        unidades: number
    }[],
    enviado: boolean,
    enTransito: boolean,
    totalDatafono3G: number,
    totalClearOne: number,
    comentario?: string
}

export const cajaVacia: CajaInterface = {
    _id: "CAJA",
    inicioTime: null,
    finalTime: null,
    idDependienta: null,
    totalApertura: null,
    totalCierre: null,
    calaixFetZ: null,
    descuadre: null,
    infoExtra: {
        cambioInicial: null,
        cambioFinal: null,
        totalSalidas: null,
        totalEntradas: null,
        totalEnEfectivo: null,
        totalTarjeta: null,
        totalDeuda: null
    },
    primerTicket: null,
    ultimoTicket: null,
    recaudado: null,
    nClientes: null,
    detalleApertura: [],
    detalleCierre: [],
    enviado: false,
    enTransito: false,
    totalDatafono3G: null,
    totalClearOne: null
};