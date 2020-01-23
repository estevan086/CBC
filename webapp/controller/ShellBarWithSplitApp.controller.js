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

			// const router = this.getOwnerComponent().getRouter();
			// router.attachRoutePatternMatched(this.onRoutePatternMatched.bind(this));
			// this.getView().addEventDelegate({
			// 	onAfterShow: this.onAfterShow.bind(this, router),
			// });

			this.oModel = new JSONModel();
			this.oModel.setData({
				"selectedKey": "rtHome",
				"navigation": [
					{
						"title": "Home",
						"icon": "sap-icon://home",
						"expanded": false,
						"key": "rtHome"
					},
					{
						"title": "Administraci\u00F3n",
						"icon": "sap-icon://employee",
						"expanded": false,
						"key": "rtAdministracion",
						"items": [
							{
								"title": "Centros",
								"key": "rtChCentros"
							},
							{
								"title": "Unidad de Medida",
								"key": "rtChUndMedida"
							},
							{
								"title": "Periodos",
								"key": "rtChPeriodo"
							},
							{
								"title": "Logística",
								"key": "rtChAdminLogistica"
							},
							{
								"title": "Perfiles",
								"key": "rtChUsers"
							}
						]
					},
					{
						"title": "Datos Default",
						"icon": "sap-icon://accounting-document-verification",
						"expanded": false,
						"key": "rtDataDefault",
						"items": [
							{
								"title": "Mantenimiento Tipo Cambio",
								"key": "rtChTypeChange"
							},
							{
								"title": "Crear Icoterm",
								"key": "rtChCreateIcoterm"
							},
							{
								"title": "Copiar Versiones",
								"key": "rtChCopyVersion"
							},
							{
								"title": "Commodities",
								"key": "rtChCommodities"
							},
							{
								"title": "Materiales",
								"key": "rtChMateriales"
							},
							{
								"title": "Costos Logísticos",
								"key": "rtChCostosLogisticos"
							}
						]
					},
					{
						"title": "Escenarios",
						"icon": "sap-icon://simulate",
						"expanded": false,
						"items": [
							{
								"title": "Matriz de Escenarios",
								"key": "rtChMatrizEs"
							},
							//{
							//	"title": "Control de Escenarios",
							//	"key": "rtChControlEs"
							//},
							{
								"title": "Administración Escenarios",
								"key": "rtChAdmonEs"
							}
						]
					}
				]
				
			});
			//this.oModel.loadData(sap.ui.require.toUrl("sap/f/sample/ShellBarWithSplitApp/model") + "/model.json", null, false);
			this.getView().setModel(this.oModel);
			this.getRouter().navTo("home2");
		},

		onItemSelect: function (oEvent) {

			var router = this.getOwnerComponent().getRouter(),
				sKey = oEvent.getParameter("item").getProperty("key");
			//if (this._isPageInNavContainer(sKey)) {
				router.navTo(sKey);
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