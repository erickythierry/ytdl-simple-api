import ytdl from '@distube/ytdl-core';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs'
import { agent, getItag } from './index.js';
import { mp3 } from "./mp3.js"
import { getRandom } from "../core.js"

ffmpeg.setFfmpegPath(ffmpegPath)


export async function mp4(data) {
    if (!data?.url) return;
    try {
        let videoinfo = await ytdl.getInfo(data?.url, { agent })
        console.log(getItag(videoinfo.formats))
        let selected = getItag(videoinfo.formats)[0]
        let itag = data?.itag || selected.itag
        let videoID = videoinfo?.videoDetails?.videoId
        let nomearquivo = 'video_' + (videoID || getRandom('')) + '.mp4'
        let arquivo = fs.createWriteStream(('./publico/' + nomearquivo))

        ytdl.downloadFromInfo(videoinfo, { quality: itag, format: 'mp4', agent })
            .pipe(arquivo)

        let resultado = await Promise.allSettled([
            new Promise((resolve) => arquivo.on('finish', resolve())),
            mp3({ url: data.url })
        ])

        let audio = resultado[1].value
        let fim = await convert(nomearquivo, audio)
        if (!fim) return;
        return fim

    } catch (e) {
        console.log('erro ', e)
    }
}

export async function rawMp4(data) {
    if (!data?.url) return;
    try {
        let videoinfo = await ytdl.getInfo(data?.url, { agent })
        console.log(getItag(videoinfo.formats))
        let selected = getItag(videoinfo.formats)[0]
        let itag = data?.itag || selected.itag
        let videoID = videoinfo?.videoDetails?.videoId
        let nomearquivo = 'video_' + (videoID || getRandom('')) + '.mp4'
        let arquivo = fs.createWriteStream(('./publico/' + nomearquivo))

        ytdl.downloadFromInfo(videoinfo, { quality: itag, format: 'mp4', agent })
            .pipe(arquivo)

        await new Promise((resolve) => arquivo.on('finish', resolve()))
        return nomearquivo

    } catch (e) {
        console.log('erro ', e)
    }
}

async function convert(video, audio) {
    return await new Promise((res) => {
        ffmpeg()
            .addInput(('./publico/' + video))
            .addInput(('./publico/' + audio))
            .addOptions(['-map 0:v', '-map 1:a', '-c:v copy'])
            .format('mp4')
            .on('error', error => {
                console.log(error)
                res()
            })
            .on('end', () => {
                res(("merged_" + video))
            })
            .saveToFile(("./publico/merged_" + video))
    })
}

