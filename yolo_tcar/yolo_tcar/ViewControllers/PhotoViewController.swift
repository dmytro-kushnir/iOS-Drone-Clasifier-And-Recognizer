//
//  PhotoViewController.swift
//  Created by Dmytro Kushnir on 16/11/2019.
//  Copyright © 2022 dmytro_yolo_tcar. All rights reserved.
//

import UIKit
import AVKit
import AVFoundation

class PhotoViewController: UIViewController {
  
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var detectButton: UIButton!

  var isVideoMode = false
  var toggleButton = false
  weak var modelProvider: ModelProvider!
  var predictionLayer: PredictionLayer!
  var frameNumber: Int32 = 0

  override func viewDidLoad() {
    super.viewDidLoad()
    modelProvider = ModelProvider.shared
    modelProvider.delegate = self
    predictionLayer = PredictionLayer()
    predictionLayer.addToParentLayer(imageView.layer)
    self.imageView.frame = self.imageView.bounds
    ObjectTracker.shared.setInitialParams()
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    predictionLayer.hide()
    predictionLayer.clear()
    if isVideoMode {
      VideoPlayer.shared.stop()
    }
    ObjectTracker.shared.reset()
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    modelProvider.delegate = self
    predictionLayer.clear()
    detectButton.setTitle("Detect", for: .normal)
  }
  
  override var preferredStatusBarStyle: UIStatusBarStyle {
    return .default
  }
  
  @IBAction func choosePhoto() {
    let imagePicker = UIImagePickerController()
    if UIImagePickerController.isSourceTypeAvailable(.photoLibrary) {
      predictionLayer.hide()
      if isVideoMode {
        VideoPlayer.shared.stop()
      }
      imagePicker.delegate = self
      imagePicker.sourceType = .photoLibrary
      imagePicker.mediaTypes = UIImagePickerController.availableMediaTypes(for: .photoLibrary) ?? []
      assert(!imagePicker.mediaTypes.isEmpty)
      imagePicker.mediaTypes = ["public.image", "public.movie"]
      imagePicker.allowsEditing = false
      self.present(imagePicker, animated: true, completion: nil)
    } else {
      showAlert(title: "Error!", msg: "Photo library is not available!")
    }
  }
  
  @IBAction func takePhoto() {
    let imagePicker = UIImagePickerController()
    if UIImagePickerController.isSourceTypeAvailable(.camera) {
      predictionLayer.hide()
      imagePicker.delegate = self
      imagePicker.sourceType = .camera
      imagePicker.allowsEditing = false
      self.present(imagePicker, animated: true)
    } else {
      showAlert(title: "Error!", msg: "Camera is not available!")
    }
  }
  
  @IBAction func processImage() {
    if !toggleButton {
      toggleButton = true
      if isVideoMode {
        VideoPlayer.shared.play()
        VideoPlayer.shared.predict(modelProvider: modelProvider)
      } else {
        guard let image = imageView.image else {
          showAlert(title: "Warning!", msg: "Please choose image first or take a photo.")
          return
        }
        modelProvider.predict(frame: image)
      }
    } else {
      toggleButton = false
      detectButton.setTitle("Detect", for: .normal)
      predictionLayer.hide()
      predictionLayer.clear()
      if isVideoMode {
        VideoPlayer.shared.stop()
        self.imageView.image = nil
      }
    }
  }
  
  func showAlert(title: String, msg: String) {
    let alert = UIAlertController(title: title, message: msg, preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
    self.present(alert, animated: true, completion: nil)
  }

}

// MARK: - ModelProvaiderDelegate

extension PhotoViewController: ModelProviderDelegate {
  
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

    if isVideoMode {
      predictionLayer.clear()
    }

    for index in 0..<predictions.count  {
      draw(predictions: predictions, index: index)
    }

    frameNumber += 1
    predictionLayer.show()
    detectButton.setTitle("Stop", for: .normal)
  }

  func draw(predictions: [YOLO.Prediction], index: Int) {
    var scaledPredictions = predictions
    // rescale boxes, depend on the screen size
    scaledPredictions[index].rect = predictionLayer.scalePrediction(rect: predictions[index].rect)

    // add bounding box
    if Settings.shared.isTrackEnabled {
      ObjectTracker.shared.formTrackedBoundingBoxes(
              predictions: scaledPredictions,
              frameNumber: frameNumber,
              predictionLayer: predictionLayer
      )
    } else {
      predictionLayer.addBoundingBoxes(prediction: scaledPredictions[index])
    }
  }

}

// MARK: - UIImagePickerControllerDelegate

extension PhotoViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
  
  @objc func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
    self.dismiss(animated: true)
    predictionLayer.show()
  }
  
  @objc func imagePickerController(_ picker: UIImagePickerController,
                             didFinishPickingMediaWithInfo info:
    [UIImagePickerController.InfoKey : Any]) {

    if let pickedImage = info[UIImagePickerController.InfoKey.originalImage] as? UIImage {
      // image
      self.imageView.image = pickedImage
      self.imageView.backgroundColor = .clear
      predictionLayer.update(imageViewFrame: imageView.frame, imageSize: pickedImage.size)
      isVideoMode = false
    }

    if let videoURL = info[UIImagePickerController.InfoKey.mediaURL] as? NSURL {
      // video
      VideoPlayer.shared.configure(url: videoURL, parentLayer: self.imageView)

      predictionLayer.update(
              imageViewFrame: imageView.frame,
              imageSize: CGSize(width: VideoPlayer.shared.playerLayer!.frame.width, height: VideoPlayer.shared.playerLayer!.frame.height)
      )
      VideoPlayer.shared.isLoop = false
      VideoPlayer.shared.pause()
      isVideoMode = true
    }
    predictionLayer.clear(frameNumber: frameNumber)
    detectButton.setTitle("Detect", for: .normal)
    self.dismiss(animated: true)
  }

}
