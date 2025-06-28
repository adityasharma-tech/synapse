import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { provideAnimations } from "@angular/platform-browser/animations";
import { provideToastr } from "ngx-toastr";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideAnimations(),
        provideToastr({
            positionClass: "toast-bottom-right",
        }),
    ],
};
