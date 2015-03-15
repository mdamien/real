(function(){
	Background = function(stage, scale) {
		this.skin = null;
		this.stage = stage;
		this.scale = scale;
		this.init();
	};
	
	Background.prototype = {
		
		init: function() {
			var bitmap = new createjs.Bitmap("img/bg.jpg");

			bitmap.x = 0;
			bitmap.y = 0;

			bitmap.scaleX = 0.35;
			bitmap.scaleY = 0.35;

			this.stage.addChild(bitmap);

			this.skin = bitmap;
		},
		
	};
	
}());