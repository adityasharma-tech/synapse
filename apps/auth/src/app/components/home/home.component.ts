import { Component } from "@angular/core";
import { injectSelector } from "@reduxjs/angular-redux";
import { RootState } from "../../core/store/store";
import { NgFor } from "@angular/common";

@Component({
    selector: "app-home",
    imports: [NgFor],
    templateUrl: "./home.component.html",
})
export class HomeComponent {
    user = injectSelector((state: RootState) => state.app.user);

    apps = [
        {
            id: "synapse",
            name: "Synapse",
            logo: "/T&B@2x.png",
        },
    ];
}
