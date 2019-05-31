package com.workflowgenexample.modules

import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.*

class CodeGenerator constructor(
        reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "CodeGenerator"

    @ReactMethod
    @Suppress("UNUSED")
    fun generateUUID(promise: Promise) = promise.resolve(UUID.randomUUID().toString())

    @ReactMethod
    @Suppress("UNUSED")
    fun generateCodeVerifier(promise: Promise) {
        val sr = SecureRandom()
        val code = ByteArray(size = 32)

        sr.nextBytes(code)
        promise.resolve(Base64.encodeToString(code, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING))
    }

    @ReactMethod
    @Suppress("UNUSED")
    fun generateCodeChallenge(codeVerifier: String, promise: Promise) {
        val bytes = codeVerifier.toByteArray(charset = Charsets.US_ASCII)
        val md = MessageDigest.getInstance("SHA-256")

        md.update(bytes, 0, bytes.size)
        promise.resolve(Base64.encodeToString(md.digest(), Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING))
    }
}