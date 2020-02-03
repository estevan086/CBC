sap.ui.define([
	"cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings", 'sap/m/MessageBox',
	"cbc/co/simulador_costos/util/Formatter"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings, MessageBox, Formatter) {
	"use strict";
	var that = this;
	return Controller.extend("cbc.co.simulador_costos.controller.Manufactura.Manufactura", {

		onInit: function () {

			var oModelV = new JSONModel({
				busy: true,
				Bezei: ""
			});
			this.setModel(oModelV, "modelView");

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChVolumen");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			this.GetData();
		},

		GetData: function () {
			var oModel = this.getModel("ModelSimulador");
			var sServiceUrl = oModel.sServiceUrl;
			var oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			//Get volumen
			var oRead = this.fnReadEntity(oModelService, "/versionVolumenBWSet", null);
			var oVBW = [];

			if (oRead.tipo === "S") {
				for (var i = 0; i < oRead.datos.results.length; i++) {
					if (oRead.datos.results[i].Fiscyear !== "0000") {
						oVBW.push(oRead.datos.results[i]);
					}
				}

			}
			this.oDataVersionSistema = oVBW;
			var oCbxVersionistema = this.byId("cbxVersionSistema");
			oCbxVersionistema.getModel().setProperty("/LstVersionSistema", this.oDataVersionSistema);

			//Get Año
			oRead = this.fnReadEntity(oModelService, "/periodoSet", null);
			var currentYear = "";
			var oYear = [];

			if (oRead.tipo === "S") {
				for (var i = 0; i < oRead.datos.results.length; i++) {
					if (currentYear !== oRead.datos.results[i].Year) {
						currentYear = oRead.datos.results[i].Year;
						oYear.push(oRead.datos.results[i]);
					}
				}

			}
			this.oDataPeriodo = oYear;
			var oCbx = this.byId("cbxPeriodo");
			oCbx.getModel().setProperty("/LstPeriodo", this.oDataPeriodo);
			this.getModel("modelView").setProperty("/busy", false);

			var oChx = this.byId("iptName");
			that = this;
			var GetValueEdited = function (oEvent) {
				if (oEvent.key.length < 2) {
					that.UpdateID("", "", "", oEvent.key);
				} else if (oEvent.keyCode === 8) {
					that.UpdateID("", "", "", "");
				}
			};
			oChx.attachBrowserEvent("keydown", GetValueEdited);
		},

		onChangeVersionSistema: function (oEvent) {
			this.UpdateID(oEvent.getParameter("selectedItem").getText(), "", "", "");
		},
		onChangeTypeFile: function (oEvent) {
			this.UpdateID("", oEvent.getParameter("selectedItem").getText(), "", "");
		},
		onChangePeriodo: function (oEvent) {
			this.UpdateID("", "", oEvent.getParameter("selectedItem").getText(), "");
		},

		UpdateID: function (a, b, c, d) {
			var p1 = a === "" ? this.byId("cbxVersionSistema").getValue() : a;
			var p2 = b === "" ? this.byId("cbxTypeFile").getValue() : b;
			var p3 = c === "" ? this.byId("cbxPeriodo").getValue() : c;
			var p4 = d === "" ? this.byId("iptName").getValue() : this.byId("iptName").getValue() + d;
			this.byId("inpId").setValue(p1 + p2 + p3 + p4);
		},

		saveVersionVol: function (oEvent) {
			if (this.byId("cbxVersionSistema").getValue() === "") {
				MessageBox.show(
					"Seleccion una Version", {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
					}
				);
				return;
			} else if (this.byId("cbxTypeFile").getValue() === "") {
				MessageBox.show(
					"Seleccione un Tipo Version", {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
					}
				);
				return;
			} else if (this.byId("cbxPeriodo").getValue() === "") {
				MessageBox.show(
					"Seleccion un año", {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
					}
				);
				return;
			} else if (this.byId("iptName").getValue().trim() === "") {
				MessageBox.show(
					"Nombre de version Vacio", {
						icon: MessageBox.Icon.ERROR,
						title: "Error"
					}
				);
				this.byId("iptName").setValue("");
				that.UpdateID("", "", "", "");
				return;
			} else {
				var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
					oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

				var oObject = {
					Modulo: "VOL",
					Nombre: this.byId("iptName").getValue(),
					FiscYear: this.byId("cbxPeriodo").getValue(),
					VelVol: this.byId("cbxVersionSistema").getValue(),
					TipoVersionVolumen: this.byId("cbxTypeFile").getValue()
				};

				var oCreate = this.fnCreateEntity(oModelService, "/versionSet", oObject);

				if (oCreate.tipo === "S") {
					MessageBox.show(
						'Datos guardados correctamente', {
							icon: MessageBox.Icon.SUCCESS,
							title: "Exito",
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === sap.m.MessageBox.Action.OK) {
									return;
								}
							}
						}
					);
				} else {
					MessageBox.show(
						"Fail", {
							icon: MessageBox.Icon.ERROR,
							title: "Error"
						}
					);
				}

				/*this.getModel("ModelSimulador").create("/versionSet", oObject, {
					success: function (oData, oResponse) {
						
					},
					error: function (oError) {
						
					}
				});*/

			}
		}

	});

});