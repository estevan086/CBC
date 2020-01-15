jQuery.sap.require("sap.ui.demo.walkthrough.Formatter");
sap.ui.define([
	"sap/ui/demo/walkthrough/controller/BaseController",
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
	'sap/m/MessageBox'

], function (Controller, JSONModel, MessageToast, Fragment, DateFormat, library, Filter, FilterOperator, Button, Dialog, List,
	StandardListItem, ButtonType, MessageBox) {
	"use strict";
	var that = this;
	return Controller.extend("sap.ui.demo.walkthrough.controller.DataDefault.Commodities.GridAdminCommodities", {

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
			
			// var comboBox = new sap.ui.commons.ComboBox({});    // create the ComboBox
			// comboBox .bindItems({ 
			//   path: "/items", 
			//   template: itemTemplate, 
			//   templateShareable:true
			//   });  
			
			
			// var model = new sap.ui.model.json.JSONModel({items:[
			//   {text:"Item 1"},
			//   {text:"Item 2"},
			//   {text:"Item 3"},
			//   {text:"Item 4"},
			//   {text:"Item 5"}
			// ]});
			// comboBox.setModel(model);
			// comboBox.placeAt("body");
			
			// var clone = comboBox.clone();
			// clone.placeAt("body");



			var dataObject = [{
				Product: "Power Projector 4713",
				Weight: "1467",
				Supplier: ""
			}, {
				Product: "Gladiator MX",
				Weight: "321",
				Supplier: ""
			}, {
				Product: "Hurricane GX",
				Weight: "588",
				Supplier: ""
			}, {
				Product: "Webcam",
				Weight: "700",
				Supplier: ""
			}, {
				Product: "Monitor Locking Cable",
				Weight: "40",
				Supplier: ""
			}, {
				Product: "Laptop Case",
				Weight: "1289",
				Supplier: ""
			}];
			var supplierObject = [{
				Supplier: "Titanium"
			}, {
				Supplier: "Technocom"
			}, {
				Supplier: "Red Point Stores"
			}];
			// var oModel = new sap.ui.model.json.JSONModel();
			// oModel.setData(dataObject);
			// sap.ui.getCore().setModel(oModel);
			
			// sap.ui.getCore().getModel().setProperty("/Supplier", supplierObject);

			// var fnPress = this.handleActionPress.bind(this);
			// var fnEditDetail = this.showFormEditDetail.bind(this);

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
			// 					press: fnPress
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

		handleActionPress: function (oEvent) {
			var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");
			MessageToast.show("Item " + (oItem.getText() || oItem.getType()) + " pressed for product with id " +
				this.getView().getModel().getProperty("ProductId", oRow.getBindingContext()));
		},

		showFormEditDetail: function (oEvent) {
			this.LogisticaDisplay = sap.ui.xmlfragment(
				"sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.EditDetailCommodities", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},

		showFormCopyVersionCommoditie: function (oEvent) {
			this.LogisticaDisplay = sap.ui.xmlfragment(
				"sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.CopyVersionCommodities", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},

		showFormAddCommoditie: function (oEvent) {
			//Abre Fragment para insertar registro de ID Commoditie
			this.fnOpenDialog("sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.AddCommodities");

		},

		showFormEditCommoditie: function (oEvent) {
			//this.LogisticaDisplay = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.EditCommodities",
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
		}

	});

});