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

			var oModelV = new JSONModel({
				busy: true,
				Bezei: ""
			});
			this.setModel(oModelV, "modelView");

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

			this.getModel("modelView").setProperty("/busy", true);

			oModel.read("/costologisticoSet", {
				urlParameters: {
					$skip: 1,
					$top: 5
				},
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
			this.getModel("modelView").setProperty("/busy", true);

			oModel.read("/codigocostologisticoSet", {
				success: function (oData, response) {
					var data = this.getView().getModel("LogisticCost");
					data.setProperty("/CodLogisticCost", oData.results);
					this.tableCreate();
					this.getModel("modelView").setProperty("/busy", false);
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
				label: "A\u00F1o",
				enabled: false
			}, {
				columnName: "Fiscvarnt",
				label: "Mes",
				enabled: false
			}, {
				columnName: "Fiscper3",
				label: "Fiscper3",
				enabled: false,
				visible: false
			}, {
				columnName: "CompCode",
				label: "Sociedad",
				enabled: false,
				visible: false
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
				label: "Cant Estandar",
				enabled: true
			}];
			//agrega columnas dinamicas
			if (costData instanceof Array) {

				costData.forEach(function (oValue, i) {
					oValue.TxtMd = oValue.TxtMd.toLowerCase();
					_columnData.push({
						columnName: oValue.CostLog,
						label: oValue.TxtMd.charAt(0).toUpperCase() + oValue.TxtMd.slice(1),
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

			var oMaterial = [],
				modelStructure = {};
			
			//agrega propiedades(columnas) a json
			costData.forEach(function (oValue2, j) {
				modelStructure[oValue2.CostLog] = "";
			});
			
			//Convierte estructura de tabla, asignando valores de filas en columnas relacionadas por la clave de la tabla Material
			costValoration.forEach(function (oValue, i) {

				if ( oMaterial.find(x => x.Material === oValue.Material) === undefined || oMaterial.find(x => x.Plant === oValue.Plant) === undefined ||
					 oMaterial.find(x => x.Fiscyear === oValue.Fiscyear) === undefined || oMaterial.find(x => x.Version === oValue.Version) === undefined ||
					 oMaterial.find(x => x.Fiscvarnt === oValue.Fiscvarnt) === undefined || oMaterial.find(x => x.Fiscper3 === oValue.Fiscper3) === undefined ||
					 oMaterial.find(x => x.CompCode === oValue.CompCode) === undefined ) {

					modelStructure = oValue; //asigna datos generales

					modelStructure.CantEst = oValue.CantEst;
					modelStructure.CostTotal = oValue.CostTotal;
					modelStructure.CostUnid = oValue.CostUnid;

					for (var j = 0; j < costValoration.length; j++) {

						if (costValoration[j].Material === costValoration[i].Material && costValoration[j].Plant === costValoration[i].Plant &&
							costValoration[j].Fiscyear === costValoration[i].Fiscyear && costValoration[j].Version === costValoration[i].Version &&
							costValoration[j].Fiscvarnt === costValoration[i].Fiscvarnt && costValoration[j].Fiscper3 === costValoration[i].Fiscper3 &&
							costValoration[j].CompCode === costValoration[i].CompCode) {

							if (costValoration[j].CostLog !== "") {
								modelStructure[costValoration[j].CostLog] = costValoration[j].VCostLog;
							}
						}
					}

					oMaterial.push(modelStructure);
				}
			});

			oModel.setProperty("/LogisticCostValoration", oMaterial);
			//agregar columnas y datos a tabla
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
					visible: oContext.getObject().visible,
					filterProperty: oContext.getObject().enabled === false ? columnName : "",
					template: oContext.getObject().enabled === false ? new sap.m.Text(columnName, {
						text: "{" + columnName + "}",
						wrapping: false
					}) : new sap.m.Input(columnName, {
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

			this.getModel("modelView").setProperty("/busy", true);
			//Convertir columnas de costos logistico en filas para ser almacenadas
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
					if (oValue.CantEst !== "") {
						modelStructure.CantEst = oValue.CantEst;
					}

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

		onDataExport: function () {

			var oModelLocal = this.getView().getModel("LogisticCost"),
				oModel = new sap.ui.model.json.JSONModel(oModelLocal.getProperty("/LogisticCostValoration")),
				columns = [];

			//recupera columnas creadas dinamicamente
			this.columnData.forEach(function (oValue, i) {
				columns.push({
					name: oValue.label,
					template: {
						content: {
							path: oValue.columnName
						}
					}
				});
			});

			this.cvsDataExport(oModel, columns);

		},
		onImportCvsFile: function (oEvent) {

			var that = this,
				oFile = oEvent.getParameter("files")[0];

			this.getModel("modelView").setProperty("/busy", true);

			if (oFile && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function (evt) {
					var strCSV = evt.target.result,
						oClValues = {},
						oImportData = that.csv_to_Json(strCSV, ";"),
						oLogistiCost = [],
						oLogistiCostLine = {};

					oImportData.forEach(function (oValue, i) {
						oLogistiCostLine = {};
						that.columnData.forEach(function (oColumn, j) {
							oClValues = Object.values(oImportData[i]);
							oLogistiCostLine[oColumn.columnName] = that.isInitialNum(oClValues[j]) === "" ? "" : oClValues[j];
						});
						oLogistiCost.push(oLogistiCostLine);
					});
					//Actualiza modelo
					that.getView().getModel("LogisticCost").setProperty("/LogisticCostValoration", oLogistiCost);
					//Recrea Tabla
					that.tableCreate();
					that.getModel("modelView").setProperty("/busy", false);
				};
				reader.readAsText(oFile);
			}

		}
	});

});