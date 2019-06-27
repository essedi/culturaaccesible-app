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
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { Platform, Events, AlertController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { BackgroundGeolocation, BackgroundGeolocationEvents } from '@ionic-native/background-geolocation';
var GpsProvider = /** @class */ (function () {
    function GpsProvider(platform, events, translate, alertCtrl, storage, geolocation, diagnostic, openSettings, backgroundGeolocation) {
        var _this = this;
        this.platform = platform;
        this.events = events;
        this.translate = translate;
        this.alertCtrl = alertCtrl;
        this.storage = storage;
        this.geolocation = geolocation;
        this.diagnostic = diagnostic;
        this.openSettings = openSettings;
        this.backgroundGeolocation = backgroundGeolocation;
        this.itemsExhibition = [];
        this.logs = [];
        this.disabledItems = [];
        this.events.subscribe('stopGps', function (data) {
            if (data.stop == true) {
                var obj_1 = _this.itemsExhibition.find(function (item) { return item.id === data.id; });
                var obj2 = _this.disabledItems.find(function (item) { return item.id === obj_1.id; });
                if (!obj2) {
                    _this.disabledItems.push(obj_1);
                }
            }
        });
    }
    GpsProvider.prototype.getItemLocation = function () {
        var _this = this;
        this.getLocation().then(function (res) {
            var _loop_1 = function (item) {
                distance = _this.getDistance(res.latitude, item["lat"], res.longitude, item["lng"]);
                console.log(distance, "<<<< PLAY VIDEO AT 90 MTRS");
                itemDisabled = _this.disabledItems.find(function (obj) { return obj.id == item.id; });
                if (itemDisabled) {
                    console.log(itemDisabled, "DISABLED");
                }
                else {
                    if (distance < 90) {
                        _this.showOpenItemAlert(item, _this.exhibition.id);
                        _this.stopGps = true;
                        _this.events.publish('stopGps', { stop: true, id: item.id });
                    }
                }
            };
            var distance, itemDisabled;
            for (var _i = 0, _a = _this.itemsExhibition; _i < _a.length; _i++) {
                var item = _a[_i];
                _loop_1(item);
            }
        }, function (err) {
            console.log(err, "<<<< err location");
        });
    };
    GpsProvider.prototype.refreshTime = function (lthis) {
        if (lthis === void 0) { lthis = this; }
        if (this.stopGps == false) {
            lthis.getItemLocation();
            setTimeout(function () {
                lthis.refreshTime(lthis);
            }, 10000);
        }
    };
    GpsProvider.prototype.getLocation = function (opt) {
        if (opt === void 0) { opt = null; }
        var lthis = this;
        return new Promise(function (resolve) {
            lthis.checkLocation().then(function (res) {
                //if options not passed, use default
                if (!opt) {
                    opt =
                        {
                            maximumAge: 10000,
                            enableHighAccuracy: res,
                            timeout: 10000
                        };
                }
                lthis.geolocation.getCurrentPosition(opt).then(function (res) {
                    console.log("Get current position", res.coords);
                    resolve(res.coords);
                }, function (err) {
                    console.error("Get current positionerror", err);
                    resolve(false);
                });
            }, function () {
                resolve(false);
            });
        });
    };
    GpsProvider.prototype.checkLocation = function () {
        var lthis = this;
        return new Promise(function (resolve, reject) {
            lthis.diagnostic.isLocationAvailable().then(function (res) {
                if (res) {
                    lthis.diagnostic.isLocationEnabled().then(function (res) {
                        if (res) {
                            resolve(true);
                        }
                        else {
                            console.log('Location: is not LocationAvailable is not LocationEnabled', res);
                            lthis.openSettings.open("location").then(function (res) {
                                console.log('Location: isLocationAvailable openSettings', res);
                            }, function (err) {
                                console.error('Location: isLocationAvailable openSettings error', err);
                            });
                        }
                    }, function (err) {
                        reject(err);
                    });
                }
                else {
                    console.log('Location: is not LocationAvailable', res);
                    lthis.diagnostic.isLocationEnabled().then(function (res) {
                        if (res) {
                            lthis.diagnostic.isLocationAuthorized().then(function (res) {
                                console.log('Location: isLocationAuthorized', res);
                                if (res) {
                                    resolve(false);
                                }
                                else {
                                    lthis.diagnostic.requestLocationAuthorization().then(function (res) {
                                        console.log('Location: requestLocationAuthorization', res);
                                        lthis.checkLocation().then(function (res) {
                                            resolve(res);
                                        }, function (err) {
                                            reject(err);
                                        });
                                    }, function (err) {
                                        console.error('Location: requestLocationAuthorization error', err);
                                        reject(err);
                                    });
                                }
                            }, function (err) {
                                console.error('Location: isLocationAuthorized error', err);
                                reject(err);
                            });
                        }
                        else {
                            console.log('Location: is not LocationEnabled', res);
                            lthis.openSettings.open("location").then(function (res) {
                                console.log('Location: openSettings', res);
                            }, function (err) {
                                console.error('Location: openSettings error', err);
                            });
                        }
                    }, function (err) {
                        console.error('Location: isLocationEnabled error', err);
                        reject(err);
                    });
                }
            }, function (err) {
                console.error('Location: isLocationAvailable error', err);
                reject(err);
            });
        });
    };
    GpsProvider.prototype.getDistance = function (lat1, lat2, long1, long2) {
        var p = 0.017453292519943295; // Math.PI / 180
        var c = Math.cos;
        var a = 0.5 - c((lat1 - lat2) * p) / 2 + c(lat2 * p) * c((lat1) * p) * (1 - c(((long1 - long2) * p))) / 2;
        var dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
        return Math.floor(dis * 1000);
    };
    GpsProvider.prototype.unlockExhibition = function (exhibitionId) {
        var _this = this;
        this.storage.getItem(exhibitionId).then(function (exhibition) {
            //let isunlock = exhibition.unlocked;
            _this.exhibition.unlocked = true;
            exhibition.unlocked = true;
            _this.storage.setItem(exhibitionId, exhibition).then(function () {
                _this.events.publish('exhibitionUnlocked');
            });
        });
    };
    GpsProvider.prototype.retrieveItemByCoords = function (lat, lng, exhibitionId) {
        this.events.publish('retrieveItemByCoords', { lat: lat, lng: lng, exhibitionId: exhibitionId });
    };
    GpsProvider.prototype.showOpenItemAlert = function (item, exhibitionId) {
        var _this = this;
        var messages;
        this.translate.get('BEACONS.ALERT').subscribe(function (data) {
            messages = data;
        });
        var alert = this.alertCtrl.create({
            title: item !== -1 ? item.name : messages['TITLE'],
            message: messages['BODY'],
            buttons: [
                {
                    text: messages['BUTTONS']['NO'],
                    role: 'cancel',
                    handler: function () {
                        // this.events.publish('startRanging')
                        //this.stopGps = true;
                        console.log('Cancel clicked');
                        _this.events.publish('stopGps', { stop: true, id: item.id });
                    }
                },
                {
                    text: messages['BUTTONS']['YES'],
                    handler: function () {
                        _this.retrieveItemByCoords(item.lat, item.lng, exhibitionId);
                        //this.stopGps = true;
                        // this.events.publish('startRanging')
                    }
                }
            ]
        });
        alert.present();
    };
    GpsProvider.prototype.startBackgroundGeolocation = function () {
        var _this = this;
        this.backgroundGeolocation.isLocationEnabled()
            .then(function (rta) {
            if (rta) {
                _this.start();
            }
            else {
                _this.backgroundGeolocation.showLocationSettings();
            }
        });
    };
    GpsProvider.prototype.stopBackgroundGeolocation = function () {
        this.backgroundGeolocation.stop();
    };
    GpsProvider.prototype.start = function () {
        var _this = this;
        var config = {
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 30,
            debug: true,
            stopOnTerminate: false // enable this to clear background location settings when the app terminates
        };
        this.backgroundGeolocation.configure(config).then(function () {
            _this.backgroundGeolocation
                .on(BackgroundGeolocationEvents.location)
                .subscribe(function (location) {
                console.log(location, "LOCATION");
            });
        });
        console.log(" BACKGROUND!");
        // start recording location
        this.backgroundGeolocation.start();
    };
    GpsProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Platform,
            Events,
            TranslateService,
            AlertController,
            NativeStorage,
            Geolocation,
            Diagnostic,
            OpenNativeSettings,
            BackgroundGeolocation])
    ], GpsProvider);
    return GpsProvider;
}());
export { GpsProvider };
//# sourceMappingURL=gps.js.map