import {
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    Router,
    RouterModule,
} from "./chunk-SV2B2QBT.js";
import { LoadingBarModule, LoadingBarService } from "./chunk-E2G2WIRR.js";
import "./chunk-74DLM4KK.js";
import "./chunk-TZGWHDQY.js";
import {
    APP_INITIALIZER,
    NgModule,
    setClassMetadata,
    ɵɵdefineInjector,
    ɵɵdefineNgModule,
    ɵɵinject,
} from "./chunk-45AOH2E3.js";

// ../../node_modules/@ngx-loading-bar/router/fesm2022/ngx-loading-bar-router.mjs
function getCurrentNavigationState(router) {
    const currentNavigation =
        router.getCurrentNavigation && router.getCurrentNavigation();
    if (currentNavigation && currentNavigation.extras) {
        return currentNavigation.extras.state;
    }
    return {};
}
function registerRouterListener(router, loader) {
    return () => {
        const ref = loader.useRef("router");
        router.events.subscribe((event) => {
            const navState = getCurrentNavigationState(router);
            if (navState && navState.ignoreLoadingBar) {
                return;
            }
            if (event instanceof NavigationStart) {
                ref.start();
            }
            if (
                event instanceof NavigationError ||
                event instanceof NavigationEnd ||
                event instanceof NavigationCancel
            ) {
                ref.complete();
            }
        });
    };
}
function provideLoadingBarRouter() {
    return {
        provide: APP_INITIALIZER,
        useFactory: registerRouterListener,
        deps: [Router, LoadingBarService],
        multi: true,
    };
}
var LoadingBarRouterModule = class _LoadingBarRouterModule {
    constructor(router, loader) {
        registerRouterListener(router, loader)();
    }
    static {
        this.ɵfac = function LoadingBarRouterModule_Factory(__ngFactoryType__) {
            return new (__ngFactoryType__ || _LoadingBarRouterModule)(
                ɵɵinject(Router),
                ɵɵinject(LoadingBarService)
            );
        };
    }
    static {
        this.ɵmod = ɵɵdefineNgModule({
            type: _LoadingBarRouterModule,
            imports: [RouterModule, LoadingBarModule],
            exports: [RouterModule, LoadingBarModule],
        });
    }
    static {
        this.ɵinj = ɵɵdefineInjector({
            imports: [
                RouterModule,
                LoadingBarModule,
                RouterModule,
                LoadingBarModule,
            ],
        });
    }
};
(() => {
    (typeof ngDevMode === "undefined" || ngDevMode) &&
        setClassMetadata(
            LoadingBarRouterModule,
            [
                {
                    type: NgModule,
                    args: [
                        {
                            imports: [RouterModule, LoadingBarModule],
                            exports: [RouterModule, LoadingBarModule],
                        },
                    ],
                },
            ],
            function () {
                return [
                    {
                        type: Router,
                    },
                    {
                        type: LoadingBarService,
                    },
                ];
            },
            null
        );
})();
export { LoadingBarRouterModule, provideLoadingBarRouter };
//# sourceMappingURL=@ngx-loading-bar_router.js.map
