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
	'sap/m/MessageBox',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/ui/core/Fragment',
	'sap/m/Token'
], function(Controller, JSONModel, MessageToast, DateFormat, library, Filter, FilterOperator, TablePersoController, MessageBox, Export, ExportTypeCSV, Fragment, Token) {
	"use strict";

	var SortOrder = library.SortOrder;
	
	return Controller.extend("cbc.co.simulador_costos.controller.Admon.CreateParameters.MasterSap", {

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
			
			//var _multiInputPais = this.byId("multiInputPais");
			//var oModel = new JSONModel("model/productsN.json");
			// the default limit of the model is set to 100. We want to show all the entries.
			//oModel.setSizeLimit(1000000);
			//_multiInputPais.getView().setModel(oModel);
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
			var aIndices = this.byId("tblMasterSap").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}
			MessageToast.show(sMsg);
		},
		
		clearAllSortings : function(oEvent) {
			var oTable = this.byId("tblMasterSap");
			oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},

		sortCategories : function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("tblMasterSap");
			var oCategoriesColumn = oView.byId("categories");

			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},

		sortCategoriesAndName : function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("tblMasterSap");
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

			this.byId("tblMasterSap").getBinding("rows").filter(oFilter, "Application");
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
		},
		
		onDataExport : function(oEvent) {

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ";"
				}),

				// Pass in the model created above
				models : this.getView().getModel(),

				// binding information for the rows aggregation
				rows : {
					path : "/ProductCollection"
				},

				// column definitions with column name and binding info for the content

				columns : [{
					name : "Product",
					template : {
						content : "{Name}"
					}
				}, {
					name : "Product ID",
					template : {
						content : "{ProductId}"
					}
				}, {
					name : "Supplier",
					template : {
						content : "{SupplierName}"
					}
				}, {
					name : "Dimensions",
					template : {
						content : {
							parts : ["Width", "Depth", "Height", "DimUnit"],
							formatter : function(width, depth, height, dimUnit) {
								return width + " x " + depth + " x " + height + " " + dimUnit;
							},
							state : "Warning"
						}
					// "{Width} x {Depth} x {Height} {DimUnit}"
					}
				}, {
					name : "Weight",
					template : {
						content : "{WeightMeasure} {WeightUnit}"
					}
				}, {
					name : "Price",
					template : {
						content : "{Price} {CurrencyCode}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		},
	
		handleTxtFilter : function(oEvent) {
			var sQuery = oEvent ? oEvent.getParameter("query") : null;
			this._oTxtFilter = null;

			if (sQuery) {
				this._oTxtFilter = new Filter([
					new Filter("Name", FilterOperator.Contains, sQuery),
					new Filter("Status", FilterOperator.Contains, sQuery)
				], false);
			}

			this.getView().getModel("ui").setProperty("/filterValue", sQuery);

			if (oEvent) {
				this._filter();
			}
		},

		clearAllFilters : function() {
			this.handleTxtFilter();
			this.handleFacetFilterReset();
			this._filter();
		},

		_getFacetFilterLists : function() {
			var oFacetFilter = this.byId("facetFilter");
			return oFacetFilter.getLists();
		},

		handleFacetFilterReset : function(oEvent) {
			var aFacetFilterLists = this._getFacetFilterLists();

			for (var i = 0; i < aFacetFilterLists.length; i++) {
				aFacetFilterLists[i].setSelectedKeys();
			}
			this._oFacetFilter = null;

			if (oEvent) {
				this._filter();
			}
		},

		handleListClose : function(oEvent) {
			var aFacetFilterLists = this._getFacetFilterLists().filter(function(oList) {
				return oList.getActive() && oList.getSelectedItems().length;
			});

			this._oFacetFilter = new Filter(aFacetFilterLists.map(function(oList) {
				return new Filter(oList.getSelectedItems().map(function(oItem) {
					return new Filter(oList.getTitle(), FilterOperator.EQ, oItem.getText());
				}), false);
			}), true);

			this._filter();
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