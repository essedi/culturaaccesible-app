import { Injectable } from '@angular/core';
import {Geolocation, GeolocationOptions} from '@ionic-native/geolocation';
import {Diagnostic} from '@ionic-native/diagnostic';
import {OpenNativeSettings} from '@ionic-native/open-native-settings';
import { Platform, Events, AlertController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage';


/*
  Generated class for the GpsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GpsProvider {

  itemsExhibition: any[] = [];
  exhibition: any;
  stopGps: boolean ;


  constructor(
        public platform: Platform,
        public events: Events,
        public translate: TranslateService,
        public alertCtrl: AlertController,
        private storage: NativeStorage,
              
        private geolocation: Geolocation,
        private diagnostic: Diagnostic,
        private openSettings: OpenNativeSettings
        ) {}
  
   getItemLocation(){
       
    this.getLocation().then(
        (res: any) =>
        {
            console.log(res,"<<<< exibition getlocationn gps");

           for(let item of this.itemsExhibition)
            {
                
                var distance = this.getDistance(res.latitude, item["lat"], res.longitude , item["lng"]);
                console.log(distance, "<<<< distancia en metros, need 50");
                
                if(distance < 50)
                {
                    console.log("<<<< PLAY VIDEO AT 50 MTRS");
                    
                    this.showOpenItemAlert(item, this.exhibition.id );
                    
                }
            }
        },
        (err: any) =>
        {
            console.log(err, "<<<< err location");

        });
  }
  


   refreshTime(lthis = this)
    {
      if(this.stopGps == false)
      {    
        lthis.getItemLocation();  

        setTimeout(function ()
        {
            lthis.refreshTime(lthis);

        }, 10000);
          
      } 
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
    
    
    

    presentUnlockExhibition() 
    {
      this.setDefaultLockedValue()
      if(this.isLocked())
      {
        //this.setLastTriggeredBeacon()
        this.unlockExhibition(this.exhibition.id)
      }
    }

    setDefaultLockedValue() 
    {
      if(this.exhibition.unlocked === undefined){
        this.exhibition.unlocked = false
      }
    }

    isLocked() 
   {
      return !this.exhibition.unlocked 
    }

    unlockExhibition(exhibitionId) {
      this.storage.getItem(exhibitionId).then(exhibition => {
        //let isunlock = exhibition.unlocked;
        this.exhibition.unlocked = exhibition.unlocked = true;
        this.storage.setItem(exhibitionId, exhibition).then(() => {
         
          this.events.publish('exhibitionUnlocked')
        })
      })
    }


  retrieveItemByCoords(lat, lng, exhibitionId) 
  {
    this.events.publish('retrieveItemByCoords', {lat:lat , lng: lng, exhibitionId: exhibitionId})
  }



  showOpenItemAlert(item, exhibitionId) 
   {
    let messages;

    this.translate.get('BEACONS.ALERT').subscribe(data => {
      messages = data
    })
    let alert = this.alertCtrl.create({
      title: item !== -1 ? item.name : messages['TITLE'] ,
      message: messages['BODY'],
      buttons: [
        {
          text: messages['BUTTONS']['NO'],
          role: 'cancel',
          handler: () => {
           // this.events.publish('startRanging')
            this.stopGps = true;
            console.log('Cancel clicked');
          }
        },
        {
          text: messages['BUTTONS']['YES'],
          handler: () => {
           
            this.retrieveItemByCoords(item.lat, item.lng, exhibitionId)
            this.stopGps = true;
           // this.events.publish('startRanging')
          }
        }
      ]
    });
    alert.present();
  }



}