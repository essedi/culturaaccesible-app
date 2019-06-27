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
var MuseumProvider = /** @class */ (function () {
    function MuseumProvider(http, envVariables) {
        this.http = http;
        this.envVariables = envVariables;
    }
    MuseumProvider.prototype.retrieveList = function () {
        var url = this.envVariables.baseUrl + "/api/museum/list";
        return this.http.post(url, '').map(function (museums) { return museums.json(); });
    };
    MuseumProvider.prototype.retrieve = function (id) {
        var url = this.envVariables.baseUrl + "/api/museum/retrieve";
        var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        var options = new RequestOptions({ headers: headers });
        return this.http.post(url, { "id": id }, options).map(function (museums) { return museums.json(); });
    };
    MuseumProvider = __decorate([
        Injectable(),
        __param(1, Inject(EnvVariables)),
        __metadata("design:paramtypes", [Http, Object])
    ], MuseumProvider);
    return MuseumProvider;
}());
export { MuseumProvider };
//# sourceMappingURL=museum.js.map