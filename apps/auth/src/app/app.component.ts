import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
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

    constructor(private axiosService: AxiosService) {
        (async () => this.axiosService.checkUser())();
    }
}
