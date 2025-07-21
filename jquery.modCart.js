/**
 * @author Plexonet
 * @version 1.4.1
 * @changelog:
 *  * v1.2.2
 *  - Added: checking were items preloaded in HTML
 *  * v1.3
 *  - Fixed: iva included issue on calculating subtotals
 *  * v1.3.1
 *  - Fixed/Reviewed: iva included issue on calculating subtotals <Better usage of round function in operations>
 *  * v1.3.2
 *  - Fixed/Reviewed: Rounding numbers issue in "Total a Pagar"
 *  * V1.4
 *  - Better Handling of NaN in "Adder" and Errors validation upgraded
 *  * v1.4.1
 *  - Added support for adding products without catalog "allow_no_id_products"
 *  * v1.4.2
 *  - Added Feature of default behavior of IVA in adder section
 * Copyright:
 * jQuery Plugin modCart
 * modCart 1.4.1
 * May 2013
 *
*/
;(function( $ ){
    //#productsCart
    jQuery.fn.modCart = function( options ){

        //Setting defaults
        var defaults = {

            anchor_selector_head : ".anchor_add",
            anchor_selector_cleaner: ".anchor_clear",
            anchor_remove_selector: "anchor_del",
            anchor_remove_text: '<img src="./img/icons/misc/remove-icon.png" width=18 heigth=18 >',

            iva_rate: 16,
            iva_readonly: false, // default: true
            iva_included: false, // true for activate the option of iva already included!

            selector_descount_money: "#wcart_descount_money",
            selector_tipo_cambio: "#tipo_de_cambio",
            selector_descount_percent: "#wcart_descount_percent",

            selector_great_total: "#wcart_great_total",
            selector_great_total_wiva: "#wcart_great_total_wiva",
            selector_great_total_niva: "#wcart_great_total_niva",

            selector_total: "#wcart_total",
            selector_subtotal: "#wcart_subtotal",
            selector_iva: "#wcart_iva",

            selector_charge_emergency: "#wcart_charge_emergency",

            selector_wraper_ajx_cart: "#ajx_wraper_cart",
            selector_detail_img_path: "./img/icons/packs/fugue/16x16/",

            selector_subtotal_wiva: "#wcart_subtotal_wiva",
            selector_subtotal_niva: "#wcart_subtotal_niva",
            selector_subtotal_desc: "#wcart_subtotal_desc",

            selector_desc_wiva: "#wcart_subtotal_desc_wiva",
            selector_desc_niva: "#wcart_subtotal_desc_niva",

            html_wrapper_emptyRows: "<div style='display: none; width: 100%; height: 20px; margin: 0 auto; text-align: center;' ></div>",
            html_wrapper_ajxButtons: '<span style=" text-align: center !important; display: block;"><input type="button" id="btn_ajx_save" class="css3button" value="Aplicar"><input type="button" id="btn_ajx_cancel" class="css3button" value="Cancelar"></span>',

            enableTotalPayments: true,
            selector_payments_total: "#total_pay",
            selector_transactions_total: "#total_paid",
            selector_trigger_payments: "input#tdc_pay",

            emptySignHtml: "<h5>No hay productos para mostrar.</h5>",

            allow_no_id_product: true, // true means that you can add products as you wish, within autocomplete or not
            msg_no_id_product: "<div>Favor de seleccionar un concepto del catalogo de productos.</div>",

            showError: function( msg ){
                    alert( msg );
            },

            ajx_cart_url: "./reception/invoice/ajx_extrainfo_cart",
            ajx_cart_success: function( data ){

                    fncAjx.fncSuccess( data );

                },
            ajx_cart_data: {},

            enableShowItemExtended : 1, // utilizar enteros no booleans!
            arrItemExtendedAllowed: [6],

            enableAlertError: false,

            descount_type: 1, // 1: Monto 2: Porcentaje
            descount_title_sign: ["#desc_sign_above","#desc_sign_bottom"],

            enable_readonly_footer_inputs: true,

            // ------ IVA BEHAVOIR DEFAULT -------//
            iva_adder_config: 1, //[0: "sin comportamiento" ,1: "IVA siempre seleccionado con todos los productos, del catalogo o no"]

            iva_adder_default : function(instance, opt) {
                switch( parseInt( this.iva_adder_config || 0) ) {
                    default:
                    case 1:

                        var input_iva = $('input:checkbox[name="apply_iva[]"]',opt.div_selector_head );
                        // Toggle iva
                        if ( input_iva.is(":checked") == false){input_iva.prop("checked",true);}

                    break;

                    case 0:
                        input_iva.prop("checked",false);
                    break;
                }
            }

        };// defaults

        var fncAjx = {

            fncError: function(data){

                //console.error(data);

            },

            fncSuccess: function( data ){

                //$(data).append('<div style="width: 30%;"><input type="button" id="btn_ajx_save" value="Aplicar"><input type="button" id="btn_ajx_cancel" value="Cancelar"></div>');
                $( o.selector_wraper_ajx_cart ).html( data ).append( o.html_wrapper_ajxButtons );//.show("slow").delay(4000).hide("slow");

            },

            validateAjxReturned: function(elems){

                $.validity.start();

                for(var field in elems){
                    $.call(this,field.fnc,field.msg);
                }

                var result = $.validity.end();

                return result.valid;
            }


        };// fncAjx

        var privateVars = {

            div_selector_head : ".wcart_head",
            div_selector_body : ".wcart_body",
            div_selector_foot : ".wcart_footer",

            patterns:  $.validity.patterns,

            DBUG: false,

        };// privateVars

        //extend defaults y options
        var o = $.extend({},privateVars,defaults, options);
        o.DBUG && console.info("modCart[1.4]: %o",o);
        o.iva_included_rate = parseFloat( ( o.iva_rate / 100 ) + 1 );

        var obj = this;

        // Attachin' validation for each productCart_body field
        var fnsModCart = {

            control_errors : 0,

            checkItemsPreloaded: function(a){

                var rows = $("div[class*=row]",o.div_selector_body);
                var rows_ext = $("div[class*=detail]",o.div_selector_body);
                //Verifica que haya rows
                if(rows.length > 0){

                    rows.each(function(key, item){
                        //console.info("DESCOUNT: %o",$("input:text[name*=descount]",$(item).children()));
                        fnsModCart.bindEditRow($("input:text[name*=qty]",$(item).children()), $("input:text[name*=unit_price]",$(item).children()), $("input:text[name*=sub_total]",$(item).children()), $("input:checkbox[name*=iva]",$(item).children()), $("input:text[name*=descount]",$(item).children()), $(item) )


                        //$("input:text[name*=qty]",$(item).children()), $("input:text[name*=unit_price]",$(item).children()), $("input:text[name*=sub_total]",$(item).children()), $("input:checkbox[name*=iva]",$(item).children()), $("input:text[name*=descount]",$(item).children())


                        //$("input:text[name*=sub_total]",$(item).children()).val(  $("input:text[name*=qty]",$(item).children()).val() * $("input:text[name*=unit_price]",$(item).children()).val()  );

                        //** Temporal

                        //console.warn($(item).children().find("."+o.anchor_remove_selector || "#"+o.anchor_remove_selector || "a" ));
                        fnsModCart.removeRow($(item).children().find("."+o.anchor_remove_selector || "#"+o.anchor_remove_selector || "a" ));

                    });

                }// if

                if( rows_ext.length > 0 ){

                    $(rows_ext).children("div").hide();
                    $(rows_ext).delegate(".anchor_detail","click",function(e){

                        $(e.target).closest("div").children(":last").toggle();

                        return false;
                    });

                    $(rows_ext).delegate("[validate]","keyup",function(e){

                        fnsModCart.validateErrors( $( rows_ext ) );

                    });

                }// if

                fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                return true;
            },

            prepareCart: function( a ){

                fnsModCart.control_errors = 0;

                if( !$(a).find(o.div_selector_head).length ){ fnsModCart.control_errors = fnsModCart.control_errors + 1; defaults.showError("No se encuentra el div" + o.div_selector_head);}

                if( !$(a).find(o.div_selector_body).length ){ fnsModCart.control_errors = fnsModCart.control_errors + 1; defaults.showError("No se encuentra el div" + o.div_selector_body);}

                if( !$(a).find(o.div_selector_foot).length ){ fnsModCart.control_errors = fnsModCart.control_errors + 1; defaults.showError("No se encuentra el div" + o.div_selector_foot);}

                if( $(o.descount_title_sign).length ){ switch( o.descount_type ){ case 1: $(o.descount_title_sign.join(",")).text("$");  break; case 2: $(o.descount_title_sign.join(",")).text("%"); break;  }  }// if

                //Prepara los eventos atachados a los campos de descuento monto & porcentaje junto con Gran total

                if( $( o.selector_descount_money ).length && $( o.selector_descount_percent ).length && $( o.selector_great_total ).length ){

                    $( o.selector_descount_money ).keyup( function( e ){

                        if( parseFloat($(e.target).val()) > 0 || $(e.target).val() != "" && isNaN( parseFloat($(e.target).val()) ) == false ){

                            $(o.selector_descount_percent).attr("readonly","readonly").val("");
                            $(o.selector_descount_percent).focus(function(f){
                                f.preventDefault;
                                $(f.target).removeAttr("readonly");
                            });

                            fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );
                        }else{

                            $(o.selector_desc_wiva).val( parseFloat(0).toFixed(2) );
                            $(o.selector_desc_niva).val( parseFloat(0).toFixed(2) );

                            fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                        }// else

                    });

                $( o.selector_tipo_cambio ).keyup( function( e ){

                        if( parseFloat($(e.target).val()) > 0 || $(e.target).val() != "" && isNaN( parseFloat($(e.target).val()) ) == false ){

                            $(o.selector_descount_percent).attr("readonly","readonly").val("");
                            $(o.selector_descount_percent).focus(function(f){
                                f.preventDefault;
                                $(f.target).removeAttr("readonly");
                            });

                            fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );
                        }else{

                            $(o.selector_desc_wiva).val( parseFloat(0).toFixed(2) );
                            $(o.selector_desc_niva).val( parseFloat(0).toFixed(2) );

                            fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                        }// else

                    });

                    $(o.selector_descount_percent).keyup(function(e){

                        if( parseFloat($(e.target).val()) > 0 || $(e.target).val() != "" && isNaN( parseFloat($(e.target).val()) ) == false ){

                            $(o.selector_descount_money).attr("readonly","readonly").val("");

                            $(o.selector_descount_money).focus(function(f){
                                f.preventDefault;
                                $(f.target).removeAttr("readonly");
                            });

                            fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                        }else{

                            $(o.selector_desc_wiva).val( parseFloat(0).toFixed(2) );
                            $(o.selector_desc_niva).val( parseFloat(0).toFixed(2) );

                            fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                        }// esle

                    });

                }// if

                // Prepara cargo por emergencia
                if( $(o.selector_charge_emergency).length ){

                    $(o.selector_charge_emergency).keyup(function(e){
                        //console.info(( parseFloat($(e.target).val()) > 0 || $(e.target).val() != "" && isNaN( parseFloat($(e.target).val()) ) == false ));
                        // if( parseFloat($(e.target).val()) > 0 || $(e.target).val() != "" && isNaN( parseFloat($(e.target).val()) ) == false ){
                            fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );
                        // }else{
                        //     fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );
                        // }// else

                    });

                }// if


                // IVA en el agregador
                if( $.isFunction( o.iva_adder_default ) ){
                    // Comportamiento 1
                    o.iva_adder_default(a, o);
                }

                // temporal
                if ( $("input:text",o.div_selector_foot).not("[id*=descount],[id*=charge_emergency]") .length && o.enable_readonly_footer_inputs){

                    $("input:text",o.div_selector_foot).not("[id*=descount],[id*=charge_emergency]").map(function(i,elem){

                        $(elem).addClass("input_readonly").attr("readonly","readonly");
                    });

                }// if


            },//prepareCart

            attach_head_action: function(){

                //Buscar boton del agregar y attach el clic
                if( $( o.div_selector_head ).find(o.anchor_selector_head ).length ){

                    $( o.div_selector_head).find(o.anchor_selector_head ).click(function(e){

                        e.preventDefault();

                        fnsModCart.validateErrors($(o.div_selector_head).children(), true);

                        //console.info("Log 1: %o", !( $("input[class*=error]",$(o.div_selector_head).children()) ).length );

                        if( !( $("input[class*=error]",$(o.div_selector_head).children()) ).length ){

                            fnsModCart.addItems();
                        }else{
                            $("input[class*=error]:first",$(o.div_selector_head).children()).focus();
                        }// else

                        return false;
                    });

                    $( o.div_selector_head ).find( o.anchor_selector_cleaner ).click(function(e){

                        fnsModCart.cleanAdderCart(true);

                        return false;
                    });

                    $("input:text",o.div_selector_head).keyup(function(e){
                        console.info(this.id);
                        fnsModCart.validateErrors($(o.div_selector_head).children());
                    });

                    fnsModCart.qtyPriceCalc( $( "[name*=qty]", o.div_selector_head),$("[name*=price]", o.div_selector_head), $("[name*=descount]", o.div_selector_head) ,$("[name*=sub]", o.div_selector_head) );

                    fnsModCart.validateEmptyRows($(o.div_selector_body).children());

                }// if

            },//attach_head_action

            qtyPriceCalc: function(q,p,d,s){

                $(q).keyup(function(e){

                    var s_total = ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) - ( o.descount_type == 1 ? parseFloat( $(d).val() || 0.00 ) : ( o.descount_type == 2 ? ( ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) ) * ( head_discount / 100 )  ) : 0.00 ) ) ).toFixed(2);

                        if( s_total < 0 ){

                            s_total = ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) ).toFixed(2);
                            // $(d).val( parseFloat(0).toFixed(2) );

                        }// if

                    //$(s).val( ( !isNaN( ( parseFloat( $(q).val() ) * parseFloat( $(p).val() ) ).toFixed(2) ) ) ? ( parseFloat( $(q).val() ) * parseFloat( $(p).val() ) ).toFixed(2) : 0.00);
                    $(s).val( ( !isNaN( ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) ).toFixed(2) ) ) ? s_total: 0.00);

                });

                $(p).keyup(function(e){

                    var s_total = ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) - ( o.descount_type == 1 ? parseFloat( $(d).val() || 0.00 ) : ( o.descount_type == 2 ? parseFloat( ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) ) * ( head_discount / 100 )  ) : 0.00 ) ) ).toFixed(2);

                        if( s_total < 0 ){

                            s_total = ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) ).toFixed(2);
                            // $(d).val( parseFloat(0).toFixed(2) );

                        }// if

                    //$(s).val( ( !isNaN( ( parseFloat( $(q).val() ) * parseFloat( $(p).val() ) ).toFixed(2) ) ) ? ( parseFloat( $(q).val() ) * parseFloat( $(p).val() ) ).toFixed(2) : 0.00);
                    $(s).val( ( !isNaN( ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) ).toFixed(2) ) ) ? s_total: 0.00);

                });

                $(d).keyup(function(e){

                    var s_total = ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) - ( o.descount_type == 1 ? parseFloat( $(d).val() || 0.00 ) : ( o.descount_type == 2 ? ( ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) ) * ( head_discount / 100 )  ) : 0.00 ) ) ).toFixed(2);

                    if( s_total < 0 ){

                        s_total = ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) ).toFixed(2);
                        // $(d).val( parseFloat(0).toFixed(2) );

                    }// if

                    $(s).val( ( !isNaN( ( parseFloat( $(q).val() || 0.00 ) * parseFloat( $(p).val() || 0.00 ) ).toFixed(2) ) ) ? s_total: 0.00);

                });

            },// qtyPriceCalc


            addItems: function(){

                var html_row = $("<div></div>").addClass("wcart_row"), head_qty, head_desc, head_iva, head_price;

                $(o.div_selector_head).children().clone().appendTo( html_row );

                if( $("select",$(html_row).children()).length ) {
                    $( "select", $(o.div_selector_head).children()).each(function(i, val){
                        $($("select",$(html_row).children())[i]).children().map(function(i,elem){
                            if( $(elem).val() == $(val).val()){
                                $(elem).attr("selected","selected");
                            }
                        });
                    });
                }

                if( $("input:hidden[name*=hd_id_product]",$(html_row).children()).length ){

                    //(o.DBUG) ? ( console.info("LINE: 274 <> hidden_input: val(%o)", $("input:hidden[name*=hd_id_product]",$(html_row).children()).val() || 0.00 != "" ? $("input:hidden[name*=hd_id_product]",$(html_row).children()): $( o.div_selector_body ).children().map(function(i,elem){return elem;}) ) ):false;
                    var hidden_input = $("input:hidden[name*=hd_id_product]",$(html_row).children()),
                        obj_hiddens, obj_descriptions ;

                    // Retrieve de todos los id_product del body
                    obj_hiddens = $( o.div_selector_body ).children().map(function(i,elem){

                        if ( parseInt( $("input:hidden[name*=hd_id_product]",elem).val() ) ) {  return parseInt( $("input:hidden[name*=hd_id_product]",elem).val() ) } else{ return $("input:hidden[name*=hd_id_product]",elem).val() !=undefined ? $("input:hidden[name*=hd_id_product]",elem).val(): false } ;

                    });

                    obj_descriptions = $( o.div_selector_body ).children().map(function(i,elem){

                        if( $("input[name*=description]",elem).val() != undefined ) return ( $("input[name*=description]",elem).val() ).toLowerCase();

                    });

                    //agregar prefijo al id_product si viene vacio o es NaN
                    if( isNaN( parseInt( hidden_input.val() ) )  && o.allow_no_id_product == true){

                        // Agregado
                        if( $.inArray( $("input[name*=description]",$(html_row).children()).val() ,obj_descriptions) === -1 ){

                            var sized =  $( o.div_selector_body ).children().map(function(i,elem){ if(  $("input[name*=hd_id_product]",elem).val() != undefined && $("input[name*=hd_id_product][value*=a]",elem).val() ) return $("input[name*=hd_id_product]",elem).val() }).size();
                            hidden_input.val("a"+ (sized + 1) );

                            fnsModCart.fncAddItemGeneric(html_row);

                        }else{// Actualizado

                            fnsModCart.fncUpdateItemGeneric(html_row,$("input[name*=description]",$(html_row).children()),obj_descriptions);

                        }// else

                    }else if ( isNaN( parseInt( hidden_input.val() ) )  && o.allow_no_id_product == false ){

                        $(o.msg_no_id_product).dialog({
                            title:"Mensaje",
                            modal: true,
                            buttons: {
                                "Aceptar": function() {
                                    $(this).dialog("close");
                                    fnsModCart.cleanAdderCart(true);
                                }
                            }
                        });

                    } else{ // id_product es entero!

                       if( $.inArray( parseInt( hidden_input.val() ) ,obj_hiddens ) === -1 ){

                            //Valida que el campo exista
                            if( $("input:hidden[name*=hd_id_type]",$(html_row).children()).length ){
                                // console.info("Line 426: %o",parseInt( $("input:hidden[name*=hd_id_type]",$(html_row).children()).val() ));

                                //console.info("Types: %o", $.inArray(parseInt( $("input:hidden[name*=hd_id_type]",$(html_row).children()).val() ) ,o.arrItemExtendedAllowed ) ) ;



                                if ( $.inArray(parseInt( $("input:hidden[name*=hd_id_type]",$(html_row).children()).val() ) ,o.arrItemExtendedAllowed )  >= 0 ){
                                    // Significa que esta el arreglo & tiene que ser tratado como campo extendido

                                        // valida que exista el div, donde se llenara la info traida
                                        if( $( o.selector_wraper_ajx_cart ).length && o.enableShowItemExtended ){

                                            $.get(o.ajx_cart_url, $.param($("input",$(html_row).children()),true) || o.ajx_cart_data, o.ajx_cart_success).complete(function(){
                                                fnsModCart.fncAddItemGeneric( html_row );
                                            });
                                            //$( o.selector_wraper_ajx_cart ).load(o.ajx_cart_url);
                                            fnsModCart.fncAddItemGeneric( html_row );

                                        }else{
                                            //console.warn("SI ENTRO V2 !!!");
                                            fnsModCart.fncAddItemGeneric( html_row );

                                        }// else


                                }else{
                                    // Se trata normal

                                    fnsModCart.fncAddItemGeneric(html_row);
                                }

                                //** Depreciated since 1.2.9 Aug/ 25th
                                //switch( parseInt( $("input:hidden[name*=hd_id_type]",$(html_row).children()).val() ) ){
                                //
                                //    case 1: // agregado normal
                                //        fnsModCart.fncAddItemGeneric(html_row);
                                //    break;
                                //    case 6: // agregado con contenido traido del ajax
                                //        //console.warn("SI ENTRO!!!");
                                //        // valida que exista el div, donde se llenara la info traida
                                //        if( $( o.selector_wraper_ajx_cart ).length && o.enableShowItemExtended ){
                                //
                                //            $.get(o.ajx_cart_url, $.param($("input",$(html_row).children()),true) || o.ajx_cart_data, o.ajx_cart_success).complete(function(){
                                //                fnsModCart.fncAddItemGeneric( html_row );
                                //            });
                                //            //$( o.selector_wraper_ajx_cart ).load(o.ajx_cart_url);
                                //            fnsModCart.fncAddItemGeneric( html_row );
                                //
                                //        }else{
                                //            //console.warn("SI ENTRO V2 !!!");
                                //            fnsModCart.fncAddItemGeneric( html_row );
                                //
                                //        }// else
                                //
                                //    break;
                                //    default:
                                //        //
                                //        fnsModCart.fncAddItemGeneric(html_row);
                                //    break;
                                //}// switch


                            }else{

                                // Hace un agregado normal de tipo: 1
                                fnsModCart.fncAddItemGeneric(html_row);

                            }// else

                        }else if ( $.inArray( parseInt( hidden_input.val() ),obj_hiddens ) >= 0 ){
                            //Actualizar item cuando se agrega uno que ya estaba en la lista
                            fnsModCart.fncUpdateItemGeneric(html_row,hidden_input,obj_hiddens);

                        }// else if

                    }//else

                }// if

            },// addItems

            fncAddItemGeneric: function(html_row){

                // AGREGADO DEL ITEM

                    // los inputs que tengan id, cambia el valor a vacio " "
                    $(html_row).children().map(function(i,elem){ if( $("input",elem).attr("id") != undefined ){  $("input",elem).attr("id", ""); } return elem; });

                    if( $(html_row).children().find(o.anchor_selector_head || "a" ).length ){

                            if( $(html_row).children().find(o.anchor_selector_cleaner) ){

                                $(o.anchor_selector_cleaner,$(html_row).children()).remove();

                            }

                            var anchor = $(html_row).children().find(o.anchor_selector_head || "a" );
                            anchor.html(o.anchor_remove_text);
                            anchor.attr("class",o.anchor_remove_selector);
                            fnsModCart.removeRow(anchor);

                            fnsModCart.validateEmptyRows($(o.div_selector_body).children());

                    }

                    if( $("input:text[name*=qty]",$(html_row).children()).length ){

                        head_qty = parseFloat( $("input:text[name*=qty]",$(html_row).children()).val() );

                    }

                    if( $("input:text[name*=unit_price]",$(html_row).children()).length ){

                        head_price = parseFloat( $("input:text[name*=unit_price]",$(html_row).children()).val() );

                    }

                    if( $("input:text[name*=descount]",$(html_row).children()).length ){

                        head_discount = isNaN( $("input:text[name*=descount]",$(html_row).children()).val() ) == true ? 0.00:parseFloat( $("input:text[name*=descount]",$(html_row).children()).val() ) ;

                    }

                    if(head_qty && head_price){

                        if( $("input:text[name*=sub_total]",$(html_row).children()).length ){

                            $("input:text[name*=sub_total]",$(html_row).children()).val( parseFloat( ( head_qty * head_price ) - ( o.descount_type == 1 ? head_discount : ( o.descount_type == 2 ? ( ( head_qty * head_price ) * ( head_discount / 100 )  ) : 0.00 ) ) ).toFixed(2) );

                        }

                    }

                    // atachar el keyup de cantidad para que haga la operacion!

                    //if( parseInt( $("input:hidden[name*=hd_id_type]",$(html_row).children()).val() ) == 2 && o.enableShowItemExtended){// updated: June/12th
                    if ( $.inArray(parseInt( $("input:hidden[name*=hd_id_type]",$(html_row).children()).val() ) ,o.arrItemExtendedAllowed )  >= 0 ){ // fixed: Aug/25th

                        // Valida que haya contenido en el div
                        if( !$( o.selector_wraper_ajx_cart ).is(":empty") ){

                            $("#btn_ajx_save",$( o.selector_wraper_ajx_cart ).children().eq(1)).bind("click",function(e){

                                fnsModCart.validateErrors($( o.selector_wraper_ajx_cart ));

                                // Valida que no haya ningun error en los campos con el atributo validate
                                if( !( $("[class*=error]",$( o.selector_wraper_ajx_cart )) ).length ){

                                    $( o.selector_wraper_ajx_cart ).hide("slow");

                                    var data = $("<div class='wcart_detail_"+ ( parseInt( $("input[name*=hd_id_product]",$(html_row).children()).val() ) ? parseInt( $("input[name*=hd_id_product]",$(html_row).children()).val() ) : $("input[name*=hd_id_product]",$(html_row).children()).val() ) +"'>");
                                    $(data).append("<span><a class='anchor_detail' href='#'><img src='"+ o.selector_detail_img_path +"arrow-000-medium.png' width=13 heigth=13 > Detalle</a></span");

                                    $(data).append( $( o.selector_wraper_ajx_cart ).children().siblings().not(":last").hide() );
                                    $( o.selector_wraper_ajx_cart ).html("");

                                    $(data).delegate(".anchor_detail","click",function(e){

                                        $(e.target).closest("div").children(":last").toggle();
                                        //console.info($(e.target).closest("div").children(":last"));
                                        return false;
                                    });

                                    $(data).delegate("[validate]","keyup",function(e){

                                       // $(e.target).closest("div").children(":last").toggle();
                                        //console.info($(e.target));
                                        fnsModCart.validateErrors($( data ));
                                    });

                                    fnsModCart.validateEmptyRows($(o.div_selector_body).children(),true);

                                    $(html_row).addClass("bordersWcartRow");

                                    $( html_row ).appendTo( o.div_selector_body );

                                    $( data ).appendTo( o.div_selector_body );

                                    fnsModCart.cleanAdderCart();

                                    fnsModCart.bindEditRow($("input:text[name*=qty]",$(html_row).children()), $("input:text[name*=unit_price]",$(html_row).children()), $("input:text[name*=sub_total]",$(html_row).children()), $("input:checkbox[name*=iva]",$(html_row).children()), $("input:text[name*=descount]",$(html_row).children()), $(html_row) );

                                    fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                                }else{
                                        $("[class*=error]:first",$( o.selector_wraper_ajx_cart )).focus();
                                }

                            });

                            $("#btn_ajx_cancel",$( o.selector_wraper_ajx_cart ).children().eq(1)).bind("click",function(e){

                                $( o.selector_wraper_ajx_cart ).hide("slow",function(){$( this ).html("");});
                                fnsModCart.cleanAdderCart();

                            });

                            $( o.selector_wraper_ajx_cart ).show("slow");//.delay(5000).hide("slow");

                        }// if

                    }else{

                        fnsModCart.validateEmptyRows($(o.div_selector_body).children(),true);

                        $( html_row ).appendTo( o.div_selector_body );

                        fnsModCart.cleanAdderCart();

                        fnsModCart.bindEditRow($("input:text[name*=qty]",$(html_row).children()), $("input:text[name*=unit_price]",$(html_row).children()), $("input:text[name*=sub_total]",$(html_row).children()), $("input:checkbox[name*=iva]",$(html_row).children()), $("input:text[name*=descount]",$(html_row).children()), $(html_row) );

                        fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                    }// else

            },
            fncUpdateItemGeneric: function(html_row,input_to_search,obj_to_search){

                // ACTUALIZACION DEL ITEM POR CANTIDAD

                    var row = $( o.div_selector_body ).children()[$.inArray(parseInt( input_to_search.val() ) ? parseInt( input_to_search.val() ) : input_to_search.val() ,obj_to_search)];
                    var now_qty = parseFloat( $("input:text[name*=qty]",$(html_row).children()).val() ),
                            //u_price = parseFloat( $("input:text[name*=unit]",$(html_row).children()).val() );// Fixed 1.3 Aug/25th
                            u_price = parseFloat( $("input:text[name*=unit_price]",$(html_row).children()).val() );

                    //console.info( parseFloat( $("input:text[name*=qty]",row).val() ) + now_qty );
                    // Sumando la nueva cantidad
                    var f_qty = ( parseFloat( $("input:text[name*=qty]",row).val() ) + now_qty );

                    $("input:text[name*=qty]",row).val( f_qty );

                    //console.info("u_price: %o",u_price);

                    $("input:text[name*=sub]",row).val( parseFloat( ( f_qty || 0.00 ) * ( u_price || 0.00 ) ).toFixed(2) );

                    fnsModCart.cleanAdderCart();

                    //Recalcular los totales
                    fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );
            },

            // Llenado de datos de subtotal en cada row
            bindEditRow: function(qty, price, s_total, iva, descount,row){

                if( qty && price && s_total){

                    $(qty).bind("keyup",function(e){

                        fnsModCart.validateErrors($(row).children());
                        

                        if( !( $("input[class*=error]",$(row).children()) ).length ){

                            var qty_v = $(qty).val(),
                                price_v = $(price).val(),
                                s_total_v = parseFloat($(s_total).val() ),
                                result = 0.00;
                                o.DBUG && console.info("s_total: %o",s_total);
                                s_total_v = fnsModCart.round(parseFloat( qty_v * price_v ) - ( o.descount_type == 1 ? parseFloat( $(descount).val() ) : ( o.descount_type == 2 ? ( ( parseFloat( $(qty).val() ) * parseFloat( $(price).val() ) ) * ( head_discount / 100 )  ) : 0.00 ) ),2);

                            $(qty).val(qty_v);
                            $(price).val(price_v);
                            $(s_total).val(s_total_v);

                        }else{
                            $("input[class*=error]:first",$(row).children()).focus();
                        }

                        fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                    });

                    $(price).bind("keyup",function(e){

                        fnsModCart.validateErrors($(row).children());

                        if( !( $("input[class*=error]",$(row).children()) ).length ){

                            var qty_v = $(qty).val() ,
                                price_v =  $(price).val() ,
                                s_total_v = parseFloat( $(s_total).val() ),
                                result = 0.00;
                                o.DBUG && console.info("s_total_v: %o",s_total_v);

                            s_total_v = fnsModCart.round(parseFloat( qty_v * price_v ) - ( o.descount_type == 1 ? parseFloat( $(descount).val() ) : ( o.descount_type == 2 ? ( ( parseFloat( $(qty).val() ) * parseFloat( $(price).val() ) ) * ( head_discount / 100 )  ) : 0.00 ) ),2);

                            $(qty).val(qty_v);
                            $(price).val(price_v);
                            $(s_total).val(s_total_v);

                        }else{

                            $("input[class*=error]:first",$(row).children()).focus();

                        }// else

                        fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                    });

                    if( iva ){

                        // Removed since v1.2.1
                            //if(o.iva_readonly) $(iva).attr("disabled","disabled");
                        //Fix 1.2.1
                        if(o.iva_readonly) $(iva).click(function(e){return false;})
                        $(iva).val($("input[name*=hd_id_product]",$(row).children()).val());
                        $(iva).bind("change",function(e){

                            //Fix 1.3
                                if(o.iva_readonly) return false;

                            if( $(e.target).is(":checked") ){

                                $(o.selector_iva).val( fnsModCart.round( parseFloat( parseFloat( $(o.selector_iva).val() ) + parseFloat($("input[name*=sub]",$(row).children()).val()) * parseFloat(o.iva_rate / 100) ) ,2) );

                            }else{

                                $(o.selector_iva).val( fnsModCart.round( parseFloat( parseFloat( $(o.selector_iva).val() ) - parseFloat($("input[name*=sub]",$(row).children()).val()) * parseFloat(o.iva_rate / 100) ) ,2) );

                            }// else
                            


                            // Fix 1.3
                            fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );
                        });

                    }// if

                    if( descount ){

                        $( descount ).bind("keyup",function(e){

                            fnsModCart.validateErrors( $(row).children() );

                            if( !( $("input[class*=error]",$(row).children()) ).length ){

                                var qty_v = $(qty).val() ,
                                    price_v =  $(price).val() ,
                                    descount_v = $(descount).val(),
                                    s_total_v = parseFloat( $(s_total).val() ),
                                    result = 0.00;

                                result = fnsModCart.round(parseFloat( ( qty_v * price_v ) - ( o.descount_type == 1 ? descount_v : ( o.descount_type == 2 ? ( ( qty_v * price_v ) * ( descount_v / 100 )  ) : 0.00 ) ) ), 2);

                                $(qty).val(qty_v);
                                $(price).val(price_v);
                                o.DBUG && console.info("price_v: %o",price_v);
                                // $(descount).val( (result > 0 ? descount_v : 0.00 ) );
                                $(s_total).val( ( result > 0 ? result : s_total_v)  );

                            }else{
                                $("input[class*=error]:first",$(row).children()).focus();
                            }

                            fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                        });

                    }// if

                }// if

            },// bindEditRow


            validateSubtotals: function(b){

                var sum = parseFloat(0.00), iva_sum = parseFloat(0.00), no_iva_sum = parseFloat(0.00), iva_op = parseFloat(0.00), descount_amount = parseFloat(0.00),
                    charge_emergency =  $(o.selector_charge_emergency)  ,
                    subtotal_wiva =  $(o.selector_subtotal_wiva)  ,
                    subtotal_niva =  $(o.selector_subtotal_niva)  ,
                    subtotal =  $(o.selector_subtotal)  ,
                    descount_money =  $(o.selector_descount_money) ,
                    descount_percent =  $(o.selector_descount_percent) ,
                    descount_wiva = $(o.selector_desc_wiva),
                    descount_niva = $(o.selector_desc_niva),
                    subtotal_desc = $(o.selector_subtotal_desc),
                    great_total_wiva =  $(o.selector_great_total_wiva) ,
                    great_total_niva =  $(o.selector_great_total_niva) ,
                    great_total =  $(o.selector_great_total)  ,
                    iva = $(o.selector_iva),
                    total = $(o.selector_total),
                    tipo_de_cambio = $(o.selector_tipo_cambio)
                    ;

                ( o.DBUG ) ? console.info($(b)) : false;

                // console.info(( fnsModCart.round( iva_sum +  parseFloat( $(o.selector_charge_emergency).val() || 0.00 )  )  ) / ( o.iva_included_rate ));
                b.each(function(i,elem){

                    if ( $(elem).is("div.wcart_row") ){

                        ( o.DBUG ) ? console.info(( $(elem).is("div.wcart_row") )) : false;

                        if( $("input[name*=sub]",elem).length ){

                            sum += fnsModCart.round($("input[name*=sub]",elem).val() || 0.00,2);

                        }// if

                        if( $("input:checkbox[name*=iva]:checked",elem).length ){

                            if( o.iva_rate ){

                                //iva_op += parseFloat($("input[name*=sub]",elem).val()) * parseFloat(o.iva_rate / 100);
                                // iva_op += fnsModCart.round($("input[name*=sub]",elem).val(),2);
                                o.DBUG && console.info("SUB",parseFloat( $("input[name*=sub]",elem).val() || 0.00));
                                iva_sum += parseFloat( $("input[name*=sub]",elem).val() || 0.00);


                                //if( o.iva_included ){
                                //
                                //    //console.warn(fnsModCart.round($("input[name*=sub]",elem).val(),2));
                                //
                                //    var test_subtotal_item = fnsModCart.round($("input[name*=sub]",elem).val(),2);
                                //    console.warn("SUBTOTAL ITEM: %o",test_subtotal_item);
                                //    console.warn("IVA DEL PRODUCTO:  %o", test_subtotal_item * ( o.iva_rate / 100) );
                                //}
                                //


                            }// if

                        }else{

                            no_iva_sum += parseFloat( $("input[name*=sub]",elem).val() || 0.00 );

                        }
                        //console.info(no_iva_sum)

                    }// if

                });
                o.DBUG && console.info("IVA-SUM: %o",parseFloat( fnsModCart.round( parseFloat(iva_sum) ) ));
                iva_sum = parseFloat( fnsModCart.round( parseFloat(iva_sum) ) );
                no_iva_sum = parseFloat( fnsModCart.round( no_iva_sum ) );

                // console.info("Subtotal A/IVA -1: %o", iva_sum);
                // console.info("Subtotal A/IVA -2: %o", $(o.selector_charge_emergency).val());
                // $(o.selector_subtotal_wiva).val( ( o.iva_included == true ) ? fnsModCart.round( ( fnsModCart.round( iva_sum +  parseFloat( $(o.selector_charge_emergency).val() || 0.00 )  )  ) / ( o.iva_included_rate || 0.00 )  ) : fnsModCart.round( iva_sum + parseFloat( $(o.selector_charge_emergency).val() || 0.00 ) ) );

                // subtotal_wiva.val( ( typeof o.iva_included === "boolean" && o.iva_included === true ) ? fnsModCart.round( ( iva_sum + parseFloat( charge_emergency.val() || 0.00 ) ) / ( o.iva_included_rate || 0.00 ) ):fnsModCart.round( iva_sum + parseFloat( charge_emergency.val() || 0.00 ) ) );



                // iva_op = parseFloat( iva_sum + parseFloat( charge_emergency.val() || 0.00 ));

                subtotal_wiva.val(fnsModCart.round(  iva_sum + parseFloat( charge_emergency.val() || 0.00 ) ) );
                subtotal_niva.val(  no_iva_sum || 0.00  );

                subtotal.val( fnsModCart.round( parseFloat(subtotal_wiva.val()) + parseFloat(subtotal_niva.val()) ) );

                if( parseFloat(descount_money.val()) > 0){

                    // var each_piece = parseFloat(descount_money.val()) / 2.00;

                    // descount_wiva.val( each_piece );
                    // descount_niva.val( each_piece );
                    descount_amount = fnsModCart.round( parseFloat(subtotal.val()) - parseFloat(descount_money.val()) );
                    // subtotal.val( descount_amount );

                    descount_wiva.val( fnsModCart.round( parseFloat( subtotal_wiva.val() || 0.00) * ( parseFloat( ( (100 * parseFloat(descount_money.val() || 0.00 ) ) / parseFloat(subtotal.val() || 0.00) ) / 100) ) ) || 0.00  );
                    descount_niva.val( fnsModCart.round( parseFloat( subtotal_niva.val() || 0.00) * ( parseFloat( ( (100 * parseFloat(descount_money.val() || 0.00 ) ) / parseFloat(subtotal.val() || 0.00) ) / 100) ) ) || 0.00  );

                    // iva_op = fnsModCart.round( parseFloat( iva_sum + parseFloat( charge_emergency.val() || 0.00 ) ) - parseFloat(descount_wiva.val() || 0.00) );

                }

                if( parseFloat(descount_percent.val()) > 0){
                    descount_wiva.val( fnsModCart.round( parseFloat(subtotal_wiva.val() || 0.00) * ( parseFloat( ( ( parseFloat(descount_percent.val() || 0.00) / 100 )  ) ) ) ) || 0.00 );
                    descount_niva.val( fnsModCart.round( parseFloat(subtotal_niva.val() || 0.00) * ( parseFloat( ( ( parseFloat(descount_percent.val() || 0.00) / 100 )  ) ) ) ) || 0.00 );

                    descount_amount = fnsModCart.round( parseFloat(subtotal.val()) - ( parseFloat(subtotal.val()) * parseFloat(descount_percent.val() / 100) ) );
                    // subtotal.val( descount_amount );

                }

                // subtotal_wiva.val(fnsModCart.round( ( iva_sum + parseFloat( charge_emergency.val() || 0.00 ) ) - parseFloat(descount_wiva.val() || 0.00) ));
                // subtotal_niva.val( ( no_iva_sum || 0.00 ) - parseFloat(descount_niva.val() || 0.00));

                subtotal_desc.val( descount_amount || subtotal.val());

                iva_op = fnsModCart.round( parseFloat( iva_sum + parseFloat( charge_emergency.val() || 0.00 ) ) - parseFloat(descount_wiva.val() || 0.00) );



                great_total_wiva.val( ( typeof o.iva_included === "boolean" && o.iva_included === true ) ? fnsModCart.round( ( parseFloat( subtotal_wiva.val() || 0.00) - parseFloat(descount_wiva.val() || 0.00) ) / o.iva_included_rate  ) : fnsModCart.round( ( parseFloat( subtotal_wiva.val() || 0.00) - parseFloat(descount_wiva.val() || 0.00) )  ) );
                great_total_niva.val( fnsModCart.round( ( parseFloat( subtotal_niva.val() || 0.00) - parseFloat(descount_niva.val() || 0.00) ) ) || 0.00 );

                great_total.val( fnsModCart.round( parseFloat(great_total_wiva.val() || 0.00) + parseFloat(great_total_niva.val() || 0.00) ) );
                // console.info("IVA-OP: %o",parseFloat( great_total_wiva.val() || 0.00)   );
                // console.info("IVA-OP: %o",( o.iva_rate / 100)   );
                iva.val( ( typeof o.iva_included === "boolean" && o.iva_included === true ) ? fnsModCart.round( parseFloat(iva_op) - parseFloat(great_total_wiva.val() || 0.00) ) : fnsModCart.round(  parseFloat( great_total_wiva.val() || 0.00)  * ( o.iva_rate / 100)   )  );

                total.val( fnsModCart.round( parseFloat(great_total.val() || 0.00) + parseFloat(iva.val() || 0.00) ) );
                if(subtotal_desc.val() - total.val()){
                    console.log('DIFERENCIA EN SUBTOTAL Y TOTAL');
                    diferencia = parseFloat(subtotal_desc.val()) - parseFloat(total.val());
                    if(diferencia < 0.01){
                        console.log('DIFERENCIA DE 0.009 O MENOR A 0.01');
                        if(diferencia < 0){subtotal_desc.val(parseFloat(subtotal_desc.val()) - diferencia);}
                        if(diferencia > 0){subtotal_desc.val(parseFloat(subtotal_desc.val()) - diferencia);}
                    }
                }
                console.log(total.val());
                console.log(tipo_de_cambio.val())
                //conversion de pesos a dolares
                var total_usd = total.val() / tipo_de_cambio.val();
                $("#total_usd").val(parseFloat(total_usd).toFixed(2));

                    if(o.enableTotalPayments){
                        // Verifica que el campo exista

                        // <1.3 if( ( $(o.selector_payments_total)).length ) $(o.selector_payments_total).val( fnsModCart.round( parseFloat($(o.selector_great_total).val() || 0.00) + parseFloat($(o.selector_iva).val() || 0.00),2 ) );
                        // <1.3.1 if( ( $(o.selector_payments_total)).length ) $(o.selector_payments_total).val( fnsModCart.round( parseFloat($(o.selector_great_total).val() || 0.00) + parseFloat($(o.selector_iva).val() || 0.00),2 ) - fnsModCart.round( parseFloat( $(o.selector_transactions_total).val() ) ||0.00 )  );
                        // console.info("TOTAL A PAGAR: %o",fnsModCart.round( ( parseFloat( $(o.selector_great_total).val() || 0.00 ) + parseFloat( $(o.selector_iva).val() || 0.00 ) ) - parseFloat( $(o.selector_transactions_total).val() || 0.00 ), 2 ));
                        if( ( total ).length ) $(o.selector_payments_total).val( fnsModCart.round( parseFloat( total.val() || 0.00 ) - parseFloat( $(o.selector_transactions_total).val() ||0.00 ) , 2 )  );


                        $(o.selector_trigger_payments).trigger("blur");
                    }// if

                // if( $(o.selector_subtotal_wiva).length ){

                //     //console.info( (o.DBUG) ? 'y\'all folks':'none folks' );
                //     //( 1==1 ) ? ( console.log("selector_subtotal_wiva: val(%o) & iva_sum: val(%o) & iva_included_rate: val(%o) & emergency_charge: val(%o)",( o.iva_included ) ? parseFloat( iva_sum / o.iva_included_rate ).toFixed(2) : iva_sum.toFixed(2), iva_sum , o.iva_included_rate, parseFloat( $(o.selector_charge_emergency).val() )) ) : false;
                //     // + parseFloat( $(o.selector_charge_emergency).val() || 0.00 )
                //     // $(o.selector_subtotal_wiva).val( ( o.iva_included == true ) ? parseFloat( ( ( iva_sum +  parseFloat( $(o.selector_charge_emergency).val() || 0.00 )  ) / o.iva_included_rate ) || 0.00 ).toFixed(2) : parseFloat( iva_sum + parseFloat( $(o.selector_charge_emergency).val() || 0.00 ) ).toFixed(2) );
                //     $(o.selector_subtotal_wiva).val( ( o.iva_included == true ) ? fnsModCart.round( ( fnsModCart.round( iva_sum +  parseFloat( $(o.selector_charge_emergency).val() || 0.00 )  )  ) / ( o.iva_included_rate || 0.00 )  ) : fnsModCart.round( iva_sum + parseFloat( $(o.selector_charge_emergency).val() || 0.00 ) ) );

                // }

                // if( $(o.selector_subtotal_niva).length ){

                //     // $(o.selector_subtotal_niva).val( no_iva_sum.toFixed(2) );
                //     $(o.selector_subtotal_niva).val( fnsModCart.round( no_iva_sum ) );

                // }


                // if( $(o.selector_subtotal).length ){

                //     ( o.DBUG ) ? ( console.info("selector_subtotal: val(%o)", parseFloat( parseFloat( $(o.selector_subtotal_wiva).val() ) + parseFloat( $(o.selector_subtotal_niva).val( ) ) )) ) : false;
                //     // $(o.selector_subtotal).val( parseFloat(  parseFloat( $(o.selector_subtotal_wiva).val() ) + parseFloat( $(o.selector_subtotal_niva).val( ) ) ).toFixed(2) );
                //     $(o.selector_subtotal).val( fnsModCart.round(  parseFloat( $(o.selector_subtotal_wiva).val() ) + parseFloat( $(o.selector_subtotal_niva).val( ) ) ) );

                // }// if


                // if( ( $(o.selector_descount_money).val() ).length && parseFloat( $(o.selector_descount_money).val() ) <= parseFloat( $(o.selector_subtotal).val() ) && isNaN( $(o.selector_descount_money).val() ) == false){

                //     $(o.selector_desc_wiva).val( fnsModCart.round( parseFloat($(o.selector_subtotal_wiva).val()) * ( parseFloat( ( (100 * parseFloat($(o.selector_descount_money).val()) ) / parseFloat($("#wcart_subtotal").val()) ) / 100) ) ) || 0.00 );
                //     $(o.selector_desc_niva).val( fnsModCart.round( parseFloat($(o.selector_subtotal_niva).val()) * ( parseFloat( ( (100 * parseFloat($(o.selector_descount_money).val()) ) / parseFloat($("#wcart_subtotal").val()) ) / 100) ) ) || 0.00 );

                //     $(o.selector_great_total_wiva).val( fnsModCart.round( parseFloat( $(o.selector_subtotal_wiva).val() ) - parseFloat( $(o.selector_desc_wiva).val() ) ) || 0.00 );
                //     $(o.selector_great_total_niva).val( fnsModCart.round( parseFloat( $(o.selector_subtotal_niva).val() ) - parseFloat( $(o.selector_desc_niva).val() ) ) || 0.00 );

                //     $(o.selector_great_total).val( fnsModCart.round( parseFloat( $(o.selector_great_total_wiva).val() ) + parseFloat( $(o.selector_great_total_niva).val() ) ) || 0.00 );




                // }

                // if( ($(o.selector_descount_percent).val()).length && parseFloat( $(o.selector_descount_percent).val() ) <= parseFloat( 100 ).toFixed(2) && isNaN($(o.selector_descount_percent).val()) == false ){

                //     $(o.selector_desc_wiva).val( fnsModCart.round( parseFloat($(o.selector_subtotal_wiva).val()) * ( parseFloat( ( ( parseFloat($(o.selector_descount_percent).val()) / 100 )  ) ) ) ) || 0.00 );
                //     $(o.selector_desc_niva).val( fnsModCart.round( parseFloat($(o.selector_subtotal_niva).val()) * ( parseFloat( ( ( parseFloat($(o.selector_descount_percent).val()) / 100 )  ) ) ) ) || 0.00 );

                //     $(o.selector_great_total_wiva).val( fnsModCart.round( parseFloat( $(o.selector_subtotal_wiva).val() ) - parseFloat( $(o.selector_desc_wiva).val() ) ) || 0.00 );
                //     $(o.selector_great_total_niva).val( fnsModCart.round( parseFloat( $(o.selector_subtotal_niva).val() ) - parseFloat( $(o.selector_desc_niva).val() ) ) || 0.00 );

                //     $(o.selector_great_total).val( fnsModCart.round( parseFloat( $(o.selector_great_total_wiva).val() ) + parseFloat( $(o.selector_great_total_niva).val() ) ) || 0.00 );

                // }

                // if( !($(o.selector_descount_percent).val()).length && !($(o.selector_descount_money).val()).length ){

                //     $(o.selector_great_total).val( fnsModCart.round( $(o.selector_subtotal).val() ) || 0.00 );

                // }


                // // Fix 1.3
                // if ( $(o.selector_great_total).length ) {

                //     $(o.selector_great_total_wiva).val( fnsModCart.round( parseFloat( $(o.selector_subtotal_wiva).val() ) - parseFloat( $(o.selector_desc_wiva).val() || 0.00 ) ) || 0.00 );

                //     $(o.selector_great_total_niva).val( fnsModCart.round( parseFloat( $(o.selector_subtotal_niva).val() ) - parseFloat( $(o.selector_desc_niva).val() || 0.00 ) ) || 0.00 );

                //     $(o.selector_great_total).val( fnsModCart.round( parseFloat( $(o.selector_great_total_wiva).val() ) + parseFloat( $(o.selector_great_total_niva).val() ) ) || 0.00 );



                // }



                // if( $(o.selector_iva).length ){

                //     // $(o.selector_iva).val( ( o.iva_included ) ? ( fnsModCart.round( $(o.selector_subtotal_wiva).val() * ( o.iva_rate / 100 ) ) || 0.00 ) : parseFloat( parseFloat( parseFloat( iva_op || 0.00) - parseFloat( parseFloat( $(o.selector_desc_wiva).val() ) || 0.00  ) )  * parseFloat( o.iva_rate / 100) ) );
                //     // $(o.selector_iva).val( ( o.iva_included ) ? ( fnsModCart.round(parseFloat($(o.selector_great_total_wiva).val()) -( parseFloat($(o.selector_great_total_wiva).val()) / ( ( o.iva_rate / 100 ) + 1 )) , 2 ) || 0.00 ) : parseFloat( parseFloat( parseFloat( iva_op || 0.00) - parseFloat( parseFloat( $(o.selector_desc_wiva).val() ) || 0.00  ) )  * parseFloat( o.iva_rate / 100) ) );
                //     // $(o.selector_iva).val( ( o.iva_included ) ? ( fnsModCart.round( fnsModCart.round( parseFloat( $(o.selector_great_total_wiva).val() ) ) - fnsModCart.round( parseFloat( $(o.selector_great_total_wiva).val() ) / ( ( o.iva_rate / 100 ) + 1 )) , 2 ) || 0.00 ) : parseFloat( parseFloat( parseFloat( iva_op || 0.00) - parseFloat( parseFloat( $(o.selector_desc_wiva).val() ) || 0.00  ) )  * parseFloat( o.iva_rate / 100) ) );
                //     // $(o.selector_iva).val( ( o.iva_included ) ? fnsModCart.round( ( iva_sum + parseFloat($(o.selector_charge_emergency).val() || 0.00) ) - parseFloat( $(o.selector_great_total_wiva).val() || 0.00 )- parseFloat( $(o.selector_desc_wiva).val() || 0.00 )) : fnsModCart.round( parseFloat( $(o.selector_great_total_wiva).val()  || 0.00 ) * parseFloat( o.iva_rate / 100) ) );
                //     // $(o.selector_iva).val( fnsModCart.round( ( iva_sum +  parseFloat( $(o.selector_charge_emergency).val() || 0.00 ) ) - parseFloat( $(o.selector_great_total_wiva).val()  || 0.00 ) ) );

                //     // variable para iva
                //     // iva_op = fnsModCart.round(iva_sum + parseFloat($(o.selector_charge_emergency).val() || 0.00 ) - parseFloat($(o.selector_desc_wiva).val() || 0.00) ,2);



                //     // $(o.selector_iva).val( fnsModCart.round( (parseFloat( $(o.selector_great_total_wiva).val() + $(o.selector_charge_emergency).val() || 0.00 )  *  ( o.iva_rate / 100 )).toFixed(2) , 2) );

                //     // $(o.selector_iva).val( fnsModCart.round( parseFloat(iva_op || 0.00)  - parseFloat( $(o.selector_great_total_wiva).val()  || 0.00 ) ) );


                //     // console.info( "GranTotalWIVA: %o", fnsModCart.round( parseFloat( $(o.selector_great_total_wiva).val() ) )  );
                //     // console.info( "IVA-OP: %o", fnsModCart.round( parseFloat(iva_op || 0.00)  - parseFloat( $(o.selector_great_total_wiva).val()  || 0.00 ) ));
                //     // console.info( fnsModCart.round(iva_sum -$(o.selector_great_total_wiva).val() ));

                // }// if

                // if( $(o.selector_total).length ){

                //     //v.1.2 $(o.selector_total).val( parseFloat( parseFloat($(o.selector_great_total).val() || 0.00) + parseFloat($(o.selector_iva).val() || 0.00) ) );

                //     $(o.selector_total).val( fnsModCart.round( parseFloat($(o.selector_great_total).val() || 0.00) + parseFloat($(o.selector_iva).val() || 0.00),2 ) );

                //     // valida que este activado
                //     if(o.enableTotalPayments){
                //         // Verifica que el campo exista

                //         // <1.3 if( ( $(o.selector_payments_total)).length ) $(o.selector_payments_total).val( fnsModCart.round( parseFloat($(o.selector_great_total).val() || 0.00) + parseFloat($(o.selector_iva).val() || 0.00),2 ) );
                //         // <1.3.1 if( ( $(o.selector_payments_total)).length ) $(o.selector_payments_total).val( fnsModCart.round( parseFloat($(o.selector_great_total).val() || 0.00) + parseFloat($(o.selector_iva).val() || 0.00),2 ) - fnsModCart.round( parseFloat( $(o.selector_transactions_total).val() ) ||0.00 )  );
                //         console.info("TOTAL A PAGAR: %o",fnsModCart.round( ( parseFloat( $(o.selector_great_total).val() || 0.00 ) + parseFloat( $(o.selector_iva).val() || 0.00 ) ) - parseFloat( $(o.selector_transactions_total).val() || 0.00 ), 2 ));
                //         if( ( $(o.selector_payments_total)).length ) $(o.selector_payments_total).val( fnsModCart.round( ( parseFloat( $(o.selector_great_total).val() || 0.00 ) + parseFloat( $(o.selector_iva).val() || 0.00 ) ) - parseFloat( $(o.selector_transactions_total).val() ||0.00 ) , 2 )  );


                //         $(o.selector_trigger_payments).trigger("blur");
                //     }// if

                // }// if


            },// validateSubtotals


            removeRow: function(elem){

                if(elem.length){

                    $(elem).bind("click",function(e){

                        $(e.target).closest("div.wcart_row").effect("blind",{},500,function(e){

                            $(this).remove();
                            $("div.wcart_detail_"+$(this).closest("div.wcart_row").find("input[name*=hd_id_product]").val()).delay(1000).remove();
                            if(!$(o.div_selector_body).children().size()){fnsModCart.validateEmptyRows($(o.div_selector_body).children());}
                        });

                        fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );

                        return false;
                    });

                }//if

            },// removeRow

            validateErrors: function(a, fromAddBtn){

                //a.children().map(function(i,elem){ if( $(elem).attr("validate")) return elem; }).each(function(i,elem){
                $(a).find("[validate]").map(function(i,elem){ if( $(elem).attr("validate")) return elem; }).each(function(i,elem){
                    var foundError = false,msg;
                    for(var item in $(elem).attr("validate").split("|")){
                        switch( $(elem).attr("validate").split("|")[item] ){

                            case "require":
                                if( !($.trim($(elem).val()).length > 0) ){
                                    foundError = true;
                                    msg = $.validity.messages[ $(elem).attr("validate").split("|")[item] ];
                                    break;
                                }
                            break;
                            case "no_empty":
                                // if( !($.trim($(elem).val()).length > 0) ){
                                if( ( parseFloat($.trim( $(elem)[0].value ) ) || 0.00 ) == 0.00){
                                    console.warn("ENTRO: %O", elem);
                                        //foundError = true;
                                        //msg = $.validity.messages[ $(elem).attr("validate").split("|")[item] ];
                                        if(fromAddBtn) $(elem).val("0.00");
                                    break;
                                }
                            break;

                            default:
                                if( !o.patterns[ $(elem).attr("validate").split("|")[item] ].test($(elem).val()) ){
                                    foundError = true;
                                    msg = $.validity.messages[ $(elem).attr("validate").split("|")[item] ];
                                    break;
                                }
                        }// switch

                    }// for

                    if( foundError ){
                        $(elem).addClass("error_class");
                        if(o.enableAlertError) alert( fnsModCart.replaceText(msg, $(elem).attr("name")) );
                        ( o.DBUG ) ? console.warn( fnsModCart.replaceText(msg, $(elem).attr("name")) ):false;
                    }else{
                        $(elem).removeClass("error_class");
                    }// else

                });

            },// validateErrors

            replaceText: function(m, t, needle){

                t = (t == undefined) ?  '!TEST':t;
                needle = (needle == undefined) ?  '#{field}':needle;

                var match = new RegExp(needle, "ig");
                var rturn = m.replace(match,t);

                return rturn;

            },// replaceText


            validateEmptyRows: function(b,r){
                //console.info((b.length));
                if( !(b.length) && !r){

                    var html_row = $(o.html_wrapper_emptyRows).addClass("wcart_row_empty");
                    $(html_row).append(o.emptySignHtml);
                    $( html_row ).appendTo( o.div_selector_body );

                    $(".wcart_row_empty",o.div_selector_body).effect("pulsate",{times: 2},1000);

                }


                if(r){

                    if( $("[class*=empty]",o.div_selector_body).length ){

                        $("[class*=empty]",o.div_selector_body).effect("blind",{},500,function(e){
                                $(this).remove();
                        });

                    }

                }

            }, // validateEmptyRows


            cleanAdderCart: function(setFocus){
                $(o.div_selector_head).children().map(function(i,elem){
                    // temporal

                    $("input:text,input:hidden",elem).not("#hd_id_discount_type").val("");
                    // $("input:checkbox",elem).removeAttr("checked");
                    if( $.isFunction( o.iva_adder_default ) ){
                        // Comportamiento 1
                        o.iva_adder_default(obj, o);
                    }
                            //console.info($("input:text,input:hidden",elem));
                });

                if(setFocus) $("input:text[name*=description]",$(o.div_selector_head).children()).focus();


            },// cleanAdderCart

            cleanFooterCart: function(){
                $(o.div_selector_foot).children().map(function(i,elem){
                    // temporal
                    $("input:text",elem).val("");
                    //$("input:checkbox",elem).removeAttr("checked");
                    //console.info($("input",elem));
                });


            },// cleanFooterCart

            // round: function(n,dec) {
            //     n = parseFloat(n);

            //     if(!isNaN(n)){
            //         if(!dec) var dec = 2;
            //             var factor= Math.pow(10,dec);
            //             return Math.floor(n*factor+((n*factor*10)%10>=5?1:0))/factor;
            //     }else{
            //         return n;
            //     }
            // }

            round: function(number,decimal_points) {

                if(!decimal_points) decimal_points = 2;
                    if(number == 0) {
                        var decimals = "";
                        for(var i=0;i<decimal_points;i++) decimals += "0";
                        return "0."+decimals;
                    }

                var exponent = Math.pow(10,decimal_points);
                var num = Math.round((number * exponent)).toString();
                return num.slice(0,-1*decimal_points) + "." + num.slice(-1*decimal_points)
            }


        };// ends fnsModCart

        return this.each(function(){

            // Verifica que si existen items pre cargados en el HTML
            control = fnsModCart.checkItemsPreloaded(obj);

            // Corre validaciones para objetos o elementos necesarios para que funcione
            fnsModCart.prepareCart(obj);

            // Valida que no haya errores
            if(!fnsModCart.control_errors){
                fnsModCart.cleanAdderCart();// limpia el ADDER
                //fnsModCart.cleanFooterCart();// Limpiar los campos de subtotales cuando carga el DOM

                // *Pendiente
                // Agregando el tipo del descuesto individual por item

                    if(($("#hd_id_discount_type")).length) $("#hd_id_discount_type").val(o.descount_type);

                fnsModCart.attach_head_action();
                // ** Temporal, problema con las demas funciones?
                if(control) fnsModCart.validateSubtotals( $( o.div_selector_body ).children() );
            }// if

        }) && fnsModCart;

    };

})(jQuery)
