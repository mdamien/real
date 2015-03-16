(function(){
	Background = function(stage, scale, options) {
		this.skin = null;
		this.stage = stage;
		this.scale = scale;
		this.options = options;
		this.init();
	};
	
	Background.prototype = {
		
		init: function() {
			var bitmap = new createjs.Bitmap(this.options.src);

			bitmap.x = 0;
			bitmap.y = 0;

			bitmap.scaleX = this.options.scale;
			bitmap.scaleY = this.options.scale;

			this.width = bitmap.width*bitmap.scaleX;
			this.height = bitmap.height*bitmap.scaleY;

			this.stage.addChild(bitmap);

			this.skin = bitmap;
		},
	};
	
}());