import { InsertManyResult } from "mongodb";
import { conexion } from "../conexion/mongodb";

// export async function getUsuario(uuid: string): Promise<any> {
//     const database = (await conexion).db('firebase');
//     const usuarios = database.collection('usuarios');
//     const resultado = await usuarios.findOne({ uuid });
//     return resultado;
// }
export async function getClientes() {
    const database = (await conexion).db('firebase');
    const usuarios = database.collection('clientes');
    const resultado = await usuarios.find({}).toArray();
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

// export async function insertarClientesEspeciales(arrayClientes) {
//     if (await borrarClientes()) {
//         const database = (await conexion).db('firebase');
//         const clientes = database.collection("clientes");
//         const resultado = await clientes.insertMany(arrayClientes);
        
//         return resultado;
//     } else {
//         const res: InsertManyResult<any> = {
//             acknowledged: false,
//             insertedCount: 0,
//             insertedIds: null
//         } 
//         return res;
//     }
// }

// export async function borrarClientes() {
//     try {
//         const database = (await conexion).db('tocgame');
//         const clientes = database.collection("clientes");
//         const resultado = await clientes.drop();
//         return resultado;
//     } catch(err) {
//         if (err.codeName == 'NamespaceNotFound') {
//             return true;
//         } else {
//             return false;
//         }
//     }
// }
