function inicio(){

    
    senha = document.getElementById('senha').value
    user = document.getElementById('user').value

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "user": user,
        "senha": senha
    });

    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };

    fetch("/newuser", requestOptions)
    .then(response => {
        if(response.status != 200){
            response.text()
            .then((data) => {
                alert(data)
            }).catch((err) => {

                console.log(err);
            })
        }else{
            response.json()
            .then((data) => {
                document.getElementById('formulario').innerHTML = `
<div class="mb-3 pb-3">
    <p>URL M3U:</p>
    <a href="${data.url_m3u}">${data.url_m3u}</a>
    <p class="fst-italic mt-3">copie esse link e use no seu app/programa de iptv (lista m3u8)</p>
</div>

<p type="button" class="btn btn-lg btn-success" onClick="window.location.reload();">Voltar</p>
`
                alert('usuario criado com sucesso!')
            }).catch((err) => {

                console.log(err);
            })
        }
        
    })
    .catch(error => {
        alert('erro de conexão!')
        console.log(error)
        
    });
}

function delay(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}