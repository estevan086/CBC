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
	var that = this;
	var MessageType = CoreLibrary.MessageType;

	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.Commodities.GridAdminCommodities", {

		onInit: function () {

			//  	var oInput1 = this.byId("InputNameVersion");
			//	oInput1.attachBrowserEvent("onblur", function () {
			//		this.setEditable(false);
			//	});

			//	var oInput2 = this.byId("txtDetailVersion");
			//	oInput2.attachBrowserEvent("blur", function () {
			//		this.setEditable(false);
			//	});

			// set explored app's demo model on this sample
			var json = this.initSampleDataModel();
			this.getView().setModel(json);

			// var itemTemplate = new sap.ui.core.ListItem();      //  creating a ListItem object                  
			// itemTemplate .bindProperty("text", "text");   //  bind for the "text" property a certain path from the model

			var supplierObject = [{
				Supplier: "Titanium"
			}, {
				Supplier: "Technocom"
			}, {
				Supplier: "Red Point Stores"
			}];

			

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
			//var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");

			var oTable = this.byId("tblCommodities");
			var oRowData = oEvent.getSource().getBindingContext().getProperty();

			var oRowEdited = oEvent.getSource().getParent().getParent();

			//this.byId("tblCommodities").getRows()[3].getCells()[3].mProperties.editable = "true";

			for (var i = 0; i < oTable.getRows().length; i++) {

				oTable.getRows()[i].getBindingContext().getProperty().CDEF_EDIT_FLAG = "None";
				oTable.getRows()[i].getBindingContext().getProperty().CDEF_NAV_FLAG = false;

				//Sociedad
				oTable.getRows()[i].getCells()[2].setProperty("editable", false);
				//Moneda
				oTable.getRows()[i].getCells()[3].setProperty("editable", false);
				//Unidad de Medida
				oTable.getRows()[i].getCells()[4].setProperty("editable", false);
				//Precio
				oTable.getRows()[i].getCells()[5].setProperty("editable", false);
				//Otros Costos
				oTable.getRows()[i].getCells()[6].setProperty("editable", false);
			}

			//Sociedad
			oRowEdited.getCells()[2].setProperty("editable", true);
			//Moneda
			oRowEdited.getCells()[3].setProperty("editable", true);
			//Unidad de Medida
			oRowEdited.getCells()[4].setProperty("editable", true);
			//Precio
			oRowEdited.getCells()[5].setProperty("editable", true);
			//Otros Costos
			oRowEdited.getCells()[6].setProperty("editable", true);

			oRowData.CDEF_EDIT_FLAG = "Information";

			oRowData.CDEF_NAV_FLAG = true;

			oTable.setRowSettingsTemplate(new RowSettings({
				highlight: "{CDEF_EDIT_FLAG}",
				navigated: "{CDEF_NAV_FLAG}"
					// 	path: "",
					// 	formatter: function() {
					// 		var oRow = this._getRow();

				// 		if (oRow !== null) {
				// 			var iIndex = oRow.getIndex();

				// 			if (iIndex === 0) {
				// 				return MessageType.Success;
				// 			} else if (iIndex === 1) {
				// 				return MessageType.Warning;
				// 			} else if (iIndex === 2) {
				// 				return MessageType.Error;
				// 			} else if (iIndex === 3) {
				// 				return MessageType.Information;
				// 			} else if (iIndex === 4) {
				// 				return MessageType.None;
				// 			} else if (iIndex === 5) {
				// 				return MessageType.Success;
				// 			} else if (iIndex === 6) {
				// 				return MessageType.Success;
				// 			}
				// 		}

				// 		return "None";
				// 	}
				// }

			}));

			sap.ui.getCore().applyChanges();

			// var oToggleButton = oEvent.getSource();

			// if (oToggleButton.getPressed()) {
			// 	oTable.setRowSettingsTemplate(new RowSettings({
			// 		navigated: true
			// 	}));
			// } else {
			// 	oTable.setRowSettingsTemplate(null);
			// }

			MessageToast.show("ID " + (oItem.getText() || oItem.getType()) + " pressed for id " + oRowData.CDEF_IDCOMMODITIES);

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

			// var ODataPeriodos = { "COMMODITIES": [ 
			// 		{
			//             "CDEF_IDCOMMODITIES": "",
			//             "CDEF_COMMODITIE": "",
			//             "CDEF_SOCIEDAD": "",
			//             "CDEF_MONEDA": "",
			//             "CDEF_UMD": "",
			//             "CDEF_PRECIO": "",
			//             "CDEF_OTROCOSTO": "",
			//             "CDEF_FORMULA": "",
			//             "CDEF_PERIODO": "2020",
			//             "CDEF_MES": "1"
			//         }
			// 	] };

			// for (var j = 0; j < 12; j++) {

			// 	ODataPeriodos[j].CDEF_IDCOMMODITIES =  oEntidad.IdCommoditie;
			// 	ODataPeriodos[j].CDEF_COMMODITIE    =  oEntidad.DesCommoditie;

			// 	// //var oProduct = oData.COMMODITIES[i];
			// 	// if (oProduct.CDEF_IDCOMMODITIES && jQuery.inArray(oProduct.CDEF_IDCOMMODITIES, aTemp1) < 0) {
			// 	// 	aTemp1.push(oProduct.CDEF_IDCOMMODITIES);
			// 	// 	aSuppliersData.push({
			// 	// 		Name: oProduct.CDEF_IDCOMMODITIES
			// 	// 	});
			// 	// }
			// 	// if (oProduct.CDEF_COMMODITIE && jQuery.inArray(oProduct.CDEF_COMMODITIE, aTemp2) < 0) {
			// 	// 	aTemp2.push(oProduct.CDEF_COMMODITIE);
			// 	// 	aCategoryData.push({
			// 	// 		Name: oProduct.CDEF_COMMODITIE
			// 	// 	});
			// 	// }

			// }

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

		onGoToIdCommoditieTable: function (oEvent) {
			//var oPageContainer = sap.ui.getCore().byId("NavContainer");
			var oMainContentView = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent()
				.getParent().getParent();

			var oNavContainer = oMainContentView.byId("NavContainer");

			oNavContainer.to(oMainContentView.createId("rtChIDCommodities"));
		},

		showCalculator: function (oEvent) {
			//rtChFromuladora
			var oRowData = oEvent.getSource().getBindingContext().getProperty();

			var oMainContentView = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent()
				.getParent().getParent();

			var oNavContainer = oMainContentView.byId("NavContainer");

			this.getView().addEventDelegate({
				onBeforeHide: function (event) {
					var targetView = event.to;
					var dataToPass = "Precio+Precio";/*...*/
					targetView.data("data", dataToPass);
				}
			}, this);

			//oNavContainer.to(oMainContentView.createId("rtChFromuladora", {	formula: oRowData.CDEF_FORMULA } ) );
			
			oNavContainer.to(oMainContentView.createId("rtChFromuladora"), "slide", oRowData );

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

			this.oMP.getBinding("items").attachChange(function(oEvent){
				this.oMP.navigateBack();
			}.bind(this));

			setTimeout(function(){
				this.oMP.openBy(oButton);
			}.bind(this), 100);
		}

	});

});