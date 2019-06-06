import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { EnvVariables } from '../../app/environment-variables/environment-variables.token';

import { TasksServiceProvider } from '../tasks-service/tasks-service';
import { GlobalProvider} from '../global/global';
import {ApiProvider} from '../api/api';



@Injectable()
export class MuseumProvider {
  museums: Array<Object>;

  constructor(public http: Http,
                private global: GlobalProvider,
                private database: TasksServiceProvider,
                public api : ApiProvider,
              @Inject(EnvVariables) private envVariables) {}

 /* retrieveList() {
      let url = `${this.envVariables.baseUrl}/api/museum/list`;
      
      return this.http.post(url, '').map(museums => museums.json())

  }*/
  
  
  
    retrieveList() {
      
      return this.api.post('api/museum/list', 'museums', '');
  }

  retrieve(id) {
      let url = `${this.envVariables.baseUrl}/api/museum/retrieve`;
      let headers    = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
      let options    = new RequestOptions({ headers: headers });
      return this.http.post(url, {"id": id}, options).map(museums => museums.json())
  }

}
