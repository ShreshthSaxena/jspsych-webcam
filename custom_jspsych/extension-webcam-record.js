var jsPsychWebcamRecord = (function (jspsych) {
  "use strict";

  /**
   * **WEBCAM-RECORD**
   *
   * Extension to record video in a trial using the webcam
   *
   * @author Shreshth Saxena
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */
  class WebcamRecordExtension {
    constructor(jsPsych) {
      this.jsPsych = jsPsych; //store instance to interact with core library and modules 
      this.initialized = false;
      this.mediaRecorder;
      this.videoChunks=[];
      this.filename = 'test'; //update for each trial using params

      this.deviceIds = [];
      this.deviceNames = [];

      this.constraintObj = {
          audio:false,
          video:{
              facingMode: "user", //or environment or {exact: "user"}
              deviceId: 0, //should be updated in webcam-setup-plugin
              width: { exact: 620 }, //can also be more flexible min: 640, ideal: cameraW, max: 1920
              height: { exact: 480 },
              frameRate: {exact: 30}
          }
      };
    }

    async getMedia(constraints) {
        try {
            this.streamObj = await navigator.mediaDevices.getUserMedia(constraints);
            // let devices = await navigator.mediaDevices.enumerateDevices();   
            // console.log("Found devices",devices); 
            this.mediaRecorder =  new MediaRecorder(this.streamObj, this.constraintObj);
            this.mediaRecorder.ondataavailable = (ev) => {
                      this.videoChunks.push(ev.data);
                  }

        } catch(err) {
          console.log("error creating stream", err)
        }
    }

    //Called when an instance of jsPsych is first initialized (Once per experiment)
    async initialize(params= {"using_setup_plugin":false, "default_camera_options": false}) { 
      
      /* Search available devices */
      var counter = 1
      // handle old versions, might not be needed if we just restrict to newer Chrome/Mozilla versions, will have to test first
      if (navigator.mediaDevices === undefined) {
          navigator.mediaDevices = {};
          navigator.mediaDevices.getUserMedia = function(constraintObj) {
              let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
              if (!getUserMedia) {
                  return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
              }
              return new Promise(function(resolve, reject) {
                  getUserMedia.call(navigator, this.constraintObj, resolve, reject);
              });
          }
      }else{
      navigator.mediaDevices.enumerateDevices()
      .then(devices => {
          devices.forEach(device => {
              // console.log(device.kind.toUpperCase(), device.label);//, device.deviceId
              if(device.kind =="videoinput"){ // add a select to the camera dropdown list
                  // console.log(device);
                  this.deviceIds[counter] = (device.deviceId);
                  this.deviceNames[counter]= (device.label);
                  counter++;
              }
          })
      })
      .catch(err => {
          console.log(err.name, err.message);
      })
      }

      /* Setup Stream */
      await this.getMedia(this.constraintObj)
      
      this.initialized = true
      return new Promise((resolve, reject) => {
        resolve()
      });
    }

    //Called at the start of the plugin execution, prior to calling plugin.trial
    on_start(params) {
          this.filename = `test_${params.trial}_${this.jsPsych.randomization.randomID}.mp4`

          this.mediaRecorder.onstop = (ev)=>{
                let blob = new Blob(this.videoChunks, { 'type' : 'video/mp4;' });
                this.videoChunks = [];
                let videoURL = window.URL.createObjectURL(blob);
                // vidSave.src = videoURL;
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.style = 'display: none';
                a.href = videoURL;
                a.download = this.filename;
                a.click();
                window.URL.revokeObjectURL(videoURL);
                console.log("recording downloading")
            }
    }

    //where extension can begin actively interacting with the DOM and recording data
    on_load(params) {
                this.mediaRecorder.start();
                console.log("mediarecorder state",this.mediaRecorder.state);            
    }

    on_finish(params) {
      this.mediaRecorder.stop();
      console.log("mediaRecorder state",this.mediaRecorder.state);
      return {
        videoFile: this.filename,
      };
    }
  }
  WebcamRecordExtension.info = {
    name: "webcamRecord",
  };

  return WebcamRecordExtension;
})(jsPsychModule);
