import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform , Events} from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { TranslateService } from '@ngx-translate/core';
import {GpsProvider} from '../../providers/gps/gps';


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
    stopMapGps: boolean = false;
    marker;

  constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public platform: Platform,
        public events: Events,
        public translate: TranslateService,
        private geolocation: Geolocation,
        private gpsProvider: GpsProvider,
        public googleMaps: GoogleMaps,) {
      
        this.items= this.navParams.get('items');
        this.exhibition= this.navParams.get('exhibition');

        console.log( this.items," this.items");
         
  }

  ionViewDidLoad() 
  {
     this.platform.ready().then(() => {
       this.getPosition();
       
        this.gpsProvider.stopGps = false;
        this.gpsProvider.itemsExhibition =  this.items;
        this.gpsProvider.exhibition = this.exhibition;

         if(this.exhibition.unlocked)
        {
           // move this Up if want to show items always
          this.gpsProvider.unlockExhibition(this.exhibition.id);

        }
        
        this.stopMapGps= false;
        this.gpsProvider.stopGps = true;
       
       
    });
  }

   
     ionViewWillUnload() {
        

      this.events.unsubscribe('goToItemDetail')
      this.events.unsubscribe('exhibitionUnlocked')
      
    }


    ionViewDidLeave() {
        
        this.stopMapGps= true;
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
         
         let message;
       
         this.translate.get('EXHIBITIONS.MAP').subscribe(data => {
             message = data
         })

         console.log(message , "messageeeeeeeeeeeeeeee");

         map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {
            
           console.log(map, " MAP");
          
          this.refreshTime(map, message);

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
    
    mapData(map, message){
        
        console.log(this.marker, "this.marker");
        
         this.gpsProvider.getLocation().then(
        (res: any) =>
        {
           
            var latitude = res.latitude;
            var longitude = res.longitude;
            
            let coordinates: LatLng = new LatLng(latitude, longitude);
           
            var position = {
             target: coordinates,
             zoom: 17
           };
           
           map.animateCamera(position);

           let markerOptions: MarkerOptions = {
             position: coordinates,
             title: message["LOCATION"],
             icon: '../../../resources/red-circle.png',
           };
          
            if (this.marker)
            {
              this.marker.remove(); 
            }

           var marker = map.addMarker(markerOptions)
             .then((marker: Marker) => {
               marker.showInfoWindow();
                this.marker = marker;
           });
           
                        
        },(err: any)=>{
        
            
        })
        
    }
      
      
      
     refreshTime(map, message , lthis = this)
    {   
        if(this.stopMapGps == false){
            
            lthis.mapData(map, message);
            console.log("refreshed");  

            setTimeout(function ()
            {
                lthis.refreshTime(map, message,lthis);

            }, 10000);
        }
    }
  

}
