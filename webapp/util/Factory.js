sap.ui.define([], function () {
	"use strict";
	return {
		factoryColumnsScenes: function (sId, oContext) {
			var oObject;
			if (oContext.getObject().id === "00") {
				oObject = new sap.ui.table.Column({
					label: this.getResourceBundle().getText("moduleScenarioViewHeader"),
					template: new sap.m.Text({
						text: "{viewModel>modulo}"
					})
				});
			} else {
				oObject = new sap.ui.table.Column({
					label: oContext.getObject().value,
					template: new sap.m.Input({
						value: "{viewModel>" + oContext.getObject().id + "}",
						showValueHelp: true,
						valueHelpOnly: true,
						valueState: "{viewModel>" + oContext.getObject().id + "ValueState}"
					}).attachValueHelpRequest(function(oEvent){
						this._oSelectDialog = this._createSelectDialogOriginVersion(oEvent.getSource().data("row"), oEvent.getSource().data("mes"));
						this._oSelectDialog.open();
					}.bind(this)).data({"mes": oContext.getObject().id, "row": "{viewModel>tipoVersion}"})
				});
			}
			return oObject;
		}	
	};
});