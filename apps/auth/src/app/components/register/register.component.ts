import { Component, effect, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AxiosService } from "../../core/axios/axios.service";
import { injectSelector } from "@reduxjs/angular-redux";
import { RootState } from "../../core/store/store";

@Component({
    selector: "app-register",
    imports: [RouterModule, ReactiveFormsModule],
    templateUrl: "./register.component.html",
    styleUrl: "../auth-layout/auth-layout.component.css",
})
export class RegisterComponent {
    private registerFormBuilder = inject(FormBuilder);
    user = injectSelector((state: RootState) => state.app.user);
    fetchLoading = injectSelector((state: RootState) => state.app.fetchLoading);

    loading = signal(false);

    registerForm = this.registerFormBuilder.group({
        firstName: [
            "",
            [Validators.required, Validators.pattern(/^[a-zA-Z]{3,20}$/)],
        ],
        lastName: [
            "",
            [Validators.required, Validators.pattern(/^[a-zA-Z]{3,20}$/)],
        ],
        email: ["", [Validators.required, Validators.email]],
        password: [
            "",
            [
                Validators.required,
                Validators.min(6),
                Validators.max(20),
                Validators.pattern("^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"),
            ],
        ],
        username: [
            "",
            [
                Validators.required,
                Validators.min(6),
                Validators.max(14),
                Validators.pattern(/^[a-zA-Z0-9_\-\.]{3,16}$/),
            ],
        ],
        subscribeEmail: [true, Validators.required],
    });

    onSubmit = async () => {
        this.loading.set(true);
        // const { error, result } = await this.axiosService.handleRequest(this.axiosService.registerUser({
        //     email: this.registerForm.value.email,
        //     password: this.registerForm.value.password,

        // }))

        // if(result) this.toastr.success("Login Successfull", "Welcome " + this.registerForm.value.username)
    };

    constructor(
        private toastr: ToastrService,
        private router: Router,
        private axiosService: AxiosService
    ) {
        effect(() => {
            if (!!this.user() && !this.fetchLoading())
                this.router.navigateByUrl("/");
        });
    }
}
