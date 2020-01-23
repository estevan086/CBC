sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/m/MessageToast"
], function (BaseController, Filter, MessageToast) {
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

					this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({
						CostLog: "",
						Recordmode: "",
						CatCoslLo: "",
						PerResp: "",
						Date0: "",
						TxtMd: "",
						CodLogisticCost: []
					}), "LogisticCost");

					var oModel = this.getView().getModel("ModelSimulador");

					oModel.read("/codigocostologisticoSet", {
						success: function (oData, response) {
							var data = new sap.ui.model.json.JSONModel(oData);
							data.setProperty("/CodLogisticCost", data.getProperty("/results"));
							this.getOwnerComponent().setModel(data, "LogisticCost");
							// this.getModel("modelView").setProperty("/busy", false);
						}.bind(this),
						error: function (oError) {
							this.showGeneralError({
								oDataError: oError
							});
							this.getModel("modelView").setProperty("/busy", false);
						}
					});
				}
			}, this);
		},
		_onObjectMatched: function (oEvent) {

		},
		onBeforeShow: function (evt) {

		},
		showFormAddLC: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminLogisticCost.AddLogisticCost");
		},
		onAddLC: function (oEvent) {
			var oModel = this.getView().getModel("ModelSimulador"),
				oModelLocal = this.getView().getModel("LogisticCost"),
				data = oModelLocal.getProperty("/");

			//Crea el CL
			oModel.create("/codigocostologisticoSet", data, {
				success: function (oData, oResponse) {
					MessageToast.show(oData.Vbeln);
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this)
			});

			// oModel.create("/codigocostologisticoSet")

			this.fnCloseFragment(oEvent);
		}
	});

});