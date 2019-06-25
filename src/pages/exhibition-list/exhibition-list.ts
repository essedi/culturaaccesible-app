import { Component ,Inject} from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams, LoadingController, ToastController, Events, Platform } from 'ionic-angular';
import { ExhibitionsProvider } from '../../providers/exhibitions/exhibitions';
import { NativeStorage } from '@ionic-native/native-storage';
import { TranslateService } from '@ngx-translate/core';
import { DownloadProvider } from '../../providers/downloader/downloader';
import { EnvVariables } from '../../app/environment-variables/environment-variables.token';
import { PurchaseProvider } from '../../providers/purchase/purchase'
import {GpsProvider} from '../../providers/gps/gps';

@IonicPage()
@Component({
  selector: 'page-exhibition-list',
  templateUrl: 'exhibition-list.html',
})
export class ExhibitionList {
  exhibitions: Array<Object>
  allExhibitions: Array<Object>
  hasExhibitions: boolean
  storedData;
  loading;
  payed: boolean = false;
  purchases: any[] = [];


  public loadProgress : number = 0;  
  private url: string = this.envVariables.baseUrl;



  constructor(
            public navCtrl: NavController,
            public alertCtrl: AlertController,
            public navParams: NavParams,
            public events: Events,
            public platform: Platform,
            public loadingCtrl: LoadingController,
            public toastCtrl: ToastController,
            private nativeStorage: NativeStorage,
            public translate: TranslateService,
            private service: ExhibitionsProvider,
            private gpsProvider: GpsProvider,
            private downloader: DownloadProvider,
            private purchaseProvider: PurchaseProvider,
            @Inject(EnvVariables) private envVariables) { 
            

            events.subscribe('retrievePremiumExhibition', (data) => {
                //this.download(data.id, data.isoCode)
                this.purchases.push(data);
            }) 

           /* this.platform.resume.subscribe((result)=>{//Foreground
                   console.log("platform resume");
                  this.gpsProvider.startBackgroundGeolocation();

            });
            this.platform.pause.subscribe((result)=>{//Background
                     console.log("platform pause");
                     this.gpsProvider.startBackgroundGeolocation();
            })*/
              
   }
   
   checkIfPayed(exhibition){
              
       if( this.purchases && exhibition.premium == true){

            for(let purchase of this.purchases)
            {
                if(purchase.id === exhibition.productId ){

                   return true;
                }
            }
            
        }
        return false;
   }

 
             
  ionViewDidEnter() {
    this.getStoredData()
    this.events.publish('stopRanging')
    this.events.publish('cleanLastTriggeredBeacon')
    console.log("entered");
   }
   

  getStoredData() {
    if (this.platform.is('cordova')) {
      this.nativeStorage.keys().then((data) => {
        this.storedData = data
        this.setExhibtitions()
      })
    }else {
      this.storedData = []
      this.setExhibtitions()
    }
  }

  setExhibtitions() {
      
    this.service.retrieveList().subscribe(exhibitions => {
      console.log(exhibitions);
      if(exhibitions.length > 0){
        this.hasExhibitions = true
        this.allExhibitions = exhibitions
        console.log("show exibition ")
        this.filterExhibitions()
      }else {
        this.showNoExhibitionMessage()
      }
    })
  }

  showNoExhibitionMessage() {
    this.hasExhibitions = false
  }
  
  purchaseExhibition(exhibition){
      
    this.purchaseProvider.getProducts(exhibition);
      
  }

  isDownloaded(exhibition) {
    return this.storedData.some(id => id === exhibition.id)
  }

  filterExhibitions() {
    let activeExhibitions: Array<Object> = []

    for (let exhibition of this.allExhibitions) {
      if (exhibition['show']) {
        activeExhibitions.push(exhibition)
      }
    }

    this.exhibitions = activeExhibitions
  }

  download(exhibition, isoCode) {
    let lthis = this;
    //this.presentLoading()
    this.loaderBarFunction(exhibition);

    this.service.download(exhibition.id, isoCode).then((exhibition:any) => {
      let object = JSON.parse(exhibition.data);
      
      this.extractItems(object);
    }, error => {
      console.log(error);
      console.log(JSON.stringify(error))
      lthis.loading.dismiss();
    })
  }

  saveInLocal(exhibition) {
    this.nativeStorage.setItem(exhibition.id, exhibition)
      .then(
        () => {
          console.log('Stored item!')
        },
        error => {
          console.error('Error storing item', error)
        }
      );
  }

  extractItems(exhibition){
    let items = []
    exhibition.items.forEach(item => {
      items.push(item)
      item.children.forEach(child => {
        items.push(child)
        child.children.forEach(subchild => {
          items.push(subchild)
        })
      })
    })
    items.sort((a: any, b: any)=>{
        return parseInt(a.beacon) > parseInt(b.beacon) ? 1 : -1;
    });
    setTimeout(()=>{
      console.log("items");
      console.log(items);
      this.nativeStorage.setItem(exhibition.id + '-items', items)
      this.downloadMedia(exhibition, items)
    }, 1500)
  }

  downloadMedia(exhibition, items) {
    this.saveInLocal(exhibition)
    this.getStoredData()
    this.loading.dismiss()
    /*Promise.all(
      items.map((object) => {
        return this.downloader.download(object.video, object.id)
      })
    ).then((items) => {
      this.saveInLocal(exhibition)
      this.getStoredData()
      this.loading.dismiss()
    }).catch((error) => {
      this.loading.dismiss()
      this.presentError()
    })*/
  }

  delete(exhibition) {
    this.nativeStorage.remove(exhibition.id).then(() => {
      this.presentLoading()
      this.getStoredData()
    })
    this.nativeStorage.getItem(exhibition.id + '-items').then(items => {
      this.downloader.deleteMedia(items)
    })
    this.nativeStorage.remove(exhibition.id + '-items').then(done => {
      this.loading.dismiss();
    },error =>{
      this.loading.dismiss();
    })
    
     //this.loadProgress = 0;
     var x = document.getElementById('myProgressBar'+exhibition.id);
     x.style.display = "none";


  }

  askLanguage(exhibition) {
    let messages;

    this.translate.get('EXHIBITIONS.LIST.ALERT').subscribe(data => {
      messages = data
    });

    var isoCodeTranslations = {
      'es': 'Castellano',
      'cat': 'Valencià',
      'en': 'English'
    }

    let alert = this.alertCtrl.create({
      title: messages['TITLE'],
      message: messages['BODY'],
      buttons: [
        {
          text: messages['BUTTONS']['NO'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: messages['BUTTONS']['YES'],
          handler: (isoCode) => {
            this.download(exhibition, isoCode)
          }
        }
      ]
    });
    exhibition.iso_codes.forEach((locale) => {
      alert.addInput({type: 'radio', label: isoCodeTranslations[locale], value: locale})
    })
    alert.present();
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    this.loading.present();
  }

  presentError() {
    let toast = this.toastCtrl.create({
      message: 'Ha habido un error',
      duration: 3000,
      position: 'bottom',
      cssClass: 'active'
    });

    toast.present();
  }




    loaderBarFunction(exhibition)
    {

        const tag = document.createElement('script');
        const xhr = new XMLHttpRequest();
        var url = `${this.envVariables.baseUrl}/api/exhibition/download`;
        
        xhr.open('POST', url , true);
        xhr.responseType = 'arraybuffer';
        xhr.onloadend = (e) => document.head.appendChild(tag);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(JSON.stringify({"iso_code": "es" , "id" : exhibition.id }));

        const barElement = document.getElementById('myProgressBar'+exhibition.id);
        barElement.style.display = "block";
 
        xhr.onprogress = (e) => {

          if (e.lengthComputable) {
              
            const width = 100 * e.loaded / + e.total;
            this.loadProgress = width;
            barElement.style.width = width + '%';

          }
        }
  }
  
  
  goToDetail(exhibition) {
    this.nativeStorage.getItem(exhibition.id)
      .then(
        exhibition => {
          console.log(exhibition.id);
          this.navCtrl.push('ExhibitionDetail', {exhibition: exhibition})
        })
      .catch(
        error => {
          this.askLanguage(exhibition)

        });
  }

  goToMuseum(museumId) {
    this.navCtrl.push('MuseumDetail', {id: museumId})
  }
}
