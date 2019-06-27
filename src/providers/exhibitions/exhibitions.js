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
import { HTTP } from '@ionic-native/http';
import { Events } from 'ionic-angular';
var ExhibitionsProvider = /** @class */ (function () {
    function ExhibitionsProvider(http, http2, events, envVariables) {
        this.http = http;
        this.http2 = http2;
        this.events = events;
        this.envVariables = envVariables;
    }
    ExhibitionsProvider.prototype.retrieveList = function () {
        var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        var options = new RequestOptions({ headers: headers });
        var isoCode = navigator.language.split('-')[0];
        var payload = { "iso_code": isoCode };
        var url = this.envVariables.baseUrl + "/api/exhibition/translated-list";
        return this.http.post(url, payload, options).map(function (exhibitions) {
            return exhibitions.json();
        });
    };
    ExhibitionsProvider.prototype.retrieve = function (id) {
        var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        var options = new RequestOptions({ headers: headers });
        var url = this.envVariables.baseUrl + "/api/exhibition/retrieve";
        var payload = { "id": id };
        return this.http.post(url, payload, options).map(function (exhibitions) {
            return exhibitions.json();
        });
    };
    ExhibitionsProvider.prototype.download = function (id, isoCode) {
        var headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        var url = this.envVariables.baseUrl + "/api/exhibition/download";
        var payload = { "id": id, "iso_code": isoCode };
        this.http2.setDataSerializer("json");
        return this.http2.post(url, payload, headers);
    };
    ExhibitionsProvider.prototype.download2 = function (id, isoCode) {
        var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        var options = new RequestOptions({ headers: headers });
        var url = this.envVariables.baseUrl + "/api/exhibition/download";
        var payload = { "id": id, "iso_code": isoCode };
        return this.http.post(url, payload, options).map(function (exhibitions) {
            return exhibitions.json();
        });
    };
    ExhibitionsProvider = __decorate([
        Injectable(),
        __param(3, Inject(EnvVariables)),
        __metadata("design:paramtypes", [Http,
            HTTP,
            Events, Object])
    ], ExhibitionsProvider);
    return ExhibitionsProvider;
}());
export { ExhibitionsProvider };
//# sourceMappingURL=exhibitions.js.map