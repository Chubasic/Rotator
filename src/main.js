
const EventEmitter = require('events');
const emitter = new EventEmitter();
const xhr = new XMLHttpRequest();
const apiURL = 'http://88.99.189.230/test.json';


class Rotator{
    constructor(apiData = '', vidCount = 0, player = ''){
        this.apiData = apiData;
        this.innerPlayer = document.getElementById('vidPlayer');
        this._vidCount = vidCount;
        this.player = player;
    }

    set vidCount(num){
        if(this._vidCount < this.apiData.length){
            this._vidCount += num;
        }else {
            emitter.emit('allPlayersCompleted');
        }
    }

    sendURL(){
        console.log('Sending URI to player');
        console.log(this._vidCount + ' video number');
        this.player.url = this.apiData[this._vidCount];
        this.eventCheck();
    }

    eventCheck(){
        if(this._vidCount < this.apiData.length){//Where is your DRY dude?
            console.log('Checking for event\'s');
            emitter.on('error', () =>{
                console.error("Error occurs, playing next video");
            });
            emitter.on('allPlayersCompleted', () => {
                console.info('allPlayersCompleted');
                emitter.removeAllListeners('ended');
            });
            emitter.on('ended', () => {
                console.log('ended');
                this.vidCount = 1;
                this.sendURL();
                this.player.playVideo();
            });
            this.innerPlayer.addEventListener('ended', (e) => {
                emitter.emit(e.type);
            });
            }else {return;}
    }


    extractData(res){
        console.log('Extract');
        //this.apiData = res['urls'];
        this.apiData = Object.keys(res['urls']).map(key =>res['urls'][key]);
        this.player = new Player(this.apiData[this._vidCount], this.innerPlayer);
        this.player.url = this.apiData[this._vidCount];
        this.player.playVideo();
        this.sendURL();
    }
}

class Player{
    constructor(url = '', video){
        this._url = url;
        this.video = video;
        console.log(this.video);
        //console.log(this._url);
    }
    set url(value){
        if(value !== undefined){
            this._url = value;
        }else{
            console.log('None');
        }
    }

    static playerPrefs(vidElem){
        vidElem.addEventListener('error', (e) => {
            emitter.emit('ended');
            console.log(e.type);
            emitter.emit(e.type);
        });
    }

    playVideo(){
        console.log(this.video);
        this.video.setAttribute('src', this._url);
        this.video.play().then(() =>{
            console.info('Status OK')
        }).catch((error) =>{
            //console.log(error);
            Player.playerPrefs(this.video);
        });
    }

}


let instance = new Rotator();
request();


function request(){
    const promise = new Promise(function (resolve, reject) {
        xhr.open('GET', apiURL, true);
        xhr.onreadystatechange = () => {
            xhr.onload = () =>{
                if (xhr.readyState === 4 && xhr.status === 200) {
                    console.log(`Request to server.  Status ${xhr.statusText}`);
                    let data;
                    resolve(data = JSON.parse(xhr.responseText));
                    instance.extractData(data);
                } else {
                    console.log(xhr.statusText);
                    console.log(xhr.readyState);
                }
            };
            xhr.onerror = () =>{
                reject(xhr.statusText);
            }
        };
        xhr.send();
    });

}



