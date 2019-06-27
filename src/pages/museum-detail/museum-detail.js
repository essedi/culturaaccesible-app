var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { MuseumProvider } from '../../providers/museum/museum';
import { DomSanitizer } from '@angular/platform-browser';
var MuseumDetail = /** @class */ (function () {
    function MuseumDetail(navCtrl, navParams, loadingCtrl, service, domSanitizer) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.loadingCtrl = loadingCtrl;
        this.service = service;
        this.domSanitizer = domSanitizer;
        this.info = {};
        this.location = {};
        this.price = {};
        this.contact = {};
        this.schedule = {};
        this.validMapLink = false;
        var loading = this.loadingCtrl.create({
            content: '...'
        });
        loading.present();
        this.service.retrieve(this.navParams.get('id')).subscribe(function (museum) {
            _this.setInfo(museum);
            console.log(museum, "MUSEUM");
            _this.composeMapLinks();
            loading.dismiss();
        });
    }
    MuseumDetail.prototype.setInfo = function (museum) {
        this.info = museum.info;
        this.location = museum.location;
        this.contact = museum.contact;
        this.price = museum.price;
        this.schedule = museum.schedule;
    };
    MuseumDetail.prototype.extractSearchQuote = function () {
        this.searchQuote = this.location['link'].split('@')[0].split('/')[5];
    };
    MuseumDetail.prototype.extractCoordinates = function () {
        this.coordinates = this.location['link'].split('@')[1].split(',')[0] + ',' + this.location['link'].split('@')[1].split(',')[1];
    };
    MuseumDetail.prototype.composeMapLinks = function () {
        if (this.location['link'].substring(0, 27) == "https://www.google.es/maps/") {
            this.extractSearchQuote();
            this.extractCoordinates();
            this.iosMapLink = "http://maps.apple.com/?q=" + this.coordinates;
            this.iosGoogleMapLink = this.domSanitizer.bypassSecurityTrustResourceUrl("comgooglemaps://?q=" + this.searchQuote + "?center=" + this.coordinates + "&zoom=14&views=traffic");
        }
    };
    MuseumDetail.prototype.goToExhibitions = function () {
        this.navCtrl.push('ExhibitionList');
    };
    MuseumDetail.prototype.hasContent = function (data) {
        var content = false;
        if (data.constructor.name == 'Object') {
            content = this.objectHasContent(data);
        }
        else {
            content = data.length !== 0;
        }
        return content;
    };
    MuseumDetail.prototype.objectHasContent = function (object) {
        var content = false;
        var keys = Object.keys(object);
        keys.forEach(function (key) {
            if (object[key].length > 0) {
                content = true;
            }
        });
        return content;
    };
    MuseumDetail = __decorate([
        IonicPage(),
        Component({
            selector: 'page-museum-detail',
            templateUrl: 'museum-detail.html',
        }),
        __metadata("design:paramtypes", [NavController,
            NavParams,
            LoadingController,
            MuseumProvider,
            DomSanitizer])
    ], MuseumDetail);
    return MuseumDetail;
}());
export { MuseumDetail };
//# sourceMappingURL=museum-detail.js.map