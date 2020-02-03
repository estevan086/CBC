sap.ui.define([
	'sap/ui/Device',
	'cbc/co/simulador_costos/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/m/Popover',
	'sap/m/Button',
	'sap/m/library'
], function (Device, Controller, JSONModel, Popover, Button, mobileLibrary) {
	"use strict";
	var ButtonType = mobileLibrary.ButtonType,
		PlacementType = mobileLibrary.PlacementType;

	var CController = Controller.extend("cbc.co.simulador_costos.controller.ShellBarWithSplitApp", {
		onInit: function () {

		/*	var showValueHelp = function () {
				var toolPageCurrent = this.getParent().getParent().byId("toolPage");
				toolPageCurrent.setSideExpanded(!toolPageCurrent.getSideExpanded());
			};
        */
			this.byId("toolPage").setSideExpanded(!this.byId("toolPage").getSideExpanded());
			/*var toolPage = this.byId("snTool");
			toolPage.attachBrowserEvent("dblclick", showValueHelp);*/

			// const router = this.getOwnerComponent().getRouter();
			// router.attachRoutePatternMatched(this.onRoutePatternMatched.bind(this));
			// this.getView().addEventDelegate({
			// 	onAfterShow: this.onAfterShow.bind(this, router),
			// });

			this.oModel = new JSONModel();
			this.oModel.setData({
				"selectedKey": "rtHome",
				"navigation": [{
					"title": "",
					"icon": "sap-icon://menu",
					"expanded": false,
					"key": "rtHomeExpanded"
				}, {
					"title": "Home",
					"icon": "sap-icon://home",
					"expanded": false,
					"key": "rtHome"
				}, {
					"title": "Administracion",
					"icon": "sap-icon://employee",
					"expanded": false,
					"key": "rtNone",
					"items": [{
						"title": "Centros",
						"key": "rtChCentros"
					}, {
						"title": "Periodos",
						"key": "rtChPeriodo"
					}, {
						"title": "Logistica",
						"key": "rtChAdminLogistica"
					}, {
						"title": "Perfiles",
						"key": "rtChProfiles"
					}]
				}, {
					"title": "Datos Default",
					"icon": "sap-icon://accounting-document-verification",
					"expanded": false,
					"key": "rtNone",
					"items": [{
						"title": "Tipo de Cambio",
						"key": "rtChTypeChange"
					}, {
						"title": "Icoterm",
						"key": "rtChCreateIcoterm"
					}, 
					/*{
						"title": "Copiar Versiones",
						"key": "rtChCopyVersion"
					}, */
					{
						"title": "Commodities",
						"key": "rtChCommodities"
					}, {
						"title": "Materiales",
						"key": "rtChMateriales"
					}, {
						"title": "Costos Log\u00EDsticos",
						"key": "rtChCostosLogisticos?version=false"
					}]
				}, {
					"title": "Commodities",
					"icon": "sap-icon://factory",
					"expanded": false,
					"key": "rtNone",
					"items": [{
						"title": "Mantenimiento Commodities",
						"key": "rtChCommoditiesVersion"
					}]
				}, {
					"title": "Materiales",
					"icon": "sap-icon://product",
					"expanded": false,
					"key": "rtNone",
					"items": [{
						"title": "Mantenimiento Materiales",
						"key": "rtChMaterialesVersion"
					}]
				}, {
					"title": "Costos Log\u00EDstico",
					"icon": "sap-icon://travel-expense",
					"expanded": false,
					"key": "rtNone",
					"items": [{
						"title": "Mantenimiento Costos Log\u00EDstico",
						"key": "rtChCostosLogisticosVersion"
					}]
				}, {
					"title": "Volumen",
					"icon": "sap-icon://upload-to-cloud",
					"expanded": false,
					"key": "rtNone",
					"items": [{
						"title": "Volumen",
						"key": "rtChVolumen"
					}]
				}, {
					"title": "Escenarios",
					"icon": "sap-icon://simulate",
					"expanded": false,
					"key": "rtNone",
					"items": [{
							"title": "Matriz de Escenarios",
							"key": "rtChMatrizEs"
						},
						//{
						//	"title": "Control de Escenarios",
						//	"key": "rtChControlEs"
						//},
						{
							"title": "Administracion Escenarios",
							"key": "rtChAdmonEs"
						}
					]
				}, {
					"title": "COGS",
					"icon": "sap-icon://provision",
					"expanded": false,
					"key": "rtNone",
					"items": [{
						"title": "Calculo de COGS",
						"key": "rtCCOGS"
					}]
				}]
			});
			//this.oModel.loadData(sap.ui.require.toUrl("sap/f/sample/ShellBarWithSplitApp/model") + "/model.json", null, false);
			this.getView().setModel(this.oModel);
			this.getRouter().navTo("home2");

		},

		onItemSelect: function (oEvent) {

			if (oEvent.getParameter("item").getProperty("key") === "rtHomeExpanded") {
				var toolPageCurrent = this.byId("toolPage");
				toolPageCurrent.setSideExpanded(!toolPageCurrent.getSideExpanded());
			}

			var router = this.getOwnerComponent().getRouter(),
				sKey = oEvent.getParameter("item").getProperty("key"),
				params = {},
				aParams = {},
				sParams,
				sValue;
			//descomponer parametros para enviar
			if (sKey.toString().indexOf("?") > 0) {
				sParams = sKey.toString().substring(sKey.toString().indexOf("?"), sKey.toString().length);
				sKey = sKey.toString().replace(sParams, "");
				aParams = sParams.split("=");
				sValue = aParams[1];
				sParams = aParams[0].toString().replace("?", "");
				params[sParams] = sValue;
			}

			//if (this._isPageInNavContainer(sKey)) {
			router.navTo(sKey, params);
			/*} else {
				this._addPageToNavContainer(sKey);
				router.navTo(sKey);
			}*/

			//var item = oEvent.getParameter('item');
			//this.byId("NavContainer").to(this.getView().createId(item.getKey()));
		},

		onMenuButtonPress: function () {
			var toolPage = this.byId("toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		handleUserNamePress: function (event) {
			var popover = new Popover({
				showHeader: false,
				placement: PlacementType.Buttom,
				content: [
					new Button({
						text: 'Feedback',
						type: ButtonType.Transparent
					}),
					new Button({
						text: 'Help',
						type: ButtonType.Transparent
					}),
					new Button({
						text: 'Logout',
						type: ButtonType.Transparent
					})
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');

			popover.openBy(event.getSource());
		},

		onSideNavButtonPress: function () {
			var toolPage = this.byId("toolPage");
			var sideExpanded = toolPage.getSideExpanded();

			this._setToggleButtonTooltip(sideExpanded);

			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		_setToggleButtonTooltip: function (bLarge) {
			var toggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				toggleButton.setTooltip('Large Size Navigation');
			} else {
				toggleButton.setTooltip('Small Size Navigation');
			}
		},

		onAfterNavigate: function (oEvent) {
			//	console.log("Test Navegacion");
		},

		handlePressConfiguration: function (oEvent) {
			/*	var oItem = oEvent.getSource();
				var oShell = this.byId("myShell");
				var bState = oShell.getShowPane();
				oShell.setShowPane(!bState);
				oItem.setShowMarker(!bState);
				oItem.setSelected(!bState);*/
			var toolPage = this.byId("toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		}

		/*_isPageInNavContainer: function (sKey) {
			var oNavContainer = this.byId("parentNavContainer"),
				aPages = oNavContainer.getPages(),
				sNewKey = this.getView().createId(sKey),
				bResult = false;
			aPages.forEach(oPage => {
				if (oPage.getId() === sNewKey) {
					bResult = true;
					return false;
				}
			});
			return bResult;
		},
		_addPageToNavContainer: function (sKey) {
			let oScroll = new sap.m.ScrollContainer(this.getView().createId(sKey), {
				horizontal: false,
				vertical: true,
				content: [new sap.ui.core.mvc.XMLView({
					viewName: "cbc.co.simulador_costos.view.DataDefault.Commodities.AdminCommodities"
				})]
			});
			let oNavContainer = this.byId("parentNavContainer");
			oNavContainer.addPage(oScroll);
		}*/

	});

	return CController;

});