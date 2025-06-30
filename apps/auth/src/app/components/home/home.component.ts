import { Component } from "@angular/core";
import { injectSelector } from "@reduxjs/angular-redux";
import { RootState } from "../../core/store/store";

@Component({
    selector: "app-home",
    imports: [],
    templateUrl: "./home.component.html",
})
export class HomeComponent {
    user = injectSelector((state: RootState) => state.app.user);
}
