---
title: HTML Android Application, Project Setup
date: 2012-06-25
layout: article.html
summary: If you don't know much of Android application development, or just want to achieve something fairly simple, one of the options might be to create your app in HTML5 and JavaScript combination and let Android only to supply the browser window.
---

If you don't know much of Android application development, or just want to achieve something fairly simple, one of the options might be to create your app in HTML and JavaScript combination and let Android only to supply the browser window.

![](/images/android-html.jpg)

For the development I use standard combination: Eclipse with Android development plugin.

## Create New Project

In Eclipse, create new Android project as usual by hitting File > New ... > Android Project. Fill in the Project Name field and proceed. My build target would be Android 2.1 (API ver. 7). Go to the next screen and fill in the package name (colud be something similar to com.mydomain.applicationName) and leave other fields in their defaults.

## Android Part

First update the AndroidManifest.xml. It is located in your android project root folder. There will be just few updates in this file, I marked them bold. I don't want my app to respond to phone orientation change (android:screenOrientation parameter of the activity tag)  and I want to use whole screen (android:theme parameter of the activity tag).

    <?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns:android="http://schemas.android.com/apk/res/android"
        package="cz.sprinters.bb"
        android:versionCode="1"
        android:versionName="1.0" >

        <uses-sdk android:minSdkVersion="7"/>

        <application
            android:icon="@drawable/ic_launcher"
            android:label="@string/app_name" >
            <activity
                android:name=".ProjectNameActivity"
                android:label="@string/app_name"
                android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
                android:screenOrientation="portrait" >
                <intent-filter>
                    <action android:name="android.intent.action.MAIN" />

                    <category android:name="android.intent.category.LAUNCHER" />
                </intent-filter>
            </activity>
        </application>

    </manifest>

Now remove all the content of file /res/layout/main.xml in your project folder and paste this instead:

    <?xml version="1.0" encoding="utf-8"?>
    <WebView xmlns:android="http://schemas.android.com/apk/res/android"
        android:id="@+id/webView"
        android:layout_width="fill_parent"
        android:layout_height="fill_parent"
    />

Then open file called /src/package.name/ProjectNameActivity.java. There will be only a few lines in it.

    package package.name;

    import android.app.Activity;
    import android.os.Bundle;

    public class ProjectNameActivity extends Activity {
        /** Called when the activity is first created. */
        @Override
        public void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.main);
        }
    }

    Let's put some more in.

    package cz.sprinters.bb;

    import android.app.Activity;
    import android.os.Bundle;
    import android.view.MotionEvent;
    import android.view.View;
    import android.webkit.WebView;
    import android.webkit.WebViewClient;

    public class BangAppActivity extends Activity {
        /** Called when the activity is first created. */
        @Override
        public void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.main);
            WebView webview = (WebView) findViewById(R.id.webView);
            webview.getSettings().setJavaScriptEnabled(true);

            webview.setWebViewClient(new WebViewClient()); // all links user clicks open in my web view
            // disable scroll on touch (not 100% if drag will still work, but I want to prevent scrolling for now)
            webview.setOnTouchListener(new View.OnTouchListener() {
              public boolean onTouch(View v, MotionEvent event) {
                return (event.getAction() == MotionEvent.ACTION_MOVE);
              }
            });

            webview.loadUrl("file:///android_asset/www/index.html");
        }
    }

## HTML Part

Open the assets folder in your project dir and create new file with path /assets/www/index.html. That would be the page where all the wild action is going to happen. You can fill it with one big canvas, for a start. Notice the viewport meta tag, it gives the mobile browser some directions how to behave.

    <?xml version="1.0" encoding="UTF-8"?>
    <!doctype html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, target-densitydpi=device-dpi">
    <title>My Application</title>
    </head>
    <body>
        <p>Put some HTML here.</p>
    </body>
    </html>

The End.