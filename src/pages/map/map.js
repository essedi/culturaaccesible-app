var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
//declare var google; 
import { GoogleMaps, GoogleMapsEvent, LatLng } from "@ionic-native/google-maps";
var MapPage = /** @class */ (function () {
    function MapPage(navCtrl, navParams, geolocation, googleMaps) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.geolocation = geolocation;
        this.googleMaps = googleMaps;
        this.items = this.navParams.get('items');
        console.log(this.items, " this.items");
    }
    MapPage.prototype.ionViewDidLoad = function () {
        this.getPosition();
    };
    MapPage.prototype.getPosition = function () {
        var _this = this;
        this.geolocation.getCurrentPosition().then(function (response) {
            _this.initMap(response);
        })
            .catch(function (error) {
            console.log(error);
        });
    };
    MapPage.prototype.initMap = function (position) {
        var _this = this;
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var map = GoogleMaps.create(this.element.nativeElement);
        map.one(GoogleMapsEvent.MAP_READY).then(function (data) {
            console.log(map, " MAP");
            var coordinates = new LatLng(latitude, longitude);
            var position = {
                target: coordinates,
                zoom: 17
            };
            map.animateCamera(position);
            var markerOptions = {
                position: coordinates,
                title: 'your location',
                icon: '../../../resources/red-circle.png',
            };
            var marker = map.addMarker(markerOptions)
                .then(function (marker) {
                marker.showInfoWindow();
            });
            if (_this.items.length) {
                for (var _i = 0, _a = _this.items; _i < _a.length; _i++) {
                    var item = _a[_i];
                    var coordinates_1 = new LatLng(item['lat'], item['lng']);
                    var markerOptions_1 = {
                        position: coordinates_1,
                        title: item['name']
                    };
                    var marker_1 = map.addMarker(markerOptions_1)
                        .then(function (marker) {
                        marker.showInfoWindow();
                    });
                }
            }
        });
    };
    __decorate([
        ViewChild('map'),
        __metadata("design:type", Object)
    ], MapPage.prototype, "element", void 0);
    MapPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-map',
            templateUrl: 'map.html',
        }),
        __metadata("design:paramtypes", [NavController,
            NavParams,
            Geolocation,
            GoogleMaps])
    ], MapPage);
    return MapPage;
}());
export { MapPage };
//# sourceMappingURL=map.js.map