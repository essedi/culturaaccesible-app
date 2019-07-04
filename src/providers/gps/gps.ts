import { Injectable } from '@angular/core';
import {Geolocation, GeolocationOptions} from '@ionic-native/geolocation';
import {Diagnostic} from '@ionic-native/diagnostic';
import {OpenNativeSettings} from '@ionic-native/open-native-settings';
import { Platform, Events, AlertController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse ,BackgroundGeolocationEvents} from '@ionic-native/background-geolocation';
import { LocalNotifications } from '@ionic-native/local-notifications';


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
  
  config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: false, // enable this to clear background location settings when the app terminates
      // Android only section
      locationProvider: 1,
      startForeground: true,
      interval: 3000,
      fastestInterval: 2000,
      activitiesInterval: 10000,
    };

  constructor(
        public platform: Platform,
        public events: Events,
        public translate: TranslateService,
        public alertCtrl: AlertController,
        private storage: NativeStorage,
        private geolocation: Geolocation,
        private diagnostic: Diagnostic,
        private localNotifications: LocalNotifications,
        private openSettings: OpenNativeSettings,
        private backgroundGeolocation: BackgroundGeolocation

   ) {
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
        
        
        this.platform.ready().then(() => {

            this.localNotifications.on('trigger').subscribe((noti)=> { 
                
                //navigator.vibrate(1500);
                console.log(noti , "notif triggered");
                this.showOpenItemAlert(this.alertItem, this.exhibition.id );

            });
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
              // console.log(distance, "<<<< PLAY VIDEO AT 90 MTRS");
                 
               var itemDisabled = this.disabledItems.find( obj => obj.id == item.id );
               
               if(itemDisabled)
               {
                   console.log(itemDisabled, "DISABLED");
                   
               }else
               {
                 if(distance < 90 )
                 {
                     this.showOpenItemAlert(item, this.exhibition.id );
                     this.stopGps = true;
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
            this.events.publish('stopGps', {stop:true , id: item.id})
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
    this.backgroundGeolocation.stop();
  }
  
  
  startBackgroundGeolocation()
  {
      var lthis = this;
      
      
      (function runForever(){
        // Do something here

        lthis.backgroundGeolocation.configure(lthis.config).then(() => {
            lthis.backgroundGeolocation
              .on(BackgroundGeolocationEvents.location)
              .subscribe((location: BackgroundGeolocationResponse) => {

                    console.log(location, "BACKGROUND LOCATION WORKS!");
                    
                    for(let item of lthis.itemsExhibition)
                    {
                       var distance = lthis.getDistance(location.latitude, item["lat"], location.longitude , item["lng"]);

                       var itemDisabled = lthis.disabledItems.find( obj => obj.id == item.id );
                       

                       if(itemDisabled)
                       {
                         console.log(itemDisabled, "BG ITEM DISABLED");

                       }else{

                            if(distance < 90  )
                            {
                                lthis.alertItem = item;
                                lthis.setNotification();
                                console.log("PLAY SOUND");
                                lthis.disabledItems.push(item);
                            }
                       }
                    }  
               });
         });
         
        
         // start recording location
      lthis.backgroundGeolocation.start(); 

      setTimeout(runForever, 10000)
    })()
    

   // this.backgroundGeolocation.start();

   }


    setNotification()
    {    
        this.localNotifications.schedule({
           text: 'Location Notification ',
           title: 'You are near an exhibition',
           id: 1,
          // trigger: { at:new Date(new Date().getTime()) },
           sound:'file://assets/ring.mp3' ,
           vibrate: true,
           foreground: false

        });

    }
    
    
    playSound(){

        return 'file://assets/ring.mp3';
    }

    clearNotification(){
        
        this.localNotifications.clearAll();
         
    }
  

}