sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/Popover',
	'sap/m/Button',
	'sap/m/library'
], function (Device, Controller, JSONModel, Popover, Button, mobileLibrary) {
	"use strict";
	var ButtonType = mobileLibrary.ButtonType,
		PlacementType = mobileLibrary.PlacementType;
		
	var CController = Controller.extend("cbc.co.simulador_costos.controller.ShellBarWithSplitApp", {
		onInit : function() {
			this.oModel = new JSONModel();
			this.oModel.setData({
				"selectedKey": "page2",
				"navigation": [
					{
						"title": "Home",
						"icon": "sap-icon://home",
						"expanded": false,
						"key": "rtHome"
					},
					{
						"title": "Administración",
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
								"key": "rtChAddProfile"
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
					},
					{
						"title": "Commodities",
						"icon": "sap-icon://factory",
						"expanded": false,
						"items": [
							{
								"title": "Mantenimiento Commodities",
								"key": "rtChMantenimientoCommodities"
							}
						]
					},
					{
						"title": "Materiales",
						"icon": "sap-icon://product",
						"expanded": false,
						"items": [
							{
								"title": "Mantenimiento Materiales",
								"key": "rtChMantenimientoMateriales"
							}
						]
					},
					{
						"title": "Costos Logístico",
						"icon": "sap-icon://travel-expense",
						"expanded": false,
						"items": [
							{
								"title": "Mantenimiento Costos Logístico",
								"key": "rtChMantenimientoCostLog"
							}
						]
					},
					{
						"title": "COGS",
						"icon": "sap-icon://settings",
						"expanded": false,
						"items": [
							{
								"title": "Reportes COGS",
								"key": "rtCCOGS"
							}
						]
					},
					{
						"title": "Reportes",
						"icon": "sap-icon://pie-chart",
						"expanded": false,
						"items": [
							{
								"title": "Visualización",
								"key": "rtChVisualizacion"
							}
						]
					},
					{
						"title": "Manufactura",
						"icon": "sap-icon://machine",
						"expanded": false,
						"items": [
							{
								"title": "Carga Manufactura",
								"key": "rtChCargaManufactura"
							}
						]
					}
					]
			});
			//this.oModel.loadData(sap.ui.require.toUrl("sap/f/sample/ShellBarWithSplitApp/model") + "/model.json", null, false);
			this.getView().setModel(this.oModel);
		},

		onItemSelect : function(oEvent) {
			var item = oEvent.getParameter('item');
			this.byId("NavContainer").to(this.getView().createId(item.getKey()));
		},

		onMenuButtonPress : function() {
			var toolPage = this.byId("toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},
		
		handleUserNamePress: function (event) {
			var popover = new Popover({
				showHeader: false,
				placement: PlacementType.Buttom,
				content:[
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
		
		onSideNavButtonPress : function() {
			var toolPage = this.byId("toolPage");
			var sideExpanded = toolPage.getSideExpanded();

			this._setToggleButtonTooltip(sideExpanded);

			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		_setToggleButtonTooltip : function(bLarge) {
			var toggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				toggleButton.setTooltip('Large Size Navigation');
			} else {
				toggleButton.setTooltip('Small Size Navigation');
			}
		}

	});


	return CController;

});