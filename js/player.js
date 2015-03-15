(function(){
	
	
	/**
	 * Constructeur
	 * @param Number scale échelle
	 */
	Player = function(stage, scale) {
		this.stage = stage;
		this.scale = scale;							// échelle
		this.box2dUtils = new Box2dUtils(scale);	// instancier la classe utilitaire box2d
		this.body = null;							// l'objet "physique" player
		this.jumpContacts = 0;						// compteur de "contacts" pour le saut


		var bitmap = new createjs.Bitmap("img/bird.png");	// image associée
		// Positionner l'image
		bitmap.x = this.x;
		bitmap.y = this.y;
		// Redimensionner l'image
		bitmap.scaleX = 0.1;
		bitmap.scaleY = 0.1;
		// Repositionner le centre de l'image
		bitmap.regX = 250;
		bitmap.regY = 200;
		// Ajouter l'image au Stage
		this.stage.addChild(bitmap);
		// Appliquer la représentation graphique à l'objet
		this.skin = bitmap;
	}
	
	/**
	 * Classe Player
	 */
	Player.prototype = {
		
		/**
		 * Créer l'objet "physique" player
		 * @param b2World world : le monde 2dbox dans lequel ajouter le player
		 * @param Number x : position x du player
		 * @param Number y : position y du player
		 * @param Number radius : le rayon du body player
		 */
		createPlayer : function(world, x, y, radius) {
			this.body = this.box2dUtils.createPlayer(world, x, y, radius, 'player');
		},
	
		/**
		 * Sauter
		 */
		jump : function() {
			// effectuer le saut si les "pieds" du joueur sont en contact avec une plate-forme
			if (this.jumpContacts > 0) {
				// Appliquer une impulsion vers le haut
				this.body.GetBody().ApplyImpulse(
						new b2Vec2(0, -12),							// vecteur
	                    this.body.GetBody().GetWorldCenter());	// point d'application de l'impulsion
			}
		},
		
		/**
		 * Effectuer un déplacement vers la droite
		 */
		moveRight : function() {
			var vel = this.body.GetBody().GetLinearVelocity();
			vel.x = 140 / this.scale;
		},
		
		/**
		 * Effectuer un déplacement vers la gauche
		 */
		moveLeft : function() {
			var vel = this.body.GetBody().GetLinearVelocity();
			vel.x = -140 / this.scale;
		},

		update: function() {
			this.skin.x = this.body.GetBody().GetWorldCenter().x * this.scale;
			this.skin.y = this.body.GetBody().GetWorldCenter().y * this.scale;
			this.skin.scaleX = (this.body.GetBody().GetLinearVelocity().x > 0 ? 1 : -1)*0.1;
		}
	}
}());