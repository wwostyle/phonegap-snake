var media, sound, canvas, ctx, ALTURA, LARGURA, frames = 0, TAMANHO = 10, 
VELOCIDADE = 15, NIVEL = 1, RECORDE = 0, FILE = "newPersistentFile3.txt",
PLATAFORMA = null, PAUSE = true, 
SAIR = false, btSair = false, semMusica = false;

var stop = false;
var frameCount = 0;
var $results = $("#results");
var fps, fpsInterval, startTime, now, then, elapsed;

var pages = {
    values: {},
    
    push: function(index, value){ 
        this.values[index] = value;
    },

    remove: function(index){
        this.values.splice(index, 1);
    },

    get: function(index){
        return this.values[index];
    }

}

var app = {
    
    initialize: function() {
//        pages = new HashMap();
        pages.push("index","file:///android_asset/www/index.html");
        pages.push("jogo","file:///android_asset/www/index.html#page2");
        pages.push("configuracoes","file:///android_asset/www/index.html#page3");

//        console.log("Pagina 1: "+pages.get("index"));
        this.initFastClick();
        this.bindEvents();
        this.initJGesture();
        this.initKeyboardEvent();
        this.initGame();
        this.onPause();
        this.onResume();
        this.exit();
        
    },
    
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        document.addEventListener('pause', function(){
            pausar();
            pausarMusica();
        }, false);

        
        document.addEventListener('resume', function(){
            resume();
            tocarMusica();
        }, false);

        document.addEventListener('backbutton', this.backButton, false);

        document.getElementById('musica').addEventListener('click',this.ligarMusica,false);

    },

    onDeviceReady: function() {
//        navigator.notification.alert("Prepare-se para sofrer!", teste, "Inicio", "Clique-me seu baitola");
//        console.log("Pagina Inicial: "+window.location.href);
        
        PLATAFORMA = device.platform;
        readFile(FILE, atualizaRecorde);
        media = new Media("file:///android_asset/www/sons/PLSTBANG.mp3",function(){
            console.log("funfou");
        },function(e){
            console.log("nao funfou: "+e.code);
        } );

        controlarMusica();
    }, 

    initFastClick: function() {
        window.addEventListener('load', function() {
            FastClick.attach(document.body);
        }, false);
    },


    initJGesture: function(){

        window.addEventListener('load', function(){

            jQuery('#swipe').bind('swipeleft',function(){
                snake.setDirecao("ESQUERDA");
            });

            jQuery('#swipe').bind('swiperight',function(){
                snake.setDirecao("DIREITA");
            });
            jQuery('#swipe').bind('swipeup',function(){
                snake.setDirecao("CIMA");
            });
            jQuery('#swipe').bind('swipedown',function(){
                snake.setDirecao("BAIXO");
            });
        }, false);
    },

    initKeyboardEvent: function(){
        window.addEventListener('load', function(){
            document.addEventListener('keydown', function(event){
                
                var tecla = event.keyCode;
                switch(tecla){
                    case 37:
                        snake.setDirecao("ESQUERDA");
                        break;
                    case 38:
                        snake.setDirecao("CIMA");
                        break;
                    case 39:
                        snake.setDirecao("DIREITA");
                        break;
                    case 40:
                        snake.setDirecao("BAIXO");
                        break;
                }
            });
        });
    },

    initGame: function(){

        var play = document.getElementById("jogar");
        play.addEventListener("click",iniciar);
    },

    onPause: function() {
        var btPause = document.getElementById("pausar");
//      btPause.removeEventListener('click',pausar,false);
        btPause.addEventListener('click',pausar);
               
    },

    onResume: function(){
        var btResume = document.getElementById("resume");
//      btResume.removeEventListener('click',resume,false);
        btResume.addEventListener('click',resume);
                
    },

    backButton: function (evt) {
        console.log("Pagina Inicial: "+window.location.href);
        console.log("Plataforma Id: "+cordova.platformId);
       

        if (window.location.href !== pages.get("index") && window.location.href !== pages.get("configuracoes")) {
            pausar();
            window.location.replace("#page3");
        } else if(window.location.href === pages.get("index")){
            canvas = null;
            exit();
        }
    },

    exit: function(){
        var btExit = document.getElementById("exit");
        btExit.addEventListener('click', exit);
    },

    ligarMusica: function(){
        if(semMusica){
            semMusica = false;
        }else{
            semMusica = true;
        }
    },

};

function teste(){
    console.log("Funcionou!");
}

function controlarMusica(){
    tocarMusica();
}

function tocarMusica(){
    
    
        var loop = function(status){
            if(status === Media.MEDIA_STOPPED && !semMusica){
                sound.play();
            }
        }

        sound = new Media("file:///android_asset/www/sons/01 Chipper Doodle V2 - Kevin MacLeod.mp3",function(){
            console.log("funfou");
        },function(e){
            console.log("nao funfou: "+e.code);
        },loop );
    
    sound.setVolume(0.5);
    sound.play();

    var btMusica = document.getElementById("musica");
    btMusica.innerHTML = "<a href=''>Música: Ligada</a>";
    btMusica.removeEventListener('click',tocarMusica);
    btMusica.addEventListener('click', pararMusica);

}

function pararMusica(){
    sound.stop();

    var btMusica = document.getElementById("musica");
    btMusica.innerHTML = "<a href=''>Música: Desligada</a>";
    btMusica.removeEventListener('click',pararMusica);
    btMusica.addEventListener('click', tocarMusica);
}

function pausarMusica(){
    sound.pause();
}

function exit(){
    
    if(btSair === false){
        canvas = null;
        pararJogo();
        var msg = "Aperte novamente para sair do jogo!";
        if(PLATAFORMA !== null){
            window.plugins.toast.showLongBottom(msg);
        }

        setTimeout(function(){
            if(SAIR){
                pararMusica();
                navigator.app.exitApp();
            }else{
                btSair = false;
                SAIR = false;
            }
        },1000);

        btSair = true;
    }else{
        SAIR = true;
    }

}


function atualizaRecorde(f){
    console.log("Atualizando");

    RECORDE = f;
    var pts = document.getElementById("recorde");
    pts.innerHTML = "Recorde:<label>"+(RECORDE)+"</label>";
}

function atualizarRecorde(fs){
    fs.root.getFile(FILE,{create: true, exclusive: false}, function(fileEntry){
        writeFile(fileEntry,RECORDE);    
    }, onErrorLoadFs);
    
}

function checkIfFileExists(path, callback){
    
    if(PLATAFORMA === null){
        return;
    }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024, function(fs){
        fs.root.getFile(path,{},function fileExists(fileEntry){
//            alert("File " + file.fullPath + " exists!");
            callback(fileEntry);
        } , function fileDoesNotExist(){
            createFile(path);
        });
    }, function(e){
        alert('erro checkIfFileExists: '+e.code);
    });
    
}

function writeFile(path, dataObj, isAppend, successEvent) {
    // Create a FileWriter object for our FileEntry (log.txt).
    
    checkIfFileExists(path, function(fileEntry){
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                console.log("Successful file read...");
                readFile(FILE);
            };

            fileWriter.onerror = function (e) {
                console.log("Failed file read: " + e.toString());
            };

            // If we are appending data to file, go to the end of the file.
            if (isAppend) {
                try {
                    fileWriter.seek(fileWriter.length);
                }
                catch (e) {
                    console.log("file doesn't exist!");
                }
            }
            fileWriter.write(dataObj);
        });
    });
}

function readFile(path, successEvent) {
    
    checkIfFileExists(path, function(fileEntry){
        fileEntry.file(function (file) {
            var reader = new FileReader();
            
            reader.onloadend = function() {
                console.log("Successful file read: " + this.result);
    //            displayFileData(fileEntry.fullPath + ": " + this.result);
                  if(successEvent){
                      successEvent(this.result);
                  }
            };

            reader.readAsText(file);
        }, onErrorReadFile);
    });
}

function createFile(path){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024, function(fs){
        fs.root.getFile(path,{ create: true, exclusive: false },function (fileEntry) {
                
            console.log("fileEntry is file? " + fileEntry.isFile.toString());
            // fileEntry.name == 'someFile.txt'
            // fileEntry.fullPath == '/someFile.txt'
                    
            console.log("Criando arquivo");
            writeFile(FILE,RECORDE, null, atualizaRecorde(RECORDE));
                

        }, onErrorCreateFile);
    });
}

function displayFileData(data){
    return data;
}

function onErrorLoadFs(){
    alert("onErrorLoadFs");
}

function onErrorCreateFile(e){
    alert("onErrorCreateFile: "+e.code);
}

function onErrorReadFile(){
    alert("onErrorReadFile");
}

var comida = {
    posX : -1,
    posY : -1,
    color : "#ff0000",
    limpar : "#50beff",
    alterar : false,

    resetar: function(){
        this.posX = -1;
        this.posY = -1;
        this.color = "#ff0000";
        this.limpar = "#50beff";
        this.alterar = false;
    },

    desenha : function(){

        ctx.fillStyle = this.color;
        ctx.fillRect(this.posX, this.posY, TAMANHO, TAMANHO);
    },

    atualiza : function(){
        do{
            var temp = Math.floor(Math.random() * LARGURA);
            this.posX = temp;
        }while(temp % TAMANHO != 0);
        do{
            var temp = Math.floor(Math.random() * ALTURA);
            this.posY = temp;
        }while(temp % TAMANHO != 0);

    }

}

var c = function(posX, posY){
    this.posX = posX;
    this.posY = posY;
};

var snake = {

    corpo : [new c(-1,-1)],
    tamanho : 10,
    color : "#00f",
    largura : TAMANHO,
    altura : TAMANHO,
    direcao : "DIREITA",
    comeu : false,


    andar : function(){

    },

    resetar: function(){
        this.corpo = [new c(-1,-1)];
        this.tamanho = 10;
        this.color = "#00f";
        this.largura = TAMANHO;
        this.altura = TAMANHO;
        this.direcao = "DIREITA";
        this.comeu = false;

    },

    setDirecao: function(direcao){
        if(PAUSE){
            return;
        }
        this.direcao = direcao;
    },

    cresce : function(){
        var cTemp = new Object();
        var lengthCorpo = this.corpo.length;
        cTemp.posX = this.corpo[lengthCorpo-1].posX;
        cTemp.posY = this.corpo[lengthCorpo-1].posY;
        this.corpo.push(cTemp);
        
        lengthCorpo = this.corpo.length;
        
        setTimeout(media.play(), 0);

        var pts = document.getElementById("pontos");
        var pontos = lengthCorpo - 10;
        pts.innerHTML = "Pontos:<label>"+pontos+"</label>";

        if(pontos > RECORDE && PLATAFORMA !== null){
            writeFile(FILE, pontos, null,atualizaRecorde(pontos));
        }

        if(lengthCorpo % 2 === 0){
            this.velocidade("aumentar");
        
            var niv = document.getElementById("nivel");

            niv.innerHTML = "Nível:<label>"+(++NIVEL)+"</label>";  
        }
    },

    velocidade : function(veloc){
        switch(veloc){
            case "aumentar":
                VELOCIDADE++;
                break;
            case "diminuir":
                VELOCIDADE--;
                break;
        }
    },

    desenha : function(){
        ctx.fillStyle = this.color;
        if(this.comeu){
            this.cresce();
            comida.alterar = true;
            this.comeu = false;
        }
        for(var i = 0; i < this.corpo.length; i++){
            ctx.fillRect(this.corpo[i].posX, this.corpo[i].posY, this.largura, this.altura);
        }
    }, 

    atualiza : function(){
        if(this.corpo.length == 0){
            for(var i = 0; i < this.tamanho; i++){
                var cTem = new Object();
                cTem.posY = TAMANHO * this.tamanho;
                cTem.posX = TAMANHO * this.tamanho - (i*TAMANHO);
                this.corpo.push(cTem);
            }
        }else if(this.corpo[0].posX == -1 && this.corpo[0].posY == -1){
            
            this.corpo[0].posY = TAMANHO * this.tamanho;
            this.corpo[0].posX = TAMANHO * this.tamanho;
            for(var i = 1; i < this.tamanho; i++){
                var cTem = new Object();
                cTem.posY = TAMANHO * this.tamanho;
                cTem.posX = TAMANHO * this.tamanho - (i*TAMANHO);
                this.corpo.push(cTem);
            }

        }
        
        
        var cTemp = new Object();
        switch(this.direcao){
            case "DIREITA":
                if(this.corpo[0].posX >= (LARGURA - TAMANHO)){
                    cTemp.posX = 0;
                }else{
                    cTemp.posX = this.corpo[0].posX + TAMANHO;
                }
                cTemp.posY = this.corpo[0].posY;
                this.corpo.splice(this.corpo.length-1,1);
                this.corpo.splice(0, 0, cTemp);//pesquisar http://www.w3schools.com/jsref/jsref_splice.asp
                break;
            case "ESQUERDA":
                if(this.corpo[0].posX <= 0){
                    cTemp.posX = LARGURA - TAMANHO;
                }else{
                    cTemp.posX = this.corpo[0].posX - TAMANHO;
                }
                cTemp.posY = this.corpo[0].posY;
                this.corpo.splice(this.corpo.length-1,1);
                this.corpo.splice(0, 0, cTemp);
                break;
            case "CIMA":
                cTemp.posX = this.corpo[0].posX;
                if(this.corpo[0].posY <= 0){
                    cTemp.posY = ALTURA - TAMANHO;
                }else{
                    cTemp.posY = this.corpo[0].posY - TAMANHO;
                }
                
                this.corpo.splice(this.corpo.length-1,1);
                this.corpo.splice(0, 0, cTemp);
                break;
            case "BAIXO":
                cTemp.posX = this.corpo[0].posX;
                if(this.corpo[0].posY >= (ALTURA - TAMANHO)){
                    cTemp.posY = 0;
                }else{
                    cTemp.posY = this.corpo[0].posY + TAMANHO;
                }
                
                this.corpo.splice(this.corpo.length-1,1);
                this.corpo.splice(0, 0, cTemp);
                break;
            default:
                break;
        }
        if((this.corpo[0].posY === comida.posY) && (this.corpo[0].posX === comida.posX)){
            this.comeu = true;
        }
    }
};

function iniciar(){
    
    if(canvas == null){
        window.location.href = "#page2";
        setTimeout(play, 1000);
    }
}

function play(){
    
    main();
    resume();
}

function main(){
    ALTURA = document.getElementById("swipe").offsetHeight;
    LARGURA = document.getElementById("swipe").offsetWidth;
    while(ALTURA % 10 != 0){
        ALTURA = ALTURA - 1;
    }

    while(LARGURA % 10 != 0){
        LARGURA = LARGURA - 1;
    }
    
    canvas = document.createElement("canvas");
    canvas.width = LARGURA;
    canvas.height = ALTURA;
    canvas.style.border = "1px solid #000";
    canvas.style.boxSizing = "border-box";
    canvas.style.margin = "0 auto";
    

    ctx = canvas.getContext("2d");
    var tela = document.getElementById("swipe");
    tela.appendChild(canvas);
    
    
    startAnimating();
    
}


function startAnimating() {
    
    then = Date.now();
    startTime = then;
    roda();
}


function roda(){
    
    window.requestAnimationFrame(roda);

    fpsInterval = 1000 / VELOCIDADE; //fps

    // calc elapsed time since last loop

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval && !PAUSE) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        atualiza();
        desenha();

    }
}

function atualiza(){
    frames++;

    if((comida.posY == -1 && comida.posX == -1) || (comida.alterar)){
        comida.atualiza();
        comida.alterar = false;
    }
    snake.atualiza();

}

function desenha(){
    ctx.fillStyle = "#50beff";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    
    comida.desenha();
    snake.desenha();
}

function setaComida(){

}

function pausar(){
    PAUSE = true;
}

function resume(){
    PAUSE = false;
}

function pararJogo(){
    canvas = undefined; 
    ctx = {}; 
    ALTURA = 0;
    LARGURA = 0;
    frames = 0;
    TAMANHO = 10;
    VELOCIDADE = 15;
    NIVEL = 1;
    RECORDE = readFile(FILE, atualizaRecorde);
    FILE = "newPersistentFile3.txt";
    PAUSE = true;
    SAIR = false;
    btSair = false;

    stop = false;
    frameCount = 0;
    $results = $("#results");
    fps = 0; 
    fpsInterval = 0; 
    startTime = 0;
    now = 0;
    then = 0; 
    elapsed = 0;
    snake.resetar();
    comida.resetar();

    var tela = document.getElementById("swipe");
    tela.innerHTML="";

    var pts = document.getElementById("pontos");
    var pontos = 0;
    pts.innerHTML = "Pontos:<label>"+pontos+"</label>";

    var niv = document.getElementById("nivel");
    var nivel = NIVEL;
    niv.innerHTML = "Pontos:<label>"+nivel+"</label>";
}
