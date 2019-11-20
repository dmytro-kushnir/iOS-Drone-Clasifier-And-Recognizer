//
//  WiFi.swift
//  FlightPlan
//
//  Requires System Configuration Framework and enable
//  Access WiFi Information capability in Target -> Capabilities.
//  Doesn't work in simulator.
//
//  Created and modified by David Such on 7/6/19.
//  Copyright © 2019 DmytOlh Pty Ltd. All rights reserved.
//
import UIKit
import SystemConfiguration.CaptiveNetwork

func currentSSID() -> [String] {
    //  function credit: https://forums.developer.apple.com/thread/50302
    guard let interfaceNames = CNCopySupportedInterfaces() as? [String] else {
        return []
    }
    return interfaceNames.compactMap { name in
        guard let info = CNCopyCurrentNetworkInfo(name as CFString) as? [String:AnyObject] else {
            return nil
        }
        guard let ssid = info[kCNNetworkInfoKeySSID as String] as? String else {
            return nil
        }
        return ssid
    }
}

func connectedToSSID(ssidArray: Array<String>, SSID: String) -> Bool {
    if ssidArray.isEmpty {
        return false
    }
    else {
        for ssid in ssidArray {
            if ssid.contains(SSID) {return true}
        }
    }
    return false
}
