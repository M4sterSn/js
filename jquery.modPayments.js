(function ($, window, document, undefined) {


    "use strict";

    var pluginName = "modPayments",

    pluginVersion = "1.5.1",

    /**
     * @author Michel Cervantes <ing.michel.cervantes at gmail dot com> <at myxhel> </Myxhel>
     * @version 1.5.1
     * Copyright:
     * jQuery UI Widget modPayments
     * modPayments 1.5.1
     * May 2013
     *
    */
    /**
	* CHANGELOG:
	* V 1.4:
	*  - Major realease, changes with jquery ui widget factory structure
	*  - Added support for "money received" and "money change"
    * V 1.5:
    *  - Added support for credit cards comissions
    *  - Reviewed & Fixed minor issues with balance Function & rounding numbers
    * V 1.5.1:
    *  - Issues with simplemodal display for work_order_detail, got fixed by removing simplemodal and use jquery ui dialog
    *  - Added reset of card comission inputs values when TDC inputs are value zero o empty
    *  - Added options 'inputsToClear', after dialog in work_order_detail closes this function get triggered and clean all inputs
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
            dataName: dataName,

            // selectores de los inputs para payments
            selectors: {

            	jq_paymnt_div_digits : "div.div_digits_tdc",
            	jq_paymnt_total_pay : "input#total_pay",
            	jq_paymnt_money_pay : "input#money_pay",
            	jq_paymnt_business_pay : "input#business_pay",
            	jq_paymnt_hospital_pay : "input#hospital_pay",
                jq_paymnt_check_pay : "input#check_pay",
            	jq_paymnt_tdc_pay : "input#tdc_pay",
            	jq_paymnt_balance : "input#balance",
            	jq_paymnt_digits_tdc_pay : "input#digits_tdc_pay"

            },

            is_dbug: false

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
                callback.call(self.$element.data(dataName), self.$element);
            }

            //Maintains chainability
            return this;
        },


        // jq_console = function(fnc, msg){
        //     if(!fnc) fnc = 'log';
        //     if (window.console)
        //         if(!!getOption("dbug")) window.console[fnc]($obj);
        // },



        //_Events (Add to this)
        // --------------------
        //      Adds plugin event handlers
        _events = function(opts) {

			self.is_dbug && console.group('<'+pluginName+'['+pluginVersion+'] @ _events >');

				self.is_dbug && console.dir(opts);
				// Operaciones de balance
				doBalance(opts);

				$(opts.str_inputs_list.join(",")).bind("keyup focus blur",{self:self},function(e){

	                var $el  = $( e.target );

                		// Esta lleno con numero el campo de total a pagar
                		if ( ( parseFloat(opts.jq_paymnt_total_pay.val()) || 0.00 ) > 0){

                			// Operaciones de balance
                			doBalance(opts);

		                    //Verifica que el numero sea mayor a cero
		                    if (  ( parseFloat( $el.val() ) || 0.00 ) > 0 ){
		                        $el.removeClass("error_class");
		                        // genericOperations.calculateBalance();

		                        if(opts.enableOnChange){

		                        	doChange();

		                        }// if

		                    }else{
		                        // genericOperations.calculateBalance();
		                        if (  ( parseFloat( $el.val() ) ) < 0  || isNaN( $el.val()) ) $el.addClass("error_class");


		                    }



		                }else{
		                    // Verifica que el total del wcart_total no este vacio para poner algun valor sobre total a pagar
		                    //if( ( parseFloat($(o.selector_cart_total).val()) || 0.00 ) > 0){
                                if (typeof opts.jq_total_paid.val === 'undefined') {
                                    var total_paid_val = 0.00;
                                }else {
                                    var total_paid_val = (0.00 + opts.jq_total_paid.val()) || 0.00;
                                }
		                        // opts.jq_paymnt_total_pay.val( _round( parseFloat( opts.jq_wcart_total.val() ) || 0.00 ) );
                                opts.jq_paymnt_total_pay.val( _round( parseFloat( 1 * opts.jq_wcart_total.val() -  total_paid_val) || 0.00 ) );

		                    //}

		                }

				});

				opts.jq_paymnt_tdc_pay.bind("blur",{},function(e) {
					var $el = $(e.target);

	                opts.jq_paymnt_div_digits.show();
	                // validando que el pago con TDC tenga valor
	                if( parseFloat($el.val()) > 0 && !(opts.jq_paymnt_digits_tdc_pay.val()).length){
	                    // disparar el dialog
	                    $( opts.msg_confirm_tdc ).dialog({
	            			modal: true,
	            			buttons: {
	                            Aceptar: function() {
	                                $( this ).dialog("close");
	                                opts.jq_paymnt_digits_tdc_pay.focus();
                                    doBalance(opts);
	                            },
	                            Cancelar: function(){
	                                $( this ).dialog("close");
	                                opts.jq_paymnt_div_digits.hide();
	                                opts.jq_paymnt_digits_tdc_pay.val("");
	                                opts.jq_paymnt_tdc_pay.val("");
                                    // Reset a comision si esta habilitado
                                    if(opts.enableCardComission){ opts.jq_comission_pay.val(""); opts.jq_comission_amount_pay.val("");}
	                                doBalance(opts);
	                            }
							}// buttons
	                    });


	                } else if( (opts.jq_paymnt_digits_tdc_pay.val()).length ) {

	                	console.info("ya tiene algo");
	                	console.info(parseFloat($el.val() || 0.00));

	                	if(parseFloat($el.val() || 0.00) == 0){

	                		// Desea borrar la tarjeta
		                	// disparar el dialog
		                    $( "<div>Desea <b>Borrar</b> los ultimos 4 digitos de la tarjeta?. </div>" ).dialog({
		            			modal: true,
		            			buttons: {
		                            Si: function() {
		                                $( this ).dialog("close");
		                                opts.jq_paymnt_div_digits.hide();
		                                opts.jq_paymnt_digits_tdc_pay.val("");
                                        // Reset a comision si esta habilitado
                                        if(opts.enableCardComission){ opts.jq_comission_pay.val(""); opts.jq_comission_amount_pay.val("");}
		                                $el.focus();
                                        doBalance(opts);
		                            },
		                            No: function(){
		                                $( this ).dialog("close");
		                                // opts.jq_paymnt_div_digits.hide();
		                                $el.focus();
		                                // opts.jq_paymnt_tdc_pay.val("");
                                        $el.blur();
		                                doBalance(opts);
		                            }
								}// buttons
		                    });
	                	}else{
                            doBalance(opts);
                        }



	                }else{
	                    // oculta y resetea valor si no tiene valor el campo
	                    opts.jq_paymnt_div_digits.hide();
	                    opts.jq_paymnt_digits_tdc_pay.val("");
	                    opts.jq_paymnt_tdc_pay.val("");
                        // Reset a comision si esta habilitado
                        if(opts.enableCardComission){ opts.jq_comission_pay.val(""); opts.jq_comission_amount_pay.val("");}

	                    doBalance(opts);
	                }

	            });// blur

	            // attach event blur al campo de digitos
	            opts.jq_paymnt_digits_tdc_pay.bind("blur",function(e){

	                var $el = $(e.target);
	                // valida que sea correcto el campo max 4 caracteres
	                if( !/^([0-9]{4})$/.test( $el.val() ) ){

	                    $( opts.msg_alert_tdc ).dialog({
							modal: true,
							buttons: {
	                            Aceptar: function() {
	                                $( this ).dialog("close");
	                                $el.val("").focus();
	                            },
	                            Cancelar: function(){
	                                $( this ).dialog("close");
	                                opts.jq_paymnt_div_digits.hide();
	                                $el.val("");
	                                opts.jq_paymnt_tdc_pay.val("").focus();
	                            }
							}// buttons
	                    });

	                }// if

	                doBalance(opts);

				});


	            if(opts.enableOnChange){

                    opts.jq_change_money_change.addClass("input_readonly").prop("readonly","readonly");

                    opts.jq_change_money_received.bind("blur focus keydown",function(e){

	            		var $el = $(e.target);

	            		if( !(parseFloat(opts.jq_paymnt_money_pay.val()) || 0.00 ) > 0 ){
	            			// false - clone from "total a pagar [jq_paymnt_total_pay]"

	            			// opts.jq_paymnt_money_pay.val( parseFloat(opts.jq_paymnt_total_pay.val() ) || 0.00 );
	            			// console.info("if: %O",( ( parseFloat($el.val()) || 0.00 ) <= ( parseFloat(opts.jq_paymnt_total_pay.val() ) || 0.00 ) ));
	            			// console.info("value: %O", $el.val());
	            			// console.info("event: %O", e.type);
	            			if( ( parseFloat($el.val()) || 0.00 ) <= ( parseFloat(opts.jq_paymnt_total_pay.val() ) || 0.00 ) ){
	            				if( e.type != 'keydown' )opts.jq_paymnt_money_pay.val( _round(parseFloat(opts.jq_change_money_received.val()) || 0.00,2) ).blur();
	            			}else{
	            				opts.jq_paymnt_money_pay.val( _round(parseFloat(opts.jq_paymnt_total_pay.val() ) || 0.00) ).blur();
	            			}

	            		}// if

	            		if( e.type != 'keydown' )doChange();

	            		// var $el = $(e.target),
	            		// 	cash = parseFloat(opts.jq_paymnt_money_pay.val()) || 0.00;

	            		// 	// opts.jq_change_money_change.val( _round( cash - parseFloat( $el.val() || 0.00 ) ) );
	            		// 	opts.jq_change_money_change.val( _round( (cash - parseFloat( $el.val() || 0.00 )) * -1 ) );

	            	});
                    if(!!getOption("enableLoyalty")) {
                        opts.jq_paymnt_point_pay.bind("blur focus keyup",function(e){
                            var $el = $(e.target);
                            doBalance(opts);
                        });
                    }

                }// if


                if( opts.enableCardComission ){

                    opts.jq_comission_amount_pay.bind("blur focus keyup", function(e) {

                        var that = this,
                            $el = $(e.target);

                            if( this.value.length > 0  && parseFloat( this.value || 0.00 ) > 0 ){

                                doComission(e.type);
                                // console.info(e.type);
                            }// if

                    });


                }// if

			self.is_dbug && console.groupEnd();

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

            if(!!getOption("enableLoyalty")) { // double negation to make sure it's boolean. Just to be consistent.
                self.selectors.jq_paymnt_needed_points = "input#needed_points";
                self.selectors.jq_paymnt_point_pay = "input#point_pay";
                self.is_dbug && console.log("Loyalty Points Enabled");
            }

            // Selectores
            _loadInput();

            self.is_dbug = getOption("dbug");

            self.is_dbug && console.group('<'+pluginName+'['+pluginVersion+'] @ create >');

	            self.is_dbug && console.info("%c Options: %o" ,"background: #999; color: #BADA55;", getOptions());


				self.is_dbug && console.info("%c Call Events" ,"background: #999; color: #000000;");

	            if( getOption("enableEvents") ) _events(getOptions());

	            self.is_dbug && console.log("enableOnChange: %O", !!getOption("enableOnChange") );
                if(!!getOption("enableOnChange") == true) getOption("jq_change_div").show();
	            if(!!getOption("enableCardComission") == true) {
                    getOption("jq_comission_div").show();

                    getOption("jq_comission_total").addClass("input_readonly").prop("readonly", "readonly");
                }


            self.is_dbug && console.groupEnd();

            //Maintains chainability
            return this;
        },

        _loadInput = function(callback) {

        	//Provides callback function support
            _callbackSupport(callback);

            for(var i in self.selectors){

            	if(self.selectors.hasOwnProperty(i)){

            		var slc = self.selectors[i]; // [selector]
            		// Carga dinamicamente los selectores
            		setOption(i, $(slc, self.el) || null );

            	}// if


            }// for
            var list = getOption("list_event_inputs"),
            	pushed = [];

            for(var i in list){

				if(list.hasOwnProperty(i)){

					pushed.push(self.selectors[list[i]]);


				}//if

            }// for

            setOption("str_inputs_list", pushed);
            return this;
        },


        doBalance = function(opts,callback) {
        	//Provides callback function support
            _callbackSupport(callback);

            // if(opts.enableCardComission){

                // opts.jq_paymnt_total_pay.val( parseFloat(opts.jq_paymnt_total_pay.val()||0.00) + parseFloat(opts.jq_comission_pay.val()||0.00) );

            // }// if

            // Selectores de todos los campos
            var total_pay = parseFloat( opts.jq_paymnt_total_pay.val() ) || 0.00,
                money_pay = parseFloat( opts.jq_paymnt_money_pay.val() ) || 0.00,
                business_pay = parseFloat( opts.jq_paymnt_business_pay.val() ) || 0.00,
                hospital_pay = parseFloat( opts.jq_paymnt_hospital_pay.val() ) || 0.00,
                check_pay = parseFloat( opts.jq_paymnt_check_pay.val() ) || 0.00,
                tdc_pay = parseFloat( opts.jq_paymnt_tdc_pay.val() ) || 0.00,
                comission_pay = opts.enableCardComission ? parseFloat(opts.jq_comission_pay.val()) || 0.00 : 0.00,
                balance =  0.00,
                point_pay = 0.00;
                if(!!getOption("enableLoyalty")) {
                    point_pay = ((getOption("loyaltyPointValueRate") || 0.00) * (parseFloat(opts.jq_paymnt_point_pay.val()) || 0.00)) || 0.00;
                }
                // asignando el nuevo valor a balance
                balance = _round(
                    (
                        (total_pay + comission_pay) - ( money_pay + business_pay + hospital_pay + check_pay + tdc_pay + point_pay) )
                        || 0.00
                );
                // insertando valor de balance al campo
                opts.jq_paymnt_balance.val( balance );
                // Validacion para disparar error
                if(parseFloat( opts.jq_paymnt_balance.val() ) < 0){
                    opts.jq_paymnt_balance.addClass("error_full_class");
                }else{
                    opts.jq_paymnt_balance.removeClass("error_full_class");
                }
                if(!!getOption("enableLoyalty")) {
                    opts.jq_paymnt_needed_points.val( Math.ceil( (((total_pay + comission_pay) - ( money_pay + business_pay + hospital_pay + check_pay + tdc_pay)) || 0.00) / getOption("loyaltyPointValueRate") ) || 0.00 );
                }
               return this;
        },

        doChange = function(callback) {

        	//Provides callback function support
            _callbackSupport(callback);

            var jq_change_money_received = getOption("jq_change_money_received"),
            	jq_change_money_change = getOption("jq_change_money_change"),
            	cash = parseFloat(getOption("jq_paymnt_money_pay").val()) || 0.00;

            	// opts.jq_change_money_change.val( _round( cash - parseFloat( jq_change_money_received.val() || 0.00 ) ) );
            	jq_change_money_change.val( _round( (cash - parseFloat( jq_change_money_received.val() || 0.00 )) * -1 ,2) );

            return this;

        },

        doComission =  function(type,callback) {

            //Provides callback function support
            _callbackSupport(callback);

            var jq_comission_div = getOption("jq_comission_div"),
                // float_comission = getOption("float_comission"),
                jq_comission_amount_pay = getOption("jq_comission_amount_pay").get(0),
                jq_comission_total = getOption("jq_comission_total").get(0),
                jq_comission_pay = getOption("jq_comission_pay").get(0),
                jq_paymnt_tdc_pay = getOption("jq_paymnt_tdc_pay").get(0);

            // console.info(jq_comission_amount_pay.value);

                jq_paymnt_tdc_pay.value = _round( parseFloat(jq_comission_amount_pay.value || 0.00) + parseFloat( parseFloat(jq_comission_amount_pay.value || 0.00) * ( parseFloat(jq_comission_total.value || 0.00) / 100 ) ) , 2);
                jq_comission_pay.value = _round( parseFloat( parseFloat(jq_comission_amount_pay.value || 0.00) * ( parseFloat(jq_comission_total.value || 0.00) / 100 ) ) , 2);
                if(type == "blur") getOption("jq_paymnt_tdc_pay")[type]();

            return this;
        },

        _round = function(n,dec) {

            n = parseFloat(n);
            if(!isNaN(n)){
                    if(!dec) var dec = 2;
                    var factor= Math.pow(10,dec);
                    return Math.floor(n*factor+((n*factor*10)%10>=5?1:0))/factor;
            }else{
                    return n;
            }// else

            return this;
    	},

        _clearInputs = function(opts) {
            if(!opts) opts = getOptions();
            if(opts.inputsToClear.length > 0){
                // Buscar si esta el string 'all'
                if(opts.inputsToClear[0] == 'all'){
                    self.$el.find("input:text:not(#tdc_comission)").val("");
                }

            }

        };

        //Public API (Add to this if you create custom public methods/properties)
        // -----------------------
        //    All of these methods or properties are public




        return {

            //**version**: The current version of the plugin
            version: pluginVersion,

            //**self**: Object holding all of the plugin instance properties
            self: self,
            clean:_clearInputs,
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
       //   Adds the plugin method to the jQuery prototype object
        $.fn[pluginName] = function (options) {

            //Maintains chainability for all calling elements
            return this.each(function () {

                /*
                Stores the calling element and the data name into local variables,
                instantiates the plugin variable (which will hold the Plugin
                object), and instantiates an empty object literal (which will be
                used to dynamically create a jQuery custom pseudo selector)
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
        inputsToClear: ["all"],
		jq_wcart_total : $("input#wcart_total") || null,
		enableEvents: true,
		enableOnChange: true,
        enableCardComission: false,
		list_event_inputs: ["jq_paymnt_money_pay", "jq_paymnt_business_pay","jq_paymnt_hospital_pay","jq_paymnt_check_pay"],
		list_onchange_enable : ["jq_paymnt_money_pay"], // only cash, NO add other one
        jq_change_div : $("div.div_balance_change") || null,
		jq_change_money_received :  $("input#money_received") || null,
		jq_change_money_change :  $("input#money_change") || null,
        jq_comission_div : $("div.div_tdc_comission") || null,
        jq_comission_amount_pay : $("input#tdc_amount") || null,
        jq_comission_total : $("input#tdc_comission") || null,
        jq_comission_pay : $("input#comission_pay") || null,
        jq_total_paid : $("input#total_paid") || null,
		// selector_payments_div_digits: $("div.div_digits_tdc") || null,
		// selector_payments_total_pay: $("input#total_pay") || null,
		// selector_payments_money_pay: $("input#money_pay") || null,
		// selector_payments_business_pay :$("input#business_pay") || null,
		// selector_payments_hospital_pay: $("input#hospital_pay") || null,
		// selector_payments_tdc_pay: $("input#tdc_pay") || null,
		// selector_payments_balance: $("input#balance") || null,
		// selector_payments_digits_tdc_pay: $("input#digits_tdc_pay") || null,
        msg_confirm_tdc: "<div>Desea escribir los 4 ultimos digitos de su Numero de Tarjeta?: </div>",
        msg_alert_tdc: "<div>Favor de ingresar los ultimos 4 digitos del Numero de su Tarjeta: </div>",
        msg_erase_tdc: "<div>Desea <b>cambiar</b> los 4 ultimos digitos de su Numero de Tarjeta?: </div>"

    };

//      End of Plugin
}(jQuery, window, document));
//passes in the `jQuery`, `window`, and `document` global objects locally





// /**
//  * @author Michel Cervantes <ing.michel.cervantes at gmail dot com> <at myxhel> </Myxhel>
//  * @version 1.2
//  * Copyright:
//  * jQuery Plugin modPayments
//  * modPayments 1.2
//  * Jan 2013
//  *
// */
// (function($){
//     //#productsCart
//     jQuery.fn.modPayments = function(options){

//         //Setting defaults
//         var defaults = {

//             selector_cart_total : "#wcart_total",
//             selector_payments_div_digits: ".div_digits_tdc",
//             selector_payments_total_pay: "#total_pay",
//             selector_payments_money_pay: "#money_pay",
//             selector_payments_business_pay :"#business_pay",
//             selector_payments_hospital_pay: "#hospital_pay",
//             selector_payments_tdc_pay: "#tdc_pay",
//             selector_payments_balance: "#balance",
//             selector_payments_digits_tdc_pay: "#digits_tdc_pay",
//             msg_confirm_tdc: "<div>Desea escribir los 4 ultimos digitos de su Numero de Tarjeta?: </div>",
//             msg_alert_tdc: "<div>Favor de ingresar los ultimos 4 digitos del Numero de su Tarjeta: </div>"


//         };// defaults

//         var privateVars = {
//             // patrones de validacion
//             patterns:  $.validity.patterns || null,

//             DBUG: false

//         };// privateVars

//         //extend defaults y options
//         var o = $.extend({},privateVars,defaults, options);

//         var obj = this;

//         var varControl = 0;

//         var genericOperations = {

//             calculateBalance: function(){

//                 // Selectores de todos los campos
//                 var total_pay = parseFloat( $(o.selector_payments_total_pay).val() ) || 0.00,
//                     money_pay = parseFloat( $(o.selector_payments_money_pay).val() ) || 0.00,
//                     business_pay = parseFloat( $(o.selector_payments_business_pay).val() ) || 0.00,
//                     hospital_pay = parseFloat( $(o.selector_payments_hospital_pay).val() ) || 0.00,
//                     tdc_pay = parseFloat( $(o.selector_payments_tdc_pay).val() ) || 0.00,

//                     balance =  0.00;


//                     // asignando el nuevo valor a balance
//                     balance = round( ( total_pay - ( money_pay + business_pay + hospital_pay + tdc_pay ) ) || 0.00 );
//                     // insertando valor de balance al campo
//                     $(o.selector_payments_balance).val( balance );
//                     // Validacion para disparar error
//                     if(parseFloat( $(o.selector_payments_balance).val() ) < 0){
//                         $(o.selector_payments_balance).addClass("error_full_class");
//                     }else{
//                         $(o.selector_payments_balance).removeClass("error_full_class");
//                     }

//             }

//         };

//         return this.each(function(){

//             // dispara el calculo del balance si se esta en el UPDATE
//             genericOperations.calculateBalance();



//             // selector para los campos
//             $(o.selector_payments_money_pay +","+ o.selector_payments_business_pay +","+ o.selector_payments_hospital_pay).bind("keyup focus blur",function(e){
//                 //console.info("%o",e.type);
//                 var o_input  = $( e.target );
//                 //console.info("%o",o_input.val());
//                 // Esta lleno con numero el campo de total a pagar
//                 if ( ( parseFloat($(o.selector_payments_total_pay).val()) || 0.00 ) > 0){

//                     //Verifica que el numero sea mayor a cero
//                     if (  ( parseFloat( o_input.val() ) || 0.00 ) > 0 ){
//                         o_input.removeClass("error_class");
//                         genericOperations.calculateBalance();


//                     }else{
//                         genericOperations.calculateBalance();
//                         if (  ( parseFloat( o_input.val() ) ) < 0  || isNaN( o_input.val()) ) o_input.addClass("error_class");


//                     }

//                 }else{
//                     // Verifica que el total del wcart_total no este vacio para poner algun valor sobre total a pagar
//                     //if( ( parseFloat($(o.selector_cart_total).val()) || 0.00 ) > 0){

//                         $(o.selector_payments_total_pay).val( round( parseFloat( $(o.selector_cart_total) ) || 0.00 ) );

//                     //}

//                 }





//             });



//             // attach de un event blur
//             $(o.selector_payments_tdc_pay).bind("blur",function(e){
//                 // mostrar los digitos
//                 $(o.selector_payments_div_digits).show()
//                 // validando que el pago con TDC tenga valor
//                 if( parseFloat($(e.target).val()) > 0 && !($(o.selector_payments_digits_tdc_pay).val()).length){
//                     // disparar el dialog
//                     $( opts.msg_confirm_tdc ).dialog({
//             			modal: true,
//             			buttons: {
//                             Aceptar: function() {
//                                 $( this ).dialog("close");
//                                 $(o.selector_payments_digits_tdc_pay).focus();

//                             },
//                             Cancelar: function(){
//                                 $( this ).dialog("close");
//                                 $(o.selector_payments_div_digits).hide();
//                                 $(o.selector_payments_digits_tdc_pay).val("");
//                                 $(o.selector_payments_tdc_pay).val("");

//                                 genericOperations.calculateBalance();
//                             }
// 			}
//                     });

//                     //var answer = confirm("Desea escribir los 4 ultimos digitos de su Numero de Tarjeta?: ");
//                     //
//                     //if(answer){
//                     //
//                     //
//                     //
//                     //}else{
//                     //
//                     //    $(o.selector_payments_div_digits).hide();
//                     //    $(o.selector_payments_digits_tdc_pay).val("");
//                     //    $(o.selector_payments_tdc_pay).val("");
//                     //
//                     //    genericOperations.calculateBalance();
//                     //}
//                 } else if( ($(o.selector_payments_digits_tdc_pay).val()).length ) {



//                 }else{
//                     // oculta y resetea valor si no tiene valor el campo
//                     $(o.selector_payments_div_digits).hide();
//                     $(o.selector_payments_digits_tdc_pay).val("");
//                     $(o.selector_payments_tdc_pay).val("");

//                     genericOperations.calculateBalance();
//                 }

//             });

//             // attach event blur al campo de digitos
//             $(o.selector_payments_digits_tdc_pay).bind("blur",function(e){
//                 //dbug("YA!",'warn');

//                 //dbug(( !/^([0-9]{4})$/.test( $(e.target).val() ) ));

//                 // valida que sea correcto el campo max 4 caracteres
//                 if( !/^([0-9]{4})$/.test( $(e.target).val() ) ){

//                     $( o.msg_alert_tdc ).dialog({
// 			modal: true,
// 			buttons: {
//                             Aceptar: function() {
//                                 $( this ).dialog("close");
//                                 $(e.target).val("").focus();

//                             },
//                             Cancelar: function(){
//                                 $( this ).dialog("close");
//                                 $(e.target).val("");
//                                  $(o.selector_payments_tdc_pay).val("").focus();
//                             }
// 			}
//                     });

//                 }
//                 //dbug("Llego hasta aca!",'warn');
//                 genericOperations.calculateBalance();
//             });




//             // attach evento blur al campo de pago con TDC
//             if ( parseFloat($(o.selector_payments_tdc_pay).val()) > 0 ){
//                 $(o.selector_payments_div_digits).show();
//                 $(o.selector_payments_digits_tdc_pay).trigger("blur");


//             }

//         });

//         // function general para debuggeo
//         function dbug($obj,fnc){
//             if(!fnc) fnc = 'log';
//             if (window.console)
//                 window.console[fnc]($obj);


//         }
//         // Function general para sustituir el uso del toFixed
//         function round(n,dec) {
//                     n = parseFloat(n);
//                     if(!isNaN(n)){
//                             if(!dec) var dec = 2;
//                             var factor= Math.pow(10,dec);
//                             return Math.floor(n*factor+((n*factor*10)%10>=5?1:0))/factor;
//                     }else{
//                             return n;
//                     }
//             }

//     };

// })(jQuery)
