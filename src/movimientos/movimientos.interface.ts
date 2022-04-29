export interface MovimientosInterface {
    _id: number,
    tipo: string,
    valor: number,
    concepto: string,
    idTrabajador: number,
    tipoExtra: string,
    codigoBarras: string,
    idTicket: number,
    enviado: boolean,
    enTransito: boolean,
    comentario: string,
    intentos: number
}
