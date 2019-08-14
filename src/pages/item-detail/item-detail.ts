import { Component, NgZone } from '@angular/core';
import { Platform, Events, IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { ItemsProvider } from '../../providers/items/items'
import { BeaconProvider } from '../../providers/beacons/beacons'
import { DownloadProvider } from '../../providers/downloader/downloader'
import { NativeStorage } from '@ionic-native/native-storage';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html',
})
export class ItemDetail {
  position = 0;
  previousButton;
  nextButton;
  exhibitionId;
  items;
  item;
  fromExhibitionItem;
  video;
  action = 'play';
  ngZone;
  parentPage;
  exhibition;

  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              public platform: Platform,
              public events: Events,
              public storage: NativeStorage,
              public beaconProvider: BeaconProvider,
              private downloader: DownloadProvider,
              public navParams: NavParams,
              private service: ItemsProvider) {
              
    this.ngZone = new NgZone({enableLongStackTrace: false})

    events.subscribe('refreshItemPage', (data) => {
      this.item = null

      this.ngZone.run(() => {
        setTimeout(() => {
          this.position = data.index
          this.item = this.items[this.position]
          this.enableNavButtons()
          this.disableIfFirstItem()
          this.disableIfLastItem()
        }, 100)
      })
    })

    events.subscribe('stopVideo', (data) => {
      //this.viewCtrl.dismiss()
      this.pause();
      this.video.webkitExitFullScreen();
    })
        
   console.log(this.navCtrl, "DATA navCtrl");

    events.subscribe('videoParent', (data) => {
        
        console.log( "in item event");

        if(data.page == "map")
        {
            console.log( "event page map");
            this.parentPage = "map";
            this.exhibition = data.exhibition;
            //this.navCtrl.insert(insertIndex, page)
            
        }else
        {
            console.log( "event page exhibition");
            this.parentPage = "exhibition";
        }
    })
    
    
  }
  
  ionViewDidLeave()
  {
     //this.navCtrl.push('MapPage', {items: this.items, exhibition: this.exhibition })
    //this.events.unsubscribe('videoParent');
      console.log("Leaving");
       
      if( this.parentPage == "map"){
           
            this.navCtrl.insert(-1, 'MapPage', {items: this.items, exhibition: this.exhibition })
      }

  }

  ionViewDidLoad() {
    this.exhibitionId = this.navParams.get("exhibitionId")
    let index = this.navParams.get("index")

    if(index){
      this.position = index
    }

    this.storage.getItem(this.exhibitionId + '-items').then(items => {
      if(items.length > 0){
        this.item = items[this.position]
        /*if(this.downloader.checkFile(this.item.id)){
          this.item.video = this.downloader.storageDirectory + this.item.id + '-video.mp4'
        }*/
        this.disableIfFirstItem()
        this.disableIfLastItem()
      }
    })

    this.video = document.getElementById("myVideo");
    this.previousButton = <HTMLInputElement> document.getElementsByClassName('previous')[0]
    this.nextButton = <HTMLInputElement> document.getElementsByClassName('next')[0]
    setTimeout(()=> {
      this.video.load()
    }, 500)
  }
  
  


  play() {
    this.video.play()
    this.action = 'pause'
  }

  pause() {
    this.video.pause()
    this.action = 'play'
  }

  togglePlay() {
    if(this.video.paused === true){
      this.play()
    } else {
      this.pause()
    }
  }

  enableNavButtons() {
    this.previousButton.disabled = false
    this.nextButton.disabled = false
  }

  disableIfLastItem() {
    if(this.items.length - 1 == this.position) {
      this.nextButton.disabled = true
    }
  }

  disableIfFirstItem(){
    if(this.position == 0)  {
      this.previousButton.disabled = true
    }
  }

  goToNextItem(){
    this.position += 1
    this.previousButton.disabled = false
    this.disableIfLastItem()
    this.action = 'play'
    this.item = this.items[this.position]
    this.video.load()
  }

  goToPreviewItem(){
    this.position -= 1
    this.nextButton.disabled = false
    this.disableIfFirstItem()
    this.action = 'play'
    this.item = this.items[this.position]
    this.video.load()
  }

}
