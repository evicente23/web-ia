import React, { useState } from "react";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { getTokenOrRefresh, getRespuesta } from './token_util';
const speechRecognitionLanguage = 'es-EC';
import Button from '@mui/material/Button';
import { Grid, Box, CardContent, Typography, TextField } from '@mui/material';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ImgB from "./kia-b.png";
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import Message from "./Message";
import avatarimag from "./bot.png";
import Equalizer from "./components/Equalizer/Equalizer";

export default function Speack(props) {
  const [displayText, setDisplayText] = useState('Listo para probar el hablado...');
  const [pregunta, setPregunta] = useState('');
  const [hablando, setHablando] = useState(false);
  const [hablandoNew, setHablandoNew] = useState(false);

  const [respuesta, setRespuesta] = useState('');
  const [messages, setMessages] = React.useState([{ respuesta: '...' }]);
  const messagesListRef = React.createRef();

  React.useEffect(() => {

  }, []);
  async function sttFromMic(setDisplayText) {
    setHablando(true)

    const tokenObj = await getTokenOrRefresh();
    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = speechRecognitionLanguage;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    var player = new SpeechSDK.SpeakerAudioDestination();
    if (hablandoNew) {
      player.pause();
      setHablandoNew(false)
    }
    player.onAudioStart = function (_) {
      setHablandoNew(true)
    }
    player.onAudioEnd = function (_) {
    };

    var audioConfig2 = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
    speechConfig.speechSynthesisVoiceName = "es-EC-AndreaNeural";

    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig2);
    // You can use this callback to streaming receive the synthesized audio.
    synthesizer.synthesizing = function (s, e) {

    };
    setDisplayText('Habla por tu micrófono...');
    recognizer.recognizeOnceAsync(async result => {
      let displayText;
      setMessages([{ respuesta: '...' }])
      if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        setPregunta(result.text)
        setHablando(false)
        const ejemplo = await getRespuesta(result.text);
        setRespuesta(result.text)
        synthesizer.speakTextAsync(ejemplo.data.answer, function (result) {
          synthesizer.close();
          player.onAudioEnd = function () {
            setHablandoNew(false)
            console.error('speakTextAsync finished');
          }
        },
          function (err) {
            synthesizer.close();
          });
        let aux = []
        const rsto = { respuesta: ejemplo.data.answer }
        aux.push(rsto)
        setMessages(aux)
        displayText = `Listo para probar el hablado...`;
      } else {
        displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
      }

      setDisplayText(displayText);
    });
  }

  return (

    <Card sx={{ maxWidth: 400, alignContent: 'center' }}>
      <CardContent>
        <Box display="flex" justifyContent="center" >
          <Box
            component="img"
            src={ImgB}
            alignItems={'center'}
            sx={{ width: '20%', height: '20%', cursor: 'pointer' }}
          />
        </Box>
        <Typography gutterBottom variant="body2" component="div" sx={{ mt: 1.5 }} textAlign={'center'}>
          {"Manual de marca online"}
        </Typography>
        <Box
          ref={messagesListRef}
          sx={{
            height: 420,
            overflow: "scroll",
            overflowX: "hidden",
          }}
        >
          <Box sx={{ m: 1, mr: 2 }}>
            {pregunta != "" && <Message
              key={1}
              content={pregunta}
              image={avatarimag}
              isCustomer={false}
              choices={messages}
            />}

          </Box>
        </Box>
        {displayText}

        <Box
          component="form"
          sx={{
            mt: 2,
            display: "flex",
            flexFlow: "row",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: '100%', alignSelf: 'center'
            }}
          >
            {hablando ? <Equalizer /> : <Box sx={{ width: '100%', border: 1 }} />}
          </Box>



          <IconButton aria-label="delete" onClick={() => sttFromMic(setDisplayText)}>
            <KeyboardVoiceIcon fontSize="inherit" />
          </IconButton>
        </Box>

      </CardContent>

    </Card>
  );
}

