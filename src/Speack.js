import React, { useState } from "react";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { getTokenOrRefresh, getRespuesta } from './token_util';
const speechRecognitionLanguage = 'es-EC';
import Button from '@mui/material/Button';
import { Grid, Box, CardContent, Typography, TextField } from '@mui/material';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import Pause from '@mui/icons-material/Pause';

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
  const speechConfig = React.useRef(null);
  const recognizer = React.useRef(null);
  const audioConfig = React.useRef(null);
  const audioConfig2 = React.useRef(null);
  const player = React.useRef(null);
  const synthesizer = React.useRef(null);

  React.useEffect(() => {
    obtenerTocken();
  }, []);
  async function obtenerTocken() {
    const tokenObj = await getTokenOrRefresh();
    speechConfig.current = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.current.speechRecognitionLanguage = speechRecognitionLanguage;
    audioConfig.current = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    recognizer.current = new SpeechSDK.SpeechRecognizer(speechConfig.current, audioConfig.current);
    player.current = new SpeechSDK.SpeakerAudioDestination();
    audioConfig2.current = SpeechSDK.AudioConfig.fromSpeakerOutput(player.current);
    speechConfig.current.speechSynthesisVoiceName = "es-EC-AndreaNeural";
    synthesizer.current = new SpeechSDK.SpeechSynthesizer(speechConfig.current, audioConfig2.current);

  }
  async function sttFromMic(setDisplayText) {

    player.current.onAudioStart = function (_) {
      setHablandoNew(true)
    }
    player.current.onAudioEnd = function (_) {
    };
    synthesizer.current.synthesizing = function (s, e) { };
    setDisplayText('Habla por tu micrófono...');
    recognizer.current.recognizeOnceAsync(async result => {
      let displayText;
      setMessages([{ respuesta: '...' }])
      if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        setPregunta(result.text)
        setHablando(false)
        const ejemplo = await getRespuesta(result.text);
        setRespuesta(result.text)
        synthesizer.current.speakTextAsync(ejemplo.data.answer, function (result) {
          synthesizer.current.close();
          player.current.onAudioEnd = function () {
            obtenerTocken();
            setHablandoNew(false)
            console.error('speakTextAsync finished');
          }
        });
        let aux = []
        const rsto = { respuesta: ejemplo.data.answer }
        aux.push(rsto)
        setMessages(aux)
        displayText = `Listo para probar el hablado...`;
      } else {
        displayText = 'ERROR: El discurso fue cancelado o no pudo ser reconocido. Asegúrese de que su micrófono funcione correctamente.';
      }

      setDisplayText(displayText);
    });
  }

  const stopListening = () => {
    player.current.pause();
    setHablandoNew(false);
    obtenerTocken();
   
  };

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
          {"Manual de marca online "}
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
            {hablandoNew ? <Equalizer /> : <Box sx={{ width: '100%', border: 1 }} />}
          </Box>



          <IconButton aria-label="delete" onClick={() => !hablandoNew ? sttFromMic(setDisplayText) : stopListening()}>
            {hablandoNew ? <Pause /> : <KeyboardVoiceIcon fontSize="inherit" />}
          </IconButton>
        </Box>

      </CardContent>

    </Card>
  );
}

