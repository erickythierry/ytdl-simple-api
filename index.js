const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const COOKIE = "PREF=f4=4000000&tz=America.Sao_Paulo; HSID=A6vo76fIEssRGXcdR; SSID=A9nFXTWMFZOomCeMP; APISID=bgcs3BM5S0RRHIWu/A0PlSaPbBmPzHBRqW; SAPISID=qc48kLiNyPWU-0rV/Az_NKWvCwrTmi0n6w; __Secure-1PAPISID=qc48kLiNyPWU-0rV/Az_NKWvCwrTmi0n6w; SID=AQivj04-c0qK8gHf27DpYdNZ8dfxWeur-OmJBL0AIXw1_tt3O07IDgOaCY9PTDSgZaQzfQ.; __Secure-1PSID=AQivj04-c0qK8gHf27DpYdNZ8dfxWeur-OmJBL0AIXw1_tt369TLSbKg3UnyY_0-q9iL9A.; __Secure-3PSID=AQivj04-c0qK8gHf27DpYdNZ8dfxWeur-OmJBL0AIXw1_tt3zXFXQ1U9pKlmonM8uC2ujQ.; __Secure-3PAPISID=qc48kLiNyPWU-0rV/Az_NKWvCwrTmi0n6w; YSC=yw3X4n1b6rQ; VISITOR_INFO1_LIVE=86yFJ3eayMg; LOGIN_INFO=AFmmF2swRQIhAN5RDhk93R1VeQ9Z-TOsF9LIXich4Gcwuy0_jUkwIzjPAiAKCzf7csBUNCuzRwMR4T6VuMf5xoC4mW88tDvN1GI1aw:QUQ3MjNmeGFiNjlyazVuNUlIaTV4ZFRUYWM3VWpycExRLWVCZmtIbTNBQ3FvZGI0MGNFTlJJUGo2LUVGV3JyWVNvRF9hSzdTa0lFU21xNWxwa3RVSndLVE1YVGo1RzYzUVBEa3NJcUtwUDAyaWRyWllLNGNuTl8tb28zZkN3Q0otR0NrSEN1c1l3aUFBZkpKcENRS1NHX3l1MFkyNlBsVjNWWmwtbUs5NkpYWURRd0pRVTVJcHptRDZNelVZSHNzWmc3Y3kxQVhDLVFlUUQ5THlSU3FEdDVRUzJqN2xFQmROdw==; SIDCC=AJi4QfFqBYlvOvisfrFP_QSTn5z66ghWyLR8ngriXiCWvYsRBUZ1F_XVKYGbzjtFz_rq0ax46g; __Secure-3PSIDCC=AJi4QfFHGYyw39nxU9E6UrFBV9HMBh_ivgSpJjX5BwZwXLMf-EcTpxcaNJYKB3pJS87INe8tKg"
const getRandom = (ext) => {return `${Math.floor(Math.random() * 10000)}${ext}`}
const urlBase = process.env.URL_APP ? `https://${process.env.URL_APP}.herokuapp.com` : "http://localhost:3000"
const porta = process.env.PORT || 3000
app.listen(porta, function(){
    console.log("Listening on port ", porta)
});


app.get('/', function(req, res){
    
    urlvideo = req.query.url

    if (urlvideo!=undefined && urlvideo.length > 3){
        try {
            const video = ytdl(urlvideo, {requestOptions: {headers: {cookie: COOKIE}}, quality: 'highestaudio'})
            
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