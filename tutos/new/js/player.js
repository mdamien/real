(function(){
	
	// Import des "classes" box2dWeb
	var b2Vec2 = Box2D.Common.Math.b2Vec2;
	
	/**
	 * Constructeur
	 * @param Number scale échelle
	 */
	Player = function(scale) {
		this.scale = scale;							// échelle
		this.box2dUtils = new Box2dUtils(scale);	// instancier la classe utilitaire box2d
		this.object = null;							// l'objet "physique" player
		this.jumpContacts = 0;						// compteur de "contacts" pour le saut
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
			this.object = this.box2dUtils.createPlayer(world, x, y, radius, 'player');
		},
	
		/**
		 * Sauter
		 */
		jump : function() {
			// effectuer le saut si les "pieds" du joueur sont en contact avec une plate-forme
			if (this.jumpContacts > 0) {
				// Appliquer une impulsion vers le haut
				this.object.GetBody().ApplyImpulse(
						new b2Vec2(0, -12),							// vecteur
	                    this.object.GetBody().GetWorldCenter());	// point d'application de l'impulsion
			}
		},
		
		
		/**
		 * Effectuer un déplacement vers la droite
		 */
		moveRight : function() {
			var vel = this.object.GetBody().GetLinearVelocity();
			vel.x = 140 / this.scale;
		},
		
		/**
		 * Effectuer un déplacement vers la gauche
		 */
		moveLeft : function() {
			var vel = this.object.GetBody().GetLinearVelocity();
			vel.x = -140 / this.scale;
		}
	}
	
}());