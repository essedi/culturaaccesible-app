import { Injectable } from '@angular/core';
import { Platform, Events, AlertController } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage';

import { Beacon } from '../../models/beacon';

@Injectable()
export class BeaconProvider {

  delegate: any;
  region: any;
  beacons: Beacon[] = [];
  closestBeacon: Beacon;
  lastTriggeredBeaconNumber: number;
  triggeredBeaconNumber: any[] = [];
  exhibition: any;
  itemsExhibition: any[] = [];
  isInitialized: boolean = false;
  stopReadBeacon: boolean = false;

  constructor(public platform: Platform,
              public events: Events,
              public translate: TranslateService,
              public alertCtrl: AlertController,
              private storage: NativeStorage,
              private ibeacon: IBeacon) {
    events.subscribe('stopRanging', (result) => {
      this.stopRanging()
    })
    events.subscribe('startRanging', (result) => {
      this.startRanging()
    })
    events.subscribe('cleanLastTriggeredBeacon', (result) => {
      this.cleanLastTriggeredBeacon()
    })
  }

  initialise(): any {
    let promise = new Promise((resolve, reject) => {
      // we need to be running on a device
      if (this.platform.is('cordova')) {
        this.setBeaconsEnvironment()

        // start ranging
        this.ibeacon.startRangingBeaconsInRegion(this.region)
          .then(
            () => {
              resolve(true);
            },
            error => {
              console.error('Failed to begin monitoring: ', error);
              resolve(false);
            }
          );

      } else {
        console.error("This application needs to be running on a device");
        resolve(false);
      }
    });

    return promise;
  }

  setBeaconsEnvironment() {
    this.askForAuthorizations()
    this.setRegion()
    this.subscribeBeaconsInRange()
  }

  stopRanging(){
    this.ibeacon.stopRangingBeaconsInRegion(this.region)
  }

  startRanging(){
    this.ibeacon.startRangingBeaconsInRegion(this.region)
  }

  subscribeBeaconsInRange() {
    this.delegate = this.ibeacon.Delegate();

    this.delegate.didRangeBeaconsInRegion()
      .subscribe(
        data => this.events.publish('didRangeBeaconsInRegion', data),
        error => console.error()
      );
  }

  listenToBeaconEvents(exhibition) {
    this.exhibition = exhibition
    this.events.subscribe('didRangeBeaconsInRegion', (data) => {
      this.initializeBeacons(data)
      this.chooseListenAction(parseInt(exhibition.beacon))
    });
  }

  initializeBeacons(data) {
    let lthis = this;
    this.beacons = [];
    console.log(data);

    let beaconList = data.beacons;
    console.log("set beacons")
    beaconList.forEach((beacon) => {
      let beaconObject = new Beacon(beacon);
      console.log(beaconObject)
      this.beacons.push(beaconObject);
    });
    console.log("set closests beacon")
    this.setClosestBeacon(data)
    console.log(this.closestBeacon)
  }

  chooseListenAction(exhibitionBeaconNumber) {
    if( this.noBeaconAvailable() ) { return }
    if(this.closestBeacon.minor != exhibitionBeaconNumber){
      this.presentItem()
    }else{
      this.presentUnlockExhibition()
    }
  }

  noBeaconAvailable() 
  {
    return !this.closestBeacon || this.closestBeacon.minor == this.lastTriggeredBeaconNumber
  }

  setClosestBeacon(data)
  {
    if(this.beacons.length)
    {
      this.closestBeacon = this.beacons[0];
      for(let b of this.beacons)
      {
        if(b.distance < this.closestBeacon.distance )
        {
          this.closestBeacon = b;
        }
      }
      //this.closestBeacon = this.beacons.filter(beacon => beacon.proximity == 'ProximityImmediate')[0]
    }

  }

  presentItem() {
    console.log("presentItem: "+this.triggeredBeaconNumber.indexOf(this.closestBeacon.minor));
    if(this.exhibition.unlocked && this.isAvailablepresentItem(this.closestBeacon.minor) && !this.stopReadBeacon){
      this.setLastTriggeredBeacon()
      this.showOpenItemAlert(this.closestBeacon.minor, this.exhibition.id)
      this.stopItemBeaconActions()
    }
  }
  getPresentItem(minorId){
    let idx = this.itemsExhibition.findIndex(d =>{
      return d.beacon == minorId;
    })
    return idx !== -1 ? this.itemsExhibition[idx] : idx;
  }
  isAvailablepresentItem(minorId){
    return this.getPresentItem(minorId) !== -1 && this.triggeredBeaconNumber.indexOf(minorId) == -1;
  }
  stopItemBeaconActions() {
    this.events.publish('stopVideo')
    this.events.publish('stopRanging')
  }


  presentUnlockExhibition() {
    this.setDefaultLockedValue()
    if(this.isLocked()){
      this.setLastTriggeredBeacon()
      this.unlockExhibition(this.exhibition.id)
    }
  }

  setDefaultLockedValue() {
    if(this.exhibition.unlocked === undefined){
      this.exhibition.unlocked = false
    }
  }

  isLocked() {
    let exhibitionBeaconNumber = parseInt(this.exhibition.beacon)
    return !this.exhibition.unlocked && exhibitionBeaconNumber == this.closestBeacon.minor
  }

  unlockExhibition(exhibitionId) {
    this.storage.getItem(exhibitionId).then(exhibition => {
      //let isunlock = exhibition.unlocked;
      this.exhibition.unlocked = exhibition.unlocked = true;
      this.storage.setItem(exhibitionId, exhibition).then(() => {
        /*if (!isunlock){
          this.showExhibitionUnlockedAlert()
        }*/
        this.events.publish('exhibitionUnlocked')
      })
    })
  }

  setLastTriggeredBeacon() {
    this.lastTriggeredBeaconNumber = this.closestBeacon.minor
    if (this.triggeredBeaconNumber.indexOf(this.closestBeacon.minor) == -1){
      this.triggeredBeaconNumber.push(this.lastTriggeredBeaconNumber);
    }
  }

  retrieveItemByBeacon(beaconNumber, exhibitionId) {
    this.events.publish('retrieveItemByBeacon', {beaconNumber: beaconNumber, exhibitionId: exhibitionId})
  }


  askForAuthorizations() {
    this.ibeacon.requestAlwaysAuthorization();
    this.ibeacon.requestWhenInUseAuthorization();
  }

  setRegion() {
    this.region = this.ibeacon.BeaconRegion('deskBeacon', 'A7AE2EB7-1F00-4168-B99B-A749BAC1CA64');
    //this.region = this.ibeacon.BeaconRegion('deskBeacon', '74278BDA-B644-4520-8F0C-720EAF059935');
  }

  cleanLastTriggeredBeacon() {
    this.lastTriggeredBeaconNumber = null;
    this.triggeredBeaconNumber = [];
  }

  showExhibitionUnlockedAlert() {
    let messages;

    this.translate.get('BEACONS.EXHIBITION_UNLOCKED_ALERT').subscribe(data => {
      messages = data
    })

    let alert = this.alertCtrl.create({
      title: messages['TITLE'],
      message: messages['BODY'],
      buttons: [
        {
          text: messages['BUTTONS']['OK'],
          handler: () => {
          }
        }
      ]
    });
    alert.present();
  }

  showOpenItemAlert(beaconNumber, exhibitionId) {
    let messages;

    this.translate.get('BEACONS.ALERT').subscribe(data => {
      messages = data
    })
    let item = this.getPresentItem(beaconNumber);
    let alert = this.alertCtrl.create({
      title: item !== -1 ? item.name : messages['TITLE'] + ' ' + beaconNumber,
      message: messages['BODY'],
      buttons: [
        {
          text: messages['BUTTONS']['NO'],
          role: 'cancel',
          handler: () => {
            this.events.publish('startRanging')
            console.log('Cancel clicked');
          }
        },
        {
          text: messages['BUTTONS']['YES'],
          handler: () => {
            //this.stopReadBeacon = true;
            this.retrieveItemByBeacon(beaconNumber, exhibitionId)
            this.events.publish('startRanging')
          }
        }
      ]
    });
    alert.present();
  }

}
