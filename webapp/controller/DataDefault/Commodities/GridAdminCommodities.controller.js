jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
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
	"sap/ui/table/RowSettings",
	"sap/ui/core/library"

], function (Controller, JSONModel, MessageToast, Fragment, DateFormat, library, Filter, FilterOperator, Button, Dialog, List,
	StandardListItem, ButtonType, MessageBox, RowSettings, CoreLibrary) {
	"use strict";

	var updatedRecords = [];
	var that = this;
	var MessageType = CoreLibrary.MessageType;

	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.Commodities.GridAdminCommodities", {

		
		onInit: function () {

			// set explored app's demo model on this sample

			var oUploader = this.getView().byId("fileUploader");
			oUploader.oBrowse.setText("Importar");
			oUploader.oFilePath.setVisible(false);
			oUploader.addEventDelegate({
				onAfterRendering: function () {
					this.setFileType(['csv']);
				}
			}, oUploader);

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChCommodities");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);

		},
		
		onMyRoutePatternMatched: function (event) {
			
			var oTable = this.getView().byId('tblCommodities');
			
			this.fnConsultaDetalleCommodities(); 
		},
		

		fnConsultaDetalleCommodities:  function (event) {
			
			var oPanel = this.getView();
			oPanel.setBusy(true);

			//Url Servicio
			var oModel = this.getOwnerComponent().getModel("ModelSimulador");
			var sServiceUrl = oModel.sServiceUrl;

			//Definir modelo del servicio web
			var oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			//Definir filtro

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/detailCommoditiesSet", null);

			if (oRead.tipo === "S") {
				this.oDataDetalleCommodities = oRead.datos.results;
				var obj = this.oDataDetalleCommodities;
				//Object.keys(obj).map(k => obj[k] = obj[k].trim());
				
				// Object.keys(obj).map(function(key, index) {
				//   //obj[key] *= 2;
				//   obj[key] = obj[key].trim();
				// });

			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
			}

			var oDataDetalleCommodities = "";
			//SI el modelo NO existe, se crea.
			if (!oDataDetalleCommodities) {
				oDataDetalleCommodities = {
					lstItemsCommodities: []
				};
			}

			oDataDetalleCommodities.lstItemsCommodities = this.oDataDetalleCommodities;
			$.each(oDataDetalleCommodities.lstItemsCommodities, function (i, o) {
				this.editable = false;
				this.highlight = "None";
			});
			
			var oTablaDetalleCommodities = this.byId("tblCommodities");
			var oModel2 = new sap.ui.model.json.JSONModel(oDataDetalleCommodities);
			oTablaDetalleCommodities.setModel(oModel2);
			
			//Obtiene Sociedades
			this.GetSociedades();
			
			//Obtiene Unidades de Medida
			this.GetUnidadesMedida();
			
			oPanel.setBusy(false);
			
			// // simulate delayed end of operation
			// setTimeout(function () {
				
			// }, 5000);
			
		},
		
		GetUnidadesMedida: function() {
			
			//Url Servicio
			var oModel = this.getOwnerComponent().getModel("ModelSimulador");
			var sServiceUrl = oModel.sServiceUrl;

			//Definir modelo del servicio web
			var oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			//Definir filtro

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/unidadesMedidaSet", null);

			if (oRead.tipo === "S") {
				this.oDataUnidadesMedida = oRead.datos.results;
			//	var obj = this.oDataUnidadesMedida;

			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
			}

			var oDataUnidadesMedida = "";
			//SI el modelo NO existe, se crea.
			if (!oDataUnidadesMedida) {
				oDataUnidadesMedida = {
					lstItemsUnidadesMedida: []
				};
			}

			var oTableCommodities = this.byId("tblCommodities");
			oTableCommodities.getModel().setProperty("/LstUnidadesMedida", this.oDataUnidadesMedida);
			oTableCommodities.getModel().refresh(); 
			
		},	
		
		GetSociedades: function() {
			
			//Url Servicio
			var oModel = this.getOwnerComponent().getModel("ModelSimulador");
			var sServiceUrl = oModel.sServiceUrl;

			//Definir modelo del servicio web
			var oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			//Definir filtro

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/maestroCentrosSet", null);

			if (oRead.tipo === "S") {
				this.oDataSociedades = oRead.datos.results;
			//	var obj = this.oDataUnidadesMedida;

			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
			}

			var oDataUnidadesMedida = "";
			//SI el modelo NO existe, se crea.
			if (!oDataUnidadesMedida) {
				oDataUnidadesMedida = {
					lstItemsUnidadesMedida: []
				};
			}

			var oTableCommodities = this.byId("tblCommodities");
			oTableCommodities.getModel().setProperty("/LstSociedades", this.oDataSociedades);
			oTableCommodities.getModel().refresh(); 
			
		},	
		
		onChangeSociedades: function(oEvent){
			
			var oItem = oEvent.getParameter("selectedItem");
			var oTableCommodities = this.byId("tblCommodities");
			var oItemObject = oItem.getBindingContext().getObject();
			var oSociedadSeleccionada= oItemObject.Compcodeplant;
			var oTableItem = oEvent.getSource().getParent();
			var oTableItemObject = oTableItem.getBindingContext().getObject();
			oTableItemObject.Sociedad = oSociedadSeleccionada;
			oTableCommodities.getModel().refresh();
			
		},
		
		onChangeUM: function(oEvent){
			
			var oItem = oEvent.getParameter("selectedItem");
			var oTableCommodities = this.byId("tblCommodities");
			var oItemObject = oItem.getBindingContext().getObject();
			var oUnidadSeleccionada= oItemObject.Msehi;
			var oTableItem = oEvent.getSource().getParent();
			var oTableItemObject = oTableItem.getBindingContext().getObject();
			oTableItemObject.UnidadMedida = oUnidadSeleccionada;
			oTableCommodities.getModel().refresh();
			
		},
		
		onAutoResizeColumnsBtnPress: function() {
	      const table = this.byId("tblCommodities");
	      table.getColumns().map((col, index) => table.autoResizeColumn(index));
	    },

		switchState: function (sKey) {
			var oTable = this.byId("tblCommoditiesui");
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

		handleEditPress: function (oEvent, Data) {
			var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");

			var oTable = this.byId("tblCommodities");
			var oRowData = oEvent.getSource().getBindingContext().getProperty();
			
			for (var i = 0; i < oTable.getModel().getData().lstItemsCommodities.length; i++) {
				var oObj = oTable.getModel().getData().lstItemsCommodities[i];
				oObj.editable = false;
				oObj.highlight = "None";
			}
			oTable.getModel().setProperty(oEvent.getSource().getBindingContext().getPath() + "/editable", true);
			oTable.getModel().setProperty(oEvent.getSource().getBindingContext().getPath() + "/highlight", "Information");
			oTable.getModel().setProperty(oEvent.getSource().getBindingContext().getPath() + "/navigated", true);
 
			var oEntidad = {};
			var oPath = oEvent.getSource().getBindingContext().sPath;
			
			oEntidad.RowPath = oPath.split("/")[2];

			updatedRecords.push(oEntidad);

			MessageToast.show("Puedes comenzar a " + (oItem.getText() || oItem.getType()) + " el ID " + oRowData.IdCommoditie);

		},

		saveCommodities: function (oEvent) {
			var oCommodities = [];

			var oTable = this.byId("tblCommodities");

			//var oSave = this.fnCreateEntity(oModelService, "/headerCommoditiesSet", that.updatedRecords);

			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oEntidad = {},
				oDetail = {};

			oEntidad = {
				IdCommoditie: '1111',
				Descripcion: 'Prueba',
				detailCommoditiesSet: []
			};

			for (var i = 0; i < updatedRecords.length; i++) {

				var CurrentRow = updatedRecords[i];

				var oTempRow = oTable.getModel().getData().lstItemsCommodities[CurrentRow.RowPath];

				oDetail = {
					Formula: oTempRow.Formula,
					IdCommoditie: oTempRow.IdCommoditie,
					Sociedad: oTempRow.Sociedad,
					Centro: oTempRow.Centro,
					UnidadMedida: oTempRow.UnidadMedida,
					Moneda: oTempRow.Moneda,
					Mes: oTempRow.Mes,
					Year: oTempRow.Year,
					PrecioMaterial: oTempRow.PrecioMaterial,
					OtrosCostos: oTempRow.OtrosCostos
						// Recordmode: '1'
				};

				oEntidad.detailCommoditiesSet.push(oDetail);
			}

			var oCreate = this.fnCreateEntity(oModelService, "/headerCommoditiesSet", oEntidad);

			if (oCreate.tipo === 'S') {

				MessageBox.show(
					'Datos guardados correctamente', {
						icon: MessageBox.Icon.SUCCESS,
						title: "Exito",
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								
								updatedRecords=[];
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
							// actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							// onClose: function (oAction) {
							// 	/ * do something * /
							// }
					}
				);

			}

		},

		showFormEditDetail: function (oEvent) {
			this.LogisticaDisplay = sap.ui.xmlfragment(
				"cbc.co.simulador_costos.view.Utilities.fragments.AdminCommodities.EditDetailCommodities", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},

		showFormCopyVersionCommoditie: function (oEvent) {
			this.LogisticaDisplay = sap.ui.xmlfragment(
				"cbc.co.simulador_costos.view.Utilities.fragments.AdminCommodities.CopyVersionCommodities", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},

		showFormAddCommoditie: function (oEvent) {
			//Abre Fragment para insertar registro de ID Commoditie
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminCommodities.AddCommodities");

		},

		showFormEditCommoditie: function (oEvent) {
			//this.LogisticaDisplay = sap.ui.xmlfragment("cbc.co.simulador_costos.view.Utilities.fragments.AdminCommodities.EditCommodities",
			//	this);
			//this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
			this.getOwnerComponent().getRouter().navTo("page2");
		},

		AddCommoditie: function (oEvent) {

			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oEntidad = {};

			var oIdCommoditie = sap.ui.getCore().getElementById("inputId").getValue();
			var oDescCommoditie = sap.ui.getCore().getElementById("inputDesc").getValue();

			oEntidad.IdCommoditie = oIdCommoditie;
			oEntidad.Descripcion = oDescCommoditie;

			var oCreate = this.fnCreateEntity(oModelService, "/headerCommoditiesSet", oEntidad);

			this.fnCloseFragment();

			that = this;
			if (oCreate.tipo === "S") {
				if (oCreate.datos.Msj !== "" && oCreate.datos.Msj !== undefined) {
					sap.m.MessageToast.show(oCreate.datos.Msj);
				} else {
					sap.m.MessageToast.show("ID Commoditie creada exitosamente.");

					this.AddAllPeriodsforCommoditie(oEntidad);

				}

			} else {
				sap.m.MessageBox.error(oCreate.msjs, null, "Mensaje del sistema", "OK", null);
			}

		},

		closeDialog: function (oEvent) {
			this.fnCloseFragment();
		},

		preCopyVersion: function (oEvent) {
			that = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.warning(
				"esta seguro de copiar esta version?", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						that.LogisticaDisplay.destroy();
					}
				}
			);
		},

		initSampleDataModel: function () {
			var oModel = new JSONModel();
			//var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax("model/CommoditiesTest.json", {
				dataType: "json",
				success: function (oData) {

					oModel.setData(oData);
				},
				error: function () {
					jQuery.sap.log.error("failed to load json");
				}
			});

			return oModel;
		},

		AddAllPeriodsforCommoditie: function (oEntidad) {
			var oModel = new JSONModel();
			var today = new Date();
			var year = today.getFullYear();

			var oData = '{ "COMMODITIES" : [';

			for (var i = 1; i <= 12; i++) {
				var ii = i < 10 ? '0' + i.toString() : i.toString();

				oData += '{ ';

				oData += ' "CDEF_IDCOMMODITIES":"' + oEntidad.IdCommoditie + '", ';
				oData += ' "CDEF_COMMODITIE":"' + oEntidad.Descripcion + '", ';
				oData += ' "CDEF_PERIODO":"' + year + '", ';
				oData += ' "CDEF_MES":"' + ii + '" ';

				if (i === 12) {
					oData += ' }';
				} else {
					oData += ' },';
				}

			}

			oData = oData + ']}';
			var obj = $.parseJSON(oData);

			//var obj = $.parseJSON(OData);
			var json = new sap.ui.model.json.JSONModel(obj);
			this.getView().setModel(json);

			oModel.setData(oData);

			return oModel;
		},

		//EVENTO vERSION

		EditNameVersion: function () {
			//this.byId("InputNameVersion").setEditable(true);
			this.getOwnerComponent().getRouter().navTo("page2");
		},

		EditDetailVersion: function () {
			//this.byId("txtDetailVersion").setEditable(true);

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
				oEntidad = {},
				oDetail = {};

			oEntidad = {
				IdCommoditie: '1111',
				Descripcion: 'Prueba',
				detailCommoditiesSet: []
			};

			for (var i = 1; i < JsonValue.length; i++) {

				var CurrentRow = JsonValue[i];

				oDetail = {
					Formula: CurrentRow.CDEF_FORMULA,
					IdCommoditie: CurrentRow.CDEF_IDCOMMODITIES,
					Sociedad: CurrentRow.CDEF_SOCIEDAD,
					Centro: CurrentRow.CDEF_CENTRO,
					UnidadMedida: CurrentRow.CDEF_UMD,
					Moneda: CurrentRow.CDEF_MONEDA,
					Mes: CurrentRow.CDEF_MES,
					Year: CurrentRow.CDEF_PERIODO
						// Recordmode: '1'
				};

				oEntidad.detailCommoditiesSet.push(oDetail);
			}

			var oCreate = this.fnCreateEntity(oModelService, "/headerCommoditiesSet", oEntidad);
			that = this;
			if (oCreate.tipo === 'S') {

				MessageBox.show(
					'Datos importados correctamente', {
						icon: MessageBox.Icon.SUCCESS,
						title: "Exito",
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								
								that.fnConsultaDetalleCommodities(); 
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
							// actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							// onClose: function (oAction) {
							// 	/ * do something * /
							// }
					}
				);

			}

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
		},

		onGoToIdCommoditieTable: function (oEvent) {

			var oItem = oEvent.getSource();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("rtChIDCommodities");

		},

		showCalculator: function (oEvent) {
			//rtChFromuladora
			var oRowData = oEvent.getSource().getBindingContext().getProperty();
			var oItem = oEvent.getSource();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("rtChFromuladora", {
				oRowPath: oRowData.IdCommoditie
			});

		},

		_generateInvalidUserInput: function () {
			var oButton = this.getView().byId("messagePopoverBtn"),
				oRequiredNameInput = this.oView.byId("formContainer").getItems()[4].getContent()[2],
				oNumericZipInput = this.oView.byId("formContainer").getItems()[5].getContent()[7],
				oEmailInput = this.oView.byId("formContainer").getItems()[6].getContent()[13],
				iWeeklyHours = this.oView.byId("formContainerEmployment").getItems()[0].getContent()[13];

			oButton.setVisible(true);
			oRequiredNameInput.setValue(undefined);
			oNumericZipInput.setValue("AAA");
			oEmailInput.setValue("MariaFontes.com");
			iWeeklyHours.setValue(400);

			this.handleRequiredField(oRequiredNameInput);
			this.checkInputConstraints(iWeeklyHours);

			this.oMP.getBinding("items").attachChange(function (oEvent) {
				this.oMP.navigateBack();
			}.bind(this));

			setTimeout(function () {
				this.oMP.openBy(oButton);
			}.bind(this), 100);
		}

	});

});