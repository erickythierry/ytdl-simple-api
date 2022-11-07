import { createWriteStream, existsSync, readdir, statSync, unlinkSync } from 'fs';
import express from 'express';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { default as axios } from "axios";
import dotenv from 'dotenv'
import serveIndex from 'serve-index';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

import { __filename, __dirname } from './src/dirname.js';
import { validateUrlRouter, delOldFiles } from './src/middlewares.js'
import {} from "./src/youtube.js"

dotenv.config()
ffmpeg.setFfmpegPath(ffmpegPath)
const app = express();
const headerObj = { headers: { cookie: (process.env.COOKIE || '') } }
const getRandom = (ext) => { return `${Math.floor(Math.random() * 9876541)}${(ext || '')}` }
const porta = process.env.PORT || 3000
let myurl = null

app.set('json spaces', 4)
app.use(express.static(__dirname + "/"))
app.use('/publico', serveIndex((__dirname + '/publico'), { 'icons': true, 'template': (__dirname + '/static/arquivos.html') }));

app.listen(porta, function () {
    console.log("Listening on port ", porta)
    if (porta == 3000) { console.log('rodando localmente em http://localhost:3000') }
});
app.get('/url', delOldFiles, async function (req, res) {
    res.send(('url base do site: ' + await myhost(req)))
})
app.get('/', delOldFiles, function (req, res) {
    res.sendFile((__dirname + '/static/home.html'))
})
app.get('/audio', delOldFiles, validateUrlRouter, async function (req, res) {
    let urlvideo = req.query.url
    console.log('audio ', urlvideo)

    try {
        let video = ytdl(urlvideo, { quality: 'highestaudio', requestOptions: headerObj })


        let videoinfo = await getInfo(urlvideo)
        let nomearquivo = videoinfo.videoid ? ('audio_' + videoinfo.videoid) : ('audio_' + getRandom(''))

        video.on('error', err => {
            console.log('erro em: ', err);
            return res.json({ 'sucess': false, "error": err.message });
        });

        ffmpeg(video)
            .audioCodec('libmp3lame')
            .save(`${__dirname}/publico/${nomearquivo}.mp3`)
            .on('end', () => {
                myhost(req)
                    .then(url => {
                        res.json({ 'sucess': true, 'file': `${url}/arquivo/?arquivo=${nomearquivo}.mp3` });
                    })
            })
            .on('error', function (err) {
                res.json({ 'sucess': false, "error": err.message });
            });


    } catch (e) {
        console.log('erro ', e)
        res.json({ 'sucess': false, "error": e.message });
    }
});
app.get('/video', delOldFiles, validateUrlRouter, async function (req, res) {
    let urlvideo = req.query.url
    let bestQuality = req.query.best

    console.log('video ', urlvideo, 'best', bestQuality)

    if (!ytdl.validateURL(urlvideo)) return res.json({ 'sucess': false, "error": 'sem url ou URL inválida' });

    try {
        let video = await ytmixer(urlvideo)
        if (!video) return res.json({ 'sucess': false, "error": 'erro ao processar o download' });
        let caminho = `${__dirname}/publico/`
        let nomearquivo = `video_${getRandom('.mp4')}`
        let arquivo = createWriteStream((caminho + nomearquivo))
        video.pipe(arquivo)

        await new Promise((res) => {
            arquivo.on("finish", () => {
                res()
            })

            arquivo.on("error", () => res.json({ 'sucess': false, "error": 'convertion error' }))
        })
        let url = await myhost(req)
        console.log(url)
        return res.json({ 'sucess': true, "file": `${url}/arquivo/?arquivo=${nomearquivo}` });

    } catch (e) {
        console.log('erro ', e)
        return res.json({ 'sucess': false, "error": e.message });
    }
});
app.get('/arquivo', delOldFiles, function (req, res) {
    let nomearquivo = req.query.arquivo
    let caminho = `${__dirname}/publico/${nomearquivo}`

    console.log('baixando arquivo ', nomearquivo)

    if (!nomearquivo || !existsSync(caminho)) return res.json({ 'sucess': false, "error": 'sem url' });

    res.download(caminho)
})
app.get('/info', delOldFiles, async function (req, res) {
    let link = req.query.url
    console.log('get info ', link)
    if (!ytdl.validateURL(link)) return res.json({ 'sucess': false, "error": 'sem url ou URL inválida' });

    let data = await getInfo(link)
    return res.json(data)
})
app.get('/buscar', delOldFiles, async function (req, res) {
    delOldFiles()
    let busca = req.query.text
    console.log('get buscar ', busca)
    if (!busca?.length) return res.json({ 'sucess': false, "error": 'termo ou frase de busca nao fornecido' });

    let data = await buscar(busca)
    return res.json({ sucess: true, data: data })
})

async function myhost(req) {
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


