# YTdl-simple-api
- api simples de download de musicas e vídeos do YouTube

## Deploy Fácil
- Clique no botão a baixo e faça deploy do projeto direto no heroku automaticamente:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/erickythierry/ytdl-simple-api)

## Deploy Manual
 - Clone esse projeto no seu computador ou VPS, acesse a raiz do projeto e execute o comando `npm install` ou `yarn` 
 - Após instalar as dependências, execute `npm start`
 - O endpoint do projeto vai estar em `http://localhost:3000`

## Live Exemplo
 - https://yt.ethi.cf

## modo de usar:

##### http://URL-DO-APP/audio?url= + link do video do youtube
- a api retornará um json com o link de download do audio do vídeo em mp3

##### http://yt.ethi.cf/video?url= + link do video do youtube
- a api retornará um json com o link de download do vídeo em mp4

##### http://yt.ethi.cf/info?url= + link do video do youtube
- a api retornará um json com algumas informações do video


