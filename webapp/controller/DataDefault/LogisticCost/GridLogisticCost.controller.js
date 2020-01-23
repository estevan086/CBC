jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function (BaseController, JSONModel, MessageToast, Filter) {
	"use strict";

	return BaseController.extend("cbc.co.simulador_costos.controller.DataDefault.LogisticCost.GridLogisticCost", {

		onInit: function () {
			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChCostosLogisticos");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},
		onMyRoutePatternMatched: function (event) {
			//Cargar datos
			this.getLogisticCostValoration();

		},
		getLogisticCostValoration: function () {
			var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/costologisticoSet", {
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel({
						LogisticCostValoration: oData.results
					});

					this.getOwnerComponent().setModel(data, "LogisticCost");
					this.getLogisticCostData();
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});
		},
		getLogisticCostData: function () {
			var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/codigocostologisticoSet", {
				success: function (oData, response) {
					var data = this.getView().getModel("LogisticCost");
					data.setProperty("/CodLogisticCost", oData.results);
					this.tableCreate();
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});
		},
		tableCreate: function () {
			var oModel = this.getView().getModel("LogisticCost"),
				costData = oModel.getProperty("/CodLogisticCost"),
				costValoration = oModel.getProperty("/LogisticCostValoration");
			//Crear columnas dinamicas
			var columnData = [{
				columnName: "Material",
				label: "Id Material",
				enabled: false
			}, {
				columnName: "TxtMd",
				label: "Material",
				enabled: false
			}, {
				columnName: "Plant",
				label: "Centro",
				enabled: false
			}, {
				columnName: "Fiscyear",
				label: "Año",
				enabled: false
			}, {
				columnName: "Fiscvarnt",
				label: "Mes",
				enabled: false
			}, {
				columnName: "Incoterms",
				label: "Incoterms",
				enabled: false
			}, {
				columnName: "BaseUom",
				label: "UMD",
				enabled: false
			}, {
				columnName: "Currency",
				label: "Moneda",
				enabled: false
			}, {
				columnName: "CantEst",
				label: "Cnt. Estandar",
				enabled: false
			}];
			//agrega columnas dinamicas
			if (costData instanceof Array) {

				costData.forEach(function (oValue, i) {
					columnData.push({
						columnName: oValue.CostLog,
						label: oValue.TxtMd,
						enabled: true
					});

				});
			}

			columnData.push({
				columnName: "T",
				label: "Total Costo",
				enabled: false
			}, {
				columnName: "U",
				label: "Costo Und",
				enabled: false
			});

			var material = "";
			var oMaterial = [],
				modelStructure = costValoration[1];

			//agrega propiedades(columnas) al json
			costData.forEach(function (oValue2, j) {
				modelStructure[oValue2.CostLog] = "";
			});

			costValoration.forEach(function (oValue, i) {

				if (material !== oValue.Material) {
					modelStructure = oValue;
					oMaterial.push(modelStructure);
				}
				if (oValue.CostLog !== "") {
					modelStructure[oValue.CostLog] = oValue.CantEst;
				}
				material = oValue.Material;
			});

			oModel.setProperty("/LogisticCostValoration", oMaterial);

			var oTable = this.getView().byId("tblLogicCost");
			var oTableModel = new sap.ui.model.json.JSONModel();

			oTableModel.setData({
				rows: oModel.getProperty("/LogisticCostValoration"),
				columns: columnData
			});

			oTable.setModel(oTableModel);

			oTable.bindColumns("/columns", function (sId, oContext) {
				var columnName = oContext.getObject().columnName;
				return new sap.ui.table.Column({
					label: oContext.getObject().label,
					template: new sap.m.Input(columnName, {
						key: "text",
						value: "{" + columnName + "}",
						enabled: oContext.getObject().enabled
					})
				});
			});

			oTable.bindRows("/rows");

		},
		saveLogisticCostVersion: function () {
			var oModel = this.getView().getModel("ModelSimulador"),
				oModelLocal = this.getView().getModel("LogisticCost"),
				data = oModelLocal.getProperty("/LogisticCostValoration");

			//Crea el CL
			oModel.create("/costologisticoSet", data, {
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
		onGotoadminlc: function (oEvent) {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("rtChAdminCL");
		},
		onGotoaddmaterial: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminLogisticCost.AddMaterialLogisticCost");
		}
	});

});