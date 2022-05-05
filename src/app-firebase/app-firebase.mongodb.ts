import { InsertManyResult } from "mongodb";
import { conexion } from "../conexion/mongodb";

export async function getUsuario(uuid: string): Promise<any> {
    const database = (await conexion).db('firebase');
    const usuarios = database.collection('usuarios');
    const resultado = await usuarios.findOne({ _id: uuid });
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
