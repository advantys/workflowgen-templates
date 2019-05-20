#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CodeGenerator, NSObject)

RCT_EXTERN_METHOD(generateUUID:(RCTPromiseResolveBlock*)resolve
                  reject:(RCTPromiseRejectBlock*)reject)

RCT_EXTERN_METHOD(generateCodeVerifier:(RCTPromiseResolveBlock*)resolve
                  reject:(RCTPromiseRejectBlock*)reject)

RCT_EXTERN_METHOD(generateCodeChallenge:(NSString * _Nonnull)codeVerifier
                  resolve:(RCTPromiseResolveBlock*)resolve
                  reject:(RCTPromiseRejectBlock*)reject)

@end
