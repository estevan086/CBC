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
		onRequestSelectOriginVersion: function (oEvent) {
			var sValueFilter = "",
				sProperty = "";
			$.each(oEvent.getSource().getCustomData(), function () {
				if (this.getKey() === "filter") {
					sValueFilter = this.getValue();
				}
				if (this.getKey() === "property") {
					sProperty = this.getValue();
				}
			});
			this._oSelectDialog = this._createSelectDialogOriginVersion(sValueFilter, sProperty);
			this._oSelectDialog.open();
		},
		onSearchOriginVersion: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilter = [new Filter("Modulo", FilterOperator.EQ, this._sValueFilter),
				new Filter("Version", FilterOperator.Contains, sValue)
			];
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(aFilter);
		},
		onConfirmOriginVersion: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var oModel = this.getModel("versionModel");
			if (oSelectedItem) {
				oModel.setProperty("/version/" + this._sProperty, oSelectedItem.getTitle());
				oModel.setProperty("/version/" + this._sProperty + "Desc", oSelectedItem.getDescription());
			}
			if (!oSelectedItem) {
				oModel.setProperty("/version/" + this._sProperty, "");
				oModel.setProperty("/version/" + this._sProperty + "Desc", "");
			}
		},
		onCreateVersion: function (oEvent) {
			if (!this._validateMandatoryInput()) {
				return;
			}
			this._createVersion(function (oData) {
					if (oData.Version) {
						this.getModel("versionModel").setProperty("/version/idVersion", oData.Version);
						this.close();
						if (this._oView.getController().onShowVersion) {
							this._oView.getController().onShowVersion(this.getModel("versionModel").getProperty("/version"));
						}
					}
				}.bind(this),
				function (oError) {
					this._oView.getController().showGeneralError({
						oDataError: oError
					});
					//this.close();
				}.bind(this));

		},
		onChangeOriginVersion: function (oEvent) {
			this._bindYears("DEF");
		},
		onSuggestionItemSelectedOriginVersion: function (oEvent) {
			this._bindYears("DEF");
		},
		onEditVersion: function (oEvent) {
			this.close();
			this.getModel("versionModel").setProperty("/version/idVersion", this.getModel("versionModel").getProperty("/version/versionForEdit"));
			if (this._oView.getController().onShowVersion) {
				this._oView.getController().onShowVersion(this.getModel("versionModel").getProperty("/version"));
			}
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
			this._oView.byId("SelectVersion--inpOriginVersion").attachChange(jQuery.proxy(this.onChangeOriginVersion, this));
			this._oView.byId("SelectVersion--inpOriginVersion").attachSuggestionItemSelected(jQuery.proxy(this.onSuggestionItemSelectedOriginVersion,
				this));
			this._oView.byId("SelectVersion--inpVersionForEdit").attachValueHelpRequest(jQuery.proxy(this.onRequestSelectOriginVersion, this));
			this._oView.byId("SelectVersion--btnCreateVersion").attachPress(jQuery.proxy(this.onCreateVersion, this));
			this._oView.byId("SelectVersion--btnEditVersion").attachPress(jQuery.proxy(this.onEditVersion, this));
			this._oView.addDependent(this._oDialog);
		},
		_createSelectDialogOriginVersion: function (sValueFilter, sProperty) {
			var oSelectDialog = this._oSelectDialog;
			if (!this._oSelectDialog) {
				oSelectDialog = new sap.m.SelectDialog(this._oView.createId("SelectDialogVersion"), {
					noDataText: this._oContext.getResourceBundle().getText("notVersionsFoundVersionFragment"),
					title: this._oContext.getResourceBundle().getText("selectTitleVersionFragment"),
					confirm: jQuery.proxy(this.onConfirmOriginVersion, this),
					cancel: jQuery.proxy(this.onConfirmOriginVersion, this),
					search: jQuery.proxy(this.onSearchOriginVersion, this),
					showClearButton: true
				});
				this._oView.addDependent(oSelectDialog);
			}
			/*oSelectDialog.attachConfirm(jQuery.proxy(this.onConfirmOriginVersion, this, sProperty));
			oSelectDialog.attachCancel(jQuery.proxy(this.onConfirmOriginVersion, this, sProperty));
			oSelectDialog.attachSearch(jQuery.proxy(this.onSearchOriginVersion, this, sProperty));*/
			this._sProperty = sProperty;
			this._sValueFilter = sValueFilter;
			var oTemplate = new sap.m.StandardListItem({
				title: "{ModelSimulador>Version}",
				description: "{ModelSimulador>Txtmd}",
				type: "Active"
			});
			var aFilter = [new Filter(
				"Modulo",
				FilterOperator.EQ,
				sValueFilter
			)];
			var oVersion = this.getModel("versionModel").getProperty("/version");
			if (sValueFilter !== this._sModulo && oVersion.logisticsOrigin) {
				aFilter.push(new Filter(
					"VerOrigen",
					FilterOperator.EQ,
					oVersion.logisticsOrigin
				));
			}
			oSelectDialog.bindAggregation("items", {
				path: "/versionSet",
				model: "ModelSimulador",
				template: oTemplate,
				filters: aFilter
			});
			return oSelectDialog;
		},
		_validateMandatoryInput: function () {
			var oErrors = [];
			var oVersion = this.getModel("versionModel").getProperty("/version");
			if (oVersion.indexOption === 0) {
				if (!oVersion.versionForEdit) {
					oErrors.push(this._oContext.getResourceBundle().getText("errMissVersionForEditVersionFragment"));
				}
			}
			if (oVersion.indexOption === 1) {
				if (!oVersion.nameVersion) {
					oErrors.push(this._oContext.getResourceBundle().getText("errMissNameVersionFragment"));
				}
				if (!oVersion.descriptionVersion) {
					oErrors.push(this._oContext.getResourceBundle().getText("errMissDescriptionVersionFragment"));
				}
				if (!oVersion.materialsVersion && !oVersion.logisticsOrigin) {
					oErrors.push(this._oContext.getResourceBundle().getText("errMissMaterialVersionVersionFragment"));
				}
			}
			if (oErrors.length > 0) {
				this._oView.getController().showGeneralError({
					message: this._oContext.getResourceBundle().getText("errMissSummary") + "\n - " + oErrors.join("\n - ")
				});
				return false;
			}
			return true;
		},
		_bindYears: function (sOriginVersion) {
			var oCmbYear = this._oView.byId("SelectVersion--cmbYear");
			var oTemplate = new sap.ui.core.Item({
				key: "{ModelSimulador>Year}",
				text: "{ModelSimulador>Year}"
			});
			var aFilter = [new Filter(
				"Version",
				FilterOperator.EQ,
				sOriginVersion
			)];
			oCmbYear.bindItems({
				path: "/annoVersionSet",
				model: "ModelSimulador",
				template: oTemplate,
				filters: aFilter
			});
		},
		_createVersion: function (fnSuccess, fnError) {
			var oVersion = this.getModel("versionModel").getProperty("/version");
			var oObject = {
				Modulo: this._sModulo,
				Date0: "20200129",
				Txtmd: oVersion.nameVersion,
				FiscYear: oVersion.year,
				VerMaterial: oVersion.materialsVersion,
				VerOrigen: oVersion.logisticsOrigin
			};
			this._oView.getModel("ModelSimulador").create("/versionSet", oObject, {
				success: function (oData, oResponse) {
					fnSuccess(oData, oResponse);
				},
				error: function (oError) {
					fnError(oError);
				}
			});
		},
		_createDialogModel: function () {
			var oModel = new JSONModel({
				title: this._oContext.getResourceBundle().getText("titleVersionFragment"),
				version: {
					indexOption: 0,
					versionForEdit: "",
					country: "",
					nameVersion: "",
					idVersion: "",
					descriptionVersion: "",
					materialsVersion: "",
					materialsVersionDesc: "",
					logisticsOrigin: "",
					logisticsOriginDesc: "",
					year: "2020",
					modulo: this._sModulo
				}
			});
			this._oView.setModel(oModel, "versionModel");
			this.oModelDialog = oModel;
			return oModel;
		}
	};

});