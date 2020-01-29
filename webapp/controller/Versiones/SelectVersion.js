sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, Filter, FilterOperator) {
	"use strict";

	return {
		init: function (oContext, sModulo) {
			this._oContext = oContext;
			this._oView = oContext.getView();
			this._createDialog(oContext);
			this._sModulo = sModulo;
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
		close: function () {
			this._oDialog.close();
		},
		getModel: function () {
			return this.oModelDialog;
		},
		onSelectOption: function (oEvent) {
			var iSelectedIndex = oEvent.getSource().getSelectedIndex();
			var oModel = this._createDialogModel();
			oModel.setProperty("/version/indexOption", iSelectedIndex);
		},
		onRequestSelectOriginVersion: function (oEvent, oEvent2) {
			var sValueFilter = "",
				oControl;
			if (typeof oEvent === "string" || oEvent2) {
				sValueFilter = oEvent;
				oControl = oEvent2.getSource();
			} else {
				$.each(oEvent.getSource().getCustomData(), function () {
					if (this.getKey() === "filter") {
						sValueFilter = this.getValue();
					}
				});
				oControl = oEvent.getSource();
			}
			this._oSelectDialog = this._createSelectDialogOriginVersion(sValueFilter, oControl);
			this._oSelectDialog.open();
		},
		onSearchOriginVersion: function (sValueFilter, oControl, oEvent) {
			/*console.log(oEvent);
			console.log(sValueFilter);
			console.log(oControl);*/
		},
		onConfirmOriginVersion: function (oControl, oEvent) {
			/*console.log(oEvent);
			console.log(oControl);*/
		},
		onCancelOriginVersion: function (oEvent) {

		},
		_createDialog: function (oContext) {
			this._oDialog = sap.ui.xmlfragment(this._oView.createId("SelectVersion"),
				"cbc.co.simulador_costos.view.Versiones.SelectVersion", oContext);
			this._oDialog.setEscapeHandler(function (oPromise) {
				oPromise.reject();
			});
			this._oView.byId("SelectVersion--rbtnOption").attachSelect(jQuery.proxy(this.onSelectOption, this));
			this._oView.byId("SelectVersion--inpMaterialsVersion").attachValueHelpRequest(jQuery.proxy(this.onRequestSelectOriginVersion, this));
			this._oView.byId("SelectVersion--inpOriginVersion").attachValueHelpRequest(jQuery.proxy(this.onRequestSelectOriginVersion, this));
			this._oView.byId("SelectVersion--inpVersionForEdit").attachValueHelpRequest(jQuery.proxy(this.onRequestSelectOriginVersion, this,
				this._sModulo));
			this._oView.addDependent(this._oDialog);
		},
		_createSelectDialogOriginVersion: function (sValueFilter, oControl) {
			var oSelectDialog = this._oSelectDialog;
			if (!this._oSelectDialog) {
				oSelectDialog = new sap.m.SelectDialog(this._oView.createId("SelectDialogVersion"), {
					noDataText: "No se han encontrado versiones",
					title: "Seleccione una versión",
					search: jQuery.proxy(this.onSearchOriginVersion, this, sValueFilter, oControl),
					confirm: jQuery.proxy(this.onConfirmOriginVersion, this, oControl),
					cancel: jQuery.proxy(this.onCancelOriginVersion, this),
					showClearButton: true
				});
				this._oView.addDependent(oSelectDialog);
			}
			var oTemplate = new sap.m.StandardListItem({
				title: "Prueba",
				type: "Active"
			});
			var aFilter = [new Filter(
				"Modulo",
				FilterOperator.EQ,
				sValueFilter
			)];
			oSelectDialog.bindAggregation("items", {
				path: "/versionSet",
				model: "ModelSimulador",
				template: oTemplate,
				filters: aFilter
			});
			return oSelectDialog;
		},
		_createDialogModel: function () {
			var oModel = new JSONModel({
				title: this._oContext.getResourceBundle().getText("titleVersionFragment"),
				version: {
					indexOption: 0,
					versionForEdit: "",
					nameVersion: "",
					idNewVersion: this._sModulo + "_",
					descriptionVersion: "",
					materialsVersion: "",
					logisticsOrigin: "",
					modulo: this._sModulo
				}
			});
			this._oView.setModel(oModel, "versionModel");
			this.oModelDialog = oModel;
			return oModel;
		}
	};

});