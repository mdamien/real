(function() {
    var EDITOR_MODES = {DRAW:'draw', ERASE:'erase', SPAWN:'spawn'};

    this.parse_url_params = function() {
        window.location.hash.slice(1).split('|').forEach(function(param){
            var kv = param.split(':');
            if(kv.length == 1){
                kv.push(true);
            }
            if(kv[1] == 'false'){
                kv[1] = false;
            }
            if(kv[1] == 'true'){
                kv[1] = true;
            }
            URL_PARAMS[kv[0]] = kv[1];
        })
    }

    var URL_PARAMS = {
        'new': false,
        editor: false,
        editor_mode: EDITOR_MODES.DRAW,
        lvl: 'lvl2',
    };
    this.parse_url_params();
    console.log(URL_PARAMS);
    
    var Ticker = createjs.Ticker;
    var gipCanvas;
    var stage;
    
    var box2dUtils; 
    var context;
    var SCALE = 30;
    var world;
    var canvasWidth, canvasHeight;

    var curr_line = null;
    var isMouseDown = false;
    var canvasPosition;

    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2AABB = Box2D.Collision.b2AABB;
    var b2Body = Box2D.Dynamics.b2Body;
    
    var pigs = [];
    
    var lines = [];
    var indicators = [];

    var new_bg_modal = URL_PARAMS['new'];
    var game_parameters_modal = false;

    var lines_parent = null;
    var bg_parent = null;
    var indicators_parent = null;
    var editor_parent = null;

    var editor_activated = URL_PARAMS['editor'];
    var editor_mode = URL_PARAMS['editor_mode']

    var free_move_camera = true;

    var loaded_queue = new createjs.LoadQueue();

    var drawing = false; //drawing a line ?

    var vp = {
        x:0,
        y:0,
        zoom:1,
        container: new createjs.Container(),
    }

    var lvl = null;
    
    var player = null, background = null, bg_parent = null;
    var keys = [];

    var touch_pointers = {};

    var redo_lines = [];

    var paused = false;

    $(document).ready(function() {
        load();
    });

    this.load = function() {
        $('#loading').html("loading game")
        $('#loading').show()
        loaded_queue.on("complete", function(){
            $('#loading').hide()
            init()
        }, this);
        loaded_queue.loadManifest([
            {id: "bird", src:"img/bird.png"},
        ]);
    }
    
    this.init = function() {
        prepareStage();     
        prepareBox2d();    

        bg_parent = new createjs.Container();
        vp.container.addChild(bg_parent);
        editor_parent = new createjs.Container();
        vp.container.addChild(editor_parent);
        indicators_parent = new createjs.Container();
        editor_parent.addChild(indicators_parent);
        lines_parent = new createjs.Container();
        editor_parent.addChild(lines_parent);

        player = new Player(vp.container, SCALE, loaded_queue.getResult('bird'));
        player.createPlayer(world, 0, 0, 16);

        this.load_level(LEVELS[URL_PARAMS['lvl']], function(){ 
            addContactListener();

            $('#gipCanvas').on('mousedown', handleMouseDown.bind(this));
            $('#gipCanvas').on('mouseup', handleMouseUp.bind(this));
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            $('#gipCanvas').on('mousemove', handleMouseMove.bind(this));

            createjs.Touch.enable(stage);
            stage.addEventListener('pressmove', handlePressMove);
            stage.addEventListener('pressup', handlePressUp);

            $('#editor-background').on('change', this.editor_load_bg.bind(this))
            $('#editor .undo').on('click', this.editor_undo.bind(this))
            $('#editor .redo').on('click', this.editor_redo.bind(this))
            $('#editor .draw').on('click', this.editor_draw_mode.bind(this))
            $('#editor .erase').on('click', this.editor_erase_mode.bind(this))
            $('#editor .spawn').on('click', this.editor_spawn_mode.bind(this))

            //Parameters form input
            $('button.validate-parameters').on('click', this.game_parameters_validate.bind(this));
            $('button.cancel-parameters').on('click', this.game_parameters_cancel.bind(this));

            window.onresize = function(){ onResize(); }
            onResize();
            
            this.editor_on_off();
            this.modal_on_off();

            document.onkeydown = function(event) {
                return event.keyCode != 38 && event.keyCode != 40;
            }

            startTicker(30);
        }.bind(this));
    }

    this.load_level_by_url = function(url, next){
        console.log('load url:',url);
        $.getJSON(url,function(new_lvl){
            this.load_level(new_lvl, next);
        }.bind(this))
    }

    this.load_level = function(new_lvl, next){
        console.log(new_lvl)
        //this.load_level_by_url('levels/demo.json')
        var queue = new createjs.LoadQueue();

        $('#loading').html("loading level")
        $('#loading').show()
        queue.on("complete", function(){
            $('#loading').hide();
            new_lvl.bg.img = queue.getResult("bg");
            //console.log(new_lvl.bg.img)
            load_level_post(new_lvl, next);
        }, this);
        queue.loadManifest([
            {id: "bg", src:new_lvl.bg.src},
        ]);
    }

    this.load_level_post = function(new_lvl, next){
        lvl = new_lvl;

        bg_parent.removeAllChildren();
        background = new Background(bg_parent, new_lvl.bg.scale, new_lvl.bg);
        bg_parent.addChild(background.skin);

        this.reset_lines();
        addLines(new_lvl.lines);

        refreshIndicators();

        if(new_lvl.gravity) {
            world.SetGravity(new b2Vec2(0, new_lvl.gravity))
        }else{
            world.SetGravity(new b2Vec2(0, 10))
        }

        this.update_form_parameter_gravity(new_lvl.gravity);
        this.update_form_parameter_scale(new_lvl.bg.scale);
        this.update_form_parameter_jetpack(player.jetpack_activated);

        player.setPos(lvl.player.start.x, lvl.player.start.y)
    
        if(next !== undefined){
            next()
        }
    }

    this.update_form_parameter_gravity = function(new_gravity) {
        if (typeof new_gravity === "number")
            $('#gravity').val(new_gravity);
    }

    this.update_form_parameter_scale = function(new_scale) {
        if (typeof new_scale === "number")
            $('#scale-parameter').val(new_scale);
    }

    this.update_form_parameter_jetpack = function(jetpack_enabled) {
        $('#jetpack').prop('checked', jetpack_enabled);
    }


    this.save_level = function(){
        var a = document.getElementById('save');
        var data = JSON.stringify(lvl);
        a.href = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
        a.click();
    }

    this.editor_on_off = function(){
        editor_parent.visible = editor_activated;
        $('#editor').toggle(editor_activated);
        $('#editor button').toggleClass('active', false)
        $('#editor button.'+editor_mode).toggleClass('active', true)

        //remove selected lines
        lines.forEach(function(l){
            if(l.selected){
                l.selected = false;
            }
            l.update_graphics();
        });
    }
    
    this.modal_on_off = function(){
        $('#new_level').toggle(new_bg_modal);
        $('#game_parameters').toggle(game_parameters_modal);
    }
    
    this.prepareStage = function() {
        gipCanvas = $('#gipCanvas').get(0);
        canvasPosition = $(gipCanvas).position();
        stage = new createjs.Stage(gipCanvas);
        easelJsUtils = new EaselJsUtils(stage);
        stage.addChild(vp.container)
    };
    
    
    this.prepareBox2d = function() {
        context = gipCanvas.getContext('2d');
        box2dUtils = new Box2dUtils(SCALE);
        world = box2dUtils.createWorld(context); 
    };

    this.editor_load_bg = function(evt) {
        Ticker.setPaused(false);

        var tgt = evt.target || window.event.srcElement,
            files = tgt.files;

        if (files && files.length) {
            var fr = new FileReader();
            fr.onload = function () {
                var img = new Image();
                img.onload = function() {
                    var new_lvl = {
                        player:{
                            start:{
                                x:5,
                                y:3
                            }
                        },
                        bg:{
                            src: fr.result,
                            scale: parseFloat($('#scale').val()),
                            img: img
                        },
                        lines: []
                    };
                    load_level_post(new_lvl, function(){
                        new_bg_modal = false;
                        game_parameters_modal = false;
                        paused = false;
                        editor_activated = true;
                        editor_on_off();
                        modal_on_off();
                        display_help();
                    });
                }
                img.src = fr.result;
            }
            fr.readAsDataURL(files[0]);
        }
    }

    this.reset_lines = function(){
        lines.forEach(function(line){
            line.remove();
        });
        lines = []
        var bg = background.options.img;
        var h = bg.height/SCALE*background.options.scale;
        var w = bg.width/SCALE*background.options.scale;
        addLine([{x:0, y:h},{x:w, y:h}]) //bottom
        addLine([{x:0, y:0},{x:w, y:0}]) //top
        addLine([{x:-0.1, y:0},{x:0, y:h}]) //left
        addLine([{x:w+0.1, y:0},{x:w, y:h}]) //right
    }

    this.addLine = function(coords){
        var line = new Line(box2dUtils, world, lines_parent, SCALE, coords);
        lines.push(line);
        return line;
    }

    this.addLines = function(lines) {
        lines.map(addLine);
    };

    this.refreshIndicators = function() {
        indicators_parent.removeAllChildren();

        var spawn = new createjs.Container();

        var circle = new createjs.Shape();
        var g = circle.graphics;
        g.setStrokeStyle(3);
        g.beginFill('blue');
        g.drawCircle(5, 5, 10);
        g.endFill();
        circle.alpha = 0.5;

        var text = new createjs.Text("start", "20px Arial", "blue");
        text.textBaseline = "alphabetic";
        text.x = 10;
        text.y = -10;
        text.alpha = 0.8;
        spawn.x = lvl.player.start.x*SCALE;
        spawn.y = lvl.player.start.y*SCALE;
        spawn.addChild(circle)
        spawn.addChild(text);
        indicators_parent.addChild(spawn);

        if(lvl.tps){
            lvl.tps.forEach(function(tp){
                var spawn = new createjs.Container();
                var circle = new createjs.Shape();
                var color = 'lime';
                var g = circle.graphics;
                g.setStrokeStyle(3);
                g.beginFill(color);
                g.drawCircle(5, 5, 10);
                g.endFill();
                circle.alpha = 0.5;

                var text = new createjs.Text(tp.lvl, "20px Arial", color);
                text.textBaseline = "alphabetic";
                text.x = 10;
                text.y = -10;
                text.alpha = 0.8;
                spawn.x = tp.x*SCALE;
                spawn.y = tp.y*SCALE;
                spawn.addChild(circle)
                spawn.addChild(text);
                indicators_parent.addChild(spawn);
            });
        }
    }
    
    this.startTicker = function(fps) {
        Ticker.setFPS(fps);
        Ticker.addEventListener("tick", tick);
    };
    
    this.tick = function(e) {
        if(!paused){
            world.Step(1 / 15,  10, 10);
            world.ClearForces();
        }

        handleInteractions();
        player.update();

        for (var i=0; i < pigs.length; i++) {
            pigs[i].update();
        }

        //If we want image always centered:
      //  vp.x = -(canvasWidth - lvl.bg.img.width*vp.zoom)/2;
      //  vp.y = -(canvasHeight - lvl.bg.img.height*vp.zoom)/2;

        //If we want character always centered:
        vp.x = -(canvasWidth)/2 + player.skin.x*vp.zoom;
        vp.y = -(canvasHeight)/2 + player.skin.y*vp.zoom;

        vp.container.x = -vp.x;
        vp.container.y = -vp.y;

        vp.container.scaleX = vp.zoom
        vp.container.scaleY = vp.zoom

        stage.update();
    };
    
    this.handleKeyDown = function(evt) {
        keys[evt.keyCode] = true;

        var c = String.fromCharCode(evt.keyCode).toLowerCase();

        switch (c) {
            case 'e':
                editor_activated = !editor_activated;
                this.editor_on_off()
                break;
            case 'n':
                new_bg_modal = !new_bg_modal;
                paused = new_bg_modal;
                game_parameters_modal = false;
                this.modal_on_off();
                break;
            case 'p':
                var pig = box2dUtils.createPig(world, vp.container, Math.random() * canvasWidth, Math.random() * canvasHeight - 400 / SCALE);
                pigs.push(pig);
                break;
            case 'h':
                display_help();
                break;
            case '1':
                this.load_level(LEVELS['base']);
                break;
            case '2':
                this.load_level(LEVELS['xkcd1']);
                break;
            case '3':
                this.load_level(LEVELS['bertille']);
                break;
            case '4':
                this.load_level(LEVELS['lvl2']);
                break;
            case '5':
                this.load_level(LEVELS['laurie']);
                break;
            case '7':
                this.load_level(LEVELS['parc']);
                break;
            case '8':
                this.load_level(LEVELS['laby']);
                break;
            case '9':
                this.load_level(LEVELS['fleurs']);
                break;
            case 's':
                this.save_level();
                break;
            case 'm':
                paused = !paused;
                break;
            case 'd':
                debugger;
                break;
            case 'o':
                paused = true;
                if (game_parameters_modal == false) {
                    game_parameters_modal = !game_parameters_modal;
                    new_bg_modal = false;
                    this.modal_on_off();
                }
                break;
        }
        if(editor_activated){
            switch (c) {
            case 'r':
                reset_lines();
                break;
            case 'c':
                player.setPos(lvl.player.start.x, lvl.player.start.y);
                break;
            case 'g':
                lvl.gravity = parseFloat(prompt("Set gravity","0"));
                world.SetGravity(new b2Vec2(0, lvl.gravity))
                break;
            case 'i':
                this.editor_set_spawn({x:player.skin.x/SCALE, y:player.skin.y/SCALE})
                break;
            case 'k':
                this.editor_erase_mode();
                break;
                /*
            case 't':
                var x = parseFloat(prompt("TP x:","0"));
                var y = parseFloat(prompt("TP y:","0"));
                if(x && y){
                    player.setPos(x, y);
                }
                break;
                */ //TODO: deasactivate theses shortcuts when "ctrl" is pressed

            case 'y':
                var x = player.skin.x/SCALE;
                var y = player.skin.y/SCALE;
                var lvl_name = prompt("lvl","")
                if(lvl_name.length > 0){
                    if(lvl.tps === undefined){
                        lvl.tps = [];
                    }
                    lvl.tps.push({lvl:lvl_name, x:x, y:y})
                }
                refreshIndicators();
                break;
            case 'u':
                this.editor_undo();
                break;
            case 't':
                this.editor_redo();
                break;
            }
        }
        if(evt.key == '-' || evt.keyCode == 189 || evt.keyCode == 54){
            vp.zoom /= 2;
        }
        if(evt.key == '+' || evt.keyCode == 187){
            vp.zoom *= 2;
        }
    }

    this.editor_undo = function(){
        var last = lines.pop();
        last.remove();
        redo_lines.push(last.coords);
        return true;
    }

    this.editor_redo = function(){
        if(redo_lines.length > 0){
            var coords = redo_lines.pop();
            addLine(coords);
        }
    }

    this.editor_remove_selected_lines = function(){
        lines.filter(function(l){return l.selected }).map(function(l){l.remove()})
        lvl.lines = lines = lines.filter(function(l){ return !l.selected })
    }

    this.update_selected_lines = function(pos){
        var nearest = null;
        var nearest_score = null;
        lines.forEach(function(l){
            var d = l.dist(pos);
            if(nearest_score == null || d < nearest_score){
                l.selected = true;
                nearest = l;
                nearest_score = d;
            }
        });
        lines.forEach(function(l){
            if(l.selected){
                if(l != nearest){
                    l.selected = false;
                }
                l.update_graphics();
            }
        })
    }

    this.editor_draw_mode = function(){
        this.change_mode('draw');

        return true;
    }

    this.editor_erase_mode = function(){
        this.change_mode('erase')
        return true;
    }

    this.editor_spawn_mode = function(){
        this.change_mode('spawn')
        return true;
    }

    this.game_parameters_validate = function() {
        lvl.gravity = parseFloat($('#gravity').val());
        world.SetGravity(new b2Vec2(0, lvl.gravity));
        player.jetpack_activated = ($('#jetpack:checked').val() !== undefined);

        paused = false;
        game_parameters_modal = !game_parameters_modal;
        this.modal_on_off();

        return false;
    }

    this.game_parameters_cancel = function() {
        paused = false;
        game_parameters_modal = !game_parameters_modal;
        this.modal_on_off();

        return false;
    }

    this.change_mode = function(mode){
        editor_mode = mode;
        this.editor_on_off();
    }

    this.display_help = function(){
        alert(""
            + "HOW TO PLAY\n"
            + "right/left: move\n"
            + "up: jump\n"
            + "c: reset player position\n"
            + "\n"
            + "HOW TO CREATE A LEVEL\n"
            + "e: toogle editor\n"
            + "EDITOR MODE:\n"
            + "     draw lines with the mouse\n"
            + "     s: save level\n"
            + "     r: reset lines\n"
            + "     u: undo last line\n"
            + "     i: set spawn point\n"
            + "     y: set teleport point\n"
            + "     k: deleted selected line\n"
            + "     g: set gravity\n"
            + "n: toogle 'new level' dialog\n"
            + "\n"
            + "OTHERS\n"
            + "p: spawn a pig\n"
            + "1-9: load samples levels\n"
            + "h: help\n")

    }

    
    this.handleKeyUp = function(evt) {
        keys[evt.keyCode] = false;
    }

    
    this.handleInteractions = function() {
        if(lvl.tps && !editor_activated){
            lvl.tps.forEach(function(tp){
                if(Math.sqrt(
                      Math.pow(tp.x*SCALE - player.skin.x,2)
                    + Math.pow(tp.y*SCALE - player.skin.y,2)
                ) < 50){
                    load_level(LEVELS[tp.lvl]);
                }
            })
        }

        for(key in touch_pointers){
            if(key != -1){
                var coords = touch_pointers[key];
                var x = coords.x;
                var y = coords.y;
                var w_middle = canvasWidth*2/3.;
                var w_quarter = canvasWidth/3.;
                if(x < w_quarter){
                    player.moveLeft();
                }
                if(x > w_quarter && x < w_middle){
                    player.moveRight();
                }
                if(x > w_middle){
                    player.jump();
                }
            }
        }

        if (keys[38]) {
            player.jump();
        }
        if (keys[37]) {
            player.moveLeft();
        } else if (keys[39]) {
            player.moveRight();
        }
    }

    
    this.isPlayer = function(object) {
        if (object != null && object.GetUserData() != null) {
            return object.GetUserData() == 'player';
        }
    }
    
    
    this.isFootPlayer = function(object) {
        if (object != null && object.GetUserData() != null) {
            return object.GetUserData() == 'footPlayer';
        }
    }
    
    
    this.isGroundOrBox = function(object) {
        if (object != null && object.GetUserData() != null) {
            return (object.GetUserData() == 'box'
                 || object.GetUserData() == 'ground' 
                 || object.GetUserData() == 'line' 
                 || object.GetUserData() == 'pig'
                 || object.GetUserData() == 'shortTree');
        }
    }

    this.mouseCoords = function(evt){
        var c =  {
            x: (evt.clientX - canvasPosition.left),
            y: (evt.clientY - canvasPosition.top)
        }
        c = vp.container.globalToLocal(c.x, c.y);
        return {
            x:c.x/SCALE,
            y:c.y/SCALE,
        }
    }
    this.touchCoords = function(evt){
        return {
            x: evt.stageX,
            y: evt.stageY
        }
    }


    this.handleMouseDown = function(evt) {
        isMouseDown = true;
        var pos = this.mouseCoords(evt);
        if(editor_activated){
            if(editor_mode == EDITOR_MODES.DRAW){
                curr_line = this.addLine([pos,pos]);
                redo_lines = [];
                drawing = true;
            }else if(editor_mode == EDITOR_MODES.ERASE){
                this.editor_remove_selected_lines();
            }else if(editor_mode == EDITOR_MODES.SPAWN){
                this.editor_set_spawn(pos);
            }
        }
    }
    
    this.handleMouseUp = function(evt) {
        drawing = false;
        isMouseDown = false;
        if(editor_mode == EDITOR_MODES.SPAWN){
            this.editor_draw_mode();
        }
    }
    
    this.handleMouseMove = function(evt) {
        var pos = this.mouseCoords(evt);
        if(editor_activated){
            if(editor_mode == EDITOR_MODES.DRAW){
                if(drawing){
                    curr_line.setEnd(pos);
                }
            }else if(editor_mode == EDITOR_MODES.ERASE){
                this.update_selected_lines(pos);
            }else if(editor_mode == EDITOR_MODES.SPAWN){
                this.editor_set_spawn(pos);
            }
        }
    }

    this.handlePressMove = function(evt) {
        touch_pointers[evt.pointerID] = this.touchCoords(evt);
    }

    this.handlePressUp = function(evt) {
        delete touch_pointers[evt.pointerID];
    }

    this.editor_set_spawn = function(pos){
        lvl.player.start.x = pos.x;
        lvl.player.start.y = pos.y;
        refreshIndicators();
    }
    
    this.getBodyCallBack = function(fixture) {
        if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {
            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mouseVec)) {
               selectedBody = fixture.GetBody();
               return false;
            }
        }
        return true;
    }

    
    this.addContactListener = function() {
        var b2Listener = Box2D.Dynamics.b2ContactListener;
        
        var listener = new b2Listener;
        
        
        listener.BeginContact = function(contact) {
            var obj1 = contact.GetFixtureA();
            var obj2 = contact.GetFixtureB();
            if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
                if (isGroundOrBox(obj1) || isGroundOrBox(obj2)) {                   
                    player.jumpContacts ++; 
                }
            }
        }
        
        
        listener.EndContact = function(contact) {
            var obj1 = contact.GetFixtureA();
            var obj2 = contact.GetFixtureB();
            if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
                if (isGroundOrBox(obj1) || isGroundOrBox(obj2)) {
                    player.jumpContacts --; 
                }
            }
        }
        listener.PostSolve = function(contact, impulse) {
            
        }
        listener.PreSolve = function(contact, oldManifold) {
            
        }
        world.SetContactListener(listener);
    }



    this.onResize = function() {
        var w = window.innerWidth;
        var h = window.innerHeight;

        gipCanvas.width = w;
        gipCanvas.height = h;

        canvasWidth = w;
        canvasHeight = h;
    }
}());
