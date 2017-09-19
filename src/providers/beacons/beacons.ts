import { Injectable } from '@angular/core';
import { Platform, Events, AlertController } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import { TranslateService } from '@ngx-translate/core';

import { Beacon } from '../../models/beacon';

@Injectable()
export class BeaconProvider {

  delegate: any;
  region: any;
  beacons: Beacon[] = [];
  lastTriggeredBeaconNumber: number;

  constructor(public platform: Platform,
              public events: Events,
              public translate: TranslateService,
              public alertCtrl: AlertController,
              private ibeacon: IBeacon) {
    events.subscribe('stopRanging', (result) => {
      this.stopRanging()
    })
    events.subscribe('startRanging', (result) => {
      this.startRanging()
    })
  }

  initialise(): any {
    let promise = new Promise((resolve, reject) => {
      // we need to be running on a device
      if (this.platform.is('cordova')) {

        // Request permission to use location on iOS
        this.ibeacon.requestAlwaysAuthorization();

        // create a new delegate and register it with the native layer
        this.delegate = this.ibeacon.Delegate();

        this.delegate.didRangeBeaconsInRegion()
          .subscribe(
            data => this.events.publish('didRangeBeaconsInRegion', data),
            error => console.error()
          );
        // setup a beacon region
        this.region = this.ibeacon.BeaconRegion('deskBeacon', '74278BDA-B644-4520-8F0C-720EAF059935');

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

  stopRanging(){
    this.ibeacon.stopRangingBeaconsInRegion(this.region)
  }

  startRanging(){
    this.ibeacon.startRangingBeaconsInRegion(this.region)
  }

  listenToBeaconEvents(exhibitionId) {
    this.events.subscribe('didRangeBeaconsInRegion', (data) => {

      this.beacons = [];

      let beaconList = data.beacons;
      beaconList.forEach((beacon) => {
        let beaconObject = new Beacon(beacon);
        this.beacons.push(beaconObject);
      });

      let closestBeacon = this.beacons.filter(beacon => beacon.proximity == 'ProximityImmediate')[0]
      if(closestBeacon && closestBeacon.minor != this.lastTriggeredBeaconNumber){
        this.lastTriggeredBeaconNumber = closestBeacon.minor
        this.events.publish('stopVideo')

        this.presentAlert(closestBeacon.minor, exhibitionId)

        this.events.publish('stopRanging')
      }
    });
  }

  retrieveItemByBeacon(beaconNumber, exhibitionId) {
    this.events.publish('retrieveItemByBeacon', {beaconNumber: beaconNumber, exhibitionId: exhibitionId})
  }

  presentAlert(beaconNumber, exhibitionId) {
    let messages;

    this.translate.get('BEACONS.ALERT').subscribe(data => {
      messages = data
    })

    let alert = this.alertCtrl.create({
      title: messages['TITLE'] + ' ' + beaconNumber,
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
            this.retrieveItemByBeacon(beaconNumber, exhibitionId)
            this.events.publish('startRanging')
          }
        }
      ]
    });
    alert.present();
  }
}
