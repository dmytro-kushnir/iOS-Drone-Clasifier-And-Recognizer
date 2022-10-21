//
//  BoundingBox.swift
// Created by Dmytro Kushnir on 09.04.2022.
// Copyright (c) 2022 dmytro_yolo_tcar. All rights reserved.
//

import Foundation
import UIKit

class PredictionLayer {

  private let layers: CAShapeLayer
  private var imageRect: CGRect?
  private var transform = Transform(ratioX: 1, ratioY: 1, addX: 0, addY: 0)
  private var frameHistoryLimit: Int32 = 64

  init() {
    layers = CAShapeLayer()
    layers.fillColor = UIColor.clear.cgColor
    layers.isHidden = true
  }

  struct Transform {
    var ratioX: CGFloat
    var ratioY: CGFloat
    var addX: CGFloat
    var addY: CGFloat
  }

  struct BoundingBox {
    let layer = CAShapeLayer()
    let textLayer = CATextLayer()
    let dotLayer = CAShapeLayer()

    init (prediction: YOLO.Prediction, transform: Transform, color: CGColor) {
      layer.fillColor = UIColor.clear.cgColor
      layer.lineWidth = 2
      let path = UIBezierPath(rect: prediction.rect)

      layer.path = path.cgPath
      layer.strokeColor = color
      formTextLayer(prediction.rect, prediction.score, color, prediction.objectId, prediction.name)

      dotLayer.path =  UIBezierPath.init(ovalIn: CGRect.init(x: 0, y: 0, width: 5, height: 5)).cgPath
      dotLayer.name = "dotLayer"
      dotLayer.position = CGPoint(x: prediction.rect.midX, y: prediction.rect.midY)
    }

    func formTextLayer(_ rect: CGRect,_ score: Float,_ color: CGColor,_ objectId: Int,_ name: String) {
      textLayer.foregroundColor = UIColor.black.cgColor
      textLayer.contentsScale = UIScreen.main.scale
      textLayer.fontSize = 9
      textLayer.font = UIFont(name: "Avenir", size: textLayer.fontSize)
      textLayer.alignmentMode = CATextLayerAlignmentMode.left
      textLayer.frame = CGRect(x: rect.origin.x - 1, y: rect.origin.y - 13,
              width: 80, height: 14)

      dotLayer.fillColor = ColorPallete.shared.colors[objectId % ColorPallete.shared.colorsCount]
      textLayer.backgroundColor = color
      var string = "\(name):" + String(format: "%.2f", score)
      if (objectId != -1) {
        string += " \(String(objectId))"
      }
      textLayer.string = string
    }

    func addTo(layer: CALayer) {
      layer.addSublayer(self.layer)
      layer.addSublayer(self.textLayer)
      layer.addSublayer(self.dotLayer)
    }
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
    parent.addSublayer(layers)
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
    let boundingBox = BoundingBox(prediction: prediction, transform: transform, color: ColorPallete.shared.colors[prediction.classIndex])
    boundingBox.addTo(layer: layers)
  }

  func show() {
    layers.isHidden = false
  }

  func hide() {
    layers.isHidden = true
  }

  func clear(frameNumber: Int32 = 0) {
    for layer in layers.sublayers ?? []
      where
        layer.name != "dotLayer" ||
        layer.name == "dotLayer" && ((frameNumber % frameHistoryLimit) == 0) // remove history every $(frameHistoryLimit) frames
          {
            layer.removeFromSuperlayer()
          }
  }
}
