import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { EnvVariables } from '../../app/environment-variables/environment-variables.token';
import { Events } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import {ApiProvider} from '../api/api';

@Injectable()
export class ItemsProvider {

  constructor(public http: Http,
              public events: Events,
              private storage: NativeStorage,
              public api : ApiProvider,
              @Inject(EnvVariables) private envVariables) {
    events.subscribe('retrieveItemByBeacon', (data) => {
      this.retrieveByBeacon(data.beaconNumber, data.exhibitionId)
    })
  }

  retrieveList(exhibition_id) {
      let headers    = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
      let options    = new RequestOptions({ headers: headers });
      let payload = {"exhibition_id": exhibition_id};
      
      return this.api.post('api/exhibition/items', 'items' ,payload, options);
  }

  retrieveByBeacon(beaconNumber, exhibitionId) {
      this.storage.getItem(exhibitionId + '-items').then(items => {
          let item = items.find(item => item.beacon == beaconNumber )
          let index = items.indexOf(item)
          this.events.publish('goToItemDetail', {item: item, index: index})
      })
  }
}
