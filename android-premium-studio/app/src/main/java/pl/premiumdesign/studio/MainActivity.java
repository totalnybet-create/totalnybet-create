package pl.premiumdesign.studio;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.PopupMenu;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String HOME_URL = "https://premium-design-studio-snm7kd.v2.appdeploy.ai/";
    private static final String APP_HOST = "premium-design-studio-snm7kd.v2.appdeploy.ai";
    private static final int FILE_CHOOSER_REQUEST = 4102;

    private WebView webView;
    private ProgressBar progress;
    private ValueCallback<Uri[]> filePathCallback;
    private Uri lastExportUri;
    private boolean immersive = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(11, 11, 12));
        getWindow().setNavigationBarColor(Color.rgb(11, 11, 12));
        getWindow().setSoftInputMode(android.view.WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        buildUi();
        configureWebView();
        if (savedInstanceState == null) {
            webView.loadUrl(HOME_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void buildUi() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(11, 11, 12));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(11, 11, 12));
        root.addView(webView, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgress(0);
        FrameLayout.LayoutParams pp = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(2));
        pp.gravity = Gravity.TOP;
        root.addView(progress, pp);

        TextView menu = new TextView(this);
        menu.setText("⋮");
        menu.setTextColor(Color.rgb(238, 232, 223));
        menu.setTextSize(26);
        menu.setGravity(Gravity.CENTER);
        menu.setContentDescription("Menu aplikacji");
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.argb(190, 18, 18, 19));
        bg.setStroke(dp(1), Color.argb(90, 215, 181, 142));
        bg.setCornerRadius(dp(22));
        menu.setBackground(bg);
        menu.setOnClickListener(this::showNativeMenu);
        FrameLayout.LayoutParams mp = new FrameLayout.LayoutParams(dp(44), dp(44));
        mp.gravity = Gravity.TOP | Gravity.END;
        mp.topMargin = dp(10);
        mp.rightMargin = dp(10);
        root.addView(menu, mp);

        setContentView(root);
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setCacheMode(isOnline() ? WebSettings.LOAD_DEFAULT : WebSettings.LOAD_CACHE_ELSE_NETWORK);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " PremiumDesignStudioAndroid/1.0");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            s.setSafeBrowsingEnabled(true);
        }

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progress.setProgress(newProgress);
                progress.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                try {
                    Intent chooser = params.createIntent();
                    chooser.addCategory(Intent.CATEGORY_OPENABLE);
                    chooser.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    startActivityForResult(chooser, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception e) {
                    filePathCallback = null;
                    Toast.makeText(MainActivity.this, "Nie można otworzyć wyboru plików.", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return routeUri(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return routeUri(Uri.parse(url));
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    Toast.makeText(MainActivity.this, "Brak połączenia — próbuję użyć pamięci podręcznej.", Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                if (request.isForMainFrame() && errorResponse.getStatusCode() >= 500) {
                    Toast.makeText(MainActivity.this, "Serwer chwilowo nie odpowiada.", Toast.LENGTH_SHORT).show();
                }
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            if (url != null && url.startsWith("blob:")) {
                Toast.makeText(this, "Eksport przejmie natywna warstwa aplikacji.", Toast.LENGTH_SHORT).show();
                return;
            }
            try {
                String filename = URLUtil.guessFileName(url, contentDisposition, mimeType);
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setTitle(filename);
                request.setMimeType(mimeType);
                request.addRequestHeader("User-Agent", userAgent);
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);
                ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(request);
                Toast.makeText(this, "Pobieranie rozpoczęte.", Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
                Toast.makeText(this, "Nie udało się pobrać pliku.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private boolean routeUri(Uri uri) {
        if (uri == null) return false;
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
        if (("https".equals(scheme) || "http".equals(scheme)) && APP_HOST.equalsIgnoreCase(uri.getHost())) {
            return false;
        }
        if ("blob".equals(scheme) || "data".equals(scheme)) return false;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(this, "Brak aplikacji do otwarcia tego linku.", Toast.LENGTH_SHORT).show();
        }
        return true;
    }

    private void showNativeMenu(View anchor) {
        PopupMenu popup = new PopupMenu(this, anchor);
        popup.getMenu().add(0, 1, 0, "Odśwież");
        popup.getMenu().add(0, 2, 1, "Wstecz");
        popup.getMenu().add(0, 3, 2, "Dalej");
        popup.getMenu().add(0, 4, 3, "Strona główna");
        popup.getMenu().add(0, 5, 4, "Udostępnij projekt");
        popup.getMenu().add(0, 6, 5, "Udostępnij ostatni eksport");
        popup.getMenu().add(0, 7, 6, immersive ? "Wyłącz pełny ekran" : "Pełny ekran");
        popup.getMenu().add(0, 8, 7, "Otwórz w przeglądarce");
        popup.getMenu().add(0, 9, 8, "Wyczyść cache");
        popup.getMenu().add(0, 10, 9, "Informacje");
        popup.setOnMenuItemClickListener(item -> {
            switch (item.getItemId()) {
                case 1: webView.reload(); return true;
                case 2: if (webView.canGoBack()) webView.goBack(); return true;
                case 3: if (webView.canGoForward()) webView.goForward(); return true;
                case 4: webView.loadUrl(HOME_URL); return true;
                case 5: shareCurrentProject(); return true;
                case 6: shareLastExport(); return true;
                case 7: toggleImmersive(); return true;
                case 8: openInBrowser(); return true;
                case 9: webView.clearCache(true); Toast.makeText(this, "Cache wyczyszczony.", Toast.LENGTH_SHORT).show(); return true;
                case 10: showAbout(); return true;
                default: return false;
            }
        });
        popup.show();
    }

    private void shareCurrentProject() {
        String url = webView.getUrl() == null ? HOME_URL : webView.getUrl();
        Intent share = new Intent(Intent.ACTION_SEND);
        share.setType("text/plain");
        share.putExtra(Intent.EXTRA_SUBJECT, "Premium Design Studio");
        share.putExtra(Intent.EXTRA_TEXT, url);
        startActivity(Intent.createChooser(share, "Udostępnij"));
    }

    private void shareLastExport() {
        if (lastExportUri == null) {
            Toast.makeText(this, "Najpierw wykonaj Eksport HTML.", Toast.LENGTH_SHORT).show();
            return;
        }
        Intent share = new Intent(Intent.ACTION_SEND);
        share.setType("text/html");
        share.putExtra(Intent.EXTRA_STREAM, lastExportUri);
        share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        startActivity(Intent.createChooser(share, "Udostępnij eksport"));
    }

    private void openInBrowser() {
        String url = webView.getUrl() == null ? HOME_URL : webView.getUrl();
        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
    }

    private void showAbout() {
        new AlertDialog.Builder(this)
                .setTitle("Premium Design Studio")
                .setMessage("Android 1.0\nAI Art Director · Color Studio · Premium Design DNA\nNatywny eksport, pliki, share, cache/offline i bezpieczna nawigacja.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void toggleImmersive() {
        immersive = !immersive;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                if (immersive) {
                    controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                } else {
                    controller.show(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                }
            }
        } else {
            if (immersive) {
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
            } else {
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
            }
        }
    }

    private boolean isOnline() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return false;
        Network network = cm.getActiveNetwork();
        if (network == null) return false;
        NetworkCapabilities caps = cm.getNetworkCapabilities(network);
        return caps != null && (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) || caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) || caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET));
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.getSettings().setCacheMode(isOnline() ? WebSettings.LOAD_DEFAULT : WebSettings.LOAD_CACHE_ELSE_NETWORK);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && filePathCallback != null) {
            Uri[] results = null;
            if (resultCode == RESULT_OK) {
                if (data != null && data.getClipData() != null) {
                    ClipData clip = data.getClipData();
                    results = new Uri[clip.getItemCount()];
                    for (int i = 0; i < clip.getItemCount(); i++) results[i] = clip.getItemAt(i).getUri();
                } else {
                    results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                }
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface("AndroidBridge");
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private final class AndroidBridge {
        @JavascriptInterface
        public void saveTextFile(String filename, String text) {
            if (filename == null || filename.trim().isEmpty()) filename = "premium-site.html";
            final String safeName = filename.replaceAll("[^a-zA-Z0-9._-]", "-");
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, safeName);
                    values.put(MediaStore.Downloads.MIME_TYPE, "text/html");
                    values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/PremiumDesignStudio");
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) throw new IllegalStateException("Cannot create export");
                    try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                        if (out == null) throw new IllegalStateException("Cannot open export");
                        out.write(text.getBytes(StandardCharsets.UTF_8));
                    }
                    lastExportUri = uri;
                } else {
                    File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "PremiumDesignStudio");
                    if (!dir.exists() && !dir.mkdirs()) throw new IllegalStateException("Cannot create directory");
                    File file = new File(dir, safeName);
                    try (FileOutputStream out = new FileOutputStream(file)) {
                        out.write(text.getBytes(StandardCharsets.UTF_8));
                    }
                    lastExportUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".files", file);
                }
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Eksport zapisany w Downloads/PremiumDesignStudio.", Toast.LENGTH_LONG).show());
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Nie udało się zapisać eksportu.", Toast.LENGTH_LONG).show());
            }
        }

        @JavascriptInterface
        public void shareCurrent() {
            runOnUiThread(MainActivity.this::shareCurrentProject);
        }

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }
    }
}
