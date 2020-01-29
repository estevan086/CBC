sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return {
		init: function (oContext) {
			this._oContext = oContext;
			this._oView = oContext.getView();
			this._createDialog(oContext);
		},

		open: function () {
			this._createDialogModel();
			if (!this._oDialog) {
				this._createDialog(this._oContext);
			}
			if (!this._oDialog.isOpen()) {
				this._oDialog.open();
			}
		},
		close: function(){
			this._oDialog.close();
		},
		getModel: function(){
			return this.oModelDialog;
		},
		onSelectOption: function(oEvent){
			var iSelectedIndex = oEvent.getSource().getSelectedIndex();
			var oModel = this._createDialogModel();
			oModel.setProperty("/version/indexOption", iSelectedIndex);
		},
		_createDialog: function (oContext) {
			this._oDialog = sap.ui.xmlfragment(this._oView.createId("SelectVersion"),
				"cbc.co.simulador_costos.view.Versiones.SelectVersion", oContext);
			this._oDialog.setEscapeHandler(function(oPromise){
				oPromise.reject();
			});
			this._oView.byId("SelectVersion--rbtnOption").attachSelect(jQuery.proxy(this.onSelectOption, this));
			this._oView.addDependent(this._oDialog);
		},
		_createDialogModel: function () {
			var oModel = new JSONModel({
				title: this._oContext.getResourceBundle().getText("titleVersionFragment"),
				version: {
					indexOption: 0,
					versionForEdit: "",
					idNewVersion: "",
					descriptionVersion: "",
					materialsVersion: "",
					logisticsOrigin: ""
				}
			});
			this._oView.setModel(oModel, "versionModel");
			this.oModelDialog = oModel;
			return oModel;
		}
	};

});