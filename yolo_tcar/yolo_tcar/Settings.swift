//
//  Settings.swift
// Created by Dmytro Kushnir on 09.04.2022.
// Copyright (c) 2022 dmytro_yolo_tcar. All rights reserved.
//
//

import Foundation

private let defaultModel = YOLOType.v4_Tiny
private let defaultIOUThreshold: Float = 0.2
private let defaultConfidenceThreshold: Float = 0.4
private let defaultIsSmoothed = false

protocol SettingsDelegate: AnyObject {
  func reloadingFinished()
}


class Settings {
  
  static let shared = Settings()
  
  var confidenceThreshold: Float
  var iouThreshold: Float
  var modelType: YOLOType
  var isSmoothed: Bool
  
  weak var delegate: SettingsDelegate?
  
  private weak var modelProvider: ModelProvider?
  
  init() {
    confidenceThreshold = defaultConfidenceThreshold
    iouThreshold = defaultIOUThreshold
    modelType = defaultModel
    isSmoothed = defaultIsSmoothed
  }
  
  func save(modelType: YOLOType) -> Bool {
    ModelProvider.shared.model.confidenceThreshold = confidenceThreshold
    ModelProvider.shared.model.iouThreshold = iouThreshold
    if modelType == self.modelType {
      return false
    } else {
      self.modelType = modelType
      DispatchQueue.global().async {
        ModelProvider.shared.reloadModel(type: self.modelType)
        DispatchQueue.main.async {
          guard let delegate = self.delegate else {
            return
          }
          delegate.reloadingFinished()
        }
      }
      return true
    }
  }
  
  func restore() {
    confidenceThreshold = defaultConfidenceThreshold
    iouThreshold = defaultIOUThreshold
    modelType = defaultModel
    isSmoothed = defaultIsSmoothed
  }
  
}
