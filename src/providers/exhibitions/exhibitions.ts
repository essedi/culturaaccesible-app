import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { EnvVariables } from '../../app/environment-variables/environment-variables.token';
import { HTTP } from '@ionic-native/http';

import { TasksServiceProvider } from '../tasks-service/tasks-service';
import { GlobalProvider} from '../global/global';
import {ApiProvider} from '../api/api';



@Injectable()
export class ExhibitionsProvider {
    exhibitions: Array<Object>;
    private url: string = this.envVariables.baseUrl;


    constructor(private http: Http,
                private http2: HTTP,
                private global: GlobalProvider,
                private database: TasksServiceProvider,
                public api : ApiProvider,
                @Inject(EnvVariables) private envVariables) {}
                

   /* retrieveList2() {
        let headers    = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        let options    = new RequestOptions({ headers: headers });
        let isoCode = navigator.language.split('-')[0]
        let payload = {"iso_code": isoCode}
        let url = `${this.envVariables.baseUrl}/api/exhibition/translated-list`;
        return this.http.post(url, payload, options).map(exhibitions =>
            exhibitions.json()
        )
    }*/
    
    
     retrieveList() {
        let headers    = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        let options    = new RequestOptions({ headers: headers });
        let isoCode = navigator.language.split('-')[0]
        let payload = {"iso_code": isoCode}        
        
        return this.api.post('api/exhibition/translated-list', 'exhibitions' ,payload, options);
    }
    

    retrieve(id) {
        let headers    = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        let options    = new RequestOptions({ headers: headers });
        let payload = {"id": id}
        
        return this.api.post('api/exhibition/retrieve', 'exhibitions' ,payload, options);
    }
    download(id, isoCode) {
      let headers    = {'Content-Type': 'application/x-www-form-urlencoded'};
      let url = `${this.envVariables.baseUrl}/api/exhibition/download`;
      let payload = {"id": id, "iso_code": isoCode};
      this.http2.setDataSerializer("json");
      console.log(url, " url http");
      return this.http2.post(url, payload, headers);
    }
    download2(id, isoCode) {
        let headers    = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        let options    = new RequestOptions({ headers: headers });
        let payload = {"id": id, "iso_code": isoCode}
        
        return this.api.post('api/exhibition/download', 'exhibitions' ,payload, options);

    }
}
