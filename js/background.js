(function(){
    Background = function(container, scale, options) {
        this.skin = null;
        this.container = container;
        this.scale = scale;
        this.options = options;
        this.init();
    };
    
    Background.prototype = {
        
        init: function() {
            var bitmap = new createjs.Bitmap(this.options.img);

            bitmap.x = 0;
            bitmap.y = 0;

            bitmap.scaleX = this.options.scale;
            bitmap.scaleY = this.options.scale;

            this.width = bitmap.width*bitmap.scaleX;
            this.height = bitmap.height*bitmap.scaleY;

            this.container.addChild(bitmap);

            this.skin = bitmap;
        },

        remove: function(){
            this.container.removeChild(this.skin);
        }
    };
    
}());