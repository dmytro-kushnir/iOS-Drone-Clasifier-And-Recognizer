//
//  YOLO.swift
// Created by Dmytro Kushnir on 09.04.2022.
// Copyright (c) 2022 dmytro_yolo_tcar. All rights reserved.
//

import CoreML
import UIKit
import Accelerate

let yolov4 = "yolov4-mish-416"
let yolov4Tiny = "yolov4-tiny"
let yolov4Ants = "yolo-ants"

enum YOLOType {
  case v4_512_ants
  case v4_416
  case v4_Tiny

  func description() -> String {
    switch self {
    case .v4_512_ants:
      return yolov4Ants
    case .v4_416:
      return yolov4
    case .v4_Tiny:
      return yolov4Tiny
    }
  }

  static func initFrom(name: String) -> YOLOType {
    switch name {
    case yolov4Ants:
      return .v4_512_ants
    case yolov4:
      return .v4_416
    case yolov4Tiny:
      return .v4_Tiny
    default:
      return .v4_Tiny
    }
  }

  static func modelNames() -> [String] {
    return [yolov4Ants, yolov4Tiny, yolov4]
  }
}

class YOLO: NSObject {

  static var inputSize: Float = 416.0
  static var anchors: [(Float,Float)] = [(0.0, 0.0)]
  static var names: [Int:String] = [0: "person"]
  static var classesCount: Int = 1

  private var model: MLModel?
  private let inputName = "input_1"

  var confidenceThreshold: Float
  var iouThreshold: Float

  var type: YOLOType!

  struct Prediction: Codable {
    let classIndex: Int
    var objectId: Int = -1
    let name: String
    let score: Float
    var rect: CGRect
  }

  override init() {
    confidenceThreshold = Settings.shared.confidenceThreshold
    iouThreshold = Settings.shared.iouThreshold

    super.init()
  }

  convenience init(type: YOLOType) throws {
    self.init()
    var url: URL? = nil
    self.type = type

    switch type {
    case .v4_Tiny:
      url = Bundle.main.url(forResource: yolov4Tiny, withExtension:"mlmodelc")
      YOLO.inputSize = 416.0
    case .v4_416:
      url = Bundle.main.url(forResource: yolov4, withExtension:"mlmodelc")
      YOLO.inputSize = 416.0
    case .v4_512_ants:
      url = Bundle.main.url(forResource: yolov4Ants, withExtension:"mlmodelc")
      YOLO.inputSize = 512.0
    }

    guard let modelURL = url else {
      throw YOLOError.modelFileNotFound
    }

    do {
      model = try MLModel(contentsOf: modelURL)
      guard let model = self.model else {
        throw YOLOError.noModel
      }
      YOLO.anchors = YOLO.parseAnchors(model: model)
      YOLO.names = try YOLO.parseNames(model: model)
      YOLO.classesCount = YOLO.names.count
    } catch let error {
      print(error)
      throw YOLOError.modelCreationError
    }
  }

  public static func parseAnchors(model: MLModel) -> [(Float,Float)] {
    let userDefines = model.modelDescription.metadata[MLModelMetadataKey.creatorDefinedKey] as? NSDictionary
    let anchorsString = userDefines?["yolo.anchors"] as? String

    return YOLO.parseAnchorsString(anchorsString: anchorsString!)
  }

  public static func parseNames(model: MLModel) throws -> [Int:String] {
    guard let userDefines = model.modelDescription.metadata[MLModelMetadataKey.creatorDefinedKey] as? NSDictionary else { return [:]}
    guard let anchorsString = userDefines["yolo.names"] as? String else { return [:] }
    guard let data = anchorsString.data(using: .utf8) else { return [:] }
    return try JSONDecoder().decode([Int:String].self, from: data)
  }

  static func parseAnchorsString(anchorsString: String) -> [(Float, Float)] {
    let splitted = anchorsString.trimmingCharacters(in: ["[","]", " "]).split(separator: "\n")

    var anchors = [(Float, Float)](repeating: (0.0, 0.0), count: splitted.count)
    for n in 0 ..< splitted.count {
      let pair = splitted[n].description.trimmingCharacters(in: ["[", "]", ",", " "]).split(separator: ",").map { val in
        Float(val.trimmingCharacters(in: [" "]))
      }
      anchors[n].0 = pair[0]!
      anchors[n].1 = pair[1]!
    }

    return anchors
  }

  func predict(frame: UIImage) throws -> [Prediction] {
    guard let cvBufferInput = frame.pixelBuffer(width: Int(YOLO.inputSize),
                                                height: Int(YOLO.inputSize)) else {
      throw YOLOError.pixelBufferError
    }
    let input = YOLOInput(inputImage: cvBufferInput,
                          inputName: inputName)
    guard let model = self.model else {
      throw YOLOError.noModel
    }

    let output = try model.prediction(from: input)
    var predictions = [Prediction]()

    let featureNames = output.featureNames

    let outputFeatures = featureNames.map { name in
              (name, output.featureValue(for: name)!.multiArrayValue!)}.map { pair in
              Output(name: pair.0, array: pair.1, rows: pair.1.shape[1].intValue, cols: pair.1.shape[2].intValue, blockSize: pair.1.shape[3].intValue)
            }.sorted { $0.rows > $1.rows}

    var index = 0
    let anchorStride =  YOLO.anchors.count / outputFeatures.count

    for output in outputFeatures {
      let _anchors = Array<(Float, Float)>(YOLO.anchors[index * anchorStride ..< (index+1) * anchorStride])
      let res = try process(output: output, anchors: _anchors)
      predictions.append(contentsOf: res)
      index += 1
    }
    nonMaxSuppression(boxes: &predictions, threshold: iouThreshold)

    return predictions
  }

  struct Output {
    var name: String
    var array: MLMultiArray
    var rows: Int
    var cols: Int
    var blockSize: Int
  }

  private func process(output: Output, anchors: [(Float, Float)]) throws -> [Prediction] {
    let boxesPerCell = output.blockSize / (YOLO.classesCount + 5)

    let cnt = output.array.count
    let cnt_req = output.blockSize * output.rows * output.cols
    assert(cnt == cnt_req)
    assert(output.array.dataType == .float32)


    // The 416x416 image is divided into a 13x13 grid. Each of these grid cells
    // will predict 5 bounding boxes (boxesPerCell). A bounding box consists of
    // five data items: x, y, width, height, and a confidence score. Each grid
    // cell also predicts which class each bounding box belongs to.
    //
    // The "features" array therefore contains (nu  mClasses + 5)*boxesPerCell
    // values for each grid cell, i.e. 125 channels.+ The total features array
    // contains 125x13x13 elements.
    // NOTE: It turns out that accessing the elements in the multi-array as
    // `features[[channel, cy, cx] as [NSNumber]].floatValue` is kinda slow.
    // It's much faster to use direct memory access to the features.

    var predictions = [Prediction]()

    let pointer = UnsafeMutablePointer<Float32>(OpaquePointer(output.array.dataPointer))

    if output.array.strides.count < 3 {
      throw YOLOError.strideOutOfBounds
    }

    let yStride = output.array.strides[1].intValue
    let xStride = output.array.strides[2].intValue
    let channelStride = output.array.strides[3].intValue

    @inline(__always) func offset(_ ch: Int, _ x: Int, _ y: Int) -> Int {
      return ch * channelStride + y * yStride + x * xStride
    }

    var confidenceMax = Float(0)

    for x in 0 ..< output.rows {
      for y in 0 ..< output.cols {
        for box_i in 0 ..< boxesPerCell {

          // For the first bounding box (box_i=0) we have to read channels (boxOffset) 0-24,
          // for box_i=1 we have to read channels 25-49, and so on.
          let boxOffset = box_i * (YOLO.classesCount + 5)

          var bbx = Float(pointer[offset(boxOffset, x, y)])
          var bby = Float(pointer[offset(boxOffset + 1, x, y)])
          var bbw = Float(pointer[offset(boxOffset + 2, x, y)])
          var bbh = Float(pointer[offset(boxOffset + 3, x, y)])
          let obj = Float(pointer[offset(boxOffset + 4, x, y)])
          var exist = false

          // The confidence value for the bounding box is given by obj. We use
          // the logistic sigmoid to turn this into a percentage.
//          let confidence = sigmoid(obj)

          // Gather the predicted classes for this anchor box and softmax them,
          // so we can interpret these numbers as percentages.
          var classes = [Float](repeating: 0, count: YOLO.classesCount)

          if (obj > confidenceThreshold) {
            for c in 0 ..< YOLO.classesCount {
              let bbox_c = Float(pointer[offset(boxOffset + 5 + c, x, y)])
              let prob = bbox_c * obj
              if (prob > confidenceThreshold) {
                classes[c] = bbox_c;
                exist   = true
              } else {
                classes[c] = 0
              }
            }
          }

         softmax(&classes)

          // Find the index of the class with the largest score.
          let (detectedClass, bestClassScore) = argmax(classes)

          // Combine the confidence score for the bounding box, which tells us
          // how likely it is that there is an object in this box (but not what
          // kind of object it is), with the largest class prediction, which
          // tells us what kind of object it detected (but not where).
          let confidenceInClass = bestClassScore * obj

          confidenceMax = max(confidenceMax, confidenceInClass)

          if (exist) {


          // The predicted tx and ty coordinates are relative to the location
          // of the grid cell; we use the logistic sigmoid to constrain these
          // coordinates to the range 0 - 1. Then we add the cell coordinates
          // (0-12) and multiply by the number of pixels per grid cell (32).
          // Now x and y represent center of the bounding box in the original
          // 416x416 image space.
//            bbx = (sigmoid(bbx) + Float(x)) * Float(output.cols)
//            bby = (sigmoid(bby) + Float(y)) * Float(output.rows)

            bbx = (bbx + Float(x)) / Float(output.cols)
            bby = (bby + Float(y)) / Float(output.rows)

            let anchor = anchors[box_i]
            print("anchor \(anchor)")

          // The size of the bounding box, tw and th, is predicted relative to
          // the size of an "anchor" box. Here we also transform the width and
          // height into the original 416x416 image space.
            bbw = exp(bbw) * anchor.0
            bbh = exp(bbh) * anchor.1

//            bbw = bbw * bbw * 4 * anchor.0
//            bbh = bbh * bbh * 4 * anchor.1


          // Since we compute 13x13x5 = 845 bounding boxes, we only want to
          // keep the ones whose combined score is over a certain threshold.
            let rect = CGRect(x: CGFloat(bbx - bbw/2.0), y: CGFloat(bby - bbh/2.0),
                    width: CGFloat(bbw), height: CGFloat(bbh))

            let prediction = Prediction(
                    classIndex: detectedClass,
                    name: YOLO.names[detectedClass] ?? "<unknown>",
                    score: confidenceInClass,
                    rect: rect
            )

            predictions.append(prediction)
          }
        }
        }
      }

    print("predictions [\(output.rows) x \(output.cols)]: max conf: \(confidenceMax), threshold: \(confidenceThreshold)")

    return predictions

  }

}

// MARK: - YOLO Helpers

extension YOLO {
  
  private func nonMaxSuppression(boxes: inout [Prediction], threshold: Float) {
    var i = 0
    while i < boxes.count {
      var j = i + 1
      while j < boxes.count {
        let iou = YOLO.IOU(a: boxes[i].rect, b: boxes[j].rect)
        if iou > threshold {
          if boxes[i].score > boxes[j].score {
            if boxes[i].classIndex == boxes[j].classIndex {
              boxes.remove(at: j)
            } else {
              j += 1
            }
          } else {
            if boxes[i].classIndex == boxes[j].classIndex {
              boxes.remove(at: i)
              j = i + 1
            } else {
              j += 1
            }
          }
        } else {
          j += 1
        }
      }
      i += 1
    }
  }

  static func IOU(a: CGRect, b: CGRect) -> Float {
    let areaA = a.width * a.height
    if areaA <= 0 { return 0 }
    let areaB = b.width * b.height
    if areaB <= 0 { return 0 }
    let intersection = a.intersection(b)
    let intersectionArea = intersection.width * intersection.height
    return Float(intersectionArea / (areaA + areaB - intersectionArea))
  }

  private func argmax(_ x: [Float]) -> (Int, Float) {
    let len = vDSP_Length(x.count)
    var i: vDSP_Length = 0
    var max: Float = 0
    vDSP_maxmgvi(x, 1, &max, &i,len)
    return (Int(i), max)
  }

  private func sigmoid(_ x: Float) -> Float {
    return 1 / (1 + exp(-x))
  }

/**
 Computes the "softmax" function over an array.

 Based on code from https://github.com/nikolaypavlov/MLPNeuralNet/

 This is what softmax looks like in "pseudocode" (actually using Python
 and numpy):

 x -= np.max(x)
 exp_scores = np.exp(x)
 softmax = exp_scores / np.sum(exp_scores)

 First we shift the values of x so that the highest value in the array is 0.
 This ensures numerical stability with the exponents, so they don't blow up.
 */
  public func softmax(_ x: inout [Float]) {
    var x = x
    let len = vDSP_Length(x.count)

    // Find the maximum value in the input array.
    var max: Float = 0
    vDSP_maxv(x, 1, &max, len)

    // Subtract the maximum from all the elements in the array.
    // Now the highest value in the array is 0.
    max = -max
    vDSP_vsadd(x, 1, &max, &x, 1, len)

    // Exponentiate all the elements in the array.
    var count = Int32(x.count)
    vvexpf(&x, x, &count)

    // Compute the sum of all exponential values.
    var sum: Float = 0
    vDSP_sve(x, 1, &sum, len)

    // Divide each element by the sum. This normalizes the array contents
    // so that they all add up to 1.
    vDSP_vsdiv(x, 1, &sum, &x, 1, len)
  }
  
}

// MARK: - YOLOInput

@available(macOS 10.13, iOS 15.0, tvOS 11.0, watchOS 4.0, *)
private class YOLOInput : MLFeatureProvider {

  var inputImage: CVPixelBuffer
  var inputName: String
  var featureNames: Set<String> {
    get { return [inputName] }
  }

  func featureValue(for featureName: String) -> MLFeatureValue? {
    if (featureName == inputName) {
      return MLFeatureValue(pixelBuffer: inputImage)
    }
    return nil
  }

  init(inputImage: CVPixelBuffer, inputName: String) {
    self.inputName = inputName
    self.inputImage = inputImage
  }
}
