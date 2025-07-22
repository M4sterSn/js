/*!
 * jQuery Report Result Widget
 * Michel Cervantes Garcia <ing.michel.cervantes at gmail dot com>
 * VERSION 1.3
 * Changelog
 * - Release 1.0
 * - 1.1
 *  > Numeric Range did not allowed floats either "valor" or "valor min max".
 *  > TriggerOutRange: "*" got stucked appeding to "valor".
 * - 1.2
 *  > Division of _operations in sub functions execute by an array of name functions, it runs like a trigger for all operations
 *  > Better handling of out range "valor" with "valor min" in the String comparison.
 * - 1.2.1
 *  > Fixed Number in range got "errorOutRange" class.
 * - 1.2.2
 *  > Fixed issues with "rstring" when minValue was empty.
 * - 1.2.3
 *  > Fixed issue with input_parser when value hadn't the equal sign.
 * - 1.2.4
 *  > Fixed issues with "rstring" because it was using extra validation with inputs not related.
 * - 1.2.5
 *  > Looked and fixed minor issue when "valor" got stuck with "*" appended to it when "rstring" was triggered.
 * - 1.3
 *  > Major release, usage of jQuery UI Widget Factory & better handling of core functions.
 */
(function ($, _,window, document, undefined) {

    /*
    ECMAScript 5 Strict Mode: [John Resig Blog Post]
    (http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/)
    */
    "use strict";


    var pluginName = "labReport",
    pluginVersion = "1.3",


    /*
    **Convention:** Methods or properties starting with `_` are meant to be
    private. You can make them public by including them in the return statement
    at the bottom of the Constructor
    */
    Plugin = function(element, options, dataName) {

        //Self (Add to this)
        // -----------------
        //      Stores all of the `Plugin` object instance variables
        var self = {

            //The DOM element that called the plugin
            el: element,

            //The DOM element that called the plugin (wrapped in a jQuery object)
            $el: $(element),

            //The plugin options object
            options: options,

            //The name of the plugin
            dataName: dataName,

            wrappers: {
                $tableWrap: $("table#value_spans_table") || null,
                $inputParser: $("#value_name") || null,
                $input_value: $("input.input_value") || null,

            },
            functions: {
                or_number : function(value, min,max) {
                    var $drf = $.Deferred();
                    self.options.dbug && console.info("call for or_number", arguments);
                    if(!self.options.or_number){
                        self.options.dbug && console.info("or_number: no esta habilitado");
                        return $drf.reject(false);
                    }
                    // Validar que los campos puedan compararse
                    if (_.isFinite(value) && !_.isNaN(value) &&
                        _.isFinite(min) && !_.isNaN(min) &&
                        _.isFinite(max) && !_.isNaN(max)
                        ) {

                        if(value >= min && value <= max){

                            return $drf.promise();

                        }else{

                            return $drf.reject(true);
                        }

                    }// if

                    return $drf.reject(false);



                },
                or_string : function(value, min, max) {

                    var $drf = $.Deferred();
                    self.options.dbug && console.info("call for or_string", arguments);
                    if(!self.options.or_string){
                        self.options.dbug && console.info("or_string: no esta habilitado");
                        return $drf.reject(false);
                    }
                    value = value.toString().toLowerCase();
                    min = min.toString().toLowerCase();

                    while(value.charAt(value.length-1)=="*") {
                        value = value.substring(0,value.length-1);
                    }

                    if(_.isFinite(value) == false && _.isFinite(min) == false && value.length > 0 && min.length > 0){

                        if(value === min){

                            return $drf.promise();
                        }else{

                            return $drf.reject(true);
                        }

                    }// if


                    return $drf.reject(false);
                }

            }

        },

        _inputParser = function(input , callback) {

                                var string = input.value.toString() || "",
                                    strSplitted = string.split(",") || [],
                                    array = [],
                                    flagError = 0;

                                for ( var v in strSplitted){

                                    var controlArray = [];

                                    // for( var i in strSplitted[v].trim()){

                                        // Buscar "=" [1]
                                        var splittedByEqual = strSplitted[v].split("=") || "",
                                            splittedBySign =  null;

                                        // Validando longitud de Array
                                        if( splittedByEqual.length < 2) flagError++;


                                        if( splittedByEqual[0].indexOf("+") > 0 && splittedByEqual.length > 1){

                                            splittedBySign = splittedByEqual[0].split("+");

                                            if( _.isArray(splittedBySign) && splittedBySign.length > 1 ) {

                                                controlArray.push(splittedBySign[0].trim());
                                                controlArray.push("+");
                                                controlArray.push(splittedBySign[1].trim());
                                                controlArray.push("=");
                                                controlArray.push(splittedByEqual[1].trim());

                                            }else{
                                                flagError++;
                                            }

                                        }
                                        if( splittedByEqual[0].indexOf("-") > 0 && splittedByEqual.length > 1){
                                            splittedBySign = splittedByEqual[0].split("-");

                                            if( _.isArray(splittedBySign) && splittedBySign.length > 1 ) {

                                                controlArray.push(splittedBySign[0].trim());
                                                controlArray.push("-");
                                                controlArray.push(splittedBySign[1].trim());
                                                controlArray.push("=");
                                                controlArray.push(splittedByEqual[1].trim());

                                            }else{
                                                flagError++;
                                            }
                                        }
                                        if( splittedByEqual[0].indexOf("*") > 0 && splittedByEqual.length > 1){
                                            splittedBySign = splittedByEqual[0].split("*");

                                            if( _.isArray(splittedBySign) && splittedBySign.length > 1 ) {

                                                controlArray.push(splittedBySign[0].trim());
                                                controlArray.push("*");
                                                controlArray.push(splittedBySign[1].trim());
                                                controlArray.push("=");
                                                controlArray.push(splittedByEqual[1].trim());

                                            }else{
                                                flagError++;
                                            }
                                        }
                                        if( splittedByEqual[0].indexOf("/") > 0 && splittedByEqual.length > 1){
                                            splittedBySign = splittedByEqual[0].split("/");

                                            if( _.isArray(splittedBySign) && splittedBySign.length > 1 ) {

                                                controlArray.push(splittedBySign[0].trim());
                                                controlArray.push("/");
                                                controlArray.push(splittedBySign[1].trim());
                                                controlArray.push("=");
                                                controlArray.push(splittedByEqual[1].trim());

                                            }else{
                                                flagError++;
                                            }
                                        }




                                    if(controlArray.length > 0 ) array.push(controlArray);
                                }// for

                                self.options.dbug && console.info("array Parsed: %o",array);

                                return ( ( flagError > 0 ) ? []:array );

        },




        //_Callback Support
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
                callback.call(self.$el.data(dataName), self.$el);
            }

            //Maintains chainability
            return this;
        },

        //_Events (Add to this)
        // --------------------
        //      Adds plugin event handlers
        _events = function() {


            self.options.dbug && console.group("["+pluginName+"]["+pluginVersion+"] @ _events");

                self.wrappers.$input_value.bind('blur.'+pluginName,function(e) {
                    // console.info("e.target: %o",$(e.target).closest("tr").find("input[name*=row_index]").get(0).value);
                    // console.info("e.target: %o",$(e.target).closest("tr").find("input[name*=min_val]").get(0).value);
                    // console.info("e.target: %o",$(e.target).closest("tr").find("input[name*=max_val]").get(0).value);
                    // var inputParsed = _inputParser(self.wrappers.$inputParser.get(0)),
                    var el = e.target,
                        min = $(e.target).closest("tr").find("input[name*=min_val]").get(0),
                        max = $(e.target).closest("tr").find("input[name*=max_val]").get(0);
                    // Tiene valor o string
                    // if( el.value.length > 0 ){
                    //     //* Valorar el uso de validador en campos calculados

                    //     el.value = el.value.replace('*','');
                    // }// if

                    $(el).removeClass(_.chain(self.options.cssClasses).map(function(el,index) { return el; }).value().join(' ')+ " inputReadOnly");

                    // Operaciones con inputParser
                    if(self.options.op_parse) _operations( $(el) );

                    if(self.options.op_out_range) { // esta activado el out of range.

                            var itemsResults = self.wrappers.$tableWrap.find(".inputReadOnly");//.trigger('blur.'+pluginName);
                            // console.info('IR',itemsResults.triggerHandler('blur.'+pluginName));
                            // Trigger individual
                            _outRange( el, min, max );

                            if( itemsResults.length > 0 ){ // Hay 1 o más resultados

                                _.each( itemsResults,function( input, index) { //por cada uno de los miembros de los resultados

                                    if( _(input.className.split(" ")).indexOf("math_error") == -1 ){ // Agrupa en un objeto de underscore

                                        if( input.value.length > 0 ){
                                            //* Valorar el uso de validador en campos calculados

                                            input.value = input.value.replace('*','');
                                        }// if

                                        // no esta math_error... Solo asi se puede validar rango
                                        var ir_min = $(input).closest("tr").find("input[name*=min_val]").get(0),
                                            ir_max = $(input).closest("tr").find("input[name*=max_val]").get(0);

                                        _outRange( input, ir_min, ir_max );
                                    }//if

                                });

                            }// if



                    }// if


                });



                self.wrappers.$inputParser.bind('blur.'+pluginName,function(e) {

                        var el = e.target,
                            parsed = _inputParser(el);
                        // Asegurar que tenga minimo una operacion completa ie[a*b=c]

                        if(parsed.length > 0 && el.value.length > 5){

                            if(self.options.op_parse) _operations(null, null,true);

                            if(self.options.op_out_range) {

                                    var itemsValue = self.wrappers.$input_value;

                                    // Trigger individual
                                    // _outRange( el, min, max );

                                    if( itemsValue.length > 0 ){

                                        _.each( itemsValue,function( input, index) {

                                            // if( _(input.className.split(" ")).indexOf("math_error") == -1 ){

                                                // if( input.value.length > 0 ){
                                                //     //* Valorar el uso de validador en campos calculados

                                                //     input.value = input.value.replace('*','');
                                                // }// if

                                                // no esta math_error... Solo asi se puede validar rango
                                                var ir_min = $(input).closest("tr").find("input[name*=min_val]").get(0),
                                                    ir_max = $(input).closest("tr").find("input[name*=max_val]").get(0);

                                                _outRange( input, ir_min, ir_max );
                                            // }//if

                                        });

                                    }// if

                            }// if


                        }else{
                            var itemsResults = self.wrappers.$tableWrap.find(".inputReadOnly");
                            itemsResults.removeClass(_.chain(self.options.cssClasses).map(function(el,index) { return el; }).value().join(' ') + " inputReadOnly").prop("readonly","");
                            itemsResults.val("");
                        }

                });

            self.options.dbug && console.groupEnd();


            //Maintains chainability
            return this;
        },

        _outRange = function(el, min, max) {

            var $drf = $.Deferred();

            $.when(

                self.functions.or_number(parseFloat(el.value), parseFloat(min.value), parseFloat(max.value) )

            ).then(function() {
                $drf.resolve();
                self.options.dbug && console.info("Validacion numerica: OK", arguments);
            }).fail(function(isError) {
                self.options.dbug &&  console.info("Validacion numerica: -- ", arguments);
                if(isError) $drf.reject();
            });


            $.when(
                self.functions.or_string(el.value, min.value)
            ).then(function() {
                $drf.resolve();

                self.options.dbug && console.info("validacion string: OK", arguments);
            }).fail(function(isError) {

                self.options.dbug && console.info("Validacion string: --", arguments);
                if(isError) $drf.reject();

            });


            if($drf.isRejected()){
                el.value = (el.value.indexOf("*") > -1) ? el.value: el.value + "*";
                $(el).addClass(self.options.cssClasses.out_range);
            } else {
                if(el.value.indexOf('*') > -1){
                    $(el).addClass(self.options.cssClasses.out_range);
                }
            }

        },


        _operations = function(item, parsed,is_reset) {

            if(!self.options.op_out_range) return this;

            parsed = _inputParser(self.wrappers.$inputParser.get(0));

            if(!item){
                // cuando el trigger tiene que ser global
                item = self.wrappers.$input_value;
            }

            item.removeClass(_.chain(self.options.cssClasses).map(function(el,index) { return el; }).value().join(' ')+ " inputReadOnly").prop("readonly","");


            if(parsed.length > 0){

                for ( var i in parsed){

                    var input_a = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(parseFloat(parsed[i][0]) )   ? parseFloat(parsed[i][0]) : $("input.input_value[data-index="+parsed[i][0].toLowerCase()+"]") ),
                        input_b = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(parseFloat(parsed[i][2]) )  ? parseFloat(parsed[i][2]) : $("input.input_value[data-index="+parsed[i][2].toLowerCase()+"]") ) || null,
                        operation = parsed[i][1]  || null,
                        result = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(parseFloat(parsed[i][4]) ) ? parseFloat(parsed[i][4]) : $("input.input_value[data-index="+parsed[i][4].toLowerCase()+"]") )  || null,
                        nResult = null
                        ;

                        // Reset to all the inputs
                            if(is_reset){
                                if( !/^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_a) ) input_a.removeClass(self.options.cssClasses.out_range);
                                if( !/^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_b) ) input_b.removeClass(self.options.cssClasses.out_range);
                                if( !/^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(result) ) result.removeClass(self.options.cssClasses.out_range);
                            }
                            // console.info("test: %o", !/^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_a));
                            if( input_a.length && /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_a) ) input_a[0].value = input_a[0].value.split("*")[0] || null;
                            if( input_b.length && /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_b) ) input_b[0].value = input_b[0].value.split("*")[0] || null;
                            if( result.length && /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(result) ) result[0].value = result[0].value.split("*")[0] || null;

                        // The result field is always with the "readonly" class
                        result.addClass("inputReadOnly").attr("readonly","readonly");

                    switch(operation){

                        case "*":

                            var one = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_a) ) ? input_a : parseFloat(input_a.val()),
                                two = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_b) ) ? input_b : parseFloat(input_b.val());
                            
                            if(one == 0){
                                nResult = ( one * two ) || 0;
                            }else{//POSIBLE CAMBIO PARA QUE APRAREZCAN LOS 0s
                                 nResult = ( one * two ) || 0;
                            }
                            nResult = ( one * two ) || 0;

                        break;
                        case "/":

                            var one = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_a) ) ? input_a : parseFloat(input_a.val()),
                                two = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_b) ) ? input_b : parseFloat(input_b.val());

                            // console.log(one)
                            if(one == 0){
                                nResult = ( one / two ) || 0;
                            }else{//POSIBLE CAMBIO PARA QUE APRAREZCAN LOS 0s
                                 nResult = ( one / two ) || 0;
                            }
                            nResult = ( one / two ) || 0;

                        break;
                        case "+":

                            var one = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_a) ) ? input_a : parseFloat(input_a.val()),
                                two = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_b) ) ? input_b : parseFloat(input_b.val());

                            nResult = ( one + two ) || 0;

                        break;
                        case "-":


                            var one = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_a) ) ? input_a : parseFloat(input_a.val()),
                                two = ( /^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/.test(input_b) ) ? input_b : parseFloat(input_b.val());


                            nResult = ( one - two );
                            if(nResult < 0){
                                nResult = null;
                            }

                        break;


                    }// switch


                    console.log(nResult)
                    // If result of operations is null, it gets the "matherror" class by default
                    if( nResult === null){
                        result.addClass(self.options.cssClasses.math_error);
                    }else{
                        result.removeClass(self.options.cssClasses.math_error);
                    }

                    // result.blur();

                    // a+aa=ab, az+b=bz
                    // The result field gets fixed or reduced its decimals
                    result.val( nResult == null ? '': Math.roundToPrecision( nResult.toString() ,2) );

                }// for



            }else{
                $("input.input_value.inputReadOnly").removeClass("inputReadOnly math_error").prop("readonly","");
            }


            // if(self.options.or_number){ self.functions.or_number(item ,parsed ); };



            // if(self.options.or_string){ self.functions.or_string(item ,parsed ); };

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

            self.options.dbug && console.group("["+pluginName+"]["+pluginVersion+"] @ create");
            self.options.dbug && console.log("Opts: %o",getOptions());
                _events();
                // onload instance
                if(self.options.triggerOnLoad){

                    if(self.options.op_parse) self.wrappers.$inputParser.trigger('blur.'+pluginName);

                    if(self.options.op_out_range) {

                            var itemsValue = self.wrappers.$input_value;

                            // Trigger individual
                            // _outRange( el, min, max );

                            if( itemsValue.length > 0 ){

                                _.each( itemsValue,function( input, index) {

                                    // if( _(input.className.split(" ")).indexOf("math_error") == -1 ){

                                        // if( input.value.length > 0 ){
                                        //     //* Valorar el uso de validador en campos calculados

                                        //     input.value = input.value.replace('*','');
                                        // }// if

                                        // no esta math_error... Solo asi se puede validar rango
                                        var ir_min = $(input).closest("tr").find("input[name*=min_val]").get(0),
                                            ir_max = $(input).closest("tr").find("input[name*=max_val]").get(0);

                                        _outRange( input, ir_min, ir_max );
                                    // }//if

                                });

                            }// if

                    }// if


                }

            self.options.dbug && console.groupEnd();


            //Maintains chainability
            return this;
        };

        //Public API (Add to this if you create custom public methods/properties)
        // -----------------------
        //      All of these methods or properties are public

        return {

            //**version**: The current version of the plugin
            version: pluginVersion,

            //**self**: Object holding all of the plugin instance properties
            // self: self,

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

            };
        };

        //PLUGIN DEFINITION
        // ----------------
       //       Adds the plugin method to the jQuery prototype object
        $.fn[pluginName] = function (options) {

            //Maintains chainability for all calling elements
            return this.each(function () {

                /*
                Stores the calling element and the data name into local variables,
                instantiates the plugin variable (which will hold the Plugin
                object), and instantiates an empty object literal (which will be
                used to dynamically create a jQuery custom pseudo selector)
                */
                var element = $(this), plugin, dataName = pluginName, obj = {}, metadata = element.data(dataName.toLowerCase()+"-opts") || {};
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
                options = $.extend({}, $.fn[pluginName].options, options, metadata);

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
    //      Adds default options to the plugin
    $.fn[pluginName].options = {
        dbug: true,
        triggerOnLoad: true,
        cssClasses: {
            out_range: "OutRange_error",
            math_error: "math_error"
        },
        value_regex: /^[a-zA-Z0-9]+$/,
        op_parse: true, // activa operacion PARSE para Campo Calculado,
        op_out_range: true, // activa operacion para CORRER operaciones a el campo "valor". out_range['numerico','string']

            or_number: true, // validacion de numerico
            or_string: true, // validacion de "valor" cone "valor minimo",

        // Para agregar otra funcion se agrega
    };

//      End of Plugin
}(jQuery, _,window, document));
//passes in the `jQuery`, `window`, and `document` global objects locally

/**
 * Rounds the supplied value to the precision specified by the precision parameter
 * @param {Number} value The value to round
 * @param {Number} precision The number of decimal places or precision to round to
 * @return {Number} The rounded number
 */
if(!Math.roundToPrecision)
{
    Math.roundToPrecision = function(value, precision)
    {
        //Guard.NotNull(value, 'value');
        if(!precision) precision = 2;

        b = Math.pow(10, precision);
        return Math.round(value * b) / b;
    }
}
