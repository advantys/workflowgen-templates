#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(WebBrowser, RCTEventEmitter)

RCT_EXTERN_METHOD(show:(NSDictionary* _Nonnull)args
                  resolve:(RCTPromiseResolveBlock*)resolve
                  reject:(RCTPromiseRejectBlock*)reject)

RCT_EXTERN_METHOD(dismiss)

@end
