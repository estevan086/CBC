jQuery.sap.require("sap.ui.demo.walkthrough.Formatter");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/table/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, MessageToast, DateFormat, library, Filter, FilterOperator){
	"use strict";
	return Controller.extend("sap.ui.demo.walkthrough.controller.Admon.CreateParameters.MasterSap", {

		onInit : function() {
			var obj = {
				"Date": [
					{
						"Name": ""
					}
				]
			};
			// set explored app's demo model on this sample
			var json = new JSONModel(obj);
			// Setting json to current view....
				//var json = new sap.ui.model.json.JSONModel("model/products.json");
			this.getView().setModel(json);
		},
		
		CreateDate : function(oEvent) {
			var ValDate = this.byId("txtDate").getValue();
			var oData = '{ "Date" : [';
			for (var i = 1; i <= 12; i++) {
			  var ii = i < 10 ? '0' + i.toString() : i.toString();	
			  oData += '{ "Name":"'+ ValDate + "/" + ii +'" }';
			  oData = i < 12 ? oData + ',' : oData; 
			}
			oData = oData +  ']}';
			var obj = $.parseJSON(oData);
			var json = new sap.ui.model.json.JSONModel(obj);
			this.getView().setModel(json);
		},
		
		ValidateSave: function(){
			var ValDate = this.byId("txtDate").getValue();
			if(ValDate === "" || ValDate.toString().indexOf("_") !== -1 ){
				MessageToast.show(ValDate + " Numero no valido");
			}
			else{
				MessageToast.show("Registro Ok");
			}
			
		}
		
	});
});