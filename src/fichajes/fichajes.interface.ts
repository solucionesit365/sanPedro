export interface FichajeInterface {
    _id: number,
    infoFichaje: {
        idTrabajador: number,
        fecha: {
            year: number,
            month: number,
            day: number,
            hours: number,
            minutes: number,
            seconds: number
        }
    },
    tipo: "ENTRADA" | "SALIDA",
    enviado: boolean,
    enTransito: boolean,
    intentos: number,
    comentario: string,
    idPlan: string
}