jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings", 'sap/m/MessageBox'
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings, MessageBox) {
	"use strict";
	var updatedRecords = [];
	var that = this;
	return Controller.extend("cbc.co.simulador_costos.controller.Admon.Centros", {

		onInit: function () {

			var oModelV = new JSONModel({
				busy: true,
				Bezei: ""
			});
			this.setModel(oModelV, "modelView");

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
			var oRead = this.fnReadEntity(oModelService, "/sociedadSet", null);

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
			this.getModel("modelView").setProperty("/busy", false);

			var oChx = this.byId("chxStatusCentro");
			var GetValueEdited = function (oEvent) {
				
			};
			oChx.attachBrowserEvent("click", GetValueEdited);
		},

		onChangeSociedad: function (oEvent) {
			this.getModel("modelView").setProperty("/busy", true);
			var oItem = oEvent.getParameter("selectedItem");
			var oItemObject = oItem.getBindingContext().getObject();

			var filterCompCode = new sap.ui.model.Filter({
				path: "CompCode",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oItemObject.CompCode
			});

			var filtersArray = new Array();
			filtersArray.push(filterCompCode);

			var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/centroSet", {
				filters: filtersArray,
				async: true,
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel();
					//data.setProperty("/CodCentros", oData.results);

					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].Flag = oData.results[i].Flag == "1" ? true : false;
						oData.results[i].oRow = oData.results[i];
					}
					data.setProperty("/CodCentros", oData.results);
					this.getOwnerComponent().setModel(data, "Centros");
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this),
				error: function (oError) {
					this.getModel("modelView").setProperty("/busy", false);
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});

		},

		UpdateCentros: function (oEvent) {
			MessageBox.show(
				'Datos guardados correctamente', {
					icon: MessageBox.Icon.SUCCESS,
					title: "Exito",
					actions: [MessageBox.Action.OK],
					onClose: function (oAction) {}
				}
			);

		}

	});

});