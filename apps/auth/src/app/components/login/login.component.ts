import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AxiosService } from "../../core/axios/axios.service";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: "app-login",
    imports: [RouterModule, ReactiveFormsModule],
    templateUrl: "./login.component.html",
    styleUrl: "../auth-layout/auth-layout.component.css",
})
export class LoginComponent {
    private loginFormBuilder = inject(FormBuilder);

    loginForm = this.loginFormBuilder.group({
        emailOrUsername: ["", Validators.required],
        password: ["", Validators.required],
    });

    onSubmit = async () => {
        const axiosService = new AxiosService();

        const { result, error } = await axiosService.handleRequest(
            axiosService.loginUser({
                emailOrUsername: this.loginForm.value.emailOrUsername!,
                password: this.loginForm.value.password!,
            })
        );
        if (result) {
            this.toastr.success(result.message, "success");
        }

        if (error) {
            this.toastr.error(result?.message, "Error occured");
        }
    };

    constructor(private toastr: ToastrService) {}
}
