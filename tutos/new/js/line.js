(function(){

	Line = function(stage, scale, coords) {
		this.skin = null;
		this.stage = stage;
		this.scale = scale;
		this.coords = coords;
		this.init();
	};
	
	Line.prototype = {
		
		init: function() {
			var line = new createjs.Shape();
			line.graphics.setStrokeStyle(3);
			line.graphics.beginStroke('red');
			line.graphics.moveTo(this.coords[0].x*this.scale,
					this.coords[0].y*this.scale);
			line.graphics.lineTo(this.coords[1].x*this.scale,
					this.coords[1].y*this.scale);
			line.graphics.endStroke();
			this.skin = line;
			this.stage.addChild(line);
		},	

		setEnd: function(end) {
			this.coords[1] = end;
			var line = this.skin;
			line.graphics.clear();
			line.graphics.setStrokeStyle(3);
			line.graphics.beginStroke('red');
			line.graphics.moveTo(this.coords[0].x*this.scale,
					this.coords[0].y*this.scale);
			line.graphics.lineTo(this.coords[1].x*this.scale,
					this.coords[1].y*this.scale);
			line.graphics.endStroke();
		},
	};
	
}());