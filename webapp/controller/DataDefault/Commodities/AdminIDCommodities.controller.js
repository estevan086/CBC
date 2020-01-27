sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings) {
	"use strict";

	var that = this;
	var MessageType = CoreLibrary.MessageType;

	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.Commodities.AdminIDCommodities", {
		onInit: function () {
			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChIDCommodities");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			this.getMasterCommodities();
		},

		getMasterCommodities: function () {
			var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/headerCommoditiesSet", {
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel();
					data.setProperty("/CodCommodities", oData.results);
					this.getOwnerComponent().setModel(data, "Commodities");
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});

			var txtDescGrid = this.byId("txtDescGrid");
			var GetValueEdited = function (oEvent) {
				oModel.update("/headerCommoditiesSet", {
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

		onBack: function () {
			this.getOwnerComponent().getRouter().navTo("rtChCommodities", null, true);
		},

		showFormAddCommoditie: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminCommodities.AddCommodities");
		},

		AddCommoditie: function (oEvent) {
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
			oModel.delete("/headerCommoditiesSet", {
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

}, /* bExport= */ true);