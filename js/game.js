(function() {
	
	
	var Ticker = createjs.Ticker;
	var gipCanvas;
	var stage;
	
	var box2dCanvas; 
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
	var lines_parent = new createjs.Container();
	var editing_mode = true;
	lines_parent.visible = editing_mode;

	var loaded_queue = new createjs.LoadQueue();

	var vp = {
		x:0,
		y:0,
		container: new createjs.Container(),
	}

	var box2dDebug = false;

	var lvl = LEVELS['xkcd1']
	
	var player = null, background = null;
	var keys = [];

	$(document).ready(function() {
		load();
	});

	this.load = function() {
		$('#loading').fadeIn()
		loaded_queue.on("complete", function(){
			$('#loading').hide()
			init()
		}, this);
		loaded_queue.loadManifest([
			{id: "bird", src:"img/bird.png"},
			{id: "bg", src:lvl.bg.src},
		]);
	}
	
	this.init = function() {
		prepareStage();		
		prepareBox2d();		
		
		lvl.bg.img = loaded_queue.getResult("bg");
		console.log(lvl.bg.img)
		background = new Background(vp.container, SCALE, lvl.bg);
		
		addLines();
		
		player = new Player(vp.container, SCALE);
		player.createPlayer(world, lvl.player.start.x*SCALE, lvl.player.start.y*SCALE, 20);

		addContactListener();

		window.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		
		this.debug_screen_on_off()
		
		document.onkeydown = function(event) {
			return event.keyCode != 38 && event.keyCode != 40;
		}
		
		startTicker(30);	
	};
	
	
	this.prepareStage = function() {
		gipCanvas = $('#gipCanvas').get(0);
		
		stage = new createjs.Stage(gipCanvas);
		
		easelJsUtils = new EaselJsUtils(stage);
		stage.addChild(vp.container)
	};
	
	
	this.prepareBox2d = function() {
		box2dCanvas = $('#box2dCanvas').get(0);
		canvasWidth = parseInt(box2dCanvas.width);
		canvasHeight = parseInt(box2dCanvas.height);
		canvasPosition = $(box2dCanvas).position();
		context = box2dCanvas.getContext('2d');
		box2dUtils = new Box2dUtils(SCALE);
		world = box2dUtils.createWorld(context); 
	};

	this.addLine = function(coords){
		var line = new Line(box2dUtils, world, lines_parent, SCALE, coords);
		lines.push(line);
		return line;
	}

	this.addLines = function() {
		vp.container.addChild(lines_parent);
		lvl.lines.map(addLine);

		//world bounds
		var bg = loaded_queue.getResult("bg");
		var h = bg.height/SCALE*background.options.scale;
		var w = bg.width/SCALE*background.options.scale;
		addLine([{x:0, y:h},{x:w, y:h}]) //bottom
		addLine([{x:0, y:0},{x:w, y:0}]) //top
		addLine([{x:-0.1, y:0},{x:0, y:h}]) //left
		addLine([{x:w+0.1, y:0},{x:w, y:h}]) //right
	};

	this.addPigs = function() {
		for (var i=0; i<5; i++) {
			var pig = box2dUtils.createPig(world, vp.container, Math.random() * canvasWidth, Math.random() * canvasHeight - 400 / SCALE);
			pigs.push(pig);
		}
	};

	
	this.startTicker = function(fps) {
		Ticker.setFPS(fps);
		Ticker.addEventListener("tick", tick);
	};
	
	
	this.tick = function() {
		world.Step(1 / 15,  10, 10);
		world.ClearForces();

		handleInteractions();
		player.update();	

		for (var i=0; i < pigs.length; i++) {
			pigs[i].update();
		}
		

		vp.x = player.skin.x-canvasWidth/2;
		vp.y = player.skin.y-canvasHeight/2;
		if(box2dDebug){
			vp.x = 0;
			vp.y = 0;
		}

		vp.container.x = -vp.x;
		vp.container.y = -vp.y;

		if(box2dDebug){
			world.DrawDebugData();
		}
		stage.update();
	};

	
	this.handleKeyDown = function(evt) {
		keys[evt.keyCode] = true;

		if(evt.key == 'e'){
			editing_mode = !editing_mode;
			lines_parent.visible = editing_mode;
		}
		if(evt.key == 'b'){
			box2dDebug = !box2dDebug;
			this.debug_screen_on_off();
		}
		if(evt.key == 'p'){
			var pig = box2dUtils.createPig(world, vp.container, Math.random() * canvasWidth, Math.random() * canvasHeight - 400 / SCALE);
			pigs.push(pig);
		}
	}

	
	this.handleKeyUp = function(evt) {
		keys[evt.keyCode] = false;
	}

	
	this.handleInteractions = function() {
		
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
		return {
			x: (evt.clientX - canvasPosition.left + vp.x) / SCALE,
			y: (evt.clientY - canvasPosition.top + vp.y) / SCALE
		}
	}

	this.handleMouseDown = function(evt) {
		isMouseDown = true;
		var pos = this.mouseCoords(evt);
		curr_line = this.addLine([pos,pos]);
		handleMouseMove(evt);
		window.addEventListener('mousemove', handleMouseMove);
	}
	
	this.handleMouseUp = function(evt) {
		window.removeEventListener('mousemove', handleMouseMove);
		isMouseDown = false;
	}
	
	this.handleMouseMove = function(evt) {
		curr_line.setEnd(this.mouseCoords(evt));
	}
	
	this.getBodyAtMouse = function() {
		selectedBody = null;
		mouseVec = new b2Vec2(mouseX, mouseY);
		var aabb = new b2AABB();
		aabb.lowerBound.Set(mouseX, mouseY);
		aabb.upperBound.Set(mouseX, mouseY);
		world.QueryAABB(getBodyCallBack, aabb);
		return selectedBody;
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
	
	this.debug_screen_on_off = function() {
		if (box2dDebug) {
			$(box2dCanvas).css('opacity', 1);
		} else {
			$(box2dCanvas).css('opacity', 0);
		}
	};

	
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


}());