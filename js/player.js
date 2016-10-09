/* Player */
var Player = function (options) {
    this.player = options.player;
    this.diy = options.diyplayer;
    this.currentAudioId = 0;
    this.songLength = 0;
    this.isPlaying = false;
    this.playTimer = 0;
    this.totalTime = 0;
    this.currentTime = 0;
    this.loopMode = 0;
    this.volumeValue = .8;
    this.init();
};

Player.fn = Player.prototype;

Player.fn.setAudioListApi = function (apis) {
    this.listApis = apis;
    return apis.length;
};

Player.fn.init = function () {
    this.setVolume(.8);
    this.bindEvents();
    return this;
};

Player.fn.play = function () {
    this.player.play();
    this.isPlaying = true;
    this.diy.playBtn.className = 'pause';
    this.playTimer = setInterval((function(that) {
        return function () {
            that.update.call(that);
        };
    })(this), 1000);
    return this;
};

Player.fn.pause = function () {
    this.player.pause();
    this.isPlaying = false;
    this.diy.playBtn.className = 'play';
    clearInterval(this.playTimer);
    return this;
};

Player.fn.prev = function () {
    if (--this.currentAudioId < 0) {
        this.currentAudioId = this.songLength - 1;
    }
    this.goto(this.currentAudioId);
    this.diy.speed.speedNum.innerHTML = 'Speed: 1.0';
    return this;
};

Player.fn.next = function () {
    if (++this.currentAudioId >= this.songLength) {
        this.currentAudioId = 0;
    }
    this.goto(this.currentAudioId);
    this.diy.speed.speedNum.innerHTML = 'Speed: 1.0';
    return this;
};

Player.fn.goto = function (id) {
    this.listApis && this.listApis.goto && this.listApis.goto(id);
    return this;
};

Player.fn.formatSec = function (f, e) {
    var s = f%60, m = (f-s)/60, a = '';
    if (e) a += '-';
    a += m>9?m:'0'+m;
    a += ':';
    a += s>9?s:'0'+s;
    return a;
};

Player.fn.updateTime = function () {
    this.currentTime = this.getCurrentTime();
    this.totalTime = this.getTotalTime();
    return this;
};

Player.fn.setCurrentTime = function (a) {
    this.player.currentTime = a;
    return this;
};

Player.fn.getCurrentTime = function () {
    return Math.round(this.player.currentTime);
};

Player.fn.getTotalTime = function () {
    return Math.floor(this.player.duration);
};

Player.fn.update = function () {
    this.updateTime();
    this.diy.process.value = this.currentTime;
    this.diy.process.max = this.totalTime;
    this.diy.time.current.innerHTML = this.formatSec(this.currentTime, false);
    if (this.totalTime) this.diy.time.total.innerHTML = this.formatSec(this.totalTime - this.currentTime, true);
    return this;
};

Player.fn.setVolume = function (val) {
    this.player.volume = val;
    this.volumeValue = val;
    return this;
};
Player.fn.toggleMute = function () {
    if (this.player.muted) {
        this.player.muted = false;
        this.diy.volume.value = this.volumeValue * 100;
    } else {
        this.player.muted = true;
        this.diy.volume.value = 0;
    }
    return this;
};

Player.fn.toggleLoopMode = function () {
    this.loopMode = this.loopMode? 0 : 1;
    this.diy.loop.single.className = this.loopMode? 'active' : '';
    return this;
};

Player.fn.increaseSpeed = function () {
    this.player.playbackRate += 0.1;
    this.diy.speed.speedNum.innerHTML = 'Speed: '+ this.player.playbackRate.toFixed(1);
    return this;
};

Player.fn.decreaseSpeed = function () {
    if (this.player.playbackRate > 0.1) {
        this.player.playbackRate -= 0.1;
        this.diy.speed.speedNum.innerHTML = 'Speed: '+ this.player.playbackRate.toFixed(1);
    }
    return this;
};

Player.fn.bindEvents = function () {
    var that = this;
    
    var handleFinishPlaying = function () {
        that.diy.playBtn.className = 'play';
        if (that.loopMode) {
            that.goto.call(that, that.currentAudioId);
        } else {
            that.next.call(that);
        }
    };
    var handlePlayBtn = function () {
        that[that.isPlaying?'pause':'play'].call(that);
    };
    var handleChProcess = function () {
        that.setCurrentTime.call(that, parseInt(that.diy.process.value, 10));
    };
    var handleChVolume = function () {
        that.setVolume.call(that, parseInt(that.diy.volume.value, 10)/100);
    };
    var handleIncSpeed = function () {
        that.increaseSpeed();
    };
    var handleDecSpeed = function () {
        that.decreaseSpeed();
    };
    var handleNextBtn = function () {
        that.next.call(that);
        // that.next.call(that);
    };
    var handlePrevBtn = function () {
        that.prev.call(that);
    };
    var handleLoopBtn = function () {
        that.toggleLoopMode.call(that);
    };
    var openHelp = function () {
        that.diy.help.page.style.display = 'block';
    };
    var closeHelp = function () {
        that.diy.help.page.style.display = 'none';
    };
    var handleKeyPress = function (e) {
        e.stopPropagation();
        e.preventDefault();
        switch (e.keyCode) {
            case 32:    // Space
            case 80:    // P
                handlePlayBtn();
                break;
            case 38:    // ↑
                handlePrevBtn();
                break;
            case 40:    // ↓
                handleNextBtn();
                break;
            case 37:    // ←
                that.diy.volume.value -= 5;
                handleChVolume();
                break;
            case 39:    // →
                that.diy.volume.value = 5 + parseInt(that.diy.volume.value, 10);
                handleChVolume();
                break;
            case 88:    // X
                handleIncSpeed();
                break;
            case 90:    // Z
                handleDecSpeed();
                break;
            case 188:   // <
                that.diy.process.value -= 5;
                handleChProcess();
                break;
            case 190:   // >
                that.diy.process.value = 5 + parseInt(that.diy.process.value, 10);
                handleChProcess();
                break;
            case 219:   // [
                that.diy.process.value -= 30;
                handleChProcess();
                break;
            case 221:   // ]
                that.diy.process.value = 30 + parseInt(that.diy.process.value, 10);
                handleChProcess();
                break;
            case 82:    // R
                location.reload();
                break;
            case 77:    // M
                that.toggleMute.call(that);
                break;
            case 76:    // L
                that.toggleLoopMode.call(that);
                break;
            case 27:    // L
                closeHelp();
                break;
            case 191:    // ?
                (that.diy.help.page.style.display=='block'?closeHelp:openHelp)();
                break;
        }
        return false;
    };
    
    this.player.addEventListener('ended', handleFinishPlaying, false);
    this.diy.playBtn.addEventListener('click', handlePlayBtn, false);
    this.diy.volume.addEventListener('change', handleChVolume, false);
    this.diy.switchBtn.next.addEventListener('click', handleNextBtn, false);
    this.diy.switchBtn.prev.addEventListener('click', handlePrevBtn, false);
    this.diy.process.addEventListener('change', handleChProcess, false);
    this.diy.loop.single.addEventListener('click', handleLoopBtn, false);
    this.diy.help.closeBtn.addEventListener('click', closeHelp, false);
    document.addEventListener('keydown', handleKeyPress, false);
    return this;
};

Player.fn.finishLoad = function (id, name) {
    this.currentAudioId = id;
    this.diy.name.innerHTML = name;
    this.diy.name.title = name;
    this.update();
    this.play();
};

/* Play List */
var List = function (options) {
    this.options = options;
//    console.log(this.options);
    this.init();
};

List.fn = List.prototype;

List.fn.init = function () {
//    console.log(this.options.dropPlace);
    this.bindEvents();
};

List.fn.load = function (files) {
    var that = this;
    this.audios = [];
    // 過濾文件
    Array.prototype.forEach.call(files, function(file){
        if (that.options.allowAudioTypes.indexOf(file.type)>=0) {
            that.audios.push(file);
        }
    });
//    console.log(this.audios);
    this.options.dropPlace.style.display = 'none';
    this.options.finishInit.call(this, this.audios.length);
    return this;
};

List.fn.render = function () {
    var tplData = [];
    var rename = this.options.rename ||
        function (name) { return name.replace(/\.\w{2,5}$/, '') };

    var rand = function (m, n) {
        return m + Math.round(Math.random()*(n-m));
    };
    var randCLr = function (dark) {
        var t = [];
        for (var i=0; i<3; i++) {
            t.push( dark? rand(0, 128) : rand(190, 255) );
        }
        return t.join(',');
    };

    this.audios.forEach(function(audio, id){
        tplData.push({
            'id' : id,
            'name' : rename(audio.name),
            'bg' : randCLr(),
            'clr' : randCLr(true)
        });
    });

    this.options.listPlace.innerHTML = Mustache.render(this.options.listTpl, { 'lst' : tplData });
    this.options.listPlace.style.display = 'block';
    this.get(0);
    this.reCalcLstPadding();
    return this;
};

List.fn.reCalcLstPadding = function () {
    var links = this.options.listPlace.querySelectorAll('a');
    var winWidth = document.width;
    var stillLoop = true;
    var sumWidth = 0;
    var rowRange = {
        'start' : 0,
        'end' : 0
    };

    var setPadding = function (val) {
        var a = this.style;
        val += 29;
        a.paddingLeft = val + 'px';
        a.paddingRight = val + 'px';
    };

    var i;

    while (stillLoop) {
        rowRange.end = links.length;
        sumWidth = 0;
        for ( i = rowRange.start; i < rowRange.end; i++ ) {
//            console.log(links[i]);
            sumWidth += links[i].clientWidth;
            if ( sumWidth > winWidth ) {
//                if ( i === rowRange.start ) break;
                rowRange.end = i;
                sumWidth -= links[i].clientWidth;
                break;
            }
        }
        //計算padding
        var addPaddingValue = (winWidth - sumWidth) / (rowRange.end - rowRange.start) /2;
        //Apply padding
        for ( i = rowRange.start; i < rowRange.end; i++ ) {
            setPadding.call( links[i], addPaddingValue );
        }
        if (rowRange.end === links.length) stillLoop = false;
        rowRange.start = i;
    }

};

List.fn.get = function (id) {
    id = parseInt(id, 10);
    if (this.audios && this.audios[id]) {
        var reader = new FileReader();

        var that = this;
        var handleLoad = function (evt) {
            that.options.audioPlayer.src = evt.target.result;
            that.options.audioPlayer.load();
            // Callback player api
            that.options.finishAudioLoad && that.options.finishAudioLoad(id, that.audios[id].name);
            that.options.speed.speedNum.innerHTML = 'Speed: 1.0';
        };
        var handleError = function (evt) {
            console.log(evt);
            alert('读取失败！');
        };

        reader.addEventListener('load', handleLoad, false);
        reader.addEventListener('error', handleError, false);
        reader.readAsDataURL(this.audios[id]);
        that.options.audioPlayer.type = this.audios[id].type;

        that.options.showLoading();

        return true;
    } else {
        return false;
    }
};

List.fn.sort = function () {

    return this;
};

List.fn.bindEvents = function () {
    var that = this;
    var handleDragover = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        return false;
    };
    var handleDrop = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        that.load.call(that, evt.dataTransfer.files).render.call(that);
        return false;
    };
    var handleAudioClick = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var link = evt.target || false;
        if (link && link.tagName.toUpperCase() == 'A' && link.dataset.aid) {
            that.get(link.dataset.aid);
        }
        return false;
    };

    that.options.dropPlace.addEventListener('dragover', handleDragover, false);
    that.options.dropPlace.addEventListener('drop', handleDrop, false);
    that.options.listPlace.addEventListener('click', handleAudioClick, false);
};

/* Main */
var player = new Player({
    'player' : document.querySelector('#audio-player'),
    'diyplayer' : {
        'playBtn' : document.querySelector('#play-btn'),
        'switchBtn' : {
            'next' : document.querySelector('#next-btn'),
            'prev' : document.querySelector('#prev-btn')
        },
        'name' : document.querySelector('#audio-name'),
        'volume' : document.querySelector('#audio-volume'),
        'process' : document.querySelector('#audio-process'),
        'time' : {
            'current' : document.querySelector('#audio-time-current'),
            'total' : document.querySelector('#audio-time-total')
        },
        'speed': {
            'speedNum' : document.querySelector('#play-speed')
        },
        'loop' : {
            'single' : document.querySelector('#loop-single')
        },
        'help' : {
            'page' : document.querySelector('#pop-win-wrapper'),
            'closeBtn' : document.querySelector('#pop-win-wrapper .close-btn')
        }
    }
});


var lst = new List({
    'dropPlace' : document.querySelector('#drop-place'),
    'listPlace' : document.querySelector('#audio-list'),
    'audioPlayer' : document.querySelector('#audio-player'),
    'allowAudioTypes' : ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav'],
    'listTpl' : document.querySelector('#audio-list').innerHTML,
    'rename' : function (name) {
        return name.replace(/^\d+\b|\.\w{2,5}$/g, '');
    },
    'finishAudioLoad' : function (id, name) {
        player.finishLoad.call(player, id, name.replace(/\.\w{2,5}$/g, ''));
    },
    'showLoading' : function () {
        player.diy.name.innerHTML = 'Loading...';
    },
    'finishInit' : function (l) {
        player.songLength = l;
    },
    'speed': {
        'speedNum' : document.querySelector('#play-speed')
    }
});

player.setAudioListApi({
    'goto' : function (id) {
        lst.get.call(lst, id);
    }
});