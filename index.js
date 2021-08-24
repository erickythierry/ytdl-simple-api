const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();

const getRandom = (ext) => {return `${Math.floor(Math.random() * 10000)}${ext}`}
const urlBase = process.env.URL_APP ? `https://${process.env.URL_APP}.herokuapp.com` : "http://localhost:3000"

app.listen(3000, function(){
    console.log("Listening on port 3000")
});


app.get('/', function(req, res){
    
    urlvideo = req.query.url

    if (urlvideo!=undefined && urlvideo.length > 3){
        try {
            const video = ytdl(urlvideo, {quality: 'highestaudio'})
            
            var nomearquivo = getRandom('')
            
            video.on('error', err => {
                console.log('erro em: ', err);
                res.json({'sucess': false, "error": err.message});
            });
            
            ffmpeg(video)
            .withAudioCodec("libmp3lame")
            .toFormat("mp3")
            .saveToFile(`${__dirname}/publico/${nomearquivo}.mp3`)
            .on('end', () => {
                res.json({'sucess': true, 'file': `${urlBase}/publico/?arquivo=${nomearquivo}.mp3`});
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

app.get('/publico', function(req, res){
    nomearquivo = req.query.arquivo
    if (nomearquivo != undefined && fs.existsSync(`${__dirname}/publico/${nomearquivo}`)){
        res.sendFile(`${__dirname}/publico/${nomearquivo}`)
    }else{
        res.send('nome de arquivo não encontrado...')
    }
})