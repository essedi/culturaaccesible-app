import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform, IonicPage, NavController, AlertController, NavParams, Events } from 'ionic-angular';
import { ExhibitionsProvider } from '../../providers/exhibitions/exhibitions';
import { ItemsProvider } from '../../providers/items/items'
import { BeaconProvider } from '../../providers/beacons/beacons'

import { NativeStorage } from '@ionic-native/native-storage';
import {GpsProvider} from '../../providers/gps/gps';

@IonicPage()
@Component({
    selector: 'page-exhibition-detail',
    templateUrl: 'exhibition-detail.html',
})
export class ExhibitionDetail {
    exhibition;
    hasItems: boolean = false;
    items: Array<Object>;
    map: any;
    notification: any;

    constructor(public navCtrl: NavController,
                public alertCtrl: AlertController,
                public platform: Platform,
                public beaconProvider: BeaconProvider,
                public events: Events,
                public zone: NgZone,
                public changeDetector: ChangeDetectorRef,
                public navParams: NavParams,
                private service: ExhibitionsProvider,
                private storage: NativeStorage,
                private gpsProvider: GpsProvider,
                private itemService: ItemsProvider ) {
                
        let lthis = this;
        let exhibition:any = navParams.get('exhibition')
        events.subscribe('goToItemDetail', (data) => {
          lthis.goToItemView(data.index)
        })

        events.subscribe('exhibitionUnlocked', (data) => {
          lthis.unlockExhibition(exhibition)
        })
        
       events.publish('videoParent', { page: "exhibition"});

      
       platform.ready().then(() => {
          if(exhibition){
                if(!beaconProvider.isInitialized && exhibition.locationType != "gps"){
                beaconProvider.initialise().then((isInitialised) => {
                  if (isInitialised) {
                    beaconProvider.listenToBeaconEvents(exhibition);
                    beaconProvider.isInitialized = true
                    }
                  });
               }
            }
        }); 
        
        this.notification = this.gpsProvider.notification;
        console.log(this.notification, "notification");
    }

   ionViewWillEnter() {

      this.beaconProvider.stopReadBeacon = false;
      let exhibition: any = this.navParams.get('exhibition')
      console.log(exhibition);
      
      if(exhibition.locationType == "gps")
       {
          this.gpsProvider.stopGps = false;
          this.gpsProvider.refreshTime();

      }else{ 
      
        this.beaconProvider.startRanging() 
         
      }
       this.getExhibition(exhibition)
    }

    
 ionViewWillLeave(){
     
     
       //this.beaconProvider.stopRanging();
       this.beaconProvider.stopReadBeacon = true;
      // this.events.unsubscribe('didRangeBeaconsInRegion');
      // this.events.unsubscribe('goToItemDetail')
       console.log("ionViewDidLeave");
  }
    
 ionViewWillUnload() {
        
      this.gpsProvider.stopGps = true;
      this.beaconProvider.stopRanging();
      this.beaconProvider.stopReadBeacon = true; 
      this.events.unsubscribe('goToItemDetail')
         console.log("ionViewWill Unload");
      this.events.unsubscribe('exhibitionUnlocked')
      
  }
    
  getExhibition(exhibition) {

      this.storage.getItem(exhibition.id).then(exhibition => {
        console.log(exhibition, "exhibition info");
        this.exhibition = exhibition;
        
         if(this.exhibition.locatioType == 'gps')
        {
           this.gpsProvider.itemsExhibition = [];
            
           if(this.exhibition.unlocked)
          {
             // move this Up if want to show items always
            this.gpsProvider.unlockExhibition(exhibition.id);

          }

        }else
        {

          this.beaconProvider.itemsExhibition = [];

          if(this.exhibition.unlocked)
          {
            this.beaconProvider.unlockExhibition(exhibition.id);

          }
          this.beaconProvider.listenToBeaconEvents(exhibition)
         
        }
      })
    }


    unlockExhibition(exhibition2) 
    {
      this.storage.getItem(exhibition2.id).then(exhibition => 
      {
        this.exhibition = null
        this.exhibition = exhibition
        this.beaconProvider.exhibition = exhibition
        this.gpsProvider.exhibition = exhibition
      })

      this.storage.getItem(this.exhibition.id + '-items').then(items => {
        console.log(items);
        if(items.length > 0)
        {
          this.items = items
          this.hasItems = true
        }
        this.beaconProvider.itemsExhibition = items;
        this.gpsProvider.itemsExhibition = items;
        this.changeDetector.detectChanges();
      })
    }
    
    viewMap()
    {
        this.navCtrl.push('MapPage', {items: this.items, exhibition: this.exhibition })
    }

    goToMuseum()
    {
        this.navCtrl.push('MuseumDetail', {id: this.exhibition.museum_id})
    }

    goToItemView(index) 
    {
        //this.beaconProvider.stopReadBeacon = true; // El refresh nunca pasara
        let activePage = this.navCtrl.getActive().component.name
        if('ItemDetail' == activePage)
        {
          this.navCtrl.pop();
        }
        this.navCtrl.push('ItemDetail', {index: index, exhibitionId: this.exhibition.id})
    }
}
    