import axios from "axios";
const API_ORDATIC = "https://public-api.qa.ordatic.com/";

class OrdaticClass {
    private token: string;

    constructor() {
        axios.post('https://public-api.qa.ordatic.com/v2/auth', {
            appId: "993ed2ea-7473-4ea1-993a-834b631c2119",
            appSecret: "530a9da32e6b0d219be9b5a7b9147b90"
        }).then((res: any) => {
            this.token = res.data.token;
        }).catch((err) => {
            console.log(err.message);
            this.token = null;
        })
    }
    // generateToken(): Promise<any> {
    //     return axios.post(API_ORDATIC, {
    //         appId: "993ed2ea-7473-4ea1-993a-834b631c2119",
    //         appSecret: "530a9da32e6b0d219be9b5a7b9147b90"
    //     }).then((res) => {
    //         return res.data;
    //     }).catch((err) => {
    //         console.log(err.message);
    //         return null;
    //     })
    // }

    getConfig() {
        return {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        }
    }

    async getApp() {
        const config = {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        }
        console.log(config);

        return axios.get('https://public-api.qa.ordatic.com/v2/stores', this.getConfig()).then((res) => {
            console.log(res.data);
            return res.data;
        }).catch((err) => {
            console.log(err.message);
            return null;
        });
    }

    getCatalogo(idTienda: string) {
        return axios.get(`https://public-api.qa.ordatic.com/v2/stores/${idTienda}/catalogs`, this.getConfig()).then((res) => {
            return { error: false, info: res.data };
        }).catch((err) => {
            console.log(err);
            return { error: true, mensaje: 'SanPedro: Error en ordatic > getCatalogo() CATCH' }
        })
    }
}

export const ordatic = new OrdaticClass();
