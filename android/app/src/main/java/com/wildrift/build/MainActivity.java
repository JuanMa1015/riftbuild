package com.wildrift.build;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle b) {
        registerPlugin(OverlayPlugin.class);
        registerPlugin(SecureStorePlugin.class);
        super.onCreate(b);
    }

    // The bubble belongs to the native lifecycle, not to JavaScript (which can be throttled in the background):
    // hidden while the app is on screen, back as soon as it is not.
    @Override public void onResume() { super.onResume(); OverlayService.appForeground(true); }
    @Override public void onPause() { OverlayService.appForeground(false); super.onPause(); }
}
