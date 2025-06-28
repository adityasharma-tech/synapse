import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { AuthLayoutComponent } from "./components/auth-layout/auth-layout.component";
import { RegisterComponent } from "./components/register/register.component";

export const routes: Routes = [
    {
        path: "",
        component: AuthLayoutComponent,
        children: [
            { path: "login", component: LoginComponent },
            { path: "register", component: RegisterComponent },
            { path: "**", redirectTo: "login" },
        ],
    },
    { path: "**", redirectTo: "login" },
];
