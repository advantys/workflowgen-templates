package com.workflowgenexample

import android.app.Application

import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader
import com.oblador.keychain.KeychainPackage
import com.oblador.vectoricons.VectorIconsPackage
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage

import java.util.Arrays

@Suppress("UNUSED")
class MainApplication : Application(), ReactApplication {
    private val mReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport() = BuildConfig.DEBUG

        override fun getPackages() =
            Arrays.asList<ReactPackage>(
                    MainReactPackage(),
                    RNGestureHandlerPackage(),
                    AsyncStoragePackage(),
                    KeychainPackage(),
                    VectorIconsPackage(),
                    WorkflowGenExamplePackage()
            )

        override fun getJSMainModuleName() = "index"
    }

    override fun getReactNativeHost() = mReactNativeHost

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, /* native exopackage */ false)
    }
}
