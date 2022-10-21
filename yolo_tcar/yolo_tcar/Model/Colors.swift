//
//  Colors.swift
// Created by Dmytro Kushnir on 09.04.2022.
// Copyright (c) 2022 dmytro_yolo_tcar. All rights reserved.
//

import Foundation
import UIKit

struct ColorPallete {
  static let shared = ColorPallete()
  var colors: [CGColor] = []
  var colorsCount = 120

  init() {
    // Make colors for the bounding boxes. There is one color for each class,
    // 20 classes in total.
    for r: CGFloat in [0.1,0.2, 0.3,0.4,0.5, 0.6,0.7, 0.8,0.9, 1.0] {
      for g: CGFloat in [0.3,0.5, 0.7,0.9] {
        for b: CGFloat in [0.4,0.6 ,0.8] {
          let color = CGColor(red: r, green: g, blue: b, alpha: 1)
          colors.append(color)
        }
      }
    }
  }
}
