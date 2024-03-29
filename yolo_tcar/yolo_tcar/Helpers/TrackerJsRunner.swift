//
// Created by Dmytro Kushnir on 20.04.2022.
// Copyright (c) 2022 dmytro_yolo_tcar. All rights reserved.
//

/*
 JavaScriptCore Links:
 https://www.raywenderlich.com/1227-javascriptcore-tutorial-for-ios-getting-started
 https://stackoverflow.com/questions/47063137/how-can-i-inject-and-use-this-javascript-library-web3-with-javascriptcore
 https://www.appcoda.com/javascriptcore-swift/
 https://stackoverflow.com/questions/37434560/can-i-run-javascript-inside-swift-code
 https://www.lucidchart.com/techblog/2018/02/14/javascriptcore-the-holy-grail-of-cross-platform/
 http://igm.rit.edu/~acjvks/courses/2019-spring/330/demos/text-mangler-1.html

 JavaScriptCore Reference:
 https://developer.apple.com/documentation/javascriptcore/jscontext
 https://developer.apple.com/documentation/javascriptcore/jsvalue

    Node JS moving tracker: https://github.com/dmytro-kushnir/node-moving-things-tracker
 */

import Foundation
import JavaScriptCore


class JSRunner {
    let pathToLibrary = "trackerLib"
    let pathToCustomScripts = "scripts"
    // 1 - JSContext is an environment for running JavaScript code - it represents the global object in the environment - and is analagous to the `window` object of a web browser
    let context: JSContext?

    init() {
        context = .init()
        // 1.1 - After the context is created, load a js file and execute the top-level code, loading functions and objects in the global object
        context?.enhancementMode()

        // 2 - we can see JS errors inside of this exception handler
        context?.exceptionHandler = { context, value in
            print("JSError: \(value!)")
        }
        // 3 - get path to library in our main bundle
        if var path = Bundle.main.path(forResource: pathToLibrary, ofType: "js") {
          print(path)

          // 4 - Load library contents to a String variable
          var jsSource = try! String(contentsOfFile: path)

          // 5 - add the JS code in Library to the JSContext runtime
          context?.evaluateScript(jsSource)
          // now we can call all of the Library functions!

          // 8 - but more usefully, we can load our own JS scripts
          path = Bundle.main.path(forResource: pathToCustomScripts, ofType: "js")!
          jsSource = try! String(contentsOfFile: path , encoding: .utf8)
          context?.evaluateScript(jsSource)
        }
    }

    func getTrackedFrames()-> [Any]! {
        let function = context?.objectForKeyedSubscript("getTrackedFrames")
        return function?.call(withArguments: [])?.toArray()
    }

    func updateTrackedFrames(predictions: [YOLO.Prediction]!, frameNumber: Int32!)->Void {
        let function = context?.objectForKeyedSubscript("updateTrackedFrames")
        do {
            let encodePredictions =  try JSONEncoder().encode(predictions)
            let PredictionsJsonString = String(data: encodePredictions, encoding: .utf8)
            function?.call(withArguments: [PredictionsJsonString as Any, frameNumber as Any])
        } catch {
            print("Unable To Convert in Json. FrameNumber: ", frameNumber as Any)
        }
    }

    func resetTracker()->Void {
        let function = context?.objectForKeyedSubscript("resetTracker")
        function?.call(withArguments: [])
    }

    func setTrackerInitialParams()->Void {
        let function = context?.objectForKeyedSubscript("setTrackerInitialParams")
        function?.call(withArguments: [])
    }
}

extension JSContext {
    func enhancementMode() {
        addUtils()
    }

    func addUtils() {
        // inject js script
        // used to define some global objects and functions
        // define a simple console.log function
        let js = """
                 const console = {
                     log: (...message) => {
                         _consoleLog(message.join(" "))
                     }
                 }
                 """
        evaluateScript(js)

        // Set callback for native use, for outputting print information to the Xcode Console
        let callback: @convention(block) (String?) -> Void = {
            print("[JavaScriptCore]: \($0 ?? "undefined")")
        }
        setObject(callback, forKeyedSubscript: "_consoleLog" as NSCopying & NSObjectProtocol)
    }
}
