var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { InAppPurchase } from '@ionic-native/in-app-purchase';
import { LoadingController, ToastController, Events, Platform } from 'ionic-angular';
var PurchaseProvider = /** @class */ (function () {
    function PurchaseProvider(iap, platform, events, loader, toastCtrl) {
        this.iap = iap;
        this.platform = platform;
        this.events = events;
        this.loader = loader;
        this.toastCtrl = toastCtrl;
        this.itemsExhibition = [];
        console.log('Hello PurchaseProvider Provider');
    }
    PurchaseProvider.prototype.getProducts = function (exhibition) {
        var _this = this;
        this.exhibition = exhibition;
        this.iap.getProducts([exhibition.productId]).then(function (products) {
            console.log(products, "products");
            _this.buyProducts(products);
        })
            .catch(function (err) {
            console.log(err);
        });
    };
    PurchaseProvider.prototype.buyProducts = function (products) {
        for (var _i = 0, products_1 = products; _i < products_1.length; _i++) {
            var product = products_1[_i];
            this.iap
                .buy(product.productId.toString())
                .then(function (data) {
                console.log(JSON.stringify(data));
                // The consume() function should only be called after purchasing consumable products
                // otherwise, you should skip this step
                // return this.iap.consume("consumable", data.receipt, data.signature);
            })
                .then(function () {
                console.log('consume done!');
                // 
            })
                .catch(function (err) {
                console.log(err);
            });
        }
    };
    PurchaseProvider.prototype.queryPurchases = function () {
        var lthis = this;
        this.iap.restorePurchases().then(function (data) {
            console.log(data, "restored purchases data");
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var purchased = data_1[_i];
                lthis.events.publish('retrievePremiumExhibition', { id: purchased.productId });
            }
        });
    };
    PurchaseProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [InAppPurchase,
            Platform,
            Events,
            LoadingController,
            ToastController])
    ], PurchaseProvider);
    return PurchaseProvider;
}());
export { PurchaseProvider };
//# sourceMappingURL=purchase.js.map