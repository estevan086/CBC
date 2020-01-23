jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (BaseController, JSONModel, MessageToast, Filter, Export, ExportTypeCSV) {
	"use strict";
	
	jQuery.sap.require("sap.ui.core.util.Export");
	jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");

	return BaseController.extend("cbc.co.simulador_costos.controller.DataDefault.LogisticCost.GridLogisticCost", {

		onInit: function () {

			var oUploader = this.getView().byId("fileUploader");
			oUploader.oBrowse.setText("Importar");
			oUploader.oFilePath.setVisible(false);
			oUploader.addEventDelegate({
				onAfterRendering: function () {
					this.setFileType(['csv']);
				}
			}, oUploader);

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
			var _columnData = [{
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
				enabled: true
			}];
			//agrega columnas dinamicas
			if (costData instanceof Array) {

				costData.forEach(function (oValue, i) {
					_columnData.push({
						columnName: oValue.CostLog,
						label: oValue.TxtMd,
						enabled: true
					});

				});
			}

			_columnData.push({
				columnName: "CostTotal",
				label: "Total Costo",
				enabled: false
			}, {
				columnName: "CostUnid",
				label: "Costo Und",
				enabled: false
			});
			//guardamos las columnas
			this.columnData = _columnData;

			var material = "";
			var oMaterial = [],
				modelStructure;
			//guardamos la estructura de la tabla inicial
			this.initModelStructure = modelStructure = costValoration[1];

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
					modelStructure[oValue.CostLog] = oValue.VCostLog;
				}
				material = oValue.Material;
			});

			oModel.setProperty("/LogisticCostValoration", oMaterial);

			var oTable = this.getView().byId("tblLogicCost");
			var oTableModel = new sap.ui.model.json.JSONModel();

			oTableModel.setData({
				rows: oModel.getProperty("/LogisticCostValoration"),
				columns: _columnData
			});

			oTable.setModel(oTableModel);

			oTable.bindColumns("/columns", function (sId, oContext) {
				var columnName = oContext.getObject().columnName;
				return new sap.ui.table.Column({
					label: oContext.getObject().label,
					filterProperty: oContext.getObject().enabled === false ? columnName : "",
					template: oContext.getObject().enabled === false ? new sap.m.Text(columnName, {
						text: "{" + columnName + "}",
						wrapping: false
					}) : new sap.m.Input(columnName, {
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
				costValorationTable = oModelLocal.getProperty("/LogisticCostValoration"),
				costData = oModelLocal.getProperty("/CodLogisticCost"),
				modelStructure = {},
				data = [];

			costValorationTable.forEach(function (oValue, i) {

				costData.forEach(function (oLogisticCost, j) {

					modelStructure = {};

					modelStructure.Material = oValue.Material;
					modelStructure.Plant = oValue.Plant;
					modelStructure.Fiscyear = oValue.Fiscyear;
					modelStructure.Fiscvarnt = oValue.Fiscvarnt;
					modelStructure.Fiscper3 = oValue.Fiscper3;
					modelStructure.CompCode = oValue.CompCode;
					modelStructure.CostLog = oLogisticCost.CostLog;
					modelStructure.CantEst = oValue.CantEst;

					if (oValue[oLogisticCost.CostLog]) {
						modelStructure.VCostLog = oValue[oLogisticCost.CostLog];
					}

					data.push(modelStructure);
				});
			});
			var oCstosLogisticos = costData[1];
			oCstosLogisticos.costoslogisticos = data;
			//Crea el vercion costo logistico
			oModel.create("/codigocostologisticoSet", oCstosLogisticos, {
				success: function (oData, oResponse) {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
					this.getLogisticCostValoration();
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
		},

		onDataExport: sap.ui.table.Table || function () {

			jQuery.sap.require("sap.ui.core.util.Export");
			jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
			/*var oTable = this.getView().byId("tblLogicCost");
			oTable.exportData({
					exportType: new sap.ui.core.util.ExportTypeCSV()
				})
				.saveFile()
				.always(function () {
					this.destroy();
				});*/

			var oModelLocal = this.getView().getModel("LogisticCost"),
				oModel = oModelLocal.getProperty("/LogisticCostValoration"),
				_columns = [];

			this.columnData.forEach(function (oValue, i) {
				_columns.push({
					name: oValue.label,
					template: {
						content: {
							path: oValue.columnName
						}
					}
				});
			});

			var oExport = new Export({

				exportType: new ExportTypeCSV({
					fileExtension: "csv",
					separatorChar: ";"
				}),

				models: oModel,

				rows: {
					path: "/"
				},
				columns: _columns
			});

			oExport.saveFile().always(function () {
				this.destroy();
			});

			/*oExport.saveFile().catch(function (oError) {
				this.showGeneralError({
					oDataError: oError
				});
			}).then(function () {
				oExport.destroy();
			});*/
		},
		handleUpload: function (oEvent) {

			var that = this,
				oFile = oEvent.getParameter("files")[0],
				oImportData;

			if (oFile && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function (evt) {
					var strCSV = evt.target.result; //string in CSV 
					that.oImportData = that.csv_to_Json(strCSV);
				};
				reader.readAsText(oFile);

			}
		}
	});

});