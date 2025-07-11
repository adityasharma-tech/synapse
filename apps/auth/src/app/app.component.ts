import { Component, effect } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { LoadingBarRouterModule } from "@ngx-loading-bar/router";
import { AxiosService } from "./core/axios/axios.service";

@Component({
    selector: "app-root",
    imports: [RouterOutlet, LoadingBarRouterModule],
    templateUrl: "./app.component.html",
    standalone: true,
})
export class AppComponent {
    title = "auth";

    constructor(
        private axiosService: AxiosService,
        private route: ActivatedRoute
    ) {
        effect(() => {
            this.route.queryParams.subscribe((params) => {
                if (params["redirect_url"])
                    window.location.href = params["redirect_url"];
            });
        });

        (async () => this.axiosService.checkUser())();
    }
}
