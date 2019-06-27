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
import { Platform, AlertController } from 'ionic-angular';
import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
var DownloadProvider = /** @class */ (function () {
    function DownloadProvider(platform, transfer, file, alertCtrl) {
        var _this = this;
        this.platform = platform;
        this.transfer = transfer;
        this.file = file;
        this.alertCtrl = alertCtrl;
        this.storageDirectory = '';
        this.downloadedVideos = [];
        this.platform.ready().then(function () {
            // make sure this is on a device, not an emulation (e.g. chrome tools device mode)
            if (!_this.platform.is('cordova')) {
                return false;
            }
            if (_this.platform.is('ios')) {
                _this.storageDirectory = cordova.file.documentsDirectory;
            }
            else if (_this.platform.is('android')) {
                _this.storageDirectory = cordova.file.dataDirectory;
            }
            else {
                // exit otherwise, but you could add further types here e.g. Windows
                return false;
            }
        });
    }
    DownloadProvider.prototype.download = function (source, id) {
        var _this = this;
        return this.platform.ready().then(function () {
            var fileTransfer = _this.transfer.create();
            return fileTransfer.download(source, _this.storageDirectory + id + '-video.mp4').then(function (entry) {
                console.log(entry.toURL());
                _this.downloadedVideos.push({ id: id, source: entry.toURL() });
                return entry.toURL();
            }).catch(function (error) {
                throw error;
            });
        });
    };
    DownloadProvider.prototype.checkFile = function (id) {
        return this.file.checkFile(this.storageDirectory, id + '-video.mp4')
            .then(function () {
            return true;
        })
            .catch(function (err) {
            return false;
        });
    };
    DownloadProvider.prototype.deleteMedia = function (items) {
        var _this = this;
        items.forEach(function (item) {
            if (_this.checkFile(item.id)) {
                _this.deleteFile(item.id);
            }
        });
    };
    DownloadProvider.prototype.deleteFile = function (id) {
        this.file.removeFile(this.storageDirectory, id + '-video.mp4');
    };
    DownloadProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Platform, FileTransfer, File, AlertController])
    ], DownloadProvider);
    return DownloadProvider;
}());
export { DownloadProvider };
//# sourceMappingURL=downloader.js.map