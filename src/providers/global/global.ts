import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Globalization, GlobalizationOptions} from '@ionic-native/globalization';



@Injectable()
export class GlobalProvider
{
    private timezone: string = "Europe/Madrid";
    private dateFormat: string = null;

    private paused: boolean = false;
    private online: boolean = true;

    constructor(
        private translate: TranslateService,
        private globalization: Globalization
    )
    {
    }
    loadDate()
    {
        this.getDeviceTimezone();
    }
    getDeviceTimezone()
    {
        let opt: GlobalizationOptions =
        {
            formatLength: '',
            selector: ''
        };
        this.globalization.getDatePattern(opt).then(
            (res) =>
            {
                this.timezone = res.iana_timezone;
            },
            (err) =>
            {
                console.error("Unexpected error getting device date pattern", err);
            }
        );
    }
    getTimezone()
    {
        return this.timezone;
    }
    setTimezone(zone: string): this
    {
        this.timezone = zone;
        return this;
    }

    getPaused()
    {
        return this.paused;
    }
    setPaused(paused: boolean)
    {
        this.paused = paused;
        return this;
    }
    isOnline(): boolean
    {
        return this.online ? true : false;
    }
    getOnlne()
    {
        return this.online;
    }
    setOnlie(online: boolean)
    {
        this.online = online;
        return this;
    }
}
