import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform, Events } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    
  tasks: any[] = [];


  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public platform: Platform,
              public events: Events) {
              
                console.log("in home tasks", this.tasks);
  }
  


  
}
