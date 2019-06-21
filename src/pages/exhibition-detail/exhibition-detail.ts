import { Component, NgZone, ChangeDetectorRef,ViewChild } from '@angular/core';
import { Platform, IonicPage, NavController, AlertController, NavParams, Events} from 'ionic-angular';
import { ExhibitionsProvider } from '../../providers/exhibitions/exhibitions';
import { ItemsProvider } from '../../providers/items/items'
import { BeaconProvider } from '../../providers/beacons/beacons'

import { NativeStorage } from '@ionic-native/native-storage';

@IonicPage()
@Component({
    selector: 'page-exhibition-detail',
    templateUrl: 'exhibition-detail.html',
})


export class ExhibitionDetail {
    exhibition;
    hasItems: boolean = false;
    items: Array<Object>;
  

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
                private itemService: ItemsProvider ) {
        let lthis = this;
        let exhibition:any = navParams.get('exhibition')
        events.subscribe('goToItemDetail', (data) => {
          lthis.goToItemView(data.index)
        })

        events.subscribe('exhibitionUnlocked', (data) => {
          lthis.unlockExhibition(exhibition)
        })
<<<<<<< HEAD
        
       
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
=======
        platform.ready().then(() => {
          if(!beaconProvider.isInitialized){
            beaconProvider.initialise().then((isInitialised) => {
              if (isInitialised) {
                beaconProvider.listenToBeaconEvents(exhibition);
                beaconProvider.isInitialized = true
              }
            });
          }
>>>>>>> parent of 7c48ffd... gps functionality finished
        });
    }
    

<<<<<<< HEAD
   ionViewWillEnter() {
       
      this.beaconProvider.stopReadBeacon = false;
      let exhibition: any = this.navParams.get('exhibition')
      console.log(exhibition, "this exihibition 2");

     
      if(exhibition.locationType == "gps")
       {
          this.gpsProvider.stopGps = false;
          console.log( "gps location");
          this.gpsProvider.refreshTime();

      }else{ 
      
         console.log("beacon location");
         this.beaconProvider.startRanging() 
         
      }
         this.getExhibition(exhibition)
    }
    
    


    ionViewWillUnload() {
        
      this.gpsProvider.stopGps = true;
      this.beaconProvider.stopRanging();

=======
    ionViewWillEnter() {
      this.beaconProvider.stopReadBeacon = false;
      let exhibition:any = this.navParams.get('exhibition')
      console.log(exhibition);
      this.beaconProvider.startRanging()

      this.getExhibition(exhibition)
    }

    ionViewWillUnload() {
      this.beaconProvider.stopRanging();
>>>>>>> parent of 7c48ffd... gps functionality finished
      this.events.unsubscribe('goToItemDetail')
      this.events.unsubscribe('exhibitionUnlocked')
    }
    
     getExhibition(exhibition) {

      this.storage.getItem(exhibition.id).then(exhibition => {
        console.log(exhibition, "exhibition info");
        this.exhibition = exhibition;
<<<<<<< HEAD
        
        if(exhibition.locationType == "gps")
        {
            this.gpsProvider.itemsExhibition = [];
            if(this.exhibition.unlocked)
            {
               // move this Up if want to show items always
              this.gpsProvider.unlockExhibition(exhibition.id);

            }
=======
        this.beaconProvider.itemsExhibition = [];
        if(this.exhibition.unlocked){
          //this.beaconProvider.lastTriggeredBeaconNumber =  parseInt(exhibition.beacon);
          this.beaconProvider.unlockExhibition(exhibition.id);
>>>>>>> parent of 7c48ffd... gps functionality finished
        }
        else
        {
            this.beaconProvider.itemsExhibition = [];
            
             if(this.exhibition.unlocked)
            {
              //this.gpsProvider.unlockExhibition(exhibition.id);
              this.beaconProvider.unlockExhibition(exhibition.id);

            }

            this.beaconProvider.listenToBeaconEvents(exhibition)
        
        }
      })
    }


    unlockExhibition(exhibition2) {
      this.storage.getItem(exhibition2.id).then(exhibition => 
       {
        this.exhibition = null
        this.exhibition = exhibition
        this.beaconProvider.exhibition = exhibition
<<<<<<< HEAD
        this.gpsProvider.exhibition = exhibition

=======
>>>>>>> parent of 7c48ffd... gps functionality finished
      })

      this.storage.getItem(this.exhibition.id + '-items').then(items => {
        console.log(items);
        if(items.length > 0){
          this.items = items
          this.hasItems = true
        }
        this.beaconProvider.itemsExhibition = items;
        this.changeDetector.detectChanges();
      })
    }

    viewMap()
    {
        this.navCtrl.push('MapPage', {items: this.items })
    }

    goToMuseum()
    {
        this.navCtrl.push('MuseumDetail', {id: this.exhibition.museum_id})
    }

    goToItemView(index) {
        //this.beaconProvider.stopReadBeacon = true; // El refresh nunca pasara
        let activePage = this.navCtrl.getActive().component.name
        if('ItemDetail' == activePage){
          //this.events.publish('refreshItemPage', {index: index})
          this.navCtrl.pop();
        }
        this.navCtrl.push('ItemDetail', {index: index, exhibitionId: this.exhibition.id})

    }
}