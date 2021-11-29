//
//  Settings.swift
// yolo_tcar
//
//

import Foundation

private let defaultModel = YOLOType.v3_Tiny
private let defaultIOUThreshold: Float = 0.9
private let defaultConfidenceThreshold: Float = 0.8
private let defaultIsSmoothed = true

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
  
  func isCustomModel() -> Bool {
    return self.modelType.description() == "YOLOv3-nulp";
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
