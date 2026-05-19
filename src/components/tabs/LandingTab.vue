<template>
    <BaseTab tab-name="landing">
        <div class="content_wrapper">
            <div class="content_top">
                <div class="logowrapper">
                    <div class="landing-brand-lockup" aria-hidden="true">
                        <div class="landing-wwkj-brand">
                            <img class="landing-wwkj-logo" src="/images/wwkj_logo.png" alt="" />
                            <span class="landing-wwkj-name">物唯</span>
                        </div>
                        <img class="landing-bf-logo" src="/images/bf_logo_white.svg" alt="" />
                    </div>
                    <div v-html="$t('defaultWelcomeIntro')"></div>
                </div>
            </div>
            <SponsorTile sponsor-type="landing" />
            <div class="content_mid grid-row">
                <div class="column third_left text1 grid-col col4">
                    <div class="socialMediaParagraph">
                        <h2 v-html="$t('defaultCommunityHead')"></h2>
                        <div class="logoSocialMedia">
                            <img src="/images/discord-logo-color.svg" alt="Discord" class="socialMediaLogo" />
                        </div>
                        <div class="socialMediaText" v-html="$t('defaultDiscordText')"></div>
                    </div>
                    <div class="socialMediaParagraph">
                        <div class="logoSocialMedia">
                            <img src="/images/reddit-logo.svg" alt="Reddit" class="socialMediaLogo" />
                        </div>
                        <div class="socialMediaText" v-html="$t('defaultRedditText')"></div>
                    </div>
                    <div class="socialMediaParagraph">
                        <div class="logoSocialMedia">
                            <img src="/images/flogo_RGB_HEX-1024.svg" alt="Facebook" class="socialMediaLogo" />
                        </div>
                        <div class="socialMediaText" v-html="$t('defaultFacebookText')"></div>
                    </div>
                </div>
                <div class="column third_center text3 grid-col col4">
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
                <div class="column third_right text2 list grid-col col4">
                    <div class="wrap">
                        <h2 v-html="$t('defaultContributingHead')"></h2>
                        <div v-html="$t('defaultContributingText')"></div>
                    </div>
                </div>
                <div class="column third_left text1 grid-col col4">
                    <div class="wrap">
                        <h2 v-html="$t('statisticsDisclaimerHead')"></h2>
                        <div class="statsCollection" v-html="$t('statisticsDisclaimer')"></div>
                    </div>
                </div>
                <div class="column third_center text2 grid-col col4">
                    <div class="wrap">
                        <h2 v-html="$t('defaultSoftwareHead')"></h2>
                        <div v-html="$t('defaultSoftwareText')"></div>
                    </div>
                </div>
                <div class="column third_right text1 list grid-col col4">
                    <div class="wrap">
                        <h2 v-html="$t('defaultHardwareHead')"></h2>
                        <div v-html="$t('defaultHardwareText')"></div>
                    </div>
                </div>
            </div>
            <div class="content_foot">
                <div class="languageSwitcher">
                    <span>{{ $t("language_choice_message") }}</span
                    ><br />
                    <div class="language-links">
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
import BaseTab from "./BaseTab.vue";
import SponsorTile from "../sponsor/SponsorTile.vue";
import GUI from "../../js/gui";
import { i18n } from "../../js/localization";

export default defineComponent({
    name: "LandingTab",
    components: {
        BaseTab,
        SponsorTile,
    },
    setup() {
        const availableLanguages = ref(["DEFAULT", ...i18n.getLanguagesAvailables()]);
        const selectedLanguage = ref(i18n.selectedLanguage);

        function changeLanguage(lang) {
            if (i18n.selectedLanguage !== lang) {
                i18n.changeLanguage(lang);
                selectedLanguage.value = lang;
            }
        }

        onMounted(() => {
            GUI.content_ready();
        });

        return {
            availableLanguages,
            selectedLanguage,
            changeLanguage,
        };
    },
});
</script>

<style lang="less">
.tab-landing {
    display: flex;
    min-height: 100%;
    background: var(--surface-100) url(../../images/pattern_light.png);
    background-size: 300px;
    overflow: hidden;
}
</style>

<style scoped lang="less">
.content_wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    padding: 0;
    height: unset;
    overflow-y: auto;
    overflow-x: hidden;
}

.content_top {
    position: relative;
    height: 140px;
    padding: 20px;
    margin-bottom: 15px;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    overflow: hidden;
}

.text1,
.text2,
.text3 {
    margin-top: 15px;
    margin-bottom: 15px;
    font-weight: normal;
    font-size: 12px;
}

.content_mid {
    background-color: var(--surface-100);
    overflow: hidden;
    padding: 0 15px;
    margin-top: auto;

    .column {
        .wrap2 {
            padding: 10px;
        }
    }

    h2 {
        margin-bottom: 5px;
        font-size: 13px;
    }

    h3 {
        font-size: 12px;
        margin-bottom: 5px;
    }

    :deep(.list) {
        ul {
            margin-top: 2px;
            padding-left: 20px;
            list-style: inside;
        }
        li {
            padding: 2px 0;
            list-style-type: disc;
            margin-left: 0;
            display: list-item;
        }
    }

    .text3 {
        .wrap2 {
            border: 3px solid var(--surface-300);
            border-radius: 5px;
            min-height: 187px;
            font-size: 11px;
        }
        .donate {
            margin-top: 10px;
            text-align: center;
        }
    }
}

.donate {
    img {
        height: 2rem;
        display: inline-block;
    }
}

.content_foot {
    clear: both;
    padding: 10px 0 5px;
}

.logowrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-width: 0;
    padding-top: 90px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 5px;
    color: var(--text);
    font-size: 14px;
    font-weight: 300;
    text-align: center;

    > div {
        text-align: center;
    }

    span {
        font-size: 22px;
        font-weight: 300;
    }
}

.landing-brand-lockup {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    width: min(620px, calc(100% - 48px));
    min-width: 0;
    margin: 0;
}

.landing-wwkj-brand {
    display: flex;
    flex: 0 1 auto;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.landing-bf-logo {
    display: block;
    flex: 0 0 240px;
    width: 240px;
    max-width: 36%;
    height: auto;
    min-width: 0;
    max-height: 70px;
    object-fit: contain;
}

.landing-wwkj-logo {
    display: block;
    flex: 0 0 98px;
    width: 98px;
    height: auto;
    min-width: 0;
    max-height: 58px;
    object-fit: contain;
}

.landing-wwkj-name {
    color: #111;
    flex: 0 0 auto;
    font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif;
    font-size: 64px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
}

.socialMediaParagraph {
    margin-bottom: 15px;

    .logoSocialMedia {
        float: left;
        width: 30px;

        img {
            height: 20px;
            width: 20px;
        }
    }

    .socialMediaLogo {
        padding-top: 3px;
    }

    .socialMediaText {
        margin-top: 0;
        margin-left: 35px;
        display: block;
        font-weight: normal;
        font-size: 12px;
    }
}

.languageSwitcher {
    margin-left: auto;
    margin-right: auto;
    text-align: center;

    .selected_language {
        font-weight: bold;
    }

    .language-links {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
    }

    a {
        font-weight: normal;
        white-space: nowrap;

        &:not(:last-child) {
            &:after {
                content: ", ";
                font-weight: normal;
            }
        }
    }
}

@media all and (max-width: 575px) {
    .logowrapper {
        width: auto;
    }
    .landing-brand-lockup {
        width: calc(100% - 24px);
        gap: 10px;
    }
    .landing-wwkj-brand {
        gap: 8px;
    }
    .landing-bf-logo {
        flex-basis: 180px;
        width: 180px;
        max-height: 58px;
    }
    .landing-wwkj-logo {
        flex-basis: 72px;
        width: 72px;
        max-height: 48px;
    }
    .landing-wwkj-name {
        font-size: 48px;
    }
}

@media all and (max-width: 1055px) {
    .landing-brand-lockup {
        gap: 12px;
        width: min(560px, calc(100% - 48px));
    }
    .landing-wwkj-logo {
        flex-basis: 84px;
        width: 84px;
    }
    .landing-wwkj-name {
        font-size: 58px;
    }
    .landing-bf-logo {
        flex-basis: 210px;
        width: 210px;
        max-width: 34%;
    }
}

@media all and (max-width: 575px), all and (max-width: 950px) and (max-height: 500px) and (orientation: landscape) {
    .content_top {
        height: auto;
        padding: 10px 20px;
    }
    .landing-brand-lockup {
        display: none;
    }
}
</style>
