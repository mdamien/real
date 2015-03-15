(function(){

	ShortTree = function(body, stage, x, y, scale) {
		this.body = body;
		this.skin = null;
		this.stage = stage;
		this.scale = scale;	
		this.x = x;
		this.y = y;
		this.init();
	};

	ShortTree.prototype = {
		
		init: function() {
			var bitmap = new createjs.Bitmap("img/shortTree.png");

			bitmap.x = this.x;
			bitmap.y = this.y;

			bitmap.regX = 50;
			bitmap.regY = 102;

			this.stage.addChild(bitmap);
			
			this.skin = bitmap;
		}
			
	};
	
}());