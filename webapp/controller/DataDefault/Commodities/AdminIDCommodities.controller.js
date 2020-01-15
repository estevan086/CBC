sap.ui.define( ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"], function (Controller, History) {
	"use strict";

	return Controller.extend("sap.ui.demo.walkthrough.controller.DataDefault.Commodities.AdminIDCommodities", {
		onInit : function () {
		//	var sUrl = "#" + this.getOwnerComponent().getRouter().getURL("page1");
		//	this.byId("link").setHref(sUrl);
		},

		onToPage1 : function (oEvent) {
			
		//	this.getOwnerComponent().getRouter().navTo("page1");
		
			var oApp = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent();
			var oNavContainer = oApp.byId("NavContainer");
			//oNavContainer.to(oApp.createId("rtChCommodities"));
			oNavContainer.back();
		},

		onBack : function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// replace the current hash with page 1 (will not add an history entry)
				//this.getOwnerComponent().getRouter().navTo("page1", null, true);
			}
		}
	});

}, /* bExport= */ true);
