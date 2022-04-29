const sql = require("mssql");
import { PASSWORD_SERVER, URL_SERVER, USER_SERVER } from '../secrets';

function recHit(database, consultaSQL): Promise<any> {
    const config = {
        user: USER_SERVER,
        password: PASSWORD_SERVER,
        server: URL_SERVER,
        database: database,
        requestTimeout: 300000
    };

    const devolver = new Promise((dev, rej) => {
        new sql.ConnectionPool(config).connect().then((pool) => {
            return pool.request().query(consultaSQL);
        }).then(result => {
            dev(result);
            sql.close();
        }).catch(err => {
            console.log(err);
            console.log("SQL: ", consultaSQL)
            sql.close();
        });
    });
    return devolver;
}
export { recHit };
