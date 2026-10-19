package com.wildrift.build;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Overlay")
public class OverlayPlugin extends Plugin {
    @Override public void load() {
        // closing from the bubble's X or the notification tells the web layer to flip its toggle off
        OverlayService.onClose = () -> notifyListeners("closed", new JSObject());
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
