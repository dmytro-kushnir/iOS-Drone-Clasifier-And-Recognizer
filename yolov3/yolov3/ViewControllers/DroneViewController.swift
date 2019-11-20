//
//  DroneViewController.swift
//  yolov3
//
//  Created by DmytOlh on 16/11/2019.
//  Copyright © 2019 DmytOlh. All rights reserved.
//

import UIKit

class DroneViewController: UIViewController {
  @IBOutlet weak var WiFiImageView: UIImageView!
  let tello = Tello()
  
  // MARK: - IBActions
  
  @IBAction func takeOffTapped(_ sender: UIButton) {
      switch tello.state {
      case .disconnected:
          showNoWiFiAlert()
          break
      case .wifiUp:
          tello.enterCommandMode()
          break
      }
  }
  
  // MARK: - View Management
  
  func showNoWiFiAlert() {
      let alert = UIAlertController(title: "Not Connected to Tello WiFi", message: "In order to control the Tello you must be connected to its WiFi network. Turn on the Tello and then go to Settings -> WiFi to connect.", preferredStyle: .alert)
      
      alert.addAction(UIAlertAction(title: "Ok", style: .default, handler: nil))
      self.present(alert, animated: true)
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
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
        self.WiFiImageView.image = UIImage(named: "WiFi100")
        print("Connected to Tello WiFi.")
    }
    else {
        self.WiFiImageView.image = UIImage(named: "WiFiDisconnected")
        showNoWiFiAlert()
    }
  }
  
  override var preferredStatusBarStyle: UIStatusBarStyle {
    return .lightContent
  }
}
