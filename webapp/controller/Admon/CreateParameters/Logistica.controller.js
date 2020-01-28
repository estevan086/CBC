jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType"
], function (BaseController, Filter, MessageToast, JSONModel, Message, MessageType) {
	"use strict";

	return BaseController.extend("cbc.co.simulador_costos.controller.Admon.CreateParameters.Logistica", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cbc.co.simulador_costos.view.AdminIDLogisticCost
		 */
		onInit: function () {

			this.initMessageManager();
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
						oTable = this.getView().byId("tblLogisticCategories"),
						data = new sap.ui.model.json.JSONModel();

					this.getModel("modelView").setProperty("/busy", false);

					oData.results.forEach(function (oValue) {
						oValue.enabled = false;
						dataRet.push(oValue);
					});

					data.setProperty("/Items", dataRet);
					this.getOwnerComponent().setModel(data, "LogisticCategories");
					oTable.setModel(this.getModel("LogisticCategories"));

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
		onUpdateLogisticCat: function (oEvent) {
			var oModel = this.getModel("LogisticCategories"),
				oCodLogisticCat = oModel.getProperty("/Items"),
				oValue = oCodLogisticCat.find(x => x.enabled === true);
			//esperar por la ultima peticion al servidor
			if (oValue !== undefined) {
				oCodLogisticCat.find(x => x.enabled === true).enabled = false;
				this.updateLogisticCat({
					CatCosLo: oValue.CatCosLo,
					TxtMd: oValue.TxtMd
				}, oCodLogisticCat.find(x => x.enabled === true) !== undefined ? true : false);
			}
		},
		updateLogisticCat: function (oDataLc, pLast = false) {
			var oModel = this.getView().getModel("ModelSimulador");

			this.getModel("modelView").setProperty("/busy", true);

			//Crea el CL
			oModel.create("/categorialogisticaSet", {
				CatCosLo: oDataLc.CatCosLo,
				TxtMd: oDataLc.TxtMd
			}, {
				success: function (oData, oResponse) {
					if (pLast === false) {
						MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionModificacionOk"));
						this.getLogisticCatData();
					} else {
						this.onUpdateLogisticCat();
					}
				}.bind(this),
				error: function (oError) {
					this.getModel("modelView").setProperty("/busy", false);
					if (pLast === false) {
						this.showGeneralError({
							oDataError: oError
						});
					}
				}.bind(this)
			});
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
					if (oResponse !== undefined) {
						this.getModel("modelView").setProperty("/busy", false);
						var oMessage = JSON.parse(oResponse.headers["sap-message"]);

						if (oMessage.severity === "error") {
							this.showGeneralError({
								message: oMessage.message,
								title: this.getResourceBundle().getText("ErrorBorrado")
							});
							this.addMessage(new Message({
								message: oMessage.message,
								type: MessageType.Error
							}));
						} else {
							this.addMessage(new Message({
								message: oMessage.message,
								type: MessageType.Success
							}));
							MessageToast.show(oMessage.message);
							this.getLogisticCatData();
						}
					}
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
				oTable = this.getView().byId("tblLogisticCategories"),
				oCodLogisticCost = this.getModel("LogisticCategories").getProperty("/Items");

			oCodLogisticCost[index].enabled = true;
			oTable.getModel().refresh();

		}

	});

});