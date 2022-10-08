//
//  BoundingBox.swift
// Created by Dmytro Kushnir on 09.04.2022.
// Copyright (c) 2022 dmytro_yolo_tcar. All rights reserved.
//

import Foundation
import UIKit

class PredictionLayer {
  
  struct Transform {
    var ratioX: CGFloat
    var ratioY: CGFloat
    var addX: CGFloat
    var addY: CGFloat
  }
  
  struct BoundingBox {
    let layer = CAShapeLayer()
    let textLayer = CATextLayer()

    init (predRect: CGRect, transform: Transform,
          label: String, confidence: Float,
          color: CGColor) {
      layer.fillColor = UIColor.clear.cgColor
      layer.lineWidth = 2
      let path = UIBezierPath(rect: predRect)
      layer.path = path.cgPath
      layer.strokeColor = color
      
      textLayer.foregroundColor = UIColor.black.cgColor
      textLayer.contentsScale = UIScreen.main.scale
      textLayer.fontSize = 9
      textLayer.font = UIFont(name: "Avenir", size: textLayer.fontSize)
      textLayer.alignmentMode = CATextLayerAlignmentMode.left
      textLayer.frame = CGRect(x: predRect.origin.x - 1, y: predRect.origin.y - 13,
                               width: 80, height: 14)
      textLayer.backgroundColor = color
      textLayer.string = "\(label):" + String(format: "%.2f", confidence)
    }
    
    func addTo(layer: CALayer) {
      layer.addSublayer(self.layer)
      layer.addSublayer(self.textLayer)
    }
  }
  
  private let layer: CAShapeLayer
  private var imageRect: CGRect?
  private var transform = Transform(
          ratioX: 1,
          ratioY: 1,
          addX: 0,
          addY: 0
  )
  
  init() {
    layer = CAShapeLayer()
    layer.fillColor = UIColor.clear.cgColor
    layer.isHidden = true
  }

  func update(imageViewFrame: CGRect, imageSize: CGSize) {
    let ratio = fmin(imageViewFrame.width / imageSize.width,
                 imageViewFrame.height / imageSize.height)

    imageRect = CGRect(
          x: 0,
          y: 0,
          width: imageSize.width * ratio,
          height: imageSize.height * ratio
    )

    imageRect!.origin.x = imageViewFrame.width / 2 - imageRect!.width / 2
    imageRect!.origin.y = imageViewFrame.height / 2 - imageRect!.height / 2

    transform.ratioX = imageRect!.width
    transform.ratioY =  imageRect!.height
    transform.addX = imageRect!.origin.x
    transform.addY = imageRect!.origin.y
  }
  
  func addToParentLayer(_ parent: CALayer) {
    parent.addSublayer(layer)
  }

  // The predicted bounding box is in the coordinate space of the input
  // image, which is a square image of 416x416 pixels. We want to show it
  // on the video preview, which is as wide as the screen and has a 16:9
  // aspect ratio. The video preview also may be letterboxed at the top
  // and bottom.
  func scalePrediction(rect: CGRect) -> CGRect {
      var scaledRect = rect
      scaledRect.origin.x *= transform.ratioX
      scaledRect.origin.x += transform.addX
      scaledRect.origin.y *= transform.ratioY
      scaledRect.origin.y += transform.addY
      scaledRect.size.width *= transform.ratioX
      scaledRect.size.height *= transform.ratioY

      return scaledRect
  }
  
  func addBoundingBoxes(prediction: YOLO.Prediction) {
      let color = ColorPallete.shared.colors[prediction.classIndex]
      let label = prediction.name + " " + String(prediction.objectId)

      let boundingBox = BoundingBox(
            predRect: prediction.rect,
            transform: transform,
            label: label,
            confidence: prediction.score,
            color: color
      )

      boundingBox.addTo(layer: layer)
  }
  
  func show() {
    layer.isHidden = false
  }
  
  func hide() {
    layer.isHidden = true
  }
  
  func clear() {
    layer.sublayers = nil
  }
}
