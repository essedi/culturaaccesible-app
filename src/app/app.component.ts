import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { TasksServiceProvider } from '../providers/tasks-service/tasks-service';
import {NetworkProvider} from '../providers/network/network';
import {GlobalProvider} from '../providers/global/global';

import {SQLite} from '@ionic-native/sqlite';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = 'ExhibitionList';
    


    pages: Array<{title: string, component: any, id: string}>;

    constructor(public platform: Platform,
        public statusBar: StatusBar,
        public splashScreen: SplashScreen,
        public translate: TranslateService,
        public networkProvider: NetworkProvider,
        private global: GlobalProvider,
        public sqlite: SQLite,
        private database: TasksServiceProvider,



        ) {

        var language = navigator.language.split('-')[0]

        translate.setDefaultLang('en');
        translate.use(language);

        this.initializeApp();
        translate.get('MENU').subscribe(data => {

          this.pages = [
              { title: data['EXHIBITIONS'], component: 'ExhibitionList', id: 'exhibitions' }
          ];

        })
    }

    initializeApp() {
        this.platform.ready().then(() => {
            
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
           
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.networkProvider.initializeNetworkEvents();

        });
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }
    
    
    

    
    
  
  
}
