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
  weak var modelProvider: ModelProvider!
  var predictionLayer: PredictionLayer!
  var processed = false
  var processStarted = false
  
  var lastTimestamp = CMTime()
  let maxFPS = 30
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
    
    modelProvider = ModelProvider.shared
    modelProvider.delegate = self
    predictionLayer = PredictionLayer()
    predictionLayer.addToParentLayer(videoView.layer)
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
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    modelProvider.delegate = self
    predictionLayer.clear()
    processed = false
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    predictionLayer.hide()
    predictionLayer.clear()
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
  
  func resizePreviewLayer() {
    videoView?.frame = videoView.bounds
  }
  
  internal func receivedDisplayableFrame(_ frame: CVPixelBuffer) {
      var cgImage: CGImage?
      VTCreateCGImageFromCVPixelBuffer(frame, options: nil, imageOut: &cgImage)
      
      if let cgImage = cgImage {
          DispatchQueue.main.async {
              self.videoView.image = UIImage(cgImage: cgImage)
            if !self.processed {
                guard let image = self.videoView.image else {
                  self.showAlert(title: "Warning!", msg: "Image from drone can't be obtained")
                  return
                }
                self.processStarted = true
                self.modelProvider.predict(frame: image)
              } else {
                self.processed = false
                self.predictionLayer.hide()
                self.predictionLayer.clear()
              }
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
  
  func showAlert(title: String, msg: String) {
    let alert = UIAlertController(title: title, message: msg, preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
    self.present(alert, animated: true, completion: nil)
  }
}

extension DroneViewController: ModelProviderDelegate {

  func show(predictions: [YOLO.Prediction]?,
            stat: ModelProvider.Statistics, error: YOLOError?) {
    guard let predictions = predictions else {
      guard let error = error else {
        showAlert(title: "Error!", msg: "Unknow error")
        return
      }
      if let errorDescription = error.errorDescription {
        showAlert(title: "Error!", msg: errorDescription)
      } else {
        showAlert(title: "Error!", msg: "Unknow error")
      }
      return
    }
    if processStarted {
      predictionLayer.addBoundingBoxes(predictions: predictions)
      predictionLayer.show()
      processed = true
      processStarted = false
    }
  }
  
}

// MARK: - UIImagePickerControllerDelegate

extension DroneViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
  
  @objc func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
    self.dismiss(animated: true)
    predictionLayer.show()
  }
  
  @objc func imagePickerController(_ picker: UIImagePickerController,
                             didFinishPickingMediaWithInfo info:
    [UIImagePickerController.InfoKey : Any]) {
    if let pickedImage = info[UIImagePickerController.InfoKey.originalImage] as? UIImage {
      self.videoView.image = pickedImage
      self.videoView.backgroundColor = .clear
      predictionLayer.update(imageViewFrame: videoView.frame, imageSize: pickedImage.size)
      predictionLayer.clear()
      processed = false
    }
    self.dismiss(animated: true)
  }

}
