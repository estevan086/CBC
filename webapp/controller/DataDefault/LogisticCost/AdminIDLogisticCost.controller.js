sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("cbc.co.simulador_costos.controller.DataDefault.LogisticCost.AdminIDLogisticCost", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cbc.co.simulador_costos.view.AdminIDLogisticCost
		 */
		onInit: function () {
			this.getView().addDelegate({
				onBeforeShow: this.onBeforeShow,
				onAfterRendering: function (evt) {
					var a = "";
				}
			}, this);
		},
		onBeforeShow: function (evt) {
			var a = "";
		},
		showFormAddLC: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminLogisticCost.AddLogisticCost");
		},
		AddLC: function (oEvent) {

			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf cbc.co.simulador_costos.view.AdminIDLogisticCost
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf cbc.co.simulador_costos.view.AdminIDLogisticCost
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf cbc.co.simulador_costos.view.AdminIDLogisticCost
		 */
		//	onExit: function() {
		//
		//	}

	});

});