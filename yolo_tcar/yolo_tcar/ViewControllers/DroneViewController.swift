//
//  DroneViewController.swift
// yolo_tcar
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
  @IBOutlet weak var landGesture: UIImageView!
  @IBOutlet weak var takeOffGesture: UIImageView!

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
  
  // this is for boxes prediction
  var predictedBoxes: [(angle: CGFloat, distance: CGFloat, score: Float, classIndex: Int)] = []
  
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
              case "left":
                tello.left(x: 20)
                break;
              case "up":
                tello.up(x: 20)
                break;
              case "down":
                tello.down(x: 20)
                break;
              case "right":
                tello.right(x: 20)
                break;
              case "forward":
                tello.forward(x: 20)
                break;
              case "back":
                tello.back(x: 20)
                break;
              case "rotate":
                tello.rotate(x: 20)
                break;
              case "rotateClockWise":
                tello.rotateCounterClockwise(x: 20)
                break;
              default:
                break
            }
            break
        case .command:
            break
    }
  }

  
  // MARK: - View Management
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // create tap gesture recognizer
    let tapGestureTakeOff = UITapGestureRecognizer(target: self, action: #selector(DroneViewController.takeOffTapped(gesture:)))
    let tapGestureLand = UITapGestureRecognizer(target: self, action: #selector(DroneViewController.landTapped(gesture:)))
      // add it to the image view;
    takeOffGesture.addGestureRecognizer(tapGestureTakeOff)
    landGesture.addGestureRecognizer(tapGestureLand)
      // make sure imageView can be interacted with by user
    takeOffGesture.isUserInteractionEnabled = true
    landGesture.isUserInteractionEnabled = true
    
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
    self.videoView.frame = self.videoView.bounds
  }
  
  @objc func landTapped(gesture: UIGestureRecognizer) {
      // if the tapped view is a UIImageView then set it to imageview
      if (gesture.view as? UIImageView) != nil {
          droneControlMethod(command: "land")
      }
  }
  
  @objc func takeOffTapped(gesture: UIGestureRecognizer) {
      // if the tapped view is a UIImageView then set it to imageview
      if (gesture.view as? UIImageView) != nil {
          droneControlMethod(command: "takeoff")
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
  
  func getAngleAndDistance(fromPoint: CGPoint, toPoint: CGPoint) -> (CGFloat, CGFloat) {
      let dx: CGFloat = toPoint.x - fromPoint.x
      let dy: CGFloat = fromPoint.y - toPoint.y
      let twoPi: CGFloat = 2 * CGFloat(Double.pi)
      let angle: CGFloat = atan2(dy, dx) * 360 / twoPi
      let distance: CGFloat = hypot(dx, dy)
    
    return (angle, distance)
  }
  
  func compareTwoValues(a: CGFloat, b: CGFloat) -> CGFloat {
    if (a > b) {
      return a - b
    } else {
      return b - a
    }
  }
  
  func predictMovement(box: (angle: CGFloat, distance: CGFloat, score: Float, classIndex: Int)) {
    if (predictedBoxes.count <= 1) {
        predictedBoxes.append(box)
    } else {
      let previousBox =  predictedBoxes.last
      let maximumDegreeDifference: CGFloat = 20.0
      let delta = compareTwoValues(a: box.angle, b: previousBox!.angle)
      if (delta < maximumDegreeDifference) {
        predictedBoxes.append(box)
      }
      // remove observation history after some period
      if (predictedBoxes.count == 30) {
        let lastBox =  predictedBoxes.last
        performMovement(box: lastBox!)
        predictedBoxes.removeAll()
      }
    }
    
    
  }
  
  func performMovement(box: (angle: CGFloat, distance: CGFloat, score: Float, classIndex: Int)) {
    let angle = box.angle
    
    let moveRatio = 20; // todo perform the coef of movement length
    if (angle > 0 && angle < 90) {
//      droneControlMethod(command: "right")
//      droneControlMethod(command: "up")
      print("I")
                  droneControlMethod(command: "rotate")
    } else if (angle > 90 && angle < 180) {
//      droneControlMethod(command: "right")
//      droneControlMethod(command: "down")
      print("II")
                  droneControlMethod(command: "rotate")
    } else if (angle > -90 && angle < 0) {
//      droneControlMethod(command: "left")
//      droneControlMethod(command: "up")
      print("III")
                  droneControlMethod(command: "rotateClockWise")
    } else if (angle < -90 && angle > -180) {
//      droneControlMethod(command: "left")
//      droneControlMethod(command: "down")
      print("IV")
            droneControlMethod(command: "rotateClockWise")
    }
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
      for prediction in predictions {
        // person class filtering
        if prediction.classIndex == 0 {
          predictionLayer.addBoundingBoxes(prediction: prediction)
          // 375x600, with coordinates: x=0, y=0
          let frame = videoView.frame

          // recalculate center position
          // let center = CGPoint(x: frame.size.width / 2, y: frame.size.height / 2)
            
          let frameSize =  frame.size.width * frame.size.height
          let predictionSize = prediction.rect.size.width * prediction.rect.size.height

          let distanceRatio = (frameSize / predictionSize)
          let (angle, distance) = getAngleAndDistance(fromPoint: videoView.center, toPoint: prediction.rect.origin)
//          print(angle)
//          print(distance)
          
          let box = (angle, distance, prediction.score, prediction.classIndex)
          predictMovement(box: box)
        }
      }
      predictionLayer.show()
      processed = true
      processStarted = false
    }
  }
}

