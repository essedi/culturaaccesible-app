import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';


//declare var google; 
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  LatLng,
  MarkerOptions,
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


  constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public platform: Platform,
        private geolocation: Geolocation,
        public googleMaps: GoogleMaps,) {
      
        this.items= this.navParams.get('items');
        console.log( this.items," this.items");
         
  }

  ionViewDidLoad() 
  {
     this.platform.ready().then(() => {
       this.getPosition();
    });
   
    
  }
  
    getPosition():any{
        this.geolocation.getCurrentPosition().then(response => {
            
            this.initMap(response);
        })
        .catch(error =>{
          console.log(error);
        })
    }
    
    
    initMap(position: Geoposition) {

         let latitude = position.coords.latitude;
         let longitude = position.coords.longitude;
         let map = GoogleMaps.create(this.element.nativeElement);

         map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {
            
           console.log(map, " MAP");
           let coordinates: LatLng = new LatLng(latitude, longitude);

           let position = {
             target: coordinates,
             zoom: 17
           };
           
           map.animateCamera(position);


           let markerOptions: MarkerOptions = {
             position: coordinates,
             title: 'your location',
             icon: '../../../resources/red-circle.png',
           };

           const marker = map.addMarker(markerOptions)
             .then((marker: Marker) => {
               marker.showInfoWindow();
           });
           

            if(this.items.length){
       
                for(let item of this.items){

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

        })
      }

}
