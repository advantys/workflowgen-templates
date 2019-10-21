package com.workflowgenexample;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.oblador.keychain.KeychainPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;


import java.util.ArrayList;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {
    private ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            ArrayList<ReactPackage> packages = new ArrayList<>();

            packages.add(new MainReactPackage());
            packages.add(new AsyncStoragePackage());
            packages.add(new RNGestureHandlerPackage());
            packages.add(new KeychainPackage());
            packages.add(new VectorIconsPackage());
            packages.add(new WorkflowGenExamplePackage());

            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, false);
    }
}
