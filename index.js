const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
var serveIndex = require('serve-index');
const { default: axios } = require("axios")

const COOKIE = "PREF=f4=4000000&tz=America.Sao_Paulo&f6=40000000; VISITOR_INFO1_LIVE=chRD8Jpd3Z4; SID=HAivj5wx8TtnAupfpgtzkeOM5F_BgBp6LMydqEc5yHk_tCpx6RgHHHD1Kqc1lK1YO7l06g.; __Secure-1PSID=HAivj5wx8TtnAupfpgtzkeOM5F_BgBp6LMydqEc5yHk_tCpxxEPeYhngYzHGj5kZu3SGcg.; __Secure-3PSID=HAivj5wx8TtnAupfpgtzkeOM5F_BgBp6LMydqEc5yHk_tCpxbdcQr8j0slHZaLaO6VaNxg.; HSID=A11sZM_GFn3VDr5mr; SSID=ARx4YvPjyMmfple7T; APISID=5m2xsOBtzFBYp5Gb/Ak_Vod1RdKhxB0kJZ; SAPISID=95rzxvKAK7WQg8je/AkEagixeJxMotp9QE; __Secure-1PAPISID=95rzxvKAK7WQg8je/AkEagixeJxMotp9QE; __Secure-3PAPISID=95rzxvKAK7WQg8je/AkEagixeJxMotp9QE; YSC=W8Y4LA4V9AY; LOGIN_INFO=AFmmF2swRgIhANP7alsn_6gDFHHs7Gj7rQjWNM0foNEEwcbQPo3BtNHpAiEA8UTxLe1S4arxR2kmVYvmdmrVOfkQ3VsBMoHzgfCqwi4:QUQ3MjNmeGE2MkpfYTl3eDgxc1lVVlZBRXVSbklZWC1FYlMzc0I4WGNKbXNpV2E5dFh1c1R5RVBMOXFndWNzVmRnTWpfWFJRZE9oNWJzOFpYbTYyZXpaM29hUmgyYXNGNTRRQUlCdmwtZlZQb3dTbkpIemFkc3JaSUlLT1liZnJGTkZ4cTUzbzBwLU5pNlFwTGowS3pLelFqdVZfcHQ2cGJB; CONSISTENCY=AGDxDePD-SKH7AUqq9Bp6aewNuH-wvN-AIDoa603aVITml7RBZecK0RtOWLn9xUEJNvg_yl9XIFdAzdkeZubErgWzx0PJnVFu9HsmrwyVjrWT7oKBnDg-vxmj5eMTsZflMZgCIhlA5mHVCbEiwQ3lFz7; SIDCC=AJi4QfEm1QkHMPGwsFcG3ROH9eBW5ESuKTVcLlI1b6lEiWzVxwrwIJ0iz2AFDXjHp9iC4wL44Q; __Secure-3PSIDCC=AJi4QfFpBlRv4VdfQ0ogagdUMfGyJPlw5_umkiRUp6wJeUpw5fV83m7Ki-jNvvhpewmCs6KlOWI"
const getRandom = (ext) => {return `${Math.floor(Math.random() * 10000)}${ext}`}

const myhost = async (req) => {
    // checa se o site suporta https
    myurl = req.headers.host
    try {
        const response = await axios(('https://' + myurl));
        return ('https://' + req.headers.host);
    } catch (error) {
        return ('http://' + req.headers.host);
    }
}
const porta = process.env.PORT || 3000

app.set('json spaces', 4)
app.use(express.static(__dirname + "/"))
app.use('/publico', serveIndex(__dirname + '/publico'));

app.listen(porta, function(){
    console.log("Listening on port ", porta)
    if (porta==3000){console.log('rodando localmente em http://localhost:3000')}
});
app.get('/url', async function(req, res){
    res.send(('url base do site: '+ await myhost(req)))
})
app.get('/', function(req, res){
    res.sendFile((__dirname+'/static/home.html'))
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
                myhost(req)
                .then(url =>{
                    res.json({'sucess': true, 'file': `${url}/arquivo/?arquivo=${nomearquivo}.mp3`});
                }) 
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
                myhost(req)
                .then(url =>{
                    res.json({'sucess': true, "file": `${url}/arquivo/?arquivo=${nomearquivo}.mp4`});
                })
                
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