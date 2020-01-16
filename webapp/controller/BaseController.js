/*global history */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/m/Text"
], function(Controller, History, Dialog, Button, MessageToast, Text) {
	"use strict";

	return Controller.extend("cbc.co.simulador_costos.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
			//	oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			//if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		},

		/**
		@public
		Esta función es usada para abrir un diálogo cuando el usuario lo requiere
		*/
		f_crear_fargment: function(data) {
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(data, this);
				this.getView().addDependent(this._valueHelpDialog);
			}
			// open value help dialog
			this._valueHelpDialog.open();
		},


		/**
		 * Consumir servicio READ
		 * @public
		 * @param {object} pModel Modelo del Servicio Web
		 * @param {string} pEntidad Nombre de la entidad a consumir
		 * @param {object} pFilters Objeto con los filtros definidos
		 */
		fnReadEntity: function(pModelo, pEntidad, pFilters) {
			var vMensaje = null;
			var oMensaje = {};

			var fnSucess = function(data, response) {
				oMensaje.tipo = "S";
				oMensaje.datos = data;
			};
			var fnError = function(e) {
				vMensaje = JSON.parse(e.response.body);
				vMensaje = vMensaje.error.message.value;

				oMensaje.tipo = "E";
				oMensaje.msjs = vMensaje;
			};

			pModelo.read(pEntidad, null, pFilters, false, fnSucess, fnError);

			return oMensaje;
		},
		
		/**
		 * Obtener sólo Un registro de la Entidad
		 * @public
		 * @param {object} pModel Modelo del Servicio Web
		 * @param {string} pEntidad Nombre de la entidad a consumir
		 * @param {object} pFilters Objeto con los filtros definidos
		 */
		fnGetEntity: function(pModelo, pEntidad, pFilters) {
			var vMensaje = null;
			var oMensaje = {};

			var fnSucess = function(data, response) {
				oMensaje.tipo = "S";
				oMensaje.datos = response;
			};
			var fnError = function(e) {
				vMensaje = JSON.parse(e.response.body);
				vMensaje = vMensaje.error.message.value;

				oMensaje.tipo = "E";
				oMensaje.msjs = vMensaje;
			};

			pModelo.read(pEntidad, null, pFilters, false, fnSucess, fnError);

			return oMensaje;
		},

		/**
		 * Abrir Fragment.
		 * @public
		 * @param {string} pFragment es Ruta.NombreFragment a abrir
		 */
		fnOpenDialog: function(sRutaFragment) {
			this.oFragment = new Object();
			this.oFragment.view = null;

			this.fnLoadDialog(sRutaFragment, this.oFragment);
			this.oFragment.view.open();
		},
		
		/**
		 * Cerrar el fragment
		 * @public
		 */
		fnCloseFragment: function() {
			this.fnCloseDialog(this.oFragment);
			delete this.oFragment;
		},
		
		/**
		 * Instanciar Fragment.
		 * @public
		 * @param {string} sRutaFragment es Ruta.NombreFragment a instanciar
		 * @param {object} objFragment Objeto global contenedor del fragment
		 * @returns {object}
		 */
		fnLoadDialog: function(sRutaFragment, objFragment) {
			if (objFragment.view) {
				return;
			}
			// associate controller with the fragment
			objFragment.view = sap.ui.xmlfragment(sRutaFragment, this);
			this.getView().addDependent(objFragment.view);
		},

		/**
		 * Cerrar Fragment.
		 * @public
		 * @param {object} objFragment Objeto global contenedor del fragment
		 */
		fnCloseDialog: function(objFragment) {
			objFragment.view.destroy();
		},
		
		/**
		 * Consumir servicio CREATE.
		 * @public
		 * @param {object} pModelo hace referencia al modelo del servicio
		 * @param {string} pEntidad hace referencia a la entidad que se va a consumir
		 * @param {object} pDatoEndidad hace referencia a los dato a enviar a la entidad
		 * @returns {string} mensaje
		 */
		fnCreateEntity: function(pModelo, pEntidad, pDatoEndidad) {
			var vMensaje = null;
			var oMensaje = {};

			var fnSucess = function(data, response) {
				oMensaje.tipo = "S";
				oMensaje.datos = data;
			};
			var fnError = function(e) {
				vMensaje = JSON.parse(e.response.body);
				vMensaje = vMensaje.error.message.value;

				oMensaje.tipo = "E";
				oMensaje.msjs = vMensaje;
			};

			pModelo.create(pEntidad, pDatoEndidad, null, fnSucess, fnError, false);

			return oMensaje;
		},		

		/**
		 * Dialogo de confirmación
		 * @public
		 * @param {string} p_text_msj hace referencia al modelo del servicio
		 * @param {object} p_funcion_si Función que se ejecutará cuando el usuario presione Si
		 * @returns {object} Dialogo
		 */
		f_onApproveDialog: function (p_text_msj, p_funcion_si, p_funcion_no, p_obj_contexto) {
			var dialog = new Dialog({
				title: 'Confirmación',
				type: 'Message',
				content: new Text({ text: p_text_msj }),
				beginButton: new Button({
					text: 'Si',
					press: [null, p_funcion_si, p_obj_contexto]
				}),
				endButton: new Button({
					text: 'No',
					press: [null, p_funcion_no, p_obj_contexto]
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			//dialog.open();
			return dialog;
		},
	
		/**
		 * Consumir servicio UPDATE.
		 * @public
		 * @param {object} pModelo hace referencia al modelo del servicio
		 * @param {string} pEntidad hace referencia a la entidad que se va a consumir
		 * @param {object} pDatoEndidad hace referencia a los dato a enviar a la entidad
		 * @returns {string} mensaje
		 */
		fnUpdateEntity: function(pModelo, pEntidad, pDatoEndidad) {
			var vMensaje = null;
			var oMensaje = {};

			var fnSucess = function(data, response) {
				oMensaje.tipo = "S";
				oMensaje.response = response;
				oMensaje.datos = data;
			};
			var fnError = function(e) {
				vMensaje = JSON.parse(e.response.body);
				vMensaje = vMensaje.error.message.value;

				oMensaje.tipo = "E";
				oMensaje.msjs = vMensaje;
			};
			
			pModelo.update(pEntidad, pDatoEndidad, null, fnSucess, fnError, false);

			return oMensaje;
		},

		/**
		 * Consumir servicio Delete.
		 * @public
		 * @param {object} pModelo hace referencia al modelo del servicio
		 * @param {string} pEntidad hace referencia a la entidad que se va a consumir
		 * @param {object} pDatoEndidad hace referencia a los dato a enviar a la entidad
		 * @returns {string} mensaje
		 */
		fnRemoveEntity: function(pModelo, pEntidad) {
			var vMensaje = null;
			var oMensaje = {};

			var fnSucess = function(data, response) {
				oMensaje.tipo = "S";
				oMensaje.response = response;
			};
			var fnError = function(e) {
				vMensaje = JSON.parse(e.response.body);
				vMensaje = vMensaje.error.message.value;

				oMensaje.tipo = "E";
				oMensaje.msjs = vMensaje;
			};
			
			pModelo.remove(pEntidad, null, fnSucess, fnError, false);

			return oMensaje;
		},

		formatDate: function(v) {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd-MM-YYYY"
			});
			return oDateFormat.format(new Date(v));
		},
		
		/**
		 * Consumir servicio CREATE.
		 * @public
		 * @param {object} pModelo hace referencia al modelo del servicio
		 * @param {string} pEntidad hace referencia a la entidad que se va a consumir
		 * @param {object} pDatoEndidad hace referencia a los dato a enviar a la entidad
		 * @returns {string} mensaje
		 */
		fnCreateEntityAsy: function(pModelo, pEntidad, pDatoEndidad, pTpRequest) {
			
			var vMensaje = null;
			var oMensaje = {};
			// var sociedadPromise = new Promise();
			var promise = jQuery.Deferred();

			var fnSucess = function(data, response) {
				oMensaje.tipo = "S";
				oMensaje.datos = data;
				promise.resolve(oMensaje);
			};
			var fnError = function(e) {
				vMensaje = JSON.parse(e.response.body);
				vMensaje = vMensaje.error.message.value;

				oMensaje.tipo = "E";
				oMensaje.msjs = vMensaje;
				promise.reject(vMensaje);
			};

			pModelo.create(pEntidad,pDatoEndidad, { context: null, success: fnSucess, error: fnError, async: pTpRequest });

			// return oMensaje;
			return promise;			
			
		},
		
		/**
		 * Consumir servicio READ
		 * @public
		 * @param {object} pModel Modelo del Servicio Web
		 * @param {string} pEntidad Nombre de la entidad a consumir
		 * @param {object} pFilters Objeto con los filtros definidos
		 */
		fnReadEntityAsyn: function(pModelo, pEntidad, pFilters, pTpRequest) {
			var vMensaje = null;
			var oMensaje = {};
			// var sociedadPromise = new Promise();
			var promise = jQuery.Deferred();

			var fnSucess = function(data, response) {
				oMensaje.tipo = "S";
				oMensaje.datos = data;
				promise.resolve(oMensaje);
			};
			var fnError = function(e) {
				vMensaje = JSON.parse(e.response.body);
				vMensaje = vMensaje.error.message.value;

				oMensaje.tipo = "E";
				oMensaje.msjs = vMensaje;
				promise.reject(vMensaje);
			};

			pModelo.read(pEntidad, null, pFilters, pTpRequest, fnSucess, fnError);
			
			return promise;
		}		
		
	});

});