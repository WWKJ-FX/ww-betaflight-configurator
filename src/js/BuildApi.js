import { gui_log } from "./gui_log";
import { i18n } from "./localization";
import { get as getStorage, set as setStorage } from "./SessionStorage";
import CONFIGURATOR from "./data_storage.js";
import LoginApi from "./LoginApi";

const WWKJ_TARGET = "WFG100";
const WWKJ_RELEASE = "2025.12.2";
const WWKJ_PREBUILT_FIRMWARE_URL =
    "https://github.com/WWKJ-FX/wfg100-firmware-index/releases/download/wfg100-v0.1.0/betaflight_2025.12.2_STM32H743_WFG100.hex";

const WWKJ_FALLBACK_TARGETS = [
    {
        target: WWKJ_TARGET,
        manufacturer: "WWF",
        mcu: "STM32H743",
        group: "supported",
    },
];

const WWKJ_FALLBACK_TARGET_RELEASES = {
    target: WWKJ_TARGET,
    manufacturer: "WWF",
    created: "2026-05-18T00:00:00",
    releases: [
        {
            release: WWKJ_RELEASE,
            type: "Stable",
            date: "18-May-2026 00:00",
            label: "WWKJ WFG100",
            cloudBuild: false,
            prebuilt: true,
            unifiedConfig: false,
            withdrawn: false,
        },
    ],
};

const WWKJ_FALLBACK_TARGET_DETAIL = {
    target: WWKJ_TARGET,
    manufacturer: "WWF",
    mcu: "STM32H743",
    release: WWKJ_RELEASE,
    releaseType: "Stable",
    date: "18-May-2026 00:00",
    releaseUrl: "https://github.com/WWKJ-FX/ww-betaflight/tree/ww-2025.12-maintenance",
    cloudBuild: false,
    prebuilt: true,
    configuration: [],
    extension: "hex",
    file: "betaflight_2025.12.2_STM32H743_WFG100.hex",
    url: WWKJ_PREBUILT_FIRMWARE_URL,
};

const WWKJ_FALLBACK_OPTIONS = {
    radioProtocols: [
        { name: "CRSF", value: "USE_SERIALRX_CRSF", default: true, key: 4097, includesTelemetry: true },
        { name: "SBUS", value: "USE_SERIALRX_SBUS", default: false, key: 4103 },
        { name: "MAVLINK", value: "USE_SERIALRX_MAVLINK", default: false, key: 4109 },
    ],
    telemetryProtocols: [
        { name: "[None]", value: "", default: true },
        { name: "MAVLINK", value: "USE_TELEMETRY_MAVLINK", default: false, key: 12305 },
        { name: "SMARTPORT", value: "USE_TELEMETRY_SMARTPORT", default: false, key: 12306 },
    ],
    generalOptions: [
        { name: "GPS", value: "USE_GPS", default: true, key: 16412 },
        { name: "Magnetometers", value: "USE_MAG", default: true, key: 16415 },
        { name: "OSD (Analog)", value: "USE_OSD_SD", default: true, key: 16416, group: "OSD", groupedName: "Analog" },
        { name: "Pin IO", value: "USE_PINIO", default: true, key: 16418 },
        { name: "VTX", value: "USE_VTX", default: true, key: 16421 },
    ],
    motorProtocols: [
        { name: "DSHOT", value: "USE_DSHOT", default: true, key: 8231 },
        { name: "PWM", value: "USE_PWM_OUTPUT", default: false, key: 8235 },
    ],
};

export default class BuildApi {
    constructor(loginApi = new LoginApi()) {
        this._url = globalThis.BETAFLIGHT_BUILD_API_URL || "https://build.betaflight.com";
        this._wwkjUrl = globalThis.WWKJ_BUILD_API_URL || "https://wwkj-fx.github.io/wfg100-firmware-index";
        this._cacheExpirationPeriod = 3600 * 1000;
        this._loginApi = loginApi;
        this._lastTargetWasWwkj = false;
    }

    isSuccessCode(code) {
        return code === 200 || code === 201 || code === 202;
    }

    _isAbsoluteUrl(url) {
        return /^https?:\/\//i.test(url);
    }

    _joinUrl(base, path) {
        return `${String(base).replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
    }

    _usesBuildApiHeaders(url) {
        return !this._isAbsoluteUrl(url) || String(url).startsWith(this._url);
    }

    async _requestHeaders(url, extraHeaders = {}) {
        const headers = { ...extraHeaders };
        if (this._usesBuildApiHeaders(url)) {
            headers["X-CFG-VER"] = `${CONFIGURATOR.version}`;
            Object.assign(headers, await this._authHeaders());
        }
        return headers;
    }

    async _authHeaders() {
        if (!this._loginApi) {
            return {};
        }

        try {
            const token = await this._loginApi.getAccessToken();
            if (token) {
                return { Authorization: `Bearer ${token}` };
            }
        } catch (_error) {
            // Silently continue without auth headers
            console.log(`Unable to obtain access token for Build API. ${_error}`);
        }

        return {};
    }

    async fetchBytes(url) {
        const response = await fetch(url, {
            method: "GET",
            headers: await this._requestHeaders(url),
        });

        if (this.isSuccessCode(response.status)) {
            return new Uint8Array(await response.arrayBuffer());
        }

        gui_log(i18n.getMessage("buildServerFailure", [url, `HTTP ${response.status}`]));
        return null;
    }

    async fetchText(url) {
        const response = await fetch(url, {
            method: "GET",
            headers: await this._requestHeaders(url),
        });

        if (this.isSuccessCode(response.status)) {
            return await response.text();
        }

        gui_log(i18n.getMessage("buildServerFailure", [url, `HTTP ${response.status}`]));
        return null;
    }

    async fetchJson(url) {
        const response = await fetch(url, {
            method: "GET",
            headers: await this._requestHeaders(url),
        });

        if (this.isSuccessCode(response.status)) {
            return await response.json();
        }

        gui_log(i18n.getMessage("buildServerFailure", [url, `HTTP ${response.status}`]));
        return null;
    }

    async fetchCachedJson(url) {
        const dataTag = `${url}_Data`;
        const cacheLastUpdateTag = `${url}_LastUpdate`;

        const storageResult = getStorage([cacheLastUpdateTag, dataTag]);
        const dataTimestamp = Date.now();
        const cachedData = storageResult[dataTag];
        const cachedLastUpdate = storageResult[cacheLastUpdateTag];

        if (cachedData && cachedLastUpdate && dataTimestamp - cachedLastUpdate < this._cacheExpirationPeriod) {
            gui_log(i18n.getMessage("buildServerUsingCached", [url]));
            return cachedData;
        }

        const response = await fetch(url, {
            method: "GET",
            headers: await this._requestHeaders(url),
        });

        if (response.status === 500) {
            throw new Error(await response.text());
        }

        if (response.status === 404) {
            return null;
        }

        const result = await response.json();

        const object = {};
        object[dataTag] = result;
        object[cacheLastUpdateTag] = Date.now();
        setStorage(object);
        return result;
    }

    async fetchCachedJsonOptional(url) {
        try {
            return await this.fetchCachedJson(url);
        } catch (error) {
            console.warn(`[BuildApi] Optional endpoint failed: ${url}`, error);
            return null;
        }
    }

    async loadTargets() {
        const url = `${this._url}/api/targets`;
        const wwkjUrl = this._joinUrl(this._wwkjUrl, "/api/targets");
        const [targets, wwkjTargets] = await Promise.all([
            this.fetchCachedJsonOptional(url),
            this.fetchCachedJsonOptional(wwkjUrl),
        ]);
        const mergedWwkjTargets =
            Array.isArray(wwkjTargets) && wwkjTargets.length > 0 ? wwkjTargets : WWKJ_FALLBACK_TARGETS;

        if (!Array.isArray(targets)) {
            return mergedWwkjTargets;
        }

        const mergedTargets = [...targets];
        const targetIndex = new Map(mergedTargets.map((target, index) => [target.target, index]));
        for (const wwkjTarget of mergedWwkjTargets) {
            if (!wwkjTarget?.target) {
                continue;
            }

            const existingIndex = targetIndex.get(wwkjTarget.target);
            if (existingIndex === undefined) {
                targetIndex.set(wwkjTarget.target, mergedTargets.length);
                mergedTargets.push(wwkjTarget);
            } else {
                mergedTargets[existingIndex] = { ...mergedTargets[existingIndex], ...wwkjTarget };
            }
        }

        return mergedTargets;
    }

    async loadTargetReleases(target) {
        const url = `${this._url}/api/targets/${target}`;
        const wwkjUrl = this._joinUrl(this._wwkjUrl, `/api/targets/${target}`);
        const wwkjReleases = await this.fetchCachedJsonOptional(wwkjUrl);
        if (wwkjReleases) {
            return wwkjReleases;
        }
        if (target === WWKJ_TARGET) {
            return WWKJ_FALLBACK_TARGET_RELEASES;
        }

        return await this.fetchCachedJson(url);
    }

    async loadTarget(target, release) {
        const url = `${this._url}/api/builds/${release}/${target}`;
        const wwkjUrl = this._joinUrl(this._wwkjUrl, `/api/builds/${release}/${target}`);
        const wwkjTarget = await this.fetchCachedJsonOptional(wwkjUrl);
        if (wwkjTarget) {
            this._lastTargetWasWwkj = true;
            return wwkjTarget;
        }
        if (target === WWKJ_TARGET) {
            this._lastTargetWasWwkj = true;
            return WWKJ_FALLBACK_TARGET_DETAIL;
        }

        this._lastTargetWasWwkj = false;
        return await this.fetchCachedJson(url);
    }

    async loadTargetFirmware(path) {
        const url = this._isAbsoluteUrl(path) ? path : `${this._url}${path}`;
        return await this.fetchBytes(url);
    }

    async getSupportCommands() {
        const url = `${this._url}/api/support/commands`;
        return await this.fetchJson(url);
    }

    async submitSupportData(data) {
        const url = `${this._url}/api/support`;

        const response = await fetch(url, {
            method: "POST",
            headers: await this._requestHeaders(url, { "Content-Type": "text/plain" }),
            body: data,
        });

        if (response.status === 200) {
            return await response.text();
        }

        gui_log(i18n.getMessage("buildServerFailure", [url, `HTTP ${response.status}`]));
        return null;
    }

    async requestBuild(request) {
        const url = `${this._url}/api/builds`;

        const response = await fetch(url, {
            method: "POST",
            headers: await this._requestHeaders(url, { "Content-Type": "application/json" }),
            body: JSON.stringify(request),
        });

        if (this.isSuccessCode(response.status)) {
            return await response.json();
        }

        gui_log(i18n.getMessage("buildServerFailure", [url, `HTTP ${response.status}`]));
        return null;
    }

    async requestBuildStatus(key) {
        const url = `${this._url}/api/builds/${key}/status`;
        return await this.fetchJson(url);
    }

    async requestBuildOptions(key) {
        const url = `${this._url}/api/builds/${key}/json`;
        return await this.fetchJson(url);
    }

    async loadOptions(release) {
        const url = `${this._url}/api/options/${release}`;
        if (this._lastTargetWasWwkj) {
            const wwkjUrl = this._joinUrl(this._wwkjUrl, `/api/options/${release}`);
            const wwkjOptions = await this.fetchCachedJsonOptional(wwkjUrl);
            if (wwkjOptions) {
                return wwkjOptions;
            }
            return WWKJ_FALLBACK_OPTIONS;
        }

        return await this.fetchJson(url);
    }

    async loadOptionsByBuildKey(release, key) {
        const url = `${this._url}/api/options/${release}/${key}`;
        return await this.fetchJson(url);
    }

    async loadCommits(release) {
        const url = `${this._url}/api/releases/${release}/commits`;
        return await this.fetchJson(url);
    }

    async loadConfiguratorRelease(type) {
        const url = `${this._url}/api/app/releases/${type}`;
        return await this.fetchJson(url);
    }

    async loadDeviceFilters() {
        try {
            return await this.fetchJson(`${this._url}/api/app/devices`);
        } catch {
            // offline or network error — caller falls back to cache
            return null;
        }
    }

    async loadSponsorTile(mode, page) {
        const url = `${this._url}/api/app/sponsors/${mode}/${page}`;
        return await this.fetchText(url);
    }
}
