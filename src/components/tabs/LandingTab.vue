<template>
    <BaseTab tab-name="landing">
        <div class="content_wrapper">
            <div class="content_top">
                <div class="logowrapper">
                    <div class="landing-brand-lockup">
                        <a
                            :href="wwkjWebsiteUrl"
                            class="landing-wwkj-brand landing-wwkj-link"
                            rel="noopener noreferrer"
                            target="_blank"
                            title="打开物唯官网"
                            @click="openWwkjWebsite"
                        >
                            <img class="landing-wwkj-logo" src="/images/wwkj_logo.png" alt="" />
                            <span class="landing-wwkj-name">物唯</span>
                        </a>
                        <img class="landing-bf-logo" src="/images/bf_logo_white.svg" alt="" />
                    </div>
                    <div v-html="$t('defaultWelcomeIntro')"></div>
                </div>
            </div>
            <div class="tab_sponsor" ref="sponsorContainer"></div>
            <div class="content_mid grid-row">
                <div class="column third_left text1 grid-col col4">
                    <div class="wrap">
                        <h2 v-html="$t('defaultWelcomeHead')"></h2>
                        <div v-html="$t('defaultWelcomeText')"></div>
                    </div>
                </div>
                <div class="column third_center text2 grid-col col5">
                    <div class="wrap">
                        <h2 v-html="$t('defaultContributingHead')"></h2>
                        <div v-html="$t('defaultContributingText')"></div>
                    </div>
                </div>
                <div class="column third_right text3 grid-col col3">
                    <div class="wrap2">
                        <h3 v-html="$t('defaultDonateHead')"></h3>
                        <div v-html="$t('defaultDonateText')"></div>
                        <div class="donate">
                            <a
                                href="https://paypal.me/betaflight"
                                rel="noopener noreferrer"
                                target="_blank"
                                :title="$t('defaultDonate')"
                            >
                                <img src="/images/btn-donate.png" alt="Paypal" height="30" />
                            </a>
                        </div>
                        <div v-html="$t('defaultDonateBottom')"></div>
                    </div>
                </div>
                <div class="content_mid_bottom">
                    <div class="socialMediaParagraph">
                        <div class="logoSocialMedia">
                            <img src="/images/flogo_RGB_HEX-1024.svg" alt="Facebook" class="facebookLogo" />
                        </div>
                        <div class="socialMediaText" v-html="$t('defaultFacebookText')"></div>
                    </div>
                    <div class="socialMediaParagraph">
                        <div class="logoSocialMedia">
                            <img src="/images/discord-logo-color.svg" alt="Discord" class="discordLogo" />
                        </div>
                        <div class="socialMediaText" v-html="$t('defaultDiscordText')"></div>
                    </div>
                </div>
                <div class="content_bottom">
                    <div class="statsCollection" v-html="$t('statisticsDisclaimer')"></div>
                </div>
                <div class="content_foot">
                    <div class="languageSwitcher">
                        <span>{{ $t("language_choice_message") }}</span>
                        <a
                            v-for="lang in availableLanguages"
                            :key="lang"
                            href="#"
                            :lang="lang"
                            :class="{ selected_language: lang === selectedLanguage }"
                            @click.prevent="changeLanguage(lang)"
                        >
                            {{ $t(`language_${lang}`) }}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </BaseTab>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import $ from "jquery";
import BaseTab from "./BaseTab.vue";
import GUI from "../../js/gui";
import { i18n } from "../../js/localization";
import Sponsor from "../../js/Sponsor";

const WWKJ_WEBSITE_URL = "https://www.wwzhyun.cn/";

export default defineComponent({
    name: "LandingTab",
    components: {
        BaseTab,
    },
    setup() {
        const sponsorContainer = ref(null);
        const sponsor = new Sponsor();

        // Get available languages including DEFAULT
        const availableLanguages = ref(["DEFAULT", ...i18n.getLanguagesAvailables()]);
        const selectedLanguage = ref(i18n.selectedLanguage);

        function changeLanguage(lang) {
            if (i18n.selectedLanguage !== lang) {
                i18n.changeLanguage(lang);
                selectedLanguage.value = lang;
            }
        }

        function openWwkjWebsite(event) {
            if (globalThis.nw?.Shell?.openExternal) {
                event.preventDefault();
                globalThis.nw.Shell.openExternal(WWKJ_WEBSITE_URL);
            }
        }

        onMounted(() => {
            // Load sponsor tile - wrap with jQuery for Sponsor.js compatibility
            if (sponsorContainer.value) {
                sponsor.loadSponsorTile("landing", $(sponsorContainer.value));
            }
            GUI.content_ready();
        });

        return {
            sponsorContainer,
            availableLanguages,
            selectedLanguage,
            changeLanguage,
            openWwkjWebsite,
            wwkjWebsiteUrl: WWKJ_WEBSITE_URL,
        };
    },
});
</script>

<style scoped>
.logowrapper,
.logowrapper > div {
    text-align: center;
}
.logowrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 128px;
    padding-top: 92px;
    box-sizing: border-box;
}
.landing-brand-lockup {
    position: absolute;
    top: 18px;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    width: min(760px, calc(100% - 48px));
    transform: translateX(-50%);
}
.landing-wwkj-brand {
    display: flex;
    align-items: center;
    gap: 12px;
}
.landing-wwkj-link {
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    text-decoration: none;
}
.landing-wwkj-link:focus-visible {
    outline: 2px solid #ffae00;
    outline-offset: 6px;
}
.landing-wwkj-logo {
    display: block;
    width: 132px !important;
    max-height: 70px;
    margin: 0 !important;
    object-fit: contain;
}
.landing-wwkj-name {
    color: #111;
    font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif;
    font-size: 36px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
}
.landing-bf-logo {
    display: block;
    width: 280px !important;
    max-height: 72px;
    margin: 0 !important;
    object-fit: contain;
}
body.dark-theme .tab-landing .logowrapper .landing-wwkj-logo {
    content: url("/images/wwkj_logo.png") !important;
}
.selected_language {
    font-weight: bold;
}
.languageSwitcher a {
    margin-left: 8px;
}
@media all and (max-width: 860px) {
    .landing-brand-lockup {
        gap: 12px;
        width: calc(100% - 24px);
    }
    .landing-wwkj-logo {
        width: 96px !important;
    }
    .landing-wwkj-name {
        font-size: 30px;
    }
    .landing-bf-logo {
        width: 220px !important;
    }
}
@media all and (max-width: 575px) {
    .landing-brand-lockup {
        gap: 8px;
    }
    .landing-wwkj-logo {
        width: 72px !important;
    }
    .landing-wwkj-name {
        font-size: 24px;
    }
    .landing-bf-logo {
        width: 170px !important;
    }
}
</style>
