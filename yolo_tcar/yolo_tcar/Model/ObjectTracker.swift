//
//  ObjectTracker.swift
//  yolo_tcar
//
//  Created by Dmytro Kushnir on 08.10.2022.
//  Copyright © 2022 dmytro_yolo_tcar. All rights reserved.
//

import Foundation

class ObjectTracker {
    let jsRunner = JSRunner()
    static let shared = ObjectTracker()

    func formTrackedBoundingBoxes(predictions: [YOLO.Prediction], frameNumber: Int32, predictionLayer: PredictionLayer) {
        jsRunner.updateTrackedFrames(predictions: predictions, frameNumber: frameNumber)
        let frames = jsRunner.getTrackedFrames()

        for item in frames ?? [] {
            if let myDictionary = item as? [String : AnyObject] {
                let prediction = YOLO.Prediction(
                        classIndex: YOLO.names.filter({ $0.value == myDictionary["name"] as! String }).first?.key ?? 0,
                        objectId: myDictionary["idDisplay"] as? Int ?? 0,
                        name: myDictionary["name"] as! String,
                        score: Float(myDictionary["confidence"] as! Double),
                        rect: CGRect(
                                x: myDictionary["x"] as? Double ?? 0.0,
                                y: myDictionary["y"] as? Double ?? 0.0,
                                width: myDictionary["w"] as? Double ?? 0.0,
                                height: myDictionary["h"] as? Double ?? 0.0
                        )
                )

                predictionLayer.addBoundingBoxes(prediction: prediction)
            }
        }
    }

    func setInitialParams() {
        jsRunner.setTrackerInitialParams()
    }

    func reset() {
        jsRunner.resetTracker()
    }
}