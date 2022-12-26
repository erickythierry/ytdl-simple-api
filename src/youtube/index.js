import ytdl from 'ytdl-core';
import { buscar as b } from "./buscar.js";
import { mp3 } from "./mp3.js";
import { mp4 } from "./mp4.js";

export const cookie = process.env.COOKIE || ""


export default class ytapi {
    constructor(data) {
        this.data = data
    }

    async buscar(text) {
        return await b(text)
    }
    async mp4() {
        return await mp4(this.data)
    }
    async mp3() {
        return await mp3(this.data)
    }
    async getInfo() {
        if (!this.data?.url) return;
        try {
            let videoinfo = await ytdl.getInfo(this.data?.url)
            let video_itag = getItag(videoinfo.formats)
            let audio_itag = getItag(videoinfo.formats, 'audio')
            //console.log(videoinfo.videoDetails)
            return {
                videoDetails: videoinfo.videoDetails,
                video: video_itag,
                audio: audio_itag,
                title: videoinfo.videoDetails.title,
                videoid: videoinfo.videoDetails.videoId,
                thumb: videoinfo.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url,
                duration: videoinfo.videoDetails.lengthSeconds,
                views: videoinfo.videoDetails.viewCount
            }
        } catch (error) {
            console.log(error)
            return;
        }

    }
};


export function getItag(lista, type = 'video') {
    if (type == 'video') return lista
        .filter(i => { // filtra apenas os formatos mp4 que sejam 720p ou 480p
            if (i.container == 'mp4') {
                if (i.qualityLabel == '360p' || i.qualityLabel == '480p' || i.qualityLabel == '720p') return true //
            }
        })
        .map(i => { return { q: i.qualityLabel, itag: i.itag, audio: i.hasAudio, size: i.contentLength } }) // reduz para apenas as propriedades qualityLabel e itag
        .sort((a, b) => { // organiza em sequencia as qualidades para que 720p fique sempre em primeiro
            if (parseInt(a.q) > parseInt(b.q)) return -1
            return 1
        }).sort((a, b) => {
            if (a.audio == true) return -1;
            return 1
        })

    return lista
        .filter(i => {
            if (i.mimeType.includes('audio/')) {
                if (i.audioBitrate >= 128) return true
            }
        })
        .map(i => { return { bitrate: i.audioBitrate, itag: i.itag, size: i.contentLength } })
        .sort((a, b) => {
            if (a.bitrate > b.bitrate) return -1
            return 1
        })
}