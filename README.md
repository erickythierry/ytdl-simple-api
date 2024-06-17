<h1 align="center">YTdl-simple-api</h1>
<h3 align="center">api simples de busca e download de musicas e vídeos do YouTube feita com node.js</h3>

<p align="center">
<img src="https://github.com/erickythierry/ytdl-simple-api/blob/main/src/static/example.png?raw=true" width="700">
</p>
<hr>

&nbsp;
## Deploy Local
 - Clone esse projeto, acesse a pasta raiz e execute o comando `npm install` ou `yarn` 
 - Crie o arquivo `env.js` na raiz do projeto (veja o arquivo `example.env.js` para entender como criar seu arquivo com seu cookie do youtube)
 - Após isso, execute `npm start`
 - O endpoint do projeto vai estar em `http://localhost:3000`

&nbsp;
## Deploy com CapRover
- o projeto já está adaptado para fazer buid no capRover
- CapRover é um sistema de deploy continuo que imita o Heroku (porém você precisa ter seu proprio servidor para usar...)
- saiba mais sobre o CapRover <a href="https://caprover.com/">Aqui</a>

&nbsp;
## modo de usar:
&nbsp;
##### http://localhost:3000/buscar?text= `frase ou termo a ser buscado`
- a api retornará um json com um array de 5 itens contendo os dados dos videos encontrados. Segue exemplo a baixo:
```json
{
    "success": true, 
    "data": [
    {
      "title": "Parabéns pra Você!",
      "id": "ROlOAlCAmr8",
      "url": "https://youtube.com/watch?v=ROlOAlCAmr8",
      "thumb": "https://i.ytimg.com/vi/ROlOAlCAmr8/hqdefault.jpg",
      "views": 16721041,
      "duration": {
        "seconds": 92,
        "time": "1:32"
      }
    },
    {...},
    {...},
    {...},
    {...}
    ]
}
```
&nbsp;
##### http://localhost:3000/audio?url= `link do video do youtube`
- a api retornará um json com o link de download do audio do vídeo em mp3 como no exemplo a baixo:
```json
{
    "success": true, 
    "file": "url direta para baixar o audio do vídeo em formato mp3"
}
```
&nbsp;
##### http://localhost:3000/video?url= `link do video do youtube`
- a api retornará um json com o link de download do vídeo em mp4 como no exemplo a baixo:
```json
{
    "success": true, 
    "file": "url direta para baixar o video em formato mp4"
}
```
&nbsp;
##### http://localhost:3000/info?url= `link do video do youtube`
- a api retornará um json com algumas informações do vídeo como no exemplo a baixo:
```json
{
    "success": true,
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
    "success": false, 
    "error": "a mensagem do erro ocorrido"
}
```


&nbsp;
\
\
\
_projeto baseado na lib [node-ytdl-core](https://github.com/fent/node-ytdl-core)_
