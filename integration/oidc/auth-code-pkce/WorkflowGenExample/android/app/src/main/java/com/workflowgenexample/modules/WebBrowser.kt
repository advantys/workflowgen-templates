package com.workflowgenexample.modules

import android.net.Uri
import android.webkit.URLUtil
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.lang.Exception

class WebBrowser constructor(
        reactContext: ReactApplicationContext
    ) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val CHROME_TABS_ON_SHOW = "ChromeTabsOnShow"
        const val CHROME_TABS_ON_DISMISS = "ChromeTabsOnDismiss"
    }

    private val lifecycleEventListener = object : LifecycleEventListener {
        override fun onHostResume() = sendEvent(
                reactContext = reactApplicationContext,
                eventName = CHROME_TABS_ON_DISMISS
        )

        override fun onHostDestroy() {}
        override fun onHostPause() {}
    }

    init {
        reactContext.addLifecycleEventListener(lifecycleEventListener)
    }

    override fun getName() = "WebBrowser"

    override fun getConstants(): MutableMap<String, Any>
    = mutableMapOf(
        "ChromeTabsOnShow" to CHROME_TABS_ON_SHOW,
        "ChromeTabsOnDismiss" to CHROME_TABS_ON_DISMISS
    )

    @ReactMethod
    @Suppress("UNUSED")
    fun show(options: ReadableMap, promise: Promise) {
        val url = options.getString("url") ?: String()

        if (url.isEmpty() || (!URLUtil.isHttpsUrl(url) and !URLUtil.isHttpUrl(url))) {
            promise.reject(JSApplicationIllegalArgumentException("A valid url must be passed."))
            return
        }

        val webBrowserConnection = WebBrowserServiceConnection(reactApplicationContext, Uri.parse(url))

        webBrowserConnection.bindCustomTabsService()

        try {
            val intent = webBrowserConnection.createCustomTabsIntent()

            sendEvent(reactContext = reactApplicationContext, eventName = CHROME_TABS_ON_SHOW)
            currentActivity?.startActivity(intent)
            promise.resolve(true)
        } catch (err: Exception) {
            when (err) {
                is JSApplicationIllegalArgumentException, is UnexpectedNativeTypeException ->
                    promise.reject(err)
                else -> promise.reject(JSApplicationIllegalArgumentException(
                        "Could not open URL \"$url\": ${err.message}"
                ))
            }
        }
    }

    @ReactMethod
    @Suppress("UNUSED")
    fun dismiss(
            @Suppress("UNUSED_PARAMETER")
            options: ReadableMap,
            promise: Promise
    ) = promise.resolve(true)

    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap? = null)
    = reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
}