// Loading formatter....
 jQuery.sap.require("sap.ui.demo.walkthrough.Formatter");
 sap.ui.define([
  "sap/ui/core/mvc/Controller"
 ], function(Controller) {
  "use strict";
  return Controller.extend("sap.ui.demo.walkthrough.controller.Utilities.BasicGrid", {
   onInit: function() {
    // Loading json file....
    var json = new sap.ui.model.json.JSONModel("model/Record.json");
    // Setting json to current view....
    this.getView().setModel(json);
   }
  });
 });