import { Component, ViewChild } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, Platform , Events} from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { TranslateService } from '@ngx-translate/core';
import {GpsProvider} from '../../providers/gps/gps';
import BackgroundGeolocation from "cordova-background-geolocation-lt";


//declare var google; 
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  LatLng,
  LocationService,
  MarkerOptions,
  MyLocation,
  GoogleMapOptions,
  GoogleMapControlOptions,
  Marker
} from "@ionic-native/google-maps";


@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

    exhibition;
    items: Array<Object>;
    @ViewChild('map') element;
    loading;
    marker;
 
  constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public platform: Platform,
        public events: Events,
        public loadingCtrl: LoadingController,
        public translate: TranslateService,
        private geolocation: Geolocation,
        private gpsProvider: GpsProvider,
        public googleMaps: GoogleMaps) {
      
        this.items= this.navParams.get('items');
        this.exhibition= this.navParams.get('exhibition');

        events.subscribe('goToItemDetail', (data) => {
          this.goToItemView(data.index)
        })
        
        
       events.publish('videoParent', { page: "map"})

        console.log( this.items," this.items");
        
        this.platform.ready().then(() => {
         
            this.presentLoading();
            this.getPosition();

            this.gpsProvider.itemsExhibition =  this.items;
            this.gpsProvider.exhibition = this.exhibition;

             if(this.exhibition.unlocked)
            {
               // move this Up if want to show items always
               this.gpsProvider.unlockExhibition(this.exhibition.id);
               
            }
        });
        
    }

    presentLoading() {
        this.loading = this.loadingCtrl.create({
          content: 'Please wait...'
        });

        this.loading.present();
     }

     ionViewWillUnload() {
        
         console.log("ionViewWillUnload on map");
      
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
  
    getPosition():any{
        
        var opt =
        {
            enableHighAccuracy: false
        }
                  
        LocationService.getMyLocation(opt).then((myLocation: MyLocation) => {

          this.initMap(myLocation);

        });
    }
    
    
    initMap(position: MyLocation) {

         let latitude = position.latLng.lat;
         let longitude = position.latLng.lng;
         
         let options: GoogleMapOptions = {
          camera: {
            target: position.latLng,
            zoom: 10,
            tilt: 30,
          },
          controls: {
            myLocationButton : true,
            myLocation: true,
          }
        };
        
         let map = GoogleMaps.create(this.element.nativeElement, options);
         let message;
         
         this.translate.get('EXHIBITIONS.MAP').subscribe(data => {
             message = data
         })

         map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {
            
            console.log(data, " MAP");
                  
            if(this.items.length){
                
                console.log(this.items, "this.items");

                for(let item of this.items)
                {
                    let coordinates: LatLng = new LatLng(item['lat'], item['lng']);
                 
                    let markerOptions: MarkerOptions = {
                        
                      position: coordinates,
                      title: item['name']
                    };

                     const marker = map.addMarker(markerOptions)
                      .then((marker: Marker) => {
                                                  
                          marker.showInfoWindow();
                    });
                }
            }
            this.loading.dismiss();
        })
        
    }
    
 
      

}