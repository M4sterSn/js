var triggerPatientValid = (function($, _, doc, win, undefined){

	var defaults = {
	    modalDivGeneric: $("div#dialog_emr"),
	    modalMsgTemplate: "<p>El paciente que seleciono, se duplicara con un nuevo registro. Favor de hacer clic en \'Aceptar\' para la edicion del Expediente Clinico del paciente, y \'Cancelar\' para cerrar la ventana y reiniciar.<p>",
	    sPatientName : "input#patient_name",
	    sPatientLastname : "input#patient_lastname",
	    sIdPacMedrec: "input#id_pac_medrec",
	    strUrlBase: "emr",
	    //dayBirthSelector: $("input:text#date_of_birth"),
	    callbackDialogAgreed : 1, // 1: win.location | 2: load JSON
	    fieldsToFillJSON : [],
        updEmr: function(newOptions) {

            var dfd = $.Deferred(),
                opts = $.extend({},
                        {
                            type: "POST",
                            dataType: "JSON",
                        },
                        newOptions || {}
                    );


                $.ajax(opts).done(dfd.resolve).error(dfd.reject);

            return dfd.promise();
        },
	    callbackFieldsToFill: function(field, fieldsJSON){
		    console.info("%o || %o",field,fieldsJSON);
            var dfd = $.Deferred();

            try{

                _(field).each(function(id){

        			$("#"+id).val(fieldsJSON[id]);

        		});

        		_.each($("input[name*=gender]"),function(v){ if(parseInt(fieldsJSON['gender']) == parseInt( $(v).val() ) ){ $(v).attr("checked","checked"); }  });

        		( parseInt( fieldsJSON['email_send_messages']) == 1 ) ?  $("#email_send_messages").attr("checked",true): $("#email_send_messages").attr("checked",false);
        		( parseInt( fieldsJSON['email_send_report']) == 1 ) ?  $("#email_send_report").attr("checked",true): $("#email_send_report").attr("checked",false);
        		( parseInt( fieldsJSON['cell_phone_send_messages']) == 1 ) ?  $("#cell_phone_send_messages").attr("checked",true): $("#cell_phone_send_messages").attr("checked",false);
        		( parseInt( fieldsJSON['cell_phone_send_report']) == 1 ) ?  $("#cell_phone_send_report").attr("checked",true): $("#cell_phone_send_report").attr("checked",false);

                dfd.resolve();

            }catch( exc ){

                dfd.reject();

            }// try

            return dfd.promise();

        }//

	};

	var option = {};

	function init(options){

	    option = $.extend({},defaults, options);
	    //console.info("%o",option);
	}

	function run( oAutocomplete ){

	    //alert("El nombre del paciente, previamente guardado");

	    defaults.modalDivGeneric.dialog({

    		title: "Mensaje",
    		modal: true,
    		buttons: {
    		    Cancelar : function(){
    			defaults.modalDivGeneric.dialog("close");
    		    },

    		    Aceptar: function(){

    			defaults.modalDivGeneric.dialog("close");

    			win.location = option.strUrlBase +"/update/"+ oAutocomplete[0];//"emr/update/" + oAutocomplete[0];


    		    }
    		},
    		open: function(event, iu){

    		    defaults.modalDivGeneric.empty().append( _.template(defaults.modalMsgTemplate, {data: oAutocomplete}) );

    		}// open

	    });


	}


	function fullname ( date_selected ){

	    var patient_name = $(option.sPatientName).get(0),
		patient_lastname = $(option.sPatientLastname).get(0),
		id_pac_medrec = $(option.sIdPacMedrec).get(0);
        console.warn(patient_name);
                console.warn(patient_lastname);
                console.warn(id_pac_medrec);

	    //console.info(" %o || %o",id_pac_medrec[0].value, parseInt(id_pac_medrec[0].value || 0));

	    if ( patient_name && patient_lastname && date_selected && parseInt(id_pac_medrec.value || 0) == 0 ){

		//console.info(" GOT IT");


    		$.ajax({

    		    url: option.strUrlBase + "/ajax_search_patient",
    		    type: "POST",
    		    dataType: "JSON",
    		    data: {name: patient_name.value , lastname : patient_lastname.value, birth: date_selected},


    		}).error(function(){

    		    //console.error("ITS an error Dog");

    		}).done(function(data){

    		    //console.info("%o",data);


    		    if( data.length ){

    			// Ejecutar el dialog

    			defaults.modalDivGeneric.dialog({

    			    title: "Mensaje",
    			    modal: true,
    			    buttons: {

    				Cancelar : function(){
    				    defaults.modalDivGeneric.dialog("close");

    				    // $(patient_name).closest("form")[0].reset();
                        patient_name.value = "";
                        patient_lastname.value = "";
                        id_pac_medrec.value = "";

                        $(patient_name).focus();

    				},

    				Aceptar: function(){

    				    defaults.modalDivGeneric.dialog("close");
    				    if( option.callbackDialogAgreed == 1 ){

    					   win.location = option.strUrlBase+ "/update/" + data[0]['id_pac_medrec'];

    				    }else if( option.callbackDialogAgreed == 2 ){


    					    if( _(option.callbackFieldsToFill).isFunction() ){


                                $.when(
                                    option.callbackFieldsToFill.call(this, option.fieldsToFillJSON, data[0]),
                                    option.updEmr({
                                                    url: option.strUrlBase + '/enable_emr/'+data[0]['id_pac_medrec'] ,
                                                    data: {}
                                                })
                                ).then(
                                    //DONE
                                    function(){

                                    },
                                    // FAIL
                                    function() {
                                        // MOSTRAR MENSAJE
                                        alert("Favor de \'Refrescar\' la pagina, error al cargar los datos correspondiente a un paciente");

                                        patient_name.value = "";
                                        patient_lastname.value = "";
                                        id_pac_medrec.value = "";

                                        $(patient_name).focus();
                                    }
                                );

    					    }// if

    				    }// else if

    				}// aceptar

    			    },
    			    open: function(event, iu){

    				defaults.modalDivGeneric.empty().append( _.template(defaults.modalMsgTemplate, {data: data}) );

    			    }// open

    			});

    		    }// if

    		});


	    }


	}


	return {
	    init: init,
	    run: run,
	    runFullName: fullname,
	}

    })(jQuery, _, document, window);
