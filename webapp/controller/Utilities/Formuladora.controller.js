sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	 "sap/ui/core/routing/History"
], function (Controller, JSONModel, History) {
	"use strict";

	var oPageController = Controller.extend("cbc.co.simulador_costos.controller.Utilities.Formuladora", {

	

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

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChFromuladora");
			 myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function(event) {
		  // your code when the view is about to be displayed ..
		  
		  var oIdCommoditie = event.getParameter("arguments").oRowPath;
		  
		  this.getView().byId("builder").setProperty("title", oIdCommoditie);
		 
		},

		onToPage1: function (oEvent) {

		
			var sPreviousHash = History.getInstance().getPreviousHash();

			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// replace the current hash with page 1 (will not add an history entry)
				this.getOwnerComponent().getRouter().navTo("rtChCommodities", null, true);
			}
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