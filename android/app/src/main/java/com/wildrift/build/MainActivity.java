package com.wildrift.build;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle b) {
        registerPlugin(OverlayPlugin.class);
        super.onCreate(b);
    }
}
