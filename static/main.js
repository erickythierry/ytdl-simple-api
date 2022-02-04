function inicio(){

    
    linkvideo = document.getElementById('linkvideo').value
    if(!linkvideo || linkvideo.length<20) return showAlert('Preencha a url corretamente', 'alerta')

    loadingBtn('botaobuscar')

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };

    fetch(`/info?url=${linkvideo}`, requestOptions)
    .then(response => {
        if(response.status != 200){
            showAlert('erro: o servidor não respondeu como deveria :(', 'alerta')
            console.log(response)
        }else{
            response.json().then((data) => {
                if(!data.sucess) return showAlert(('erro: ', data.error), 'alerta');
                
                document.getElementById('formulario').innerHTML = downloadScreen(data)
                showVoltarBtn()

            }).catch((err) => {

                console.log(err);
                showAlert('erro!')
            })
        }
        
    })
    .catch(error => {
        showAlert('Erro - sem conexão com o servidor')
        console.log(error)
        
    });
}

function download(urlType){
    
    loadingBtn('divDownload')
    
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
    
    var type = urlType.startsWith('video_') ? 'video' : 'audio'
    
    fetch(`/${type}?url=${linkvideo}&best=true`, requestOptions)
    .then(response => {
        if(response.status != 200){
            showAlert('erro: o servidor não respondeu como deveria :(', 'alerta')
            console.log(response)
        }else{
            response.json().then((data) => {
                if(!data.sucess) return showAlert(('erro: ', data.error), 'alerta');
                console.log(data.file)
                var link = document.createElement('a');
                link.href = data.file;
                link.download = (data.file.split('arquivo='))[1];
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                document.getElementById('divDownload').innerHTML = ''
                document.getElementById('divDownload').innerHTML = `
                <div class="alert alert-success" role="alert">
                    <span class="material-icons">done</span>
                </div>`


            }).catch((err) => {

                console.log(err);
                showAlert('erro!')
            })
        }
        
    })
    .catch(error => {
        showAlert('Erro - sem conexão com o servidor')
        console.log(error)
        
    });

}

function loadingBtn(id){
    document.getElementById(id).innerHTML = ''
    document.getElementById(id).innerHTML = `
    <button class="btn btn-danger" type="button" disabled>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        aguarde...
    </button>`
}


function delay(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

function showAlert(msg, type='erro'){

    document.getElementById(type).innerText = msg
    document.getElementById(type).style.display = 'block'
     
    delay(8000)
    .then(()=>{
        document.getElementById(type).innerText = ''
        document.getElementById(type).style.display = 'none'
        resetBtnBuscar()
    })
}

function resetBtnBuscar(){
    document.getElementById('botaobuscar').innerHTML = ''
    document.getElementById('botaobuscar').innerHTML = `<p type="button" class="btn btn-lg btn-danger mt-3" id="botaobuscar" onclick="inicio()">buscar <span class="material-icons">search</span></p>`
}

function downloadScreen(data){
    return `
    <p class="h3 text-muted">${data.title}</p>
        <img class="img-fluid rounded mt-2" src="${data.thumb}">
        <p class="mt-3 text-light text-muted">
            <strong>duração:</strong> ${sToTime(data.duration)} <strong>likes:</strong> ${data.likes}
        </p>
        
        
        <div id="divDownload" class="mt-4">
            <p class="text-muted text-light h5">
                baixar:
            </p>
            <p type="button" class="btn btn-lg btn-danger" id="botaovideo" onclick="download('video_${data.videoid}')">Video <span class="material-icons">smart_display</span></p>
            <p type="button" class="btn btn-lg btn-danger" id="botaoaudio" onclick="download('audio_${data.videoid}')">Audio <span class="material-icons">audiotrack</span></p>
        </div>

        <p type="button" class="btn btn-lg mt-2" id="botaovoltar" onClick="window.location.reload();">Voltar</p>`
}

function sToTime(duration){   
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

function showVoltarBtn(){
    document.getElementById("botaovoltar").style.visibility = "visible";
}