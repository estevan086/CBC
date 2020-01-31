jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings", 'sap/m/MessageBox'
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings, MessageBox) {
	"use strict";
	var updatedRecords = [];
	var that = this;
	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.TypeChange.GridTypeChange", {

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

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChTypeChange");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			this.GetTypeChange();
		},

		GetTypeChange: function () {
			var oModel = this.getView().getModel("ModelSimulador");
			var filterKurst = new sap.ui.model.Filter({
				path: "Kurst",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "P"
			});
			this.byId("tblTasaCambio").getColumns()[5].setVisible(true);
			var filtersArray = new Array();
			filtersArray.push(filterKurst);

			oModel.read("/tipoCambioSet", {
				filters: filtersArray,
				async: true,
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel();
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].Ukurspromedio = Number(oData.results[i].Ukurspromedio);
						oData.results[i].editable = false;
					}
					data.setProperty("/CodTipoCambio", oData.results);
					this.getOwnerComponent().setModel(data, "TipoCambio");
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

		onselectionChange: function (oEvent) {
			this.getModel("modelView").setProperty("/busy", true);
			var oModel = this.getView().getModel("ModelSimulador");
			var oItem = oEvent.getParameter("selectedItem");

			var filterKurst = new sap.ui.model.Filter({
				path: "Kurst",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oItem.getKey()
			});
			if (oItem.getKey() === "P") {
				this.byId("tblTasaCambio").getColumns()[5].setVisible(true);
			} else {
				this.byId("tblTasaCambio").getColumns()[5].setVisible(false);
			}
			var filtersArray = new Array();
			filtersArray.push(filterKurst);

			oModel.read("/tipoCambioSet", {
				filters: filtersArray,
				async: true,
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel();

					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].Ukurspromedio = Number(oData.results[i].Ukurspromedio);
					}
					data.setProperty("/CodTipoCambio", oData.results);
					this.getOwnerComponent().setModel(data, "TipoCambio");

					var oTable = this.byId("tblTasaCambio");
					for (var j = 0; j < oTable.getModel("TipoCambio").getData().CodTipoCambio.length; j++) {
						var oObj = oTable.getModel("TipoCambio").getData().CodTipoCambio[j];
						oObj.editable = false;
						oObj.highlight = "None";
					}
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

		handleEditPress: function (oEvent, Data) {
			var oTable = this.byId("tblTasaCambio");
			for (var j = 0; j < oTable.getModel("TipoCambio").getData().CodTipoCambio.length; j++) {
				var oObj = oTable.getModel("TipoCambio").getData().CodTipoCambio[j];
				oObj.editable = false;
				oObj.highlight = "None";
			}
			oEvent.getSource().getParent().getCells()[4].setEditable(true);
			updatedRecords.push(oEvent.getSource().getParent().getIndex());
		},

		saveTypeChange: function (oEvent) {
			var oTable = this.byId("tblTasaCambio");

			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oEntidad = {},
				oDetail = {};

			oEntidad = {
				Kurst: 'CSV',
				Fcurr: 'CSV',
				Tcurr: '',
				tiposCambio: []
			};

			for (var i = 0; i < updatedRecords.length; i++) {

				var CurrentRow = updatedRecords[i];

				var oTempRow = oTable.getRows()[CurrentRow].getCells();

				oDetail = {
					Kurst: "P",
					Fcurr: oTempRow[0].getText(),
					Tcurr: oTempRow[1].getText(),
					Fiscper3: oTempRow[3].getText(),
					Fiscyear: oTempRow[2].getText(),
					Tipo: "PLAN",
					Ukurspromedio: oTempRow[4].getValue()
				};

				oEntidad.tiposCambio.push(oDetail);
			}

			var oCreate = this.fnCreateEntity(oModelService, "/tipoCambioCabSet", oEntidad);

			if (oCreate.tipo === 'S') {

				MessageBox.show(
					'Datos guardados correctamente', {
						icon: MessageBox.Icon.SUCCESS,
						title: "Exito",
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {

								updatedRecords = [];
								return;
							}
						}
					}
				);

			} else if (oCreate.tipo === 'E') {

				MessageBox.show(
					oCreate.msjs, {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
					}
				);

			}

		},

		handleUpload: function (oEvent) {
			var that = this;
			var oFile = oEvent.getParameter("files")[0];
			if (oFile && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function (evt) {
					var strCSV = evt.target.result; //string in CSV 
					that.csvJSON(strCSV);
				};
				reader.readAsText(oFile);
			}
		},

		csvJSON: function (csv) {
			var lines = csv.split("\n");
			var result = [];
			var headers = lines[0].split(",");
			if (headers.length > 1) {
				for (var i = 1; i < lines.length; i++) {
					var obj = {};
					var currentline = lines[i].split(",");
					for (var j = 0; j < headers.length; j++) {
						if (currentline[0] === "P") {
							obj[headers[j]] = currentline[j];
						}
					}
					if (!obj.Tipo === false) {
						result.push(obj);
					}
				}
			} else {
				var headersPC = lines[0].split(";");
				for (var k = 1; k < lines.length; k++) {
					var objPC = {};
					var currentlinePC = lines[k].split(";");
					for (var l = 0; l < headersPC.length; l++) {
						if (currentlinePC[0] === "P") {
							objPC[headersPC[l]] = currentlinePC[l];
						}
					}
					if (!objPC.Tipo === false) {
						result.push(objPC);
					}
				}
			}
			var oStringResult = JSON.stringify(result);
			var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
			this.CargaMasiva(oFinalResult);
		},

		CargaMasiva: function (JsonValue) {

			if (JsonValue.length > 0) {

				var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
					oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
					oEntidad = {},
					oDetail = {};

				oEntidad = {
					Kurst: 'CSV',
					Fcurr: 'CSV',
					Tcurr: '',
					tiposCambio: []
				};

				for (var i = 0; i < JsonValue.length; i++) {
					var CurrentRow = JsonValue[i];
					oDetail = {
						Kurst: CurrentRow.Tipo,
						Fcurr: CurrentRow.Moneda_Local,
						Tcurr: CurrentRow.Moneda_Destino,
						Fiscper3: CurrentRow.Mes,
						Fiscyear: CurrentRow.Año,
						Tipo: CurrentRow.Tipo === "P" ? "PLAN" : "REAL",
						Ukurspromedio: CurrentRow.Tasa_de_Cambio_Promedio,
					};
					oEntidad.tiposCambio.push(oDetail);
				}

				var oCreate = this.fnCreateEntity(oModelService, "/tipoCambioCabSet", oEntidad);
				//that = this;
				if (oCreate.tipo === 'S') {

					MessageBox.show(
						'Datos importados correctamente', {
							icon: MessageBox.Icon.SUCCESS,
							title: "Exito",
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === sap.m.MessageBox.Action.OK) {

									//that.fnConsultaDetalleCommodities();
									return;
								}
							}
						}
					);
					this.GetTypeChange();
				} else if (oCreate.tipo === 'E') {

					MessageBox.show(
						oCreate.msjs, {
							icon: MessageBox.Icon.ERROR,
							title: "Error"
						}
					);

				}
			} else {
				MessageBox.show(
					"Error en el archivo, (Columnas no validas o Archivo sin datos)", {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
					}
				);
			}
		},

		onDataExport: function (oEvent, pExport) {

			var oModelLocal = this.getModel("TipoCambio"); //this.getView().getModel("DataExport");
			/*var oColumns = this.byId("tblTasaCambio").getColumns();
			for (var j = 0; j < this.byId("tblTasaCambio").getColumns().length; j++) {
				if (currentline[0] === "P") {
					obj[headers[j]] = currentline[j];
				}
			}*/

			/*if (pExport) {*/
			var oModel = new sap.ui.model.json.JSONModel(oModelLocal.getProperty("/CodTipoCambio")),
				columns = [];
			columns.push({
				name: "Tipo",
				template: {
					content: {
						path: "Kurst"
					}
				}
			}, {
				name: "Moneda_Local",
				template: {
					content: {
						path: "Fcurr"
					}
				}
			}, {
				name: "Moneda_Destino",
				template: {
					content: {
						path: "Tcurr"
					}
				}
			}, {
				name: "Mes",
				template: {
					content: {
						path: "Fiscper3"
					}
				}
			}, {
				name: "Año",
				template: {
					content: {
						path: "Fiscyear"
					}
				}
			}, {
				name: "Tasa_de_Cambio_Promedio",
				template: {
					content: {
						path: "Ukurspromedio"
					}
				}
			});
			//recupera columnas creadas dinamicamente
			/*this.columnData.forEach(function (oValue, i) {
				columns.push({
					name: oValue.label,
					template: {
						content: {
							path: oValue.columnName
						}
					}
				});
			});
*/
			this.cvsDataExport(oModel, columns);
			this.getView().getModel("DataExport").setProperty("/CodTipoCambio", []);
			/*} else {
				this.getLogisticCostValoration(this.getFilters(), true);
			}*/

		}

	});
});