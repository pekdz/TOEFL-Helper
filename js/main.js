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