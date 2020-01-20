sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	var oPageController = Controller.extend("cbc.co.simulador_costos.controller.Utilities.Formuladora", {

		onBeforeRendering: function () {



		},

		onBeforeShow: function (oEvent) {
			console.log("onBeforeShow was called"); // For https://stackoverflow.com/q/48097675/5846045
		},

		onAfterRendering: function () {
			//alert("onAfterRendering function called");
		},
		onInit: function () {
			//var oModel = new JSONModel(jQuery.sap.getModulePath("cbc.co.simulador_costos", "/dataFormuladora.json"));

			var oModel = new JSONModel();
			jQuery.ajax("model/dataFormuladora.json", {
				dataType: "json",
				success: function (oData) {
					oModel.setData(oData);
				},
				error: function () {
					jQuery.sap.log.error("failed to load json");
				}
			});

			this.getView().setModel(oModel);
			this._oBuilder = this.getView().byId("builder");

			this._oModelSettings = new JSONModel({
				layoutType: "Default",
				showInputToolbar: false,
				allowComparison: false,
				allowComparisonOperators: false,
				allowLogical: false,
				readOnly: false
			});
			this.getView().setModel(this._oModelSettings, "settings");

			this._oBuilder.setShowInputToolbar(true);

			this.getView().addEventDelegate({
				onBeforeShow: this.onBeforeShow,
			}, this);

		},

		onToPage1: function (oEvent) {

			//	this.getOwnerComponent().getRouter().navTo("page1");

			var oApp = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent();
			var oNavContainer = oApp.byId("NavContainer");
			//oNavContainer.to(oApp.createId("rtChCommodities"));
			oNavContainer.back();
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

		}
	});

	return oPageController;
});