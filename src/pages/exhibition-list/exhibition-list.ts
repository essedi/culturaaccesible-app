import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams } from 'ionic-angular';
import { ExhibitionsProvider } from '../../providers/exhibitions/exhibitions';
import { NativeStorage } from '@ionic-native/native-storage';
import { TranslateService } from '@ngx-translate/core';

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

    constructor(public navCtrl: NavController,
                public alertCtrl: AlertController,
                public navParams: NavParams,
                private nativeStorage: NativeStorage,
                public translate: TranslateService,
                private service: ExhibitionsProvider) {

        this.service.retrieveList().subscribe(exhibitions => {
            if(exhibitions.length > 0){
                this.hasExhibitions = true
                this.allExhibitions = exhibitions
                this.filterExhibitions()
            }else {
                this.showNoExhibitionMessage()
            }
        })

        this.nativeStorage.keys().then((data) => {
          this.storedData = data
        })
    }

    showNoExhibitionMessage() {
        this.hasExhibitions = false
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
        console.log(activeExhibitions)
        this.exhibitions = activeExhibitions
    }

    askLanguage(exhibition) {
      let messages;

      this.translate.get('EXHIBITIONS.LIST.ALERT').subscribe(data => {
        messages = data
      });

      exhibition.languages = ['es', 'cat', 'en']
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
      exhibition.languages.forEach((locale) => {
        alert.addInput({type: 'radio', label: locale, value: locale})
      })
      alert.present();
    }

    download(exhibition, isoCode) {
      this.service.retrieve(exhibition.id, isoCode).subscribe(exhibition => {
        this.saveInLocal(exhibition)
      })
    }

    saveInLocal(exhibition) {
      this.nativeStorage.setItem(exhibition.id, exhibition)
          .then(
            () => {
              console.log('Stored item!')
            },
            error => console.error('Error storing item', error)
          );
    }

    delete(exhibition) {
      this.nativeStorage.remove(exhibition.id)
    }

    goToDetail(exhibition) {
      this.nativeStorage.getItem(exhibition.id)
        .then(
          exhibition => {
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
