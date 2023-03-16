import axios from "axios"
import crypto from 'crypto'

let myurl = null

export const getRandom = (ext) => { return `${crypto.randomUUID().split('-').slice(-1) + (ext ?? '')}` }

export async function myhost(req) {
    if (myurl) return myurl;
    // checa se o site suporta https
    try {
        await axios(('https://' + req.headers.host));
        myurl = 'https://' + req.headers.host
    } catch (error) {
        myurl = 'http://' + req.headers.host
    }
    return myurl
}