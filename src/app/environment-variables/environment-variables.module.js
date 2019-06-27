var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { EnvVariables } from './environment-variables.token';
import { devVariables } from './development';
import { prodVariables } from './production';
export function environmentFactory() {
    return process.env.IONIC_ENV === 'prod' ? prodVariables : devVariables;
}
var EnvironmentsModule = /** @class */ (function () {
    function EnvironmentsModule() {
    }
    EnvironmentsModule = __decorate([
        NgModule({
            providers: [
                {
                    provide: EnvVariables,
                    // useFactory instead of useValue so we can easily add more logic to the environment factory.
                    useFactory: environmentFactory
                }
            ]
        })
    ], EnvironmentsModule);
    return EnvironmentsModule;
}());
export { EnvironmentsModule };
//# sourceMappingURL=environment-variables.module.js.map