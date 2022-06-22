import { InsertManyResult, ObjectId } from "mongodb";
import { conexion } from "../conexion/mongodb";
import { SolicitudVacaciones } from './app-firebase.interfaces';

export async function getUsuario(uuid: string): Promise<any> {
    const database = (await conexion).db('firebase');
    const usuarios = database.collection('usuarios');
    const resultado = await usuarios.findOne({ uuid: uuid });
    return resultado;
}

export async function insertarUsuarioNuevo(uuid: string, email: string, nivelAcceso: number, tipoUsuario: string, bbdd: string, dni: string) {
    const database = (await conexion).db('firebase');
    const usuarios = database.collection('usuarios');
    /* email es un índice de tipo unique text */
    const resultado = await usuarios.insertOne({ 
        uuid: uuid,
        email,
        nivelAcceso,
        tipoUsuario,
        database: bbdd,
        dni
    });
    return resultado;
}

export async function insertarBajaLaboral(uuid: string, bbdd: string, fechaInicio: number, fechaFinal: number, observaciones: string, archivo: string) {
    const database = (await conexion).db(bbdd);
    const bajas = database.collection('bajas');
    const resultado = await bajas.insertOne({ 
        uuid,
        fechaInicio,
        fechaFinal,
        archivo,
        observaciones
    });
    return resultado;
}

export async function nuevaSolicitudVacaciones(solicitudVacaciones: SolicitudVacaciones, bbdd: string) {
    const database = (await conexion).db(bbdd);
    const vacaciones = database.collection('vacaciones');

    const resultado = await vacaciones.insertOne({
        uuid: solicitudVacaciones.uuid,
        fechaInicio: solicitudVacaciones.fechaInicio,
        fechaFinal: solicitudVacaciones.fechaFinal,
        observaciones: solicitudVacaciones.observaciones,
        estado: solicitudVacaciones.estado,
        displayName: solicitudVacaciones.displayName
    });
    return resultado;
}

export async function getSolicitudesVacaciones(bbdd: string) {
    const database = (await conexion).db(bbdd);
    const vacaciones = database.collection('vacaciones');

    const resultado = await vacaciones.find({}).toArray();
    return resultado;
}

export async function getBajasLaborales(bbdd: string) {
    const database = (await conexion).db(bbdd);
    const bajas = database.collection('bajas');
    const resultado = await bajas.find({}).toArray();
    
    return resultado;
}

export async function setEstadoVacaciones(estado: 'APROBADA' | 'PENDIENTE' | 'RECHAZADA', bbdd: string, idPeticionVacaciones: string) {
    const database = (await conexion).db(bbdd);
    const vacaciones = database.collection('vacaciones');

    const resultado = await vacaciones.updateOne({ _id: new ObjectId(idPeticionVacaciones)}, { $set: { estado: estado }});

    return resultado;
}

// export async function getCestaByTrabajadorID(idTrabajador: number) {
//     const database = (await conexion).db('tocgame');
//     const cesta = database.collection('cestas');
//     let resultado = await cesta.findOne({idTrabajador: idTrabajador});
//     return resultado;
// }

// export async function eliminarCesta(nombre: string) {
//     const database = (await conexion).db('tocgame');
//     const cesta = database.collection('cestas');
//     const resultado = await cesta.deleteMany({ _id: nombre.toString() });
//     return resultado;
// }

export async function insertarClientesEspeciales(databaseString: string, arrayClientes) {
    if (await borrarClientes(databaseString)) {
        const db = (await conexion).db(databaseString);
        const clientes = db.collection("clientes");
        const resultado = await clientes.insertMany(arrayClientes);
        
        return resultado;
    } else {
        const res: InsertManyResult<any> = {
            acknowledged: false,
            insertedCount: 0,
            insertedIds: null
        } 
        return res;
    }
}

export async function borrarClientes(databaseString: string) {
    try {
        const database = (await conexion).db(databaseString);
        const clientes = database.collection("clientes");
        const resultado = await clientes.drop();
        return resultado;
    } catch(err) {
        if (err.codeName == 'NamespaceNotFound') {
            return true;
        } else {
            return false;
        }
    }
}
