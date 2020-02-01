sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"cbc/co/simulador_costos/util/Factory",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Factory, Filter, FilterOperator) {
	"use strict";
	return Controller.extend("cbc.co.simulador_costos.controller.Escenarios.MatrizEsc.AddEsc", {
		onInit: function () {
			this._oTableMatrix = this.byId("tblMatrixScene");
			this.getRouter().getRoute("rtChMatrizEsNew").attachPatternMatched(this._onRouteMatched, this);
		},
		onConfirmVersion: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var oViewModel = this.getModel("viewModel");
			var that = this;
			$.each(oViewModel.getProperty("/rows"), function () {
				if (this.tipoVersion === that._sModule) {
					if (oSelectedItem) {
						var oSelectedVersion = that.getModel("ModelSimulador").getProperty(oSelectedItem.getBindingContextPath());
						this[that._sMonth] = oSelectedVersion.Nombre;
					}
				}
			});
			oViewModel.refresh();
		},
		onSearchVersion: function (oEvent) {

		},
		_onRouteMatched: function (oEvent) {
			this._createViewModel();
			this._oTableMatrix.bindColumns({
				path: "/columns",
				model: "viewModel",
				factory: jQuery.proxy(Factory.factoryColumnsScenes, this)
			});
		},
		_createSelectDialogOriginVersion: function (sModule, sMonth) {
			var oSelectDialog = this._oSelectDialog;
			if (!this._oSelectDialog) {
				oSelectDialog = new sap.m.SelectDialog(this.getView().createId("SelectDialogVersion"), {
					noDataText: this.getResourceBundle().getText("notVersionsFoundVersionFragment"),
					title: this.getResourceBundle().getText("selectTitleVersionFragment"),
					confirm: jQuery.proxy(this.onConfirmVersion, this),
					cancel: jQuery.proxy(this.onConfirmVersion, this),
					search: jQuery.proxy(this.onSearchVersion, this)
				});
				this.getView().addDependent(oSelectDialog);
			}
			this._sModule = sModule;
			this._sMonth = sMonth;
			var oTemplate = new sap.m.StandardListItem({
				title: "{ModelSimulador>Nombre}",
				description: "{ModelSimulador>Txtmd}",
				info: "{ModelSimulador>FiscYear}",
				type: "Active"
			});
			var aFilter = [new Filter(
				"Modulo",
				FilterOperator.EQ,
				sModule
			)];
			oSelectDialog.bindAggregation("items", {
				path: "/versionSet",
				model: "ModelSimulador",
				template: oTemplate,
				filters: aFilter
			});
			return oSelectDialog;
		},
		_createViewModel: function () {
			var oModel = new JSONModel({
				columns: this.getModel("Escenarios").getProperty("/Meses"),
				rows: this.getModel("Escenarios").getProperty("/Matriz")
			});
			this.setModel(oModel, "viewModel");
			return oModel;
		}
	});
});