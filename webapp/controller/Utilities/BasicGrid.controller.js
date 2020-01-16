// Loading formatter....
 jQuery.sap.require("cbc.co.simulador_costos.Formatter");
 sap.ui.define([
  "sap/ui/core/mvc/Controller"
 ], function(Controller) {
  "use strict";
  return Controller.extend("cbc.co.simulador_costos.controller.Utilities.BasicGrid", {
   onInit: function() {
    // Loading json file....
    var json = new sap.ui.model.json.JSONModel("model/Record.json");
    // Setting json to current view....
    this.getView().setModel(json);
   }
  });
 });