(function(){
	
	/**
	 * Constructeur
	 */
	ShortTree = function(body, stage, x, y, scale) {
		this.body = body;		// Body box2d
		this.skin = null;		// Représentation graphique
		this.stage = stage;		// Stage EaselJS
		this.scale = scale;		// Echelle
		this.x = x;				// Position X
		this.y = y;				// Position y
		this.init();			// Initialiser le short tree			
	};
	
	/**
	 * Classe ShortTree
	 */
	ShortTree.prototype = {
		
		init: function() {
			var bitmap = new createjs.Bitmap("img/shortTree.png");	// image associée
			// Positionner l'image
			bitmap.x = this.x;
			bitmap.y = this.y;
			// Repositionner le centre de l'image
			bitmap.regX = 50;
			bitmap.regY = 102;
			// Ajouter l'image au Stage
			this.stage.addChild(bitmap);
			// Appliquer la représentation graphique à l'objet
			this.skin = bitmap;
		}
			
	};
	
}());