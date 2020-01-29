jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType",
	"cbc/co/simulador_costos/controller/Versiones/SelectVersion"
], function (BaseController, JSONModel, MessageToast, Filter, FilterOperator, Message, MessageType, SelectVersion) {
	"use strict";
	const cDefaultNumValue = "0,000";
	var initialLoad = false;

	return BaseController.extend("cbc.co.simulador_costos.controller.DataDefault.LogisticCost.GridLogisticCost", {
		SelectVersion: SelectVersion,
		onInit: function () {

			this.initMessageManager();

			var oModelV = new JSONModel({
				busy: false,
				version: false
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

			if (this.getRouter().getRoute("rtChCostosLogisticos")) {
				this.getRouter().getRoute("rtChCostosLogisticos").attachPatternMatched(this.onMyRoutePatternMatched, this);
			}
			if (this.getRouter().getRoute("rtChCostosLogisticosVersion")) {
				this.getRouter().getRoute("rtChCostosLogisticosVersion").attachPatternMatched(this.onMyRoutePatternMatchedVersion, this);
			}
			SelectVersion.init(this, "LOG");
		},
		onMyRoutePatternMatched: function (event) {
			//Cargar datos
			if (initialLoad === false) {
				initialLoad = true;
				this.getLogisticCostValoration();
			}
			var oVModel = this.getModel("modelView");
			oVModel.version = event.getParameter("arguments").version;
			this.getView().byId("btnAdmin").setVisible(true);
		},
		onMyRoutePatternMatchedVersion: function (oEvent) {
			SelectVersion.open();
			this.getView().byId("btnAdmin").setVisible(false);
		},
		onCreateVersion: function(){
			SelectVersion.close();
			//console.log(this.getModel("versionModel").getProperty("/version"));	
		},
		onEditVersion: function(){
			SelectVersion.close();
			//console.log(this.getModel("versionModel").getProperty("/version"));
		},
		getLogisticCostValoration: function (oFilter, pExport) {
			var oModel = this.getView().getModel("ModelSimulador"),
				that = this,
				top = (oFilter || pExport) ? 0 : 500;

			this.getModel("modelView").setProperty("/busy", true);
			this.pExport = pExport;

			oModel.read("/costologisticoSet", {
				urlParameters: {
					$skip: 0,
					$top: top
				},
				filters: oFilter,
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel({
						LogisticCostValoration: oData.results
					});
					if (this.pExport === undefined) {
						this.getOwnerComponent().setModel(data, "LogisticCost");
						this.getLogisticCostData();
					} else {
						this.setModel(data, "DataExport");
						this.onDataExport(undefined, true);
						this.getModel("modelView").setProperty("/busy", false);
					}
				}.bind(this),
				error: function (oError) {
					that.getModel("modelView").setProperty("/busy", false);
					that.showGeneralError({
						oDataError: oError
					});
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
		tableCreate: function (pBuildColums = true) {
			var oModel = this.getView().getModel("LogisticCost"),
				costData = oModel.getProperty("/CodLogisticCost"),
				costValoration = oModel.getProperty("/LogisticCostValoration"),
				oMaterial = [],
				modelStructure = {};

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
				columnName: "Fiscper3",
				label: "Periodo",
				enabled: false,
				visible: true
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

			if (pBuildColums === true) {
				//agrega propiedades(columnas) a json
				costData.forEach(function (oValue2, j) {
					modelStructure[oValue2.CostLog] = "";
				});

				//Convierte estructura de tabla, asignando valores de filas en columnas relacionadas por la clave de la tabla Material
				costValoration.forEach(function (oValue, i) {

					if (oMaterial.find(x => x.Material === oValue.Material) === undefined || oMaterial.find(x => x.Plant === oValue.Plant) ===
						undefined ||
						oMaterial.find(x => x.Fiscyear === oValue.Fiscyear) === undefined || oMaterial.find(x => x.Version === oValue.Version) ===
						undefined ||
						oMaterial.find(x => x.Fiscper3 === oValue.Fiscper3) === undefined ||
						oMaterial.find(x => x.CompCode === oValue.CompCode) === undefined) {

						modelStructure = oValue; //asigna datos generales

						modelStructure.CantEst = oValue.CantEst.toString().replace(".", ",");
						modelStructure.CostTotal = oValue.CostTotal.toString().replace(".", ",");
						modelStructure.CostUnid = oValue.CostUnid.toString().replace(".", ",");

						for (var j = 0; j < costValoration.length; j++) {

							if (costValoration[j].Material === costValoration[i].Material && costValoration[j].Plant === costValoration[i].Plant &&
								costValoration[j].Fiscyear === costValoration[i].Fiscyear && costValoration[j].Version === costValoration[i].Version &&
								costValoration[j].Fiscper3 === costValoration[i].Fiscper3 &&
								costValoration[j].CompCode === costValoration[i].CompCode) {

								if (costValoration[j].CostLog !== "") {
									modelStructure[costValoration[j].CostLog] = costValoration[j].VCostLog !== undefined ? costValoration[j].VCostLog.toString()
										.replace(".", ",") : cDefaultNumValue;
								}
							}
						}

						oMaterial.push(modelStructure);
					}
				});

				oModel.setProperty("/LogisticCostValoration", oMaterial);
			}
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
					width: "11rem",
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
			this.getView().byId("sfMaterial").setValue("");
			//Convertir columnas de costos logistico en filas para ser almacenadas
			costValorationTable.forEach(function (oValue, i) {

				costData.forEach(function (oLogisticCost, j) {

					modelStructure = {};

					modelStructure.Material = oValue.Material;
					modelStructure.Plant = oValue.Plant;
					modelStructure.Fiscyear = oValue.Fiscyear;
					modelStructure.Fiscper3 = oValue.Fiscper3;
					modelStructure.CompCode = oValue.CompCode;
					modelStructure.CostLog = oLogisticCost.CostLog;
					if (oValue.CantEst !== "") {
						modelStructure.CantEst = oValue.CantEst.toString().replace(",", ".");
					}

					if (oValue[oLogisticCost.CostLog]) {
						modelStructure.VCostLog = oValue[oLogisticCost.CostLog].toString().replace(",", ".");
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

		onDataExport: function (oEvent, pExport) {

			var oModelLocal = this.getView().getModel("DataExport");

			if (pExport) {
				var oModel = new sap.ui.model.json.JSONModel(oModelLocal.getProperty("/LogisticCostValoration")),
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
				this.getView().getModel("DataExport").setProperty("/LogisticCostValoration", []);
			} else {
				this.getLogisticCostValoration(undefined, true);
			}

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
							//asignar valor del costo
							oLogistiCostLine[oColumn.columnName] = that.isInitialNum(oClValues[j]) !== undefined ? oClValues[j].toString().replace(".",
								",") : cDefaultNumValue;
						});
						oLogistiCost.push(oLogistiCostLine);
					});
					//Actualiza modelo
					that.getView().getModel("LogisticCost").setProperty("/LogisticCostValoration", oLogistiCost);
					//Recrea Tabla
					that.tableCreate(false);
					that.getModel("modelView").setProperty("/busy", false);
				};
				reader.readAsText(oFile);
			}

		},
		onFilterLogisticCost: function (oEvent) {
			var aFilter = [];

			if (this.getView().byId("inpMaterial").getValue() !== "") {
				aFilter.push(new Filter("Material", FilterOperator.Contains, this.getView().byId("inpMaterial").getValue()));
			}
			if (this.getView().byId("cmbPlant").getSelectedKey() !== "") {
				aFilter.push(new Filter("Plant", FilterOperator.EQ, this.getView().byId("cmbPlant").getSelectedKey()));
			}
			if (this.getView().byId("cmbYear").getSelectedKey() !== "") {
				aFilter.push(new Filter("Fiscyear", FilterOperator.EQ, this.getView().byId("cmbYear").getSelectedKey()));
			}
			aFilter.push(new Filter("CostTotal", FilterOperator.EQ, "0.000"));

			// Create a filter which contains our name and 'publ' filter
			this.getLogisticCostValoration(aFilter);

		}
	});

});