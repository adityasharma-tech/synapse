import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { AuthLayoutComponent } from "./components/auth-layout/auth-layout.component";
import { RegisterComponent } from "./components/register/register.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

export const routes: Routes = [
    {
        path: "",
        component: DashboardComponent,
    },
    {
        path: "login",
        component: LoginComponent,
    },
    {
        path: "register",
        component: RegisterComponent,
    },
    { path: "**", redirectTo: "login" },
];
