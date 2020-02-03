sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings",
		"sap/ui/core/message/Message",
		"sap/ui/core/MessageType"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings, Message, MessageType) {
	"use strict";
	var editableRows = [];

	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.Commodities.AdminIDCommodities", {
		onInit: function () {
			
			this.setModel(new JSONModel({
				busy: true,
				Bezei: ""
			}), "modelView");
			
			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChIDCommodities");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			editableRows = [];
			var oTableCommodities = this.byId("tblCommodities");
			
				oTableCommodities.getRows().forEach( function(oValue,i) {
					oValue.getCells()[1].setProperty("editable",false);	
				});
				
			this.getMasterCommodities();
		},

		getMasterCommodities: function () {
			var oModel = this.getView().getModel("ModelSimulador");
			
			this.getModel("modelView").setProperty("/busy", true);
			
			oModel.read("/headerCommoditiesSet", {
				success: function (oData, response) {
					var dataModel = new sap.ui.model.json.JSONModel(),
						oTableCommodities = this.byId("tblCommodities");
					
					this.getModel("modelView").setProperty("/busy", false);
					
					dataModel.setProperty("/CodCommodities", oData.results);
					this.getOwnerComponent().setModel(dataModel, "Commodities");
					oTableCommodities.setModel(this.getModel("Commodities"));
				}.bind(this),
				error: function (oError) {
					this.getModel("modelView").setProperty("/busy", false);
					this.showGeneralError({
						oDataError: oError
					});
				}
			});
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
		updateCommoditie: function (oDataCom, pLast) {
			var oModel = this.getView().getModel("ModelSimulador");
			
			this.getModel("modelView").setProperty("/busy", true);
			//Crea el Commoditie
			oModel.update("/headerCommoditiesSet(IdCommoditie='" + oDataCom.IdCommoditie + "')", oDataCom, {
				success: function (oData, oResponse) {
					if (pLast === true) {
						this.getModel("modelView").setProperty("/busy", false);
						MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
						this.getMasterCommodities();
					} else {
						this.onUpdateCommoditie(true);
					}
				}.bind(this),
				error: function (oError) {
					this.getModel("modelView").setProperty("/busy", false);
					this.showGeneralError({
						oDataError: oError
					});
				}.bind(this)
			});
		},
		handleEditPress: function (oEvent, Data) {
			var oRowEdited = oEvent.getSource().getParent();
			oRowEdited.getCells()[1].setProperty("editable", true);
			editableRows.push(oEvent.getSource().getParent().getIndex());
		},

		handleDeletePress: function (oEvent, Data) {
			var oModel = this.getView().getModel("ModelSimulador");
			
			this.getModel("modelView").setProperty("/busy", true);
			
			oModel.remove("/headerCommoditiesSet('"+oEvent.getSource().getParent().getParent().getCells()[0].getText()+"')",
			 {
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
					this.getModel("modelView").setProperty("/busy", false);
					this.showGeneralError({
						oDataError: oError
					});
				}.bind(this)
			});
		},
		onUpdateCommoditie: function (pRec = false) {
			var oTableCommodities = this.byId("tblCommodities"),
				oModelLocal = oTableCommodities.getModel().getProperty("/CodCommodities");

			editableRows = [...new Set(editableRows)];

			if (editableRows.length >= 1) {
				this.updateCommoditie({
						IdCommoditie: oModelLocal[editableRows[0]].IdCommoditie,
						Descripcion: oModelLocal[editableRows[0]].Descripcion
					},
					editableRows.length === 1 ? true : false);
				oTableCommodities.getRows()[editableRows[0]].getCells()[1].setProperty("editable",false);
				editableRows.shift();
			}else if(pRec !== true){
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("Norowsforupdate"));
			}
		}

	});

}, /* bExport= */ true);