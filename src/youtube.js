import { spawn } from 'child_process';
import { PassThrough } from 'stream';
import ytdl from 'ytdl-core';
import yts from 'yt-search';

async function ytmixer(link) {

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

async function getMp3(url) {
    try {
        let video = ytdl(url, { quality: 'highestaudio', requestOptions: headerObj })


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
}

export class youtube {
    constructor(text, search = false) {
        this.text = text;
        this.search = search
    }

    async info() {
        return await getInfo(this.text)
    }

    async mp3() {

    }
}