package com.workflowgenexample

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import com.workflowgenexample.modules.CodeGenerator
import com.workflowgenexample.modules.JWT
import com.workflowgenexample.modules.WebBrowser

class WorkflowGenExamplePackage : ReactPackage {
    override fun createViewManagers(reactContext: ReactApplicationContext):
            MutableList<ViewManager<View, ReactShadowNode<*>>>
    = mutableListOf()

    override fun createNativeModules(reactContext: ReactApplicationContext):
            MutableList<NativeModule>
    = mutableListOf(
        WebBrowser(reactContext),
        CodeGenerator(reactContext),
        JWT(reactContext)
    )
}
