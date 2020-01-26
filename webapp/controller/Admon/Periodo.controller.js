jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings) {
	"use strict";
	return Controller.extend("cbc.co.simulador_costos.controller.Admon.Periodo", {

		onInit: function () {

			var oModelV = new JSONModel({
				busy: true,
				Bezei: ""
			});
			this.setModel(oModelV, "modelView");

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChPeriodo");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			this.GetPeriodos();
		},

		GetPeriodos: function () {
			var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/periodoSet", {
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel();
					data.setProperty("/CodPeriodos", oData.results);
					this.getOwnerComponent().setModel(data, "Periodos");
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});
		},

		CreateDate: function (oEvent) {
			/*	var oModel = this.getView().getModel("ModelSimulador"),
					oModelLocal = this.getView().getModel("Periodos"),
					data = oModelLocal.getProperty("/");*/
			this.getModel("modelView").setProperty("/busy", true);
			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			var ValDate = this.byId("txtDate").getValue();
			var msn = "";
			if (ValDate !== "") {
				for (var i = 1; i <= 12; i++) {
					var oEntidad = {};
					oEntidad.Year = ValDate;
					oEntidad.Period = i >= 10 ? i.toString() : "0" + i.toString();

					var oCreate = this.fnCreateEntity(oModelService, "/periodoSet", oEntidad);
				
					if (oCreate.tipo === "S") {
						if (oCreate.datos.Msj !== "" && oCreate.datos.Msj !== undefined) {
							msn = "fail";
						}
					} else {
						msn = "fail";
					}
				}
				if (msn == "") {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
					this.GetPeriodos();
				} else {
					MessageToast.show("Fail");
				}
			} else {
				MessageToast.show("el campo periodo esta vacio");
			}
			//this.getModel("modelView").setProperty("/busy", false);
		}

	});
});