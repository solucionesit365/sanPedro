export interface TicketsInterface {
    _id: number,
    timestamp: number,
    total: number,
    lista: {
        _id: number,
        nombre: string,
        promocion: {
            _id: string,
            esPromo: boolean,
            infoPromo?: {
                idPrincipal: number,
                cantidadPrincipal: number,
                idSecundario: number,
                cantidadSecundario: number,
                precioRealPrincipal: number,
                precioRealSecundario: number,
                unidadesOferta: number,
                tipoPromo: string
            }
        },
        subtotal: number,
        unidades: number,
        suplementosId?: []
    }[],
    tipoPago: string,
    idTrabajador: number,
    tiposIva: {
        base1: number,
        base2: number,
        base3: number,
        valorIva1: number,
        valorIva2: number,
        valorIva3: number,
        importe1: number,
        importe2: number,
        importe3: number
    },
    enviado: boolean,
    enTransito: boolean,
    intentos: number,
    comentario: string,
    cliente?: string,
    infoClienteVip?: {
        esVip: boolean,
        nif: string,
        nombre: string,
        cp: string,
        direccion: string,
        ciudad: string
    },
    cantidadTkrs?: number,
    regalo?: boolean,
    anulado: boolean
}