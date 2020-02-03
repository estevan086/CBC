sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings) {
	"use strict";
	var that = this;
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
			var oModel = this.getOwnerComponent().getModel("ModelSimulador");
			var sServiceUrl = oModel.sServiceUrl;
			var oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			//Definir filtro

			//Leer datos del ERP
			//var oRead = this.fnReadEntity(oModelService, "/icotermSet", null);

			var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/icotermSet", {
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
			/*	var txtDescGrid = this.byId("txtDescGrid");
				var GetValueEdited = function (oEvent) {
					var oEntidad = {};
					oEntidad.yidAuton = this.getParent().getCells()[0].getText();
					oEntidad.yicoterm = this.getParent().getCells()[1].getValue();

					var oCreate = that.fnUpdateEntity(oModelService, "/IcotermSet", oEntidad);

					if (oCreate.tipo === "S") {
						if (oCreate.datos.Msj !== "" && oCreate.datos.Msj !== undefined) {
							MessageToast.show(oCreate.datos.Msj);
						}
					} else {
						MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
						this.getMasterCommodities();
					}
				};
				txtDescGrid.attachBrowserEvent("focusout", GetValueEdited);
				that = this;
				this.getModel("modelView").setProperty("/busy", false);*/
		},

		showFormAddIcoterm: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminIcoterm");
		},

		AddIcoterm: function (oEvent) {
			this.getModel("modelView").setProperty("/busy", true);
			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oModelLocal = this.getView().getModel("Icoterm"),
				data = oModelLocal.getProperty("/");
			var valDesc = data.TxtDesc;

			var msn = "";
			if (valDesc !== "") {
				var oEntidad = {};
				oEntidad.yidAuton = "ICO_";
				oEntidad.yicoterm = valDesc;

				var oCreate = this.fnCreateEntity(oModelService, "/icotermSet", oEntidad);

				if (oCreate.tipo === "S") {
					if (oCreate.datos.Msj !== "" && oCreate.datos.Msj !== undefined) {
						msn = "fail";
					}
				} else {
					msn = "fail";
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