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
import VideoToolbox

class DroneViewController: UIViewController, CLLocationManagerDelegate, VideoFrameDecoderDelegate {
  @IBOutlet weak var videoView: UIImageView!

  var locationManager = CLLocationManager()
  let tello = Tello()
  var frameDecoder: VideoFrameDecoder!
  var isConnected = false

  // MARK: - IBActions
  
  func droneControlMethod(command: String = "") {
      switch tello.state {
        case .disconnected:
            // trying to check if device connvected to the frone wifi
            isConnected = checkConnection()
            if (isConnected) {
              tello.state = .wifiUp
              tello.enterCommandMode()
              droneControlMethod(command: command)
              print("Connected to Tello WiFi.")
            }
            break
        case .wifiUp:
            switch command {
              case "startstream":
                tello.streamOn()
                isConnected = true
                startStreamServer()
                break
              case "land":
                tello.land()
                break
              case "takeoff":
                tello.takeOff()
                break
              case "stop":
                tello.streamOff()
                isConnected = false
                tello.stop()
                break
              default:
                break
            }
            break
        case .command:
            break
    }
  }
  
  @IBAction func takeoffTapped(_ sender: UIButton) {
    droneControlMethod(command: "takeoff")
  }
  
  @IBAction func startTapped(_ sender: UIButton) {
    droneControlMethod(command: "startstream")
  }
  
  @IBAction func landTapped(_ sender: UIButton) {
    droneControlMethod(command: "land")
  }
  
  @IBAction func stopTapped(_ sender: UIButton) {
    droneControlMethod(command: "stop")
  }
  
  // MARK: - View Management
  
  override func viewDidLoad() {
    super.viewDidLoad()
    VideoFrameDecoder.delegate = self
    frameDecoder = VideoFrameDecoder()

    if #available(iOS 13.0, *) {
        // for ios 13 and higer we need ask location permissions in order to obtain wifi info
        let status = CLLocationManager.authorizationStatus()
        if status == .authorizedWhenInUse {
            printWifiStatus()
        } else {
            locationManager.delegate = self
            locationManager.requestWhenInUseAuthorization()
        }
    } else {
        printWifiStatus()
    }
  }
  
  func printWifiStatus() {
    print("SSID: \(currentSSID().first ?? "")")
  }
  
  func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
      if status == .authorizedWhenInUse {
          printWifiStatus()
      }
  }
  
  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    
    droneControlMethod(command: "startstream")
  }
  
  // Check if device is connected to Tello WiFi
  func checkConnection() -> Bool {
    let ssidArray = currentSSID()
    let ssidName = "TELLO"

    if connectedToSSID(ssidArray: ssidArray, SSID: ssidName) {
      isConnected = true;
      return true
    } else {
      showNoWiFiAlert()
      isConnected = false;
      return false
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
  
  internal func receivedDisplayableFrame(_ frame: CVPixelBuffer) {
      var cgImage: CGImage?
      VTCreateCGImageFromCVPixelBuffer(frame, options: nil, imageOut: &cgImage)
      
      if let cgImage = cgImage {
          DispatchQueue.main.async {
              self.videoView.image = UIImage(cgImage: cgImage)
          }
      } else {
          print("Video stream fail")
      }
  }
  
  func startStreamServer() {
      DispatchQueue.global(qos: .userInteractive).async {
        var currentImg: [UInt8] = []
        while self.isConnected {
          let data = self.tello.getStream()
              if let d = data {
                  currentImg = currentImg + d
                  
                  if d.count < 1460 && currentImg.count > 40 {
                      self.frameDecoder.interpretRawFrameData(&currentImg)
                      currentImg = []
                  }
              }
        }
      }
  }
}
