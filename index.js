import { createWriteStream, existsSync, readdir, statSync, unlinkSync } from 'fs';
import express from 'express';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { default as axios } from "axios";
import yts from 'yt-search';
import dotenv from 'dotenv'
import { spawn } from 'child_process';
import { PassThrough } from 'stream';
import serveIndex from 'serve-index';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config()
ffmpeg.setFfmpegPath(ffmpegPath)
const app = express();
const headerObj = { headers: { cookie: (process.env.COOKIE || '') } }
const getRandom = (ext) => { return `${Math.floor(Math.random() * 9876541)}${(ext || '')}` }
const pasta = './publico/'
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
async function buscar(texto) {
    const busca = await yts(texto)
    const videos = busca.videos.slice(0, 5)

    let lista = videos.map(video => {
        return {
            title: video.title,
            id: video.videoId,
            url: video.url,
            thumb: video.thumbnail,
            views: video.views,
            duration: {
                seconds: video.duration.seconds,
                time: video.duration.timestamp
            }
        }
    })
    return lista
}
async function getInfo(url) {
    try {
        let info = await ytdl.getInfo(url, { requestOptions: headerObj })

        return {
            'sucess': true,
            "title": info.videoDetails.title,
            "videoid": info.videoDetails.videoId,
            "thumb": info.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url,
            'duration': info.videoDetails.lengthSeconds,
            'likes': info.videoDetails.likes
        }

    } catch (error) {
        console.log('erro get info: \n', error);
        return { 'sucess': false, 'error': error.message }
    }
}
async function ytmixer(link,) {

    //const result = new stream.PassThrough({ highWaterMark: (options).highWaterMark || 1024 * 512 })
    const result = new PassThrough()
    try {
        let info = await ytdl.getInfo(link, headerObj)
        let videoQualityList = info.formats
            .filter(i => { // filtra apenas os formatos mp4 que sejam 720p ou 480p
                if (i.container == 'mp4') {
                    if (i.qualityLabel == '480p' || i.qualityLabel == '720p') return true //
                }
            })
            .map(i => { return { q: i.qualityLabel, itag: i.itag, audio: i.hasAudio } }) // reduz para apenas as propriedades qualityLabel e itag
            .sort((a, b) => { // organiza em sequencia as qualidades para que 720p fique sempre em primeiro
                if (parseInt(a.q) > parseInt(b.q)) return -1
                return 1
            }).sort((a, b) => {
                if (a.audio == true) return -1;
                return 1
            })
        // faz o retorno apenas do video caso o mesmo já apresente audio embutido
        if (videoQualityList[0].audio) {
            console.log('ja possui audio no video')
            return ytdl.downloadFromInfo(info, { ...headerObj, quality: videoQualityList[0].itag });
        }

        let audioQualityList = info.formats
            .filter(i => {
                if (i.audioCodec == 'mp4a.40.2') {
                    if (i.audioBitrate >= 128) return true
                }
            })
            .map(i => { return { bitrate: i.audioBitrate, itag: i.itag } })
            .sort((a, b) => {
                if (a.bitrate > b.bitrate) return -1
                return 1
            })

        let audioStream = ytdl.downloadFromInfo(info, { ...headerObj, quality: audioQualityList[0].itag })
        let videoStream = ytdl.downloadFromInfo(info, { ...headerObj, quality: videoQualityList[0].itag });
        // create the ffmpeg process for muxing
        let ffmpegProcess = spawn(ffmpegPath, [
            // supress non-crucial messages
            '-loglevel', '8', '-hide_banner',
            // input audio and video by pipe
            '-i', 'pipe:3', '-i', 'pipe:4',
            // map audio and video correspondingly
            '-map', '0:a', '-map', '1:v',
            // no need to change the codec
            '-c', 'copy',
            // output mp4 and pipe
            '-f', 'matroska', 'pipe:5'
        ], {
            // no popup window for Windows users
            windowsHide: true,
            stdio: [
                // silence stdin/out, forward stderr,
                'inherit', 'inherit', 'inherit',
                // and pipe audio, video, output
                'pipe', 'pipe', 'pipe'
            ]
        });
        audioStream.pipe(ffmpegProcess.stdio[3]);
        videoStream.pipe(ffmpegProcess.stdio[4]);
        ffmpegProcess.stdio[5].pipe(result);

        return result;

    } catch (error) {
        console.log(error.message)
    }
}
async function delOldFiles(req, res, next) {

    readdir(pasta, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach(function (file) {
            file = (pasta + file)
            if (file.includes('.mp3') || file.includes('.mp4')) {
                let stats = statSync(file);
                let modificado = new Date(stats.ctime).getTime()
                let agora = new Date().getTime();
                let data = (agora - modificado) / 1000
                if (data > 600) {
                    console.log('apagando', file)
                    unlinkSync(file)
                }
            }

        });
    });

    if (req) next()
}
function validateUrlRouter(req, res, next) {
    let urlvideo = req.query.url
    if (!ytdl.validateURL(urlvideo)) return res.json({ 'sucess': false, "error": 'sem url ou URL inválida' });
    next()
}