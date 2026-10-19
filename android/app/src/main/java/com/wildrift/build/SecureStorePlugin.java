package com.wildrift.build;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * Stores small secrets (the user's AI key) encrypted with AES-256-GCM. The AES key is generated inside the Android
 * Keystore and never leaves it, so the stored blob is useless without this device and this app.
 * Nothing sensitive is ever logged.
 */
@CapacitorPlugin(name = "SecureStore")
public class SecureStorePlugin extends Plugin {
    private static final String ALIAS = "riftbuild_secure_key";
    private static final String PREFS = "riftbuild_secure";
    private static final int IV_BYTES = 12;

    private SharedPreferences prefs() { return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE); }

    private SecretKey key() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        if (ks.containsAlias(ALIAS)) return (SecretKey) ks.getKey(ALIAS, null);
        KeyGenerator kg = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        kg.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build());
        return kg.generateKey();
    }

    @PluginMethod public void set(PluginCall call) {
        String name = call.getString("name"), value = call.getString("value");
        if (name == null || value == null) { call.reject("bad-args"); return; }
        try {
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.ENCRYPT_MODE, key());
            byte[] iv = c.getIV(), ct = c.doFinal(value.getBytes(StandardCharsets.UTF_8));
            byte[] all = new byte[iv.length + ct.length];
            System.arraycopy(iv, 0, all, 0, iv.length);
            System.arraycopy(ct, 0, all, iv.length, ct.length);
            prefs().edit().putString(name, Base64.encodeToString(all, Base64.NO_WRAP)).apply();
            call.resolve();
        } catch (Exception e) {
            call.reject("secure-store-failed");
        }
    }

    @PluginMethod public void get(PluginCall call) {
        String name = call.getString("name");
        String enc = name == null ? null : prefs().getString(name, null);
        if (enc == null) { call.resolve(new JSObject().put("value", "")); return; }
        try {
            byte[] all = Base64.decode(enc, Base64.NO_WRAP);
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, all, 0, IV_BYTES));
            String value = new String(c.doFinal(all, IV_BYTES, all.length - IV_BYTES), StandardCharsets.UTF_8);
            call.resolve(new JSObject().put("value", value));
        } catch (Exception e) {
            // the Keystore key is gone (device restore, security reset): the blob can never be read again, so drop it
            prefs().edit().remove(name).apply();
            call.resolve(new JSObject().put("value", ""));
        }
    }

    @PluginMethod public void remove(PluginCall call) {
        String name = call.getString("name");
        if (name != null) prefs().edit().remove(name).apply();
        call.resolve();
    }
}
