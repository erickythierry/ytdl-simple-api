import { existsSync } from 'fs';
import express from 'express';
import dotenv from 'dotenv'
import serveIndex from 'serve-index';

import { __filename, __dirname } from './dirname.js';
import { validateUrlRouter, delOldFiles } from './src/middlewares.js'
import ytapi from "./src/youtube/index.js"
import { myhost } from "./src/core.js"

dotenv.config()
const app = express();
const porta = process.env.PORT || 3000

app.set('json spaces', 4)
app.use(express.static(__dirname + "/"))
app.use('/publico', serveIndex((__dirname + '/publico'), { 'icons': true, 'template': (__dirname + '/src/static/arquivos.html') }));

app.listen(porta, function () {
    console.log("Listening on port ", porta)
    if (porta == 3000) { console.log('rodando localmente em http://localhost:3000') }
});
app.get('/url', delOldFiles, async function (req, res) {
    res.send(('url base do site: ' + await myhost(req)))
})
app.get('/', delOldFiles, function (req, res) {
    res.sendFile((__dirname + '/src/static/home.html'))
})
app.get('/audio', delOldFiles, validateUrlRouter, async function (req, res) {
    let { url, itag } = req.query
    console.log('audio ', url)

    let audio = new ytapi({ url: url, itag: itag })
    let arquivo = await audio.mp3()

    if (!arquivo) return res.json({ success: false, error: `erro ao baixar arquivo` });

    let apiUrl = await myhost(req)

    res.json({ success: true, file: `${apiUrl}/arquivo/?arquivo=${arquivo}` });

});
app.get('/video', delOldFiles, validateUrlRouter, async function (req, res) {
    let { url, itag } = req.query

    console.log('video ', url)

    let video = new ytapi({ url: url, itag: itag })
    let arquivo = await video.mp4()

    if (!arquivo) return res.json({ success: false, error: `erro ao baixar arquivo` });

    let apiUrl = await myhost(req)

    res.json({ success: true, file: `${apiUrl}/arquivo/?arquivo=${arquivo}` });
});
app.get('/arquivo', delOldFiles, function (req, res) {
    let { arquivo } = req.query

    if (!arquivo) return res.json({ success: false, error: 'sem arquivo' });

    let caminho = `${__dirname}/publico/${arquivo}`

    console.log('baixando arquivo ', arquivo)

    if (!existsSync(caminho)) return res.json({ success: false, error: 'arquivo nao encontrado' });

    res.download(caminho)
})
app.get('/info', delOldFiles, validateUrlRouter, async function (req, res) {
    let { url } = req.query
    console.log('get info ', url)

    let data = await (new ytapi({ url: url })).getInfo()

    if (!data) return res.json({ success: false, error: 'erro ao buscar dados' })

    return res.json({ success: true, ...data })
})
app.get('/buscar', delOldFiles, async function (req, res) {
    delOldFiles()
    let busca = req.query.text
    console.log('get buscar ', busca)
    if (!busca?.length) return res.json({ success: false, error: 'termo ou frase de busca nao fornecido' });

    let data = await (new ytapi()).buscar(busca)
    return res.json({ success: true, data: data })
})


