import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { RootState } from "../../core/store/store";
import { injectSelector } from "@reduxjs/angular-redux";
import { HomeComponent } from "../home/home.component";

@Component({
    selector: "app-auth-layout",
    standalone: true,
    imports: [RouterOutlet, HomeComponent],
    templateUrl: "./auth-layout.component.html",
    styleUrl: "./auth-layout.component.css",
})
export class AuthLayoutComponent {
    user = injectSelector((state: RootState) => state.app.user);
    fetchLoading = injectSelector((state: RootState) => state.app.fetchLoading);

    constructor() {}
}
