sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("cbc.co.simulador_costos.controller.Admon.Profiles", {
		onInit: function () {
			var oTable = this.byId("tblProfiles"),
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

			this.i18n = this.getResourceBundle();
			var oViewModel = this._createViewModel();
			
			oTable.attachEventOnce("updateFinished", function () {
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			this.getRouter().getRoute("rtChProfiles").attachPatternMatched(this._onMasterMatched, this);
		},
		onUpdateFinished: function (oEvent) {
			this._updateListItemCount(oEvent.getParameter("total"));
		},
		_onMasterMatched: function (oEvent) {
			//this.getRouter().navTo("rtChListProfiles", {}, true);
		},
		_createViewModel: function () {
			var oViewModel = new JSONModel({
				tableTitle: this.i18n.getText("profilesViewTitle"),
				delay: 0
			});
			this.setModel(oViewModel, "viewModel");
			return oViewModel;
		},
		_updateListItemCount: function (iTotalItems) {
			var sTitle,
				oTable = this.byId("tblProfiles");
			if (oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.i18n.getText("profilesTableTitleCount", [iTotalItems]);
				this.getModel("viewModel").setProperty("/tableTitle", sTitle);
			}
		}
	});
});