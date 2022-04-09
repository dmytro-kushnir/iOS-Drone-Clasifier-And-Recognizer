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
        
        parentLayer.layer.addSublayer(playerLayer!)
        
        let asset = self.player?.currentItem?.asset
        let tracks = asset!.tracks(withMediaType: .video)
        let fps = tracks.first?.nominalFrameRate
        
        self.videoFPS = lround(Double(fps!))
        self.getVideoData()
      }
    }

    func play() {
      if player?.timeControlStatus != AVPlayer.TimeControlStatus.playing {
            player?.play()
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
  
  func getVideoData() {
      self.player?.addPeriodicTimeObserver(forInterval: CMTimeMake(value: 1,timescale: Int32(self.videoFPS)), queue: DispatchQueue.main) {[weak self] (progressTime) in

          if let duration = self!.player?.currentItem?.duration {

              let durationSeconds = CMTimeGetSeconds(duration)
              let seconds = CMTimeGetSeconds(progressTime)
              if self!.totalFrames == nil {
                  self!.totalFrames = lround(Double(self!.videoFPS) * durationSeconds)
              }

              DispatchQueue.main.async {
                  if self!.totalFrames != self!.currentFrame {
                      self!.currentFrame = lround(seconds*Double(self!.videoFPS))
                  } else {
                      print("Video has ended!!!!!!!!")
                  }
                
                let frame = self!.player?.currentItem?.asset
                
                let image = AVAssetImageGenerator(asset: frame!)
                  print(frame)
                  print(image)
                  print(self!.currentFrame)
              }
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
