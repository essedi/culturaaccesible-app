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
import { Component, Inject } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams, LoadingController, ToastController, Events, Platform } from 'ionic-angular';
import { ExhibitionsProvider } from '../../providers/exhibitions/exhibitions';
import { NativeStorage } from '@ionic-native/native-storage';
import { TranslateService } from '@ngx-translate/core';
import { DownloadProvider } from '../../providers/downloader/downloader';
import { EnvVariables } from '../../app/environment-variables/environment-variables.token';
import { PurchaseProvider } from '../../providers/purchase/purchase';
import { GpsProvider } from '../../providers/gps/gps';
var ExhibitionList = /** @class */ (function () {
    function ExhibitionList(navCtrl, alertCtrl, navParams, events, platform, loadingCtrl, toastCtrl, nativeStorage, translate, service, gpsProvider, downloader, purchaseProvider, envVariables) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.alertCtrl = alertCtrl;
        this.navParams = navParams;
        this.events = events;
        this.platform = platform;
        this.loadingCtrl = loadingCtrl;
        this.toastCtrl = toastCtrl;
        this.nativeStorage = nativeStorage;
        this.translate = translate;
        this.service = service;
        this.gpsProvider = gpsProvider;
        this.downloader = downloader;
        this.purchaseProvider = purchaseProvider;
        this.envVariables = envVariables;
        this.payed = false;
        this.purchases = [];
        this.loadProgress = 0;
        this.url = this.envVariables.baseUrl;
        this.purchaseProvider.queryPurchases();
        this.events.subscribe('retrievePremiumExhibition', function (data) {
            //this.download(data.id, data.isoCode)
            console.log(data, "retrievePremiumExhibition");
            _this.purchases.push(data);
        });
        this.platform.resume.subscribe(function (result) {
            console.log("platform resume");
            _this.gpsProvider.stopBackgroundGeolocation();
        });
        this.platform.pause.subscribe(function (result) {
            console.log("platform pause");
            _this.gpsProvider.startBackgroundGeolocation();
        });
    }
    ExhibitionList.prototype.checkIfPayed = function (exhibition) {
        console.log(this.purchases, "this.purchases ");
        if (this.purchases && exhibition.premium == true) {
            for (var _i = 0, _a = this.purchases; _i < _a.length; _i++) {
                var purchase = _a[_i];
                if (purchase.id === exhibition.productId) {
                    return true;
                }
            }
            return false;
        }
    };
    ExhibitionList.prototype.ionViewWillEnter = function () {
        this.getStoredData();
        this.events.publish('stopRanging');
        this.events.publish('cleanLastTriggeredBeacon');
        console.log("entered");
    };
    ExhibitionList.prototype.getStoredData = function () {
        var _this = this;
        if (this.platform.is('cordova')) {
            this.nativeStorage.keys().then(function (data) {
                _this.storedData = data;
                _this.setExhibtitions();
            });
        }
        else {
            this.storedData = [];
            this.setExhibtitions();
        }
    };
    ExhibitionList.prototype.setExhibtitions = function () {
        var _this = this;
        this.service.retrieveList().subscribe(function (exhibitions) {
            console.log(exhibitions);
            if (exhibitions.length > 0) {
                _this.hasExhibitions = true;
                _this.allExhibitions = exhibitions;
                console.log("show exibition ");
                _this.filterExhibitions();
            }
            else {
                _this.showNoExhibitionMessage();
            }
        });
    };
    ExhibitionList.prototype.showNoExhibitionMessage = function () {
        this.hasExhibitions = false;
    };
    ExhibitionList.prototype.purchaseExhibition = function (exhibition) {
        this.purchaseProvider.getProducts(exhibition);
    };
    ExhibitionList.prototype.isDownloaded = function (exhibition) {
        return this.storedData.some(function (id) { return id === exhibition.id; });
    };
    ExhibitionList.prototype.filterExhibitions = function () {
        var activeExhibitions = [];
        for (var _i = 0, _a = this.allExhibitions; _i < _a.length; _i++) {
            var exhibition = _a[_i];
            if (exhibition['show']) {
                activeExhibitions.push(exhibition);
            }
        }
        this.exhibitions = activeExhibitions;
    };
    ExhibitionList.prototype.download = function (exhibition, isoCode) {
        var _this = this;
        var lthis = this;
        //this.presentLoading()
        this.loaderBarFunction(exhibition);
        this.service.download(exhibition.id, isoCode).then(function (exhibition) {
            var object = JSON.parse(exhibition.data);
            _this.extractItems(object);
        }, function (error) {
            console.log(error);
            console.log(JSON.stringify(error));
            lthis.loading.dismiss();
        });
    };
    ExhibitionList.prototype.saveInLocal = function (exhibition) {
        this.nativeStorage.setItem(exhibition.id, exhibition)
            .then(function () {
            console.log('Stored item!');
        }, function (error) {
            console.error('Error storing item', error);
        });
    };
    ExhibitionList.prototype.extractItems = function (exhibition) {
        var _this = this;
        var items = [];
        exhibition.items.forEach(function (item) {
            items.push(item);
            item.children.forEach(function (child) {
                items.push(child);
                child.children.forEach(function (subchild) {
                    items.push(subchild);
                });
            });
        });
        items.sort(function (a, b) {
            return parseInt(a.beacon) > parseInt(b.beacon) ? 1 : -1;
        });
        setTimeout(function () {
            console.log("items");
            console.log(items);
            _this.nativeStorage.setItem(exhibition.id + '-items', items);
            _this.downloadMedia(exhibition, items);
        }, 1500);
    };
    ExhibitionList.prototype.downloadMedia = function (exhibition, items) {
        this.saveInLocal(exhibition);
        this.getStoredData();
        this.loading.dismiss();
        /*Promise.all(
          items.map((object) => {
            return this.downloader.download(object.video, object.id)
          })
        ).then((items) => {
          this.saveInLocal(exhibition)
          this.getStoredData()
          this.loading.dismiss()
        }).catch((error) => {
          this.loading.dismiss()
          this.presentError()
        })*/
    };
    ExhibitionList.prototype.delete = function (exhibition) {
        var _this = this;
        this.nativeStorage.remove(exhibition.id).then(function () {
            _this.presentLoading();
            _this.getStoredData();
        });
        this.nativeStorage.getItem(exhibition.id + '-items').then(function (items) {
            _this.downloader.deleteMedia(items);
        });
        this.nativeStorage.remove(exhibition.id + '-items').then(function (done) {
            _this.loading.dismiss();
        }, function (error) {
            _this.loading.dismiss();
        });
        //this.loadProgress = 0;
        var x = document.getElementById('myProgressBar' + exhibition.id);
        x.style.display = "none";
    };
    ExhibitionList.prototype.askLanguage = function (exhibition) {
        var _this = this;
        var messages;
        this.translate.get('EXHIBITIONS.LIST.ALERT').subscribe(function (data) {
            messages = data;
        });
        var isoCodeTranslations = {
            'es': 'Castellano',
            'cat': 'Valencià',
            'en': 'English'
        };
        var alert = this.alertCtrl.create({
            title: messages['TITLE'],
            message: messages['BODY'],
            buttons: [
                {
                    text: messages['BUTTONS']['NO'],
                    role: 'cancel',
                    handler: function () {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: messages['BUTTONS']['YES'],
                    handler: function (isoCode) {
                        _this.download(exhibition, isoCode);
                    }
                }
            ]
        });
        exhibition.iso_codes.forEach(function (locale) {
            alert.addInput({ type: 'radio', label: isoCodeTranslations[locale], value: locale });
        });
        alert.present();
    };
    ExhibitionList.prototype.presentLoading = function () {
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        this.loading.present();
    };
    ExhibitionList.prototype.presentError = function () {
        var toast = this.toastCtrl.create({
            message: 'Ha habido un error',
            duration: 3000,
            position: 'bottom',
            cssClass: 'active'
        });
        toast.present();
    };
    ExhibitionList.prototype.loaderBarFunction = function (exhibition) {
        var _this = this;
        var tag = document.createElement('script');
        var xhr = new XMLHttpRequest();
        var url = this.envVariables.baseUrl + "/api/exhibition/download";
        xhr.open('POST', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onloadend = function (e) { return document.head.appendChild(tag); };
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(JSON.stringify({ "iso_code": "es", "id": exhibition.id }));
        var barElement = document.getElementById('myProgressBar' + exhibition.id);
        barElement.style.display = "block";
        xhr.onprogress = function (e) {
            if (e.lengthComputable) {
                var width = 100 * e.loaded / +e.total;
                _this.loadProgress = width;
                barElement.style.width = width + '%';
            }
        };
    };
    ExhibitionList.prototype.goToDetail = function (exhibition) {
        var _this = this;
        this.nativeStorage.getItem(exhibition.id)
            .then(function (exhibition) {
            console.log(exhibition.id);
            _this.navCtrl.push('ExhibitionDetail', { exhibition: exhibition });
        })
            .catch(function (error) {
            _this.askLanguage(exhibition);
        });
    };
    ExhibitionList.prototype.goToMuseum = function (museumId) {
        this.navCtrl.push('MuseumDetail', { id: museumId });
    };
    ExhibitionList = __decorate([
        IonicPage(),
        Component({
            selector: 'page-exhibition-list',
            templateUrl: 'exhibition-list.html',
        }),
        __param(13, Inject(EnvVariables)),
        __metadata("design:paramtypes", [NavController,
            AlertController,
            NavParams,
            Events,
            Platform,
            LoadingController,
            ToastController,
            NativeStorage,
            TranslateService,
            ExhibitionsProvider,
            GpsProvider,
            DownloadProvider,
            PurchaseProvider, Object])
    ], ExhibitionList);
    return ExhibitionList;
}());
export { ExhibitionList };
//# sourceMappingURL=exhibition-list.js.map