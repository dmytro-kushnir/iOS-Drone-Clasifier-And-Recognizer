//
//  DroneViewController.swift
//  yolov3
//
//  Created by DmytOlh on 16/11/2019.
//  Copyright © 2019 DmytOlh. All rights reserved.
//

import UIKit
import SystemConfiguration.CaptiveNetwork
import CoreLocation

class DroneViewController: UIViewController, CLLocationManagerDelegate {
  @IBOutlet weak var WiFiImageView: UIImageView!
  
  var locationManager = CLLocationManager()
  var currentNetworkInfos: Array<NetworkInfo>? {
      get {
          return SSID.fetchNetworkInfo()
      }
  }
  let tello = Tello()
  // MARK: - IBActions
  
  @IBAction func takeOffTapped(_ sender: UIButton) {
      switch tello.state {
      case .disconnected:
          showNoWiFiAlert()
          break
      case .wifiUp:
          tello.enterCommandMode()
          tello.takeOff()
          break
      case .command:
          tello.takeOff()
          break
    }
  }
  
  @IBAction func landTapped(_ sender: UIButton) {
      tello.land()
  }
  
  @IBAction func stopTapped(_ sender: UIButton) {
      tello.stop()
  }
  
  // MARK: - View Management
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    if #available(iOS 13.0, *) {
        let status = CLLocationManager.authorizationStatus()
        if status == .authorizedWhenInUse {
            updateWiFi()
        } else {
            locationManager.delegate = self
            locationManager.requestWhenInUseAuthorization()
        }
    } else {
        updateWiFi()
    }
  }
  
  func updateWiFi() {
      print("SSID: \(currentNetworkInfos?.first?.ssid ?? "")")
  }
  
  func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
      if status == .authorizedWhenInUse {
          updateWiFi()
      }
  }
  
  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    
    // Check if connected to Tello WiFi
    let ssidArray = currentSSID()

    if connectedToSSID(ssidArray: ssidArray, SSID: "TELLO") {
        tello.state = .wifiUp
//        self.WiFiImageView.image = UIImage(named: "WiFi100")
        print("Connected to Tello WiFi.")
    }
    else {
//        self.WiFiImageView.image = UIImage(named: "WiFiDisconnected")
        showNoWiFiAlert()
    }
  }
  
  func showNoWiFiAlert() {
      let alert = UIAlertController(title: "Not Connected to Tello WiFi", message: "In order to control the Tello you must be connected to its WiFi network. Turn on the Tello and then go to Settings -> WiFi to connect.", preferredStyle: .alert)
      
      alert.addAction(UIAlertAction(title: "Ok", style: .default, handler: nil))
      self.present(alert, animated: true)
  }
  
  override var preferredStatusBarStyle: UIStatusBarStyle {
    return .lightContent
  }
}


public class SSID {
    class func fetchNetworkInfo() -> [NetworkInfo]? {
        if let interfaces: NSArray = CNCopySupportedInterfaces() {
            var networkInfos = [NetworkInfo]()
            for interface in interfaces {
                let interfaceName = interface as! String
                var networkInfo = NetworkInfo(interface: interfaceName,
                                              success: false,
                                              ssid: nil,
                                              bssid: nil)
                if let dict = CNCopyCurrentNetworkInfo(interfaceName as CFString) as NSDictionary? {
                    networkInfo.success = true
                    networkInfo.ssid = dict[kCNNetworkInfoKeySSID as String] as? String
                    networkInfo.bssid = dict[kCNNetworkInfoKeyBSSID as String] as? String
                }
                networkInfos.append(networkInfo)
            }
            return networkInfos
        }
        return nil
    }
}

struct NetworkInfo {
    var interface: String
    var success: Bool = false
    var ssid: String?
    var bssid: String?
}
