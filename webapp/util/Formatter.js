sap.ui.define([], function () {
	"use strict";
	return {
		
		/**
		 * Se formatea fecha a string, el formato de salida es el que está en el i18n patternDateBackend
		 * @param {Date} dDate Fecha a convertir
		 * @param {Object} oContext Contexto de la vista. Opcional. Se envía cuando se llama el metodo desde el controlador de una vista
		 *							cuando se usa el formatter desde el xml, llega con el contexto del controller de la vista entonces no se envía
		 * @return {String} Fecha en el formato definido en el i18n patternDateBackend (Ej. yyyyMMdd)
		 * */
		formatDateToShortString: function(dDate, oContext){
			var oResoucerBundle;
			if (oContext) {
				oResoucerBundle = oContext.getModel("i18n").getResourceBundle();
			} else {
				oResoucerBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			}
			if (dDate) {
				var sFormat = oResoucerBundle.getText("patternDateBackend");
				var oDateFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: sFormat
				});
				var sFormatedDate = oDateFormat.format(dDate);
				return sFormatedDate;
			}
			return "";
		}
	};
});