jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/table/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, MessageToast, DateFormat, library, Filter, FilterOperator) {
	"use strict";

	var SortOrder = library.SortOrder;
	
	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.TypeChange.GridTypeChange", {

		onInit : function() {
			// set explored app's demo model on this sample
			var json = this.initSampleDataModel();
			// Setting json to current view....
				//var json = new sap.ui.model.json.JSONModel("model/products.json");
			this.getView().setModel(json);
			
			var fnPress = this.handleActionPress.bind(this);
			var fnfrPress = this.frmLogisticPress.bind(this);

		// 	this.modes = [
		// 		{
		// 			key: "NavigationDelete",
		// 			text: "Navigation & Delete",
		// 			handler: function(){
		// 				var oTemplate = new sap.ui.table.RowAction({items: [
		// 					new sap.ui.table.RowActionItem({icon: "sap-icon://edit", text: "Edit", press:  fnfrPress}),
		// 					new sap.ui.table.RowActionItem({type: "Delete", press: fnPress})
		// 				]});
		// 				return [2, oTemplate];
		// 			}
		// 		}
		// 	];
		// 	this.getView().setModel(new JSONModel({items: this.modes}), "modes");
		// 	this.switchState("NavigationDelete");
		 },
		
		initSampleDataModel : function() {
			var oModel = new JSONModel();
			//var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax("model/TasaCambio.json", {
				dataType: "json",
				success: function(oData) {
					var aTemp1 = [];
					var aTemp2 = [];
					var aSuppliersData = [];
					var aCategoryData = [];
					for (var i = 0; i < oData.TASACAMBIO.length; i++) {
						var oProduct = oData.TASACAMBIO[i];
						if (oProduct.TIPO && jQuery.inArray(oProduct.TIPO, aTemp1) < 0) {
							aTemp1.push(oProduct.TIPO);
							aSuppliersData.push({Name: oProduct.TIPO});
						}
						if (oProduct.PAIS && jQuery.inArray(oProduct.PAIS, aTemp2) < 0) {
							aTemp2.push(oProduct.PAIS);
							aCategoryData.push({Name: oProduct.PAIS});
						}
						oProduct.DeliveryDate = (new Date()).getTime() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
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
		
		switchState : function(sKey) {
			var oTable = this.byId("tblTasaCambio");
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
		
		frmLogisticPress: function(oEvent) {
			//this.onPersonalizationDialogPress();
			this.LogisticaDisplay = sap.ui.xmlfragment("cbc.co.simulador_costos.view.Utilities.fragments.AdminTypeChange", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},
		
		closeDialog: function() {
			this.LogisticaDisplay.close();
		},
	
		updateMultipleSelection: function(oEvent) {
			var oMultiInput = oEvent.getSource(),
				sTokensPath = oMultiInput.getBinding("tokens").getContext().getPath() + "/" + oMultiInput.getBindingPath("tokens"),
				aRemovedTokensKeys = oEvent.getParameter("removedTokens").map(function(oToken) {
					return oToken.getKey();
				}),
				aCurrentTokensData = oMultiInput.getTokens().map(function(oToken) {
					return {"Key" : oToken.getKey(), "Name" : oToken.getText()};
				});

			aCurrentTokensData = aCurrentTokensData.filter(function(oToken){
				return aRemovedTokensKeys.indexOf(oToken.Key) === -1;
			});

			oMultiInput.getModel().setProperty(sTokensPath, aCurrentTokensData);
		},

		formatAvailableToObjectState : function(bAvailable) {
			return bAvailable ? "Success" : "Error";
		},

		formatAvailableToIcon : function(bAvailable) {
			return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
		},

		handleDetailsPress : function(oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		},

		onPaste: function(oEvent) {
			var aData = oEvent.getParameter("data");
			sap.m.MessageToast.show("Pasted Data: " + aData);
		},
		
		getSelectedIndices: function(evt) {
			var aIndices = this.byId("tblTasaCambio").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}
			MessageToast.show(sMsg);
		},
		
		clearAllSortings : function(oEvent) {
			var oTable = this.byId("tblTasaCambio");
			oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},

		sortCategories : function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("tblTasaCambio");
			var oCategoriesColumn = oView.byId("categories");

			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},

		sortCategoriesAndName : function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("tblTasaCambio");
			oTable.sort(oView.byId("categories"), SortOrder.Ascending, false);
			oTable.sort(oView.byId("name"), SortOrder.Ascending, true);
		},
		
		_filter : function() {
			var oFilter = null;

			if (this._oGlobalFilter && this._oPriceFilter) {
				oFilter = new sap.ui.model.Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
				oFilter = this._oPriceFilter;
			}

			this.byId("tblTasaCambio").getBinding("rows").filter(oFilter, "Application");
		},
		
		filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("Name", FilterOperator.Contains, sQuery),
					new Filter("Category", FilterOperator.Contains, sQuery)
				], false);
			}

			this._filter();
		}
		
		
	});

});