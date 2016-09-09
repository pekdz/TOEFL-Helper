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