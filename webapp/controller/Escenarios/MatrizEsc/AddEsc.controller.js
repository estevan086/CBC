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
			this.getRouter().getRoute("rtChMatrizEsEdit").attachPatternMatched(this._onRouteMatchedView, this);
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
			var oModel = this.getModel("viewModel");
			if (this._validateRequiredInputs()) {
				oModel.setProperty("/busy", true);
				var oObject = this._getMatrizObject();
				this.getModel("ModelSimulador").create("/escenarioCabSet", oObject, {
					success: function (oData, oResponse) {
						sap.m.MessageBox.success("Se creó exitosamente el escenario", {
							onClose: jQuery.proxy(this.onNavBack, this)
						});
						oModel.setProperty("/busy", false);
					}.bind(this),
					error: function (oError) {
						this.showGeneralError({
							oDataError: oError
						});
						oModel.setProperty("/busy", false);
					}.bind(this)
				});
			}
		},
		onSelectExchangeRate: function (oEvent) {
			var iIndex = oEvent.getParameter("selectedIndex"),
				sExchangeRate;
			if (iIndex === 0) {
				sExchangeRate = "M";
			} else {
				sExchangeRate = "P";
			}
			this._bindItemsYear(sExchangeRate);
		},
		_onRouteMatched: function (oEvent) {
			this._onBindInitialView();
			var oModel = this.getModel("viewModel");
			oModel.setProperty("/viewMode", "C");
			oModel.setProperty("/modeEdit", true);
		},
		_onRouteMatchedView: function (oEvent) {
			this._onBindInitialView();
			var oModel = this.getModel("viewModel");
			oModel.setProperty("/busy", true);
			oModel.setProperty("/viewMode", "V");
			oModel.setProperty("/modeEdit", false);
			var sIdEscenario = oEvent.getParameter("arguments").id_escenario;
			this.getModel("ModelSimulador").metadataLoaded().then(function () {
				var sObjectPath = this.getModel("ModelSimulador").createKey("escenarioCabSet", {
					yescenari: sIdEscenario
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},
		_onBindInitialView: function () {
			this._createViewModel();
			this._oTableMatrix.bindColumns({
				path: "/columns",
				model: "viewModel",
				factory: jQuery.proxy(Factory.factoryColumnsScenes, this)
			});
			this._bindItemsYear("M");
		},
		_bindView: function (sPath) {
			var oModel = this.getModel("viewModel");
			this.getModel("ModelSimulador").read(sPath, {
				urlParameters: {
					"$expand": "Escenarios"
				},
				success: jQuery.proxy(this._setValuesPage, this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					oModel.setProperty("/busy", false);
				}.bind(this)
			});
		},
		_bindItemsYear: function (sExchangeRate) {
			var oAnnoExchangeRate = this.byId("cmbAnnoExchangeRate");
			var aFilter = [new Filter(
				"Kurst",
				FilterOperator.EQ,
				sExchangeRate
			)];
			var oTemplate = new sap.ui.core.Item({
				key: "{ModelSimulador>Fiscyear}",
				text: "{ModelSimulador>Fiscyear}"
			});
			oAnnoExchangeRate.bindItems({
				path: "/annoTipoCambioSet",
				model: "ModelSimulador",
				template: oTemplate,
				filters: aFilter
			});
		},
		_getMatrizObject: function () {
			var oViewModel = this.getModel("viewModel"),
				aScenarios = [],
				sExchangeRate;
			/*if (oViewModel.getProperty("/indexExchangeRateOption") === 0) {
				sExchangeRate = "M";
			} else {
				sExchangeRate = "P";
			}*/
			for (var i = 0; i < oViewModel.getProperty("/rows").length; i++) {
				var oItem = {};
				oItem.Nombre = oViewModel.getProperty("/scenarioName");
				oItem.ytipoescn = oViewModel.getProperty("/scenarioType");
				oItem.ymodulo = oViewModel.getProperty("/rows/" + i + "/tipoVersion");
				oItem.yestado = "";
				oItem.yfiscyear = oViewModel.getProperty("/year");
				oItem.ytipcamb = sExchangeRate;
				for (var j = 1; j <= 12; j++) {
					var sMonth = j < 10 ? "0" + j.toString() : j.toString();
					if (oViewModel.getProperty("/rows/" + i + "/tipoVersion") !== "TC") {
						oItem["yvmes" + sMonth] = oViewModel.getProperty("/rows/" + i + "/" + sMonth + "Id");
					} else {
						oItem["yvmes" + sMonth] = oViewModel.getProperty("/rows/" + i + "/" + sMonth + "TC");
					}
				}
				aScenarios.push(oItem);
			}
			return {
				Descripcion: oViewModel.getProperty("/scenarioDesc"),
				Escenarios: aScenarios
			};
		},
		_validateRequiredInputs: function () {
			var oErrors = [],
				oViewModel = this.getModel("viewModel");
			oViewModel.setProperty("/scenarioType", this.getView().byId("slcScenarioType").getSelectedKey());
			oViewModel.setProperty("/year", this.getView().byId("cmbAnnoExchangeRate").getSelectedKey());
			if (!oViewModel.getProperty("/scenarioName")) {
				oErrors.push(this.getResourceBundle().getText("errMissNameScenarioView"));
			}
			if (!oViewModel.getProperty("/scenarioType")) {
				oErrors.push(this.getResourceBundle().getText("errMissTypeScenarioView"));
			}
			if (!oViewModel.getProperty("/year")) {
				oErrors.push(this.getResourceBundle().getText("errMissYearScenarioView"));
			}
			var bErrorsTable = false;
			for (var i = 0; i < oViewModel.getProperty("/rows").length; i++) {
				for (var j = 1; j <= 12; j++) {
					var sMonth = j < 10 ? "0" + j.toString() : j.toString();
					if (oViewModel.getProperty("/rows/" + i + "/tipoVersion") !== "TC") {
						if (!oViewModel.getProperty("/rows/" + i + "/" + sMonth) || !oViewModel.getProperty("/rows/" + i + "/" + sMonth + "Id")) {
							oViewModel.setProperty("/rows/" + i + "/" + sMonth + "ValueState", "Error");
							bErrorsTable = true;
						} else {
							oViewModel.setProperty("/rows/" + i + "/" + sMonth + "ValueState", "None");
						}
					} else {
						if (!oViewModel.getProperty("/rows/" + i + "/" + sMonth + "TC")) {
							oViewModel.setProperty("/rows/" + i + "/" + sMonth + "ValueState", "Error");
							bErrorsTable = true;
						} else {
							oViewModel.setProperty("/rows/" + i + "/" + sMonth + "ValueState", "None");
						}
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
			} else {
				return true;
			}
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
				description: "{ModelSimulador>TipoVersionVolumen} {ModelSimulador>Txtmd}",
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
		_setValuesPage: function (oData) {
			var oModel = this.getModel("viewModel");
			oModel.setProperty("/scenarioId", oData.yescenari);
			oModel.setProperty("/scenarioName", oData.Nombre);
			oModel.setProperty("/scenarioDesc", oData.Descripcion);
			oModel.setProperty("/scenarioType", oData.ytipoescn);
			//oModel.setProperty("/indexExchangeRateOption", oData.ytipcamb === "M" ? 0 : 1);
			oModel.setProperty("/year", oData.yfiscyear);
			oModel.setProperty("/title", this.getResourceBundle().getText("titleViewScenarioView", [oData.Nombre]));
			if (oData && oData.Escenarios && oData.Escenarios.results)
				for (var i = 0; i < oData.Escenarios.results.length; i++) {
					var sModulo = oData.Escenarios.results[i].ymodulo;
					for (var j = 0; j < oModel.getProperty("/rows").length; j++) {
						if (oModel.getProperty("/rows")[j].tipoVersion === sModulo) {
							for (var k = 1; k <= 12; k++) {
								var sMonth = k < 10 ? "0" + k.toString() : k.toString();
								if (oModel.getProperty("/rows")[j].tipoVersion !== "TC") {
									oModel.setProperty("/rows/" + j + "/" + sMonth, oData.Escenarios.results[i]["yvmes" + sMonth + "Name"]);
									oModel.setProperty("/rows/" + j + "/" + sMonth + "Id", oData.Escenarios.results[i]["yvmes" + sMonth]);
								} else {
									oModel.setProperty("/rows/" + j + "/" + sMonth + "TC", oData.Escenarios.results[i]["yvmes" + sMonth]);
								}
							}

						}
					}
				}
			oModel.setProperty("/busy", false);
		},
		_createViewModel: function () {
			var aRows = [{
				"modulo": "Materiales",
				"tipoVersion": "MAT",
				"visibleInput": true,
				"visibleCombo": false
			}, {
				"modulo": "Costos Logísticos",
				"tipoVersion": "LOG",
				"visibleInput": true,
				"visibleCombo": false
			}, {
				"modulo": "Volúmenes",
				"tipoVersion": "VOL",
				"visibleInput": true,
				"visibleCombo": false
			}, {
				"modulo": "Tipo de cambio",
				"tipoVersion": "TC",
				"visibleInput": false,
				"visibleCombo": true
			}];
			var oModel = new JSONModel({
				columns: this.getModel("Escenarios").getProperty("/Meses"),
				rows: aRows,
				title: this.getResourceBundle().getText("titleCreateScenarioView"),
				busy: false,
				scenarioId: "",
				scenarioName: "",
				scenarioDesc: "",
				scenarioType: "",
				year: "",
				modeEdit: false,
				viewMode: "C"
			});
			this.setModel(oModel, "viewModel");
			return oModel;
		}
	});
});