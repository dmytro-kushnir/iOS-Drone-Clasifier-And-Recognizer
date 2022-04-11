//
// Created by Dmytro Kushnir on 09.04.2022.
// Copyright (c) 2022 dmytro_yolo_tcar. All rights reserved.
//


import UIKit
import AVKit
import AVFoundation

class VideoPlayer: NSObject {
  
  static let shared = VideoPlayer()

  var playerLayer: AVPlayerLayer?
  var player: AVPlayer?
  var videoOutput: AVPlayerItemVideoOutput?
  var isLoop: Bool = false
  var videoFPS: Int = 0
  var currentFrame: Int = 0
  var totalFrames: Int?
  // Key-value observing context
  private static var playerItemContext = 0

  func configure(url: NSURL, parentLayer: UIImageView) {
      player = AVPlayer(url: url as URL)
      playerLayer = AVPlayerLayer(player: player)
      playerLayer?.frame = parentLayer.bounds
    
      playerLayer?.videoGravity = AVLayerVideoGravity.resize
    
      if self.playerLayer != nil {
      NotificationCenter.default.addObserver(
          self,
          selector: #selector(reachTheEndOfTheVideo(_:)),
          name: NSNotification.Name.AVPlayerItemDidPlayToEndTime,
          object: self.player?.currentItem
      )

      self.player?.currentItem?.addObserver(
              self,
              forKeyPath: #keyPath(AVPlayerItem.status),
              options: [.initial, .old, .new],
              context: &VideoPlayer.playerItemContext
      )
        
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
      player?.replaceCurrentItem(with: nil)
  }
  
  func predict(modelProvider: ModelProvider) {
      self.player?.addPeriodicTimeObserver(
              forInterval: CMTimeMake(value: 1,timescale: Int32(VideoPlayer.shared.videoFPS)),
              queue: DispatchQueue(label: "videoProcessing", qos: .background)
      ) {[weak self] (time) in
        guard let imageBuffer = self!.getNewFrame() else { return }

        if let frame = UIImage(pixelBuffer: imageBuffer) {
          modelProvider.predict(frame: frame)
          print("!!! frame \(frame)")
        }
      }
  }

func getNewFrame() -> CVPixelBuffer? {
    guard let videoOutput = videoOutput, let currentItem = self.player?.currentItem else { return nil }

    let time = currentItem.currentTime()
    if !videoOutput.hasNewPixelBuffer(forItemTime: time) { return nil }
    guard let buffer = videoOutput.copyPixelBuffer(forItemTime: time, itemTimeForDisplay: nil)
            else { return nil }
    return buffer
}

  override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
    // Only handle observations for the playerItemContext
    guard context == &VideoPlayer.playerItemContext else {
          super.observeValue(forKeyPath: keyPath,
                  of: object,
                  change: change,
                  context: context)
          return
      }

      guard let keyPath = keyPath, let item = object as? AVPlayerItem
              else { return }

      switch keyPath {
      case #keyPath(AVPlayerItem.status):
          if item.status == .readyToPlay {
              self.setUpOutput()
          }
          break
      default: break
      }
  }

  func setUpOutput() {
      guard self.videoOutput == nil else { return }
      let videoItem = self.player?.currentItem!
    if videoItem!.status != AVPlayerItem.Status.readyToPlay {
          // see https://forums.developer.apple.com/thread/27589#128476
          return
      }

      let pixelBuffAttributes = [
          kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange,
      ] as [String: Any]

      let videoOutput = AVPlayerItemVideoOutput(pixelBufferAttributes: pixelBuffAttributes)
      videoItem!.add(videoOutput)
      self.videoOutput = videoOutput
  }

  @objc func reachTheEndOfTheVideo(_ notification: Notification) {
        if isLoop {
            player?.pause()
          player?.seek(to: CMTime.zero)
            player?.play()
        }
    }
}
