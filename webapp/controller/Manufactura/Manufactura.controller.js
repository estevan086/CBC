jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings) {
	"use strict";
	this.YO = this;
	return Controller.extend("cbc.co.simulador_costos.controller.Manufactura.Manufactura", {
		onInit: function () {
			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChVolumen");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {

		},
	});
});