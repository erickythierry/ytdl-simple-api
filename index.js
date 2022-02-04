const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
var serveIndex = require('serve-index');
const COOKIE = "GPS=1; YSC=yv-MFUnVO7M; VISITOR_INFO1_LIVE=puNALCZRKCU; CONSISTENCY=AGDxDeOTjvk7RLa78P5KzwVCN6INKovK8cNX2qwj0C_fUV4fwE2l90c6qR1-3jUCdClV59rYBpwxuCH1yRO56a8F3xnPiJFWfYtxPFcqSBXUsj_KlMm2h60m3Cgy5VMImdVFFvCoM3cr3Jy8SDXYPjQ; SID=Cwjp4X0LcDWQcxQkeC0RmQFP6ado5-XJpieRVOjHFjkeLuqwx_uJute3X1MZfpRaccwD-w.; __Secure-1PSID=Cwjp4X0LcDWQcxQkeC0RmQFP6ado5-XJpieRVOjHFjkeLuqwDo8mo9y4YUelACdTLePDng.; __Secure-3PSID=Cwjp4X0LcDWQcxQkeC0RmQFP6ado5-XJpieRVOjHFjkeLuqwvOKAYoj4x-Jq1VlHKe-Vag.; HSID=A9ZAk537AbZybfSUE; SSID=AwkSMERBc6gJOyue7; APISID=YYpNLuXD5YRtRdz5/AGHdcuoNJDrbs3efo; SAPISID=gDFNeREkL-mqaI6o/AiNEJYO0VV2nFKhEY; __Secure-1PAPISID=gDFNeREkL-mqaI6o/AiNEJYO0VV2nFKhEY; __Secure-3PAPISID=gDFNeREkL-mqaI6o/AiNEJYO0VV2nFKhEY; LOGIN_INFO=AFmmF2swRQIhALV4jXNd1g4TDmOT_nyjsV91ro7zww9M-cybTTdk29l6AiB8vtLmmE0dzLotAHKuGx3lapMUeZ_G6uNu5FGcFu7dzA:QUQ3MjNmemNjT3RhaXZZSUZxWGxxb1d5Xzg5NVREZVJHeXRZMmh0NV9rOUdqdnFZNHRMa1g2ZVg1enZ1eURleHBRM3VaOWo4WFpiT294dkliYjF5Wk1wdFJtclhOXy1kTTQ1WjdvUDlPMlBfRTRuQnJfSmU3ZUJnaVh1MjBQMnBYbzFNV2ZLZXB6a2NmYUlUSVlBWml5WlVjS0ptWlBYa0tKWEE5M3NCUTI4X0xMTzRKWExGUGJiR3Z0VmpHRVQ1VTBnNXlIT0N4VlZvbVdFYmQ3X3lHU3hBa01scHRYU0RYUQ==; PREF=f4=4000000&tz=America.Sao_Paulo&f6=40000000; SIDCC=AJi4QfEXEFSKytJk84Q8a4xkNWZk_yFiLXFjRiommRpKX6KWoc9btmZwGObuOvkVvGQo-L-v; __Secure-3PSIDCC=AJi4QfEWblOTHlsFNYrZkymLLVMf5SW0AAtVqHtGBz-VrYkbf895za6riX6NP7UOiBAIKMet"
const getRandom = (ext) => {return `${Math.floor(Math.random() * 10000)}${ext}`}
const myhost = (req) => { return `http://${req.headers.host}`}
const porta = process.env.PORT || 3000

app.set('json spaces', 4)
app.use(express.static(__dirname + "/"))
app.use('/publico', serveIndex(__dirname + '/publico'));

app.listen(porta, function(){
    console.log("Listening on port ", porta)
    if (porta==3000){console.log('rodando localmente em http://localhost:3000')}
});
app.get('/url', function(req, res){
    res.send(('url base do site: '+ myhost(req)))
})
app.get('/', function(req, res){
    res.sendFile((__dirname+'/static/home.html'))
    // res.send(`
    // <center>
    // <br>
    // <h2>como Usar...</h2>
    // <hr>    
    // <p><b>musica</b> = ${myhost(req)}/<b>audio?url=</b>link-do-video</p><br>
    // <p><b>video</b> = ${myhost(req)}/<b>video?url=</b>link-do-video</p><br>
    // <p><b>informações</b> = ${myhost(req)}/<b>info?url=</b>link-do-video</p><br>
    // <br>
    // <h3><b>* os retornos da API são em json</b></h3>
    // <hr>
    // <br>
    // <h5><b>Dev by Éricky Thierry</b></h5>
    // <a href="${myhost(req)}/publico/">arquivos</a>
    // </center>
    // `)
})
app.get('/audio', async function(req, res){
    
    urlvideo = req.query.url
    console.log('audio ', urlvideo)
    if (urlvideo!=undefined && urlvideo.length > 3){
        try {
            const video1 = ytdl(urlvideo, {requestOptions: {headers: {cookie: COOKIE}}})
            
            //var nomearquivo = getRandom('')
            videoinfo = await getInfo(urlvideo)
            var nomearquivo = videoinfo.videoid ? ('audio_'+videoinfo.videoid) : ('audio_'+getRandom(''))
            
            video1.on('error', err => {
                console.log('erro em: ', err);
                res.json({'sucess': false, "error": err.message});
            });
            
            ffmpeg(video1)
            .withAudioCodec("libmp3lame")
            .toFormat("mp3")
            .saveToFile(`${__dirname}/publico/${nomearquivo}.mp3`)
            .on('end', () => {
                res.json({'sucess': true, 'file': `${myhost(req)}/arquivo/?arquivo=${nomearquivo}.mp3`});
                })
            .on('error', function(err){
                res.json({'sucess': false, "error": err.message});           
            });
            
        
        } catch (e) {
            console.log('erro ', e)
            res.json({'sucess': false, "error": e.message});
        }
        
    }else{
        res.json({'sucess': false, "error": 'sem url'});
    }
    
});

app.get('/video', async function(req, res){
    
    urlvideo = req.query.url
    bestQuality = req.query.best
    
    console.log('video ', urlvideo, 'best', bestQuality)
    if (urlvideo!=undefined && urlvideo.length > 3){
        try {
            //var nomearquivo = getRandom('')
            videoinfo = await getInfo(urlvideo)
            var nomearquivo = videoinfo.videoid ? ('video_'+videoinfo.videoid) : ('video_'+getRandom(''))
            
            var videoOptions = bestQuality ? 
            {quality: 'highest', filter:'audioandvideo', requestOptions: {headers: {cookie: COOKIE}}} :
            {requestOptions: {headers: {cookie: COOKIE}}};
            
            const video2 = ytdl(urlvideo, videoOptions)
            
            video2.on('error', err => {
                console.log('erro em: ', err);
                res.json({'sucess': false, "error": err.message});
            });
            
            
            video2.on('end', () => {
                res.json({'sucess': true, "file": `${myhost(req)}/arquivo/?arquivo=${nomearquivo}.mp4`});
              });
            
            video2.pipe(fs.createWriteStream(`${__dirname}/publico/${nomearquivo}.mp4`))
        
        } catch (e) {
            console.log('erro ', e)
            res.json({'sucess': false, "error": e.message});
        }
        
    }else{
        res.json({'sucess': false, "error": 'sem url'});
    }
    
});

app.get('/arquivo', function(req, res){
    nomearquivo = req.query.arquivo
    console.log('baixando arquivo ', nomearquivo)
    if (nomearquivo != undefined && fs.existsSync(`${__dirname}/publico/${nomearquivo}`)){
        res.download(`${__dirname}/publico/${nomearquivo}`)
    }else{
        res.json({'sucess': false, "error": 'sem url'});
    }
})

app.get('/info', async function(req, res){
    link = req.query.url
    console.log('get info ', link)
    if (link != undefined && link.length > 2){
        data = await getInfo(link)
        res.json(data)
    }else{
        res.json({'sucess': false, "error": 'sem url'});
    }
})


async function getInfo(url){
    try {
        return await ytdl.getInfo(url, {requestOptions: {headers: {cookie: COOKIE}}})
        .then((info) =>{
                        
            return {
                'sucess': true,
                "title" : info.videoDetails.title,
                "videoid" : info.videoDetails.videoId,
                "thumb": info.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url,
                'duration':info.videoDetails.lengthSeconds,
                'likes' : info.videoDetails.likes
            }
            

        }).catch(error =>{
            console.log('erro get info: \n', error.message);
            return {'sucess': false, 'error': error.message}
        })
    } catch (error) {
        console.log('erro get info: \n', error);
        return {'sucess': false, 'error': error.message}
    }
    
}