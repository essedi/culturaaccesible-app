import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { InAppPurchase } from '@ionic-native/in-app-purchase';
import { LoadingController, ToastController, Events, Platform } from 'ionic-angular';


@Injectable()
export class PurchaseProvider {
    
  itemsExhibition: any[] = [];
  exhibition: any;


  constructor(private iap: InAppPurchase,
              public platform: Platform,
              public events: Events,
              public loader: LoadingController,
              public toastCtrl: ToastController
  ) {
    console.log('Hello PurchaseProvider Provider');
  }
  
  

  getProducts(exhibition){
      
    this.exhibition = exhibition;
            
    this.iap.getProducts(['exhibicion1']).then((products) => {
          
          console.log(products, "products");
          this.buyProducts(products);
          
        })
        .catch((err) => {
          console.log(err);
        });
        
  }
  
  
  buyProducts(products){
      
    for(let product of products){
        
         this.iap
        .buy(product.productId.toString())
        .then(function (data) {
          console.log(JSON.stringify(data));
          // The consume() function should only be called after purchasing consumable products
          // otherwise, you should skip this step
          return this.iap.consume("consumable", data.receipt, data.signature);
        })
        .then(function () {
            
          console.log('consume done!');           
          this.events.publish('retrievePremiumExhibition', {id : this.exhibition.id })

        })
        .catch(function (err) {
          console.log(err);
        });
        
    }
  }
  
  
  

}
