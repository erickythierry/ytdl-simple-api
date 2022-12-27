import yts from 'yt-search';

export async function buscar(search) {
    if (!search) return 'sem busca'
    const busca = await yts(search)
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
};