/**
 * @author Kate
 */

define(["common", "./evoStats/evoStats"], function(common, EvoStats) {

    Evolution = Class.extend({

        init : function() {
            var evo = this;
            if (this.populationSize === undefined)
                this.populationSize = 8;

            if (this.variance === undefined)
                this.variance = .05;

            this.selected = undefined;
            this.numOfArms = 0;
            this.numOfLegs = 0;
            this.sizeCount = 0;
            //this.currentGrammar = Tracery.createGrammar(interruption);
            //this.storyView = Class("#storyHolder");

            /*
             this.stats = new EvoStats(this.populationSize, [{
             name : "height",
             evaluate: function(ind) {
             // measure something
             return utilities.noise(ind.id, app.time.total*.2);
             }
             },
             ]);
             */

            this.respawnAll();
        },

        draw : function(g) {

            for (var i = 0; i < this.currentPopulation.length; i++) {

                this.currentPopulation[i].draw(g);
            }

            if (this.stats) {
                g.pushMatrix();
                g.translate(-g.width / 2, 100);
                g.fill(0, 0, 0, .9);
                g.rect(0, 0, g.width, 200);
                g.translate(0, 190);

                this.stats.draw(g);
                g.popMatrix();
            }
        },

        update : function(time) {

            for (var i = 0; i < this.currentPopulation.length; i++) {

                this.currentPopulation[i].update(time);
            }

            /*
             if (time.frames % 10 === 0 && this.stats)
             this.stats.evaluate(this.currentPopulation);
             */
        },

        //==================================================
        // A thing you can modify
        /*createDNA : function() {
            var dna = [];
            for (var i = 0; i < 20; i++) {
                dna [i] = [];
                for(var j = 0; j < 3; j++) {

                    dna[i][j] = Math.random()
                }
            }
            return dna;
        },
        cloneDNA : function(dna) {
            var clone = [];
            for (var i = 0; i < dna.length; i++) {
                clone[i] = [];
                for(var j = 0; j <dna[i].length; j++) {
                    clone[i][j] = dna[i][j];
                }
            }
            return clone;
        },
        modifyDNA : function(dna, amt) {
            for (var i = 0; i < dna.length; i++) {
                for(var j = 0; j < dna[i].length; j++) {
                    if (Math.random() > .5) {
                        dna[i][j] += 2 * Math.sin(300 * Math.random()) * amt;
                        dna[i][j] = Math.min(Math.max(0, dna[i][j]), 1);

                        dna[i][j] = (dna[i][j] - .5) * .99 + .5;
                    }
                }
            }
        },

        //==================================================
        // a way to turn the thing you can modify
        //  into the thing you can judge
        instantiate : function(dna) {

        },*/

        respawnAll : function() {
            this.currentPopulation = [];
            console.log("This gets called once");
            for (var i = 0; i < this.populationSize; i++) {
                var dna = this.createDNA();
                
                if(i == 0) {
                    var leg = [];
                    for(var j = 0; j < 2; j++){
                        leg[j] = Math.random();
                    }
                    dna.push(leg);
                }

                if(i == 1) {
                    var part = [];
                    for(var j = 0; j < 3; j++){
                        part[j] = Math.random();
                    }
                    dna.push(part);
                }

                this.currentPopulation[i] = this.instantiate(dna, i);
            }
        },

        spawnFromSelected : function() {
            console.log("Spawn from selected");
            console.log(this.numOfLegs);
            var sourceDNA = this.selected.dna;
            this.currentPopulation = [];
            var addWidth = false;
            var addHeight = false;
            this.sizeCount++;
            console.log("Number of clicks: " + this.sizeCount);
            //var clickCheck = true;
            for (var i = 0; i < this.populationSize; i++) {
                var dna = this.cloneDNA(sourceDNA);             
                if(i == 0) {
                    // Increase Base width
                    //clickCheck = false;
                    //dna[0][2] += 10;
                    //addWidth = true;
                    // Append leg
                    this.numOfLegs++;
                    var leg = [];
                    for(var j = 0; j < 2; j++){
                        leg[j] = Math.random();
                    }
                    dna.push(leg);
                }

                if(i == 1) {
                    // Increase Base width
                    //clickCheck = false;
                    //addHeight = true;
                    //dna[0][3] += 10;
                    this.numOfArms++;
                    var arm = [];
                    for(var j = 0; j < 3; j++){
                        arm[j] = Math.random();
                    }
                    dna.push(arm);
                }
                dna[0][2] += 10;
                dna[0][3] += 10;


                this.modifyDNA(dna, this.variance);
                this.currentPopulation[i] = this.instantiate(dna, i);
            }
        },
        spawnFromSelf : function() {

            for (var i = 0; i < this.populationSize; i++) {
                console.log("Spawn from self");
                var sourceDNA = this.currentPopulation[i].dna;
                var dna = this.cloneDNA(sourceDNA);
                this.modifyDNA(dna, this.variance);
                this.currentPopulation[i] = this.instantiate(dna, i);
            }
        },
        //==================================================
        // Interaction
        selectAt : function(p) {
            var closest;
            var closestDist = 150;
            for (var i = 0; i < this.currentPopulation.length; i++) {
                var current = this.currentPopulation[i];
                var d = current.getDistanceTo(p);
                if (d < closestDist) {
                    closestDist = d;
                    closest = current;
                }
            }

            if (this.selected) {
                this.selected.deselect();
            }
            this.selected = closest;
            if (this.selected) {
                this.selected.select();
            }

        }
    });

    return Evolution;
});
