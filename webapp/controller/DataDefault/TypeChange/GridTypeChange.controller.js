jQuery.sap.require("cbc.co.simulador_costos.Formatter");
sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings", 'sap/m/MessageBox'
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings, MessageBox) {
	"use strict";
	var updatedRecords = [];
	var that = this;
	that.updatedRecords = [];
	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.TypeChange.GridTypeChange", {

		onInit: function () {

			var oModelV = new JSONModel({
				busy: true,
				Bezei: ""
			});
			this.setModel(oModelV, "modelView");

			var myRoute = this.getOwnerComponent().getRouter().getRoute("rtChTypeChange");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function (event) {
			this.GetTypeChange();
		},

		GetTypeChange: function () {
			/*	var oModel = this.getView().getModel("ModelSimulador");
				oModel.read("/periodoSet", {
					success: function (oData, response) {
						var data = new sap.ui.model.json.JSONModel();
						data.setProperty("/CodTypeChange", oData.results);
						this.getOwnerComponent().setModel(data, "TypeChange");
						this.getModel("modelView").setProperty("/busy", false);
					}.bind(this),
					error: function (oError) {
						this.showGeneralError({
							oDataError: oError
						});
						this.getModel("modelView").setProperty("/busy", false);
					}
				});*/
		},

		handleEditPress: function (oEvent, Data) {
		/*	var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");

			var oTable = this.byId("tblCommodities");
			var oRowData = oEvent.getSource().getBindingContext().getProperty();

			for (var i = 0; i < oTable.getModel().getData().lstItemsCommodities.length; i++) {
				var oObj = oTable.getModel().getData().lstItemsCommodities[i];
				oObj.editable = false;
				oObj.highlight = "None";
			}
			oTable.getModel().setProperty(oEvent.getSource().getBindingContext().getPath() + "/editable", true);
			oTable.getModel().setProperty(oEvent.getSource().getBindingContext().getPath() + "/highlight", "Information");
			oTable.getModel().setProperty(oEvent.getSource().getBindingContext().getPath() + "/navigated", true);

			var oEntidad = {};
			var oPath = oEvent.getSource().getBindingContext().sPath;

			oEntidad.RowPath = oPath.split("/")[2];

			updatedRecords.push(oEntidad);

			MessageToast.show("Puedes comenzar a " + (oItem.getText() || oItem.getType()) + " el ID " + oRowData.IdCommoditie);*/

		},

		saveTypeChange: function (oEvent) {
			/*	var oCommodities = [];

			var oTable = this.byId("tblCommodities");

			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oEntidad = {},
				oDetail = {};

			oEntidad = {
				IdCommoditie: '1111',
				Descripcion: 'Prueba',
				detailCommoditiesSet: []
			};

			for (var i = 0; i < updatedRecords.length; i++) {

				var CurrentRow = updatedRecords[i];

				var oTempRow = oTable.getModel().getData().lstItemsCommodities[CurrentRow.RowPath];

				oDetail = {
					IdFormula: oTempRow.IdFormula,
					TxtFormula: oTempRow.TxtFormula,
					IdCommoditie: oTempRow.IdCommoditie,
					Sociedad: oTempRow.Sociedad,
					Centro: oTempRow.Centro,
					UnidadMedida: oTempRow.UnidadMedida,
					Moneda: oTempRow.Moneda,
					Mes: oTempRow.Mes,
					Year: oTempRow.Year,
					PrecioMaterial: oTempRow.PrecioMaterial,
					OtrosCostos: oTempRow.OtrosCostos
						// Recordmode: '1'
				};

				oEntidad.detailCommoditiesSet.push(oDetail);
			}

			var oCreate = this.fnUpdateEntity(oModelService, "/headerCommoditiesSet", oEntidad);

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
*/
		}

	});
});