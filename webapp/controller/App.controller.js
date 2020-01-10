sap.ui.define([
   "sap/ui/demo/walkthrough/controller/BaseController"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.ui.demo.walkthrough.controller.App", {
   	onOpenDialog : function () {
			this.getOwnerComponent().openHelloDialog();
		}
   });
});
