sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings", 'sap/m/MessageBox'
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings, MessageBox) {
	"use strict";
	var updatedRecords = [];
	var that = this;
	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.Icoterm.GridIcoterm", {

		onInit: function () {
			var oModelV = new JSONModel({ 
				busy: true,
				Bezei: ""
			});
			this.setModel(oModelV, "modelView");

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChCreateIcoterm");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			this.GetIcoterm();
		},

		GetIcoterm: function () {
			var oModel = this.getView().getModel("ModelSimulador");
			oModel.read("/icotermSet", {
				success: function (oData, response) {
					var data = new sap.ui.model.json.JSONModel();
					data.setProperty("/CodIcoterm", oData.results);
					this.getOwnerComponent().setModel(data, "Icoterm");
					this.getModel("modelView").setProperty("/busy", false);
				}.bind(this),
				error: function (oError) {
					this.showGeneralError({
						oDataError: oError
					});
					this.getModel("modelView").setProperty("/busy", false);
				}
			});
			this.getModel("modelView").setProperty("/busy", false);
		},

		showFormAddIcoterm: function (oEvent) {
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminIcoterm");
		},

		AddIcoterm: function (oEvent) {
			this.getModel("modelView").setProperty("/busy", true);
			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oModelLocal = this.getView().getModel("Icoterm"),
				data = oModelLocal.getProperty("/");
			var valDesc = data.TxtDesc;

			var msn = "";
			if (valDesc !== "") {

				var icoterm = {
					yicoterm: 'ICO_',
					Txtmd: valDesc,
					icotermSet: []
				};

				var icotermDetail = {
					yicoterm: 'ICO_',
					yestado: '1',
					txtmd: valDesc
				};

				icoterm.icotermSet.push(icotermDetail);

				var oCreate = this.fnCreateEntity(oModelService, "/icotermHeaderSet", icoterm);

				if (oCreate.tipo === "S") {
					if (oCreate.datos.Msj !== "" && oCreate.datos.Msj !== undefined) {
						MessageBox.show(
							oCreate.msjs, {
								icon: MessageBox.Icon.ERROR,
								title: "Error"
							}
						);
					}
				} else {
					MessageBox.show(
						oCreate.msjs, {
							icon: MessageBox.Icon.ERROR,
							title: "Error"
						}
					);
				}

				if (msn == "") {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NotificacionGuardarOk"));
					this.GetIcoterm();
				} else {
					MessageToast.show("Fail");
				}
			} else {
				MessageToast.show("el campo periodo esta vacio");
			}
			this.fnCloseFragment(oEvent);
		},

		handleEditPress: function (oEvent, Data) {
			var oTable = this.byId("tblIcoterm");
			for (var j = 0; j < oTable.getModel("Icoterm").getData().CodIcoterm.length; j++) {
				var oObj = oTable.getModel("Icoterm").getData().CodIcoterm[j];
				oObj.editable = false;
				oObj.highlight = "None";
			}
			oEvent.getSource().getParent().getCells()[1].setEditable(true);
			updatedRecords.push(oEvent.getSource().getParent().getIndex());
		},

		handleDeletePress: function (oEvent, Data) {
			var oTempRow = oEvent.getSource().getParent().getParent().getCells();
			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			var icoterm = {
				yicoterm: 'ICO_',
				Txtmd: '',
				icotermSet: []
			};

			var icotermDetail = {
				yicoterm: oTempRow[0].getText(),
				yestado: '0',
				txtmd: oTempRow[1].getValue()
			};

			icoterm.icotermSet.push(icotermDetail);

			var oCreate = this.fnCreateEntity(oModelService, "/icotermHeaderSet", icoterm);

			if (oCreate.tipo === "S") {
				if (oCreate.datos.Msj !== "" && oCreate.datos.Msj !== undefined) {
					MessageBox.show(
						oCreate.msjs, {
							icon: MessageBox.Icon.ERROR,
							title: "Error"
						}
					);
				}
			} else {
				MessageBox.show(
					oCreate.msjs, {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
					}
				);
			}
			this.GetIcoterm();
		},

		SaveIcoterm: function (oEvent, Data) {
			var oTable = this.byId("tblIcoterm");

			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oEntidad = {},
				oDetail = {};

			oEntidad = {
				yicoterm: 'ICO_',
				Txtmd: '',
				icotermSet: []
			};

			for (var i = 0; i < updatedRecords.length; i++) {

				var CurrentRow = updatedRecords[i];

				var oTempRow = oTable.getRows()[CurrentRow].getCells();

				oDetail = {
					yicoterm: oTempRow[0].getText(),
					yestado: '1',
					txtmd: oTempRow[1].getValue()
				};

				oEntidad.icotermSet.push(oDetail);
			}

			var oCreate = this.fnCreateEntity(oModelService, "/icotermHeaderSet", oEntidad);

			if (oCreate.tipo === 'S') {
				MessageBox.show(
					'Datos guardados correctamente', {
						icon: MessageBox.Icon.SUCCESS,
						title: "Exito",
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								updatedRecords = [];
								return;
							}
						}
					}
				);

			} else if (oCreate.tipo === 'E') {

				MessageBox.show(
					oCreate.msjs, {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
					}
				);

			}

			this.GetIcoterm();
		}

	});
});