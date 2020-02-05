sap.ui.define([], function () {
	"use strict";
	return {
		factoryColumnsScenes: function (sId, oContext) {
			var oObject;
			if (oContext.getObject().id === "00") {
				oObject = new sap.ui.table.Column({
					width: "190px",
					label: this.getResourceBundle().getText("moduleScenarioViewHeader"),
					template: new sap.m.Text({
						text: "{viewModel>modulo}"
					})
				});
			} else {
				oObject = new sap.ui.table.Column({
					width: "230px",
					label: oContext.getObject().value,
					template: new sap.m.HBox({
						items: [new sap.m.Input({
								value: "{viewModel>" + oContext.getObject().id + "}",
								showValueHelp: true,
								valueHelpOnly: true,
								valueState: "{viewModel>" + oContext.getObject().id + "ValueState}",
								enabled: "{viewModel>/modeEdit}",
								visible: "{viewModel>visibleInput}"
							}).attachValueHelpRequest(function (oEvent) {
								this._oSelectDialog = this._createSelectDialogOriginVersion(oEvent.getSource().data("row"), oEvent.getSource().data("mes"));
								this._oSelectDialog.open();
							}.bind(this)).data({
								"mes": oContext.getObject().id,
								"row": "{viewModel>tipoVersion}"
							}),
							new sap.m.ComboBox({
								selectedKey: "{viewModel>" + oContext.getObject().id + "TC}",
								valueState: "{viewModel>" + oContext.getObject().id + "ValueState}",
								enabled: "{viewModel>/modeEdit}",
								visible: "{viewModel>visibleCombo}",
								items: [new sap.ui.core.Item({
									key: "R",
									text: "{i18n>Real}"
								}), new sap.ui.core.Item({
									key: "P",
									text: "{i18n>Plan}"
								})]
							}).data({
								"mes": oContext.getObject().id,
								"row": "{viewModel>tipoVersion}"
							})
						]
					})
				});
			}
			return oObject;
		}
	};
});