#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(JWT, NSObject)

RCT_EXTERN_METHOD(decode:(NSDictionary* _Nonnull)args
                  resolve:(RCTPromiseResolveBlock*)resolve
                  reject:(RCTPromiseRejectBlock*)reject)

RCT_EXTERN_METHOD(verify:(NSDictionary* _Nonnull)args
                  resolve:(RCTPromiseResolveBlock*)resolve
                  reject:(RCTPromiseRejectBlock*)reject)

@end
