import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Preferences,
    Profiles as ProfilesSvc,
    Settings as SettingsSvc,
    WindowManager,
    Connection,
} from "@bindings/services";
import { Restrictions, SetConfigParams } from "@bindings/services/models.js";
import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";
import { useAutoSizeWindow } from "@/hooks/useAutoSizeWindow";
import { errorDialog, formatErrorMessage } from "@/lib/errors";
import i18next from "@/lib/i18n";
import { isNetbirdCloud } from "@/hooks/useManagementUrl";
import { WelcomeStepTray } from "./WelcomeStepTray";
import { WelcomeStepManagement } from "./WelcomeStepManagement";

const WINDOW_WIDTH = 360;

type WelcomeStep = "tray" | "management";

function shouldShowManagementStep(
    activeProfileId: string,
    setupKey: string,
    managementUrl: string,
    managedManagementUrl: string,
): boolean {
    if (managedManagementUrl) return false;
    // The default profile's ID equals the literal "default", so this check
    // holds whether we pass an ID or the legacy name.
    if (activeProfileId !== "default") return false;
    if (setupKey.trim() !== "") return false;

    return isNetbirdCloud(managementUrl);
}

type InitialState = {
    profileName: string;
    username: string;
    managementUrl: string;
    needsManagementStep: boolean;
};

export default function WelcomeDialog() {
    const [step, setStep] = useState<WelcomeStep>("tray");
    const [initial, setInitial] = useState<InitialState | null>(null);
    const [closing, setClosing] = useState(false);
    const contentRef = useAutoSizeWindow<HTMLDivElement>(WINDOW_WIDTH, initial !== null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [username, active] = await Promise.all([
                    ProfilesSvc.Username(),
                    ProfilesSvc.GetActive(),
                ]);
                const profileId = active.id || "default";
                const [config, restrictions] = await Promise.all([
                    SettingsSvc.GetConfig({ profileName: profileId, username }),
                    SettingsSvc.GetRestrictions().catch(() => new Restrictions()),
                ]);

                if (cancelled) return;

                const shouldShowManagement = shouldShowManagementStep(
                    profileId,
                    config.setupKey || "",
                    config.managementUrl,
                    restrictions.mdm.managementURL,
                );

                console.log("welcome: initial probe", {
                    profileId,
                    username,
                    managementUrl: config.managementUrl,
                    needsManagementStep: shouldShowManagement,
                });

                setInitial({
                    profileName: profileId,
                    username,
                    managementUrl: config.managementUrl,
                    needsManagementStep: shouldShowManagement,
                });
            } catch (e) {
                console.error("welcome: initial probe failed", e);
                if (cancelled) return;
                setInitial({
                    profileName: "default",
                    username: "",
                    managementUrl: "",
                    needsManagementStep: false,
                });
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const finish = useCallback(async () => {
        if (closing) return;
        setClosing(true);
        try {
            await Preferences.SetOnboardingCompleted(true);
        } catch (e) {
            console.error("persist onboarding flag:", e);
        }
        try {
            // Clear the first startup flag so the welcome page doesn't show again
            await Preferences.SetFirstStartup(true);
        } catch (e) {
            console.error("persist first startup flag:", e);
        }
        try {
            await WindowManager.OpenMain();
        } catch (e) {
            console.error("open main window:", e);
        }
        try {
            await WindowManager.CloseWelcome();
        } catch (e) {
            console.error("close welcome window:", e);
        }
    }, [closing]);

    const handleTrayContinue = useCallback(async () => {
        if (initial?.needsManagementStep) {
            setStep("management");
        } else {
            await finish();
        }
    }, [initial, finish]);

    const handleManagementContinue = useCallback(
        async (url: string, setupKey?: string) => {
            if (!initial) return;

            // Validate management URL is not empty
            if (!url || !url.trim()) {
                await errorDialog({
                    Title: i18next.t("welcome.error.managementUrlRequired"),
                    Message: i18next.t("welcome.error.managementUrlRequiredMessage"),
                });
                return;
            }

            try {
                // SetConfig is a partial update — undefined fields are preserved Go-side.
                await SettingsSvc.SetConfig(
                    new SetConfigParams({
                        profileName: initial.profileName,
                        username: initial.username,
                        managementUrl: url,
                        ...(setupKey && { setupKey }),
                    }),
                );
            } catch (e) {
                await errorDialog({
                    Title: i18next.t("settings.error.saveTitle"),
                    Message: formatErrorMessage(e),
                });
                return;
            }

            // If setup key was provided, validate it by attempting authentication
            if (setupKey && setupKey.trim()) {
                try {
                    const result = await Connection.Login({
                        profileName: initial.profileName,
                        username: initial.username,
                        managementUrl: url,
                        setupKey: setupKey.trim(),
                        preSharedKey: "",
                        hostname: "",
                        hint: "",
                    });

                    // If setup key auth failed (NeedsSSOLogin means key was not recognized)
                    if (result.needsSsoLogin) {
                        await errorDialog({
                            Title: i18next.t("welcome.error.setupKeyInvalid"),
                            Message: i18next.t("welcome.error.setupKeyInvalidMessage"),
                        });
                        return;
                    }
                    // Setup key auth succeeded, proceed to finish
                } catch (e) {
                    // Setup key auth failed with an error
                    await errorDialog({
                        Title: i18next.t("welcome.error.setupKeyAuthFailed"),
                        Message: formatErrorMessage(e),
                    });
                    return;
                }
            }

            setInitial((s) => (s ? { ...s, managementUrl: url } : s));
            await finish();
        },
        [initial, finish],
    );

    const content = useMemo(() => {
        if (!initial) {
            return null;
        }
        switch (step) {
            case "tray":
                return <WelcomeStepTray onContinue={handleTrayContinue} />;
            case "management":
                return (
                    <WelcomeStepManagement
                        initialUrl={initial.managementUrl}
                        onContinue={handleManagementContinue}
                    />
                );
        }
    }, [initial, step, handleTrayContinue, handleManagementContinue]);

    return (
        <ConfirmDialog
            ref={contentRef}
            aria-labelledby={step === "tray" ? "nb-welcome-title" : "nb-welcome-management-title"}
        >
            {content}
        </ConfirmDialog>
    );
}
