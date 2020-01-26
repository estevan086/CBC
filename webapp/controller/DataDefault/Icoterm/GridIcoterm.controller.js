jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings) {
	"use strict";

	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.Icoterm.GridIcoterm", {

		onInit: function () {

			var oModelV = new JSONModel({
				busy: true,
				Bezei: ""
			});
			this.setModel(oModelV, "modelView");

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChCreateIcoterm");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			this.GetIcoterm();
		},

		GetIcoterm: function () {
			var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/IcotermSet", {
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel();
					data.setProperty("/CodIcoterm", oData.results);
					this.getOwnerComponent().setModel(data, "Icoterm");
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});
			this.getModel("modelView").setProperty("/busy", false);
			var txtDescGrid = this.byId("txtDescGrid");
			var GetValueEdited = function (oEvent) {
				oModel.create("/headerCommoditiesUpdate", {
					IdCommoditie: this.getParent().getCells()[0].getText(),
					Descripcion: this.getParent().getCells()[1].getValue(),
					status: "1"
				}, {
					success: function (oData, oResponse) {
						MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
						this.getMasterCommodities();
					}.bind(this),
					error: function (oError) {
						MessageToast.show(oError.responseText);
					}.bind(this)
				});
			};
			txtDescGrid.attachBrowserEvent("focusout", GetValueEdited);
		},

		showFormAddIcoterm: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminIcoterm");
		},

		AddIcoterm: function (oEvent) {
			var oModel = this.getView().getModel("ModelSimulador"),
				oModelLocal = this.getView().getModel("Commodities"),
				data = oModelLocal.getProperty("/");

			//Crea el Commoditie
			oModel.create("/headerCommoditiesSet", {
				IdCommoditie: "COM9999",
				Descripcion: data.TxtDesc
			}, {
				success: function (oData, oResponse) {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
					this.getMasterCommodities();
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

		handleEditPress: function (oEvent, Data) {
			var oRowEdited = oEvent.getSource().getParent();
			oRowEdited.getCells()[1].setProperty("editable", true);
		},

		handleDeletePress: function (oEvent, Data) {
			var oModel = this.getView().getModel("ModelSimulador");
			oModel.create("/headerCommoditiesUpdate", {
				IdCommoditie: oEvent.getSource().getParent().getParent().getCells()[0].getText(),
				Descripcion: oEvent.getSource().getParent().getParent().getCells()[1].getValue(),
				status: "0"
			}, {
				success: function (oData, oResponse) {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
					this.getMasterCommodities();
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this)
			});
		},

	});
});