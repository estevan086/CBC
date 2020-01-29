sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"./controller/Utilities/HelloDialog"
], function (UIComponent, JSONModel, ResourceModel, HelloDialog) {
	"use strict";

	return UIComponent.extend("cbc.co.simulador_costos.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set data model
			var oData = {
				recipient: {
					name: ""
				}
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);

			// set i18n model
			/*var i18nModel = new ResourceModel({
				bundleName : "cbc.co.simulador_costos.i18n.i18n"
			});
			this.setModel(i18nModel, "i18n");*/
			// set dialog
			//	this._helloDialog = new HelloDialog(this.getRootControl());

			this.getRouter().initialize();
		},
		destroy: function () {
			if (this.oRouteHandler) {
				this.oRouteHandler.destroy();
			}
			sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);

		},
	});
});