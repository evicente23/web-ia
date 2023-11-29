import React, {  useState } from "react";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { getTokenOrRefresh, getRespuesta } from './token_util';
const speechRecognitionLanguage = 'es-EC';

export default function Speack(props) {
  const [displayText, setDisplayText] = useState('INITIALIZED: ready to test speech...');

  React.useEffect(() => {

  }, []);
  async function sttFromMic(setDisplayText) {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = speechRecognitionLanguage;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    var player = new SpeechSDK.SpeakerAudioDestination();
    player.onAudioStart = function(_) {
      console.error("playback started");
    }
    player.onAudioEnd = function (_) {
      console.error("playback finished");;
    };

    var audioConfig2  = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
    speechConfig.speechSynthesisVoiceName = "es-EC-AndreaNeural";

    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig2);
       // You can use this callback to streaming receive the synthesized audio.
       synthesizer.synthesizing = function (s, e) {
        console.log(e);

      };
    setDisplayText('Speak into your microphone...');
    recognizer.recognizeOnceAsync(async result => {
      let displayText;
  
      if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const ejemplo = await getRespuesta(result.text);
        console.error("ejemplo", ejemplo.data.answer)
        synthesizer.speakTextAsync(ejemplo.data.answer);
        displayText = `RECOGNIZED: Text=${result.text}`;
      } else {
        displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
      }

      setDisplayText(displayText);
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        {displayText}
        <button type="button" onClick={() => sttFromMic(setDisplayText)}>Click Me!</button>

      </header>
    </div>
  );
}

