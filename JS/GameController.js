var canvas, ctx, estadoAtual, record, 

pontosParaNovaFase = [5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100],
faseAtual = 0,
labelNovaFase = "Tutorial",

estados = {
    jogar: 0,
    jogando: 1,
    perdeu: 2
},

background = {
    desenha: function() {
        if(estadoAtual == estados.jogando || estadoAtual == estados.perdeu)
        ctx.drawImage(imgGame,0,0)
    }
},

paredeSuperior = {
    y: 80,
    atualiza: function() { //Se eu ultrapassar o y limite do mapa, ele me puxa de volta.
        if(this.y > player.y1){
            player.y1 = this.y
        }
    },
},

paredeInferior = {
    y: 420,
    atualiza: function() {
        if(this.y < player.y2){
            player.y1 = this.y - (player.y2 - player.y1)
        }
    },
},

paredeDireita = {
    x: 950,
    atualiza: function() {
        if(this.x < player.x2){
            player.x1 = this.x - (player.x2 - player.x1)//A posição da barreira menos a largura do personagem 
        }
    },
},

paredeEsquerda = {
    x: 50,
    atualiza: function() {
        if(this.x > player.x1){
            player.x1 = this.x
        }
    },
},

player = {
    x1: 300, //lado esquerdo do personagem
    y1: 200, //lado superior
    x2: 340, //lado direito
    y2: 255, //lado inferior
    teclasPressionadas: [],
    velocidade: 4, //velocidade de movimento
    mana: 50, //carga para liberar o ataque
    score: 0, //placar
    vidas: 3, 
    colidindo: false, //não está em contato com um monstro
    imunidade: false, //não esta com o efeito de imunidade, que dura alguns segundos depois de colidir.

    atualiza: function() {
        this.move(this.teclasPressionadas) 
        this.x2 = this.x1 + 40
        this.y2 = this.y1 + 55
        this.velocidade = 3 + (faseAtual + 1) ** 1/2 //formula que define a velocidade do player
        this.manaControl()
        if(this.imunidade) //se o player estiver com imunidade, sua velocidade é 8
            this.velocidade = 8

        if (faseAtual < pontosParaNovaFase.length && player.score >= pontosParaNovaFase[faseAtual])
         //se o player possuir o score nescessário para passar de fase
            PassarDeFase()
                    
    },

    reset: function() { //volta às configurações padrões
        faseAtual = 0,
        this.x1 = 300,
        this.y1 = 200,
        this.velocidade = 3 + (faseAtual + 1) ** 1/2,
        this.mana = 50,
        this.score = 0,
        this.vidas = 3,
        colidindo = false,
        imunidade = false;
    },
    
    move: function(teclasPressionadas) { //controla o movimento do player
        xDir=0
        yDir=0

        if(teclasPressionadas['a'] && teclasPressionadas['w']) 
        { this.xDir--; this.yDir--; }
        if(teclasPressionadas['a'] && teclasPressionadas['s']) 
        { this.xDir--; this.yDir++; }
        if(teclasPressionadas['d'] && teclasPressionadas['w']) 
        { this.xDir++; this.yDir--; }
        if(teclasPressionadas['d'] && teclasPressionadas['s']) 
        { this.xDir++; this.yDir++; }


        player.x1 += xDir * this.velocidade
        player.y1 += yDir * this.velocidade
    },
    
    manaControl: function(){ //controla a mana
        if(this.mana < 100)
            this.mana += 0.2

        if(this.mana < 20)
            this.velocidade = 1 //se o player estiver com menos de 20 de mana, sua velocidade cai para 1
    },

    desenha: function() {
        ctx.drawImage(imgPlayer, this.x1, this.y1)
    }
},

inimigos = {
    _ini: [], //vetor que armazena todos os inimigos
    _scored: false, //se ele foi o não pontuado
    timerInsere: 0, //tempo de inserção

    insere: function() {
        this._ini.push({ //atribui os status à um novo inimigo
            x1: Math.random() * 1000,
            y1: 30,
            x2: this.x1 + 40,
            y2: this.y2 + 40,
            velocidade: (faseAtual + 1) ** 1/2,
        });

        this.timerInsere = 30 + Math.floor(500/(faseAtual + 1) * Math.random()) 
        //formula que define o tempo entre o surgimento dos monstros
    },

    atualiza: function() {
        if (this.timerInsere == 0) //se o timer chegou a zero, um novo montro surge
            this.insere()

        else
            this.timerInsere--

        for (var i = 0, tam = this._ini.length; i < tam; i++) { //atualiza todos os montros, um por um
            var obj = this._ini[i] //cria uma variável referente à um inimigo
            obj.x2 = obj.x1 + 40
            obj.y2 = obj.y1 + 40

            //Inteligência artificial do monstro
            if(obj.x1 > player.x1)
                obj.x1 -= obj.velocidade;
            
            else if(obj.x1 < player.x1)
                obj.x1 += obj.velocidade;

            if(obj.y1 > player.y1)
                obj.y1 -= obj.velocidade;

            else if(obj.y1 < player.y1)
                obj.y1 += obj.velocidade;

            if(obj.x2 >= player.x1 && obj.x1 <= player.x2 && obj.y1 <= player.y2 - 20 && obj.y2 >= player.y1 + 20) //verifica colisão
            player.colidindo = true;
            else
            player.colidindo = false;

            if (player.vidas >= 1 && player.colidindo && !player.imunidade) 
            //se o player ainda tiver vidas, se ele estiver colidindo e se não estiver imune
                {
                    player.vidas--;
                    player.imunidade = true;
                    setTimeout(function() { 
                        //após ativar a imunidade, um timer começa a rodar, e quando ele acabar, a imunidade acaba e a velocidade volta ao normal
                        player.velocidade = 3 + (faseAtual + 1) ** 1/2;
                        player.imunidade = false;
                    }, 3000);
                }
                else if(player.vidas <= 0) {
                    if (player.score > record) { //se o player possui uma pontuação maior que o recorde dele.
                        record = player.score;
                        localStorage.setItem("record", player.score);
                    }
                    estadoAtual = estados.perdeu
                }

            if(obj.x2 >= explosion.x1 && obj.x1 <= explosion.x2 && obj.y1 <= explosion.y2 && obj.y2 >= explosion.y1 && !obj._scored && explosion.carga > 90){
                player.score++; //se o inimigo colidiu com a explosão, ele é pontuado.
                obj._scored = true;
            }
            
            if (obj._scored) { //se ele foi pontuado, ele é excluido do vetor.
                this._ini.splice(i, 1);
                tam--;
                i--;
            }
        }
    },

    limpa: function() {
        this._ini = []; //limpa o vetor
    },

    desenha: function() {
        for (var i = 0, tam = this._ini.length; i < tam; i++) {//desenha todos os monstros presentes no vetor
            var obj = this._ini[i];

            ctx.drawImage(imgMonstro, obj.x1, obj.y1);
        }
    }
};

explosion = {
    r: 100,
    x1: -1000,
    x2: -800,
    y1: -1000,
    y2: -800,
    locX: -1000,
    locY: -1000,
    carga: 100,

    atualiza: function(x, y){
        this.x1 = this.locX - this.r
        this.x2 = this.locX + this.r
        this.y1 = this.locY - this.r
        this.y2 = this.locY + this.r
        if(player.mana >= 70)
        {
            //se o player clicou e sua mana for maior= que 70, o poder da explosão passa para 100, 
            //é descontado 70 da mana, e o audio da explosão é tocado
            this.carga = 100; 
            player.mana -= 70;
            audExplo.play()
        }
    },

    reduzirCarga: function(){
        if(this.carga > 0) //A cada looping, a carga da explosão vai se reduzindo(inimigos só são mortos por explosões que tenham a carga acima de 90)
            this.carga--; 
    },
    
    desenha: function() {
        if(this.carga <= 100)
        {   //realiza um fadout da imagem da explosão
            ctx.globalAlpha = this.carga / 100;
            ctx.drawImage(imgExplosao, this.x1, this.y1);
            ctx.globalAlpha = 1
        }
    }
}

function PassarDeFase() {
    faseAtual++
    player.vidas++
    labelNovaFase = "Level " + faseAtual;
}

function Load() {
    canvas = document.getElementById("gameCanvas")
    ctx = canvas.getContext("2d")
    btnIncio = document.getElementById("hub")
    btnControles = document.getElementById("control")
    btnJogar = document.getElementById("play")
    btnAgain = document.getElementById("playAgain")
    btnVoltar = document.getElementById("hubBack")

    document.addEventListener("mousedown", MousePressed)
    ctx.drawImage(imgHub,0,0)

    record = localStorage.getItem("record"); //chama o dado "record" que está gravado no armazém local
    if (record == null)
        record = 0;
    //PlayAudio() O google barra, 
}

function Start(){
    btnJogar.style.visibility = "hidden"; //esconde os botões
    btnIncio.style.visibility = "hidden";
    btnControles.style.visibility = "hidden";

    ctx.drawImage(imgGame,0,0)
    audio.play()
    estadoAtual = estados.jogando
    Run()
}

function MenuControl(){
    ctx.drawImage(imgControles,0,0)
    audio.play()
}

function MenuHub() {
    ctx.drawImage(imgHub,0,0)
    audio.play()
}

function Run() {
    document.addEventListener('keydown', (event) => {
        player.teclasPressionadas[event.key] = true;
        console.log(event.key)
     });
     
     document.addEventListener('keyup', (event) => {
        delete player.teclasPressionadas[event.key];
        console.log(event.key)
     });
    Atualizar()
    Desenhar()
    //A cada frame, o programa chama o método Run que atualiza e desenha o jogo
    window.requestAnimationFrame(Run)
}

function Atualizar() {
    if (estadoAtual == estados.jogando)
    {
        player.atualiza()
        inimigos.atualiza()
        paredeDireita.atualiza()
        paredeEsquerda.atualiza()
        paredeSuperior.atualiza()
        paredeInferior.atualiza()
    }
}

function Desenhar() {
    if(estadoAtual == estados.jogando)
    {
        background.desenha()
        player.desenha()
        inimigos.desenha()
        explosion.reduzirCarga()
        explosion.desenha()

        ctx.fillStyle = "#ad0c0c"
        ctx.font = "bold 50px Arial"
        ctx.fillText(`${player.vidas}♥`, 850, 400) //vidas
        
        ctx.fillStyle = "#ffff"
        ctx.fillText(player.score, 30, 68) //pontuação

        ctx.fillStyle="#22cdda"
        ctx.fillRect(60, 385, player.mana, 20) //barra de mana
        ctx.rect(60, 385, 100, 20)
        ctx.lineWidth = 2
        ctx.strokeStyle = 'white'
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)" //fase atual
        ctx.fillText(labelNovaFase, canvas.width / 2 - ctx.measureText(labelNovaFase).width / 2, canvas.height / 4)
    }
    if(estadoAtual == estados.perdeu)
    {
        background.desenha()
        player.desenha()
        inimigos.desenha()
        explosion.desenha()

        //texto de fim de jogo
        ctx.fillStyle = "#ad0c0c"
        ctx.font = "bold 50px Arial"
        ctx.fillText('Game Over', canvas.width / 2 - ctx.measureText('Game Over').width / 2, canvas.height / 3)

        ctx.fillStyle = "#ff6600"
        ctx.font = "bold 25px Arial" //Pontuação e recorde
        ctx.fillText(`Pontuação:${player.score}`, canvas.width / 2 - ctx.measureText(`Pontuação:${player.score}`).width / 2, canvas.height / 2 - 50)
        ctx.fillText(`Recorde:${record}`, canvas.width / 2 - ctx.measureText(`Recorde:${record}`).width / 2, canvas.height / 2 - 20)
        
        //torna visível dois botões de voltar e jogar novamente
        btnVoltar.style.visibility = "visible"
        btnAgain.style.visibility = "visible"
    }

}

function MousePressed(event) { //função que identifica quando o botão esquerdo do mouse é clicado
    if(event.button == 0)
    {
        explosion.locX = event.clientX - 180
        explosion.locY = event.clientY
        explosion.atualiza()
    }
}

function Resetar(){ //reseta o jogo
    inimigos.limpa()
    player.reset()
    faseAtual = 0
    estadoAtual = estados.jogando
    btnAgain.style.visibility = "hidden"
    btnVoltar.style.visibility = "hidden"
    Start()
}

function HubBack(){ //volta para o menu
    inimigos.limpa()
    player.reset()
    estadoAtual = estados.jogar
    btnAgain.style.visibility = "hidden"
    btnVoltar.style.visibility = "hidden"
    btnIncio.style.visibility = "visible"
    btnJogar.style.visibility = "visible"
    btnControles.style.visibility = "visible"

    MenuHub()
}