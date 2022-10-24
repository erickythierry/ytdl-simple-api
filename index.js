const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { default: axios } = require("axios")
const yts = require('yt-search')
require('dotenv').config()
const cp = require('child_process');
const stream = require('stream');

ffmpeg.setFfmpegPath(ffmpegPath)
const app = express();
var serveIndex = require('serve-index');
const headerObj = { headers: { cookie: (process.env.COOKIE || '') } }
const getRandom = (ext) => { return `${Math.floor(Math.random() * 10000)}${ext}` }
const pasta = './publico/'


const myhost = async (req) => {
    // checa se o site suporta https
    myurl = req.headers.host
    try {
        await axios(('https://' + myurl));
        return ('https://' + req.headers.host);
    } catch (error) {
        return ('http://' + req.headers.host);
    }
}
const porta = process.env.PORT || 3000

app.set('json spaces', 4)
app.use(express.static(__dirname + "/"))
app.use('/publico', serveIndex((__dirname + '/publico'), { 'icons': true, 'template': (__dirname + '/static/arquivos.html') }));

app.listen(porta, function () {
    console.log("Listening on port ", porta)
    if (porta == 3000) { console.log('rodando localmente em http://localhost:3000') }
});
app.get('/url', async function (req, res) {
    delOldFiles()
    res.send(('url base do site: ' + await myhost(req)))
})
app.get('/', function (req, res) {
    delOldFiles()
    res.sendFile((__dirname + '/static/home.html'))
})
app.get('/audio', async function (req, res) {
    delOldFiles()
    urlvideo = req.query.url
    console.log('audio ', urlvideo)

    // checa se a url é valida
    if (!ytdl.validateURL(urlvideo)) return res.json({ 'sucess': false, "error": 'sem url ou URL inválida' });

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
app.get('/video', async function (req, res) {
    delOldFiles()
    let urlvideo = req.query.url
    let bestQuality = req.query.best

    console.log('video ', urlvideo, 'best', bestQuality)

    if (!ytdl.validateURL(urlvideo)) return res.json({ 'sucess': false, "error": 'sem url ou URL inválida' });

    try {
        let video = await ytmixer(urlvideo)
        if (!video) return res.json({ 'sucess': false, "error": 'erro ao processar o download' });
        let caminho = `${__dirname}/publico/`
        let nomearquivo = `video_${getRandom('.mp4')}`
        let arquivo = fs.createWriteStream((caminho + nomearquivo))
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
app.get('/arquivo', function (req, res) {
    delOldFiles()
    nomearquivo = req.query.arquivo
    caminho = `${__dirname}/publico/${nomearquivo}`

    console.log('baixando arquivo ', nomearquivo)

    if (!nomearquivo || !fs.existsSync(caminho)) return res.json({ 'sucess': false, "error": 'sem url' });

    res.download(caminho)
})
app.get('/info', async function (req, res) {
    delOldFiles()
    link = req.query.url
    console.log('get info ', link)
    if (!ytdl.validateURL(link)) return res.json({ 'sucess': false, "error": 'sem url ou URL inválida' });

    data = await getInfo(link)
    return res.json(data)
})
app.get('/buscar', async function (req, res) {
    delOldFiles()
    let busca = req.query.text
    console.log('get buscar ', busca)
    if (!busca?.length) return res.json({ 'sucess': false, "error": 'termo ou frase de busca nao fornecido' });

    data = await buscar(busca)
    return res.json({ sucess: true, data: data })
})
async function buscar(texto) {
    const busca = await yts(texto)
    const videos = busca.videos.slice(0, 5)
    let lista = []
    videos.forEach(video => {
        lista.push({
            title: video.title,
            id: video.videoId,
            url: video.url,
            thumb: video.thumbnail,
            views: video.views,
            duration: {
                seconds: video.duration.seconds,
                time: video.duration.timestamp
            }
        })
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
async function ytmixer(link, options = {}) {

    //const result = new stream.PassThrough({ highWaterMark: (options).highWaterMark || 1024 * 512 })
    const result = new stream.PassThrough()
    try {
        let info = await ytdl.getInfo(link, options)
        let audioStream = ytdl.downloadFromInfo(info, { ...options, ...headerObj, quality: 'highestaudio' })
        let videoStream = ytdl.downloadFromInfo(info, { ...options, ...headerObj, quality: 'highestvideo' });
        // create the ffmpeg process for muxing
        let ffmpegProcess = cp.spawn(ffmpegPath, [
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
async function delOldFiles() {

    fs.readdir(pasta, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach(function (file) {
            file = (pasta + file)
            if (file.includes('.mp3') || file.includes('.mp4')) {
                let stats = fs.statSync(file);
                let modificado = new Date(stats.ctime).getTime()
                let agora = new Date().getTime();
                let data = (agora - modificado) / 1000
                if (data > 600) {
                    console.log('apagando', file)
                    fs.unlinkSync(file)
                }
            }

        });
    });
}