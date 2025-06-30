import { Component, effect, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AxiosService } from "../../core/axios/axios.service";
import { ToastrService } from "ngx-toastr";
import { injectSelector } from "@reduxjs/angular-redux";
import { RootState } from "../../core/store/store";

@Component({
    selector: "app-login",
    imports: [RouterModule, ReactiveFormsModule],
    templateUrl: "./login.component.html",
    styleUrl: "../auth-layout/auth-layout.component.css",
    standalone: true,
})
export class LoginComponent {
    private loginFormBuilder = inject(FormBuilder);
    user = injectSelector((state: RootState) => state.app.user);
    fetchLoading = injectSelector((state: RootState) => state.app.fetchLoading);

    loginForm = this.loginFormBuilder.group({
        emailOrUsername: ["", Validators.required],
        password: ["", Validators.required],
    });

    onSubmit = async () => {
        const { result, error } = await this.axiosService.handleRequest(
            this.axiosService.loginUser({
                emailOrUsername: this.loginForm.value.emailOrUsername!,
                password: this.loginForm.value.password!,
            })
        );
        if (result) {
            this.toastr.success(result.message, "success");
            this.loginForm.setValue({ emailOrUsername: "", password: "" });
            await this.axiosService.checkUser();
        }

        if (error) {
            this.toastr.error(result?.message, "Error occured");
        }
    };

    constructor(
        private toastr: ToastrService,
        private router: Router,
        private axiosService: AxiosService
    ) {
        this.loginForm.patchValue({
            emailOrUsername: "aadisharma.in+t1@gmail.com",
            password: "password",
        });

        effect(() => {
            console.log("user, loading", this.user(), this.fetchLoading());
            if (!!this.user() && !this.fetchLoading())
                this.router.navigateByUrl("/");
        });
    }
}
