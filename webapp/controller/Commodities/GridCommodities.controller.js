jQuery.sap.require("sap.ui.demo.walkthrough.Formatter");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
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
	'sap/ui/core/Fragment'
	
], function(Controller, JSONModel, MessageToast, DateFormat, library, Filter, FilterOperator, Button, Dialog, List, StandardListItem,  ButtonType, MessageBox, Fragment) {
	"use strict";
	var YO = this;
	var that = this;
	return Controller.extend("sap.ui.demo.walkthrough.controller.Commodities.GridCommodities", {
		
		onInit : function() {
			
			//this.getView().byId("cbxVersion").setSelectedKey("0");
			//this.getView().byId("txtNameVersion").setValue(this.byId("cbxVersion").getValue().toString().substr(0,(this.byId("cbxVersion").getValue().toString().length -4)));
			//this.byId("PanelVersionHeader").setHeaderText(this.byId("cbxVersion").getValue());
			//this.getView().byId("ddlfecha").setSelectedKey(this.byId("cbxVersion").getSelectedKey());
			// set explored app's demo model on this sample
			var json = this.initSampleDataModel();
			// Setting json to current view....
				//var json = new sap.ui.model.json.JSONModel("model/products.json");
			this.getView().setModel(json);
			
			var fnFormuladora = this.showCalculator.bind(this);
			var fnEditDetail = this.showFormEditDetail.bind(this);

			this.modes = [
				{
					key: "NavigationDelete",
					text: "Navigation & Delete",
					handler: function(){
						var oTemplate = new sap.ui.table.RowAction({items: [
							new sap.ui.table.RowActionItem({icon: "sap-icon://edit", text: "Edit", press:  fnEditDetail}),
							new sap.ui.table.RowActionItem({icon: "sap-icon://simulate", text: "Edit Formula", press: fnFormuladora, id:"btnFormuladora"})
						]});
						return [2, oTemplate];
					}
				}
			];
			this.getView().setModel(new JSONModel({items: this.modes}), "modes");
			this.switchState("NavigationDelete");
			var that = this;
			YO = this;
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
			this.LogisticaDisplay = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.AddCommodities", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},
		
		showFormEditCommoditie: function(oEvent) {
			this.LogisticaDisplay = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.Utilities.fragments.AdminCommodities.EditCommodities", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},
		
		showCalculator: function(oEvent){
			var oModel = new JSONModel();
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
			YO.getView().setModel(YO._oModelSettings, "settings");
			
		
			this.LogisticaDisplay = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.Utilities.fragments.Calculadora", YO);
			this.LogisticaDisplay.open();
			//var testA = that.getView();
			//var testB = YO.getView();
			/*var sInputValue = oEvent.getSource().getId();

			// create value help dialog
			if (!this._valueHelpDialog) {
				Fragment.load({
					id: "valueHelpDialog",
					name: "sap.ui.demo.walkthrough.view.Utilities.fragments.Calculadora",
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
		
	
		closeDialog: function (oEvent) {
			that = this;
			this.fnCloseFragment();
		},
		
		fnCloseFragment: function(){
			that.LogisticaDisplay.destroy();
		},
		
		preCopyVersion: function(oEvent) {
			YO = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.warning(
				"esta seguro de copiar esta version?",
				{
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(sAction) {
						YO.LogisticaDisplay.close();
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
		
		setValuesVersion : function(oEvent)
		{
				var ValDate = this.byId("cbxVersion").getValue();
				this.getView().byId("txtNameVersion").setValue(this.byId("cbxVersion").getValue().toString().substr(0,(this.byId("cbxVersion").getValue().toString().length -4)));
				this.byId("PanelVersionHeader").setHeaderText(ValDate);
				this.getView().byId("ddlfecha").setSelectedKey(this.byId("cbxVersion").getSelectedKey());
		},
		
		setValuesFecha : function(oEvent)
		{
				this.getView().byId("cbxVersion").setSelectedKey(this.byId("ddlfecha").getSelectedKey());
				this.getView().byId("txtNameVersion").setValue(this.byId("cbxVersion").getValue().toString().substr(0,(this.byId("cbxVersion").getValue().toString().length -4)));
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

		}
		
	});

});