package com.wildrift.build;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import android.net.Uri;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Overlay", permissions = { @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications") })
public class OverlayPlugin extends Plugin {
    @Override public void load() {
        // closing from the bubble's X or the notification tells the web layer to flip its toggle off
        OverlayService.onClose = () -> notifyListeners("closed", new JSObject());
    }

    private boolean notifEnabled() { return NotificationManagerCompat.from(getContext()).areNotificationsEnabled(); }

    /** Are the app's notifications visible? (the bubble's way back lives there) */
    @PluginMethod public void notifState(PluginCall call) {
        call.resolve(new JSObject().put("enabled", notifEnabled()));
    }

    @PluginMethod public void requestNotifications(PluginCall call) {
        if (notifEnabled() || Build.VERSION.SDK_INT < 33) { call.resolve(new JSObject().put("enabled", notifEnabled())); return; }
        requestPermissionForAlias("notifications", call, "notifResult");
    }

    @PermissionCallback private void notifResult(PluginCall call) {
        call.resolve(new JSObject().put("enabled", notifEnabled()));
    }

    @PluginMethod public void openNotificationSettings(PluginCall call) {
        Intent i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }

    @PluginMethod public void canDraw(PluginCall call) {
        call.resolve(new JSObject().put("granted", Settings.canDrawOverlays(getContext())));
    }

    @PluginMethod public void requestPermission(PluginCall call) {
        Intent i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getContext().getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }

    /** Also used for updates: (re)starts the service with the latest build JSON. */
    @PluginMethod public void show(PluginCall call) {
        if (!Settings.canDrawOverlays(getContext())) { call.reject("no-permission"); return; }
        getContext().startForegroundService(new Intent(getContext(), OverlayService.class).putExtra("data", call.getString("data", "{}")));
        call.resolve();
    }

    @PluginMethod public void setHidden(PluginCall call) {
        OverlayService.setHidden(Boolean.TRUE.equals(call.getBoolean("hidden", true)));
        call.resolve();
    }

    @PluginMethod public void hide(PluginCall call) {
        getContext().startService(new Intent(getContext(), OverlayService.class).setAction("hide"));
        call.resolve();
    }
}
