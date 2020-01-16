jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/table/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/m/TablePersoController',
	'sap/ui/core/Fragment',
	'sap/m/Token'
], function(Controller, JSONModel, MessageToast, DateFormat, library, Filter, FilterOperator, TablePersoController, Fragment, Token) {
	"use strict";
	this.YO = this;
	return Controller.extend("cbc.co.simulador_costos.controller.Admon.Centros", {
		
		onInit : function() {
			// set explored app's demo model on this sample
			var json = this.initSampleDataModel();
			// Setting json to current view....
			// var json = new sap.ui.model.json.JSONModel("model/products.json");
			this.getView().setModel(json);
			
			
			this.getView().setModel(new JSONModel({
				filterValue: ""
			}), "ui");

			this._oTxtFilter = null;
			this._oFacetFilter = null;
			
			var fnPress = this.handleActionPress.bind(this);

			this.modes = [
				{
					key: "NavigationDelete",
					text: "Navigation & Delete",
					handler: function(){
						var oTemplate = new sap.ui.table.RowAction({items: [
							new sap.ui.table.RowActionItem({type: "Delete", press: fnPress})
						]});
						return [1, oTemplate];
					}
				}
			];
			this.getView().setModel(new JSONModel({items: this.modes}), "modes");
			this.switchState("NavigationDelete");
		},
	
		initSampleDataModel : function() {
			var oModel = new JSONModel();
			//var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax("model/Data3.json", {
				dataType: "json",
				success: function(oData) {
					var aTemp1 = [];
					var aTemp2 = [];
					var aSuppliersData = [];
					var aCategoryData = [];
						for (var i = 0; i < oData.CENTRO.length; i++) {
						var oProduct = oData.CENTRO[i];
						if (oProduct.PAIS && jQuery.inArray(oProduct.PAIS, aTemp1) < 0) {
							aTemp1.push(oProduct.PAIS);
							aSuppliersData.push({Name: oProduct.PAIS});
						}
						if (oProduct.SOCIEDAD && jQuery.inArray(oProduct.SOCIEDAD, aTemp2) < 0) {
							aTemp2.push(oProduct.Category);
							aCategoryData.push({Name: oProduct.SOCIEDAD});
						}
						oProduct.DeliveryDate = (new Date()).getTime() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
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
		
		switchState : function(sKey) {
			var oTable = this.byId("tblCentros");
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
		
		
		showFormAdd: function() {
			//this.onPersonalizationDialogPress();
			this.LogisticaDisplay = sap.ui.xmlfragment("cbc.co.simulador_costos.view.Utilities.fragments.AddCentro", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},
		
		closeDialog: function() {
			this.LogisticaDisplay.close();
		},
		
		handleValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			// create value help dialog
			if (!this._valueHelpDialog) {
				Fragment.load({
					id: "valueHelpDialog",
					name: "cbc.co.simulador_costos.view.Utilities.fragments.Dialog",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._valueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._valueHelpDialog);
					this._openValueHelpDialog(sInputValue);
				}.bind(this));
			} else {
				this._openValueHelpDialog(sInputValue);
			}
		},

		_openValueHelpDialog: function (sInputValue) {
			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"CENTRO",
				FilterOperator.Contains,
				sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"CENTRO",
				FilterOperator.Contains,
				sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose: function (evt) {
			var aSelectedItems = evt.getParameter("selectedItems"),
				oMultiInput = this.byId("multiInput");

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						text: oItem.getTitle()
					}));
				});
			}
		}

	});

});