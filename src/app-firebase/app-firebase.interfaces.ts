import { ObjectId } from "mongodb";

export interface Devolver {
    error: boolean,
    info?: any,
    mensaje?: string
}

export interface UsuarioInterface {
    _id: ObjectId,
    uuid: string,
    email: string,
    nivelAcceso: number,
    tipoUsuario: 'TPV' | 'TIENDA' | 'RRHH' | 'SUPER_ADMIN'
    database: string,
    dni: string
}

export interface TrabajadorFichajes {
    tmst: string,
    idTrabajador: number,
    nombre: string,
    idTienda: number,
    horasExtra: number,
    horasCoordinacion: number,
    horasTotales: number
}

export interface SolicitudVacaciones {
    uuid: string,
    fechaInicio: number,
    fechaFinal: number,
    observaciones: string,
    estado: 'APROBADA' | 'PENDIENTE' | 'RECHAZADA',
    displayName: string
}