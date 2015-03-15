(function(){
	
	/**
	 * Constructeur
	 */
	Pig = function(body, stage, scale) {
		this.body = body;		// Body box2d
		this.skin = null;		// Représentation graphique
		this.stage = stage;		// Stage EaselJS
		this.scale = scale;		// Echelle
		this.init();			// Initialiser le cochon
	};
	
	/**
	 * Classe Pig
	 */
	Pig.prototype = {
		
		init: function() {
			var bitmap = new createjs.Bitmap("img/pig.png");	// image associée
			// Positionner l'image
			bitmap.x = this.x;
			bitmap.y = this.y;
			// Redimensionner l'image
			bitmap.scaleX = 0.8;
			bitmap.scaleY = 0.6;
			// Repositionner le centre de l'image
			bitmap.regX = 45;
			bitmap.regY = 50;
			// Ajouter l'image au Stage
			this.stage.addChild(bitmap);
			// Appliquer la représentation graphique à l'objet
			this.skin = bitmap;
		},
	
		update: function() {
			// Redéfinir l'orientation
			this.skin.rotation = this.body.GetBody().GetAngle() * (180 / Math.PI);
			// Repositionner l'objet
			this.skin.x = this.body.GetBody().GetWorldCenter().x * this.scale;
			this.skin.y = this.body.GetBody().GetWorldCenter().y * this.scale;
		}
			
	};
	
}());