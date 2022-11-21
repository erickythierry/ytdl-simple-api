import axios from "axios"


let myurl = null

export const getRandom = (ext) => { return `${Math.floor(Math.random() * 9876541)}${(ext || '')}` }

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