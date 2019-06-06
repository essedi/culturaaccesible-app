//import {HttpClient} from '@angular/common/http';
import { Http } from '@angular/http';

import {Injectable} from '@angular/core';
import {AlertController, Events} from 'ionic-angular';
import {Network} from '@ionic-native/network';
import {TasksServiceProvider, DATABASE_TYPE_CALL_IMAGE, DATABASE_TYPE_CALL_POST} from '../tasks-service/tasks-service';
import {GlobalProvider} from '../global/global';
//import {PartService, PartImageModel} from '../services/part';

@Injectable()
export class NetworkProvider
{
    previousStatus: boolean;
    constructor(
      //  public http: HttpClient,
        public http: Http,
        public database: TasksServiceProvider,
        public alertCtrl: AlertController,
        public network: Network,
        public eventCtrl: Events,
        private global: GlobalProvider,
       // private part_service: PartService
    )
    {
        console.log("NetworkProvider: charged");
        this.global.setOnlie(true);
        this.previousStatus = this.global.isOnline();
    }

    public initializeNetworkEvents(): void
    {
        
        this.database.createDatabase();
        
         console.log("NetworkProvider", this.network );
                console.log("NetworkProvider: type", this.network.type);
                if (this.network.type == this.network.Connection.NONE)
                {
                    this.global.setOnlie(false);
                } else
                {
                    //this.checkRecords().then(() => {}, () => {});
                    this.checkCalls();
                }
                this.network.onDisconnect().subscribe(() =>
                {
                    this.global.setOnlie(false);
                    console.log("NetworkProvider: network disconnect");
                });
                this.network.onConnect().subscribe(() =>
                {
                    this.global.setOnlie(true);
                    this.checkCalls();
                    console.log("NetworkProvider: network connect");
                });
         /*this.database.createDatabase().then(
            () =>
            {
                console.log("NetworkProvider", this.network );
                console.log("NetworkProvider: type", this.network.type);
                if (this.network.type == this.network.Connection.NONE)
                {
                    this.global.setOnlie(false);
                } else
                {
                    //this.checkRecords().then(() => {}, () => {});
                    this.checkCalls();
                }
                this.network.onDisconnect().subscribe(() =>
                {
                    this.global.setOnlie(false);
                    console.log("NetworkProvider: network disconnect");
                });
                this.network.onConnect().subscribe(() =>
                {
                    this.global.setOnlie(true);
                    this.checkCalls();
                    console.log("NetworkProvider: network connect");
                });
            },
            () => {}
        );*/
    }
    private checkCalls()
    {
        console.log("NetworkProvider: checkRecords");

        if (this.database.getDatabase() != null)
        {
            this.database.getAllCalls().then(
                (res: any[]) =>
                {
                    console.log("NetworkProvider: calls", res);

                    if (res && res.length)
                    {
                        this.saveCalls(res).then(
                            (res) =>
                            {
                            },
                            () =>
                            {

                            }
                        );
                    }
                })
                .catch(error =>
                {
                    console.log(error);
                })
        }
    }

    private saveCalls(stack: any[], parentId: number = null)
    {
        let item = stack[0];
        stack.shift();
        let lthis = this;
        return new Promise(function (resolve, reject)
        {
           lthis.saveCalls(stack).then(
                (res) =>
                {
                    console.log(res, "savedCalls");
                    resolve(res);
                },
                (err) =>
                {   
                    console.log(err, "no saved call");
                    reject(err);
                }
            );

        });
    }
}