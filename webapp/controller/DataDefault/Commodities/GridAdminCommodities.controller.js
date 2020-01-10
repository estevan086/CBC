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
	
], function(Controller, JSONModel, MessageToast, Fragment, DateFormat, library, Filter, FilterOperator, Button, Dialog, List, StandardListItem,  ButtonType, MessageBox) {
	"use strict";
	var that = this;
	return Controller.extend("sap.ui.demo.walkthrough.controller.DataDefault.Commodities.GridAdminCommodities", {

		onInit : function() {
			var oInput1 = this.byId("InputNameVersion");
	        oInput1.attachBrowserEvent("onblur", function(){
				this.setEditable(false);
			});
			
			var oInput2 = this.byId("txtDetailVersion");
	        oInput2.attachBrowserEvent("blur", function(){
				this.setEditable(false);
			});
						
			// set explored app's demo model on this sample
			var json = this.initSampleDataModel();
			// Setting json to current view....
				//var json = new sap.ui.model.json.JSONModel("model/products.json");
			this.getView().setModel(json);
			
			var fnPress = this.handleActionPress.bind(this);
			var fnEditDetail = this.showFormEditDetail.bind(this);

			this.modes = [
				{
					key: "NavigationDelete",
					text: "Navigation & Delete",
					handler: function(){
						var oTemplate = new sap.ui.table.RowAction({items: [
							new sap.ui.table.RowActionItem({icon: "sap-icon://edit", text: "Edit", press:  fnEditDetail}),
							new sap.ui.table.RowActionItem({icon: "sap-icon://simulate", text: "Edit Formula", press: fnPress})
						]});
						return [2, oTemplate];
					}
				}
			];
			this.getView().setModel(new JSONModel({items: this.modes}), "modes");
			this.switchState("NavigationDelete");
			
		},

		switchState : function(sKey) {
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
		
		handleActionPress : function(oEvent) {
			var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");
			MessageToast.show("Item " + (oItem.getText() || oItem.getType()) + " pressed for product with id " +
				this.getView().getModel().getProperty("ProductId", oRow.getBindingContext()));
		},
		
		showFormEditDetail: function(oEvent) {
			this.LogisticaDisplay = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.EditDetailCommodities", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},
		
		showFormCopyVersionCommoditie: function(oEvent) {
			this.LogisticaDisplay = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.CopyVersionCommodities", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},
		
		showFormAddCommoditie: function(oEvent) {
			//Abre Fragment para insertar registro de ID Commoditie
			this.fnOpenDialog("sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.AddCommodities");
			
			
			
		},
		
		showFormEditCommoditie: function(oEvent) {
			this.LogisticaDisplay = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.EditCommodities", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},
		
		AddCommoditie: function(oEvent) {
			
			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
			    oEntidad = {};
			
			var	oIdCommoditie = sap.ui.getCore().getElementById("inputId").getValue();
			var	oDescCommoditie = sap.ui.getCore().getElementById("inputDesc").getValue();
			
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
				}

			} else {
				sap.m.MessageBox.error(oCreate.msjs, null, "Mensaje del sistema", "OK", null);
			}
			
			
		},
		
		closeDialog: function(oEvent) {
			this.fnCloseFragment();
		},
		
		preCopyVersion: function(oEvent) {
			that = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.warning(
				"esta seguro de copiar esta version?",
				{
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(sAction) {
						that.LogisticaDisplay.destroy();
					}
				}
			);
		},
		
		initSampleDataModel : function() {
			var oModel = new JSONModel();
			//var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax("model/CommoditiesTest.json", {
				dataType: "json",
				success: function(oData) {
					var aTemp1 = [];
					var aTemp2 = [];
					var aSuppliersData = [];
					var aCategoryData = [];
					for (var i = 0; i < oData.COMMODITIES.length; i++) {
						var oProduct = oData.COMMODITIES[i];
						if (oProduct.CDEF_IDCOMMODITIES && jQuery.inArray(oProduct.CDEF_IDCOMMODITIES, aTemp1) < 0) {
							aTemp1.push(oProduct.CDEF_IDCOMMODITIES);
							aSuppliersData.push({Name: oProduct.CDEF_IDCOMMODITIES});
						}
						if (oProduct.CDEF_COMMODITIE && jQuery.inArray(oProduct.CDEF_COMMODITIE, aTemp2) < 0) {
							aTemp2.push(oProduct.CDEF_COMMODITIE);
							aCategoryData.push({Name: oProduct.CDEF_COMMODITIE});
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
				error: function() {
					jQuery.sap.log.error("failed to load json");
				}
			});

			return oModel;
		},
		
		//EVENTO vERSION
		
		EditNameVersion: function(){
			this.byId("InputNameVersion").setEditable(true);
		},
		
		EditDetailVersion: function(){
			this.byId("txtDetailVersion").setEditable(true);
		}
		
		
	});

});