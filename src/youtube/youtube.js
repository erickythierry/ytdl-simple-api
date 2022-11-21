import { spawn } from 'child_process';
import { PassThrough } from 'stream';
import ytdl from 'ytdl-core';
import yts from 'yt-search';

const cookie = "VISITOR_INFO1_LIVE=JE9dfGCExxM; SID=Ogivj4MpP-IXAQ7jebFgEhScm-UTYK3NcTnfBB8WVo1mAuTnqsXmM9n9WkMkteSCH5-XJA.; __Secure-1PSID=Ogivj4MpP-IXAQ7jebFgEhScm-UTYK3NcTnfBB8WVo1mAuTn59pnUQqKySsRmndjbXej2w.; __Secure-3PSID=Ogivj4MpP-IXAQ7jebFgEhScm-UTYK3NcTnfBB8WVo1mAuTn9IElg0-wZ-v95_LNTqoiXQ.; HSID=AjVY4wB08pyHO4C5Q; SSID=AKOfav5i3f0FlNJW_; APISID=prkZuVBXXg-N2vI3/APE4P0dYfeQEr0Sgf; SAPISID=HQ-sKbcl93J4q9UT/AuG7AqTfm2ryTUT8y; __Secure-1PAPISID=HQ-sKbcl93J4q9UT/AuG7AqTfm2ryTUT8y; __Secure-3PAPISID=HQ-sKbcl93J4q9UT/AuG7AqTfm2ryTUT8y; YSC=lKnUpHJ9rkM; LOGIN_INFO=AFmmF2swRAIgXwBV-LOJulNac0PZ0l94FT8mhArXRPnsBNfhVV5Aks0CIAn1GmGpsjCzaPJiUGcCeJZKb3i8K5lTBNVcxzTkWnKJ:QUQ3MjNmekVTbXc4YkFpa01fVzFtTWZWMUJpNEVFNUptY09NWHFxU0lzLWVwajBDUThvV2lWdGc0VVlPNkFacF9BM1NUVXZteFpIRzZzczZHQWhaMnpmeTRsR1BWRi1qQUtLXzRWQWN0RG0xZEdVVVIzS1djbWFxNWZqanh0eUpWRm1rcGFXNVd3Vk9kSkNTaFNOYzdPTlJFU0lOOHpNTEwtTHp4SkdPQVFfbmdzQWFsdG8tUG9IU3p4WTlNYVFDckxmVTRsZTNna08wTmRlby1ORzlVRC1tbUYwTU1OZnBRdw==; PREF=f6=40000000&tz=America.Sao_Paulo; CONSISTENCY=APAR8nu1d5eCEdycfmlR_3yVW15soeNIFewioa_vd0wctfwlxQ35XW9TZWAr20ppWMVQkQIWZlhMx3NvNlvV8fVvbrm-2MHMc6Fb__50CbOQfSsgfnhDf3VX6y2-Vwzdj-njpYK0cOcwhfMfdk9ptB-A; SIDCC=AEf-XMQZGL9exRAHac-TTt6f-Ecb1I6-pkVJ3jfJmFqkSZrdHk4D_a9t41MR1ECTtkWQBLENsVM; __Secure-1PSIDCC=AEf-XMT9L1FS4fppt4fnIaUzyGKnagB0scBZLcFkoabsuu_wbWbC2aD1AsmeCK1_CgCvypeU1w; __Secure-3PSIDCC=AEf-XMSxvaJZ8vu_ojWzMHIF7aqyckhERO6piWqO2CLSjttzIXxbZQDp3ucRLAOqFLwNuc86XQ"
const headerObj = { headers: { cookie: cookie } }




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
            sucess: true,
            title: info.videoDetails.title,
            videoid: info.videoDetails.videoId,
            thumb: info.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url,
            duration: info.videoDetails.lengthSeconds,
            likes: info.videoDetails.likes,
            info: info
        }

    } catch (error) {
        console.log('erro get info: \n', error);
        return { 'sucess': false, 'error': error.message }
    }
}

async function getMp3(url) {
    try {
        let videoinfo = await getInfo(urlvideo)
        let nomearquivo = videoinfo.videoid ? ('audio_' + videoinfo.videoid) : ('audio_' + getRandom(''))


        let video = ytdl(url, { quality: 'highestaudio', requestOptions: headerObj })


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

export { getInfo, getMp3 }