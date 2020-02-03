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
						this[that._sMonth + "Desc"] = oSelectedVersion.Txtmd;
						this[that._sMonth + "Id"] = oSelectedVersion.Version;
						this[that._sMonth + "Year"] = oSelectedVersion.FiscYear;
						this[that._sMonth + "ValueState"] = "None";
					}
				}
			});
			oViewModel.refresh();
		},
		onSearchVersion: function (oEvent) {

		},
		onValidateScene: function (oEvent) {
			if (!this._validateRequiredInputs()) {
				var oObject = this._getMatrizObject();
				this.getModel("ModelSimulador").create("/escenarioCabSet", oObject, {
					success: function(oData, oResponse){
						
					},
					error: function(oError){
						
					}
				});
			}
			
		},
		_onRouteMatched: function (oEvent) {
			this._createViewModel();
			this._oTableMatrix.bindColumns({
				path: "/columns",
				model: "viewModel",
				factory: jQuery.proxy(Factory.factoryColumnsScenes, this)
			});
		},
		_getMatrizObject: function () {
			var oViewModel = this.getModel("viewModel"),
				aScenarios = [];
			for (var i = 0; i < oViewModel.getProperty("/rows").length; i++) {
				var oItem = {};
				oItem.yescenari = oViewModel.getProperty("/scenarioName");
				oItem.ytipoescn = oViewModel.getProperty("/scenarioType");
				oItem.ymodulo = oViewModel.getProperty("/rows/" + i + "/tipoVersion");
				oItem.yestado = "";
				oItem.yfiscyear = new Date().getFullYear().toString();
				for (var j = 1; j <= 12; j++) {
					var sMonth = j < 10 ? "0" + j.toString() : j.toString();
					oItem["yvmes" + sMonth] = oViewModel.getProperty("/rows/" + i + "/" + sMonth + "Id");
				}
				aScenarios.push(oItem);
			}
			return {
				yescenari: oViewModel.getProperty("/scenarioName"),
				Descripcion: oViewModel.getProperty("/scenarioDesc"),
				Escenarios: aScenarios
			};
		},
		_validateRequiredInputs: function () {
			var oErrors = [],
				oViewModel = this.getModel("viewModel");
			oViewModel.setProperty("/scenarioType", this.getView().byId("slcScenarioType").getSelectedKey());
			if (!oViewModel.getProperty("/scenarioName")) {
				oErrors.push(this.getResourceBundle().getText("errMissNameScenarioView"));
			}
			if (!oViewModel.getProperty("/scenarioType")) {
				oErrors.push(this.getResourceBundle().getText("errMissTypeScenarioView"));
			}
			var bErrorsTable = false;
			for (var i = 0; i < oViewModel.getProperty("/rows").length; i++) {
				for (var j = 1; j <= 12; j++) {
					var sMonth = j < 10 ? "0" + j.toString() : j.toString();
					if (!oViewModel.getProperty("/rows/" + i + "/" + sMonth) || !oViewModel.getProperty("/rows/" + i + "/" + sMonth + "Id")) {
						oViewModel.setProperty("/rows/" + i + "/" + sMonth + "ValueState", "Error");
						bErrorsTable = true;
					} else {
						oViewModel.setProperty("/rows/" + i + "/" + sMonth + "ValueState", "None");
					}
				}
			}
			if (bErrorsTable) {
				oErrors.push(this.getResourceBundle().getText("errMissMonthVersionScenarioView"));
			}
			if (oErrors.length > 0) {
				this.showGeneralError({
					message: this.getResourceBundle().getText("errMissSummary") + "\n - " + oErrors.join("\n - ")
				});
				return false;
			}
			return true;
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
				rows: this.getModel("Escenarios").getProperty("/Matriz"),
				title: this.getResourceBundle().getText("titleCreateScenarioView"),
				busy: false,
				scenarioName: "",
				scenarioDesc: "",
				scenarioType: ""
			});
			this.setModel(oModel, "viewModel");
			return oModel;
		}
	});
});