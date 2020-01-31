sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings", 'sap/m/MessageBox'
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings, MessageBox) {
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
					var currentYear = "";
					var test= [];
					for (var i = 0; i < oData.results.length; i++) {
						if(currentYear !== oData.results[i].Year)
						{
							currentYear =oData.results[i].Year;
							test.push(oData.results[i]);
						}
					}
					data.setProperty("/CodPeriodos",test);
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

		validateCreate: function (oEvent) {
			var ValDate = parseInt(this.byId("txtDate").getValue());
			if (ValDate < 2018 || ValDate > 2100) {
				MessageBox.show(
					'Año ' + ValDate + ' fuera de rango (2018-2100)', {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
					}
				);
			} else {
				var LastDate = ValDate - 1;
				if (this.byId("tblPeriodo").getBinding().getDistinctValues("Year").indexOf(LastDate.toString()) >= 0) {
					this.CreateDate();
				} else {
					MessageBox.show(
						ValDate + ' no se puede crear, el año anterior no esta configurado (' + LastDate + ')', {
							icon: MessageBox.Icon.ERROR,
							title: "Error"
						}
					);
				}
			}
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