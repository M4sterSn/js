(function ($, window, document, undefined) {


    "use strict";  //utiliza una cierta version de ECSM 5

    var pluginName = "templatereport",  //importante ya que es como se instancia en el programa $(a).templatereport

    pluginVersion = "1.0",

    /**
	* CHANGELOG:
	* V 1.0:
	*  - Initial Release
    */


    Plugin = function(element, options, dataName) {

        //Self (Add to this)
        // -----------------
        //    Stores all of the `Plugin` object instance variables
        var self = {

            //The DOM element that called the plugin
            el: element,

            //The DOM element that called the plugin (wrapped in a jQuery object)
            $el: $(element),

            //The plugin options object
            options: options,

            //The name of the plugin
            dataName: dataName

        },

        //_Callback Support ##ALL UNDERSCORED FUNCTIONS ARE PRIVATE
        // ----------------
        //      Calls the function passed in as the parameter
        _callbackSupport = function(callback) {

            //Checks to make sure the parameter passed in is a function
            if($.isFunction(callback)) {

                /*
                Calls the method passed in as a parameter and sets the context to
                the `Plugin` object, which is stored in the jQuery `data()`
                method.  This allows for the `this` context to reference the
                Plugin API Methods in the callback function. The original element
                that called the plugin(wrapped in a jQuery object) is the only
                parameter passed back to the callback
                */
                callback.call(self.$element.data(dataName), self.$element);
            }

            //Maintains chainability
            return this;
        },


        mapping = function() {

        	self.options.dbug && console.group('<'+pluginName+'['+pluginVersion+'] @ mapping >');

        		self.options.dbug && console.info("arguments: %o", arguments);

	        	if(!arguments.length) return this;

	            var json = {"row_index":[], "detail_name":[], "min_val":[], "max_val":[], "units":[], "value":[]},
	            table = arguments[0];
	            // var json = {};
	            table.find("tbody > tr").each(function(k,v) {

	                for (var td in v.children ){   //iteracion de objetos td

	                    if( v.children.hasOwnProperty(td) ){  //este equivale al key de td

	                        if( v.children[td].children ) {  //este es el contenido de tags dentro de este td

	                            var name = v.children[td].children[0].getAttribute("name").replace(/\[\]/g,""), //busca las llaves [] y quitalas del atributo name
	                                value = v.children[td].children[0].value.toString();
	                                // value = (name == "row_index") ? v.children[td].children[0].value.toString():v.children[td].children[0].value.toString();
	                                // value = (name == "row_index") ? v.children[td].children[0].value.toString().toLowerCase():v.children[td].children[0].value.toString();

	                            if( json.hasOwnProperty(name) ) json[name].push(value);  //se llena el arreglo json


	                        }// if


	                    }// if


	                }// for

	            });


	            self.options.dbug && console.info("json: %o", json);
	            var defJson = {};
	            for(var loop in json["row_index"]){    //loop es el key de cada iteracion

	                if( json["row_index"].hasOwnProperty(loop) ){  //doble validacion arreglo numerico

	                    // console.info(json["row_index"][loop] || "Hit em");

	                    defJson[json["row_index"][loop]] = {};

	                    defJson[json["row_index"][loop]][ "nombre" ] = json["detail_name"][loop] || "";
	                    defJson[json["row_index"][loop]][ "valor" ] = json["value"][loop] || "";
	                    defJson[json["row_index"][loop]][ "min_valor" ] = json["min_val"][loop] || "";
	                    defJson[json["row_index"][loop]][ "max_valor" ] = json["max_val"][loop] || "";
	                    defJson[json["row_index"][loop]][ "unidad" ] = json["units"][loop] || "";

	                }// if


	            }// for


	            // setOption("dataJson", defJson);

                // console.warn("template: %o",self.options.template_raw);

	            var template_compiled = self.options.handlebars.compile(self.options.template_raw); // se carga en events y es el contenido de textarea
                // console.info("DEF-JSON: %o",  self.options.underscore.extend({}, defJson, {'paciente':self.options.extraInfo} || {} ) );
                // console.info("template_compiled: %o", template_compiled);

	            $("<div style='width: auto;'>").empty().append( template_compiled( self.options.underscore.extend({}, defJson, {'paciente':self.options.extraInfo} || {} ) ) ).dialog( getOption("configDialog") ); //interpreta las variables que estan en el textarea por los valores del arreglo json y lo manda a un dialog

	        self.options.dbug && console.groupEnd();

            return this;

        },


        json = function() {
        	self.options.dbug && console.group("<template-reports["+pluginVersion+"] @ json >");

        		self.options.dbug && console.warn("arguments: %o", arguments);
        		var args = arguments;
        		if(!args.length) return this;
        		// 0: data
        		// 1: template_raw if not buscar template

        		// El template es $el
        		if(parseInt( args[1] ) == -1){
        			setOption( "template_raw",self.options.replace( self.$el.html() , self.options.outRangeFormat || null, self.options.outRangeApply || [] ) );
        		}



        		var template_compiled = self.options.handlebars.compile(self.options.template_raw),
        			formated_json = {};

                self.options.dbug && console.info("template_raw: %o", self.options.template_raw );

        		// var formated_json = {};
        		for(var loop in args[0]["row_index"]){

        		    if( args[0]["row_index"].hasOwnProperty(loop) ){

        		        // console.info(args[0]["row_index"][loop] || "Hit em");

        		        formated_json[args[0]["row_index"][loop]] = {};

        		        formated_json[args[0]["row_index"][loop]][ "nombre" ] = args[0]["detail_name"][loop] || "";
        		        formated_json[args[0]["row_index"][loop]][ "valor" ] = args[0]["value"][loop] || "";
        		        formated_json[args[0]["row_index"][loop]][ "min_valor" ] = args[0]["min_val"][loop] || "";
        		        formated_json[args[0]["row_index"][loop]][ "max_valor" ] = args[0]["max_val"][loop] || "";
        		        formated_json[args[0]["row_index"][loop]][ "unidad" ] = args[0]["units"][loop] || "";

        		    }// if


        		}// for


        		self.$el.empty().append(template_compiled( self.options.underscore.extend({}, formated_json, {'paciente':self.options.extraInfo} || {} ) )); //convierte los tags del template por valores reales

            	// $("<div style='width: auto;'>").empty().append( template_compiled( defJson ) ).dialog( getOption("configDialog") );

        	self.options.dbug && console.groupEnd();

            return this;
        },


        //_Events (Add to this)
        // --------------------
        //      Adds plugin event handlers
        _events = function(opts) {



            // Evento Click
            self.$el.bind("click", function(e) {

            	self.options.dbug && console.group("<template-reports["+pluginVersion+"] @ _events:click >");

                e.preventDefault();

                if( self.options.tinymce ){

	                // setOption( "template_raw", getOption("replace")( $("textarea#" + getOption("idTemplate") ).val() || "" ) );
	                setOption( "template_raw", self.options.replace( self.options.tinymce.get( self.options.idTemplate ).getContent() || $("textarea#" + self.options.idTemplate ).val(), self.options.outRangeFormat || null , self.options.outRangeApply || [] ) ); //mete todo el contenido de tinymce o de textarea en template_raw y outrage format

	                self.options.dbug && console.info("template_raw: %o", self.options.template_raw );

	                // opts
	                // Array []
	                var actions = getOption("previewFrom"), array_param = [];
	                // console.info("Actions: %o",$.isFunction( self.$el.data()[pluginName][ actions["fnc"] ] ) );
					if( $.isFunction( self.$el.data()[pluginName][ actions["fnc"] ] ) ){

						if( getOption("dbug") )console.warn("is Function: %o", self);
						// console.warn("built: %o", array_param.push(function(a) {
						// 	console.info(a);
						// }) );

						self.options.underscore.each(actions["retrieveOpts"] || [],function(value,key) {

							self.options.dbug && console.info("{%o: %o}",key,value);
							array_param.push( getOption(value) );
						});

						self.options.dbug && console.info("array_param: %o", array_param);

						if(array_param.length) self.$el.data()[pluginName][ actions["fnc"] ].apply(self, array_param);  //similar al call_user_func se envia con el contexto y un arreglo esto manda llamar mapping

						// actions["retreiveOpts"]


				 	}

				}else{
					self.options.dbug && console.info("No esta option['tinymce'] definida");
				}

                self.options.dbug && console.groupEnd();

                return false;
            });




            //Maintains chainability
            return this;
        },

        //Get Option
        // ---------
        //      Returns a single plugin option
        getOption = function(key, callback) {

            /*
            Returns the plugin option if it exists, and returns undefined if the
            option does not exist
            */
            return self.options[key] || undefined;
        },

        //Get Options
        // ----------
        //      Returns all of the plugin options
        getOptions = function(callback) {

            //Returns an object of all of the plugin's options
            return self.options || undefined;
        },

        //Set Option
        // ---------
        //      Replaces a single existing plugin option
        setOption = function(key, value, callback) {

            //Makes sure a string is passed in
            if(typeof key === "string") {
                //Sets the plugin option to the new value provided by the user
                self.options[key] = value;
            }
            //Provides callback function support
            _callbackSupport(callback);

            //Maintains chainability
            return this;
        },

        //Set Options
        // ----------
        //      Accepts an object to replace plugin options properties
        setOptions = function(newOptions, callback) {

            //If the passed in parameter is an object literal
            if($.isPlainObject(newOptions)) {

                /*
                Uses the jQuery `extend` method to merge the user specified
                options object with the self.options` object to create a new
                object.  The options variable is set to the newly created
                object.
                */
                self.options = $.extend({}, self.options, newOptions);
            }

            //Provide callback function support
            _callbackSupport(callback);

            //Maintains chainability
            return this;
        },

        //Disable (Add to this)
        // --------------------
        //      Disables the DOM element created by the plugin
        disable = function(callback) {

            //Provides callback function support
            _callbackSupport(callback);

            //Maintains chainability
            return this;
        },

        //Enable (Add to this)
        // -------------------
        //      Enables the DOM element created by the plugin
        enable = function(callback) {

            _callbackSupport(callback);

            //Maintains chainability
            return this;
        },

        //Destroy (Add to this)
        // --------------------
        //      Brings the page back to it's intial state
        destroy = function(callback) {

            //Provides callback function support
            _callbackSupport(callback);

            //Maintains chainability
            return this;
        },

        //Create (Add to this)
        // -------------------
        //      Constructs the plugin
        create = function(callback) {

            //Provides callback function support
            _callbackSupport(callback);
            // Extend de Options & Defaults
            setOptions();
            self.options.dbug && console.group('<'+pluginName+'['+pluginVersion+'] @ create >');

            	self.options.dbug && console.log("%c Options: %o" ,"background: #999; color: #BADA55;", getOptions());

	            self.options.handlebars.registerHelper("templateReport", function(conditional, options) {

	                if(conditional != "undefined" && conditional) {
	                    return options.fn(this);
	                }

	            });

                // self.options.handlebars.registerPartial("parametros", self.options.templatePartials.parametros);

                self.options.handlebars.registerHelper("debug", function(optValue, str) {
                    if(!str) str = "%o";
                    console.log("Context");
                    console.log("===============");
                    console.log(this);

                    if(optValue){
                        console.log("Value");
                        console.log("===============");
                        console.log(str,optValue);
                    }

                });


	             self.options.handlebars.registerHelper("ifRange", function(conditional, options) {

	                // if( getOption("dbug") ) console.info("ifRange {conditional: %o}", conditional);
                    // console.info("ifRange", options);
	                // if ( conditional != "undefined" ) return options.fn(this);
	                if( conditional.indexOf("*") > -1 && getOption("outRangeFormat") ){
	                	return options.fn(this);
	                }
                    else{
	                	return options.inverse(this);
	                }
	                // if(conditional != "undefined" && conditional) {
	                    // return options.fn(this);
	                // }

	            });


            if( self.options.enableEvents ) _events(getOptions());

            self.options.dbug && console.groupEnd();

            //Maintains chainability
            return this;
        };

        //Public API (Add to this if you create custom public methods/properties)
        // -----------------------
        //    All of these methods or properties are public

        return {

            //**version**: The current version of the plugin
            version: pluginVersion,

            //**self**: Object holding all of the plugin instance properties
            self: self,

            /*
            **getOption**: Returns a single plugin option.
            Accepts one parameter (String key)
            */
            getOption: getOption,

            /*
            **getOptions**: Returns an object containing all of the current
            plugin options
            Does not accept parameters
            */
            getOptions: getOptions,

            /*
            **setOption**: Sets a single plugin option.
            Accepts two parameters (String key, value)
            */
            setOption: setOption,

            /*
            **setOptions**: Sets or adds new plugin option settings.
            Accepts one parameter (Object newOptions)
            */
            setOptions: setOptions,

            /*
            **disable**: Disables the DOM element associated with the plugin
            Does not accept parameters
            */
            disable: disable,

            /*
            **enable**: Enables the DOM element associated with the plugin
            Does not accept parameters
            */
            enable: enable,

            /*
            **destroy**: Removes all plugin events, data, and DOM elements
            Does not accept parameters
            */
            destroy: destroy,

            /*
            **create**: Constructs the plugin
            Does not accept parameters
            */
            create: create,

            mapping: mapping,
            json: json

            };
        };

        //PLUGIN DEFINITION
        // ----------------
       //   Adds the plugin method to the jQuery prototype object
        $.fn[pluginName] = function (options) {

            //Maintains chainability for all calling elements
            return this.each(function () {

                /*
                Stores the calling element and the data name into local variables,
                instantiates the plugin variable (which will hold the Plugin
                object), and instantiates an empty object literal (which will be
                used to dynamically create a jQuery custom pseudo selector)
                este this especifica el elemento de la iteracion de each
                */
                var element = $(this), plugin, dataName = pluginName, obj = {};

                /*
                Returns early if the calling element already has a plugin
                instance associated with it inside of the jQuery `data` method
                */
                if ($.data(element[0], dataName)) {

                    return;

                }

                /*
                Uses the jQuery `extend` method to merge the user specified
                options object with the `self.options`object to create a new
                object. The options variable is set to the newly created
                object.
                */
                options = $.extend({}, $.fn[pluginName].options, options);

                // Instantiates a new `Plugin` object and creates the plugin
                plugin = new Plugin(this, options, dataName).create();

                /*
                Stores the new `Plugin` object in the calling element's
                jQuery `data` method
                */
                $.data(element[0], dataName, plugin);

                /*
                Uses the name of the plugin to create a dynamic property
                of an empty object literal
                */
                obj[pluginName] = function(elem) {
                    /*
                    Returns all DOM elements that have jQuery `data()`
                    created by the plugin
                    */
                    return $(elem).data(dataName) !== undefined;
                };

                //Adds custom jQuery pseudo selectors
                $.extend($.expr[":"], obj);
                //end extending jQuery pseudo selectors

            }); //end return statement

        };  //end plugin

    //Default plugin Options (Add to this)
    // -----------------------------------
    //    Adds default options to the plugin
    $.fn[pluginName].options = {
        dbug: false,
		underscore: window._ || {},
		handlebars: window.Handlebars || {},
		tinymce: window.tinyMCE || {},
		enableEvents: true,
        extraInfo: {},
		idTemplate: "open_complete",
        partials: [],
        configDialog: {
            modal: true,
            title: "Plantilla",
            closeOnEscape: true,
            resizable: true,
            width: $(window).width() * (($(window).width() > 1024) ? 0.5 : 0.75),
            height: $(window).height() * (($(window).height() > 1024) ? 0.5 : 0.75)

        },
        spans_table: $("table#value_spans_table"),
        outRangeFormat: true,
        outRangeApply: ["valor"], // Por el momento "valor" es el unico que se puede ejecutar el fuera de rango
        previewFrom: {fnc: "mapping", retrieveOpts: ["spans_table"] }, //["mapping","html", "json"] ONCE AT THE TIME
        replace: function(tpml, outRange, outRangeApply) {
            var _this = this;
            tpml = tpml.replace(/\[\[/g,'{{').trim().replace(/\]\]/g,"}}").trim();
            var stringObject = tpml.replace(/{{([\s\S]+?)}}/g,function(match, code){
                // console.warn("replace",arguments);
                var splited = code.split("."),
                    letter = splited[0] || "", // A,B,C
                    value = splited[1] || ""; // valor,nombre,unidad,max_valor,min_valor

                    // No es una saveWord
                if(outRange && outRangeApply.indexOf(value) > -1){
                	match = "{{#ifRange "+code+" }} <strong> "+match+" </strong> {{else}} "+match+" {{/ifRange}}";

                }

                return "{{#templateReport "+ letter +" }}" + match + "{{/templateReport}} ";
            });

            return stringObject;
        },

        templatePartials: {
            parametros : "<table cellpadding='0' cellspacing='0' border='0' width='100%' align='center' class='result_table' ><thead><tr><th>Nombre</th><th>Valor</th><th>Valor Minimo</th><th>Valor Maxino</th><th>Unidad</th></tr></thead><tbody>{{#each row_indexes}}{{#if this.nombre}}<tr><td>{{#ifRange this.valor}}<strong>{{this.nombre}}</strong>{{else}}{{this.nombre}}{{/ifRange}}</td><td align='center'>{{#ifRange this.valor}}<strong>{{this.valor}}</strong>{{else}}{{this.valor}}{{/ifRange}}</td><td align='center'>{{#ifRange this.valor}}<strong>{{this.min_valor}}</strong>{{else}}{{this.min_valor}}{{/ifRange}}</td><td align='center'>{{#ifRange this.valor}}<strong>{{this.max_valor}}</strong>{{else}}{{this.max_valor}}{{/ifRange}}</td><td align='center'>{{#ifRange this.valor}}<strong>{{this.unidad}}</strong>{{else}}{{this.unidad}}{{/ifRange}}</td></tr>{{/if}}{{/each}}</tbody></table>"
        }

    };

//      End of Plugin
}(jQuery, window, document));
//passes in the `jQuery`, `window`, and `document` global objects locally self invocate closure type of function Greg Francko
