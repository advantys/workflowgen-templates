package com.workflowgenexample.modules

import android.util.Base64
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONObject
import java.lang.Exception
import java.security.MessageDigest
import java.security.Signature
import javax.security.cert.X509Certificate

class JWT constructor(
        reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "JWT"

    @ReactMethod
    @Suppress("UNUSED")
    fun decode(args: ReadableMap, promise: Promise) {
        val header = args.getString("header")
        val payload = args.getString("payload")

        if (header == null || payload == null) {
            promise.reject(Exception("Missing required arguments: header or payload."))
            return
        }

        val decodedHeader = JSONObject(decode(header))
        val decodedPayload = JSONObject(decode(payload))
        val array = Arguments.createArray()

        array.pushMap(jsonObjectToWritableMap(decodedHeader))
        array.pushMap(jsonObjectToWritableMap(decodedPayload))
        promise.resolve(array)
    }

    @ReactMethod
    @Suppress("UNUSED")
    fun verify(args: ReadableMap, promise: Promise) {
        val header = args.getString("header")
        val payload = args.getString("payload")
        val tokenSignature = args.getString("signature")
        val publicKeyArr = args.getArray("publicKey")

        if (
            header == null ||
            payload == null ||
            tokenSignature == null ||
            publicKeyArr == null
        ) {
            promise.reject(Exception("You must specify the header, payload, signature and public key."))
            return
        }

        val certStr = publicKeyArr
                .toArrayList()
                .joinToString(separator = "\n")
        val signedPart = arrayOf(header, payload).joinToString(separator = ".")
        val signingInput = signedPart.toByteArray(charset = Charsets.US_ASCII)
        val cert = X509Certificate.getInstance(certStr.toByteArray(charset = Charsets.US_ASCII))
        val signature = Signature.getInstance("SHA256withRSA")
        val signatureData = Base64.decode(tokenSignature, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)

        signature.initVerify(cert.publicKey)
        signature.update(signingInput)
        promise.resolve(signature.verify(signatureData))
    }

    @ReactMethod
    @Suppress("UNUSED")
    fun verifyAtHash(atHash: String, accessTokenComponents: ReadableArray, promise: Promise) {
        val md = MessageDigest.getInstance("SHA-256")
        val accessToken = accessTokenComponents.toArrayList().joinToString(".")
        val accessTokenData = accessToken.toByteArray(charset = Charsets.US_ASCII)
        val accessTokenSha256Data: ByteArray

        try {
            md.update(accessTokenData)
            accessTokenSha256Data = md.digest()
        } catch (exception: Exception) {
            promise.reject(exception)
            return
        }

        val halfAccessTokenSha256 = accessTokenSha256Data.sliceArray(0 until accessTokenSha256Data.size)
        val verifier = Base64.encodeToString(halfAccessTokenSha256, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
        promise.resolve(verifier == atHash)
    }

    companion object {
        private fun decode(string: String): String = String(Base64.decode(string, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING))
    }
}

private fun jsonObjectToWritableMap(json: JSONObject): WritableMap {
    val map = Arguments.createMap()

    for (key in json.keys()) {
        when (val value = json.get(key)) {
            is JSONObject -> map.putMap(key, jsonObjectToWritableMap(value))
            is JSONArray -> map.putArray(key, jsonArrayToWritableArray(value))
            is Boolean -> map.putBoolean(key, value)
            is Int -> map.putInt(key, value)
            is Double -> map.putDouble(key, value)
            is String -> map.putString(key, value)
            value == null || value == JSONObject.NULL -> map.putNull(key)
            else -> map.putString(key, value.toString())
        }
    }

    return map
}

private fun jsonArrayToWritableArray(json: JSONArray): WritableArray {
    val array = Arguments.createArray()

    for (i in 0 until json.length()) {
        when (val value = json.get(i)) {
            is JSONObject -> array.pushMap(jsonObjectToWritableMap(value))
            is JSONArray -> array.pushArray(jsonArrayToWritableArray(value))
            is Boolean -> array.pushBoolean(value)
            is Int -> array.pushInt(value)
            is Double -> array.pushDouble(value)
            is String -> array.pushString(value)
            value == null || value == JSONObject.NULL -> array.pushNull()
            else -> array.pushString(value.toString())
        }
    }

    return array
}
