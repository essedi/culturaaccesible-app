import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { AndroidPermissions } from '@ionic-native/android-permissions'
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
        private androidPermissions: AndroidPermissions

        ) {

        var language = navigator.language.split('-')[0]

        translate.setDefaultLang('en');
        translate.use(language);

        this.initializeApp();
        translate.get('MENU').subscribe(data => {

          this.pages = [
              { title: data['EXHIBITIONS'], component: 'ExhibitionList', id: 'exhibitions' }
          ];

        });
    }

    initializeApp() {
        this.platform.ready().then(() => {

            this.splashScreen.hide();
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();

            this.requestPermissions();
        });
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }

    requestPermissions()
    {

      if(!this.androidPermissions) return;

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT).then(
        result => {
          if(result.hasPermission){
            //Do nothing and proceed permission exists already
          }else{

            //Request for all the permissions in the array
            this.androidPermissions.requestPermissions(
              [
                this.androidPermissions.PERMISSION.BLUETOOTH,
                this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN,
                this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT,
                this.androidPermissions.PERMISSION.BLUETOOTH_SCAN,
                this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
                this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
                this.androidPermissions.PERMISSION.ACCESS_NETWORK_STATE,
             ]).then()
          }
        },
        err => this.androidPermissions.requestPermissions(
          [
            this.androidPermissions.PERMISSION.BLUETOOTH,
            this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN,
            this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT,
            this.androidPermissions.PERMISSION.BLUETOOTH_SCAN,
            this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
            this.androidPermissions.PERMISSION.ACCESS_NETWORK_STATE,
         ]).then()
      );
    }


}
