package com.workflowgenexample.modules

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Binder
import android.os.Bundle
import android.os.Build
import androidx.browser.customtabs.CustomTabsClient
import androidx.browser.customtabs.CustomTabsServiceConnection
import androidx.browser.customtabs.CustomTabsSession
import androidx.browser.customtabs.CustomTabsService.ACTION_CUSTOM_TABS_CONNECTION
import java.lang.ref.WeakReference

class WebBrowserServiceConnection constructor(
        context: Context,
        private val uri: Uri
    ) : CustomTabsServiceConnection() {
    private val contextRef = WeakReference(context)
    private var session: CustomTabsSession? = null

    override fun onCustomTabsServiceConnected(name: ComponentName?, client: CustomTabsClient?) {
        if (client == null) return else client.warmup(0L)

        session = client.newSession(null)
        session?.mayLaunchUrl(uri, null, null)
    }

    override fun onServiceDisconnected(name: ComponentName?) {
        session = null
    }

    fun bindCustomTabsService() {
        val ctx = contextRef.get() ?: return
        val packageName = getPackageNameToUse(ctx, uri) ?: return

        CustomTabsClient.bindCustomTabsService(ctx, packageName, this)
    }

    @Suppress("UNUSED")
    fun unbindCustomTabsService() = contextRef.get()?.unbindService(this)

    fun createCustomTabsIntent(session: Binder? = null): Intent {
        val ctx = contextRef.get()
        val intent = Intent(Intent.ACTION_VIEW, uri)
        val packageName = if (ctx != null)
            getPackageNameToUse(ctx, uri) ?: "" else ""

        // Intent.URI_ANDROID_APP_SCHEME is available from API level 22 and upward
        if (packageName.isNotEmpty() && Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP) {
            val extras = Bundle()

            intent.`package` = packageName
            extras.putBinder(CUSTOM_TABS_EXTRA_SESSION, session)
            extras.putParcelable(
                    Intent.EXTRA_REFERRER,
                    Uri.parse("${Intent.URI_ANDROID_APP_SCHEME}//${ctx!!.packageName}")
            )
            intent.putExtras(extras)
        }

        intent.flags =
                Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS or
                Intent.FLAG_ACTIVITY_BROUGHT_TO_FRONT
        return intent
    }

    companion object {
        const val CUSTOM_TABS_EXTRA_SESSION = "android.support.customtabs.extra.SESSION"

        fun getPackageNameToUse(context: Context, uri: Uri): String? {
            val packageManager = context.packageManager
            val activityIntent = Intent(Intent.ACTION_VIEW, uri)
            val defaultViewHandlerInfo = packageManager.resolveActivity(activityIntent, 0)
            val defaultViewHandlerPackageName = defaultViewHandlerInfo?.activityInfo?.packageName
            val resolvedActivityList = packageManager.queryIntentActivities(activityIntent, 0)
            val packagesSupportingCustomTabs = resolvedActivityList.map {
                val intent = Intent()

                intent.action = ACTION_CUSTOM_TABS_CONNECTION
                intent.`package` = it.activityInfo.packageName

                intent
            }
                    .filter { packageManager.resolveService(it, 0) != null }
                    .map { it.`package`!! }

            if (packagesSupportingCustomTabs.isNotEmpty()) {
                val packageName = defaultViewHandlerPackageName ?: ""

                return when (packageName.isNotEmpty() && packageName in packagesSupportingCustomTabs) {
                    true -> defaultViewHandlerPackageName
                    false -> packagesSupportingCustomTabs[0]
                }
            }

            return null
        }
    }
}