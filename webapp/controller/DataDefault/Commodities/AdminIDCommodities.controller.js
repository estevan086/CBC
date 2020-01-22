sap.ui.define(["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/library",
	"sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/ui/table/RowSettings"
], function (Controller, History, CoreLibrary, JSONModel, MessageToast, RowSettings) {
	"use strict";

	this.updatedRecords = [];
	var that = this;
	var MessageType = CoreLibrary.MessageType;

	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.Commodities.AdminIDCommodities", {

		onInit: function () {

		},

		onAfterNavigate: function (oEvent) {
			var sServiceUrl = this.getView().getParent().getParent().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			var oCreate = this.fnGetEntity(oModelService, "/headerCommoditiesSet");

			that = this;
			if (oCreate.tipo === "S") {
				if (oCreate.datos.Msj !== "" && oCreate.datos.Msj !== undefined) {
					sap.m.MessageToast.show(oCreate.datos.Msj);
				} else {

					this.getView().setModel(oCreate.datos);
				}

			} else {
				sap.m.MessageBox.error(oCreate.msjs, null, "Mensaje del sistema", "OK", null);
			}

		},

		onBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			//The history contains a previous entry
		/*	if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {*/
				// There is no history!
				// replace the current hash with page 1 (will not add an history entry)
				this.getOwnerComponent().getRouter().navTo("rtChCommodities", null, true);
			//}
		},

		saveCommodities: function (oEvent) {
			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),
				oCommodities = [],
				oEntidad = {},
				oDetail = {};

			var oTable = this.byId("tblCommodities");

			/*for (var i = 1; i < JsonValue.length; i++) {
				
			}*/

			var oSave = this.fnCreateEntity(oModelService, "/headerCommoditiesSet", that.updatedRecords);

		},
		
		showFormAddCommoditie: function (oEvent) {
			//Abre Fragment para insertar registro de ID Commoditie
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminCommodities.AddCommodities");

		},

		AddCommoditie: function (oEvent) {

			var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var oEntidad = {};

			var oIdCommoditie = sap.ui.getCore().getElementById("inputId").getValue();
			var oDescCommoditie = sap.ui.getCore().getElementById("inputDesc").getValue();

			oEntidad.IdCommoditie = oIdCommoditie;
			oEntidad.Descripcion = oDescCommoditie;

			var oCreate = this.fnCreateEntity(oModelService, "/headerCommoditiesSet", oEntidad);

			that = this;
			if (oCreate.tipo === "S") {
				if (oCreate.datos.Msj !== "" && oCreate.datos.Msj !== undefined) {
					sap.m.MessageToast.show(oCreate.datos.Msj);
				} else {

					this.fnCloseFragment();

					sap.m.MessageToast.show("ID Commoditie creada exitosamente.");

					this.AddAllPeriodsforCommoditie(oEntidad);

				}

			} else {
				sap.m.MessageBox.error(oCreate.msjs, null, "Mensaje del sistema", "OK", null);
			}
			this.fnCloseFragment();
		},

		AddAllPeriodsforCommoditie: function (oEntidad) {
			var oModel = new JSONModel();
			var today = new Date();
			var year = today.getFullYear();

			if (!this.getView().getModel().getData().COMMODITIES) {
				var oData = '{ "COMMODITIES" : [';
				oData += '{ ';

				oData += ' "CDEF_IDCOMMODITIES":"' + oEntidad.IdCommoditie + '", ';
				oData += ' "CDEF_COMMODITIE":"' + oEntidad.Descripcion + '" ';

				oData = oData + '}]}';
				var obj = $.parseJSON(oData);

				var json = new sap.ui.model.json.JSONModel(obj);
				this.getView().setModel(json);

				oModel.setData(oData);
				var fnEditDetail = this.handleEditPress.bind(this);
				var fnDleteDetail = this.handleDeletePress.bind(this);
				this.modes = [{
					key: "NavigationDelete",
					text: "Navigation & Delete",
					handler: function () {
						var oTemplate = new sap.ui.table.RowAction({
							items: [
								new sap.ui.table.RowActionItem({
									icon: "sap-icon://edit",
									text: "Edit",
									press: fnEditDetail
								}),
								new sap.ui.table.RowActionItem({
									icon: "sap-icon://delete",
									text: "Eliminar",
									press: fnDleteDetail,
									id: "btnFormuladora"
								})
							]
						});
						return [2, oTemplate];
					}
				}];
				this.getView().setModel(new JSONModel({
					items: this.modes
				}), "modes");
				this.switchState("NavigationDelete");
				return oModel;
			} else {
				var oData = '{ ';

				oData += ' "CDEF_IDCOMMODITIES":"' + oEntidad.IdCommoditie + '", ';
				oData += ' "CDEF_COMMODITIE":"' + oEntidad.Descripcion + '" ';

				oData = oData + '}';
				var obj = $.parseJSON(oData);
				this.getView().getModel().getData().COMMODITIES.push(obj);
				this.getView().getModel().refresh();
			}

		},

		switchState: function (sKey) {
			var oTable = this.byId("tblCommodities");
			var iCount = 0;
			var oTemplate = oTable.getRowActionTemplate();
			if (oTemplate) {
				oTemplate.destroy();
				oTemplate = null;
			}

			for (var i = 0; i < this.modes.length; i++) {
				if (sKey === this.modes[i].key) {
					var aRes = this.modes[i].handler();
					iCount = aRes[0];
					oTemplate = aRes[1];
					break;
				}
			}

			oTable.setRowActionTemplate(oTemplate);
			oTable.setRowActionCount(iCount);
		},

		closeDialog: function (oEvent) {
			this.fnCloseFragment();
		},

		handleEditPress: function (oEvent, Data) {
			//var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");

			var oTable = this.byId("tblCommodities");
			var oRowData = oEvent.getSource().getBindingContext().getProperty();

			var oRowEdited = oEvent.getSource().getParent().getParent();

			for (var i = 0; i < oTable.getRows().length; i++) {

				if (oTable.getRows()[i].getBindingContext() !== null) {

					oTable.getRows()[i].getBindingContext().getProperty().CDEF_EDIT_FLAG = "None";
					oTable.getRows()[i].getBindingContext().getProperty().CDEF_NAV_FLAG = false;

					//Descripcion
					oTable.getRows()[i].getCells()[1].setProperty("editable", false);
				}
			}

			//Descripcion
			oRowEdited.getCells()[1].setProperty("editable", true);

			oRowData.CDEF_EDIT_FLAG = "Information";

			oRowData.CDEF_NAV_FLAG = true;

			oTable.setRowSettingsTemplate(new RowSettings({
				highlight: "{CDEF_EDIT_FLAG}",
				navigated: "{CDEF_NAV_FLAG}"

			}));

			sap.ui.getCore().applyChanges();
			
			var oEntidad = {};
			oEntidad.IdCommoditie = oRowData.CDEF_IDCOMMODITIES;
			oEntidad.Descripcion = oRowData.CDEF_COMMODITIE;
			that.updatedRecords.push(oEntidad);
			
			MessageToast.show("ID " + (oItem.getText() || oItem.getType()) + " pressed for id " + oRowData.CDEF_IDCOMMODITIES);

		},

		handleDeletePress: function (oEvent, Data) {
			//var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");

			var oTable = this.byId("tblCommodities");
			var oRowData = oEvent.getSource().getBindingContext().getProperty();

			var oRowEdited = oEvent.getSource().getParent().getParent();

			sap.ui.getCore().applyChanges();

			MessageToast.show("ID " + (oItem.getText() || oItem.getType()) + " pressed for id " + oRowData.CDEF_IDCOMMODITIES);

		},

	});

}, /* bExport= */ true);