import React, { useState } from "react";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { getTokenOrRefresh, getRespuesta } from './token_util';
const speechRecognitionLanguage = 'es-EC';
import Button from '@mui/material/Button';
import { Grid, Box, CardContent, Typography, TextField } from '@mui/material';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import Pause from '@mui/icons-material/Pause';

import IconButton from '@mui/material/IconButton';
import ImgB from "./kia-b.png";
import Card from '@mui/material/Card';
import Message from "./Message";
import avatarimag from "./bot.png";
import Equalizer from "./components/Equalizer/Equalizer";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import AccountCircle from '@mui/icons-material/AccountCircle';

export default function Speack(props) {
  const [displayText, setDisplayText] = useState('Listo para probar el hablado...');
  const [pregunta, setPregunta] = useState('');
  const [preguntas, setPreguntas] = useState([

  ]);
  const [hablando, setHablando] = useState(false);
  const [hablandoNew, setHablandoNew] = useState(false);
  const [name, setName] = React.useState('');
  const [respuesta, setRespuesta] = useState('');
  const [messages, setMessages] = React.useState([{ respuesta: '...' }]);
  const messagesListRef = React.createRef();
  const speechConfig = React.useRef(null);
  const recognizer = React.useRef(null);
  const audioConfig = React.useRef(null);
  const audioConfig2 = React.useRef(null);
  const player = React.useRef(null);
  const synthesizer = React.useRef(null);
  const [open, setOpen] = React.useState(true);

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
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

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
      if (preguntas.length >= 3) {
        setPreguntas([])
      }
      setMessages([{ respuesta: '...' }])
      const dtoArray = {
        pregunta: result.text,
        messages: '...'
      }
      setPreguntas(prevPreguntas => [...prevPreguntas, dtoArray]);

      if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {


        setPregunta(result.text)

        setHablando(false)
        const ejemplo = await getRespuesta(result.text, name);
        setRespuesta(result.text)
        setPreguntas(prevPreguntas => {
          const newPreguntas = [...prevPreguntas];
          newPreguntas[newPreguntas.length - 1] = {
            ...newPreguntas[newPreguntas.length - 1],
            messages: ejemplo.data.answer
          };
          return newPreguntas; // Retornar el nuevo estado
        });
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

    <Card sx={{
      maxWidth: 400, alignContent: 'center',

    }}>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Bienvenido!"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Para continuar con el chat KIA, por favor ingresa tu identificación.
          </DialogContentText>
          <FormControl variant="standard">
            <InputLabel htmlFor="input-with-icon-adornment">
              Identificación
            </InputLabel>
            <Input
              id="input-with-icon-adornment"
              value={name}
              onChange={e => {
                setName(e.target.value);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              }
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus disabled={name == "" || name.length < 10}>Continuar</Button>
        </DialogActions>
      </Dialog>
      <CardContent >
        <Box display="flex" justifyContent="center" >
          <Box
            component="img"
            src={ImgB}
            alignItems={'center'}
            sx={{ width: '20%', height: '100%', cursor: 'pointer' }}
          />
        </Box>
        <Typography gutterBottom variant="body2" component="div" sx={{ mt: 1.5 }} textAlign={'center'}>
          {"Manual de marca online "}
        </Typography>
        <Typography gutterBottom variant="body2" component="div" sx={{ mt: 1.5 }} textAlign={'center'}>
          {"Usuario: " + name}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height:'70vh'
          }}
        >
          <Box
            ref={messagesListRef}
            sx={{
              flex: 1,
              overflow: "scroll",
              overflowX: "hidden",
            
            }}
          >
            <Box sx={{ m: 1, mr: 2 }}>
              {preguntas.map((item, index) => (
                <Message
                  key={index}
                  content={item.pregunta}
                  image={avatarimag}
                  isCustomer={false}
                  choices={item.messages}
                />
              ))}
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
        </Box>

      </CardContent>

    </Card>
  );
}

