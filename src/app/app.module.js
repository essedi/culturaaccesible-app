var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { EnvironmentsModule } from './environment-variables/environment-variables.module.ts';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IBeacon } from '@ionic-native/ibeacon';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ExhibitionsProvider } from '../providers/exhibitions/exhibitions';
import { MuseumProvider } from '../providers/museum/museum';
import { ItemsProvider } from '../providers/items/items';
import { BeaconProvider } from '../providers/beacons/beacons';
import { DownloadProvider } from '../providers/downloader/downloader';
import { GpsProvider } from '../providers/gps/gps';
import { NativeStorage } from '@ionic-native/native-storage';
import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { HTTP } from '@ionic-native/http';
// gps providers
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { PurchaseProvider } from '../providers/purchase/purchase';
import { GoogleMaps } from '@ionic-native/google-maps';
//import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
//purchase provider
import { InAppPurchase } from '@ionic-native/in-app-purchase';
export function createTranslateLoader(http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
            declarations: [
                MyApp
            ],
            imports: [
                BrowserModule,
                IonicModule.forRoot(MyApp),
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: createTranslateLoader,
                        deps: [Http]
                    }
                }),
                HttpModule,
                EnvironmentsModule
            ],
            bootstrap: [IonicApp],
            entryComponents: [
                MyApp
            ],
            providers: [
                StatusBar,
                SplashScreen,
                { provide: ErrorHandler, useClass: IonicErrorHandler },
                ExhibitionsProvider,
                MuseumProvider,
                ItemsProvider,
                BeaconProvider,
                DownloadProvider,
                IBeacon,
                NativeStorage,
                FileTransfer,
                HTTP,
                File,
                GpsProvider,
                Diagnostic,
                OpenNativeSettings,
                Geolocation,
                PurchaseProvider,
                InAppPurchase,
                GoogleMaps,
                //BackgroundGeolocation
            ]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map
