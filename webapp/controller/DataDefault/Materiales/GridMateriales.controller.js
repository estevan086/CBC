sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	// "sap/ui/core/mvc/Controller",
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
	'sap/ui/core/Fragment',
	'sap/m/MessageBox',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	"cbc/co/simulador_costos/controller/Versiones/SelectVersion",
	"sap/ui/core/message/Message",
	"sap/ui/core/library",
	"sap/ui/model/BindingMode",

], function (Controller, JSONModel, MessageToast, DateFormat, library, Filter, FilterOperator, Button, Dialog, List, StandardListItem,
	ButtonType, Fragment, MessageBox, Export, ExportTypeCSV, SelectVersion, Message, libraryCore, BindingMode) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = libraryCore.ValueState;

	// shortcut for sap.ui.core.MessageType
	var MessageType = libraryCore.MessageType;

	this.updatedRecords = [];
	var that = this;
	var SortOrder = library.SortOrder;
	this.detailCommodite = [];
	this.tipoCambio = [];
	this.centroYear = [];
	this.moneda = [];
	this.commodite = [];

	const cDefaultVersion = "DEFAULT";
	var version = "";

	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.Materiales.GridMateriales", {
		SelectVersion: SelectVersion,
		onInit: function () {
			// set explored app's demo model on this sample
			// var json = this.initSampleDataModel();
			// // Setting json to current view....
			// this.getView().setModel(json);

			var oMessageManager, oModel, oView;

			oView = this.getView();

			// set message model
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");

			// or just do it for the whole view
			oMessageManager.registerObject(oView, true);

			// create a default model with somde demo data
			oModel = new JSONModel({
				MandatoryInputValue: "",
				DateValue: null,
				IntegerValue: undefined,
				Dummy: ""
			});
			oModel.setDefaultBindingMode(BindingMode.TwoWay);
			oView.setModel(oModel);

			var oUploader = this.getView().byId("fileUploader");
			oUploader.oBrowse.setText("Importar");
			oUploader.oFilePath.setVisible(false);
			oUploader.addEventDelegate({
				onAfterRendering: function () {
					this.setFileType(['csv']);
				}
			}, oUploader);

			/*this.loadModelCbYear();
			this.loadModel();
			this.loadModelCommoditie();
			this.loadModelCommoditieDetail();
			// this.loadModelIcoterm();
			this.loadModelUnidaMedida();
			this.loadModelMoneda();
			this.loadModelTipoCambio();*/

			if (this.getRouter().getRoute("rtChMateriales")) {
				this.getRouter().getRoute("rtChMateriales").attachPatternMatched(this.onMyRoutePatternMatched, this);
			}
			if (this.getRouter().getRoute("rtChMaterialesVersion")) {
				this.getRouter().getRoute("rtChMaterialesVersion").attachPatternMatched(this.onMyRoutePatternMatchedVersion, this);
			}
			SelectVersion.init(this, "MAT");

			// this.editCellsTable(false);

			// var fnPress = this.handleActionPress.bind(this);
			// var fnfrPress = this.frmLogisticPress.bind(this);

			// this.modes = [
			// 	{
			// 		key: "NavigationDelete",
			// 		text: "Navigation & Delete",
			// 		handler: function(){
			// 			var oTemplate = new sap.ui.table.RowAction({items: [
			// 				new sap.ui.table.RowActionItem({icon: "sap-icon://edit", text: "Edit", press:  fnfrPress}),
			// 				new sap.ui.table.RowActionItem({type: "Delete", press: fnPress})
			// 			]});
			// 			return [2, oTemplate];
			// 		}
			// 	}
			// ];
			// this.getView().setModel(new JSONModel({items: this.modes}), "modes");
			// // this.switchState("NavigationDelete");
			// //this.onInitCalculation();
			// //this.onInitDialog();

			// var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChCommodities");
			// myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);			

		},
		onMyRoutePatternMatched: function (event) {
			var version = "";

			this.loadMaterial();
		},

		onMyRoutePatternMatchedVersion: function (oEvent) {
			SelectVersion.open();
			this.getView().byId("btnAdmin").setVisible(false);
		},

		onShowVersion: function (oData) {
			var aFilter = [];
			version = oData.idVersion;

			aFilter.push(new Filter("Version", FilterOperator.EQ, version));
			aFilter.push(new Filter("Fiscyear", FilterOperator.EQ, oData.year));

			this.loadModelCbYear();
			this.loadModel();
			this.loadModelCommoditie();
			this.loadModelCommoditieDetail();
			// this.loadModelIcoterm();
			this.loadModelUnidaMedida();
			this.loadModelMoneda();
			this.loadModelTipoCambio();
		},
		onInitCalculation: function () {
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

		switchState: function (sKey) {
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

		handleActionPress: function (oEvent) {
			var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");
			MessageToast.show("Item " + (oItem.getText() || oItem.getType()) + " pressed for product with id " +
				this.getView().getModel().getProperty("ProductId", oRow.getBindingContext()));
		},

		frmLogisticPress: function (oEvent) {
			//this.onPersonalizationDialogPress();
			this.LogisticaDisplay = sap.ui.xmlfragment("cbc.co.simulador_costos.view.Utilities.fragments.AdminMaterialesDisplay", this);
			this.LogisticaDisplay.open();
			//this.getOwnerComponent().OpnFrmLogitica();
		},

		closeDialog: function () {
			this.LogisticaDisplay.close();
		},

		initSampleDataModel: function () {
			// var oModel = new JSONModel();
			// //var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			// jQuery.ajax("model/materiales.json", {
			// 	dataType: "json",
			// 	success: function(oData) {
			// 		var aTemp1 = [];
			// 		var aTemp2 = [];
			// 		var aSuppliersData = [];
			// 		var aCategoryData = [];
			// 		for (var i = 0; i < oData.materiales.length; i++) {
			// 			var oProduct = oData.materiales[i];
			// 			if (oProduct.MDEF_IDMATERIAL && jQuery.inArray(oProduct.MDEF_IDMATERIAL, aTemp1) < 0) {
			// 				aTemp1.push(oProduct.MDEF_IDMATERIAL);
			// 				aSuppliersData.push({Name: oProduct.MDEF_IDMATERIAL});
			// 			}
			// 			if (oProduct.MDEF_SOCIEDAD && jQuery.inArray(oProduct.MDEF_SOCIEDAD, aTemp2) < 0) {
			// 				aTemp2.push(oProduct.MDEF_SOCIEDAD);
			// 				aCategoryData.push({Name: oProduct.MDEF_SOCIEDAD});
			// 			}
			// 			//oProduct.DeliveryDate = (new Date()).getTime() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
			// 			//var d = new Date(oProduct.DeliveryDate);
			// 			//d = formatTime(d);
			// 			//oProduct.DeliveryDateStr = oDateFormat.format(new Date(oProduct.DeliveryDate));
			// 			//oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
			// 			//oProduct.Available = oProduct.Status === "Available" ? true : false;
			// 		}

			// 		oData.Suppliers = aSuppliersData;
			// 		oData.Categories = aCategoryData;

			// 		oModel.setData(oData);
			// 	},
			// 	error: function() {
			// 		jQuery.sap.log.error("failed to load json");
			// 	}
			// });

			// return oModel;

			var oModel = new JSONModel();

			jQuery.ajax("model/MaterialTest.json", {
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

		updateMultipleSelection: function (oEvent) {
			var oMultiInput = oEvent.getSource(),
				sTokensPath = oMultiInput.getBinding("tokens").getContext().getPath() + "/" + oMultiInput.getBindingPath("tokens"),
				aRemovedTokensKeys = oEvent.getParameter("removedTokens").map(function (oToken) {
					return oToken.getKey();
				}),
				aCurrentTokensData = oMultiInput.getTokens().map(function (oToken) {
					return {
						"Key": oToken.getKey(),
						"Name": oToken.getText()
					};
				});

			aCurrentTokensData = aCurrentTokensData.filter(function (oToken) {
				return aRemovedTokensKeys.indexOf(oToken.Key) === -1;
			});

			oMultiInput.getModel().setProperty(sTokensPath, aCurrentTokensData);
		},

		formatAvailableToObjectState: function (bAvailable) {
			return bAvailable ? "Success" : "Error";
		},

		formatAvailableToIcon: function (bAvailable) {
			return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
		},

		handleDetailsPress: function (oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		},

		onPaste: function (oEvent) {
			var aData = oEvent.getParameter("data");
			sap.m.MessageToast.show("Pasted Data: " + aData);
		},

		getSelectedIndices: function (evt) {
			var aIndices = this.byId("table1").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}
			MessageToast.show(sMsg);
		},

		clearAllSortings: function (oEvent) {
			var oTable = this.byId("table1");
			oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},

		sortCategories: function (oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var oCategoriesColumn = oView.byId("categories");

			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/
				true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},

		sortCategoriesAndName: function (oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
			oTable.sort(oView.byId("categories"), SortOrder.Ascending, false);
			oTable.sort(oView.byId("name"), SortOrder.Ascending, true);
		},

		_filter: function () {
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

		filterGlobally: function (oEvent) {
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
			Items: [{
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
			}],
			// Runtime data
			DimMeasureItems: [{
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
			}],
			SelectedChartType: "line",
			ShowResetEnabled: false
		},

		// Runtime model
		oJSONModel: null,

		oDataBeforeOpen: {},

		onInitDialog: function () {
			this.oJSONModel = new JSONModel(jQuery.extend(true, {}, this.oDataInitial));
			this.oJSONModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		},

		onOK: function (oEvent) {
			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
			oEvent.getSource().destroy();
		},

		onCancel: function (oEvent) {
			this.oJSONModel.setProperty("/", jQuery.extend(true, {}, this.oDataBeforeOpen));

			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
			oEvent.getSource().destroy();
		},

		onReset: function () {
			this.oJSONModel.setProperty("/", jQuery.extend(true, {}, this.oDataInitial));
		},

		onPersonalizationDialogPress: function () {
			var oPersonalizationDialog = sap.ui.xmlfragment("cbc.co.simulador_costos.view.Utilities.fragments.Calculation", this);
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
			oPersonalizationDialog.setModel(this.oJSONModel);

			this.getView().addDependent(oPersonalizationDialog);

			this.oDataBeforeOpen = jQuery.extend(true, {}, this.oJSONModel.getData());
			oPersonalizationDialog.open();
		},

		onChangeChartType: function (oEvent) {
			this.oJSONModel.setProperty("/SelectedChartType", oEvent.getParameter("chartTypeKey"));
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
		},

		onChangeDimMeasureItems: function (oEvent) {
			this.oJSONModel.setProperty("/DimMeasureItems", oEvent.getParameter("items"));
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
		},

		_isChangedDimMeasureItems: function () {
			var fnGetArrayElementByKey = function (sKey, sValue, aArray) {
				var aElements = aArray.filter(function (oElement) {
					return oElement[sKey] !== undefined && oElement[sKey] === sValue;
				});
				return aElements.length ? aElements[0] : null;
			};
			var fnGetUnion = function (aDataBase, aData) {
				if (!aData) {
					return jQuery.extend(true, [], aDataBase);
				}
				var aUnion = jQuery.extend(true, [], aData);
				aDataBase.forEach(function (oMItemBase) {
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
			var fnIsEqual = function (aDataBase, aData) {
				if (!aData) {
					return true;
				}
				if (aDataBase.length !== aData.length) {
					return false;
				}
				var fnSort = function (a, b) {
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
				var aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
					return oDataBase.columnKey !== aData[iIndex].columnKey || oDataBase.visible !== aData[iIndex].visible || oDataBase.index !==
						aData[iIndex].index || oDataBase.role !== aData[iIndex].role || oDataBase.aggregationRole !== aData[iIndex].aggregationRole;
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

		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleViewSettingsDialogPress: function () {
			if (!this._oDialog) {
				Fragment.load({
					name: "sap.m.sample.ViewSettingsDialogCustom.Dialog",
					controller: this
				}).then(function (oDialog) {
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
		},

		/**
		 * After rendering page
		 * @function
		 * @param 
		 * @private
		 */
		onAfterRendering: function () {
			// debugger;
			// var table = this.getView().byId('tblMaterial');
			// for (var i = 0; i < table.getColumns().length; i++) {
			// 	table.autoResizeColumn(i);
			// }
		},

		/**
		 * Edit rows
		 * @function
		 * @param 
		 * @private
		 */
		handleEditPress: function (oEvent, Data) {
			// //var oRow = oEvent.getParameter("row");
			// var oItem = oEvent.getParameter("item");

			// var oTable = this.byId("tblMaterial");
			// var oRowData = oEvent.getSource().getBindingContext().getProperty();

			var oRowEdited = oEvent.getSource().getParent().getParent(),
				oEntidad = {};

			// oRowEdited.getCells().filter(result => result.mProperties.value).map(cell => cell.setProperty("editable", true));

			// oRowEdited.getCells()[6].setProperty("editable", true);
			//Columna Unidad de medida
			oRowEdited.getCells()[4].setProperty("editable", true);
			//Columna Moneda
			oRowEdited.getCells()[5].setProperty("editable", true);
			//Columna Peso Material
			oRowEdited.getCells()[6].setProperty("editable", true);
			//Columna commoditie
			oRowEdited.getCells()[7].setProperty("editable", true);
			//Columna precio productivo
			oRowEdited.getCells()[8].setProperty("editable", true);
			//Columna costo conversión
			oRowEdited.getCells()[9].setProperty("editable", true);
			//Columna costo adicional
			oRowEdited.getCells()[10].setProperty("editable", true);
			//Columna costo envio
			oRowEdited.getCells()[11].setProperty("editable", true);
			//Columna icoterm
			oRowEdited.getCells()[12].setProperty("editable", true);
			//Columna costo material
			// oRowEdited.getCells()[13].setProperty("editable", true);
			//Columna formula
			oRowEdited.getCells()[14].setProperty("editable", true);
			//Columna icono formula
			// oRowEdited.getCells()[15].setProperty("editable", true);
			//Columna otros costos
			oRowEdited.getCells()[16].setProperty("editable", true);
			//Columna % Transferencia
			oRowEdited.getCells()[17].setProperty("editable", true);
			//Columna costo transferencia
			// oRowEdited.getCells()[18].setProperty("editable", true);
			//Columna costo precio premisa
			// oRowEdited.getCells()[19].setProperty("editable", true);

			MessageToast.show("Editar Material " + oRowEdited.getCells()[0].getProperty("text"));

			oEntidad.RowPath = oEvent.getSource().getBindingContext().sPath.split('/')[2];
			that.updatedRecords.push(oEntidad);

		},

		/**
		 * Filter table
		 * @function
		 * @param 
		 * @private
		 */
		filterGloballySup: function (oEvent) {
			// var sQuery = oEvent.getParameter("query");
			var sQuery = oEvent.getParameter("newValue");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("MDEF_IDMATERIAL", FilterOperator.Contains, sQuery),
					new Filter("MDEF_MATERIAL", FilterOperator.Contains, sQuery),
					new Filter("MDEF_SOCIEDAD", FilterOperator.Contains, sQuery),
					new Filter("MDEF_CENTRO", FilterOperator.Contains, sQuery),
					new Filter("MDEF_UMD", FilterOperator.Contains, sQuery),
					new Filter("MDEF_MONEDA", FilterOperator.Contains, sQuery),
					new Filter("MDEF_PESOMATERIAL", FilterOperator.Contains, sQuery),
					new Filter("MDEF_COMMODITIE", FilterOperator.Contains, sQuery),
					new Filter("MDEF_PRECIOPRODUCTIVO", FilterOperator.Contains, sQuery),
					new Filter("MDEF_COSTOCONVERSION", FilterOperator.Contains, sQuery),
					new Filter("MDEF_COSTOADICIONAL", FilterOperator.Contains, sQuery),
					new Filter("MDEF_COSTOENVIO", FilterOperator.Contains, sQuery),
					new Filter("MDEF_ICOTERM", FilterOperator.Contains, sQuery),
					new Filter("MDEF_COSTOMATERIAL", FilterOperator.Contains, sQuery),
					new Filter("MDEF_FORMULAOTROSCOSTOS", FilterOperator.Contains, sQuery),
					new Filter("MDEF_OTROSCOSTOS", FilterOperator.Contains, sQuery),
					new Filter("MDEF_%TRANSFERENCIA", FilterOperator.Contains, sQuery),
					new Filter("MDEF_COSTOTRANSFERENCIA", FilterOperator.Contains, sQuery),
					new Filter("MDEF_PRECIOPREMISA", FilterOperator.Contains, sQuery),
					new Filter("MDEF_PERIODO", FilterOperator.Contains, sQuery),
					new Filter("MDEF_MES", FilterOperator.Contains, sQuery)
				], false);
			}

			this.filterSup();
		},

		/**
		 * Filter 
		 * @function
		 * @param 
		 * @private
		 */
		filterSup: function () {
			var oFilter = null;

			if (this._oGlobalFilter) {
				oFilter = new sap.ui.model.Filter([this._oGlobalFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}

			this.byId("tblMaterial").getBinding("rows").filter(oFilter, "Application");
		},

		/**
		 * Clear Filter 
		 * @function
		 * @param 
		 * @private
		 */
		clearAllFilters: function (oEvent) {
			var oTable = this.byId("tblMaterial");

			var oUiModel = this.getView().getModel("ui");

			this._oGlobalFilter = null;

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}

			// var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
			// 	oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
			// 	oEntidad = {},
			// 	oDetail = {};

			// oDetail = {
			// 	Formula: '1',
			// 	IdCommoditie: '1',
			// 	Sociedad: '1',
			// 	Centro: '1',
			// 	UnidadMedida: '1',
			// 	Moneda: '1',
			// 	Mes: '1',
			// 	Year: '1',
			// 	Recordmode: '1'
			// };

			// oEntidad = {
			// 	IdCommoditie: '1111',
			// 	Descripcion: 'Prueba',
			// 	detailCommoditiesSet: []
			// };

			// oEntidad.detailCommoditiesSet.push(oDetail);

			// var oCreate = this.fnCreateEntity(oModelService, "/headerCommoditiesSet", oEntidad);

		},

		// onMyRoutePatternMatched: function (event) {
		// 	// your code when the view is about to be displayed ..

		// 	//	var json = this.initSampleDataModel();
		// 	//	this.getView().setModel(json);

		// 	//Url Servicio
		// 	var oModel = this.getOwnerComponent().getModel("ModelSimulador");
		// 	var sServiceUrl = oModel.sServiceUrl;

		// 	//Definir modelo del servicio web
		// 	var oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		// 	//Definir filtro

		// 	//Leer datos del ERP
		// 	var oRead = this.fnReadEntity(oModelService, "/materialDefatultSet", null);

		// 	// if (oRead.tipo === "S") {
		// 	// 	this.oDataDetalleCommodities = oRead.datos.results;
		// 	// } else {
		// 	// 	MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
		// 	// }

		// 	// var oDataDetalleCommodities = "";
		// 	// //SI el modelo NO existe, se crea.
		// 	// if (!oDataDetalleCommodities) {
		// 	// 	oDataDetalleCommodities = {
		// 	// 		lstItemsCommodities: []
		// 	// 	};
		// 	// }

		// 	// oDataDetalleCommodities.lstItemsCommodities = this.oDataDetalleCommodities;
		// 	// var oTablaDetalleCommodities = this.byId("tblCommodities");
		// 	// var oModel2 = new sap.ui.model.json.JSONModel(oDataDetalleCommodities);
		// 	// oTablaDetalleCommodities.setModel(oModel2);

		// },

		fnCreateEntity: function (pModelo, pEntidad, pDatoEndidad) {
			var vMensaje = null;
			var oMensaje = {};

			var fnSucess = function (data, response) {
				oMensaje.tipo = "S";
				oMensaje.datos = data;
			};
			var fnError = function (e) {
				vMensaje = JSON.parse(e.response.body);
				vMensaje = vMensaje.error.message.value;

				oMensaje.tipo = "E";
				oMensaje.msjs = vMensaje;
			};

			pModelo.create(pEntidad, pDatoEndidad, null, fnSucess, fnError, false);

			return oMensaje;
		},

		/**
		 * Load model data in table
		 * @function
		 * @param 
		 * @private
		 */
		loadModel: function (event) {
			var sServiceUrl = "",
				oModelService = "",
				aListMaterial = [];

			sServiceUrl = this.getOwnerComponent().getModel("ModelSimulador").sServiceUrl;
			oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/materialDefatultSet", null);

			if (oRead.tipo === "S") {
				aListMaterial = oRead.datos.results;
			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
				return;
			}

			this.mapDataTable(aListMaterial);

		},

		/**
		 * Load model data in table
		 * @function
		 * @param 
		 * @private
		 */
		mapDataTable: function (p_listMaterial) {

			var oList = "",
				aList = {
					MATERIAL: []
				},
				oModel = "";

			for (var i = 0; i < p_listMaterial.length; i++) {

				var value = p_listMaterial[i],
					oMaterial = {
						MDEF_IDMATERIAL: value.Material,
						MDEF_MATERIAL: value.Txtmd,
						MDEF_SOCIEDAD: value.CompCode,
						MDEF_CENTRO: value.Plant,
						MDEF_UMD: value.BaseUom,
						MDEF_UMD_SELECT: value.BaseUom,
						MDEF_MONEDA: value.Currency,
						MDEF_MONEDA_SELECT: value.Currency,
						MDEF_PESOMATERIAL: Number(value.NetWeight) === 0 ? '' : Number(value.NetWeight),
						MDEF_COMMODITIE: value.commodit,
						MDEF_COMMODITIE_ID: value.commodit,
						MDEF_COMMODITIE_SELECT: value.commodit,
						MDEF_PRECIOPRODUCTIVO: Number(value.preprodc) === 0 ? '' : Number(value.preprodc),
						MDEF_COSTOCONVERSION: Number(value.costconv) === 0 ? '' : Number(value.costconv),
						MDEF_COSTOADICIONAL: Number(value.costadic) === 0 ? '' : Number(value.costadic),
						MDEF_COSTOENVIO: Number(value.costenv) === 0 ? '' : Number(value.costenv),
						MDEF_ICOTERM: value.yicoterm,
						MDEF_ICOTERM_ID: value.yicoterm,
						MDEF_COSTOMATERIAL: Number(value.costmat) === 0 ? '' : Number(value.costmat),
						MDEF_FORMULAOTROSCOSTOS: Number(value.fotrcost) === 0 ? '' : Number(value.fotrcost),
						MDEF_OTROSCOSTOS: Number(value.otrocost) === 0 ? '' : Number(value.otrocost),
						MDEF_PCTRANSFERENCIA: Number(value.ptransf) === 0 ? '' : Number(value.ptransf),
						MDEF_COSTOTRANSFERENCIA: Number(value.costrans) === 0 ? '' : Number(value.costrans),
						MDEF_PRECIOPREMISA: Number(value.ppremisa) === 0 ? '' : Number(value.ppremisa),
						MDEF_IDCATEGORIA: value.catgoria,
						MDEF_CATEGORIA: value.Txtcat,
						MDEF_IDSUBCATEGORIA: value.subcateg,
						MDEF_SUBCATEGORIA: value.Txtsubcat,
						MDEF_IDFAMILIA: value.yfamilia,
						MDEF_FAMILIA: value.Txtfam,
						MDEF_IDSUFAMILIA: value.ysubfamil,
						MDEF_SUBFAMILIA: value.Txtsubfam,
						MDEF_PERIODO: value.yfiscyear,
						MDEF_MES: value.yfiscper3
					};

				aList.MATERIAL.push(oMaterial);

			}

			oList = this.getView().byId("tblMaterial");

			oModel = new sap.ui.model.json.JSONModel(aList);
			oList.setModel(oModel);
		},

		/**
		 * Save data material
		 * @function
		 * @param 
		 * @private
		 */
		saveMaterial: function (oEvent) {
			var oTable = this.byId("tblMaterial"),
				sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oEntidad = {},
				oDetail = {};

			oEntidad = {
				Material: '1111',
				Descrip: 'Save',
				materialDefatultSet: []
			};

			// does not remove the manually set ValueStateText we set in onValueStatePress():
			sap.ui.getCore().getMessageManager().removeAllMessages();

			for (var i = 0; i < that.updatedRecords.length; i++) {

				var CurrentRow = that.updatedRecords[i];

				var oTempRow = oTable.getModel().getData().MATERIAL[CurrentRow.RowPath];

				this.checkErrorPosition(oTempRow);

				oDetail = {
					Txtmd: oTempRow.MDEF_MATERIAL,
					Material: oTempRow.MDEF_IDMATERIAL,
					CompCode: oTempRow.MDEF_SOCIEDAD,
					Plant: oTempRow.MDEF_CENTRO,
					BaseUom: oTempRow.MDEF_UMD_SELECT,
					Currency: oTempRow.MDEF_MONEDA_SELECT,
					Txtsubfam: oTempRow.MDEF_SUBFAMILIA,
					Txtfam: oTempRow.MDEF_FAMILIA,
					Txtsubcat: oTempRow.MDEF_SUBCATEGORIA,
					Txtcat: oTempRow.MDEF_CATEGORIA,
					// Recordmode: oTempRow.MDEF_IDMATERIAL,
					catgoria: oTempRow.MDEF_IDCATEGORIA,
					subcateg: oTempRow.MDEF_IDSUBCATEGORIA,
					yfamilia: oTempRow.MDEF_IDFAMILIA,
					ysubfamil: oTempRow.MDEF_IDSUFAMILIA,
					yfiscyear: oTempRow.MDEF_PERIODO,
					// Fiscvarnt: oTempRow.MDEF_IDMATERIAL,
					yfiscper3: oTempRow.MDEF_MES,
					NetWeight: oTempRow.MDEF_PESOMATERIAL,
					// UnitOfWt: oTempRow.MDEF_IDMATERIAL,
					commodit: oTempRow.MDEF_COMMODITIE_SELECT.toString(),
					yicoterm: oTempRow.MDEF_ICOTERM_ID.toString(),
					fotrcost: oTempRow.MDEF_FORMULAOTROSCOSTOS.toString(),
					// Version: oTempRow.MDEF_IDMATERIAL,
					// estado: oTempRow.MDEF_IDMATERIAL,
					// Date0: oTempRow.MDEF_IDMATERIAL,
					// usuario: oTempRow.MDEF_IDMATERIAL,
					preprodc: oTempRow.MDEF_PRECIOPRODUCTIVO.toString(),
					costconv: oTempRow.MDEF_COSTOCONVERSION.toString(),
					costadic: oTempRow.MDEF_COSTOADICIONAL.toString(),
					costenv: oTempRow.MDEF_COSTOENVIO.toString(),
					costmat: oTempRow.MDEF_COSTOMATERIAL.toString(),
					otrocost: oTempRow.MDEF_OTROSCOSTOS.toString(),
					ptransf: oTempRow.MDEF_PCTRANSFERENCIA.toString(),
					costrans: oTempRow.MDEF_COSTOTRANSFERENCIA.toString(),
					ppremisa: oTempRow.MDEF_PRECIOPREMISA.toString()

				};

				oEntidad.materialDefatultSet.push(oDetail);
			}

			if (sap.ui.getCore().getMessageManager().getMessageModel().getData().filter(result => result.type === "Error").length > 0) {

				MessageBox.show(
					"Existen campos por validar", {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
							// actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							// onClose: function (oAction) {
							// 	/ * do something * /
							// }
					}
				);

				return;

			}

			var oCreate = this.fnCreateEntity(oModelService, "/materialsaveSet", oEntidad);

			if (oCreate.tipo === 'S') {

				MessageBox.show(
					'Datos guardados correctamente', {
						icon: MessageBox.Icon.SUCCESS,
						title: "Exito",
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
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

		/**
		 * Load model data in Combobox Commoditie
		 * @function
		 * @param 
		 * @private
		 */
		loadModelCommoditie: function (event) {
			var sServiceUrl = "",
				oModelService = "",
				aListData = [];

			sServiceUrl = this.getOwnerComponent().getModel("ModelSimulador").sServiceUrl;
			oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/headerCommoditiesSet", null);

			if (oRead.tipo === "S") {
				aListData = oRead.datos.results;
				this.commodite = aListData;
			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
				return;
			}

			// this.mapDataComboboxCommoditie(aListData);
			this.loadModelComboBoxCommoditie(this.commodite);
		},

		/**
		 * Map Data ComboBox Commoditie
		 * @function
		 * @param 
		 * @private
		 */
		mapDataComboboxCommoditie: function (p_listCommoditie) {

			var oComboBox = this.getView().byId("idComboBoxUnidadesMedida"),
				oModelCombo = {},
				lstCommodite = {
					LstCommodite: []
				};

			lstCommodite.LstCommodite = p_listCommoditie;

			oModelCombo = new sap.ui.model.json.JSONModel(lstCommodite);

			oComboBox.setModel(oModelCombo);
		},

		/**
		 * load model comboBox Commoditie
		 * @function
		 * @param 
		 * @private
		 */
		loadModelComboBoxCommoditie: function (p_listCommoditie) {

			var oTable = this.byId("tblMaterial");
			oTable.getModel().setProperty("/LstCommodite", p_listCommoditie);
			oTable.getModel().refresh(true);

		},

		/**
		 * select Commoditie combobox
		 * @function
		 * @param 
		 * @private
		 */
		onChange: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var oTableCommodities = this.byId("tblMaterial");
			var oItemObject = oItem.getBindingContext().getObject();
			var oUnidadSeleccionada = oItemObject.IdCommoditie;
			var oTableItem = oEvent.getSource().getParent();
			var oTableItemObject = oTableItem.getBindingContext().getObject();
			oTableItemObject.MDEF_COMMODITIE = oUnidadSeleccionada;
			oTableItemObject.MDEF_COMMODITIE_SELECT = oUnidadSeleccionada;

			var oCommodite = this.detailCommodite.filter(result => result.IdCommoditie === oTableItemObject.MDEF_COMMODITIE_SELECT && result.Year ===
				oTableItemObject.MDEF_PERIODO &&
				result.Mes === oTableItemObject.MDEF_MES && result.Sociedad === oTableItemObject.MDEF_SOCIEDAD && result.Centro ===
				oTableItemObject.MDEF_CENTRO);

			if (oCommodite.length > 0) {
				var precio = this.executeFormula(oTableItemObject, oCommodite[0]);
				oTableItemObject.MDEF_PRECIOPRODUCTIVO = Number(precio);
			}

			//Realizar calculos
			oTableItemObject.MDEF_COSTOMATERIAL =
				Number(oTableItemObject.MDEF_PRECIOPRODUCTIVO) +
				Number(oTableItemObject.MDEF_COSTOCONVERSION) +
				Number(oTableItemObject.MDEF_COSTOADICIONAL) +
				Number(oTableItemObject.MDEF_COSTOENVIO);

			oTableItemObject.MDEF_COSTOTRANSFERENCIA =
				(Number(oTableItemObject.MDEF_COSTOMATERIAL) +
					Number(oTableItemObject.MDEF_OTROSCOSTOS)) *
				Number(oTableItemObject.MDEF_PCTRANSFERENCIA);

			oTableItemObject.MDEF_PRECIOPREMISA =
				Number(oTableItemObject.MDEF_COSTOMATERIAL) +
				Number(oTableItemObject.MDEF_OTROSCOSTOS) +
				Number(oTableItemObject.MDEF_COSTOTRANSFERENCIA);

			oTableCommodities.getModel().refresh();

		},

		/**
		 * Upload file
		 * @function
		 * @param 
		 * @private
		 */
		handleUpload: function (oEvent) {
			var oFile = oEvent.getParameter("files")[0],
				that = this;

			if (oFile && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function (evt) {
					var strCSV = evt.target.result; //string in CSV 
					that.csvJSONFile(strCSV);
				};
				reader.readAsText(oFile);
			}
		},

		/**
		 * Get json file
		 * @function
		 * @param 
		 * @private
		 */
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
			this.cargaMasiva(oFinalResult);
		},

		/**
		 * Get json file
		 * @function
		 * @param 
		 * @private
		 */
		csvJSONFile: function (csv) {
			var lines = csv.split("\n");
			var result = [];
			var headers = lines[0].split(",");
			if (headers.length > 1) {
				for (var i = 1; i < lines.length; i++) {
					var obj = {};
					var currentline = lines[i].split(",");
					for (var j = 0; j < headers.length; j++) {
						if (currentline[0] === "P") {
							obj[headers[j]] = currentline[j];
						}
					}
					if (!obj.Tipo === false) {
						result.push(obj);
					}
				}
			} else {
				var headersPC = lines[0].split(";");
				for (var k = 1; k < lines.length; k++) {
					var objPC = {};
					var currentlinePC = lines[k].split(";");
					for (var l = 0; l < headersPC.length; l++) {
						// if (currentlinePC[0] === "P") {
						objPC[headersPC[l]] = currentlinePC[l];
						// }
					}
					// if (!objPC.Tipo === false) {
					result.push(objPC);
					// }
				}
			}
			var oStringResult = JSON.stringify(result);
			var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
			this.cargaMasiva(oFinalResult);
		},

		/**
		 * Edit cells table
		 * @function
		 * @param 
		 * @private
		 */
		editCellsTable: function (p_EditValue) {
			var oTable = {};

			oTable = this.byId("tblMaterial");

			for (var i = 0; i < oTable.getModel().getData().MATERIAL.length; i++) {

				if (oTable.getRows()[i] !== undefined) {
					oTable.getRows()[i].getCells()[6].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[7].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[8].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[9].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[10].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[11].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[12].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[13].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[14].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[15].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[16].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[17].setProperty("editable", p_EditValue);
					oTable.getRows()[i].getCells()[18].setProperty("editable", p_EditValue);
				} else {
					break;
				}
			}
		},

		/**
		 * Obtener costo material
		 * @function
		 * @param 
		 * @private
		 */
		onChangeCostoMaterial: function (oEvent) {
			var value = oEvent.getSource().getValue(),
				oValueItem = oEvent.getSource().getBindingContext().getObject();

			oValueItem.MDEF_COSTOMATERIAL =
				Number(oValueItem.MDEF_PRECIOPRODUCTIVO) +
				Number(oValueItem.MDEF_COSTOCONVERSION) +
				Number(oValueItem.MDEF_COSTOADICIONAL) +
				Number(oValueItem.MDEF_COSTOENVIO);

			// oValueItem.MDEF_COSTOTRANSFERENCIA =
			// 	(Number(oValueItem.MDEF_COSTOMATERIAL) +
			// 		Number(oValueItem.MDEF_OTROSCOSTOS)) *
			// 	Number(oValueItem.MDEF_PCTRANSFERENCIA);

			oValueItem.MDEF_COSTOTRANSFERENCIA =
				(Number(oValueItem.MDEF_COSTOMATERIAL) +
					Number(oValueItem.MDEF_OTROSCOSTOS)) *
				(Number(oValueItem.MDEF_PCTRANSFERENCIA) / 100);

			oValueItem.MDEF_PRECIOPREMISA =
				Number(oValueItem.MDEF_COSTOMATERIAL) +
				Number(oValueItem.MDEF_OTROSCOSTOS) +
				Number(oValueItem.MDEF_COSTOTRANSFERENCIA);
		},

		/**
		 * Obtener costo transferencia
		 * @function
		 * @param 
		 * @private
		 */
		onChangePorcentajeTransferencia: function (oEvent) {
			var value = oEvent.getSource().getValue(),
				oValueItem = oEvent.getSource().getBindingContext().getObject();

			oValueItem.MDEF_PCTRANSFERENCIA =
				Number(oValueItem.MDEF_PCTRANSFERENCIA);

			oValueItem.MDEF_COSTOMATERIAL =
				Number(oValueItem.MDEF_PRECIOPRODUCTIVO) +
				Number(oValueItem.MDEF_COSTOCONVERSION) +
				Number(oValueItem.MDEF_COSTOADICIONAL) +
				Number(oValueItem.MDEF_COSTOENVIO);

			oValueItem.MDEF_COSTOTRANSFERENCIA =
				(Number(oValueItem.MDEF_COSTOMATERIAL) +
					Number(oValueItem.MDEF_OTROSCOSTOS)) *
				(Number(oValueItem.MDEF_PCTRANSFERENCIA) / 100);

			oValueItem.MDEF_PRECIOPREMISA =
				Number(oValueItem.MDEF_COSTOMATERIAL) +
				Number(oValueItem.MDEF_OTROSCOSTOS) +
				Number(oValueItem.MDEF_COSTOTRANSFERENCIA);
		},

		/**
		 * Export file
		 * @function
		 * @param 
		 * @private
		 */
		onDataExport: function (oEvent) {
			var oTable = {};
			oTable = this.byId("tblMaterial");

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ","
				}),

				// Pass in the model created above
				models: oTable.getModel(),

				// binding information for the rows aggregation
				rows: {
					path: "/MATERIAL"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: "IDMaterial",
					template: {
						content: "{MDEF_IDMATERIAL}"
					}
				}, {
					name: "Material",
					template: {
						content: "{MDEF_MATERIAL}"
					}
				}, {
					name: "Sociedad",
					template: {
						content: "{MDEF_SOCIEDAD}"
					}
				}, {
					name: "Centro",
					template: {
						content: "{MDEF_CENTRO}"
					}
				}, {
					name: "Unidad_Medida",
					template: {
						content: "{MDEF_UMD}"
					}
				}, {
					name: "Moneda",
					template: {
						content: "{MDEF_MONEDA_SELECT}"
					}
				}, {
					name: "Peso_Material",
					template: {
						content: "{MDEF_PESOMATERIAL}"
					}
				}, {
					name: "Commoditie",
					template: {
						content: "{MDEF_COMMODITIE_SELECT}"
					}
				}, {
					name: "Precio_Productivo",
					template: {
						content: "{MDEF_PRECIOPRODUCTIVO}"
					}
				}, {
					name: "Costo_Conversion",
					template: {
						content: "{MDEF_COSTOCONVERSION}"
					}
				}, {
					name: "Costo_Adicional",
					template: {
						content: "{MDEF_COSTOADICIONAL}"
					}
				}, {
					name: "Costo_Envio",
					template: {
						content: "{MDEF_COSTOENVIO}"
					}
				}, {
					name: "Icoterm",
					template: {
						content: "{MDEF_ICOTERM}"
					}
				}, {
					name: "Costo_Material",
					template: {
						content: "{MDEF_COSTOMATERIAL}"
					}
				}, {
					name: "FormulaOtrosCostos",
					template: {
						content: "{MDEF_FORMULAOTROSCOSTOS}"
					}
				}, {
					name: "Otros_Costos",
					template: {
						content: "{MDEF_OTROSCOSTOS}"
					}
				}, {
					name: "PTrasnferencia",
					template: {
						content: "{MDEF_PCTRANSFERENCIA}"
					}
				}, {
					name: "Costo_Transferencia",
					template: {
						content: "{MDEF_COSTOTRANSFERENCIA}"
					}
				}, {
					name: "Precio_Premisa",
					template: {
						content: "{MDEF_PRECIOPREMISA}"
					}
				}, {
					name: "IDCategoria",
					template: {
						content: "{MDEF_IDCATEGORIA}"
					}
				}, {
					name: "Categoria",
					template: {
						content: "{MDEF_CATEGORIA}"
					}
				}, {
					name: "IDSubcategoria",
					template: {
						content: "{MDEF_IDSUBCATEGORIA}"
					}
				}, {
					name: "Subcategoria",
					template: {
						content: "{MDEF_SUBCATEGORIA}"
					}
				}, {
					name: "IDFamilia",
					template: {
						content: "{MDEF_IDFAMILIA}"
					}
				}, {
					name: "Familia",
					template: {
						content: "{MDEF_FAMILIA}"
					}
				}, {
					name: "IDSubfamilia",
					template: {
						content: "{MDEF_IDSUFAMILIA}"
					}
				}, {
					name: "Subfamilia",
					template: {
						content: "{MDEF_SUBFAMILIA}"
					}
				}, {
					name: "Periodo",
					template: {
						content: "{MDEF_PERIODO}"
					}
				}, {
					name: "Mes",
					template: {
						content: "{MDEF_MES}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},

		/**
		 * Upload data file
		 * @function
		 * @param 
		 * @private
		 */
		cargaMasiva: function (JsonValue) {

			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oEntidad = {},
				oDetail = {},
				oCreate = {},
				oPanel = {};

			oPanel = this.getView();
			oPanel.setBusy(true);

			oEntidad = {
				Material: '1111',
				Descrip: 'Save',
				materialDefatultSet: []
			};

			for (var i = 0; i < JsonValue.length; i++) {

				var oTempRow = JsonValue[i];

				if (oTempRow.Commoditie === undefined) {
					continue;
				}

				// does not remove the manually set ValueStateText we set in onValueStatePress():
				sap.ui.getCore().getMessageManager().removeAllMessages();

				this.checkErrorPosition(oTempRow);

				oDetail = {
					// Txtmd: oTempRow.Material,
					Material: oTempRow.IDMaterial,
					CompCode: oTempRow.Sociedad,
					Plant: oTempRow.Centro,
					BaseUom: oTempRow.Unidad_Medida,
					Currency: oTempRow.Moneda,
					// Txtsubfam: oTempRow.Subfamilia,
					// Txtfam: oTempRow.Familia,
					// Txtsubcat: oTempRow.Subcategoria,
					// Txtcat: oTempRow.Categoria,
					// Recordmode: oTempRow.MDEF_IDMATERIAL,
					catgoria: oTempRow.IDCategoria,
					subcateg: oTempRow.IDSubcategoria,
					yfamilia: oTempRow.IDFamilia,
					ysubfamil: oTempRow.IDSubfamilia,
					Fiscyear: oTempRow.Periodo,
					// Fiscvarnt: oTempRow.MDEF_IDMATERIAL,
					Fiscper3: oTempRow.Mes,
					NetWeight: oTempRow.Peso_Material,
					// UnitOfWt: oTempRow.MDEF_IDMATERIAL,
					commodit: oTempRow.Commoditie.toString(),
					Incoterms: oTempRow.Icoterm.toString(),
					fotrcost: oTempRow.FormulaOtrosCostos.toString(),
					// Version: oTempRow.MDEF_IDMATERIAL,
					// estado: oTempRow.MDEF_IDMATERIAL,
					// Date0: oTempRow.MDEF_IDMATERIAL,
					// usuario: oTempRow.MDEF_IDMATERIAL,
					preprodc: oTempRow.Precio_Productivo.toString(),
					costconv: oTempRow.Costo_Conversion.toString(),
					costadic: oTempRow.Costo_Adicional.toString(),
					costenv: oTempRow.Costo_Envio.toString(),
					costmat: oTempRow.Costo_Material.toString(),
					otrocost: oTempRow.Otros_Costos.toString(),
					ptransf: oTempRow.PTrasnferencia.toString(),
					costrans: oTempRow.Costo_Transferencia.toString(),
					ppremisa: oTempRow.Precio_Premisa.toString()

				};

				oEntidad.materialDefatultSet.push(oDetail);
			}

			if (oEntidad.materialDefatultSet.length === 0) {

				MessageBox.show(
					"No se cargo el archivo", {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
							// actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							// onClose: function (oAction) {
							// 	/ * do something * /
							// }
					}
				);

				oPanel.setBusy(false);

				return;
			}

			if (sap.ui.getCore().getMessageManager().getMessageModel().getData().filter(result => result.type === "Error").length > 0) {

				MessageBox.show(
					"Existen campos por validar", {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
							// actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							// onClose: function (oAction) {
							// 	/ * do something * /
							// }
					}
				);

				return;

			}

			oCreate = this.fnCreateEntity(oModelService, "/materialsaveSet", oEntidad);

			that = this;
			if (oCreate.tipo === 'S') {

				MessageBox.show(
					'Datos importados correctamente', {
						icon: MessageBox.Icon.SUCCESS,
						title: "Exito",
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								that.loadMaterial();
								oPanel.setBusy(false);
								return;
							}
						}
					}
				);

			} else if (oCreate.tipo === 'E') {

				oPanel.setBusy(false);

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

		/**
		 * Load model data in Commoditie Detail
		 * @function
		 * @param 
		 * @private
		 */
		loadModelCommoditieDetail: function (event) {
			var sServiceUrl = "",
				oModelService = "",
				aListData = [];

			sServiceUrl = this.getOwnerComponent().getModel("ModelSimulador").sServiceUrl;
			oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/detailCommoditiesSet", null);

			if (oRead.tipo === "S") {
				aListData = oRead.datos.results;
			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
				return;
			}

			this.detailCommodite = aListData;
		},

		/**
		 * Ejecutar formula commodite
		 * @function
		 * @param 
		 * @private
		 */
		executeFormula: function (pMaterial, pCommodite) {
			var vFormula = "",
				vPatron = "",
				oTipoCambio = [],
				vTextCambio = "",
				vFormulaText = "";

			vFormula = vFormulaText = pCommodite.TxtFormula;

			//Reemplazar precio
			vPatron = '/Precio/gi';
			vFormula = vFormula.replace(eval(vPatron), pCommodite.PrecioMaterial);

			//Reemplazar otros costos
			vPatron = '/OtrosCostos/gi';
			vFormula = vFormula.replace(eval(vPatron), pCommodite.OtrosCostos);

			//Reemplazar peso material 
			vPatron = '/PesoMaterial/gi';
			vFormula = vFormula.replace(eval(vPatron), pMaterial.MDEF_PESOMATERIAL);

			oTipoCambio = this.tipoCambio.filter(result => result.Fcurr === pMaterial.MDEF_MONEDA_SELECT && result.Tcurr === pCommodite.Moneda &&
				result.Fiscyear === pMaterial.MDEF_PERIODO && result.Fiscper3 === pMaterial.MDEF_MES);

			if (oTipoCambio.length > 0) {
				vTextCambio = oTipoCambio[0].Fcurr + ' a ' + oTipoCambio[0].Tcurr + ' = ' + oTipoCambio[0].Ukurspromedio;
				vFormulaText = "(" + vFormulaText + ") * " + "( " + oTipoCambio[0].Ukurspromedio + " )";
				vFormula = "(" + vFormula + ") * " + "( " + oTipoCambio[0].Ukurspromedio + " )";
			}

			MessageBox.show(
				'Formula aplicada\n' + vFormulaText + '\n\n' + vFormula, {
					icon: MessageBox.Icon.SUCCESS,
					title: "Exito",
					actions: [MessageBox.Action.OK],
					onClose: function (oAction) {
						// if (oAction === sap.m.MessageBox.Action.OK) {

						// }
					}
				}
			);

			return eval(vFormula);

		},

		/**
		 * Load model data in Combobox Icoterm
		 * @function
		 * @param 
		 * @private
		 */
		loadModelIcoterm: function (event) {
			var sServiceUrl = "",
				oModelService = "",
				aListData = [];

			sServiceUrl = this.getOwnerComponent().getModel("ModelSimulador").sServiceUrl;
			oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/IcotermSet", null);

			if (oRead.tipo === "S") {
				aListData = oRead.datos.results;
			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
				return;
			}

			// this.mapDataComboboxCommoditie(aListData);
			this.loadModelComboBoxIcoterm(aListData);
		},

		/**
		 * load model comboBox Commoditie
		 * @function
		 * @param 
		 * @private
		 */
		loadModelComboBoxIcoterm: function (p_listIcoterm) {

			var oTable = this.byId("tblMaterial");
			oTable.getModel().setProperty("/LstIcoterm", p_listIcoterm);
			oTable.getModel().refresh(true);

		},

		/**
		 * select icoterm combobox
		 * @function
		 * @param 
		 * @private
		 */
		onChangeIcoterm: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var oTableCommodities = this.byId("tblMaterial");
			var oItemObject = oItem.getBindingContext().getObject();
			var oUnidadSeleccionada = oItemObject.yidAuton;
			var oTableItem = oEvent.getSource().getParent();
			var oTableItemObject = oTableItem.getBindingContext().getObject();
			oTableItemObject.MDEF_ICOTERM = oUnidadSeleccionada;

			oTableCommodities.getModel().refresh();

		},

		/**
		 * Load model data in Combobox Commoditie
		 * @function
		 * @param 
		 * @private
		 */
		loadModelUnidaMedida: function (event) {
			var sServiceUrl = "",
				oModelService = "",
				aListData = [];

			sServiceUrl = this.getOwnerComponent().getModel("ModelSimulador").sServiceUrl;
			oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/unidadesMedidaSet", null);

			if (oRead.tipo === "S") {
				aListData = oRead.datos.results;
			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
				return;
			}

			this.loadModelComboBoxUnidadMedida(aListData);
		},

		/**
		 * load model comboBox unidad de medida
		 * @function
		 * @param 
		 * @private
		 */
		loadModelComboBoxUnidadMedida: function (p_listUnidadMedida) {

			var oTable = this.byId("tblMaterial");
			oTable.getModel().setProperty("/LstUnMedida", p_listUnidadMedida);
			oTable.getModel().refresh(true);

		},

		/**
		 * select unidad de medida
		 * @function
		 * @param 
		 * @private
		 */
		onChangeUMB: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var oTableCommodities = this.byId("tblMaterial");
			var oItemObject = oItem.getBindingContext().getObject();
			var oUnidadSeleccionada = oItemObject.Msehi;
			var oTableItem = oEvent.getSource().getParent();
			var oTableItemObject = oTableItem.getBindingContext().getObject();
			oTableItemObject.MDEF_UMD = oUnidadSeleccionada;
			oTableItemObject.MDEF_UMD_SELECT = oUnidadSeleccionada;

			oTableCommodities.getModel().refresh();

		},

		/**
		 * Load model data in Combobox Moneda
		 * @function
		 * @param 
		 * @private
		 */
		loadModelMoneda: function (event) {
			var sServiceUrl = "",
				oModelService = "",
				aListData = [];

			sServiceUrl = this.getOwnerComponent().getModel("ModelSimulador").sServiceUrl;
			oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/monedaMaterialSet", null);

			if (oRead.tipo === "S") {
				aListData = oRead.datos.results;
				this.moneda = aListData;
			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
				return;
			}

			this.loadModelComboBoxMoneda(this.moneda);
		},

		/**
		 * load model comboBox moneda
		 * @function
		 * @param 
		 * @private
		 */
		loadModelComboBoxMoneda: function (p_listUnidadMedida) {

			var oTable = this.byId("tblMaterial");
			oTable.getModel().setProperty("/LstMoneda", p_listUnidadMedida);
			oTable.getModel().refresh(true);

		},

		/**
		 * select unidad de medida
		 * @function
		 * @param 
		 * @private
		 */
		onChangeMoneda: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var oTableCommodities = this.byId("tblMaterial");
			var oItemObject = oItem.getBindingContext().getObject();
			var oUnidadSeleccionada = oItemObject.Waers;
			var oTableItem = oEvent.getSource().getParent();
			var oTableItemObject = oTableItem.getBindingContext().getObject();
			oTableItemObject.MDEF_MONEDA = oUnidadSeleccionada;
			oTableItemObject.MDEF_MONEDA_SELECT = oUnidadSeleccionada;

			if (oTableItemObject.MDEF_COMMODITIE_SELECT === "") {
				oTableCommodities.getModel().refresh();
				return;
			}

			var oCommodite = this.detailCommodite.filter(result => result.IdCommoditie === oTableItemObject.MDEF_COMMODITIE_SELECT && result.Year ===
				oTableItemObject.MDEF_PERIODO &&
				result.Mes === oTableItemObject.MDEF_MES && result.Sociedad === oTableItemObject.MDEF_SOCIEDAD && result.Centro ===
				oTableItemObject.MDEF_CENTRO);

			if (oCommodite.length > 0) {
				var precio = this.executeFormula(oTableItemObject, oCommodite[0]);
				oTableItemObject.MDEF_PRECIOPRODUCTIVO = Number(precio);
			}

			//Realizar calculos
			oTableItemObject.MDEF_COSTOMATERIAL =
				Number(oTableItemObject.MDEF_PRECIOPRODUCTIVO) +
				Number(oTableItemObject.MDEF_COSTOCONVERSION) +
				Number(oTableItemObject.MDEF_COSTOADICIONAL) +
				Number(oTableItemObject.MDEF_COSTOENVIO);

			oTableItemObject.MDEF_COSTOTRANSFERENCIA =
				(Number(oTableItemObject.MDEF_COSTOMATERIAL) +
					Number(oTableItemObject.MDEF_OTROSCOSTOS)) *
				Number(oTableItemObject.MDEF_PCTRANSFERENCIA);

			oTableItemObject.MDEF_PRECIOPREMISA =
				Number(oTableItemObject.MDEF_COSTOMATERIAL) +
				Number(oTableItemObject.MDEF_OTROSCOSTOS) +
				Number(oTableItemObject.MDEF_COSTOTRANSFERENCIA);

			oTableCommodities.getModel().refresh();

		},

		/**
		 * Open calculator
		 * @function
		 * @param 
		 * @private
		 */
		showCalculator: function (oEvent) {

			// if (updatedRecords.length > 0) {
			// 	//this.oEventcall = oEvent;
			// 	this.oRowData = oEvent.getSource().getBindingContext().getProperty();
			// 	this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);  
			// 	//var oRowData
			// 	that = this;
			// 	MessageBox.show(
			// 		'Desea guardar los datos editados?', {
			// 			icon: MessageBox.Icon.INFORMATION,
			// 			title: "Informacion",
			// 			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			// 			onClose: function (oAction) {
			// 				if (oAction === sap.m.MessageBox.Action.OK) {
			// 					// this.saveCommodities();

			// 				} else if (oAction === sap.m.MessageBox.Action.CANCEL) {
			// 					// updatedRecords = [];

			// 				} else {
			// 					return;
			// 				}
			// 				//rtChFromuladora
			// 			//	var oRowData = that.oEventcall.getSource().getBindingContext().getProperty();
			// 			//	var oRouter = sap.ui.core.UIComponent.getRouterFor(that);

			// 				var oData = {
			// 					oIdCommoditie: "", //this.oRowData.IdCommoditie,
			// 					oIdFormula: "", //this.oRowData.IdFormula,
			// 					oTxtFormula: "", //this.oRowData.TxtFormula
			// 				};

			// 				//Navigation to the Detail Form
			// 				//app.to(page,"rtChFromuladora");
			// 				var bus = sap.ui.getCore().getEventBus();
			// 				//const bus = this.getOwnerComponent().getEventBus();
			// 				// 1. ChannelName, 2. EventName, 3. the data
			// 				bus.publish("GridAdminFormuladoraChannel", "onNavigateEvent", oData);

			// 				//	oRowData.TxtFormula = oRowData.TxtFormula.replace('/', '\\/');
			// 				this.oRowData.TxtFormula = encodeURIComponent(this.oRowData.TxtFormula);

			// 				this.oRowData.TxtFormula = (this.oRowData.TxtFormula === "") ? "0" : this.oRowData.TxtFormula;

			// 				this.oRouter.navTo("rtChFromuladora", {
			// 					oRowPath: "", //this.oRowData.IdCommoditie,
			// 					oIdFormula: "", //this.oRowData.IdFormula,
			// 					oTxt: "", //this.oRowData.TxtFormula,
			// 					oYear: "", //this.oRowData.Year,
			// 					oMes: "", //this.oRowData.Mes
			// 				});
			// 			}.bind(this)
			// 		}
			// 	);
			// }

			var oRowData = oEvent.getSource().getBindingContext().getProperty(),
				oData = {};

			oData = {
				oIdMaterial: oRowData.MDEF_IDMATERIAL,
				oSociedad: oRowData.MDEF_SOCIEDAD,
				oCentro: oRowData.MDEF_CENTRO,
				oYear: oRowData.MDEF_PERIODO,
				oMes: oRowData.MDEF_MES,
				oIdFormula: "11",
				oTxtFormula: " ",
			};

			//Navigation to the Detail Form
			//app.to(page,"rtChFromuladora");
			// var bus = sap.ui.getCore().getEventBus();
			//const bus = this.getOwnerComponent().getEventBus();
			// 1. ChannelName, 2. EventName, 3. the data
			// bus.publish("GridAdminFormuladoraChannel", "onNavigateEvent", oData);

			//	oRowData.TxtFormula = oRowData.TxtFormula.replace('/', '\\/');
			// this.oRowData.TxtFormula = encodeURIComponent(this.oRowData.TxtFormula);

			// this.oRowData.TxtFormula = (this.oRowData.TxtFormula === "") ? "0" : this.oRowData.TxtFormula;

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.navTo("rtChFormuladoraMaterial", {
				oIdMaterial: oData.oIdMaterial,
				oSociedad: oData.oSociedad,
				oCentro: oData.oCentro,
				oYear: oData.oYear,
				oMes: oData.oMes,
				oIdFormula: oData.oIdFormula,
				oTxt: oData.oTxtFormula
			});

		},

		/**
		 * Load model data tipo cambio
		 * @function
		 * @param 
		 * @private
		 */
		loadModelTipoCambio: function (event) {
			var sServiceUrl = "",
				oModelService = "",
				aListData = [],
				filterKurst = {},
				filtersArray = {};

			filterKurst = new sap.ui.model.Filter({
				path: "Kurst",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: 'PLAN'
			});

			filtersArray = new Array();
			filtersArray.push(filterKurst);

			sServiceUrl = this.getOwnerComponent().getModel("ModelSimulador").sServiceUrl;
			oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			//Leer datos del ERP
			var oRead = this.fnReadEntity(oModelService, "/tipoCambioSet", filtersArray);

			if (oRead.tipo === "S") {
				aListData = oRead.datos.results;
			} else {
				MessageBox.error(oRead.msjs, null, "Mensaje del sistema", "OK", null);
				return;
			}

			this.tipoCambio = aListData;
		},

		/**
		 * Load model combo box year
		 * @function
		 * @param 
		 * @private
		 */
		loadModelCbYear: function (event) {

			var sServiceUrl = {},
				oModelService = {};

			sServiceUrl = this.getOwnerComponent().getModel("ModelSimulador").sServiceUrl;
			oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			oModelService.read("/centroYearMaterialSet", {
				async: true,
				success: function (oData, response) {
					this.centroYear = oData.results;
					this.loadModelComboBoxYear(oData.results);
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});

		},

		/**
		 * load model comboBox year
		 * @function
		 * @param 
		 * @private
		 */
		loadModelComboBoxYear: function (p_listYear) {
			var oTable = this.byId("idYear"),
				oListaData = "";

			oListaData = Array.from(new Set(p_listYear.map(s => s.yfiscyear)))
				.map(yfiscyear => {
					return {
						yfiscyear: yfiscyear

					};
				});

			oTable.getModel().setProperty("/LstYear", oListaData);
			oTable.getModel().refresh();

		},

		/**
		 * change year
		 * @function
		 * @param 
		 * @private
		 */
		onChangeYear: function (oEvent) {

			var oCombox = this.byId("idPlatn"),
				oListYear = [],
				oListaData = "",
				oItem = oEvent.getParameter("selectedItem"),
				oItemObject = oItem.getBindingContext().getObject();

			oCombox.setSelectedKey(null);

			oListYear = this.centroYear.filter(result => result.yfiscyear === oItemObject.yfiscyear);

			oListaData = Array.from(new Set(oListYear.map(s => s.Plant)))
				.map(Plant => {
					return {
						Plant: Plant,
						txtmd: oListYear.find(s => s.Plant === Plant).txtmd
					};
				});

			oCombox.getModel().setProperty("/LstPlant", oListaData);
			oCombox.getModel().refresh(true);

		},

		/**
		 * Filter material
		 * @function
		 * @param 
		 * @private
		 */
		onFilterMaterial: function (oEvent) {

			var oComboxYear = this.byId("idYear"),
				oComboxPlant = this.byId("idPlatn");

			var aFilter = [];

			if (oComboxYear.getSelectedKey() !== "") {
				aFilter.push(new Filter("yfiscyear", FilterOperator.EQ, oComboxYear.getSelectedKey()));
			}
			if (oComboxPlant.getSelectedKey() !== "") {
				aFilter.push(new Filter("Plant", FilterOperator.EQ, oComboxPlant.getSelectedKey()));
			}

			this.getMaterialFilter(aFilter);

		},

		/**
		 * Get material filter
		 * @function
		 * @param 
		 * @private
		 */
		getMaterialFilter: function (oFilter) {

			var sServiceUrl = {},
				oModelService = {},
				oPanel = this.getView();

			oPanel.setBusy(true);

			sServiceUrl = this.getOwnerComponent().getModel("ModelSimulador").sServiceUrl;
			oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			oModelService.read("/materialDefatultSet", {
				async: true,
				filters: oFilter,
				success: function (oData, response) {
					this.mapDataTable(oData.results);
					this.loadModelComboBoxYear(this.centroYear);
					this.loadModelComboBoxMoneda(this.moneda);
					this.loadModelComboBoxCommoditie(this.commodite);
					this.loadPlantToYear();
					oPanel.setBusy(false);
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					// this.getModel("modelView").setProperty("/busy", false);
					oPanel.setBusy(false);
				}
			});

			// this.loadModelCbYear();

		},

		/**
		 * loada data material
		 * @function
		 * @param 
		 * @private
		 */
		loadMaterial: function () {
			this.loadModelCbYear();
			this.loadModel();
			this.loadModelCommoditie();
			this.loadModelCommoditieDetail();
			// this.loadModelIcoterm();
			this.loadModelUnidaMedida();
			this.loadModelMoneda();
			this.loadModelTipoCambio();
		},

		onMessagePopoverPress: function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

		//################ Private APIs ###################

		_getMessagePopover: function () {
			// create popover lazily (singleton)
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(),
					"cbc.co.simulador_costos.view.Utilities.fragments.MessagePopover", this);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
		},

		onErrorPress: function () {
			var oMessage = new Message({
				message: "My generated error message",
				type: MessageType.Error,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},

		/**
		 * check error position
		 * @function
		 * @param 
		 * @private
		 */
		checkErrorPosition: function (oPosition) {
			var vMessage = "",
				oMessage = {},
				vMessageField = "";

			vMessage = "Material: " + oPosition.MDEF_IDMATERIAL +
				" Sociedad: " + oPosition.MDEF_SOCIEDAD +
				" Centro: " + oPosition.MDEF_CENTRO +
				" A\u00F1o: " + oPosition.MDEF_PERIODO +
				" Periodo: " + oPosition.MDEF_MES;

			if (oPosition.MDEF_PRECIOPRODUCTIVO.toString() === "") {
				vMessageField = "Precio Productivo es vac\u00EDo y no n\u00FAmerico";

				oMessage = new Message({
					message: vMessage,
					type: MessageType.Error,
					target: "/Dummy",
					additionalText: vMessageField,
					description: vMessageField, //"Campo Precio Productivo",
					processor: this.getView().getModel()
				});
				sap.ui.getCore().getMessageManager().addMessages(oMessage);

			}

			if (oPosition.MDEF_PESOMATERIAL.toString() === "") {
				vMessageField = "Peso material es vac\u00EDo y no n\u00FAmerico";

				oMessage = new Message({
					message: vMessage,
					type: MessageType.Error,
					target: "/Dummy",
					additionalText: vMessageField,
					description: vMessageField, //"Campo Precio Productivo",
					processor: this.getView().getModel()
				});
				sap.ui.getCore().getMessageManager().addMessages(oMessage);

			}

			if (oPosition.MDEF_COSTOCONVERSION.toString() === "") {
				vMessageField = "Costo conversi\u00F3n es vac\u00EDo y no n\u00FAmerico";

				oMessage = new Message({
					message: vMessage,
					type: MessageType.Error,
					target: "/Dummy",
					additionalText: vMessageField,
					description: vMessageField, //"Campo Precio Productivo",
					processor: this.getView().getModel()
				});
				sap.ui.getCore().getMessageManager().addMessages(oMessage);

			}

			if (oPosition.MDEF_COSTOADICIONAL.toString() === "") {
				vMessageField = "Costo adicional es vac\u00EDo y no n\u00FAmerico";

				oMessage = new Message({
					message: vMessage,
					type: MessageType.Error,
					target: "/Dummy",
					additionalText: vMessageField,
					description: vMessageField, //"Campo Precio Productivo",
					processor: this.getView().getModel()
				});
				sap.ui.getCore().getMessageManager().addMessages(oMessage);

			}

			if (oPosition.MDEF_COSTOENVIO.toString() === "") {
				vMessageField = "Costo env\u00EDo es vac\u00EDo y no n\u00FAmerico";

				oMessage = new Message({
					message: vMessage,
					type: MessageType.Error,
					target: "/Dummy",
					additionalText: vMessageField,
					description: vMessageField, //"Campo Precio Productivo",
					processor: this.getView().getModel()
				});
				sap.ui.getCore().getMessageManager().addMessages(oMessage);

			}

			if (oPosition.MDEF_OTROSCOSTOS.toString() === "") {
				vMessageField = "Otros costos es vac\u00EDo y no n\u00FAmerico";

				oMessage = new Message({
					message: vMessage,
					type: MessageType.Error,
					target: "/Dummy",
					additionalText: vMessageField,
					description: vMessageField, //"Campo Precio Productivo",
					processor: this.getView().getModel()
				});
				sap.ui.getCore().getMessageManager().addMessages(oMessage);

			}
		},

		/**
		 * change peso material
		 * @function
		 * @param 
		 * @private
		 */
		onChangePesoMaterial: function (oEvent) {
			var oTableItemObject = {};

			oTableItemObject = oEvent.getSource().getBindingContext().getObject();

			if (oTableItemObject.MDEF_COMMODITIE_SELECT === "") {
				return;
			}

			var oCommodite = this.detailCommodite.filter(result => result.IdCommoditie === oTableItemObject.MDEF_COMMODITIE_SELECT && result.Year ===
				oTableItemObject.MDEF_PERIODO &&
				result.Mes === oTableItemObject.MDEF_MES && result.Sociedad === oTableItemObject.MDEF_SOCIEDAD && result.Centro ===
				oTableItemObject.MDEF_CENTRO);

			if (oCommodite.length > 0) {
				var precio = this.executeFormula(oTableItemObject, oCommodite[0]);
				oTableItemObject.MDEF_PRECIOPRODUCTIVO = Number(precio);
			}

			//Realizar calculos
			oTableItemObject.MDEF_COSTOMATERIAL =
				Number(oTableItemObject.MDEF_PRECIOPRODUCTIVO) +
				Number(oTableItemObject.MDEF_COSTOCONVERSION) +
				Number(oTableItemObject.MDEF_COSTOADICIONAL) +
				Number(oTableItemObject.MDEF_COSTOENVIO);

			oTableItemObject.MDEF_COSTOTRANSFERENCIA =
				(Number(oTableItemObject.MDEF_COSTOMATERIAL) +
					Number(oTableItemObject.MDEF_OTROSCOSTOS)) *
				Number(oTableItemObject.MDEF_PCTRANSFERENCIA);

			oTableItemObject.MDEF_PRECIOPREMISA =
				Number(oTableItemObject.MDEF_COSTOMATERIAL) +
				Number(oTableItemObject.MDEF_OTROSCOSTOS) +
				Number(oTableItemObject.MDEF_COSTOTRANSFERENCIA);
		},

		/**
		 * Load model plant to year
		 * @function
		 * @param 
		 * @private
		 */
		loadPlantToYear: function () {

			var oComboxYear = this.byId("idYear"),
				oComboxPlant = this.byId("idPlatn"),
				vKeyYear = oComboxYear.getSelectedKey(),
				oListYear = [],
				oListaData = [];

			vKeyYear = oComboxYear.getSelectedKey();

			oListYear = this.centroYear.filter(result => result.yfiscyear === vKeyYear);

			oListaData = Array.from(new Set(oListYear.map(s => s.Plant)))
				.map(Plant => {
					return {
						Plant: Plant,
						txtmd: oListYear.find(s => s.Plant === Plant).txtmd
					};
				});

			oComboxPlant.getModel().setProperty("/LstPlant", oListaData);
			oComboxPlant.getModel().refresh(true);

		},

		/**
		 * Export file
		 * @function
		 * @param 
		 * @private
		 */
		onDataExportFile: function (oEvent) {
			var oTable = {},
				oModel = '',
				columns = [];

			oTable = this.byId("tblMaterial");
			oModel = new sap.ui.model.json.JSONModel(oTable.getModel().getProperty('/MATERIAL'));
			columns = [];

			columns.push({
				name: "IDMaterial",
				template: {
					content: "{MDEF_IDMATERIAL}"
				}
			}, {
				name: "Material",
				template: {
					content: "{MDEF_MATERIAL}"
				}
			}, {
				name: "Sociedad",
				template: {
					content: "{MDEF_SOCIEDAD}"
				}
			}, {
				name: "Centro",
				template: {
					content: "{MDEF_CENTRO}"
				}
			}, {
				name: "Unidad_Medida",
				template: {
					content: "{MDEF_UMD}"
				}
			}, {
				name: "Moneda",
				template: {
					content: "{MDEF_MONEDA_SELECT}"
				}
			}, {
				name: "Peso_Material",
				template: {
					content: "{MDEF_PESOMATERIAL}"
				}
			}, {
				name: "Commoditie",
				template: {
					content: "{MDEF_COMMODITIE_SELECT}"
				}
			}, {
				name: "Precio_Productivo",
				template: {
					content: "{MDEF_PRECIOPRODUCTIVO}"
				}
			}, {
				name: "Costo_Conversion",
				template: {
					content: "{MDEF_COSTOCONVERSION}"
				}
			}, {
				name: "Costo_Adicional",
				template: {
					content: "{MDEF_COSTOADICIONAL}"
				}
			}, {
				name: "Costo_Envio",
				template: {
					content: "{MDEF_COSTOENVIO}"
				}
			}, {
				name: "Icoterm",
				template: {
					content: "{MDEF_ICOTERM}"
				}
			}, {
				name: "Costo_Material",
				template: {
					content: "{MDEF_COSTOMATERIAL}"
				}
			}, {
				name: "FormulaOtrosCostos",
				template: {
					content: "{MDEF_FORMULAOTROSCOSTOS}"
				}
			}, {
				name: "Otros_Costos",
				template: {
					content: "{MDEF_OTROSCOSTOS}"
				}
			}, {
				name: "PTrasnferencia",
				template: {
					content: "{MDEF_PCTRANSFERENCIA}"
				}
			}, {
				name: "Costo_Transferencia",
				template: {
					content: "{MDEF_COSTOTRANSFERENCIA}"
				}
			}, {
				name: "Precio_Premisa",
				template: {
					content: "{MDEF_PRECIOPREMISA}"
				}
			}, {
				name: "IDCategoria",
				template: {
					content: "{MDEF_IDCATEGORIA}"
				}
			}, {
				name: "Categoria",
				template: {
					content: "{MDEF_CATEGORIA}"
				}
			}, {
				name: "IDSubcategoria",
				template: {
					content: "{MDEF_IDSUBCATEGORIA}"
				}
			}, {
				name: "Subcategoria",
				template: {
					content: "{MDEF_SUBCATEGORIA}"
				}
			}, {
				name: "IDFamilia",
				template: {
					content: "{MDEF_IDFAMILIA}"
				}
			}, {
				name: "Familia",
				template: {
					content: "{MDEF_FAMILIA}"
				}
			}, {
				name: "IDSubfamilia",
				template: {
					content: "{MDEF_IDSUFAMILIA}"
				}
			}, {
				name: "Subfamilia",
				template: {
					content: "{MDEF_SUBFAMILIA}"
				}
			}, {
				name: "Periodo",
				template: {
					content: "{MDEF_PERIODO}"
				}
			}, {
				name: "Mes",
				template: {
					content: "{MDEF_MES}"
				}
			});

			this.cvsDataExport(oModel, columns);
		}

	});

});