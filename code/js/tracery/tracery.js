/**
 * @author Kate Compton
 *  © Copyright 2014 Kate Compton. All rights reserved.
 * All trademarks and service marks are the properties of their respective owners.
 */

var Tracery = (function() {

    var traceCount = 0;

    // Utility functions
    function getSpacer(count) {
        var s = "";
        for (var i = 0; i < count; i++) {
            s += " ";
        }
        return s;
    };

    var isConsonant = function(c) {
        c = c.toLowerCase();
        switch(c) {
            case 'a':
                return false;
            case 'e':
                return false;
            case 'i':
                return false;
            case 'o':
                return false;
            case 'u':
                return false;

        }
        return true;
    };

    function endsWithConY(s) {
        if (s.charAt(s.length - 1) === 'y') {
            return isConsonant(s.charAt(s.length - 2));
        }
        return false;
    };

    var modificationFunctions = {
        capitalizeAll : function(s) {
            return s.replace(/(?:^|\s)\S/g, function(a) {
                return a.toUpperCase();
            });

        },

        capitalize : function(s) {
            return s.charAt(0).toUpperCase() + s.slice(1);

        },

        inQuotes : function(s) {
            return '"' + s + '"';
        },

        comma : function(s) {
            var last = s.charAt(s.length - 1);
            if (last === ",")
                return s;
            if (last === ".")
                return s;
            if (last === "?")
                return s;
            if (last === "!")
                return s;
            return s + ",";
        },

        a : function(s) {
            if (!isConsonant(s.charAt()))
                return "an " + s;
            return "a " + s;

        },

        s : function(s) {

            var last = s.charAt(s.length - 1);

            switch(last) {
                case 'y':

                    // rays, convoys
                    if (!isConsonant(s.charAt(s.length - 2))) {
                        return s + "s";
                    }
                    // harpies, cries
                    else {
                        return s.slice(0, s.length - 1) + "ies";
                    }
                    break;

                // oxen, boxen, foxen
                case 'x':
                    return s.slice(0, s.length - 1) + "en";
                case 'z':
                    return s.slice(0, s.length - 1) + "es";
                case 'h':
                    return s.slice(0, s.length - 1) + "es";

                default:
                    return s + "s";
            };

        },

        ed : function(s) {

            var index = s.indexOf(" ");
            var s = s;
            var rest = "";
            if (index > 0) {
                rest = s.substring(index, s.length);
                s = s.substring(0, index);

            }

            var last = s.charAt(s.length - 1);

            switch(last) {
                case 'y':

                    // rays, convoys
                    if (isConsonant(s.charAt(s.length - 2))) {
                        return s.slice(0, s.length - 1) + "ied" + rest;

                    }
                    // harpies, cries
                    else {
                        return s + "ed" + rest;
                    }
                    break;
                case 'e':
                    return s + "d" + rest;

                    break;

                default:
                    return s + "ed" + rest;
            };
        },

        // Create a div that you can click to select
        choice : function(s, args) {
            return "<div class='choice' data-choice=" + args[0] + ">" + s + "</div>";
        },
    };
    // From http://stackoverflow.com/questions/521295/javascript-random-seeds
    var m_w = 32132131;
    var m_z = 897978933;
    var mask = 0xffffffff;

    // Returns number between 0 (inclusive) and 1.0 (exclusive),
    // just like Math.random().
    function random() {
        m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
        m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
        var result = ((m_z << 16) + m_w) & mask;
        result /= 4294967296;
        return result + 0.5;
    }

    //=================================================================================
    //=================================================================================
    //=================================================================================
    // Building analysis objects
    function Analysis(grammar) {
        var analysis = this;

        // Make a copy of the key list
        this.keyList = grammar.symbolList.slice(0);

        this.symbols = {};
        // Create an analysis for each key
        this.keyList.forEach(function(key) {
            analysis.symbols[key] = analysis.analyzeSymbol(grammar.symbols[key]);
        });
    };

    Analysis.prototype.analyzeSymbol = function(symbol) {
        console.log("Analyzing " + symbol.key);
        var sym = {
            links : [],
        };

        var lengths = [];
        // create analysis of each rule

        sym.rules = symbol.baseRules.rules.map(function(rule) {
            // eventually add more impressive stuff
            return {
                rule : rule
            };

        });
        return sym;

    };

    //=================================================================================
    //=================================================================================
    //=================================================================================

    function Rule(source) {
        this.source = source;

        if (source === undefined || source.length === 0)
            throw ("Undefined source for rule ");

        this.sections = parseBrackets(source, '[', ']', '#');

        this.requiredSymbols = [];

        for (var i = 0; i < this.sections.length; i++) {
            var section = this.sections[i];

            // symbol with mods
            if (section.type === 2) {
                var subsections = section.text.split(".");
                section.modifiers = subsections.slice(1);

                section.symbol = subsections[0];
                this.requiredSymbols.push(section.symbol);
            }

            // action
            if (section.type === 1) {
                var index = section.text.indexOf(":");
                var symbol = section.text.slice(0, index);

                var command = section.text.slice(index + 1);
                section.symbol = symbol;
                if (command !== "POP") {
                    section.rule = new Rule(command);
                    this.requiredSymbols = this.requiredSymbols.concat(section.rule.requiredSymbols);
                }

                section.command = command;
            }
        }

    };

    Rule.prototype.isValid = function(grammar) {
        for (var i = 0; i < this.requiredSymbols.length; i++) {
            if (!grammar.hasSymbol(this.requiredSymbols[i])) {
              //  if (app.warnings)
                //    console.warn("Invalid rule: [" + this.source + "] is missing symbol " + this.requiredSymbols[i]);
                return false;
            }
        }
        return true;
    };

    Rule.prototype.execute = function(node) {
        for (var i = 0; i < this.sections.length; i++) {
            var section = this.sections[i];
            switch(section.type) {

                // Text only
                case 0:
                    node.addText(section.text);
                    break;

                // Commands
                case 1:
                    var traceID = node.trace.id;
                    if (section.command.lastIndexOf("LINK", 0) === 0) {
                        var flat = subtrace.expand().flatten();
                    } else {

                        if (section.command === "POP" || section.command === "pop") {
                            node.trace.grammar.popRules(section.symbol, traceID);
                        } else {

                            var subtrace = node.trace.grammar.createTrace(section.command);
                            var flat = subtrace.expand().flatten();
                            node.trace.grammar.pushRules(section.symbol, [flat], traceID);
                        }
                    }

                    break;

                // symbol
                case 2:
                    node.addSymbol(section.symbol, section.modifiers);
                    break;
            }
        }

    };

    Rule.prototype.toString = function() {
        return this.source;
    };

    // Return an array of strings, tagged 0 for plaintext, 1 for brackets, and 2 for tags
    function getBracketContents(s, openBracket, closeBracket) {
        var start = s.indexOf(openBracket);
        var end = s.lastIndexOf(closeBracket, 0);
        if (start < 0)
            throw ("Invalid brackets in string " + s + " No open bracket " + openBracket);
        if (end < 0)
            throw ("Invalid brackets in string " + s + " No close bracket " + closeBracket);

        if (start > end)
            throw ("Invalid brackets in string " + s + ": " + openBracket + " appears after " + closeBracket);
    }

    function parseBrackets(s, openBracket, closeBracket, tag) {
        var lvl = 0;
        var lastStart = 0;
        var inTag = false;
        var sections = [];

        if (!s.charAt) {
            throw ("Can't parse brackets for a non-string! " + s);
        }

        function addSection(type, start, end) {
            if (start !== end) {
                sections.push({
                    text : s.slice(start, end),
                    type : type,
                });
            }
        }

        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            switch(c) {
                case openBracket:
                    // Create a text section from whatever came before
                    if (lvl === 0) {
                        addSection(0, lastStart, i);
                        lastStart = i + 1;
                    }

                    lvl++;
                    break;
                case closeBracket:
                    lvl--;
                    if (lvl === 0) {

                        // Slice from the last start to this
                        addSection(1, lastStart, i);
                        lastStart = i + 1;
                    }
                    break;
                case tag:
                    if (lvl === 0) {
                        if (inTag)
                            addSection(2, lastStart, i);
                        else
                            addSection(0, lastStart, i);
                        lastStart = i + 1;
                        inTag = !inTag;

                        break;
                    }
            }
        }

        if (lvl > 0)
            throw ("Too many " + openBracket + " in " + s);
        if (lvl < 0)
            throw ("Too many " + closeBracket + " in " + s);
        addSection(0, lastStart, i);

        /*
         console.log(utilities.arrayToString(sections, function(s) {
         return "'" + s.type + ":" + s.text + "'";
         }));
         */
        return sections;
    };

    //=================================================================================
    //=================================================================================
    //=================================================================================

    function RuleSet(symbol, rawRules, distribution) {
        if (!Array.isArray(rawRules)) {
            rawRules = [rawRules];
            console.warn("wrapping single rule in array:" + rawRules);
        }

        this.symbol = symbol;
        this.distribution = distribution;
        this.uses = [];

        this.totalUses = .1;
        //  this.rules = rules.slice();

        this.rules = rawRules.map(function(rawSource) {
            return new Rule(rawSource);
        });

        for (var i = 0; i < this.rules.length; i++) {
            this.uses[i] = .2;
        }

    };

    RuleSet.prototype.getRuleIndex = function() {
        var choicePct = Math.random();
      /*
        if (this.distribution)
            choicePct = this.distribution.getRandom();
        */
        return Math.floor(this.rules.length * choicePct);
    };

    RuleSet.prototype.getRule = function() {
        var debug = false;

        var which, usePct;
        var tries = 0;

        this.erodeUses();

        var expectedAvg = 1.2 / this.uses.length;

        var isValid = false;
        var rule;
        while (tries < 10 && !isValid) {
            isValid = true;
            which = this.getRuleIndex();
            pct = this.uses[which] / this.totalUses;

            if (pct > expectedAvg) {
                isValid = false;
            }

            var rule = this.rules[which];
            if (!rule.isValid(this.symbol.grammar)) {
                isValid = false;
            }
            tries++;
        }

        // Just go through manually
        if (!isValid) {

            for (var i = 0; i < this.rules.length; i++) {

                if (this.rules[i].isValid(this.symbol.grammar)) {
                    which = i;
                    break;
                }
            }
        }

        this.uses[which]++;
        this.totalUses++;

        return this.rules[which];
    };

    RuleSet.prototype.erodeUses = function() {
        this.totalUses = .1;
        for (var i = 0; i < this.uses.length; i++) {
            this.uses[i] = Math.max(0, this.uses[i] * .9 - .1);
            this.totalUses += this.uses[i];
        }

    };

    RuleSet.prototype.toString = function() {
        return "[" + this.rules.join(",") + "]";
    };

    RuleSet.setSeed = function(seed) {
        m_w = seed;
    };

    //=================================================================================
    //=================================================================================
    //=================================================================================
    // Node object
    function Node(parent, childIndex, options) {
        if (childIndex < 0) {
            this.trace = parent;
            this.childIndex = 0;
            this.depth = 0;
        } else {
            this.trace = parent.trace;
            this.parent = parent;
            this.depth = parent.depth + 1;
        }

        if (options.symbol) {
            this.type = "symbolExpansion";
            this.symbol = options.symbol;
            this.modifiers = options.modifiers;
        }

        if (options.rule) {
            this.type = "ruleExpansion";
            this.rule = options.rule;
        }

        if (options.plainText) {
            this.type = "plainText";
            this.finishedText = options.plainText;
        }
        if (this.type === undefined) {
            console.log(options);
            throw ("Can't create a node with no type! ");
        }

        this.children = [];
    };

    // Turn into bare text
    Node.prototype.flatten = function() {
        if (this.type === "plainText")
            return this.finishedText;

        var s = "";
        for (var i = 0; i < this.children.length; i++) {

            s += this.children[i].flatten();
        }

        if (this.modifiers) {
            for (var i = 0; i < this.modifiers.length; i++) {
                var modifier = this.modifiers[i];
                var args = [];
                if (modifier.indexOf("(") > 0) {
                    var args = modifier.substring(modifier.indexOf("(") + 1, modifier.indexOf(")")).split(",");
                    modifier = modifier.substring(0, modifier.indexOf("("));

                }
                var fxn = modificationFunctions[modifier];

                if (fxn)
                    s = fxn(s, args);
                else
                    throw ("Unknown modifier: " + this.modifiers[i]);
            }
        }
        return s;
    };

    Node.prototype.expand = function() {

        if (this.rule) {
            this.rule.execute(this);

        } else {
            if (this.symbol) {
                this.rule = this.trace.grammar.getRule(this.symbol, this.trace.id);
                this.rule.execute(this);
            } else {
                throw ("Neither rule nor symbol! " + this);
            }
        }

        return this;
    };

    Node.prototype.addText = function(text) {
        var n = new Node(this, this.children.length, {
            plainText : text
        });

        this.children.push(n);

    };

    Node.prototype.addSymbol = function(symbol, modifiers) {
        var n = new Node(this, this.children.length, {
            symbol : symbol,
            modifiers : modifiers
        });
        this.children.push(n);
        n.expand();
    };

    //=================================================================================
    //=================================================================================
    //=================================================================================
    // Trace object
    function Trace(grammar, options) {
        this.id = traceCount;
        traceCount++;

        this.grammar = grammar;
        this.root = new Node(this, -1, options);
        //   this.expand(true);
    };

    Trace.prototype.expand = function(recursively) {
        this.root.expand(recursively);
        var traceID = this.id;

        // Did all the overwrites get undone?
        this.grammar.forAllSymbols(function(symbol) {
            if (symbol.ruleOverrides[traceID] && symbol.ruleOverrides[traceID].length !== 0)
                console.warn(symbol.key + " still has " + symbol.ruleOverrides[traceID].length + " overrides! " + symbol.ruleOverrides[traceID].join(","));
        });

        return this.root;
    };

    // Compress the tree into a single string
    Trace.prototype.flatten = function() {
        return this.root.flatten();
    };

    // Expand and compress the tree into a single string
    Trace.prototype.expandAndFlatten = function() {
        this.expand();
        return this.flatten();
    };

    Trace.prototype.debugOutput = function() {

    };

    //=================================================================================
    //=================================================================================
    //=================================================================================
    function Symbol(grammar, key) {
        this.key = key;
        this.grammar = grammar;

        // Rule sets can be overidden
        this.ruleOverrides = { };

    };

    Symbol.prototype.getRule = function(traceID) {
        // any universal overrides? (aka, shared between all traces)
        var override = this.ruleOverrides["universal"];

        // any specific overrides?
        if (this.ruleOverrides[traceID])
            override = this.ruleOverrides[traceID];

        if (override && override.length > 0) {
            if (!override[override.length - 1]) {
                console.log(this);

                throw ("Cannot get override for symbol: '" + this.key + "' for traceID " + traceID);
            }
            return override[override.length - 1].getRule();
        } else {
            if (!this.baseRules) {
                console.log(this.grammar.symbols);
                throw ("No base rules for " + this.key + "! " + traceID);
            }
            return this.baseRules.getRule();
        }
    };

    Symbol.prototype.createBaseRules = function(rawRules) {
        if (rawRules.length === 0)
            throw ("No rules for " + this);
        this.baseRules = new RuleSet(this, rawRules);
    };
    //========================================================================
    Symbol.prototype.getRules = function() {
        return this.baseRules.rules.map(function(rule) {
            return rule.source;
        });
    };

    Symbol.prototype.setRules = function(rawRules, traceID) {
        if (!Array.isArray(rawRules)) {
            rawRules = [rawRules];
        }

        var ruleSet = new RuleSet(this, rawRules);

        this.baseRules = ruleSet;
    };

    Symbol.prototype.pushRules = function(rawRules, traceID) {
        if (!Array.isArray(rawRules)) {
            rawRules = [rawRules];
        }
        traceID = traceID !== undefined ? traceID : "universal";

        var ruleSet = new RuleSet(this, rawRules);
        if (!this.ruleOverrides[traceID])
            this.ruleOverrides[traceID] = [];

        this.ruleOverrides[traceID].push(ruleSet);
    };

    Symbol.prototype.popRules = function(traceID) {
        traceID = traceID !== undefined ? traceID : "universal";

        if (this.ruleOverrides[traceID]) {
            if (this.ruleOverrides[traceID].length > 0)
                return this.ruleOverrides[traceID].pop();
            else
                throw ("Can't pop from empty rule list for " + this.toString() + " traceid:" + traceID);

        }
        throw ("TOO MANY POP OPERATIONS: No override rules remaining for " + this.toString() + " traceid:" + traceID);
    };

    Symbol.prototype.resetConnectivity = function() {
        this.references = [];
        this.leafRules = [];
    };

    Symbol.prototype.calculateConnectivity = function() {
        var symbol = this;
        var grammar = this.grammar;
        console.log("calculate connectivity to " + this);

        var connections = {};

        // How many leaf rules?  (ie, rules with no dependencies)
        var leafRules = [];

        // For each base rule, is the rule using any other symbols?
        if (this.baseRules) {

            this.baseRules.rules.forEach(function(rule) {
                var isLeaf = true;
                rule.sections.forEach(function(section) {
                    var key = section.symbol;
                    if (key) {
                        var refSymbol = grammar.symbols[key];

                        if (connections[key] === undefined)
                            connections[key] = [];

                        if ($.inArray(rule, connections[key]) < 0)
                            connections[key].push(rule);

                        isLeaf = false;
                    }
                });

                if (isLeaf)
                    leafRules.push(rule);

            });
        }

        this.connections = connections;
        this.leafRules = leafRules;

    };

    //========================================================================

    Symbol.prototype.debugOutput = function() {
        console.log("  " + this.key + this.baseRules);

    };

    //=================================================================================
    //=================================================================================
    //=================================================================================
    // Grammar object
    function Grammar(source) {
        var grammar = this;
        this.expansionCount = 0;
        //   variable = (condition) ? true-value : false-value;
        this.title = (source.traceryTitle) ? source.traceryTitle : "Untitled Grammar";
        this.startSymbol = "origin";
        this.sourceRules = (source.rules) ? source.rules : source;

        // Set up the symbol library
        this.symbols = {};
        this.symbolList = Object.keys(this.sourceRules);

        for (var i = 0; i < this.symbolList.length; i++) {
            var key = this.symbolList[i];

            // Create a symbol object
            grammar.symbols[key] = new Symbol(this, key);
            grammar.symbols[key].isBaseSymbol = true;
            grammar.symbols[key].createBaseRules(this.sourceRules[key]);
        }

    };

    Grammar.prototype.createSymbol = function(key) {
        this.symbols[key] = new Symbol(this, key);
        return this.symbols[key];
    };

    Grammar.prototype.createAnalysis = function() {

        return new Analysis(this);
        console.log("Analyzing Grammar " + this.name);
        var symbolList = Object.keys(this.sourceRules);
        console.log("   " + symbolList.length + " symbols:");
        console.log("   " + symbolList.join(", "));

        var pushList = {};
        var unknownSymbols = [];

        for (var i = 0; i < symbolList.length; i++) {
            var spacer = "    ";
            var key = symbolList[i];
            var symbol = this.symbols[key];
            var rules = symbol.baseRules.rules;
            console.log(spacer + key + ": " + rules.length + " rules");
            var totalLength = 0;
            var counts = {

                plain : 0,
                symbol : 0,
                mod : 0,
                push : 0,
                pop : 0,
            };

            // analyze rules
            for (var j = 0; j < rules.length; j++) {
                totalLength += rules[j].source.length;
                for (var k = 0; k < rules[j].sections.length; k++) {
                    var section = rules[j].sections[k];
                    switch(section.type) {
                        case 0:
                            counts.plain++;
                            break;
                        case 1:
                            // Add to a list of when this is pushed, and by what
                            if (section.command === "pop") {
                                counts.pop++;

                            } else {
                                counts.push++;
                                if (!pushList[section.command])
                                    pushList[section.command] = [];
                                pushList[section.command].push(key);
                            }
                            break;
                        case 2:
                            counts.symbol++;
                            var symbol = this.symbols[section.symbol];
                            if (symbol === undefined) {
                                unknownSymbols.push(section.symbol);
                            } else {

                            }

                    }
                }
            }
            var avg = totalLength / rules.length;
        };
        console.log("unknownSymbols: " + unknownSymbols.join(", "));

    };

    Grammar.prototype.forAllSymbols = function(f) {
        var symbolList = Object.keys(this.symbols);
        for (var i = 0; i < symbolList.length; i++) {
            if (this.symbols[symbolList[i]])
                f(this.symbols[symbolList[i]]);
        }
    };

    Grammar.prototype.getRule = function(key, traceID) {
        if (!this.symbols[key]) {
            throw ("No symbol found for key " + key);
        } else {
            return this.symbols[key].getRule(traceID);
        }
    };

    Grammar.prototype.hasSymbol = function(key, traceID) {
        if (this.symbols[key] === undefined)
            return false;
        return true;
    };

    // Hard overwrite of the base rules
    Grammar.prototype.setRules = function(key, rawRules, traceID) {
        if (!this.symbols[key]) {
            this.symbols[key] = new Symbol(this, key);
        }

        this.symbols[key].setRules(rawRules, traceID);

    };

    // Hard overwrite of the base rules
    Grammar.prototype.removeSymbol = function(key) {
        this.symbols[key] = undefined;
    };

    Grammar.prototype.pushRules = function(key, rawRules, traceID) {
        if (!this.symbols[key])
            this.symbols[key] = new Symbol(this, key);

        this.symbols[key].pushRules(rawRules, traceID);

    };

    Grammar.prototype.popRules = function(key, traceID) {
        if (this.symbols[key])
            this.symbols[key].popRules(traceID);
    };

    Grammar.prototype.createFlattened = function(rule) {

        var trace = this.createTrace(rule);
        var flat = trace.expand().flatten();

        return flat;
    };

    // Call with nothing, will use the base trace
    Grammar.prototype.createTrace = function(rule) {
        this.expansionCount++;
        if (rule)
            return new Trace(this, {
                rule : new Rule(rule)
            });

        // use start if nothing provided
        return new Trace(this, {
            symbol : this.startSymbol
        });
    };

    Grammar.prototype.canExpand = function() {

    };

    Grammar.prototype.createTraceFromSymbol = function(symbol) {
        this.expansionCount++;

        // use start if nothing provided
        symbol = symbol ? symbol : this.startSymbol;

        return new Trace(this, {
            symbol : symbol
        });
    };

    Grammar.prototype.forEachSymbol = function(f) {
        var symbolList = Object.keys(this.symbols);
        for (var i = 0; i < symbolList.length; i++) {
            f(this.symbols[symbolList[i]], symbolList[i]);
        }
    };

    Grammar.prototype.removePrefix = function(prefix) {
        var symbolList = Object.keys(this.symbols);
        for (var i = 0; i < symbolList.length; i++) {
            var key = symbolList[i];
            if (key.indexOf(prefix) === 0)
                this.symbols[key] = undefined;

        }
    };

    Grammar.prototype.createReferencedSymbols = function() {
        var grammar = this;
        this.forEachSymbol(function(symbol, key) {

            // For each base rule, is the rule using any other symbols?
            if (symbol.baseRules) {
                symbol.baseRules.rules.forEach(function(rule) {
                    rule.sections.forEach(function(section) {
                        var key = section.symbol;

                        if (key && grammar.symbols[key] === undefined) {
                            var symbol = grammar.createSymbol(key);
                            symbol.wasCreatedByRef = true;
                        }
                    });
                });
            }
        });
    };

    Grammar.prototype.debugOutput = function() {
        var symbolList = Object.keys(this.symbols);
        for (var i = 0; i < symbolList.length; i++) {
            this.symbols[symbolList[i]].debugOutput();
        }

    };

    Grammar.prototype.calculateConnectivity = function() {
        this.createReferencedSymbols();

        var symbolList = Object.keys(this.symbols);

        for (var i = 0; i < symbolList.length; i++) {
            this.symbols[symbolList[i]].resetConnectivity();
        }

        for (var i = 0; i < symbolList.length; i++) {

            // Which symbols does this go to?
            this.symbols[symbolList[i]].calculateConnectivity();
        }
    };

    //=================================================================================
    //=================================================================================
    //=================================================================================

    return {

        createGrammar : function(obj) {
            var grammar = new Grammar(obj);
            return grammar;
        },
    };
})();


