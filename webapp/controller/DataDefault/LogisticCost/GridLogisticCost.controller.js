jQuery.sap.require("cbc.co.simulador_costos.Formatter");
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
	"sap/m/ButtonType"
	
], function(Controller, JSONModel, MessageToast, DateFormat, library, Filter, FilterOperator, Button, Dialog, List, StandardListItem,  ButtonType) {
	"use strict";

	var SortOrder = library.SortOrder;
	
	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.LogisticCost.GridLogisticCost", {

		onInit : function() {
			// set explored app's demo model on this sample
			/*var json = this.initSampleDataModel();
			// Setting json to current view....
				//var json = new sap.ui.model.json.JSONModel("model/products.json");
			this.getView().setModel(json);*/
	

			/*this.modes = [
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
			this.switchState("NavigationDelete");*/
			
		},
		onGotoadminlc        : function (oEvent) {
			//var oPageContainer = sap.ui.getCore().byId("NavContainer");
			var oMainContentView = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent()
				.getParent().getParent();

			var oNavContainer = oMainContentView.byId("NavContainer");

			oNavContainer.to(oMainContentView.createId("rtChAdminCL", {id:"2356"}));
		}
	});

});