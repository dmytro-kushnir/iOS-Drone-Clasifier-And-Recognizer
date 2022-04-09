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
  
  var processed = false
  var processStarted = false
  var videoMode = false
  weak var modelProvider: ModelProvider!
  var predictionLayer: PredictionLayer!

  override func viewDidLoad() {
    super.viewDidLoad()
    modelProvider = ModelProvider.shared
    modelProvider.delegate = self
    predictionLayer = PredictionLayer()
    predictionLayer.addToParentLayer(imageView.layer)
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    predictionLayer.hide()
    predictionLayer.clear()
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    modelProvider.delegate = self
    predictionLayer.clear()
    processed = false
    detectButton.setTitle("Detect", for: .normal)
  }
  
  override var preferredStatusBarStyle: UIStatusBarStyle {
    return .default
  }
  
  @IBAction func choosePhoto() {
    let imagePicker = UIImagePickerController()
    if UIImagePickerController.isSourceTypeAvailable(.photoLibrary) {
      predictionLayer.hide()
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
    if !processed {
      guard let image = imageView.image else {
        showAlert(title: "Warning!", msg: "Please choose image first or take a photo.")
        return
      }
      processStarted = true
      modelProvider.predict(frame: image)
    } else {
      processed = false
      detectButton.setTitle("Detect", for: .normal)
      predictionLayer.hide()
      predictionLayer.clear()
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
    if processStarted {
      for prediction in predictions {
        predictionLayer.addBoundingBoxes(prediction: prediction)
      }
      predictionLayer.show()
      processed = true
      detectButton.setTitle("Clear", for: .normal)
      processStarted = false
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
      self.imageView.image = pickedImage
      self.imageView.backgroundColor = .clear
      predictionLayer.update(imageViewFrame: imageView.frame, imageSize: pickedImage.size)
      predictionLayer.clear()
      processed = false
      detectButton.setTitle("Detect", for: .normal)
    }

    if let videoURL = info[UIImagePickerController.InfoKey.mediaURL] as? NSURL {
      print("videoURL \(videoURL)")

      VideoPlayer.shared.configure(url: videoURL, parentLayer: self.imageView)
      
      
      predictionLayer.update(
        imageViewFrame: imageView.frame,
        imageSize: CGSize(width: VideoPlayer.shared.playerLayer!.frame.width,  height: VideoPlayer.shared.playerLayer!.frame.height)
      )
      predictionLayer.clear()
      
      VideoPlayer.shared.isLoop = true
      VideoPlayer.shared.play()
    }
    
    self.dismiss(animated: true)
  }

}
