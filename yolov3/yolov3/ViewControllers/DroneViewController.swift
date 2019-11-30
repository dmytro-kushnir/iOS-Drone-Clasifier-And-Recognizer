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
import SwiftSocket


class DroneViewController: UIViewController, CLLocationManagerDelegate, VideoFrameDecoderDelegate {
  @IBOutlet weak var videoView: UIImageView!

  var streamServer: UDPServer!
  var locationManager = CLLocationManager()
  let tello = Tello()
  var frameDecoder: VideoFrameDecoder!

  // MARK: - IBActions
  
  func droneControlMethod(command: String) {
      switch tello.state {
        case .disconnected:
            checkConnection()
            break
        case .wifiUp:
            tello.enterCommandMode()
            switch command {
              case "start":
                tello.streamOn()
                startStreamServer()
              // tello.start()
                break
              case "land":
                tello.land()
                break
              case "stop":
                tello.streamOff()
                tello.stop()
                break
              default:
                break
            }
            break
        case .command:
           // tello.start()
            break
    }
  }
  
  @IBAction func startTapped(_ sender: UIButton) {
    droneControlMethod(command: "start")
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

    if #available(iOS 13.0, *) {
        // for ios 13 and higer we need ask location permissions in order to obtain wifi info
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
    print("SSID: \(currentSSID().first ?? "")")
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
    

  }
  
  // Check if connected to Tello WiFi
  func checkConnection() {
    let ssidArray = currentSSID()

    if connectedToSSID(ssidArray: ssidArray, SSID: "TELLO") {
      tello.state = .wifiUp
      print("Connected to Tello WiFi.")
      droneControlMethod(command: "")
    }
    else {
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
      streamServer = UDPServer(address: "0.0.0.0", port: 11111)
      DispatchQueue.global(qos: .userInteractive).async {
          var currentImg: [Byte] = []
          let (data, remoteip, remoteport) = self.streamServer.recv(2048)
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
