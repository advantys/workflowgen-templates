import Foundation

@objc(JWT)
class JWT : NSObject, RCTBridgeModule {
  static func moduleName() -> String! { return "JWT" }

  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(decode:resolve:reject:)
  func decode(args: NSDictionary!, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard
      let header = args["header"] as? String,
      let payload = args["payload"] as? String else {
        reject(
          "jwt_decode_error",
          "You must specify the header and the payload.",
          NSError(domain: "JWT", code: 1, userInfo: nil)
        )
        return
    }

    let decodePart = { (part: String) throws -> NSDictionary in
      try JSONSerialization.jsonObject(
        with: NSData(base64UrlEncodedString: part)! as Data,
        options: []
      ) as! NSDictionary
    }
    let decodedHeader: NSDictionary
    let decodedPayload: NSDictionary

    do {
      decodedHeader = try decodePart(header)
      decodedPayload = try decodePart(payload)
    } catch {
      reject(
        "jwt_decode_error",
        "Could not decode the header or the payload.",
        NSError(domain: "JWT", code: 2, userInfo: nil)
      )
      return
    }

    resolve([decodedHeader, decodedPayload])
  }

  @objc(verify:resolve:reject:)
  func verify(args: NSDictionary!, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard
      let header = args["header"] as? String,
      let payload = args["payload"] as? String,
      let signature = args["signature"] as? String,
      var publicKeyArr = args["publicKey"] as? [String] else {
        reject(
          "jwt_verify_error",
          "You must specify the header, payload, signature and public key.",
          NSError(domain: "JWT", code: 1, userInfo: nil)
        )
        return
    }

    // Convert PEM format to DER
    publicKeyArr.removeFirst() // Remove BEGIN header
    publicKeyArr.removeLast(2) // Remove END footer and newline
    let publicKey = publicKeyArr.joined(separator: "")

    let publicKeyDataBase64 = Data(base64Encoded: publicKey)!
    let signedPart = [header, payload].joined(separator: ".")
    let signatureData = NSData(base64UrlEncodedString: signature)! as Data
    let signingInput = signedPart.data(using: .ascii)!

    // Represent the certificate with Apple Security Framework
    guard let cert = SecCertificateCreateWithData(nil, publicKeyDataBase64 as CFData) else {
      reject(
        "jwt_verify_error",
        "Could not create the Apple Security Framework representation of the PEM certificate.",
        NSError(domain: "jwt", code: 3, userInfo: nil)
      )
      return
    }

    // Get the public key
    guard let key = SecCertificateCopyKey(cert) else {
      reject(
        "jwt_verify_error",
        "Could not retrieve the key (SecKey) from the certificate representation.",
        NSError(domain: "jwt", code: 4, userInfo: nil)
      )
      return
    }
    var error: Unmanaged<CFError>?

    // Verify the signature of the token
    let result = SecKeyVerifySignature(
      key,
      .rsaSignatureMessagePKCS1v15SHA256,
      signingInput as CFData,
      signatureData as CFData,
      &error
    )

    if let errorPointer = error {
      let cfError = errorPointer.takeUnretainedValue()
      let description = CFErrorCopyDescription(cfError)
      let domain = CFErrorGetDomain(cfError)
      let code = CFErrorGetCode(cfError)
      let userInfo = CFErrorCopyUserInfo(cfError)

      reject(
        "jwt_verify_error",
        description as String? ?? "An error occured when verifying the token's signature.",
        NSError(
          domain: domain as String? ?? "jwt",
          code: code,
          userInfo: userInfo as? [String:Any]
        )
      )
      errorPointer.release()
      return
    }

    resolve(result)
  }
}
