import "../../libraries/flightindicators.css";

import "../css/theme.css";
import "../css/main.less";
import "../css/opensans_webfontkit/fonts.css";
import "../components/MotorOutputReordering/Styles.css";
import "../components/EscDshotDirection/Styles.css";
import "../css/dark-theme.less";
import "./main";

import { i18n } from "./localization";
import { pinia } from "./pinia_instance";
import { useDialogStore } from "../stores/dialog";
import { registerSW } from "virtual:pwa-register";
import { isAndroid, isEmbeddedDeployment, isTauri } from "./utils/checkCompatibility.js";

function clearDesktopServiceWorkers() {
    if ("serviceWorker" in navigator && typeof navigator.serviceWorker.getRegistrations === "function") {
        navigator.serviceWorker
            .getRegistrations()
            .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
            .catch((error) => console.warn("Failed to unregister desktop service workers", error));
    }

    if (globalThis.caches && typeof globalThis.caches.keys === "function") {
        globalThis.caches
            .keys()
            .then((keys) => Promise.all(keys.map((key) => globalThis.caches.delete(key))))
            .catch((error) => console.warn("Failed to clear desktop caches", error));
    }
}

// Skip PWA/service-worker on desktop Tauri, embedded deployments
// (WebSocket-only host, plain HTTP), and Android native builds.
if (isTauri()) {
    clearDesktopServiceWorkers();
} else if (!isAndroid() && !isEmbeddedDeployment()) {
    const dialogStore = useDialogStore(pinia);
    const updateSW = registerSW({
        onNeedRefresh() {
            console.log("Detected onNeedRefresh");
            dialogStore.open(
                "YesNoDialog",
                {
                    title: i18n.getMessage("pwaOnNeedRefreshTitle"),
                    text: i18n.getMessage("pwaOnNeedRefreshText"),
                    yesText: i18n.getMessage("yes"),
                    noText: i18n.getMessage("no"),
                },
                {
                    yes: () => {
                        dialogStore.close();
                        updateSW();
                    },
                    no: () => dialogStore.close(),
                },
            );
        },
        onOfflineReady() {
            console.log("Detected onOfflineReady");
            dialogStore.open(
                "InformationDialog",
                {
                    title: i18n.getMessage("pwaOnOffilenReadyTitle"),
                    text: i18n.getMessage("pwaOnOffilenReadyText"),
                    confirmText: i18n.getMessage("OK"),
                },
                { confirm: () => dialogStore.close() },
            );
        },
    });
}
