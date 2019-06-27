var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform, IonicPage, NavController, AlertController, NavParams, Events } from 'ionic-angular';
import { ExhibitionsProvider } from '../../providers/exhibitions/exhibitions';
import { ItemsProvider } from '../../providers/items/items';
import { BeaconProvider } from '../../providers/beacons/beacons';
import { NativeStorage } from '@ionic-native/native-storage';
import { GpsProvider } from '../../providers/gps/gps';
var ExhibitionDetail = /** @class */ (function () {
    function ExhibitionDetail(navCtrl, alertCtrl, platform, beaconProvider, events, zone, changeDetector, navParams, service, storage, gpsProvider, itemService) {
        this.navCtrl = navCtrl;
        this.alertCtrl = alertCtrl;
        this.platform = platform;
        this.beaconProvider = beaconProvider;
        this.events = events;
        this.zone = zone;
        this.changeDetector = changeDetector;
        this.navParams = navParams;
        this.service = service;
        this.storage = storage;
        this.gpsProvider = gpsProvider;
        this.itemService = itemService;
        this.hasItems = false;
        var lthis = this;
        var exhibition = navParams.get('exhibition');
        events.subscribe('goToItemDetail', function (data) {
            lthis.goToItemView(data.index);
        });
        events.subscribe('exhibitionUnlocked', function (data) {
            lthis.unlockExhibition(exhibition);
        });
        platform.ready().then(function () {
            if (exhibition) {
                if (!beaconProvider.isInitialized && exhibition.locationType != "gps") {
                    beaconProvider.initialise().then(function (isInitialised) {
                        if (isInitialised) {
                            beaconProvider.listenToBeaconEvents(exhibition);
                            beaconProvider.isInitialized = true;
                        }
                    });
                }
            }
        });
    }
    ExhibitionDetail.prototype.ionViewWillEnter = function () {
        this.beaconProvider.stopReadBeacon = false;
        var exhibition = this.navParams.get('exhibition');
        console.log(exhibition);
        if (exhibition.locationType == "gps") {
            this.gpsProvider.stopGps = false;
            this.gpsProvider.refreshTime();
        }
        else {
            this.beaconProvider.startRanging();
        }
        this.getExhibition(exhibition);
    };
    ExhibitionDetail.prototype.ionViewWillLeave = function () {
        this.beaconProvider.stopRanging();
        this.beaconProvider.stopReadBeacon = true;
        console.log("ionViewDidLeave");
    };
    ExhibitionDetail.prototype.ionViewWillUnload = function () {
        this.gpsProvider.stopGps = true;
        this.beaconProvider.stopRanging();
        this.events.unsubscribe('goToItemDetail');
        this.events.unsubscribe('exhibitionUnlocked');
    };
    ExhibitionDetail.prototype.getExhibition = function (exhibition) {
        var _this = this;
        this.storage.getItem(exhibition.id).then(function (exhibition) {
            console.log(exhibition, "exhibition info");
            _this.exhibition = exhibition;
            if (_this.exhibition.locatioType == 'gps') {
                _this.gpsProvider.itemsExhibition = [];
                if (_this.exhibition.unlocked) {
                    // move this Up if want to show items always
                    _this.gpsProvider.unlockExhibition(exhibition.id);
                }
            }
            else {
                _this.beaconProvider.itemsExhibition = [];
                if (_this.exhibition.unlocked) {
                    _this.beaconProvider.unlockExhibition(exhibition.id);
                }
                _this.beaconProvider.listenToBeaconEvents(exhibition);
            }
        });
    };
    ExhibitionDetail.prototype.unlockExhibition = function (exhibition2) {
        var _this = this;
        this.storage.getItem(exhibition2.id).then(function (exhibition) {
            _this.exhibition = null;
            _this.exhibition = exhibition;
            _this.beaconProvider.exhibition = exhibition;
            _this.gpsProvider.exhibition = exhibition;
        });
        this.storage.getItem(this.exhibition.id + '-items').then(function (items) {
            console.log(items);
            if (items.length > 0) {
                _this.items = items;
                _this.hasItems = true;
            }
            _this.beaconProvider.itemsExhibition = items;
            _this.gpsProvider.itemsExhibition = items;
            _this.changeDetector.detectChanges();
        });
    };
    ExhibitionDetail.prototype.viewMap = function () {
        this.navCtrl.push('MapPage', { items: this.items });
    };
    ExhibitionDetail.prototype.goToMuseum = function () {
        this.navCtrl.push('MuseumDetail', { id: this.exhibition.museum_id });
    };
    ExhibitionDetail.prototype.goToItemView = function (index) {
        //this.beaconProvider.stopReadBeacon = true; // El refresh nunca pasara
        var activePage = this.navCtrl.getActive().component.name;
        if ('ItemDetail' == activePage) {
            //this.events.publish('refreshItemPage', {index: index})
            this.navCtrl.pop();
        }
        this.navCtrl.push('ItemDetail', { index: index, exhibitionId: this.exhibition.id });
    };
    ExhibitionDetail = __decorate([
        IonicPage(),
        Component({
            selector: 'page-exhibition-detail',
            templateUrl: 'exhibition-detail.html',
        }),
        __metadata("design:paramtypes", [NavController,
            AlertController,
            Platform,
            BeaconProvider,
            Events,
            NgZone,
            ChangeDetectorRef,
            NavParams,
            ExhibitionsProvider,
            NativeStorage,
            GpsProvider,
            ItemsProvider])
    ], ExhibitionDetail);
    return ExhibitionDetail;
}());
export { ExhibitionDetail };
//# sourceMappingURL=exhibition-detail.js.map