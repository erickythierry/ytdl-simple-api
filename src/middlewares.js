import { readdir, unlink, stat } from 'fs/promises';
import ytdl from '@distube/ytdl-core';

const pasta = './publico/'

export async function delOldFiles(req, res, next) {
    try {
        const files = await readdir(pasta);

        for (const file of files) {
            const filePath = `${pasta}/${file}`;

            if (file.includes('.vazio')) continue;

            const { ctime } = await stat(filePath);
            const modificado = new Date(ctime).getTime();
            const agora = Date.now();
            const data = (agora - modificado) / 1000;

            if (data > 600) {
                console.log('🗑️', filePath);
                await unlink(filePath);
            }
        }
    } catch (error) {
        console.error('Unable to scan directory:', error);
    }

    if (next) {
        next();
    }
}

export function validateUrlRouter(req, res, next) {
    let { url } = req.query
    if (!ytdl.validateURL(url)) return res.json({ 'success': false, "error": 'sem url ou URL inválida' });
    next()
}