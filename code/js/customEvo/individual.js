/**
 * @author Kate
 */

define(["common"], function(common) {

    var Individual = Class.extend({
        init : function(dna, index) {
            this.dna = dna;
            this.index = index;

            // line them up in rows

            this.center = new Vector((index % 2) * 400 - 200, Math.floor(index / 2) * 275 - 150);
            console.log(index + ": " + this.center);
            // TODO MAybe use this dna to make something.

        },

        update : function(time) {
            // TODO Update the thing based on dna? on time?

        },

        draw : function(g) {

            // Move to the right square
            g.pushMatrix();

            this.center.translateTo(g);

            g.fill(0, 0, 0, .4);
            var boxWidth = 350;
            var boxHeight = 250;
            g.rect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight);

            for(var i = 0; i < this.dna.length; i++) {
                for(var j = 0; j < this.dna[i].length; j++) {
                    // Starting with the Base of the creature
                    if(i == 0) {
                        var hue = this.dna[i][0];
                        var pastel = this.dna[i][1];
                        var sizeWidth = this.dna[i][2];
                        var sizeHeight = this.dna[i][3];
                        //var size = 10 + 10 * this.dna[i][4];
                        var color = new common.KColor(hue, 1.2 - pastel, 1.2 * pastel);
                        color.fill(g);
                        g.noStroke();
                        g.ellipse(0, 0, sizeWidth, sizeHeight);
                    }

                    // Building the Leg
                    if(this.dna[i].length == 2) {
                        g.stroke(0, 0, 0, 1);
                        var xPos = -sizeWidth/2 + sizeWidth * this.dna[i][0];
                        var endxPos = xPos - 30 * this.dna[i][1];

                        g.strokeWeight(4);
                        g.line(xPos, sizeHeight, endxPos, 70);
                        g.line(endxPos, 70, xPos, 70 + 40);
                        g.noStroke();
                        g.rect(xPos - 20, 110, 20, 10);
                    }

                    // Building the arm
                    if(this.dna[i].length == 3) {
                        g.stroke(0, 0, 0, 1);
                        var xPos = -sizeWidth;
                        var yPos = -sizeHeight/2 + sizeHeight * this.dna[i][0];
                        var endyPos = yPos - sizeHeight/2 * this.dna[i][1];
                        var endxPos = -60 + xPos;
                        var handxPos = endxPos - 30 * this.dna[i][2];
                        var handyPos = endyPos - 40 * this.dna[i][3];
                        g.strokeWeight(4);
                        g.line(xPos, yPos, endxPos, endyPos);
                        g.line(endxPos, endyPos, handxPos, handyPos);
                        var sizeHand = 10 + 30 * this.dna[i][2];
                        //g.line(endxPos, 70, xPos, 70 + 40);
                        g.noStroke();
                        //var r = 10 + 30 * this.dna[i][2];
                        //var theta = Math.PI * 2 * this.dna[i][3];
                        var p = Vector.polar(-60, endyPos);
                        //p.drawCircle(g, sizeHand, sizeHand);
                        //g.rect(xPos - 40, 110, 40, 10);

                    }

                }

            }
            //var r = 10 + 30 * this.dna[0 * 5];
            //var theta = Math.PI * 2 * this.dna[0 * 5 + 1];

            //var p = Vector.polar(r, theta);
            //p.drawCircle(g, size, size);

            /*for (var i = 0; i < this.dna.length / 5; i++) {
                var r = 10 + 30 * this.dna[i * 5];
                var theta = Math.PI * 2 * this.dna[i * 5 + 1];
                var hue = this.dna[i * 5 + 2];
                var pastel = this.dna[i * 5 + 3];
                var size = 30 * this.dna[i * 5 + 4];

                var p = Vector.polar(r, theta);
                var color = new common.KColor(hue, 1.2 - pastel, 1.2 * pastel);
                color.fill(g);
                g.noStroke();
                p.drawCircle(g, size, size);
            }*/
            g.popMatrix();
        },

        // Is this being clicked on?
        getDistanceTo : function(target) {
            return this.center.getDistanceTo(target);
        },

        select : function() {
            this.isSelected = true;
        },

        deselect : function() {
            this.isSelected = false;
        },
    });

    return Individual;
});
