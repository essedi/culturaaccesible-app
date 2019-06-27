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
import { Platform, Events, AlertController } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { Beacon } from '../../models/beacon';
var BeaconProvider = /** @class */ (function () {
    function BeaconProvider(platform, events, translate, alertCtrl, storage, ibeacon) {
        var _this = this;
        this.platform = platform;
        this.events = events;
        this.translate = translate;
        this.alertCtrl = alertCtrl;
        this.storage = storage;
        this.ibeacon = ibeacon;
        this.beacons = [];
        this.triggeredBeaconNumber = [];
        this.itemsExhibition = [];
        this.isInitialized = false;
        this.stopReadBeacon = false;
        events.subscribe('stopRanging', function (result) {
            _this.stopRanging();
        });
        events.subscribe('startRanging', function (result) {
            _this.startRanging();
        });
        events.subscribe('cleanLastTriggeredBeacon', function (result) {
            _this.cleanLastTriggeredBeacon();
        });
    }
    BeaconProvider.prototype.initialise = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            // we need to be running on a device
            if (_this.platform.is('cordova')) {
                _this.setBeaconsEnvironment();
                // start ranging
                _this.ibeacon.startRangingBeaconsInRegion(_this.region)
                    .then(function () {
                    resolve(true);
                }, function (error) {
                    console.error('Failed to begin monitoring: ', error);
                    resolve(false);
                });
            }
            else {
                console.error("This application needs to be running on a device");
                resolve(false);
            }
        });
        return promise;
    };
    BeaconProvider.prototype.setBeaconsEnvironment = function () {
        this.askForAuthorizations();
        this.setRegion();
        this.subscribeBeaconsInRange();
    };
    BeaconProvider.prototype.stopRanging = function () {
        this.ibeacon.stopRangingBeaconsInRegion(this.region);
    };
    BeaconProvider.prototype.startRanging = function () {
        this.ibeacon.startRangingBeaconsInRegion(this.region);
    };
    BeaconProvider.prototype.subscribeBeaconsInRange = function () {
        var _this = this;
        this.delegate = this.ibeacon.Delegate();
        this.delegate.didRangeBeaconsInRegion()
            .subscribe(function (data) { return _this.events.publish('didRangeBeaconsInRegion', data); }, function (error) { return console.error(); });
    };
    BeaconProvider.prototype.listenToBeaconEvents = function (exhibition) {
        var _this = this;
        this.exhibition = exhibition;
        this.events.subscribe('didRangeBeaconsInRegion', function (data) {
            _this.initializeBeacons(data);
            _this.chooseListenAction(parseInt(exhibition.beacon));
        });
    };
    BeaconProvider.prototype.initializeBeacons = function (data) {
        var _this = this;
        var lthis = this;
        this.beacons = [];
        console.log(data);
        var beaconList = data.beacons;
        console.log("set beacons");
        beaconList.forEach(function (beacon) {
            var beaconObject = new Beacon(beacon);
            console.log(beaconObject);
            _this.beacons.push(beaconObject);
        });
        console.log("set closests beacon");
        this.setClosestBeacon(data);
        console.log(this.closestBeacon);
    };
    BeaconProvider.prototype.chooseListenAction = function (exhibitionBeaconNumber) {
        if (this.noBeaconAvailable()) {
            return;
        }
        if (this.closestBeacon.minor != exhibitionBeaconNumber) {
            this.presentItem();
        }
        else {
            this.presentUnlockExhibition();
        }
    };
    BeaconProvider.prototype.noBeaconAvailable = function () {
        return !this.closestBeacon || this.closestBeacon.minor == this.lastTriggeredBeaconNumber;
    };
    BeaconProvider.prototype.setClosestBeacon = function (data) {
        console.log(data, "setClosestBeacon");
        if (this.beacons.length) {
            this.closestBeacon = this.beacons[0];
            for (var _i = 0, _a = this.beacons; _i < _a.length; _i++) {
                var b = _a[_i];
                if (b.distance < this.closestBeacon.distance) {
                    this.closestBeacon = b;
                }
            }
            //  this.closestBeacon = this.beacons.filter(beacon => beacon.proximity == 'ProximityImmediate')[0]
        }
    };
    BeaconProvider.prototype.presentItem = function () {
        console.log("presentItem: " + this.triggeredBeaconNumber.indexOf(this.closestBeacon.minor));
        if (this.exhibition.unlocked && this.isAvailablepresentItem(this.closestBeacon.minor) && !this.stopReadBeacon) {
            this.setLastTriggeredBeacon();
            this.showOpenItemAlert(this.closestBeacon.minor, this.exhibition.id);
            this.stopItemBeaconActions();
        }
    };
    BeaconProvider.prototype.getPresentItem = function (minorId) {
        var idx = this.itemsExhibition.findIndex(function (d) {
            return d.beacon == minorId;
        });
        return idx !== -1 ? this.itemsExhibition[idx] : idx;
    };
    BeaconProvider.prototype.isAvailablepresentItem = function (minorId) {
        return this.getPresentItem(minorId) !== -1 && this.triggeredBeaconNumber.indexOf(minorId) == -1;
    };
    BeaconProvider.prototype.stopItemBeaconActions = function () {
        this.events.publish('stopVideo');
        this.events.publish('stopRanging');
    };
    BeaconProvider.prototype.presentUnlockExhibition = function () {
        this.setDefaultLockedValue();
        if (this.isLocked()) {
            this.setLastTriggeredBeacon();
            this.unlockExhibition(this.exhibition.id);
        }
    };
    BeaconProvider.prototype.setDefaultLockedValue = function () {
        if (this.exhibition.unlocked === undefined) {
            this.exhibition.unlocked = false;
        }
    };
    BeaconProvider.prototype.isLocked = function () {
        var exhibitionBeaconNumber = parseInt(this.exhibition.beacon);
        return !this.exhibition.unlocked && exhibitionBeaconNumber == this.closestBeacon.minor;
    };
    BeaconProvider.prototype.unlockExhibition = function (exhibitionId) {
        var _this = this;
        this.storage.getItem(exhibitionId).then(function (exhibition) {
            //let isunlock = exhibition.unlocked;
            _this.exhibition.unlocked = exhibition.unlocked = true;
            _this.storage.setItem(exhibitionId, exhibition).then(function () {
                /*if (!isunlock){
                  this.showExhibitionUnlockedAlert()
                }*/
                _this.events.publish('exhibitionUnlocked');
            });
        });
    };
    BeaconProvider.prototype.setLastTriggeredBeacon = function () {
        this.lastTriggeredBeaconNumber = this.closestBeacon.minor;
        if (this.triggeredBeaconNumber.indexOf(this.closestBeacon.minor) == -1) {
            this.triggeredBeaconNumber.push(this.lastTriggeredBeaconNumber);
        }
    };
    BeaconProvider.prototype.retrieveItemByBeacon = function (beaconNumber, exhibitionId) {
        this.events.publish('retrieveItemByBeacon', { beaconNumber: beaconNumber, exhibitionId: exhibitionId });
    };
    BeaconProvider.prototype.askForAuthorizations = function () {
        this.ibeacon.requestAlwaysAuthorization();
        this.ibeacon.requestWhenInUseAuthorization();
    };
    BeaconProvider.prototype.setRegion = function () {
        this.region = this.ibeacon.BeaconRegion('deskBeacon', 'A7AE2EB7-1F00-4168-B99B-A749BAC1CA64');
        //this.region = this.ibeacon.BeaconRegion('deskBeacon', '74278BDA-B644-4520-8F0C-720EAF059935');
    };
    BeaconProvider.prototype.cleanLastTriggeredBeacon = function () {
        this.lastTriggeredBeaconNumber = null;
        this.triggeredBeaconNumber = [];
    };
    BeaconProvider.prototype.showExhibitionUnlockedAlert = function () {
        var messages;
        this.translate.get('BEACONS.EXHIBITION_UNLOCKED_ALERT').subscribe(function (data) {
            messages = data;
        });
        var alert = this.alertCtrl.create({
            title: messages['TITLE'],
            message: messages['BODY'],
            buttons: [
                {
                    text: messages['BUTTONS']['OK'],
                    handler: function () {
                    }
                }
            ]
        });
        alert.present();
    };
    BeaconProvider.prototype.showOpenItemAlert = function (beaconNumber, exhibitionId) {
        var _this = this;
        var messages;
        this.translate.get('BEACONS.ALERT').subscribe(function (data) {
            messages = data;
        });
        var item = this.getPresentItem(beaconNumber);
        var alert = this.alertCtrl.create({
            title: item !== -1 ? item.name : messages['TITLE'] + ' ' + beaconNumber,
            message: messages['BODY'],
            buttons: [
                {
                    text: messages['BUTTONS']['NO'],
                    role: 'cancel',
                    handler: function () {
                        _this.events.publish('startRanging');
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: messages['BUTTONS']['YES'],
                    handler: function () {
                        //this.stopReadBeacon = true;
                        _this.retrieveItemByBeacon(beaconNumber, exhibitionId);
                        _this.events.publish('startRanging');
                    }
                }
            ]
        });
        alert.present();
    };
    BeaconProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Platform,
            Events,
            TranslateService,
            AlertController,
            NativeStorage,
            IBeacon])
    ], BeaconProvider);
    return BeaconProvider;
}());
export { BeaconProvider };
//# sourceMappingURL=beacons.js.map