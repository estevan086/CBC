jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings) {
	"use strict";
	this.YO = this;
	return Controller.extend("cbc.co.simulador_costos.controller.Admon.Centros", {

		onInit: function () {
			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChCentros");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			this.GetSociedades();
		},

		GetSociedades: function () {

			var oModel = this.getOwnerComponent().getModel("ModelSimulador");
			var sServiceUrl = oModel.sServiceUrl;

			//Definir modelo del servicio web
			var oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			//Definir filtro

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/maestroCentrosSet", null);

			if (oRead.tipo === "S") {
				this.oDataSociedades = oRead.datos.results;
				//	var obj = this.oDataUnidadesMedida;

			}

			var oDataUnidadesMedida = "";
			//SI el modelo NO existe, se crea.
			if (!oDataUnidadesMedida) {
				oDataUnidadesMedida = {
					lstItemsUnidadesMedida: []
				};
			}

			var oCbx = this.byId("idComboBoxSociedad");
			oCbx.getModel().setProperty("/LstSociedades", this.oDataSociedades);
			
			//oCbx.getModel().refresh();
		},

		onChangeSociedadessss: function (oEvent) {

			var oItem = oEvent.getParameter("selectedItem");
			var oCbx = this.byId("idComboBoxSociedad");
			var oItemObject = oItem.getBindingContext().getObject();
			var oSociedadSeleccionada = oItemObject.Compcodeplant;
			var oTableItem = oEvent.getSource().getParent();
			var oTableItemObject = oTableItem.getBindingContext().getObject();
			oTableItemObject.Sociedad = oSociedadSeleccionada;
			oCbx.getModel().refresh();

			/*	var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/periodoSet", {
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel();
					data.setProperty("/CodPeriodos", oData.results);
					this.getOwnerComponent().setModel(data, "Periodos");
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});*/

		},

	});

});