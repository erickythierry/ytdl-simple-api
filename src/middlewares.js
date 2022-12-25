import { readdir, statSync, unlinkSync } from 'fs';
import ytdl from 'ytdl-core';

const pasta = './publico/'

export async function delOldFiles(req, res, next) {

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

export function validateUrlRouter(req, res, next) {
    let { url } = req.query
    if (!ytdl.validateURL(url)) return res.json({ 'success': false, "error": 'sem url ou URL inválida' });
    next()
}