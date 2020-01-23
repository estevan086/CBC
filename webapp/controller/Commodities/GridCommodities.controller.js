jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	'jquery.sap.global',
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/table/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/ButtonType",
	'sap/m/MessageBox',
	'sap/ui/core/Fragment',
	'sap/m/StandardTile'

], function (jQuery, Controller, JSONModel, MessageToast, DateFormat, library, Filter, FilterOperator, Button, Dialog, List,
	StandardListItem, ButtonType, MessageBox, Fragment, StandardTile) {
	"use strict";
	var YO = this;
	var that = this;
	return Controller.extend("cbc.co.simulador_costos.controller.Commodities.GridCommodities", {

		onInit: function () {

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setSizeLimit(10000);
			sap.ui.getCore().setModel(oModel);
			var oUploader = this.getView().byId("fileUploader");
			oUploader.oBrowse.setText("Importar");
			oUploader.oFilePath.setVisible(false);
			oUploader.addEventDelegate({
				onAfterRendering: function () {
					this.setFileType(['csv']);
				}
			}, oUploader);

			var json = this.initSampleDataModel();
			this.getView().setModel(json);

			/*	var fnFormuladora = this.showCalculator.bind(this);
				var fnEditDetail = this.showFormEditDetail.bind(this);*/

			// this.modes = [{
			// 	key: "NavigationDelete",
			// 	text: "Navigation & Delete",
			// 	handler: function () {
			// 		var oTemplate = new sap.ui.table.RowAction({
			// 			items: [
			// 				new sap.ui.table.RowActionItem({
			// 					icon: "sap-icon://edit",
			// 					text: "Edit",
			// 					press: fnEditDetail
			// 				}),
			// 				new sap.ui.table.RowActionItem({
			// 					icon: "sap-icon://simulate",
			// 					text: "Edit Formula",
			// 					press: fnFormuladora,
			// 					id: "btnFormuladora"
			// 				})
			// 			]
			// 		});
			// 		return [2, oTemplate];
			// 	}
			// }];
			// this.getView().setModel(new JSONModel({
			// 	items: this.modes
			// }), "modes");
			// this.switchState("NavigationDelete");
			// var that = this;
			// YO = this;
		},

		switchState: function (sKey) {
			var oTable = this.byId("tblCommodities");
			var iCount = 0;
			var oTemplate = oTable.getRowActionTemplate();
			if (oTemplate) {
				oTemplate.destroy();
				oTemplate = null;
			}

			for (var i = 0; i < this.modes.length; i++) {
				if (sKey === this.modes[i].key) {
					var aRes = this.modes[i].handler();
					iCount = aRes[0];
					oTemplate = aRes[1];
					break;
				}
			}

			oTable.setRowActionTemplate(oTemplate);
			oTable.setRowActionCount(iCount);
		},

		showCalculator: function (oEvent) {
			//rtChFromuladora

			var oMainContentView = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent()
				.getParent().getParent().getParent();

			var oNavContainer = oMainContentView.byId("NavContainer");

			oNavContainer.to(oMainContentView.createId("rtChFromuladora"));

			/*var oModel = new JSONModel();
			jQuery.ajax("model/CommoditiesTest.json", {
				dataType: "json",
				success: function(oData) {
					oModel.setData(oData);
				},
				error: function() {
					jQuery.sap.log.error("failed to load json");
				}
			});
			YO.getView().setModel(oModel);
			
			YO._oModelSettings = new JSONModel({
				layoutType: "Default",
				allowComparison: true,
				allowLogical: true,
				readOnly: false
			});
			YO.getView().setModel(YO._oModelSettings, "settings");*/

			//this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.Calculadora");
			//this.LogisticaDisplay = sap.ui.xmlfragment("cbc.co.simulador_costos.view.Utilities.fragments.Calculadora", YO);
			//this.LogisticaDisplay.open();
			//var testA = that.getView();
			//var testB = YO.getView();
			/*var sInputValue = oEvent.getSource().getId();

			// create value help dialog
			if (!this._valueHelpDialog) {
				Fragment.load({
					id: "valueHelpDialog",
					name: "cbc.co.simulador_costos.view.Utilities.fragments.Calculadora",
					controller: this
				})
				.then(function (oValueHelpDialog) {
					this._valueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._valueHelpDialog);
					this._openValueHelpDialog(sInputValue);
				}.bind(this));
			} else {
				this._openValueHelpDialog(sInputValue);
			}*/

		},

		_openValueHelpDialog: function (sInputValue) {
			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"references",
				FilterOperator.Contains,
				sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"references",
				FilterOperator.Contains,
				sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		showFormCreateVersion: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.Commodities.CreateVersionCommodities");
		},	
		
		showFormEditVersion: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.Commodities.EditVersionCommodities");
		},
		
		SaveVersionCommoditie: function(oEvent){
			
		},

		closeDialog: function (oEvent) {
			this.fnCloseFragment();
		},

		initSampleDataModel: function () {
			var oModel = new JSONModel();
			//var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax("model/CommoditiesTest.json", {
				dataType: "json",
				success: function (oData) {
					var aTemp1 = [];
					var aTemp2 = [];
					var aSuppliersData = [];
					var aCategoryData = [];
					for (var i = 0; i < oData.COMMODITIES.length; i++) {
						var oProduct = oData.COMMODITIES[i];
						if (oProduct.CDEF_IDCOMMODITIES && jQuery.inArray(oProduct.CDEF_IDCOMMODITIES, aTemp1) < 0) {
							aTemp1.push(oProduct.CDEF_IDCOMMODITIES);
							aSuppliersData.push({
								Name: oProduct.CDEF_IDCOMMODITIES
							});
						}
						if (oProduct.CDEF_COMMODITIE && jQuery.inArray(oProduct.CDEF_COMMODITIE, aTemp2) < 0) {
							aTemp2.push(oProduct.CDEF_COMMODITIE);
							aCategoryData.push({
								Name: oProduct.CDEF_COMMODITIE
							});
						}
						//oProduct.DeliveryDate = (new Date()).getTime() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
						//var d = new Date(oProduct.DeliveryDate);
						//d = formatTime(d);
						//oProduct.DeliveryDateStr = oDateFormat.format(new Date(oProduct.DeliveryDate));
						oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
						oProduct.Available = oProduct.Status === "Available" ? true : false;
					}

					oData.Suppliers = aSuppliersData;
					oData.Categories = aCategoryData;

					oModel.setData(oData);
				},
				error: function () {
					jQuery.sap.log.error("failed to load json");
				}
			});

			return oModel;
		},

		//EVENTO VERSION

		setValuesVersion: function (oEvent) {
			var ValDate = this.byId("cbxVersion").getValue();
			this.getView().byId("txtNameVersion").setValue(this.byId("cbxVersion").getValue().toString().substr(0, (this.byId("cbxVersion").getValue()
				.toString().length - 4)));
			this.byId("PanelVersionHeader").setHeaderText(ValDate);
			this.getView().byId("ddlfecha").setSelectedKey(this.byId("cbxVersion").getSelectedKey());
		},

		setValuesFecha: function (oEvent) {
			this.getView().byId("cbxVersion").setSelectedKey(this.byId("ddlfecha").getSelectedKey());
			this.getView().byId("txtNameVersion").setValue(this.byId("cbxVersion").getValue().toString().substr(0, (this.byId("cbxVersion").getValue()
				.toString().length - 4)));
			this.byId("PanelVersionHeader").setHeaderText(this.byId("cbxVersion").getValue());
		},

		//EVENTOS CALCULADORA

		layoutTypeChanged: function (oEvent) {
			var sKey = oEvent.getSource().getProperty("selectedKey");
			this._oBuilder.setShowInputToolbar(sKey === "TextualOnly");
		},
		handleChange: function (oEvent) {
			var oItem = oEvent.getSource().getSelectedItem(),
				oData = oItem.getCustomData(),
				sKey = oData[0].getKey();

			this.getView().byId("builder").updateOrCreateItem(sKey);
		},
		setSelection: function (oEvent) {
			var oList = this.getView().byId("Tree"),
				sKey = oEvent.getParameter("key");

			if (!sKey) {
				var oSelectedItemInVariablesList = oList.getSelectedItem();
				if (oSelectedItemInVariablesList) {
					oList.setSelectedItem(oSelectedItemInVariablesList, false);
				}
			} else {
				var aItems = oList.getItems();
				for (var k = 0; k < aItems.length; k++) {
					var oItem = aItems[k],
						sItemKey = aItems[k].getCustomData()[0].getValue();

					if (sKey === sItemKey) {
						oList.setSelectedItem(oItem, true);
						return;
					}
				}
			}

		},

		//EVENTO UPLOADFILE

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
			for (var i = 1; i < lines.length; i++) {
				var obj = {};
				var currentline = lines[i].split(",");
				for (var j = 0; j < headers.length; j++) {
					obj[headers[j]] = currentline[j];
				}
				result.push(obj);
			}
			var oStringResult = JSON.stringify(result);
			var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, "")); //OBJETO JSON para guardar
			//MessageToast.show(oStringResult);
			this.CargaMasiva(oFinalResult);
			//return result; //JavaScript object
			//sap.ui.getCore().getModel().setProperty("/", oFinalResult);
			//this.generateTile();
		},

		CargaMasiva: function (JsonValue) {

			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oCommodities = [],
				oEntidad = {},
				oDetail = {};

			var CurrentRow = "";
			for (var i = 1; i < JsonValue.length; i++) {
				if (CurrentRow === "") {
					CurrentRow = JsonValue[i].CDEF_IDCOMMODITIES + JsonValue[i].CDEF_CENTRO + JsonValue[i].CDEF_PERIODO;
					oEntidad = {
						IdCommoditie: JsonValue[i].CDEF_IDCOMMODITIES,
						Descripcion: JsonValue[i].CDEF_COMMODITIE,
						detailCommoditiesSet: []
					};
					oDetail = this.SetRowoDetail(JsonValue[i]);
					oEntidad.detailCommoditiesSet.push(oDetail);

				} else {
					if (CurrentRow === JsonValue[i].CDEF_IDCOMMODITIES + JsonValue[i].CDEF_CENTRO + JsonValue[i].CDEF_PERIODO) {
						oDetail = this.SetRowoDetail(JsonValue[i]);
						oEntidad.detailCommoditiesSet.push(oDetail);
					} else {
						CurrentRow = JsonValue[i].CDEF_IDCOMMODITIES + JsonValue[i].CDEF_CENTRO + JsonValue[i].CDEF_PERIODO;
						oCommodities.push(oEntidad);
						oEntidad = {
							IdCommoditie: JsonValue[i].CDEF_IDCOMMODITIES,
							Descripcion: JsonValue[i].CDEF_COMMODITIE,
							detailCommoditiesSet: []
						};
						oDetail = this.SetRowoDetail(JsonValue[i]);
						oEntidad.detailCommoditiesSet.push(oDetail);
					}
				}
				if (i === (JsonValue.length - 1) && JsonValue[i].CDEF_IDCOMMODITIES !== "") {
					oCommodities.push(oEntidad);
				}
			}

			var oCreate = this.fnCreateEntity(oModelService, "/headerCommoditiesSet", oCommodities);

		},

		SetRowoDetail: function (oValue) {
			var oDetail = {
				Formula: oValue.CDEF_FORMULA,
				IdCommoditie: oValue.CDEF_IDCOMMODITIES,
				Sociedad: oValue.CDEF_SOCIEDAD,
				Centro: oValue.CDEF_CENTRO,
				UnidadMedida: oValue.CDEF_UMD,
				Moneda: oValue.CDEF_MONEDA,
				Mes: oValue.CDEF_MES,
				Year: oValue.CDEF_PERIODO,
				Recordmode: oValue.CDEF_CENTRO
			};
			return oDetail;
		}

	});

});