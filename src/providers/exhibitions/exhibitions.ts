import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { EnvVariables } from '../../app/environment-variables/environment-variables.token';
import { HTTP } from '@ionic-native/http';

@Injectable()
export class ExhibitionsProvider {
    exhibitions: Array<Object>;

    constructor(private http: Http,
                private http2: HTTP,
                @Inject(EnvVariables) private envVariables) {}

    retrieveList() {
        let headers    = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        let options    = new RequestOptions({ headers: headers });
        let isoCode = navigator.language.split('-')[0]
        let payload = {"iso_code": isoCode}
        let url = `${this.envVariables.baseUrl}/api/exhibition/translated-list`;
        return this.http.post(url, payload, options).map(exhibitions =>
            exhibitions.json()
        )
    }

    retrieve(id) {
        let headers    = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        let options    = new RequestOptions({ headers: headers });
        let url = `${this.envVariables.baseUrl}/api/exhibition/retrieve`;
        let payload = {"id": id}
        return this.http.post(url, payload, options).map(exhibitions =>
            exhibitions.json()
        )
    }
    download(id, isoCode) {
      let headers    = {'Content-Type': 'application/x-www-form-urlencoded'};
      let url = `${this.envVariables.baseUrl}/api/exhibition/download`;
      let payload = {"id": id, "iso_code": isoCode};
      this.http2.setDataSerializer("json");
      return this.http2.post(url, payload, headers);
    }
    download2(id, isoCode) {
        let headers    = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        let options    = new RequestOptions({ headers: headers });
        let url = `${this.envVariables.baseUrl}/api/exhibition/download`;
        let payload = {"id": id, "iso_code": isoCode}
        return this.http.post(url, payload, options).map(exhibitions =>
            exhibitions.json()
        )
    }
}
