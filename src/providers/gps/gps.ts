import { Injectable } from '@angular/core';
import {Geolocation, GeolocationOptions} from '@ionic-native/geolocation';
import {Diagnostic} from '@ionic-native/diagnostic';
import {OpenNativeSettings} from '@ionic-native/open-native-settings';
import { Platform, Events, AlertController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import BackgroundGeolocation from "cordova-background-geolocation-lt";


@Injectable()
export class GpsProvider {

  itemsExhibition: any[] = [];
  exhibition: any;
  stopGps: boolean ;
  logs: string[] = [];
  notification: any;
  disabledItems: any[] = [];
  isAndroid: boolean = true;
  alertItem: any;
  repeat: boolean;
  interval: any;
  locationUpdated: any;

  constructor(
        public platform: Platform,
        public events: Events,
        public translate: TranslateService,
        public alertCtrl: AlertController,
        private storage: NativeStorage,
        private geolocation: Geolocation,
        private diagnostic: Diagnostic,
        private localNotifications: LocalNotifications,
        private openSettings: OpenNativeSettings
   ) {
   
    this.platform.ready().then(this.configureBackgroundGeolocation.bind(this));
    
    this.events.subscribe('stopGps', (data) => {

          if(data.stop == true)
          {
              const obj = this.itemsExhibition.find( item => item.id === data.id );
              const obj2 = this.disabledItems.find( item => item.id === obj.id );

              if(!obj2)
              {
                 this.disabledItems.push(obj);
              }
          }
      });

      this.localNotifications.on('trigger').subscribe((noti)=> { 

           console.log(noti , "notif triggered");
           this.showOpenItemAlert(this.alertItem, this.exhibition.id );
      });
   }


    configureBackgroundGeolocation(){

         BackgroundGeolocation.onLocation(location => {
             console.log('[location] - ', location);
             this.searchItemsExhibition(location);
        });

       let bgMessage: any;

       this.translate.get('EXHIBITIONS.BGNOTIF').subscribe(data => {
           bgMessage = data
       })

       BackgroundGeolocation.ready({
            reset: true,
            debug: false,
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            distanceFilter: 0,
            autoSync: true,
            stopOnTerminate: true,
            locationUpdateInterval: 10000,
            notification: {
               title: 'Cultura Accesible',
               text: bgMessage["TEXT"] ,
               smallIcon : 'file://assets/icon.png',
               largeIcon: 'file://assets/icon.png'        
            },
             startOnBoot: true,
             foregroundService: false,
            // IOS only
           // preventSuspend: true,

          }, (state) => {
            console.log('[ready] BackgroundGeolocation is ready to use');
            if (!state.enabled) {
              // 3.  Start tracking.
               BackgroundGeolocation.start();
            }
       });
    }

   getItemLocation()
   {
    this.getLocation().then(
        (res: any) =>
        {
           for(let item of this.itemsExhibition)
            {
               var distance = this.getDistance(res.latitude, item["lat"], res.longitude , item["lng"]);
               console.log(distance, "<<<< PLAY VIDEO AT 90 MTRS");
               var itemDisabled = this.disabledItems.find( obj => obj.id == item.id );
               
               if(itemDisabled)
               {
                   console.log(itemDisabled, "DISABLED");
                   
               }else
               {
                 if(distance < 90 )
                 {
                     this.showOpenItemAlert(item, this.exhibition.id );
                     this.events.publish('stopGps', {stop:true , id: item.id})
                 }
               }
            }
        },
        (err: any) =>
        {
            console.log(err, "<<<< err location");

        });
    }
  

    searchItemsExhibition(location){
        
          for(let item of this.itemsExhibition)
            {
                 var distance = this.getDistance(location.coords.latitude, item["lat"], location.coords.longitude , item["lng"]);
                 console.log(distance, "BG ITEM distance");

                 var itemDisabled = this.disabledItems.find( obj => obj.id == item.id );

                  if(itemDisabled)
                 {
                      console.log(itemDisabled, "BG ITEM DISABLED");

                  }else{

                     if(distance < 90 )
                     {
                         this.alertItem = item;
                         this.setNotification();
                         console.log("PLAY SOUND");
                         //this.disabledItems.push(item);
                         this.events.publish('stopGps', { stop:true , id: item.id })
                     }
                 }
              }  
             console.log(location, new Date(), "process finished!");
        //  this.backgroundGeolocation.finish(); // IOS Only
    }


   refreshTime(lthis = this)
    {   
        
        if(this.stopGps == false )
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
    
    
 
    unlockExhibition(exhibitionId) {
      this.storage.getItem(exhibitionId).then(exhibition => {
        //let isunlock = exhibition.unlocked;
        this.exhibition.unlocked = true;
        exhibition.unlocked = true;
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
            //this.stopGps = true;
            console.log('Cancel clicked');
           // this.events.publish('stopGps', {stop:true , id: item.id})
          }
        },
        {
          text: messages['BUTTONS']['YES'],
          handler: () => {
           
            this.retrieveItemByCoords(item.lat, item.lng, exhibitionId)
            //this.stopGps = true;
           // this.events.publish('startRanging')

          }
        }
      ]
    });
    alert.present();
  }
  

    stopBackgroundGeolocation()
   {  
     // BackgroundGeolocation.stop();
   }

   
    startBackgroundGeolocation()
    {   
      //  BackgroundGeolocation.start();
        console.log("starting geolocation");
    }
   
 
    setNotification()
    { 
        let messages;

        this.translate.get('EXHIBITIONS.NOTIFICATION').subscribe(data => {
          messages = data
        })
       
        this.localNotifications.schedule({
           text: messages['TEXT'],
           title: messages['TITLE'],
           id: 1,
           sound:'file://assets/ring.mp3' ,
           vibrate: true,
           foreground: false
        });
    }
    
    
    clearNotification(){
        
        this.localNotifications.clearAll();
    }
  

}