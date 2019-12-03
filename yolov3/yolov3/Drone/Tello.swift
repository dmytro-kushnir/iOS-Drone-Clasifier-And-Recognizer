//
//  Tello.swift
//  FlightPlan
//
//  Swift Class to interact with the DJI/Ryze Tello drone using the official Tello api.
//  Tello API documentation:
//  https://dl-cdn.ryzerobotics.com/downloads/tello/20180910/Tello%20SDK%20Documentation%20EN_1.3.pdf
//
//  Notes:
//      1.  According to the SDK document, if the tello does not receive a command input within 15 seconds it will land.
//          I tested mine and even after 60 seconds it didn't land with no commands.
//      2.  Sending rapid commands in succession are ignored. This is the reason for the TIME_BTW_COMMANDS constant.
//
//  Created by David Such on 6/6/19.
//  Copyright © 2019 DmytOlh Pty Ltd. All rights reserved.
//
import UIKit
import SwiftSocket	

enum STATE: String {
    case disconnected = "WiFi disconnected"
    case wifiUp = "WiFi Up"
    case command = "command mode"
}

struct RECV {
    static let ok = "OK"
}

struct CMD {
    static let start = "command"
    static let streamOn = "streamon"
    static let streamOff = "streamoff"
    static let takeOff = "takeoff"
    static let land = "land"
    static let stop = "emergency"
}

class Tello : CustomStringConvertible {
    
    var description: String {
        return "Tello:: IP: 192.168.10.1"
    }
    
    let IP_ADDRESS = "192.168.10.1"
    let UDP_CMD_PORT = 8889
    let UDP_STATE_PORT = 8890
    let UDP_VS_ADDRESS = "0.0.0.0"
    let UDP_VS_PORT = 11111
    let TIME_BTW_COMMANDS = 0.5
    
    var state: STATE
    var streamServer: UDPServer!
    var commandClient: UDPClient!
    
    init(port: Int32) {
        self.state = .disconnected
        commandClient = UDPClient(address: IP_ADDRESS, port: port)
        streamServer = UDPServer(address: UDP_VS_ADDRESS, port: Int32(UDP_VS_PORT))
    }
    
    convenience init() {
        self.init(port: 8889)
    }
  
    deinit {
      commandClient.close()
      streamServer.close()
    }
    
    // MARK: - UDP Methods
    
    @discardableResult
    func sendMessage(msg: String) -> String {
        guard let client = self.commandClient else { return "Error - UDP client not found" }
        
        switch client.send(string: msg) {
        case .success:
            print("\(msg) command sent to UDP Server.")
        case .failure(let error):
            print(String(describing: error))
            return "Error - " + String(describing: error)
        }
        return "Error - SwiftSocket unknown response."
    }
  

  func getStream() -> [Byte]? {
    let (data, remoteip, remoteport) = streamServer.recv(2048)
    print("Server remote Ip received", remoteip)
    print("Server remote port recieved", remoteport)
    
    return data!
  }
    
    // MARK: - Tello Command Methods
    
    func enterCommandMode() {
        sendMessage(msg: CMD.start)
    }
  
    func takeOff() {
        sendMessage(msg: CMD.takeOff)
    }
    
    func land() {
        sendMessage(msg: CMD.land)
    }
  
    func streamOn() {
        sendMessage(msg: CMD.streamOn)
    }
  
    func streamOff() {
        sendMessage(msg: CMD.streamOff)
    }
    
    func stop() {
        sendMessage(msg: CMD.land)
        DispatchQueue.main.asyncAfter(deadline: .now() + TIME_BTW_COMMANDS, execute: {
            self.sendMessage(msg: CMD.stop)
        })
    }
}
