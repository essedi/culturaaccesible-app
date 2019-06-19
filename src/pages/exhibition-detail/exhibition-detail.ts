import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform, IonicPage, NavController, AlertController, NavParams, Events } from 'ionic-angular';
import { ExhibitionsProvider } from '../../providers/exhibitions/exhibitions';
import { ItemsProvider } from '../../providers/items/items'
import { BeaconProvider } from '../../providers/beacons/beacons'
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { NativeStorage } from '@ionic-native/native-storage';
import {GpsProvider} from '../../providers/gps/gps';

declare var google; 
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

    constructor(public navCtrl: NavController,
                public alertCtrl: AlertController,
                public platform: Platform,
                public beaconProvider: BeaconProvider,
                public events: Events,
                public zone: NgZone,
                private geolocation: Geolocation,
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
    }

   ionViewWillEnter() {
       
      this.beaconProvider.stopReadBeacon = false;
      let exhibition: any = this.navParams.get('exhibition')
      console.log(exhibition, "this exihibition 2");

     
      if(exhibition.locationType == "gps")
       {
          this.gpsProvider.stopGps = false;
          console.log( "gps location");
          this.gpsProvider.refreshTime();
          this.getPosition();

      }else{ 
      
         console.log("beacon location");
         this.beaconProvider.startRanging() 
         
      }
         this.getExhibition(exhibition)
    }
    
    
    getPosition():any{
        this.geolocation.getCurrentPosition().then(response => {
          this.loadMap(response);
        })
        .catch(error =>{
          console.log(error);
        })
    }
    
    loadMap(position: Geoposition)
     {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        console.log(latitude, longitude);

        // create a new map by passing HTMLElement
        let mapEle: HTMLElement = document.getElementById('map');

        // create LatLng object
        let myLatLng = {lat: latitude, lng: longitude};

        // create map
        this.map = new google.maps.Map(mapEle, {
          center: myLatLng,
          zoom: 12
        });

        google.maps.event.addListenerOnce(this.map, 'idle', () => {
          let marker = new google.maps.Marker({
            position: myLatLng,
            map: this.map,
            title: ''
          });
          mapEle.classList.add('show-map');
        });
        
        console.log(this.items, "ITEMS");
        
       /* for(let item of this.items){
            
            google.maps.event.addListenerOnce(this.map, 'idle', () => {
                let marker = new google.maps.Marker({
                  position: {lat: item.lat, lng: item.lng},
                  map: this.map,
                  title: item.name
                });
                mapEle.classList.add('show-map');
            });
        }
        
        */
      }

   

    ionViewWillUnload() {
        
      this.gpsProvider.stopGps = true;
      this.beaconProvider.stopRanging();

      this.events.unsubscribe('goToItemDetail')
      this.events.unsubscribe('exhibitionUnlocked')
      
    }
    
     getExhibition(exhibition) {

      this.storage.getItem(exhibition.id).then(exhibition => {
        console.log(exhibition, "exhibition info");
        this.exhibition = exhibition;
        this.beaconProvider.itemsExhibition = [];
        this.gpsProvider.itemsExhibition = [];

        if(this.exhibition.unlocked)
        {
           // move this Up if want to show items always
          this.gpsProvider.unlockExhibition(exhibition.id);
          this.beaconProvider.unlockExhibition(exhibition.id);

        }
 
        this.beaconProvider.listenToBeaconEvents(exhibition)

      })
    }


    unlockExhibition(exhibition2) {
      this.storage.getItem(exhibition2.id).then(exhibition => 
       {
        this.exhibition = null
        this.exhibition = exhibition
        this.beaconProvider.exhibition = exhibition
        this.gpsProvider.exhibition = exhibition

      })

      this.storage.getItem(this.exhibition.id + '-items').then(items => {
        console.log(items);
        if(items.length > 0){
          this.items = items
          this.hasItems = true
        }
        this.beaconProvider.itemsExhibition = items;
        this.gpsProvider.itemsExhibition = items;

        this.changeDetector.detectChanges();
      })
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