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

    };
    
}());