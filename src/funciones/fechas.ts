import { Moment } from "moment";

/* Devuelve una fecha en string para construir esto: 01/05/1994 01:53:40 */
export function fechaParaSqlServer(fecha: Date) {
    let year = `${fecha.getFullYear()}`;
    let month = `${fecha.getMonth() + 1}`;
    let day = `${fecha.getDate()}`;
    let hours = `${fecha.getHours()}`;
    let minutes = `${fecha.getMinutes()}`;
    let seconds = `${fecha.getSeconds()}`;

    if (month.length === 1) {
        month = '0' + month;
    }

    if (day.length === 1) {
        day = '0' + day;
    }

    if (hours.length === 1) {
        hours = '0' + hours;
    }

    if (minutes.length === 1) {
        minutes = '0' + minutes;
    }

    if (seconds.length === 1) {
        seconds = '0' + seconds;
    }

    return { year, month, day, hours, minutes, seconds };
}
export function fechaParaSqlServerMoment(fecha: Moment) {
    let year = `${fecha.year()}`;
    let month = `${fecha.month() + 1}`;
    let day = `${fecha.date()}`;
    let hours = `${fecha.hours()}`;
    let minutes = `${fecha.minutes()}`;
    let seconds = `${fecha.seconds()}`;

    if (month.length === 1) {
        month = '0' + month;
    }

    if (day.length === 1) {
        day = '0' + day;
    }

    if (hours.length === 1) {
        hours = '0' + hours;
    }

    if (minutes.length === 1) {
        minutes = '0' + minutes;
    }

    if (seconds.length === 1) {
        seconds = '0' + seconds;
    }

    return { year, month, day, hours, minutes, seconds };
}

export function tablasEntregas(loop: number) {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - loop);
    const year = fecha.getFullYear();
    let month = `${fecha.getMonth() + 1}`;
    if(month.length < 2) month = `0${month}`;
    // V_Moviments_2022-03 -> tabla
    // V_Moviments_2022-03_Estat -> tablaEstat
    return {
        tabla_moviments: `[V_Moviments_${year}-${month}]`,
        tabla_moviments_estat: `[V_Moviments_${year}-${month}_Estat]`,
    }
}