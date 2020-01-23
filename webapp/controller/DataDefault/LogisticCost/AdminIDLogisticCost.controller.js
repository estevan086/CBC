sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/m/MessageToast"
], function (BaseController, Filter, MessageToast) {
	"use strict";

	return BaseController.extend("cbc.co.simulador_costos.controller.DataDefault.LogisticCost.AdminIDLogisticCost", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cbc.co.simulador_costos.view.AdminIDLogisticCost
		 */
		onInit: function () {

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChAdminCL");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},
		onMyRoutePatternMatched: function (event) {
		
			this.getLogisticCostData();

		},
		getLogisticCostData: function () {
			var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/codigocostologisticoSet", {
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel();
					data.setProperty("/CodLogisticCost", oData.results);
					this.getOwnerComponent().setModel(data, "LogisticCost");
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});
		},
		showFormAddLC: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminLogisticCost.AddLogisticCost");
		},
		onAddLC: function (oEvent) {
			var oModel = this.getView().getModel("ModelSimulador"),
				oModelLocal = this.getView().getModel("LogisticCost"),
				data = oModelLocal.getProperty("/");

			//Crea el CL
			oModel.create("/codigocostologisticoSet", {
				CatCosLo: data.CatCosLo,
				TxtMd: data.TxtMd
			}, {
				success: function (oData, oResponse) {
					//MessageToast.show(oData.Vbeln);
					this.getLogisticCostData();
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this)
			});
			
			this.fnCloseFragment(oEvent);
		},
		onDeleteLC: function(oEvent){
			var oModel = this.getView().getModel("ModelSimulador"),
				oRow = oEvent.getParameter("row");
			
			oModel.remove("/codigocostologisticoSet('"+oRow.getCells()[0].getText()+"')", {
				success: function (oData, oResponse) {
					//MessageToast.show(oData.Vbeln);
					this.getLogisticCostData();
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this)
			});
		},
		onEditLC: function(){
			
		}
	});

});