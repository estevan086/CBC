jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Filter, MessageToast, JSONModel) {
	"use strict";

	return BaseController.extend("cbc.co.simulador_costos.controller.Admon.CreateParameters.Logistica", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cbc.co.simulador_costos.view.AdminIDLogisticCost
		 */
		onInit: function () {

			this.setModel(new JSONModel({
				busy: true
			}), "modelView");

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChAdminLogistica");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},
		onMyRoutePatternMatched: function (event) {

			this.getLogisticCatData();

		},
		getLogisticCatData: function () {
			var oModel = this.getView().getModel("ModelSimulador");

			this.getModel("modelView").setProperty("/busy", true);

			oModel.read("/categorialogisticaSet", {
				success: function (oData, response) {
					var dataRet = [],
						data = new sap.ui.model.json.JSONModel();
					
					this.getModel("modelView").setProperty("/busy", false);

					oData.results.forEach(function (oValue) {
						oValue.enabled = true;
						dataRet.push(oValue);
					});

					data.setProperty("/Items", dataRet);
					
					this.getOwnerComponent().setModel(data, "LogisticCategories");

				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});
		},
		showFormAddLC: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AddLogisticCategorie");
		},
		onSaveLogisticCat: function (oEvent) {
			var oModel = this.getView().getModel("ModelSimulador"),
				oModelLocal = this.getView().getModel("LogisticCategories"),
				data = oModelLocal.getProperty("/");

			this.getModel("modelView").setProperty("/busy", true);

			//Crea el CL
			oModel.create("/categorialogisticaSet", {
				TxtMd: data.TxtMd
			}, {
				success: function (oData, oResponse) {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
					this.getLogisticCatData();
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this)
			});

			this.fnCloseFragment(oEvent);
		},
		onDeleteLC: function (oEvent) {
			var oModel = this.getView().getModel("ModelSimulador"),
				oRow = oEvent.getParameter("row");

			this.getModel("modelView").setProperty("/busy", true);

			oModel.remove("/categorialogisticaSet('" + oRow.getCells()[0].getText() + "')", {
				success: function (oData, oResponse) {
					this.getLogisticCatData();
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this)
			});
		},
		onEditLC: function (oEvent) {
			var index = oEvent.getSource().getParent().getIndex(),
				oLogisticCat = this.getModel("LogisticCategories").getProperty("/Items");

			oLogisticCat[index].enabled = true;

			this.getModel("LogisticCost").getProperty("/").CatCosLo = oLogisticCat[index].CatCosLo;
			this.getModel("LogisticCost").getProperty("/").TxtMd = oLogisticCat[index].TxtMd;

		}

	});

});