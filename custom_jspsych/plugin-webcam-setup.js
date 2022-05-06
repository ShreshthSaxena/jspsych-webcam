var jsPsychWebcamSetup = (function (jspsych) {
  "use strict";

  const info = {
    name: "Webcame-Setup",
    parameters: {
      /** The HTML string to be displayed */
          instructions: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Instructions",
              default: ` Below you'll see the output of recorded video. Please ensure that your face is clearly visible and you're in the center of the screen `, //add instructions
          },
          
          button_text: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Button Text",
              default: "Verify" //'<button class="jspsych-btn">%choice%</button>',
          },

          /** Any content here will be displayed under the button(s). */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "This would be a promt, let's see how it's displayed",
              default: null,
          },
    },
  };

  /**
   * **Webcam-Setup**
   *
   * Use this plugin to setup video recording parameters for the extension jsPsychWebcamRecord
   *
   * @author Shreshth Saxena
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */
  class WebcamSetupPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
      this.webcamRecord = jsPsych.extensions.webcamRecord
    }
    trial(display_element, trial) {

      display_element.innerHTML = trial.instructions

      if (this.webcamRecord.initialized) {
          // CHOOSE DEVICE
          console.log("available devices:", this.webcamRecord.deviceIds)
          var sel = document.createElement("select")
          for (let i=0; i<= this.webcamRecord.deviceIds.length; i++){
            var option = document.createElement('option');
            option.text = "device"+i
            // option.innerText = webcamRecord.deviceNames[i];
            option.value = this.webcamRecord.deviceIds[i] //will work only on server
            sel.appendChild(option, null)
          }
          display_element.appendChild(sel);

          // GET PERMISSIONS and DISPLAY OUTPUT
          var video = document.createElement("video");
          
          display_element.appendChild(video)
          if("srcObject" in video) { 
            video.srcObject = this.webcamRecord.streamObj;
            } 
          else { video.src = window.URL.createObjectURL(this.webcamRecord.streamObj) }; //old version
        
          video.onloadedmetadata = function(ev) {
              // show in the video element what is being captured by the webcam
              video.play();
          }

          //update stream if another device is selected
          sel.addEventListener('change', async (event) => {
            this.webcamRecord.constraintObj.video.deviceId = event.target.value;
            await this.webcamRecord.getMedia(this.webcamRecord.constraintObj);
            if("srcObject" in video) { 
                  video.srcObject = this.webcamRecord.streamObj;
              } 
            else { video.src = window.URL.createObjectURL(this.webcamRecord.streamObj) }; //old version
          })

      }

      let button = document.createElement("button");
      button.innerHTML = trial.button_text;
      display_element.appendChild(button);
      button.addEventListener("click", (e) => {
                  var btn_el = e.currentTarget;
                  end_trial()
      });

      const end_trial = () => {
          this.jsPsych.pluginAPI.clearAllTimeouts();
          
          var trial_data = {webcam_params : JSON.stringify(this.webcamRecord.streamObj.getVideoTracks()[0].getSettings())};
          // clear the display
          display_element.innerHTML = "";
          // move on to the next trial
          this.jsPsych.finishTrial(trial_data);
      };
    }
  }
  WebcamSetupPlugin.info = info;

  return WebcamSetupPlugin;
})(jsPsychModule);
