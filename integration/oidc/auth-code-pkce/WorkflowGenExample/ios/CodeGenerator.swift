import Foundation
import CommonCrypto

@objc(CodeGenerator)
class CodeGenerator : NSObject, RCTBridgeModule {
    static func moduleName() -> String! { return "CodeGenerator" }
    
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc(generateUUID:reject:)
    func generateUUID(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(UUID().uuidString)
    }
    
    @objc(generateCodeVerifier:reject:)
    func generateCodeVerifier(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        var buffer = [UInt8](repeating: 0, count: 32)
        
        _ = SecRandomCopyBytes(kSecRandomDefault, buffer.count, &buffer)
        
        let verifier = Data(buffer)
            .base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
            .trimmingCharacters(in: .whitespaces)
        resolve(verifier)
    }
    
    @objc(generateCodeChallenge:resolve:reject:)
    func generateCodeChallenge(codeVerifier: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard let verifierData = codeVerifier.data(using: .utf8) else {
            reject(
                "codegenerator_challenge_error",
                "Could not get raw data from code verifier string.",
                NSError(domain: "codegenerator", code: 1, userInfo: nil)
            )
            return
        }
        
        var buffer = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
        
        verifierData.withUnsafeBytes { (b: UnsafeRawBufferPointer) in
            _ = CC_SHA256(b.baseAddress, CC_LONG(verifierData.count), &buffer)
        }
        
        let hash = Data(buffer)
        let challenge = hash
            .base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
            .trimmingCharacters(in: .whitespaces)
        resolve(challenge)
    }
}
