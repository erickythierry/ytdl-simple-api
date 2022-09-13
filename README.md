<h1 align="center">YTdl-simple-api</h1>
<h3 align="center">api simples de download de musicas e vídeos do YouTube feita com node.js</h3>

<p align="center">
<img src="https://github.com/erickythierry/ytdl-simple-api/raw/95c5bf07b6ad6d0e7ab5cb1cf40518f3c0b4ee66/static/example.png" width="700">
</p>

&nbsp;
## Deploy Fácil
- Clique no botão a baixo e faça deploy do projeto direto no heroku automaticamente:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/erickythierry/ytdl-simple-api)

(infelizmente o heroku encerrará o plano free em novembro de 2022 😕)

&nbsp;
## Deploy Manual
 - Clone esse projeto, acesse a pasta raiz e execute o comando `npm install` ou `yarn` 
 - Crie o arquivo `.env` na raiz do projeto (veja o arquivo `.example.env` para entender como criar seu arquivo com seu cookie do youtube)
 - Após isso, execute `npm start`
 - O endpoint do projeto vai estar em `http://localhost:3000`
&nbsp;
## Live Exemplo
<a href="https://yt.zaxs.cf/"><h3>yt.zaxs.cf</h3></a>

&nbsp;
## modo de usar:

##### https://yt.zaxs.cf/audio?url= `link do video do youtube`
- a api retornará um json com o link de download do audio do vídeo em mp3 como no exemplo a baixo:
```json
{
    "sucess": true, 
    "file": "url direta para baixar o audio do vídeo em formato mp3"
}
```
&nbsp;
##### https://yt.zaxs.cf/video?url= `link do video do youtube`
- a api retornará um json com o link de download do vídeo em mp4 como no exemplo a baixo:
```json
{
    "sucess": true, 
    "file": "url direta para baixar o video em formato mp4"
}
```
&nbsp;
##### https://yt.zaxs.cf/info?url= `link do video do youtube`
- a api retornará um json com algumas informações do vídeo como no exemplo a baixo:
```json
{
    "sucess": true,
    "title" : "Titulo do video",
    "videoid" : "ID do video",
    "thumb": "URL da thumb no formato jpg",
    "duration" : "Duração do vídeo em segundos",
    "likes" : "numero de likes no vídeo"
}
```
&nbsp;
##### Caso ocorra algum erro nas solicitações, a API retornará um json como o exemplo a baixo:
```json
{
    "sucess": false, 
    "error": "a mensagem do erro ocorrido"
}
```


&nbsp;
\
\
\
_projeto baseado na lib [node-ytdl-core](https://github.com/fent/node-ytdl-core)_
