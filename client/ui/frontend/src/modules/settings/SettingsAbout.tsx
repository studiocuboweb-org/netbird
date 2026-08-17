import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { Browser } from "@wailsio/runtime";
import { BookOpen, MessageSquareText, MessagesSquare } from "lucide-react";
import netbirdFull from "@/assets/logos/netbird-full.svg";

// Brand glyphs from simpleicons.org (lucide deprecated its brand icons).
const GithubIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox={"0 0 24 24"} fill={"currentColor"} {...props}>
        <path
            d={
                "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            }
        />
    </svg>
);
const ScwIcon = (props: SVGProps<SVGSVGElement>) => (
<svg
   width="31.999998"
   height="32.000004"
   viewBox="0 0 31.999998 32.000004"
   fill="none"
   version="1.1"
   id="svg3"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <defs
     id="defs3">
    <clipPath
       clipPathUnits="userSpaceOnUse"
       id="clipPath1">
      <rect
         style="fill:none;stroke:#000000;stroke-width:0.252166;stroke-linecap:round;stroke-miterlimit:4.4;paint-order:stroke fill markers"
         id="rect2"
         width="26.257414"
         height="25.9603"
         x="41.91132"
         y="135.07208"
         rx="1.2958329" />
    </clipPath>
  </defs>
  <g
     id="layer1"
     transform="matrix(1.2313799,0,0,1.2326514,-51.94161,-166.49679)"
     clip-path="url(#clipPath1)">
    <image
       width="26.105555"
       height="26.105555"
       preserveAspectRatio="none"
       style="image-rendering:optimizeQuality"
       xlink:href="data:image/png;base64,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&#10;XfkTA8K6Hn0Z3w8AAAAASUVORK5CYII=&#10;"
       id="image1"
       x="42.181629"
       y="135.01227" />
    <image
       width="68.438889"
       height="9.5249996"
       preserveAspectRatio="none"
       style="image-rendering:optimizeQuality"
       xlink:href="data:image/png;base64,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&#10;74Gxx+7/AHxkJ8/JNHknAAAAAElFTkSuQmCC&#10;"
       id="image1-3"
       x="71.878471"
       y="143.30255" />
  </g>
</svg>
);

import { useSettings } from "@/contexts/SettingsContext.tsx";
import { useStatus } from "@/contexts/StatusContext.tsx";
import { UpdateVersionCard } from "@/modules/auto-update/UpdateVersionCard";
import { useAccentTrigger } from "@/modules/settings/SettingsAccent";

function openUrl(url: string) {
    Browser.OpenURL(url).catch(() => {
        window.open(url, "_blank");
    });
}

export function SettingsAbout() {
    const { t } = useTranslation();
    const { status } = useStatus();
    const { guiVersion } = useSettings();
    const daemonVersion = status?.daemonVersion ?? "—";

    const handleVersionClick = useAccentTrigger();

    const COMMUNITY_LINKS: {
        label: string;
        url: string;
        Icon: ComponentType<SVGProps<SVGSVGElement>>;
        iconClassName?: string;
    }[] = [
        {
            label: "Studio Cubo Web",
            url: "https://studiocuboweb.com.br",
            Icon: ScwIcon,
            iconClassName: "h-3 w-3",
        },
        {
            label: "Powered by NetBird",
            url: "https://github.com/netbirdio/netbird",
            Icon: GithubIcon,
            iconClassName: "h-3 w-3",
        },
    ];
    
    return (
        <div
            className={
                "mx-auto flex min-h-[calc(100vh-12rem)] max-w-2xl flex-col items-center justify-center gap-4"
            }
        >
            <img src={netbirdFull} alt={t("common.netbird")} className={"h-7 w-auto"} />
            <div className={"flex flex-col items-center gap-0.5 text-center"}>
                <button
                    type={"button"}
                    onClick={handleVersionClick}
                    className={
                        "cursor-text select-text bg-transparent text-sm font-semibold text-nb-gray-100 outline-none"
                    }
                >
                    {daemonVersion === "development" ? (
                        <span>
                            {t("settings.about.clientName")}{" "}
                            <span className={"font-mono text-yellow-400"}>
                                {t("settings.about.development")}
                            </span>
                        </span>
                    ) : (
                        t("settings.about.client", { version: daemonVersion })
                    )}
                </button>
                <p className={"cursor-text select-text text-sm font-medium text-nb-gray-250"}>
                    {guiVersion === "development" ? (
                        <span>
                            {t("settings.about.guiName")}{" "}
                            <span className={"font-mono text-yellow-400"}>
                                {t("settings.about.development")}
                            </span>
                        </span>
                    ) : (
                        t("settings.about.gui", { version: guiVersion })
                    )}
                </p>
            </div>

            <UpdateVersionCard />

            <p className={"mt-2 text-center text-sm text-nb-gray-300"}>
                {t("settings.about.copyright", { year: new Date().getFullYear() })}
            </p>
            <div
                className={"flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-nb-gray-200"}
            >
                {COMMUNITY_LINKS.map(({ label, url, Icon, iconClassName }) => (
                    <button
                        key={url}
                        type={"button"}
                        tabIndex={0}
                        onClick={() => openUrl(url)}
                        className={
                            "inline-flex items-center gap-1.5 rounded-sm decoration-[0.5px] underline-offset-4 outline-none transition hover:text-nb-gray-100 hover:underline focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-nb-gray-940"
                        }
                    >
                        <Icon aria-hidden={"true"} className={iconClassName ?? "h-3.5 w-3.5"} />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
