import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform, IonicPage, NavController, AlertController, NavParams, Events } from 'ionic-angular';
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
        platform.ready().then(() => {
          if(!beaconProvider.isInitialized){
            beaconProvider.initialise().then((isInitialised) => {
              if (isInitialised) {
                beaconProvider.listenToBeaconEvents(exhibition);
                beaconProvider.isInitialized = true
              }
            });
          }
        });
    }

    ionViewWillEnter() {
      this.beaconProvider.stopReadBeacon = false;
      let exhibition:any = this.navParams.get('exhibition')
      console.log(exhibition);
      this.beaconProvider.startRanging()

      this.getExhibition(exhibition)
    }

    ionViewWillUnload() {
      this.beaconProvider.stopRanging();
      this.events.unsubscribe('goToItemDetail')
      this.events.unsubscribe('exhibitionUnlocked')
    }

    getExhibition(exhibition) {
      this.storage.getItem(exhibition.id).then(exhibition => {
        console.log(exhibition);
        this.exhibition = exhibition;
        this.beaconProvider.itemsExhibition = [];
        if(this.exhibition.unlocked){
          //this.beaconProvider.lastTriggeredBeaconNumber =  parseInt(exhibition.beacon);
          this.beaconProvider.unlockExhibition(exhibition.id);
        }
        this.beaconProvider.listenToBeaconEvents(exhibition)
      })

      /*this.storage.getItem(this.exhibition.id + '-items').then(items => {
        if(items.length > 0){
          this.items = items
          this.hasItems = true
        }
      })*/
    }

    unlockExhibition(exhibition2) {
      this.storage.getItem(exhibition2.id).then(exhibition => {
        this.exhibition = null
        this.exhibition = exhibition
        this.beaconProvider.exhibition = exhibition
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

    goToMuseum(){
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
