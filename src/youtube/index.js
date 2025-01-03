import ytdl from "@distube/ytdl-core";
import "dotenv/config";
import { buscar as b } from "./buscar.js";
import { mp3, rawAudio } from "./mp3.js";
import { mp4, rawMp4 } from "./mp4.js";

export default function ytapi(data) {
    return {
        buscar: async (text) => {
            return await b(text);
        },
        mp4: async () => {
            return await mp4(data);
        },
        rawMp4: async () => {
            return await rawMp4(data);
        },
        mp3: async () => {
            return await mp3(data);
        },
        rawAudio: async () => {
            return await rawAudio(data);
        },
        getInfo: async () => {
            if (!data?.url) return;
            try {
                let videoinfo = await ytdl.getInfo(data?.url, {
                    playerClients: ["IOS", "WEB_CREATOR"],
                });
                let video_itag = getItag(videoinfo.formats);
                let audio_itag = getItag(videoinfo.formats, "audio");
                return {
                    video: video_itag,
                    audio: audio_itag,
                    title: videoinfo.videoDetails.title,
                    videoid: videoinfo.videoDetails.videoId,
                    thumb: videoinfo.player_response.microformat
                        .playerMicroformatRenderer.thumbnail.thumbnails[0].url,
                    duration: videoinfo.videoDetails.lengthSeconds,
                    views: videoinfo.videoDetails.viewCount,
                    videoDetails: videoinfo.videoDetails,
                };
            } catch (error) {
                console.log(error);
                return;
            }
        },
        getFormats: async () => {
            if (!data?.url) return;
            try {
                let videoinfo = await ytdl.getInfo(data?.url, {
                    playerClients: ["IOS", "WEB_CREATOR"],
                });
                return videoinfo.formats;
            } catch (error) {
                console.log(error);
                return;
            }
        },
    };
}

export function getItag(lista, type = "video") {
    if (type == "video") {
        lista = lista
            .filter((i) => {
                // filtra apenas os formatos mp4 que sejam 720p ou 480p
                if (i.container == "mp4") {
                    if (
                        i.qualityLabel == "360p" ||
                        i.qualityLabel == "480p" ||
                        i.qualityLabel == "720p"
                    )
                        return true;
                }
            })
            .map((i) => {
                return {
                    q: i.qualityLabel,
                    itag: i.itag,
                    audio: i.hasAudio,
                    size: i.contentLength,
                };
            }); // reduz para apenas as propriedades qualityLabel e itag
        lista = filterDuplicates(lista, "q");

        return lista.sort((a, b) => {
            // Primeiro, organiza por qualidade, da maior para a menor
            let qualityA = parseInt(a.q);
            let qualityB = parseInt(b.q);

            if (qualityA !== qualityB) {
                return qualityB - qualityA; // Maior qualidade primeiro
            }

            // Se as qualidades forem iguais, prioriza os que têm áudio
            if (a.audio !== b.audio) {
                return a.audio ? -1 : 1; // Prioriza áudio
            }

            return 0; // Mantém a ordem se forem equivalentes
        });
    }

    let result = lista
        .filter((i) => {
            if (i.mimeType?.includes("audio")) {
                if (i.audioBitrate >= 128) return true;
            }
        })
        .map((i) => {
            return {
                bitrate: i.audioBitrate,
                itag: i.itag,
                size: i.contentLength,
            };
        })
        .sort((a, b) => {
            if (a.bitrate > b.bitrate) return -1;
            return 1;
        });
    return result;
}

function filterDuplicates(array, param) {
    return array.filter(
        (item, index, self) =>
            self.findIndex((other) => other[param] === item[param]) === index
    );
}
