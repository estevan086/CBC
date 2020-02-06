/* global JSZip:true */
/* global LZString:true */
/* global pako:true */

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
	const cDefaultNumValue = "0,000",
		cDefaultVersion = "DEFAULT";
	var initialLoad = false,
		version = "";

	return BaseController.extend("cbc.co.simulador_costos.controller.DataDefault.LogisticCost.GridLogisticCost", {
		SelectVersion: SelectVersion,
		onInit: function () {

			this.initMessageManager();

			var oModelV = new JSONModel({
				busy: false,
				title: ""
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
		},
		onMyRoutePatternMatched: function (event) {
			var aFilter = [];

			version = cDefaultVersion;
			this.getModel("modelView").setProperty("/title", (this.getView().getModel("i18n").getResourceBundle().getText("CostosLogisticos") +
				": " + cDefaultVersion).toString());
			//Cargar datos
			if (initialLoad === false) {
				initialLoad = true;
				aFilter.push(new Filter("Version", FilterOperator.EQ, cDefaultVersion));
				this.getLogisticCostValoration(aFilter);
			}

			this.getView().byId("btnAdmin").setVisible(true);
		},
		onMyRoutePatternMatchedVersion: function (oEvent) {
			SelectVersion.init(this, "LOG");
			SelectVersion.open();
			this.getView().byId("btnAdmin").setVisible(false);
		},
		onShowVersion: function (oData) {
			var aFilter = [];
			version = oData.idVersion;
			this.getModel("modelView").setProperty("/title", (this.getView().getModel("i18n").getResourceBundle().getText("CostosLogisticos") +
				": " + oData.nameVersion).toString());
			aFilter.push(new Filter("Version", FilterOperator.EQ, version));
			if (oData.year !== "") {
				aFilter.push(new Filter("Fiscyear", FilterOperator.EQ, oData.year));
			}
			this.getLogisticCostValoration(aFilter);
		},
		getLogisticCostValoration: function (oFilter, pExport) {
			var oModel = this.getView().getModel("ModelSimulador"),
				that = this,
				top = (oFilter || pExport) ? 0 : 2000;

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
				enabled: true
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
					}) : (columnName === "Currency" ? new sap.m.ComboBox(columnName, {
						items: {
							path: "ModelSimulador>/monedaMaterialSet",
							templateShareable: false,
							template: new sap.ui.core.ListItem({
								key: "{ModelSimulador>Waers}",
								text: "{ModelSimulador>Waers}",
								additionalText: "{ModelSimulador>Ktext}"
							})
						},
						showSecondaryValues: true,
						selectedKey: "{Currency}"
					}) : new sap.m.Input(columnName, {
						value: "{" + columnName + "}",
						enabled: oContext.getObject().enabled
					}))

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
				that = this,
				data = [];

			this.clearFilterFields();
			//Convertir columnas de costos logistico en filas para ser almacenadas
			costValorationTable.forEach(function (oValue, i) {

				costData.forEach(function (oLogisticCost, j) {

					modelStructure = {};

					modelStructure.Material = oValue.Material;
					modelStructure.Plant = oValue.Plant;
					modelStructure.Fiscyear = oValue.Fiscyear;
					modelStructure.Fiscper3 = oValue.Fiscper3;
					modelStructure.CompCode = oValue.CompCode;
					modelStructure.Currency = oValue.Currency;
					modelStructure.CostLog = oLogisticCost.CostLog;
					modelStructure.Version = version;
					if (oValue.CantEst !== "") {
						modelStructure.CantEst = oValue.CantEst.toString().replace(",", ".");
					}

					if (oValue[oLogisticCost.CostLog]) {
						modelStructure.VCostLog = oValue[oLogisticCost.CostLog].toString().replace(",", ".");
					}

					data.push(modelStructure);
				});
			});
			var oCstosLogisticos = costData[0];
			oCstosLogisticos.costoslogisticos = []; //data;
			var str = JSON.stringify(data); //this.lzw_encode( JSON.stringify(data) );
			var data_s = ("Hola Mundo");
		
			var resultAsUint8Array = pako.deflate(data_s);
			var resultAsBinString = pako.deflate(data_s, {
				to: 'string'
			});
			var arrstr = resultAsUint8Array.join("");
			var compressedJSON = JSON.stringify(data); //LZString.compress(str);
			//var zip = new JSZip();

			compressedJSON = btoa(compressedJSON);
			//zip.file("json_data", compressedJSON);

			/*zip.generateAsync({
				type: "binarystring"
			}).then(function (content) {*/

			oCstosLogisticos.Base64 = arrstr;
			this.getModel("modelView").setProperty("/busy", true);
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

			//	});
			//}

		},
		convert: function (sData) {
			var output = "";

			for (var i = 0; i < sData.length; i++) {
				output += sData[i].charCodeAt(0).toString(2) + " ";
			}

			return output;
		},
		lzw_encode: function (s) {
			var dict = {};
			var data = (s + "").split("");
			var out = [];
			var currChar;
			var phrase = data[0];
			var code = 256;
			for (var i = 1; i < data.length; i++) {
				currChar = data[i];
				if (dict[phrase + currChar] != null) {
					phrase += currChar;
				} else {
					out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
					dict[phrase + currChar] = code;
					code++;
					phrase = currChar;
				}
			}
			out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
			for (var i = 0; i < out.length; i++) {
				out[i] = String.fromCharCode(out[i]);
			}
			return out.join("");
		},
		onGotoadminlc: function (oEvent) {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("rtChAdminCL");
		},
		onGotoaddmaterial: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminLogisticCost.AddMaterialLogisticCost");
		},

		onDataExport: function (oEvent, pExport) {

			var oModelLocal = this.getModel("LogisticCost"); //this.getView().getModel("DataExport");

			/*if (pExport) {*/
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

		},
		onImportCvsFile: function (oEvent) {

			var that = this,
				oFile = oEvent.getParameter("files")[0];

			this.getModel("modelView").setProperty("/busy", true);

			if (oFile && window.FileReader) {
				var reader = new FileReader();

				reader.onload = function (evt) {
					that.strCSV = evt.target.result;
					var oClValues = {},
						oImportData = that.csv_to_Json(that.strCSV, ";"),
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
						/*	if (oLogistiCost.find(x => x.Material === oLogistiCostLine.Material) === undefined || oLogistiCost.find(x => x.Plant ===
									oLogistiCostLine.Plant) ===
								undefined || oLogistiCost.find(x => x.Fiscyear === oLogistiCostLine.Fiscyear) === undefined ||
								oLogistiCost.find(x => x.Fiscper3 === oLogistiCostLine.Fiscper3) === undefined ||
								oLogistiCost.find(x => x.CompCode === oLogistiCostLine.CompCode) === undefined) {*/

						oLogistiCost.push(oLogistiCostLine);

						/*} else {
							that.addMessage(new Message({
								message: that.getResourceBundle().getText("DuplicateMat") +":"+ oLogistiCostLine.Material,
								type: MessageType.Error
							}));
						}*/
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

			// Create a filter which contains our name and 'publ' filter
			this.getLogisticCostValoration(this.getFilters());

		},
		getFilters: function () {
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
			if (this.getView().byId("chkCostEmpty").getSelected() === true) {
				aFilter.push(new Filter("CostTotal", FilterOperator.EQ, "0.000"));
			}

			return aFilter;
		},
		clearFilterFields: function () {
			this.getView().byId("inpMaterial").setValue("");
			this.getView().byId("cmbPlant").setSelectedKey("");
			this.getView().byId("cmbYear").setSelectedKey("");
			this.getView().byId("chkCostEmpty").setSelected(false);
		}
	});

});