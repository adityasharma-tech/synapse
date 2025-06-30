import { Component, effect, signal } from "@angular/core";
import { injectDispatch, injectSelector } from "@reduxjs/angular-redux";
import { AppDispatch, RootState } from "../../core/store/store";
import { Router, RouterLink } from "@angular/router";
import { AxiosService } from "../../core/axios/axios.service";
import { ToastrService } from "ngx-toastr";
import { clearUser } from "../../core/store/features/app.slice";

@Component({
    selector: "app-dashboard",
    imports: [RouterLink],
    standalone: true,
    templateUrl: "./dashboard.component.html",
})
export class DashboardComponent {
    dispatch = injectDispatch<AppDispatch>();

    user = injectSelector((state: RootState) => state.app.user);
    loading = injectSelector((state: RootState) => state.app.fetchLoading);

    clearUser = clearUser;

    async logout() {
        const { result, error } = await this.axiosService.handleRequest(
            this.axiosService.logoutUser()
        );
        if (result) this.toastr.success("You are signed out");
        if (error) this.toastr.error("Failed while signing you out.");
        if (result) this.dispatch(this.clearUser());
    }

    constructor(
        private router: Router,
        private axiosService: AxiosService,
        private toastr: ToastrService
    ) {
        effect(() => {
            if (!this.user() && !this.loading()) {
                this.router.navigate(["login"]);
            }
        });
    }
}
