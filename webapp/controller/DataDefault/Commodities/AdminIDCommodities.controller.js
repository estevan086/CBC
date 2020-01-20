sap.ui.define( ["cbc/co/simulador_costos/controller/BaseController", "sap/ui/core/routing/History", 	"sap/ui/core/library" ,	
	"sap/ui/model/json/JSONModel"], function (Controller, History, CoreLibrary, JSONModel) {
	"use strict";
	
	var that = this;
	var MessageType = CoreLibrary.MessageType;

	return Controller.extend("cbc.co.simulador_costos.controller.DataDefault.Commodities.AdminIDCommodities", {
		onInit : function () {
		//	var sUrl = "#" + this.getOwnerComponent().getRouter().getURL("page1");
		//	this.byId("link").setHref(sUrl);
		},

		onToPage1 : function (oEvent) {
			
		//	this.getOwnerComponent().getRouter().navTo("page1");
		
			var oApp = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent();
			var oNavContainer = oApp.byId("NavContainer");
			//oNavContainer.to(oApp.createId("rtChCommodities"));
			oNavContainer.back();
		},

		onBack : function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// replace the current hash with page 1 (will not add an history entry)
				//this.getOwnerComponent().getRouter().navTo("page1", null, true);
			}
		},
		
		showFormAddCommoditie: function (oEvent) {
			//Abre Fragment para insertar registro de ID Commoditie
			this.fnOpenDialog("cbc.co.simulador_costos.view.Utilities.fragments.AdminCommodities.AddCommodities");

		},
		AddCommoditie: function (oEvent) {

		/*	var sServiceUrl = this.getView().getModel("ModelSimulador").sServiceUrl,
				oModelService = new sap.ui.model.odata.ODataModel(sServiceUrl, true),*/
			var	oEntidad = {};

			var oIdCommoditie = sap.ui.getCore().getElementById("inputId").getValue();
			var oDescCommoditie = sap.ui.getCore().getElementById("inputDesc").getValue();

			oEntidad.IdCommoditie = oIdCommoditie;
			oEntidad.Descripcion = oDescCommoditie;

			/*var oCreate = this.fnCreateEntity(oModelService, "/headerCommoditiesSet", oEntidad);

			this.fnCloseFragment();

			that = this;
			if (oCreate.tipo === "S") {
				if (oCreate.datos.Msj !== "" && oCreate.datos.Msj !== undefined) {
					sap.m.MessageToast.show(oCreate.datos.Msj);
				} else {
					sap.m.MessageToast.show("ID Commoditie creada exitosamente.");*/

					this.AddAllPeriodsforCommoditie(oEntidad);

			/*	}

			} else {
				sap.m.MessageBox.error(oCreate.msjs, null, "Mensaje del sistema", "OK", null);
			}*/

		},
		
		AddAllPeriodsforCommoditie: function (oEntidad) {
			var oModel = new JSONModel();
			var today = new Date();
			var year = today.getFullYear();

			var oData = '{ "COMMODITIES" : [';
			oData += '{ ';

			oData += ' "CDEF_IDCOMMODITIES":"' + oEntidad.IdCommoditie + '", ';
			oData += ' "CDEF_COMMODITIE":"' + oEntidad.Descripcion + '" ';

			oData = oData + '}]}';
			var obj = $.parseJSON(oData);

			// var ODataPeriodos = { "COMMODITIES": [ 
			// 		{
			//             "CDEF_IDCOMMODITIES": "",
			//             "CDEF_COMMODITIE": "",
			//             "CDEF_SOCIEDAD": "",
			//             "CDEF_MONEDA": "",
			//             "CDEF_UMD": "",
			//             "CDEF_PRECIO": "",
			//             "CDEF_OTROCOSTO": "",
			//             "CDEF_FORMULA": "",
			//             "CDEF_PERIODO": "2020",
			//             "CDEF_MES": "1"
			//         }
			// 	] };

			// for (var j = 0; j < 12; j++) {

			// 	ODataPeriodos[j].CDEF_IDCOMMODITIES =  oEntidad.IdCommoditie;
			// 	ODataPeriodos[j].CDEF_COMMODITIE    =  oEntidad.DesCommoditie;

			// 	// //var oProduct = oData.COMMODITIES[i];
			// 	// if (oProduct.CDEF_IDCOMMODITIES && jQuery.inArray(oProduct.CDEF_IDCOMMODITIES, aTemp1) < 0) {
			// 	// 	aTemp1.push(oProduct.CDEF_IDCOMMODITIES);
			// 	// 	aSuppliersData.push({
			// 	// 		Name: oProduct.CDEF_IDCOMMODITIES
			// 	// 	});
			// 	// }
			// 	// if (oProduct.CDEF_COMMODITIE && jQuery.inArray(oProduct.CDEF_COMMODITIE, aTemp2) < 0) {
			// 	// 	aTemp2.push(oProduct.CDEF_COMMODITIE);
			// 	// 	aCategoryData.push({
			// 	// 		Name: oProduct.CDEF_COMMODITIE
			// 	// 	});
			// 	// }

			// }

			//var obj = $.parseJSON(OData);
			var json = new sap.ui.model.json.JSONModel(obj);
			this.getView().setModel(json);

			oModel.setData(oData);
			
			
			
			var fnEditDetail = this.showFormEditDetail.bind(this);

			this.modes = [
				{
					key: "NavigationDelete",
					text: "Navigation & Delete",
					handler: function(){
						var oTemplate = new sap.ui.table.RowAction({items: [
							new sap.ui.table.RowActionItem({icon: "sap-icon://edit", text: "Edit", press:  fnEditDetail})
						]});
						return [1, oTemplate];
					}
				}
			];
			this.getView().setModel(new JSONModel({items: this.modes}), "modes");
			this.switchState("NavigationDelete");

			return oModel;
		},
		
		showFormEditDetail: function (oEvent) {
		/*	this.LogisticaDisplay = sap.ui.xmlfragment(
				"cbc.co.simulador_costos.view.Utilities.fragments.AdminCommodities.EditDetailCommodities", this);
			this.LogisticaDisplay.open();*/
			//this.getOwnerComponent().OpnFrmLogitica();
		},

		closeDialog: function (oEvent) {
			this.fnCloseFragment();
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

		
		
	});

}, /* bExport= */ true);
