sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("cbc.co.simulador_costos.controller.Escenarios.MatrizEsc", {
		onInit: function () {
			this._createViewModel();
			this._oList = this.byId("tblScenarios");
			this.getRouter().getRoute("rtChMatrizEs").attachPatternMatched(this._onRouteMatched, this);
		},
		onAddScene: function (oEvent) {
			this.getRouter().navTo("rtChMatrizEsNew");
		},
		onUpdateFinished: function (oEvent) {
			var iTotal = oEvent.getParameter("total");
			if (this._oList.getBinding("items").isLengthFinal()) {
				var sTitle = this.getResourceBundle().getText("titleTableCountScenarioView", [iTotal]);
				this.getModel("viewModel").setProperty("/tableTitle", sTitle);
			}
		},
		onNavDetail: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContextPath(),
				oItem = this.getModel("ModelSimulador").getProperty(sPath);
			if(oItem){
				this.getRouter().navTo("rtChMatrizEsEdit", {id_escenario: oItem.yescenari}, false);
			}
		},
		_onRouteMatched: function (oEvent) {

		},
		_createViewModel: function () {
			var oViewModel = new JSONModel({
				delay: 0,
				tableTitle: this.getResourceBundle().getText("titleTableScenarioView")
			});
			this.setModel(oViewModel, "viewModel");
			return oViewModel;
		}
	});
});