import Foundation
import SafariServices

@objc(WebBrowser)
class WebBrowser : RCTEventEmitter, SFSafariViewControllerDelegate {
  private static let SafariViewOnShow = "SafariViewOnShow"
  private static let SafariViewOnDismiss = "SafariViewOnDismiss"

  private var hasListeners = false
  private var safariViewController: SFSafariViewController?

  override func startObserving() {
    self.hasListeners = true
  }

  override func stopObserving() {
    self.hasListeners = false
  }

  override var methodQueue: DispatchQueue! { return DispatchQueue.main }

  override static func requiresMainQueueSetup() -> Bool { return true }

  override func constantsToExport() -> [AnyHashable : Any]! {
    return [
      "SafariViewOnShow": WebBrowser.SafariViewOnShow,
      "SafariViewOnDismiss": WebBrowser.SafariViewOnDismiss
    ]
  }

  override func supportedEvents() -> [String]! {
    return [ WebBrowser.SafariViewOnShow, WebBrowser.SafariViewOnDismiss ]
  }

  @objc(show:resolve:reject:)
  func show(_ args: NSDictionary!, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard let url = RCTConvert.nsurl(args["url"]) else {
      reject("E_WEB_BROWSER_NO_URL", "You must specify a url to show.", nil)
      return
    }

    self.safariViewController = SFSafariViewController(url: url)
    self.safariViewController?.delegate = self
    self.safariViewController?.modalPresentationStyle = .overFullScreen

    RCTPresentedViewController()?.present(self.safariViewController!, animated: true, completion: nil)

    if (self.hasListeners) {
      self.sendEvent(withName: WebBrowser.SafariViewOnShow, body: nil)
    }

    resolve(true)
  }

  @objc(dismiss)
  func dismiss() {
    self.safariViewController?.dismiss(animated: true, completion: nil)
  }

  func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
    self.safariViewController = nil

    if (self.hasListeners) {
      self.sendEvent(withName: WebBrowser.SafariViewOnDismiss, body: nil)
    }
  }
}
