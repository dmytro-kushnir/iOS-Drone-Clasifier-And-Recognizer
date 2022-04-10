//
// Created by Dmytro Kushnir on 09.04.2022.
// Copyright (c) 2022 dmytro_yolo_tcar. All rights reserved.
//


import UIKit
import AVKit
import AVFoundation

class VideoPlayer {
  
  static let shared = VideoPlayer()

  var playerLayer: AVPlayerLayer?
  var player: AVPlayer?
  var isLoop: Bool = false
  var videoFPS: Int = 0
  var currentFrame: Int = 0
  var totalFrames: Int?

  func configure(url: NSURL, parentLayer: UIImageView) {
      player = AVPlayer(url: url as URL)
      playerLayer = AVPlayerLayer(player: player)
      playerLayer?.frame = parentLayer.bounds
    
      playerLayer?.videoGravity = AVLayerVideoGravity.resize
    
      if self.playerLayer != nil {
          NotificationCenter.default.addObserver(self, selector: #selector(reachTheEndOfTheVideo(_:)), name: NSNotification.Name.AVPlayerItemDidPlayToEndTime, object: self.player?.currentItem)
        
        parentLayer.layer.insertSublayer(playerLayer!, at: 0)
        
        let asset = self.player?.currentItem?.asset
        let tracks = asset!.tracks(withMediaType: .video)
        let fps = tracks.first?.nominalFrameRate
        
        self.videoFPS = lround(Double(fps!))
      }
    }

    func play() {
      if player?.timeControlStatus != AVPlayer.TimeControlStatus.playing {
            if self.playerLayer?.superlayer != nil {
                player?.play()
            }
      }
    }

    func pause() {
        player?.pause()
    }

    func stop() {
        player?.pause()
        player?.seek(to: CMTime.zero)
        self.playerLayer!.removeFromSuperlayer()
    }
  
  func predict(modelProvider: ModelProvider) {
      self.player?.addPeriodicTimeObserver(
              forInterval: CMTimeMake(value: 1,timescale: Int32(VideoPlayer.shared.videoFPS)),
              queue: DispatchQueue.main
      ) {[weak self] (progressTime) in
          DispatchQueue.main.async { [self] in
            let frame = self!.player?.currentItem?.asset
              let imgGenerator = AVAssetImageGenerator(asset: frame!)
              var cgImage: CGImage?
              do {
                  cgImage = try imgGenerator.copyCGImage(at: CMTimeMake(value: 0, timescale: 1), actualTime: nil)
              } catch let error as NSError {
                  print(error)
              }
              let uiImage = UIImage(cgImage: cgImage!)
              modelProvider.predict(frame: uiImage)
          }
      }
  }

  @objc func reachTheEndOfTheVideo(_ notification: Notification) {
        if isLoop {
            player?.pause()
          player?.seek(to: CMTime.zero)
            player?.play()
        }
    }
}
