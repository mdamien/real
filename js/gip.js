(function() {
	
	// EaselJS
	var Ticker = createjs.Ticker;
	var gipCanvas;				//  canvas easeljs
	var stage;					// stage easeljs
	
	// Box2d Web
	var box2dCanvas; // canvas box2d
	var box2dUtils; // classe utilitaire box2d
	var context; 	// contexte 2d
	var SCALE = 30; // échelle
	var world;		// world box2d
	var canvasWidth, canvasHeight;	// dimensions du canvas

	// Gestion de la souris
	var curr_line = null;
	var isMouseDown = false; // le clic est-il enfoncé ?
	var canvasPosition; // la position du canvas

	var b2Vec2 = Box2D.Common.Math.b2Vec2;
	var b2AABB = Box2D.Collision.b2AABB;
	var b2Body = Box2D.Dynamics.b2Body;
	
	// pigs
	var pigs = [];
	
	var lines = [];
	var lines_parent = new createjs.Container();
	var editing_mode = true;

	var vp = {
		x:0,
		y:0,
		container: new createjs.Container(),
	}

	// debug box2d ?
	var box2dDebug = false;
	
	var player = null, background = null;
	var keys = [];

	// Initialisation
	$(document).ready(function() {
		init();
	});
	
	// Fonction d'initialisation
	this.init = function() {
		prepareStage();		// préparer l'environnement graphique
		prepareBox2d();		// préparer l'environnement physique
		
		// Graphics
		background = new Background(vp.container, SCALE);
		
		// Physics
		addLines();
		addPigs();			// ajout d'éléments physiques dynamiques (pigs)

		// Créer le player
		player = new Player(vp.container, SCALE);
		player.createPlayer(world, 25, canvasHeight-30, 20);

		// Ajouter le listener de collisions
		addContactListener();

		// Ajouter les listeners d'événements souris	
		window.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mouseup', handleMouseUp);
		
		// Ajouter les listeners d'évènements
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		

		// Désactiver les scrollings vertical lors d'un appui sur les touches directionnelles "haut" et "bas"
		document.onkeydown = function(event) {
			return event.keyCode != 38 && event.keyCode != 40;
		}

		/// Initialiser bouton
		initBtn();
		
		startTicker(30);	// lancer le ticker
	};
	
	// Préparer l'environnement graphique
	this.prepareStage = function() {
		// récupérer le canvas GIP
		gipCanvas = $('#gipCanvas').get(0);
		// créer le Stage
		stage = new createjs.Stage(gipCanvas);
		// Classe utilitaire EaselJS
		easelJsUtils = new EaselJsUtils(stage);
		stage.addChild(vp.container)
	};
	
	// Préparer l'environnement physique
	this.prepareBox2d = function() {
		box2dCanvas = $('#box2dCanvas').get(0);
		canvasWidth = parseInt(box2dCanvas.width);
		canvasHeight = parseInt(box2dCanvas.height);
		canvasPosition = $(box2dCanvas).position();
		context = box2dCanvas.getContext('2d');
		box2dUtils = new Box2dUtils(SCALE);
		world = box2dUtils.createWorld(context); // box2DWorld
		setWorldBounds(); // définir les limites de l'environnement
	};
	
	// Créer les limites de l'environnement
	this.setWorldBounds = function() {
		// Créer le "sol" et le "plafond" de notre environnement physique
		//ground = box2dUtils.createBox(world, 400, canvasHeight - 10, 400, 10, null, true, 'ground');
		//ceiling = box2dUtils.createBox(world, 400, -5, 400, 1, null, true, 'ceiling');
		
		// Créer les "murs" de notre environnement physique
		//leftWall = box2dUtils.createBox(world, -5, canvasHeight, 1, canvasHeight, null, true, 'leftWall');
		//leftWall = box2dUtils.createBox(world, canvasWidth + 5, canvasHeight, 1, canvasHeight, null, true, 'leftWall');
	};

	this.addLine = function(coords){
		var line = new Line(box2dUtils, world, lines_parent, SCALE, coords);
		lines.push(line);
		LINES = lines;
		return line;
	}

	this.addLines = function() {
		vp.container.addChild(lines_parent);
		LINES.map(addLine);
	};

	// Ajout des cochons
	this.addPigs = function() {
		// Créer 30 "Pigs" placés aléatoirement dans l'environnement
		for (var i=0; i<5; i++) {
			var pig = box2dUtils.createPig(world, vp.container, Math.random() * canvasWidth, Math.random() * canvasHeight - 400 / SCALE);
			pigs.push(pig);	// conserver les cochons dans un tableau
		}
	};

	// Démarrer le ticker
	this.startTicker = function(fps) {
		Ticker.setFPS(fps);
		Ticker.addEventListener("tick", tick);
	};
	
	// Mise à jour de l'environnement
	this.tick = function() {
		
		// box2d
		world.Step(1 / 15,  10, 10);
		world.ClearForces();

		handleInteractions();
		player.update();	

		for (var i=0; i < pigs.length; i++) {
			pigs[i].update();
		}
		

		vp.x = player.skin.x-canvasWidth/2;
		vp.y = player.skin.y-canvasHeight/2;

		vp.container.x = -vp.x;
		vp.container.y = -vp.y;

		world.DrawDebugData();
		stage.update();
	};

	// appuyer sur une touche
	this.handleKeyDown = function(evt) {
		keys[evt.keyCode] = true;

		if(evt.keyCode == 69){
			editing_mode = !editing_mode;
			lines_parent.visible = editing_mode;
		}
	}

	// relacher une touche
	this.handleKeyUp = function(evt) {
		keys[evt.keyCode] = false;
	}

	// Gérer les interactions
	this.handleInteractions = function() {
		// touche "haut"
		if (keys[38]) {
			player.jump();
		}
		// touches "gauche" et "droite"
		if (keys[37]) {
			player.moveLeft();
		} else if (keys[39]) {
			player.moveRight();
		}	
	}

	// Déterminer si l'objet physique est le player
	this.isPlayer = function(object) {
		if (object != null && object.GetUserData() != null) {
			return object.GetUserData() == 'player';
		}
	}
	
	// Déterminer si l'objet physique est les pieds du player
	this.isFootPlayer = function(object) {
		if (object != null && object.GetUserData() != null) {
			return object.GetUserData() == 'footPlayer';
		}
	}
	
	// Déterminer si l'objet physique est le sol ou une box
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
	
	// Callback de getBody -> QueryAABB
	this.getBodyCallBack = function(fixture) {
        if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {
            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mouseVec)) {
               selectedBody = fixture.GetBody();
               return false;
            }
        }
        return true;
	}
	
	// Initialisation du bouton de debug
	this.initBtn = function() {
		$('#btnB2d').click(function(){
			box2dDebug = !box2dDebug;
			if (box2dDebug) {
				$(box2dCanvas).css('opacity', 1);
			} else {
				$(box2dCanvas).css('opacity', 0);
			}
		});
	};

	// Ajout du listener sur les collisions
	this.addContactListener = function() {
		var b2Listener = Box2D.Dynamics.b2ContactListener;
		//Add listeners for contact
		var listener = new b2Listener;
		
		// Entrée en contact
		listener.BeginContact = function(contact) {
			var obj1 = contact.GetFixtureA();
			var obj2 = contact.GetFixtureB();
			if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
				if (isGroundOrBox(obj1) || isGroundOrBox(obj2)) {					
					player.jumpContacts ++;	// le joueur entre en contact avec une plate-forme de saut
				}
			}
		}
		
		// Fin de contact
		listener.EndContact = function(contact) {
			var obj1 = contact.GetFixtureA();
			var obj2 = contact.GetFixtureB();
			if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
				if (isGroundOrBox(obj1) || isGroundOrBox(obj2)) {
					player.jumpContacts --;	// le joueur quitte une plate-forme de saut
				}
			}
		}
		listener.PostSolve = function(contact, impulse) {
			// PostSolve
		}
		listener.PreSolve = function(contact, oldManifold) {
		    // PreSolve
		}
		world.SetContactListener(listener);
	}


}());