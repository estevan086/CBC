sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings", 'sap/m/MessageBox',
	"cbc/co/simulador_costos/util/Formatter"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings, MessageBox, Formatter) {
	"use strict";

	return Controller.extend("cbc.co.simulador_costos.controller.COGS.GridCOGS", {

		onInit: function () {
			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtCCOGS");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			this.GetData("");
		},
		
		GetData: function () {
			var s = this.byId("lnk").getHref();
			var s2 = this.byId("lnk2").getHref();
			//http://gspmpappd.gt.cabcorp.com:1080/sap/bc/webdynpro/nxi/p1_pm_processm_ovp?WDCONFIGURATIONID=%2fNXI%2fP1_PM_PROCESSM_OVP_AC&sap-language=ES#
			//var s = "https://gspmpappd.gt.cabcorp.com:44300"
			var test2 = s2 + "/sap/bc/webdynpro/nxi/p1_pm_processm_ovp?WDCONFIGURATIONID=%2fNXI%2fP1_PM_PROCESSM_OVP_AC&sap-language=ES#";
			var test = s + "/sap/bc/webdynpro/nxi/p1_pm_result_ovp?RSLT_KEY=CST0001%20%20%20%20%20P0001%20%20%20%20%20%20%20%20%2012378&sap-wd-configid=%2fNXI%2fP1_PM_RESULT_OVP_AC&sap-accessibility=&sap-theme=#";
			this.byId("ifrCogs").getDomRef().src = test2;
		}

	});

});