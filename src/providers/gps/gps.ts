import { Injectable } from '@angular/core';
import {Geolocation, GeolocationOptions} from '@ionic-native/geolocation';
import {Diagnostic} from '@ionic-native/diagnostic';
import {OpenNativeSettings} from '@ionic-native/open-native-settings';


/*
  Generated class for the GpsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GpsProvider {

  constructor(
        private geolocation: Geolocation,
        private diagnostic: Diagnostic,
        private openSettings: OpenNativeSettings
        ) {
    console.log('Hello GpsProvider Provider');
    
  }
  
  
   getLocation(opt: GeolocationOptions = null)
    {
        let lthis = this;
        return new Promise(function (resolve)
        {
            lthis.checkLocation().then(
                (res: boolean) =>
                {
                    //if options not passed, use default
                    if (!opt)
                    {
                        opt =
                            {
                                maximumAge: 10000,
                                enableHighAccuracy: res,
                                timeout: 10000
                            }
                    }
                    lthis.geolocation.getCurrentPosition(opt).then(
                        (res) =>
                        {
                            console.log("Get current position", res.coords);
                            resolve(res.coords);
                        },
                        (err) =>
                        {
                            console.error("Get current positionerror", err);
                            resolve(false);

                        }
                    );
                },
                () =>
                {
                    resolve(false);
                }
            );
        });

    }
    checkLocation()
    {
        let lthis = this;
        return new Promise(function (resolve, reject)
        {
            lthis.diagnostic.isLocationAvailable().then(
                (res) =>
                {
                    if (res)
                    {
                        lthis.diagnostic.isLocationEnabled().then(
                            (res) =>
                            {
                                if (res)
                                {
                                    resolve(true);

                                } else
                                {
                                    console.log('Location: is not LocationAvailable is not LocationEnabled', res);
                                    lthis.openSettings.open("location").then(
                                        (res) =>
                                        {
                                            console.log('Location: isLocationAvailable openSettings', res);
                                            //                                            lthis.checkLocation();
                                        },
                                        (err) =>
                                        {
                                            console.error('Location: isLocationAvailable openSettings error', err);

                                        }
                                    );
                                }
                            },
                            (err) =>
                            {
                                reject(err);
                            }
                        );
                    } else
                    {
                        console.log('Location: is not LocationAvailable', res);
                        lthis.diagnostic.isLocationEnabled().then(
                            (res) =>
                            {
                                if (res)
                                {
                                    lthis.diagnostic.isLocationAuthorized().then(
                                        (res) =>
                                        {
                                            console.log('Location: isLocationAuthorized', res);
                                            if (res)
                                            {
                                                resolve(false);
                                            } else
                                            {
                                                lthis.diagnostic.requestLocationAuthorization().then(
                                                    (res) =>
                                                    {
                                                        console.log('Location: requestLocationAuthorization', res);
                                                        lthis.checkLocation().then(
                                                            (res) =>
                                                            {
                                                                resolve(res);
                                                            },
                                                            (err) =>
                                                            {
                                                                reject(err);
                                                            }
                                                        );
                                                    },
                                                    (err) =>
                                                    {
                                                        console.error('Location: requestLocationAuthorization error', err);
                                                        reject(err);
                                                    }
                                                );
                                            }

                                        },
                                        (err) =>
                                        {
                                            console.error('Location: isLocationAuthorized error', err);
                                            reject(err);
                                        }
                                    );
                                } else
                                {
                                    console.log('Location: is not LocationEnabled', res);
                                    lthis.openSettings.open("location").then(
                                        (res) =>
                                        {
                                            console.log('Location: openSettings', res);
                                            //                                            lthis.checkLocation();
                                        },
                                        (err) =>
                                        {
                                            console.error('Location: openSettings error', err);

                                        }
                                    );
                                    
                                }

                            },
                            (err) =>
                            {
                                console.error('Location: isLocationEnabled error', err);
                                reject(err);
                            }
                        );

                    }

                },
                (err) =>
                {
                    console.error('Location: isLocationAvailable error', err);
                    reject(err);
                }
            );
        });
    }

    public getDistance(lat1: number, lat2: number, long1: number, long2: number)
    {
        let p = 0.017453292519943295;    // Math.PI / 180
        let c = Math.cos;
        let a = 0.5 - c((lat1 - lat2) * p) / 2 + c(lat2 * p) * c((lat1) * p) * (1 - c(((long1 - long2) * p))) / 2;
        let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
        return Math.floor(dis * 1000);
    }

}
