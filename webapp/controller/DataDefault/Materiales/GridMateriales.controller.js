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
	'sap/ui/core/Fragment'
	
], function(Controller, JSONModel, MessageToast, DateFormat, library, Filter, FilterOperator, Button, Dialog, List, StandardListItem,  ButtonType,Fragment) {
	"use strict";

	var SortOrder = library.SortOrder;
	
	return Controller.extend("sap.ui.demo.walkthrough.controller.DataDefault.Materiales.GridMateriales", {

		onInit : function() {
			// set explored app's demo model on this sample
			var json = this.initSampleDataModel();
			// Setting json to current view....
				//var json = new sap.ui.model.json.JSONModel("model/products.json");
			this.getView().setModel(json);
			
			var fnPress = this.handleActionPress.bind(this);
			var fnfrPress = this.frmLogisticPress.bind(this);

			this.modes = [
				{
					key: "NavigationDelete",
					text: "Navigation & Delete",
					handler: function(){
						var oTemplate = new sap.ui.table.RowAction({items: [
							new sap.ui.table.RowActionItem({icon: "sap-icon://edit", text: "Edit", press:  fnfrPress}),
							new sap.ui.table.RowActionItem({type: "Delete", press: fnPress})
						]});
						return [2, oTemplate];
					}
				}
			];
			this.getView().setModel(new JSONModel({items: this.modes}), "modes");
			this.switchState("NavigationDelete");
			//this.onInitCalculation();
			//this.onInitDialog();
		},
		
		onInitCalculation : function () {
			var oModel = new JSONModel("model/Calculation.json");
			this.getView().setModel(oModel);
			this._oBuilder = this.getView().byId("builder");

			this._oModelSettings = new JSONModel({
				layoutType: "Default",
				allowComparison: true,
				allowLogical: true,
				readOnly: false
			});
			this.getView().setModel(this._oModelSettings, "settings");
		},
		
		switchState : function(sKey) {
			var oTable = this.byId("table1");
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
			this.LogisticaDisplay = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.Utilities.fragments.AdminMaterialesDisplay", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},
		
		closeDialog: function() {
			this.LogisticaDisplay.close();
		},
		
		initSampleDataModel : function() {
			var oModel = new JSONModel();
			//var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax("model/materiales.json", {
				dataType: "json",
				success: function(oData) {
					var aTemp1 = [];
					var aTemp2 = [];
					var aSuppliersData = [];
					var aCategoryData = [];
					for (var i = 0; i < oData.materiales.length; i++) {
						var oProduct = oData.materiales[i];
						if (oProduct.MDEF_IDMATERIAL && jQuery.inArray(oProduct.MDEF_IDMATERIAL, aTemp1) < 0) {
							aTemp1.push(oProduct.MDEF_IDMATERIAL);
							aSuppliersData.push({Name: oProduct.MDEF_IDMATERIAL});
						}
						if (oProduct.MDEF_SOCIEDAD && jQuery.inArray(oProduct.MDEF_SOCIEDAD, aTemp2) < 0) {
							aTemp2.push(oProduct.MDEF_SOCIEDAD);
							aCategoryData.push({Name: oProduct.MDEF_SOCIEDAD});
						}
						//oProduct.DeliveryDate = (new Date()).getTime() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
						//var d = new Date(oProduct.DeliveryDate);
						//d = formatTime(d);
						//oProduct.DeliveryDateStr = oDateFormat.format(new Date(oProduct.DeliveryDate));
						//oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
						//oProduct.Available = oProduct.Status === "Available" ? true : false;
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
			var aIndices = this.byId("table1").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}
			MessageToast.show(sMsg);
		},
		
		clearAllSortings : function(oEvent) {
			var oTable = this.byId("table1");
			oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},

		sortCategories : function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var oCategoriesColumn = oView.byId("categories");

			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},

		sortCategoriesAndName : function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
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

			this.byId("table1").getBinding("rows").filter(oFilter, "Application");
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
		
		
		oDataInitial: {
		    // Static data
			Items: [
				{
					columnKey: "productId",
					text: "Product ID",
					aggregationRole: "Dimension"
				}, {
					columnKey: "name",
					text: "Name",
					aggregationRole: "Dimension"
				}, {
					columnKey: "category",
					text: "Category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "supplierName",
					text: "Supplier Name",
					aggregationRole: "Dimension"
				}, {
					columnKey: "description",
					text: "Description",
					aggregationRole: "Dimension"
				}, {
					columnKey: "weightMeasure",
					text: "Weight Measure",
					aggregationRole: "Measure"
				}, {
					columnKey: "weightUnit",
					text: "WeightUnit",
					aggregationRole: "Dimension"
				}, {
					columnKey: "price",
					text: "Price",
					aggregationRole: "Measure"
				}, {
					columnKey: "currencyCode",
					text: "Currency Code",
					aggregationRole: "Dimension"
				}, {
					columnKey: "status",
					text: "Status",
					aggregationRole: "Dimension"
				}, {
					columnKey: "quantity",
					text: "Quantity",
					aggregationRole: "Measure"
				}, {
					columnKey: "uom",
					text: "UoM",
					aggregationRole: "Dimension"
				}, {
					columnKey: "width",
					text: "Width",
					aggregationRole: "Measure"
				}, {
					columnKey: "depth",
					text: "Depth",
					aggregationRole: "Measure"
				}, {
					columnKey: "height",
					text: "Height",
					aggregationRole: "Measure"
				}, {
					columnKey: "dimUnit",
					text: "DimUnit",
					aggregationRole: "Dimension"
				}, {
					columnKey: "productPicUrl",
					text: "ProductPicUrl",
					aggregationRole: "Dimension"
				}
			],
            // Runtime data
			DimMeasureItems: [
				{
					columnKey: "name",
					visible: true,
					index: 0,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "category",
					visible: true,
					index: 1,
					role: "series",
					aggregationRole: "Dimension"
				}, {
					columnKey: "price",
					visible: true,
					index: 2,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "quantity",
					visible: true,
					index: 3,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "productId",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "supplierName",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "description",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "weightMeasure",
					visible: false,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "weightUnit",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "currencyCode",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "status",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "uom",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "width",
					visible: false,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "depth",
					visible: false,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "height",
					visible: false,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "dimUnit",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "productPicUrl",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}
			],
			SelectedChartType: "line",
			ShowResetEnabled: false
		},

		// Runtime model
		oJSONModel: null,

		oDataBeforeOpen: {},

		onInitDialog: function() {
			this.oJSONModel = new JSONModel(jQuery.extend(true, {}, this.oDataInitial));
            this.oJSONModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		},

		onOK: function(oEvent) {
			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
			oEvent.getSource().destroy();
		},

		onCancel: function(oEvent) {
			this.oJSONModel.setProperty("/", jQuery.extend(true, {}, this.oDataBeforeOpen));

			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
			oEvent.getSource().destroy();
		},

		onReset: function() {
			this.oJSONModel.setProperty("/", jQuery.extend(true, {}, this.oDataInitial));
		},

		onPersonalizationDialogPress: function() {
			var oPersonalizationDialog = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.Utilities.fragments.Calculation", this);
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
			oPersonalizationDialog.setModel(this.oJSONModel);

			this.getView().addDependent(oPersonalizationDialog);

			this.oDataBeforeOpen = jQuery.extend(true, {}, this.oJSONModel.getData());
			oPersonalizationDialog.open();
		},

		onChangeChartType: function(oEvent) {
			this.oJSONModel.setProperty("/SelectedChartType", oEvent.getParameter("chartTypeKey"));
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
		},

		onChangeDimMeasureItems: function(oEvent) {
			this.oJSONModel.setProperty("/DimMeasureItems", oEvent.getParameter("items"));
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
		},

		_isChangedDimMeasureItems: function() {
			var fnGetArrayElementByKey = function(sKey, sValue, aArray) {
				var aElements = aArray.filter(function(oElement) {
					return oElement[sKey] !== undefined && oElement[sKey] === sValue;
				});
				return aElements.length ? aElements[0] : null;
			};
			var fnGetUnion = function(aDataBase, aData) {
				if (!aData) {
					return jQuery.extend(true, [], aDataBase);
				}
				var aUnion = jQuery.extend(true, [], aData);
				aDataBase.forEach(function(oMItemBase) {
					var oMItemUnion = fnGetArrayElementByKey("columnKey", oMItemBase.columnKey, aUnion);
					if (!oMItemUnion) {
						aUnion.push(oMItemBase);
						return;
					}
					if (oMItemUnion.visible === undefined && oMItemBase.visible !== undefined) {
						oMItemUnion.visible = oMItemBase.visible;
					}
					if (oMItemUnion.index === undefined && oMItemBase.index !== undefined) {
						oMItemUnion.index = oMItemBase.index;
					}
					if (oMItemUnion.role === undefined && oMItemBase.role !== undefined) {
						oMItemUnion.role = oMItemBase.role;
					}
					if (oMItemUnion.aggregationRole === undefined && oMItemBase.aggregationRole !== undefined) {
						oMItemUnion.aggregationRole = oMItemBase.aggregationRole;
					}
				});
				return aUnion;
			};
			var fnIsEqual = function(aDataBase, aData) {
				if (!aData) {
					return true;
				}
				if (aDataBase.length !== aData.length) {
					return false;
				}
				var fnSort = function(a, b) {
                    if (a.columnKey < b.columnKey) {
                        return -1;
                    } else if (a.columnKey > b.columnKey) {
                        return 1;
                    } else {
                        return 0;
                    }
				};
				aDataBase.sort(fnSort);
				aData.sort(fnSort);
				var aItemsNotEqual = aDataBase.filter(function(oDataBase, iIndex) {
					return oDataBase.columnKey !== aData[iIndex].columnKey || oDataBase.visible !== aData[iIndex].visible || oDataBase.index !== aData[iIndex].index || oDataBase.role !== aData[iIndex].role || oDataBase.aggregationRole !== aData[iIndex].aggregationRole;
				});
				return aItemsNotEqual.length === 0;
			};
			if (this.oDataInitial.SelectedChartType !== this.oJSONModel.getProperty("/SelectedChartType")) {
				return true;
			}

			var aDataRuntime = fnGetUnion(this.oDataInitial.DimMeasureItems, this.oJSONModel.getProperty("/DimMeasureItems"));
			return !fnIsEqual(aDataRuntime, this.oDataInitial.DimMeasureItems);
		},
		
		
		
		
		
		
		
		
		
		
		
			filterResetValue: 50,
		filterPreviousValue: 50,

		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleViewSettingsDialogPress: function () {
			if (!this._oDialog) {
				Fragment.load({
					name: "sap.m.sample.ViewSettingsDialogCustom.Dialog",
					controller: this
				}).then(function(oDialog){
					this._oDialog = oDialog;
					// Set initial and reset value for Slider in custom control
					var oSlider = this._oDialog.getFilterItems()[0].getCustomControl();
					oSlider.setValue(this.filterResetValue);
					this._oDialog.setModel(this.getView().getModel());
					this._oDialog.open();
				}.bind(this));
			} else {
				this._oDialog.setModel(this.getView().getModel());
				this._oDialog.open();
			}
		},

		handleSliderChange: function (oEvent) {
			var oNewValue = oEvent.getParameter("value"),
				oCustomFilter = this._oDialog.getFilterItems()[0];

			// Set the custom filter's count and selected properties
			// if the value has changed
			if (oNewValue !== this.filterPreviousValue) {
				oCustomFilter.setFilterCount(1);
				oCustomFilter.setSelected(true);
			} else {
				oCustomFilter.setFilterCount(0);
				oCustomFilter.setSelected(false);
			}
		},

		handleConfirm: function (oEvent) {
			var oSlider = this._oDialog.getFilterItems()[0].getCustomControl();
			this.filterPreviousValue = oSlider.getValue();
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString + " Value is " + oSlider.getValue());
			}
		},

		handleCancel: function () {
			var oCustomFilter = this._oDialog.getFilterItems()[0],
				oSlider = oCustomFilter.getCustomControl();

			oSlider.setValue(this.filterPreviousValue);

			if (this.filterPreviousValue !== this.filterResetValue) {
				oCustomFilter.setFilterCount(1);
				oCustomFilter.setSelected(true);
			} else {
				oCustomFilter.setFilterCount(0);
				oCustomFilter.setSelected(false);
			}
		},

		handleResetFilters: function () {
			var oCustomFilter = this._oDialog.getFilterItems()[0],
				oSlider = oCustomFilter.getCustomControl();
			oSlider.setValue(this.filterResetValue);
			oCustomFilter.setFilterCount(0);
			oCustomFilter.setSelected(false);
		}
		
	});

});