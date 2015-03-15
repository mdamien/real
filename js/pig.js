(function(){

	Pig = function(body, stage, scale) {
		this.body = body;
		this.skin = null;
		this.stage = stage;
		this.scale = scale;
		this.init();
	};
	
	Pig.prototype = {
		
		init: function() {
			var bitmap = new createjs.Bitmap("img/pig.png");

			bitmap.x = this.x;
			bitmap.y = this.y;

			bitmap.scaleX = 0.8;
			bitmap.scaleY = 0.6;

			bitmap.regX = 45;
			bitmap.regY = 50;

			this.stage.addChild(bitmap);

			this.skin = bitmap;
		},
	
		update: function() {
			this.skin.rotation = this.body.GetBody().GetAngle() * (180 / Math.PI);
			
			this.skin.x = this.body.GetBody().GetWorldCenter().x * this.scale;
			this.skin.y = this.body.GetBody().GetWorldCenter().y * this.scale;
		}
			
	};
	
}());