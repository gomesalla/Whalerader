import React, { useState, useEffect } from "react";
import { Bell, Volume2, VolumeX, Webhook, Check, AlertCircle, Settings } from "lucide-react";
import { RealTimeAlert } from "../types";

interface AlertsManagerProps {
  alerts: RealTimeAlert[];
}

export default function AlertsManager({ alerts }: AlertsManagerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Audio oscillator for a highly professional retro terminal beep!
  const playTerminalBeep = (type: string) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "critical" || type === "cluster") {
        // High attention alert double beep
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);

        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
          gain2.gain.setValueAtTime(0.08, ctx.currentTime);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.15);
        }, 150);
      } else {
        // Simple standard alert notification beep
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn("Oscillator audio failed to initialize:", e);
    }
  };

  // Listen to new alert events to trigger audio and browser notifications
  useEffect(() => {
    if (alerts.length > 0) {
      const latest = alerts[0];
      // Only fire if the alert is extremely fresh (within 3 seconds)
      if (Date.now() - latest.timestamp < 3000) {
        playTerminalBeep(latest.severity);

        // Native Browser Notification
        if (browserNotificationsEnabled && Notification.permission === "granted") {
          new Notification(latest.title, {
            body: latest.message,
            icon: "/public/icon.png",
          });
        }

        // Webhook Dispatch (simulated POST to external services)
        if (webhookUrl) {
          console.log(`Dispatched webhook payload to ${webhookUrl}:`, latest);
        }
      }
    }
  }, [alerts]);

  const requestBrowserNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("Browser does not support desktop alerts.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setBrowserNotificationsEnabled(true);
        new Notification("HYPERLIQUID ALERTS ACTIVE", {
          body: "Desktop alerts successfully synchronized.",
        });
      }
    });
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2000);
  };

  return (
    <div className="bg-brand-container border border-brand-border rounded p-5 h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-accent animate-swing" />
          <h2 className="font-display font-black text-sm text-white uppercase tracking-wide">
            REAL-TIME INTELLIGENCE ALERTS
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-sm border transition cursor-pointer ${
              soundEnabled
                ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent"
                : "bg-brand-hover border-brand-border-secondary text-brand-text-secondary"
            }`}
            title={soundEnabled ? "Mute Alarms" : "Unmute Alarms"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="bg-brand-hover hover:bg-brand-border-secondary border border-brand-border p-1.5 rounded-sm text-brand-text-secondary transition cursor-pointer"
            title="Configure Webhook / Discord integrations"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Configuration panel */}
      {showConfig && (
        <div className="bg-brand-hover/50 border border-brand-border p-4 rounded-sm mb-4 space-y-3 text-xs font-mono">
          <h3 className="font-bold text-white uppercase tracking-wider text-[10px]">
            DISPATCH CHANNELS CONFIG
          </h3>

          <div className="space-y-2">
            <button
              onClick={requestBrowserNotificationPermission}
              className={`w-full text-left p-2 rounded-sm text-xs border flex items-center justify-between transition ${
                browserNotificationsEnabled
                  ? "bg-brand-accent/5 border-brand-accent/30 text-brand-accent font-bold"
                  : "bg-brand-bg border border-brand-border-secondary text-brand-text-secondary hover:text-brand-text-primary"
              }`}
            >
              <span>DESKTOP NOTIFICATIONS</span>
              <span className="text-[10px] font-mono">
                {browserNotificationsEnabled ? "ACTIVE" : "CLICK TO SYNC"}
              </span>
            </button>
          </div>

          <form onSubmit={handleSaveWebhook} className="space-y-1.5 pt-2 border-t border-brand-border">
            <label className="text-[10px] text-brand-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Webhook className="w-3 h-3 text-brand-text-secondary" /> Webhook URI (Discord / Telegram)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="flex-1 bg-brand-bg border border-brand-border-secondary rounded-sm px-2 py-1 text-brand-text-primary text-xs focus:outline-none placeholder-brand-text-secondary"
              />
              <button
                type="submit"
                className="bg-brand-accent hover:opacity-90 text-black font-bold px-3 py-1 rounded-sm cursor-pointer flex items-center gap-1"
              >
                {webhookSaved ? <Check className="w-3.5 h-3.5" /> : "SAVE"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts Log List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-brand-text-secondary text-xs font-mono">
            Waiting for order flow triggers. System is silent.
          </div>
        ) : (
          alerts.map((a) => {
            const isCritical = a.severity === "critical";
            const borderClass = isCritical
              ? "border-brand-accent-red/40 bg-brand-accent-red/5"
              : "border-brand-border bg-brand-hover/20";
            const iconColor = isCritical ? "text-brand-accent-red" : "text-brand-accent";

            return (
              <div
                key={a.id}
                className={`p-3 rounded-sm border flex gap-3 text-left transition hover:border-brand-border-secondary ${borderClass}`}
              >
                <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold text-xs text-white truncate">
                      {a.title}
                    </span>
                    <span className="font-mono text-[9px] text-brand-text-secondary flex-shrink-0">
                      {new Date(a.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-primary font-sans mt-1 leading-relaxed">
                    {a.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-3 text-[10px] font-mono text-brand-text-secondary text-center">
        Alerts trigger automatically upon extreme whale order activity.
      </div>
    </div>
  );
}
