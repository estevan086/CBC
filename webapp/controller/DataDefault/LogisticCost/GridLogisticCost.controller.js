jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function (BaseController, JSONModel, MessageToast, Filter) {
	"use strict";

	return BaseController.extend("cbc.co.simulador_costos.controller.DataDefault.LogisticCost.GridLogisticCost", {

		onInit: function () {

		},
		onGotoadminlc: function (oEvent) {
			//var oPageContainer = sap.ui.getCore().byId("NavContainer");
			var oMainContentView = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent()
				.getParent().getParent();

			var oNavContainer = oMainContentView.byId("NavContainer");

			oNavContainer.to(oMainContentView.createId("rtChAdminCL", {
				id: "2356"
			}));
		},
		onGotoaddmaterial: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminLogisticCost.AddMaterialLogisticCost");
		}
	});

});