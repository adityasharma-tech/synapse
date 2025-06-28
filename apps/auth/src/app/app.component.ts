import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LoadingBarRouterModule } from "@ngx-loading-bar/router";

@Component({
    selector: "app-root",
    imports: [RouterOutlet, LoadingBarRouterModule],
    templateUrl: "./app.component.html",
})
export class AppComponent {
    title = "auth";
}
