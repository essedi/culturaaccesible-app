import { Injectable ,Inject} from '@angular/core';

import { HttpParams} from '@angular/common/http';
import {HttpClient} from '@angular/common/http';

import { Http, Headers, RequestOptions } from '@angular/http';
import { HTTP } from '@ionic-native/http';
//import { Http } from '@angular/http';
import {Network} from '@ionic-native/network';
import {TasksServiceProvider} from '../tasks-service/tasks-service';
import {Observable} from "rxjs/Observable"
import {Events} from 'ionic-angular';
import { EnvVariables } from '../../app/environment-variables/environment-variables.token';
import {GlobalProvider} from '../global/global';


@Injectable()
export class ApiProvider {

     private url: string = this.envVariables.baseUrl;

constructor(

        public http: Http,
        private database: TasksServiceProvider,
        private global: GlobalProvider,
        private events: Events,

         @Inject(EnvVariables) private envVariables
    )
    {

    }


    post(endpoint: string, typeClass: any ,body?: any, options?: any, cache: boolean = true)
    {
        
        console.log('111', cache, this.database.getDatabase(), this.global.isOnline() );
        
        if (cache && this.database.getDatabase() != null  &&  !this.global.isOnline() )
        {
            //offlinethis.global.isOnline() 

             return new Observable<any>((obs) =>
            {
                this.database.getResponse(this.getEndpoint(endpoint, body)).then(
                    (res) =>
                    {

                        if (res != null)
                        {
                            console.log("Gets call from local", this.getEndpoint(endpoint, body), "data", JSON.parse(res));

                            obs.next(JSON.parse(res));
                            
                         
                            
                        } else
                        {
                            let resp = {name: "no network", message: "error.network", error: {error: "network"}};
                            obs.error(resp);
                        }
                        obs.complete();
                    }).catch(error =>
                    {
                        obs.error(error);
                        obs.complete();
                    });
            });
            
        } else
        {
            
          
            
            console.log("no sqlite");
  
            let result = this.http.post(this.url + '/' + endpoint, body ,options).map(typeClass => typeClass.json());

            //get result and save local
            result.subscribe(
                (resp) =>
                {
                    if (this.database.getDatabase() != null)
                    {
                        this.database.registerResponse(this.getEndpoint(endpoint, body), resp);
                    }
                },
                (err) =>
                {
                }
            );

            return result;
                    
        }
    }
    

    put(endpoint: string, body: any, options?: any)
    {
        return this.http.put(this.url + '/' + endpoint, body, options);
    }

    delete(endpoint: string, options?: any)
    {
        return this.http.delete(this.url + '/' + endpoint, options);
    }

    patch(endpoint: string, body: any, options?: any, url = this.url)
    {
        return this.http.put(url + '/' + endpoint, body, options);
    }

    public getUrl()
    {
        return this.url;
    }

    public getEndpoint(url, params = null)
    {
        let opt = null;
        if (params)
        {
            opt = '?';
            for (let key in params)
            {
                opt += key + "=" + params[key] + "&";
            }
        }
        return this.getUrl() + '/' + url + (opt === null ? '' : opt)
    }

}
