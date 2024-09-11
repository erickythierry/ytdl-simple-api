import ytdl from '@distube/ytdl-core';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs'

import { agent } from './index.js';
import { getRandom } from "../core.js"

ffmpeg.setFfmpegPath(ffmpegPath)


export async function mp3(data) {
    if (!data?.url) return;
    let itag = data?.itag || 'highestaudio'
    try {
        let videoinfo = await ytdl.getInfo(data?.url, { agent })
        let videoID = videoinfo?.videoDetails?.videoId
        let nomearquivo = 'audio_' + (videoID || getRandom('')) + '.mp3'
        let audio = ytdl.downloadFromInfo(videoinfo, { quality: itag, agent })

        let result = await new Promise((res, rej) => {
            ffmpeg(audio)
                .audioCodec('libmp3lame')
                .save(`./publico/${nomearquivo}`)
                .on('end', () => {
                    res(`${nomearquivo}`)
                })
                .on('error', function (err) {
                    console.log('ffmpeg mp3 erro:', err)
                    res()
                });
        })
        return result

    } catch (e) {
        console.log('erro ', e)
    }
}

export async function rawAudio(data) {
    if (!data?.url) return;
    let itag = data?.itag || 'highestaudio'

    return await new Promise(async (resolve, rej) => {
        try {
            let videoinfo = await ytdl.getInfo(data?.url, { agent })
            let videoID = videoinfo?.videoDetails?.videoId
            // Identifica o formato de contêiner do áudio
            let audioFormat = videoinfo.formats.find(f => f.itag === itag || f.audioQuality)?.container || 'mp3';
            let nomearquivo = 'audio_' + (videoID || getRandom('')) + '.' + audioFormat;
            let arquivo = fs.createWriteStream('./publico/' + nomearquivo);

            // Faz o download do áudio
            ytdl.downloadFromInfo(videoinfo, { quality: itag, agent }).pipe(arquivo)
            arquivo.on('finish', () => resolve(nomearquivo))
            arquivo.on('error', () => res(undefined));

        } catch (e) {
            console.log('erro ', e)
            resolve(undefined)
        }
    })

}