var canvas, ctx, ALTURA, LARGURA, frames = 0, TAMANHO = 10, VELOCIDADE = 15, NIVEL = 1, FILE = "newPersistentFile.txt";

var stop = false;
var frameCount = 0;
var $results = $("#results");
var fps, fpsInterval, startTime, now, then, elapsed;

var app = {
    
    initialize: function() {
        this.initFastClick();
        this.bindEvents();
        this.initJGesture();
        this.initGame();
        this.initKeyboardEvent();
    },
    
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    initFastClick : function() {
        window.addEventListener('load', function() {
            FastClick.attach(document.body);
        }, false);
    },

    initJGesture: function(){

        window.addEventListener('load', function(){
            jQuery('#swipe').bind('swipeleft',function(){
                snake.direcao = "ESQUERDA";
            });

            jQuery('#swipe').bind('swiperight',function(){
                snake.direcao = "DIREITA";
            });
            jQuery('#swipe').bind('swipeup',function(){
                snake.direcao = "CIMA";
            });
            jQuery('#swipe').bind('swipedown',function(){
                snake.direcao = "BAIXO";
            });
        }, false);
    },

    initKeyboardEvent : function(){
        window.addEventListener('load', function(){
            document.addEventListener('keydown', function(event){
                var tecla = event.keyCode;
                switch(tecla){
                    case 37:
                        snake.direcao = "ESQUERDA";
                        break;
                    case 38:
                        snake.direcao = "CIMA";
                        break;
                    case 39:
                        snake.direcao = "DIREITA";
                        break;
                    case 40:
                        snake.direcao = "BAIXO";
                        break;
                }
            });
        });
    },

    initGame : function(){
         document.addEventListener("mousedown",iniciar);
    },

    onDeviceReady: function() {
        /*
        var fe = checkIfFileExists(FILE)
        if(fe === null){//se arquivo não existe criar
            console.log("Criando arquivo");
            createFile(FILE);
        }else{//arquivo existe
            console.log("Lendo arquivo");
            NIVEL = readFile(fe);
            var pts = document.getElementById("nivel");
            pts.innerHTML = "Nível:<label>"+(NIVEL)+"</label>";
        }
        */

        checkIfFileExists(FILE, readFile);
        
    }//verificar callback de erro e acerto

};

function atualizaPontos(f){

    console.log("Lendo arquivo");
    NIVEL = f;
    var pts = document.getElementById("nivel");
    pts.innerHTML = "Nível:<label>"+(NIVEL)+"</label>";

}

function checkIfFileExists(path, callback){
        
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024, function(fs){
        fs.root.getFile(path,{},function fileExists(fileEntry){
//            alert("File " + file.fullPath + " exists!");
            callback(fileEntry,atualizaPontos);
        } , function fileDoesNotExist(){
            createFile(path);
        });
    }, function(e){
        alert('erro checkIfFileExists: '+e.code);
    });
    
}

function readFile(fileEntry, successEvent) {
    
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
}

function createFile(path){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024, function(fs){
        fs.root.getFile(path,{ create: true, exclusive: false },function (fileEntry) {
                
            console.log("fileEntry is file? " + fileEntry.isFile.toString());
            // fileEntry.name == 'someFile.txt'
            // fileEntry.fullPath == '/someFile.txt'
                    
            console.log("Criando arquivo");
            writeFile(fileEntry,NIVEL);
                

        }, onErrorCreateFile);
    });
}



function writeFile(fileEntry, dataObj, isAppend) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file read...");
            readFile(fileEntry);
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

function atualizarNivel(fs){
    fs.root.getFile(FILE,{create: true, exclusive: false}, function(fileEntry){
        writeFile(fileEntry,NIVEL);    
    }, onErrorLoadFs);
    
}

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

    cresce : function(){
        var cTemp = new Object();
        cTemp.posX = this.corpo[this.corpo.length-1].posX;
        cTemp.posY = this.corpo[this.corpo.length-1].posY;
        this.corpo.push(cTemp);

        var pts = document.getElementById("pontos");
        pts.innerHTML = "Pontos:<label>"+(this.corpo.length - 10)+"</label>";

        if(this.corpo.length % 2 === 0){
            this.velocidade("aumentar");
        
            var pts = document.getElementById("nivel");

            if(NIVEL === undefined || NIVEL === NaN){
                NIVEL = 1;
            }

            pts.innerHTML = "Nível:<label>"+(++NIVEL)+"</label>";  
            
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024, atualizarNivel, onErrorLoadFs);
            
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
        main();

    }
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
    //pagina.removeChild(tela)
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

    if (elapsed > fpsInterval) {

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

function swipe(event, obj){
//    var direction = obj.description;    
//    alert("Direção: "+direction+" Foi mesmo ");

}
