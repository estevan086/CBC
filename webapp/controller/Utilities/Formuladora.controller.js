sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	var oPageController = Controller.extend("cbc.co.simulador_costos.controller.Utilities.Formuladora", {

		onAfterShow: function (oEvent) {
			//console.log("onBeforeShow was called"); // For https://stackoverflow.com/q/48097675/5846045
		},

		onBeforeShow: function (oEvent) {
			//console.log("onBeforeShow was called"); // For https://stackoverflow.com/q/48097675/5846045
		},
		
		onNavigate: function (oEvent) {
			 var isBack = !oEvent.getParameter("isTo"); // there are several types of back animation, but we want the general direction only
		  //  alert("Navigating " + (isBack ? "back " : "") + " to page " + oEvent.getParameter("toId"));
				
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

			
			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChFromuladora");
			 myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);


		// 	var oApp = this.getView().getAggregation("content")[0];
		
		// //	oApp.attachNavigate(this.onNavigate);
			
		// 	// oApp.attachNavigate(function(oEvent){
		// 	// 	this.onNavigate(oEvent);
		// 	// }.bind(this));
			
		// 	oApp.attachNavigate(function(evt) {
		// 	  var isBack = !evt.getParameter("isTo"); // there are several types of back animation, but we want the general direction only
		// //	  alert("Navigating " + (isBack ? "back " : "") + " to page " + evt.getParameter("toId"));
		// 	});
			
		// 	var oPage = this.getView().getAggregation("content")[0].getAggregation("pages")[0];
			
		// 	oPage.addEventDelegate({
		// 		onBeforeShow: this.onBeforeShow,
		// 		onAfterShow: this.onAfterShow
		// 	}, this);

		},

		onMyRoutePatternMatched: function(event) {
		  // your code when the view is about to be displayed ..
		  this.getView().byId("builder").setProperty("title", "X0001")
		  
		  
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