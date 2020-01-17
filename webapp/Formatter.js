// jQuery.sap.declare("GridTable.util.Formatter");
// cbc.co.simulador_costos.Formatter={
//  LinkDisplay:function(path){
//   if(path!==null){
// 	  if(path==="R"){
// 		return true;
// 	  }else{
// 		return false;
// 	  }
//   }
//  }
// };

sap.ui.define([], function () {
	"use strict";
	return {
		statusText: function (sStatus) {
			var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			switch (sStatus) {
			case "A":
				return resourceBundle.getText("invoiceStatusA");
			case "B":
				return resourceBundle.getText("invoiceStatusB");
			case "C":
				return resourceBundle.getText("invoiceStatusC");
			default:
				return sStatus;
			}
		},
		LinkDisplay: function (path) {
			var oRespuesta = false;
			if (path !== null) {
				if (path === "R") {
					oRespuesta = true;
				} else {
					oRespuesta = false;
				}
			}
			return oRespuesta;
		}
	};
});