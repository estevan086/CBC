sap.ui.define([
	"jquery.sap.global",
	"cbc/co/simulador_costos/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (jQuery, Controller, JSONModel) {
	"use strict";

	return Controller.extend("cbc.co.simulador_costos.controller.Home", {
		onInit: function (evt) {
			// set explored app's demo model on this sample
			//var oImgModel = new JSONModel("model/img.json");
			//this.getView().setModel(oImgModel, "img");

			// set the possible screen sizes
			var oCarouselContainer = {
				screenSizes: [
					"350px",
					"420px",
					"555px",
					"743px",
					"908px"
				]
			};
			var oScreenSizesModel = new JSONModel(oCarouselContainer);
			this.getView().setModel(oScreenSizesModel, "ScreenSizesModel");

			this.getRouter().getRoute("home2").attachPatternMatched(this._onRouteMatched, this);
		},
		onArrowsPlacementSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample");
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			if (sSelectedValue === "Content") {
				oCarousel.setArrowsPlacement(sap.m.CarouselArrowsPlacement.Content);
			} else if (sSelectedValue === "PageIndicator") {
				oCarousel.setArrowsPlacement(sap.m.CarouselArrowsPlacement.PageIndicator);
			}
		},
		onPageIndicatorPlacementSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample");
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			if (sSelectedValue === "Bottom") {
				oCarousel.setPageIndicatorPlacement(sap.m.PlacementType.Bottom);
			} else if (sSelectedValue === "Top") {
				oCarousel.setPageIndicatorPlacement(sap.m.PlacementType.Top);
			}
		},
		onShowPageIndicatorSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample");
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			if (sSelectedValue === "Yes") {
				oCarousel.setShowPageIndicator(true);
			} else if (sSelectedValue === "No") {
				oCarousel.setShowPageIndicator(false);
			}
		},
		onSliderMoved: function (oEvent) {
			var origingalHeight = 450;

			var screenSizesJSON = this.getView().getModel("ScreenSizesModel").getData();
			var iValue = oEvent.getParameter("value");
			var screenWidth = screenSizesJSON.screenSizes[Number(iValue) - 1];
			var oCarouselContainer = this.byId("carouselContainer");
			oCarouselContainer.setWidth(screenWidth);
			var screenHeight = origingalHeight * parseFloat(screenWidth) / 1000;
			oCarouselContainer.setHeight(screenHeight + 'px');
		},
		onNumberOfImagesChange: function (oEvent) {
			var numberOfImages = oEvent.getSource().getValue();
			this._setNumberOfImagesInCarousel(Number(numberOfImages));
		},
		_onRouteMatched: function(oEvent){
			this._setNumberOfImagesInCarousel(3);

			jQuery.sap.intervalCall(5000, this, "changeCarouselImage", [this]);
		},
		_setNumberOfImagesInCarousel: function (numberOfImages) {
			if (!numberOfImages || numberOfImages < 1 || numberOfImages > 9) {
				return;
			}

			var oCarousel = this.byId("carouselSample");
			oCarousel.destroyPages();

			var oImgModel = this.getView().getModel("ImgHome");
			var oRootPath = jQuery.sap.getModulePath("cbc.co.simulador_costos");

			for (var i = 0; i < numberOfImages; i++) {
				var imgId = "img" + (i + 1);
				var imgSrc = oImgModel.getProperty("/images/" + i);
				var imgAlt = "Example picture " + (i + 1);
				var img = new sap.m.Image(imgId, {
					src: oRootPath + imgSrc,
					alt: imgAlt,
					densityAware: false,
					decorative: false
				});

				oCarousel.addPage(img);
			}

		},
		changeCarouselImage: function (passedthis) {
			var oCarousel = passedthis.byId("carouselSample");
			oCarousel.next();
		}

	});
});