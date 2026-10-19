package com.wildrift.build;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Floating build over the game, built to stay out of the way:
 * a 40dp translucent bubble (shows the next item to buy) that snaps to a screen edge, and on tap a one-row panel
 * with the six items + boots, the rune and the spells. The panel folds itself after a few seconds; X closes everything.
 */
public class OverlayService extends Service {
    /** Set by the Capacitor plugin so the web layer learns when the user closes the overlay natively. */
    public static Runnable onClose;
    /** The bubble is pointless while the app itself is on screen, so the web layer hides it then. */
    private static OverlayService instance;
    private static boolean hiddenWanted = true;

    public static void setHidden(boolean hidden) {
        hiddenWanted = hidden;
        OverlayService s = instance;
        if (s != null) s.handler.post(s::applyHidden);
    }

    private void applyHidden() { if (root != null) root.setVisibility(hiddenWanted ? View.GONE : View.VISIBLE); }

    private static final int BUBBLE_DP = 40, ICON_DP = 34, FOLD_MS = 7000;
    private WindowManager wm;
    private LinearLayout root, panel;
    private ImageView bubbleIcon;
    private TextView bubbleText;
    private WindowManager.LayoutParams lp;
    private String closeLabel = "Close";
    private final Handler handler = new Handler(Looper.getMainLooper());
    // objective respawn timers: id -> end time (ms). They live in the service, so they keep counting while the panel is folded.
    private final Map<String, Long> ends = new HashMap<>();
    private final Map<String, TextView> timerViews = new LinkedHashMap<>();
    private final Map<String, String> timerNames = new HashMap<>();
    private Bitmap firstIcon;
    private final Runnable tick = new Runnable() {
        @Override public void run() { refreshTimers(); if (!ends.isEmpty()) handler.postDelayed(this, 1000); }
    };
    private final Runnable fold = () -> { if (panel != null) { panel.setVisibility(View.GONE); snapToEdge(); } };

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public void onCreate() { super.onCreate(); instance = this; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "hide".equals(intent.getAction())) { closeAll(); return START_NOT_STICKY; }
        if (intent != null && intent.hasExtra("data")) {
            try { closeLabel = new JSONObject(intent.getStringExtra("data")).optString("close", closeLabel); } catch (Exception ignored) { }
        }
        startFg();
        if (root == null) createView();
        if (intent != null && intent.hasExtra("data")) render(intent.getStringExtra("data"));
        return START_NOT_STICKY;
    }

    private void closeAll() {
        Runnable r = onClose;
        stopSelf();
        if (r != null) r.run();
    }

    private void startFg() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel("overlay", "RiftBuild", NotificationManager.IMPORTANCE_MIN));
        PendingIntent close = PendingIntent.getService(this, 1, new Intent(this, OverlayService.class).setAction("hide"),
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification n = new Notification.Builder(this, "overlay")
            .setSmallIcon(R.mipmap.ic_launcher).setContentTitle("RiftBuild")
            .addAction(new Notification.Action.Builder(null, closeLabel, close).build()).build();
        if (Build.VERSION.SDK_INT >= 34) startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(1, n);
    }

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density + 0.5f); }

    private Bitmap icon(String kind, String slug) {
        try (InputStream in = getAssets().open("public/" + kind + "/" + slug + ".png")) {
            return BitmapFactory.decodeStream(in);
        } catch (Exception e) { return null; }
    }

    private void createView() {
        wm = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);

        // Bubble: translucent yellow ring around the next item to buy
        LinearLayout bubble = new LinearLayout(this);
        bubble.setGravity(Gravity.CENTER);
        GradientDrawable bg = new GradientDrawable();
        bg.setShape(GradientDrawable.OVAL);
        bg.setColor(Color.parseColor("#FFD23F"));
        bubble.setBackground(bg);
        bubble.setAlpha(0.8f);
        bubbleIcon = new ImageView(this);
        bubbleIcon.setScaleType(ImageView.ScaleType.CENTER_CROP);
        bubbleText = new TextView(this);
        bubbleText.setText("RB");
        bubbleText.setTextColor(Color.parseColor("#1D1A05"));
        bubbleText.setTextSize(13);
        bubbleText.setTypeface(null, android.graphics.Typeface.BOLD);
        bubble.addView(bubbleIcon, new LinearLayout.LayoutParams(dp(BUBBLE_DP - 8), dp(BUBBLE_DP - 8)));
        bubble.addView(bubbleText);
        bubbleIcon.setVisibility(View.GONE);
        root.addView(bubble, new LinearLayout.LayoutParams(dp(BUBBLE_DP), dp(BUBBLE_DP)));

        panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setPadding(dp(8), dp(6), dp(8), dp(6));
        GradientDrawable pbg = new GradientDrawable();
        pbg.setCornerRadius(dp(12));
        pbg.setColor(Color.parseColor("#F0143626"));
        pbg.setStroke(dp(1), Color.parseColor("#2EEEF3EA"));
        panel.setBackground(pbg);
        panel.setVisibility(View.GONE);
        LinearLayout.LayoutParams plp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        plp.topMargin = dp(4);
        root.addView(panel, plp);

        lp = new WindowManager.LayoutParams(WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, PixelFormat.TRANSLUCENT);
        lp.gravity = Gravity.TOP | Gravity.START;
        lp.x = 0;
        lp.y = dp(140);

        bubble.setOnTouchListener(new View.OnTouchListener() {
            int sx, sy; float tx, ty; boolean moved;
            @Override public boolean onTouch(View v, MotionEvent e) {
                switch (e.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        sx = lp.x; sy = lp.y; tx = e.getRawX(); ty = e.getRawY(); moved = false; return true;
                    case MotionEvent.ACTION_MOVE:
                        float dx = e.getRawX() - tx, dy = e.getRawY() - ty;
                        if (Math.abs(dx) > dp(6) || Math.abs(dy) > dp(6)) moved = true;
                        if (moved) { lp.x = sx + (int) dx; lp.y = sy + (int) dy; wm.updateViewLayout(root, lp); }
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (moved) snapToEdge(); else togglePanel();
                        return true;
                }
                return false;
            }
        });
        wm.addView(root, lp);
        snapToEdge();
        applyHidden();
    }

    private int screenW() {
        DisplayMetrics m = new DisplayMetrics();
        wm.getDefaultDisplay().getRealMetrics(m);
        return m.widthPixels;
    }

    private void snapToEdge() {
        int w = screenW(), b = dp(BUBBLE_DP);
        lp.x = (lp.x + b / 2 < w / 2) ? 0 : w - b;
        wm.updateViewLayout(root, lp);
    }

    private void togglePanel() {
        handler.removeCallbacks(fold);
        if (panel.getVisibility() == View.VISIBLE) { panel.setVisibility(View.GONE); snapToEdge(); return; }
        panel.setVisibility(View.VISIBLE);
        // keep the panel fully on screen, whichever edge the bubble sits on
        panel.measure(View.MeasureSpec.UNSPECIFIED, View.MeasureSpec.UNSPECIFIED);
        lp.x = Math.max(0, Math.min(lp.x, screenW() - Math.max(panel.getMeasuredWidth(), dp(BUBBLE_DP))));
        wm.updateViewLayout(root, lp);
        handler.postDelayed(fold, FOLD_MS);
    }

    private void render(String json) {
        try {
            JSONObject d = new JSONObject(json);
            panel.removeAllViews();

            LinearLayout head = new LinearLayout(this);
            head.setGravity(Gravity.CENTER_VERTICAL);
            TextView title = label(d.optString("title"), 12, true);
            head.addView(title, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
            TextView open = label(d.optString("open", "Open"), 12, false);
            open.setTextColor(Color.parseColor("#FFD23F"));
            open.setPadding(dp(12), 0, dp(12), 0);
            open.setGravity(Gravity.CENTER);
            open.setOnClickListener(v -> openAppWindow());
            head.addView(open, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(44)));
            View x = new CloseView(this);
            x.setContentDescription(d.optString("close", "Close"));
            x.setOnClickListener(v -> closeAll());
            head.addView(x, new LinearLayout.LayoutParams(dp(44), dp(44)));
            panel.addView(head);

            LinearLayout row = new LinearLayout(this);
            row.setGravity(Gravity.CENTER_VERTICAL);
            JSONArray items = d.optJSONArray("items");
            Bitmap first = null;
            for (int i = 0; items != null && i < items.length(); i++) {
                JSONObject it = items.getJSONObject(i);
                Bitmap bm = icon("items", it.optString("i"));
                if (i == 0) first = bm;
                row.addView(cell(bm, it.optString("n")), cellLp());
            }
            JSONObject boots = d.optJSONObject("boots");
            if (boots != null) row.addView(cell(icon("items", boots.optString("i")), boots.optString("n")), cellLp());
            panel.addView(row);

            // second row: keystone rune and summoner spells, with names beside the icons
            LinearLayout row2 = new LinearLayout(this);
            row2.setGravity(Gravity.CENTER_VERTICAL);
            row2.setPadding(0, dp(6), 0, 0);
            JSONObject rune = d.optJSONObject("rune");
            if (rune != null) row2.addView(cell(icon("runes", rune.optString("i")), rune.optString("n")), cellLp());
            JSONArray spells = d.optJSONArray("spells");
            for (int i = 0; spells != null && i < spells.length(); i++) {
                JSONObject sp = spells.getJSONObject(i);
                row2.addView(cell(icon("spells", sp.optString("i")), sp.optString("n")), cellLp());
            }
            TextView foot = label(d.optString("foot"), 11, false);
            foot.setTextColor(Color.parseColor("#A9C0B0"));
            foot.setPadding(dp(6), 0, 0, 0);
            row2.addView(foot);
            panel.addView(row2);

            firstIcon = first;

            // third row: one button per objective; tap = start (or restart) its respawn countdown, long-press = cancel
            timerViews.clear();
            JSONArray tms = d.optJSONArray("timers");
            if (tms != null && tms.length() > 0) {
                LinearLayout row3 = new LinearLayout(this);
                row3.setPadding(0, dp(6), 0, 0);
                for (int i = 0; i < tms.length(); i++) {
                    JSONObject tm = tms.getJSONObject(i);
                    final String id = tm.optString("id");
                    final long secs = tm.optLong("secs", 300);
                    timerNames.put(id, tm.optString("n", id));
                    TextView b = new TextView(this);
                    b.setGravity(Gravity.CENTER);
                    b.setTextSize(12);
                    b.setTypeface(null, android.graphics.Typeface.BOLD);
                    b.setOnClickListener(v -> {
                        ends.put(id, System.currentTimeMillis() + secs * 1000);
                        handler.removeCallbacks(tick); handler.post(tick);
                        if (panel.getVisibility() == View.VISIBLE) { handler.removeCallbacks(fold); handler.postDelayed(fold, FOLD_MS); }
                    });
                    b.setOnLongClickListener(v -> { ends.remove(id); refreshTimers(); return true; });
                    timerViews.put(id, b);
                    LinearLayout.LayoutParams lp3 = new LinearLayout.LayoutParams(0, dp(36), 1f);
                    lp3.rightMargin = dp(3);
                    row3.addView(b, lp3);
                }
                panel.addView(row3);
            }
            refreshTimers();
            // a changed build while the panel is open restarts the fold timer
            if (panel.getVisibility() == View.VISIBLE) { handler.removeCallbacks(fold); handler.postDelayed(fold, FOLD_MS); }
        } catch (Exception ignored) { /* keep the previous render */ }
    }

    private void styleTimer(TextView t, boolean on, String text) {
        t.setText(text);
        t.setTextColor(Color.parseColor(on ? "#1D1A05" : "#EEF3EA"));
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(8));
        g.setColor(Color.parseColor(on ? "#FFD23F" : "#1B4631"));
        t.setBackground(g);
    }

    private static String mmss(long secs) { return (secs / 60) + ":" + String.format(java.util.Locale.US, "%02d", secs % 60); }

    /** Repaints every timer button and the bubble (the soonest remaining time replaces the item icon). */
    private void refreshTimers() {
        long now = System.currentTimeMillis(), soonest = Long.MAX_VALUE;
        for (String id : new java.util.ArrayList<>(ends.keySet())) {
            long left = (ends.get(id) - now + 999) / 1000;
            if (left <= 0) {
                ends.remove(id);
                Vibrator vb = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (vb != null) vb.vibrate(VibrationEffect.createWaveform(new long[]{0, 250, 120, 250}, -1));
            } else soonest = Math.min(soonest, left);
        }
        for (Map.Entry<String, TextView> e : timerViews.entrySet()) {
            Long end = ends.get(e.getKey());
            String name = timerNames.get(e.getKey());
            if (end == null) styleTimer(e.getValue(), false, name);
            else styleTimer(e.getValue(), true, name + " " + mmss(Math.max(0, (end - now + 999) / 1000)));
        }
        if (bubbleText == null) return;
        if (soonest != Long.MAX_VALUE) {
            bubbleIcon.setVisibility(View.GONE); bubbleText.setVisibility(View.VISIBLE); bubbleText.setText(mmss(soonest)); bubbleText.setTextSize(12);
        } else if (firstIcon != null) {
            bubbleIcon.setImageBitmap(firstIcon); bubbleIcon.setVisibility(View.VISIBLE); bubbleText.setVisibility(View.GONE);
        } else { bubbleIcon.setVisibility(View.GONE); bubbleText.setVisibility(View.VISIBLE); bubbleText.setText("RB"); bubbleText.setTextSize(13); }
    }

    /** An icon cell; when the bitmap is missing it shows the name's first letters instead of an empty square. */
    private View cell(Bitmap bm, String name) {
        if (bm != null) return thumb(bm);
        TextView t = new TextView(this);
        t.setText(name == null || name.length() < 2 ? "?" : name.substring(0, 2));
        t.setTextColor(Color.parseColor("#EEF3EA"));
        t.setTextSize(11);
        t.setGravity(Gravity.CENTER);
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(6));
        g.setColor(Color.parseColor("#1B4631"));
        t.setBackground(g);
        return t;
    }

    /** Opens the full app as a floating window: freeform launch bounds where the device honours them, else normally. */
    private void openAppWindow() {
        Intent i = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        try {
            int w = dp(340), h = dp(520), x = Math.max(0, (screenW() - w) / 2), y = dp(90);
            android.app.ActivityOptions o = android.app.ActivityOptions.makeBasic();
            o.setLaunchBounds(new android.graphics.Rect(x, y, x + w, y + h));
            startActivity(i, o.toBundle());
        } catch (Exception e) {
            startActivity(i);
        }
        panel.setVisibility(View.GONE);
        snapToEdge();
    }

    private TextView label(String s, int sp, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextColor(Color.parseColor("#EEF3EA"));
        t.setTextSize(sp);
        if (bold) t.setTypeface(null, android.graphics.Typeface.BOLD);
        return t;
    }

    private ImageView thumb(Bitmap bm) {
        ImageView v = new ImageView(this);
        v.setScaleType(ImageView.ScaleType.CENTER_CROP);
        if (bm != null) v.setImageBitmap(bm);
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(6));
        g.setColor(Color.parseColor("#1B4631"));
        v.setBackground(g);
        v.setClipToOutline(true);
        return v;
    }

    private LinearLayout.LayoutParams cellLp() {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(dp(ICON_DP), dp(ICON_DP));
        p.rightMargin = dp(3);
        return p;
    }

    /** A drawn X: two chalk strokes, no font glyph. */
    private static class CloseView extends View {
        private final android.graphics.Paint p = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        CloseView(Context c) {
            super(c);
            p.setColor(Color.parseColor("#EEF3EA"));
            p.setStrokeWidth(c.getResources().getDisplayMetrics().density * 2f);
            p.setStrokeCap(android.graphics.Paint.Cap.ROUND);
        }
        @Override protected void onDraw(android.graphics.Canvas cv) {
            float m = getWidth() * 0.34f, w = getWidth(), h = getHeight();
            cv.drawLine(m, h / 2 - (w / 2 - m), w - m, h / 2 + (w / 2 - m), p);
            cv.drawLine(w - m, h / 2 - (w / 2 - m), m, h / 2 + (w / 2 - m), p);
        }
    }

    @Override public void onDestroy() {
        if (instance == this) instance = null;
        handler.removeCallbacks(fold);
        handler.removeCallbacks(tick);
        if (root != null) { wm.removeView(root); root = null; }
        super.onDestroy();
    }
}
