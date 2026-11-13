package com.attendance.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

public class AttendanceWidgetProvider extends AppWidgetProvider {

    private static final int[] ROWS = { R.id.widget_row1, R.id.widget_row2, R.id.widget_row3, R.id.widget_row4 };

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) mgr.updateAppWidget(id, build(ctx));
    }

    public static void refreshAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, AttendanceWidgetProvider.class));
        for (int id : ids) mgr.updateAppWidget(id, build(ctx));
    }

    static RemoteViews build(Context ctx) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_attendance);
        String overall = "\u2014";
        for (int r : ROWS) v.setViewVisibility(r, View.GONE);

        try {
            String json = ctx.getSharedPreferences("attendance_widget", Context.MODE_PRIVATE)
                             .getString("data", null);
            if (json != null) {
                JSONObject o = new JSONObject(json);
                if (!o.isNull("overallPct")) overall = o.getInt("overallPct") + "%";
                JSONArray subs = o.optJSONArray("subjects");
                if (subs != null) {
                    for (int i = 0; i < subs.length() && i < ROWS.length; i++) {
                        JSONObject s = subs.getJSONObject(i);
                        String pct = s.isNull("pct") ? "\u2014" : s.getInt("pct") + "%";
                        v.setTextViewText(ROWS[i], s.optString("name", "") + "  " + pct);
                        try { v.setTextColor(ROWS[i], Color.parseColor(s.optString("color", "#ff6e6e"))); }
                        catch (Exception ignored) { v.setTextColor(ROWS[i], Color.WHITE); }
                        v.setViewVisibility(ROWS[i], View.VISIBLE);
                    }
                }
            }
        } catch (Exception ignored) { }

        v.setTextViewText(R.id.widget_overall, overall);

        Intent launch = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (launch != null) {
            PendingIntent pi = PendingIntent.getActivity(ctx, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            v.setOnClickPendingIntent(R.id.widget_root, pi);
        }
        return v;
    }
}
