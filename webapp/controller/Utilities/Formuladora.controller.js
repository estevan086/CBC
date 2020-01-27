sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/ui/core/EventBus"
], function (Controller, JSONModel, History, MessageToast, EventBus) {
	"use strict";

	var oPageController = Controller.extend("cbc.co.simulador_costos.controller.Utilities.Formuladora", {

			onInit: function () {
				//var oModel = new JSONModel(jQuery.sap.getModulePath("cbc.co.simulador_costos", "/dataFormuladora.json"));

				var oModel = new JSONModel();
				jQuery.ajax("model/dataFormuladora.json", {
					dataType: "json",
					success: function (oData) {
						oModel.setData(oData);
					},
					error: function () {
						jQuery.sap.log.error("failed to load json");
					}
				});

				this.getView().setModel(oModel);
				this._oBuilder = this.getView().byId("builder");

				this._oModelSettings = new JSONModel({
					layoutType: "VisualOnly",
					showInputToolbar: false,
					allowComparison: false,
					allowComparisonOperators: false,
					allowLogical: false,
					readOnly: false
				});
				this.getView().setModel(this._oModelSettings, "settings");

				this._oBuilder.setShowInputToolbar(true);

				var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChFromuladora");
				myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);

				//var eventBus = sap.ui.getCore().getEventBus();
				const bus = this.getOwnerComponent().getEventBus();
				// 1. ChannelName, 2. EventName, 3. Function to be executed, 4. Listener
				bus.subscribe("GridAdminFormuladoraChannel", "onNavigateEvent", this.onDataReceived, this);

		},

		onDataReceived: function (channel, event, data) {
			// do something with the data (bind to model)
			//console.log(JSON.stringify(data));
			
			this.oIdCommoditie = data.oIdCommoditie;
			this.oIdFormula = data.oIdFormula;
			this.oTxtFormula = data.oTxtFormula;

			var oTitle = "Id Commoditie:" + this.oIdCommoditie + " - Id Formula: " + this.oIdFormula;

			this.getView().byId("builder").setProperty("title", oTitle);
				this.getView().byId("builder").setProperty("expression", this.oTxtFormula);
			
		},

		onMyRoutePatternMatched: function (event) {
			// your code when the view is about to be displayed ..
		
		// 	this.oIdCommoditie = event.getParameter("arguments").oIdCommoditie;
		// 	this.oIdFormula = event.getParameter("arguments").oIdFormula;
		// //	this.oTxtFormula = event.getParameter("arguments").oTxtFormula;

		// 	var oTitle = "Id Commoditie:" + this.oIdCommoditie + "-";

		// 	this.getView().byId("builder").setProperty("title", oTitle);

		},

		onToPage1: function (oEvent) {

			var sPreviousHash = History.getInstance().getPreviousHash();

			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// replace the current hash with page 1 (will not add an history entry)
				this.getOwnerComponent().getRouter().navTo("rtChCommodities", null, true);
			}
		},

		saveFormula: function (oEvent) {
			var oModel = this.getView().getModel("ModelSimulador"),
				oBuilder = this.getView().byId("builder"),
				oBuilderData = oBuilder.getProperty("expression");
			//		oModelLocal = this.getView().getModel("Commodities"),
			//	data = oModelLocal.getProperty("/");

			//Crea el Commoditie
			oModel.create("/formuladoraSet", {
				IdCommoditie: this.oIdCommoditie,
				FotrCost: this.oIdFormula,
				Txtlg: oBuilderData
			}, {
				success: function (oData, oResponse) {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
					//	this.getMasterCommodities();
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
				//	this.getModel("modelView").setProperty("/busy", false);
				}.bind(this)
			});

		//	this.fnCloseFragment(oEvent);
		},

		layoutTypeChanged: function (oEvent) {
			var sKey = oEvent.getSource().getProperty("selectedKey");
			this._oBuilder.setShowInputToolbar(sKey === "TextualOnly");
		},
		handleChange: function (oEvent) {
			var oItem = oEvent.getSource().getSelectedItem(),
				oData = oItem.getCustomData(),
				sKey = oData[0].getKey();

			this.getView().byId("builder").updateOrCreateItem(sKey);
		},
		setSelection: function (oEvent) {
			var oList = this.getView().byId("Tree"),
				sKey = oEvent.getParameter("key");

			if (!sKey) {
				var oSelectedItemInVariablesList = oList.getSelectedItem();
				if (oSelectedItemInVariablesList) {
					oList.setSelectedItem(oSelectedItemInVariablesList, false);
				}
			} else {
				var aItems = oList.getItems();
				for (var k = 0; k < aItems.length; k++) {
					var oItem = aItems[k],
						sItemKey = aItems[k].getCustomData()[0].getValue();

					if (sKey === sItemKey) {
						oList.setSelectedItem(oItem, true);
						return;
					}
				}
			}

		}
	});

return oPageController;
});