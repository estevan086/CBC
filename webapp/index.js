sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "cbc.co.simulador_costos",
		settings : {
			id : "walkthrough"
		},
		async: true
	}).placeAt("content");
});
