# YTdl-simple-api
- api simples de download de musicas e vídeos do YouTube feita com node.js

&nbsp;
## Deploy Fácil
- Clique no botão a baixo e faça deploy do projeto direto no heroku automaticamente:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/erickythierry/ytdl-simple-api)

&nbsp;
## Deploy Manual
 - Clone esse projeto, acesse a pasta raiz e execute o comando `npm install` ou `yarn` 
 - Após instalar as dependências, execute `npm start`
 - O endpoint do projeto vai estar em `http://localhost:3000`

&nbsp;
## Live Exemplo
 - https://yt.ethi.cf

&nbsp;
## modo de usar:

##### http://URL-DO-APP/audio?url= + link do video do youtube
- a api retornará um json com o link de download do audio do vídeo em mp3

##### http://yt.ethi.cf/video?url= + link do video do youtube
- a api retornará um json com o link de download do vídeo em mp4

##### http://yt.ethi.cf/info?url= + link do video do youtube
- a api retornará um json com algumas informações do video


&nbsp;
\
\
\
_projeto baseado na lib [node-ytdl-core](https://github.com/fent/node-ytdl-core)_
