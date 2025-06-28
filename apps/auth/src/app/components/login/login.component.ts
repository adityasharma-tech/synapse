import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

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

    onSubmit = () => {};
}
