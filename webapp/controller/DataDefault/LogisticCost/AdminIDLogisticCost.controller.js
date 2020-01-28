sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType"
], function (BaseController, Filter, MessageToast, JSONModel, Message, MessageType) {
	"use strict";

	return BaseController.extend("cbc.co.simulador_costos.controller.DataDefault.LogisticCost.AdminIDLogisticCost", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cbc.co.simulador_costos.view.AdminIDLogisticCost
		 */
		onInit: function () {

			this.initMessageManager();
			this.setModel(new JSONModel({
				busy: true,
				Bezei: ""
			}), "modelView");

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChAdminCL");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},
		onMyRoutePatternMatched: function (event) {

			this.getLogisticCostData();

		},
		getLogisticCostData: function () {
			var oModel = this.getView().getModel("ModelSimulador");

			this.getModel("modelView").setProperty("/busy", true);

			oModel.read("/codigocostologisticoSet", {
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel(),
						oTable = this.getView().byId("tblLogisticcCost"),
						dataRet = [];

					this.getModel("modelView").setProperty("/busy", false);

					oData.results.forEach(function (oValue) {
						oValue.enabled = false;
						dataRet.push(oValue);
					});

					data.setProperty("/CodLogisticCost", dataRet);
					this.getOwnerComponent().setModel(data, "LogisticCost");
					oTable.setModel(this.getModel("LogisticCost"));

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
			this.getModel("LogisticCost").getProperty("/").CatCosLo = "";
			this.getModel("LogisticCost").getProperty("/").CostLog = "";
			this.getModel("LogisticCost").getProperty("/").TxtMd = "";

			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminLogisticCost.AddLogisticCost");
		},
		onUpdateLogisticCost: function (oEvent) {
			var oModel = this.getModel("LogisticCost"),
				oCodLogisticCost = oModel.getProperty("/CodLogisticCost"),
				oValue = oCodLogisticCost.find(x => x.enabled === true);
			//esperar por la ultima peticion al servidor
			if (oValue !== undefined) {
				oCodLogisticCost.find(x => x.enabled === true).enabled = false;
				this.updateLogisticCost({
					CostLog: oValue.CostLog,
					CatCosLo: oValue.CatCosLo,
					TxtMd: oValue.TxtMd
				}, oCodLogisticCost.find(x => x.enabled === true) !== undefined ? true : false);
			}

		},
		updateLogisticCost: function (oDataLc, pLast = false) {
			var oModel = this.getView().getModel("ModelSimulador");

			this.getModel("modelView").setProperty("/busy", true);

			//Crea el CL
			oModel.create("/codigocostologisticoSet", {
				CostLog: oDataLc.CostLog,
				CatCosLo: oDataLc.CatCosLo,
				TxtMd: oDataLc.TxtMd
			}, {
				success: function (oData, oResponse) {
					if (pLast === false) {
						MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionModificacionOk"));
						this.getLogisticCostData();
					} else {
						this.onUpdateLogisticCost();
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
		onSaveLogisticCost: function (oEvent) {
			var oModel = this.getView().getModel("ModelSimulador"),
				oModelLocal = this.getView().getModel("LogisticCost"),
				data = oModelLocal.getProperty("/");

			this.getModel("modelView").setProperty("/busy", true);

			//Crea el CL
			oModel.create("/codigocostologisticoSet", {
				CatCosLo: data.CatCosLo,
				TxtMd: data.TxtMd
			}, {
				success: function (oData, oResponse) {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
					this.getLogisticCostData();
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

			oModel.remove("/codigocostologisticoSet('" + oRow.getCells()[0].getText() + "')", {
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
							this.getLogisticCostData();
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
				oTable = this.getView().byId("tblLogisticcCost"),
				oCodLogisticCost = this.getModel("LogisticCost").getProperty("/CodLogisticCost");

			oCodLogisticCost[index].enabled = true;
			oTable.getModel().refresh();
		}
	});

});