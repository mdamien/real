(function(){
	
	var Graphics = createjs.Graphics;
	var Shape = createjs.Shape;
	
	EaselJsUtils = function(stage) {
		this.stage = stage;
	};
	
	EaselJsUtils.prototype = {
			
			createBitmap: function(src, x, y, options) {
				var bitmap = new createjs.Bitmap(src);
				bitmap.x = x;
				bitmap.y = y;
				if (options) {
					if (options.scale) {
						bitmap.scaleX = options.scale[0];
						bitmap.scaleY = options.scale[1];
					}
				}
				this.stage.addChild(bitmap);
				return bitmap;
			},
			

			createPig: function(x, y, options) {
				return this.createBitmap("img/pig.png", x, y, options);
			},

			createText: function(text, font, x, y, options) {
				var txt = new createjs.Text();
				txt.font = font;
				txt.text = text;
				txt.x = x;
				txt.y = y;
				if (options) {
					if (options.color) {
						txt.color = options.color;
					}
					if (options.textAlign) {
						txt.textAlign = options.textAlign;
					}
					if (options.cursor) {
						txt.cursor = options.cursor;
					}
				}
				this.stage.addChild(txt);
				return txt;
			},
			
			createRoundRect: function(x, y, w, h, rgb, options) {
				var graphic = new Graphics();
				var opacity = 1;
				var radius = 90;
				if (options) {
					if (options.opacity) {
						opacity = options.opacity;
					}
					if (options.radius) {
						radius = options.radius;
					}
				}
				graphic.beginFill(Graphics.getRGB(rgb[0], rgb[1], rgb[2], opacity));
				graphic.drawRoundRect(x,  y,  w,  h,  radius);

				var shape = new Shape(graphic);
				this.stage.addChild(shape);
				return shape;
			},
			
			createCircle: function(x, y, radius, rgb, options) {
				var graphic = new Graphics();
				var opacity = 1;
				if (options) {
					if (options.opacity) {
						opacity = options.opacity;
					}
				}
				graphic.beginFill(Graphics.getRGB(rgb[0], rgb[1], rgb[2], opacity));
				graphic.drawCircle(x, y, radius);

				var shape = new Shape(graphic);
				this.stage.addChild(shape);
				return shape;
			}
			
	};
	
}());