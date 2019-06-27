var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, NgZone } from '@angular/core';
import { Platform, Events, IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { ItemsProvider } from '../../providers/items/items';
import { BeaconProvider } from '../../providers/beacons/beacons';
import { DownloadProvider } from '../../providers/downloader/downloader';
import { NativeStorage } from '@ionic-native/native-storage';
var ItemDetail = /** @class */ (function () {
    function ItemDetail(navCtrl, viewCtrl, platform, events, storage, beaconProvider, downloader, navParams, service) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.viewCtrl = viewCtrl;
        this.platform = platform;
        this.events = events;
        this.storage = storage;
        this.beaconProvider = beaconProvider;
        this.downloader = downloader;
        this.navParams = navParams;
        this.service = service;
        this.position = 0;
        this.action = 'play';
        this.ngZone = new NgZone({ enableLongStackTrace: false });
        events.subscribe('refreshItemPage', function (data) {
            _this.item = null;
            _this.ngZone.run(function () {
                setTimeout(function () {
                    _this.position = data.index;
                    _this.item = _this.items[_this.position];
                    _this.enableNavButtons();
                    _this.disableIfFirstItem();
                    _this.disableIfLastItem();
                }, 100);
            });
        });
        events.subscribe('stopVideo', function (data) {
            //this.viewCtrl.dismiss()
            _this.pause();
            _this.video.webkitExitFullScreen();
        });
    }
    ItemDetail.prototype.ionViewDidLoad = function () {
        var _this = this;
        this.exhibitionId = this.navParams.get("exhibitionId");
        var index = this.navParams.get("index");
        if (index) {
            this.position = index;
        }
        this.storage.getItem(this.exhibitionId + '-items').then(function (items) {
            if (items.length > 0) {
                _this.item = items[_this.position];
                /*if(this.downloader.checkFile(this.item.id)){
                  this.item.video = this.downloader.storageDirectory + this.item.id + '-video.mp4'
                }*/
                _this.disableIfFirstItem();
                _this.disableIfLastItem();
            }
        });
        this.video = document.getElementById("myVideo");
        this.previousButton = document.getElementsByClassName('previous')[0];
        this.nextButton = document.getElementsByClassName('next')[0];
        setTimeout(function () {
            _this.video.load();
        }, 500);
    };
    ItemDetail.prototype.play = function () {
        this.video.play();
        this.action = 'pause';
    };
    ItemDetail.prototype.pause = function () {
        this.video.pause();
        this.action = 'play';
    };
    ItemDetail.prototype.togglePlay = function () {
        if (this.video.paused === true) {
            this.play();
        }
        else {
            this.pause();
        }
    };
    ItemDetail.prototype.enableNavButtons = function () {
        this.previousButton.disabled = false;
        this.nextButton.disabled = false;
    };
    ItemDetail.prototype.disableIfLastItem = function () {
        if (this.items.length - 1 == this.position) {
            this.nextButton.disabled = true;
        }
    };
    ItemDetail.prototype.disableIfFirstItem = function () {
        if (this.position == 0) {
            this.previousButton.disabled = true;
        }
    };
    ItemDetail.prototype.goToNextItem = function () {
        this.position += 1;
        this.previousButton.disabled = false;
        this.disableIfLastItem();
        this.action = 'play';
        this.item = this.items[this.position];
        this.video.load();
    };
    ItemDetail.prototype.goToPreviewItem = function () {
        this.position -= 1;
        this.nextButton.disabled = false;
        this.disableIfFirstItem();
        this.action = 'play';
        this.item = this.items[this.position];
        this.video.load();
    };
    ItemDetail = __decorate([
        IonicPage(),
        Component({
            selector: 'page-item-detail',
            templateUrl: 'item-detail.html',
        }),
        __metadata("design:paramtypes", [NavController,
            ViewController,
            Platform,
            Events,
            NativeStorage,
            BeaconProvider,
            DownloadProvider,
            NavParams,
            ItemsProvider])
    ], ItemDetail);
    return ItemDetail;
}());
export { ItemDetail };
//# sourceMappingURL=item-detail.js.map