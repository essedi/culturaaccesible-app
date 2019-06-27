var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { EnvVariables } from '../../app/environment-variables/environment-variables.token';
import { Events } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
var ItemsProvider = /** @class */ (function () {
    function ItemsProvider(http, events, storage, envVariables) {
        var _this = this;
        this.http = http;
        this.events = events;
        this.storage = storage;
        this.envVariables = envVariables;
        events.subscribe('retrieveItemByBeacon', function (data) {
            _this.retrieveByBeacon(data.beaconNumber, data.exhibitionId);
        });
        events.subscribe('retrieveItemByCoords', function (data) {
            _this.retrieveByCoords(data.lat, data.lng, data.exhibitionId);
        });
    }
    ItemsProvider.prototype.retrieveList = function (exhibition_id) {
        var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        var options = new RequestOptions({ headers: headers });
        var url = this.envVariables.baseUrl + "/api/exhibition/items";
        var payload = { "exhibition_id": exhibition_id };
        return this.http.post(url, payload, options).map(function (items) { return items.json(); });
    };
    ItemsProvider.prototype.retrieveByBeacon = function (beaconNumber, exhibitionId) {
        var _this = this;
        this.storage.getItem(exhibitionId + '-items').then(function (items) {
            var item = items.find(function (item) { return item.beacon == beaconNumber; });
            var index = items.indexOf(item);
            _this.events.publish('goToItemDetail', { item: item, index: index });
        });
    };
    ItemsProvider.prototype.retrieveByCoords = function (lat, lng, exhibitionId) {
        var _this = this;
        this.storage.getItem(exhibitionId + '-items').then(function (items) {
            var item = items.find(function (item) { return item.lat == lat; }, function (item) { return item.lng == lng; });
            var index = items.indexOf(item);
            _this.events.publish('goToItemDetail', { item: item, index: index });
        });
    };
    ItemsProvider = __decorate([
        Injectable(),
        __param(3, Inject(EnvVariables)),
        __metadata("design:paramtypes", [Http,
            Events,
            NativeStorage, Object])
    ], ItemsProvider);
    return ItemsProvider;
}());
export { ItemsProvider };
//# sourceMappingURL=items.js.map