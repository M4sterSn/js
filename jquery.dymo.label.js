/*
 * "Highly configurable" mutable plugin boilerplate
 * Author: @markdalgleish
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */


;(function($, window, document, undefined) {

	//constructor
	var dymoLabel = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;

		this.metadata = this.$elem.data("dymoLabel-options");
	};


	// the dymoLabel prototype
	dymoLabel.prototype = {
		// Defaults
		defaults: {
			xml_label_name: "./account_data/lab/mdti_lab_sample.label",
			printer: "DYMO LabelWriter 450 Twin Turbo",
			onInit: false,
			printTimes: 1,
			dbug: false,
			isMultiLabel: false
		},

		init: function() {

			// Overwrite de metadata, options & defaults
			this.config = $.extend({}, this.defaults, this.options, this.metadata);

			// Iniciando variables
			var self = this,
			environment = dymo.label.framework.checkEnvironment()

			// Validar si el BROWSER es soportado & DYMO SW esta instalado
			if((environment.isBrowserSupported == true) && (environment.isFrameworkInstalled == true)) {
				$.get(this.config.xml_label_name, function(data) {

					self.xmlLabel = dymo.label.framework.openLabelXml(data);

				}, "text");

				// Control para impresion cuando es Iniciado el Widget
				if(this.config.onInit) {
					// Ejecuta la impresion
					self.doPrint();
				}
				if (!this.config.isMultiLabel) {
					// Ejecuta Function que hace "attach" del evento Click
					this.events();
				} else {
					self.elem.multiPrint = function(ini, fin) {
						self.multiPrint(ini,fin);
					}
				}
			} else {
				// Si no es valido BROWSER & DYMO SW, despliega Error
				self.$elem.click(function(e) {
					// Despliega error
					e.preventDefault();
					// alert(environment.errorDetails);
					alert(
						"Es posible que su Navegador no soporte impresoras DYMO,"+
						" o no tiene instalado el software necesario para su funncionamiento." +
						" Favor de instalar la última versión, que puede descargar en: http://www.dymo.com"
					);
					return false;
				});
			}
			return this;
		},

		multiPrint: function(ini, fin) {
			var self = this;
			for (ini;ini <= fin ; ini++) {
				this.options.data[0].counter = "" + ini;
				// Ejecuta function de Impresion
				self.doPrint();
			}

			return false;
		},

		events: function() {
			var self = this;

			this.$elem.click(function(e) {
				e.preventDefault();

				// Ejecuta function de Impresion
				self.doPrint();
				
				return false;
			});
		},

		doPrint: function() {
			// Arreglo de impresoras activas
			var printers = [];
			printers = dymo.label.framework.getPrinters();
			console.log(printers);
					// Valida que haya impresoras
			if(printers.length == 0) {

				alert("No existen Impresoras Activas");

			} else {
				// Cargar el .label
				// return false;
				var self = this;
				// Valida que la impresora seleccionada este activa
				// if ( printers[self.config.printer] ){
					// Valida que este cargado el .label
					if( self.xmlLabel ){
						// Valida que haya los datos para imprimir
						if(self.config.data){

								for (var i in self.config.data) {
									console.log(self.config.data[i]);

									for (var field in self.config.data[i]) {
										// Asigna Valores a variables
										self.xmlLabel.setObjectText(field, self.config.data[i][field]);
									}// for

									// Impresion del .label
									self.xmlLabel.print(printers[0].name);

								}// for

						}// if

					}// if

				// }else{

				// 	alert("Impresora DYMO no existe");

				// }// else
			}
		}

	}// prototype

	dymoLabel.defaults = dymoLabel.prototype.defaults;

	$.fn.dymoLabel = function( options ) {
		return this.each(function() {
			(new dymoLabel(this, options)).init();
		});
	};

// optional: window.dymoLabel = dymoLabel;

})(jQuery, window, document);