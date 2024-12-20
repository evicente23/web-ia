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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function Speack(props) {
  const [displayText, setDisplayText] = useState('Listo para probar el hablado...');
  const [pregunta, setPregunta] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [age, setAge] = React.useState('sportage');

  const handleChange = (event) => {
    setAge(event.target.value);
  };
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
  const handleClose = () => {
    setOpen(false);
  };
  function replaceUrls(data) {
    let updatedAnswer = data.answer;
    let cleanedAnswer = data.answer; // Variable para almacenar el texto con los string_replace eliminados
  
    data.urls.forEach(({ string_replace, url }) => {
      updatedAnswer = updatedAnswer.replace(string_replace, url);
      cleanedAnswer = cleanedAnswer.replace(string_replace, ""); // Eliminar string_replace
    });
  
    return {
      ...data,
      answer: updatedAnswer, // Respuesta con URLs reemplazadas
      cleanedAnswer, // Respuesta con los string_replace eliminados
    };
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
        const ejemplo2 = await getRespuesta(result.text, name, age);
        const ejemplo=replaceUrls(ejemplo2?.data)
        setRespuesta(result.text)
        setPreguntas(prevPreguntas => {
          const newPreguntas = [...prevPreguntas];
          newPreguntas[newPreguntas.length - 1] = {
            ...newPreguntas[newPreguntas.length - 1],
            messages: ejemplo.answer
          };
          return newPreguntas; // Retornar el nuevo estado
        });
        synthesizer.current.speakTextAsync(ejemplo.cleanedAnswer, function (result) {
          synthesizer.current.close();
          player.current.onAudioEnd = function () {
            obtenerTocken();
            setHablandoNew(false)
          }
        });
        let aux = []
        const rsto = { respuesta: ejemplo.answer }
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
          <Box sx={{ minWidth: 120 }}>

            <FormControl variant="standard" style={{ width: '100%' }}
            >
              <InputLabel htmlFor="input-with-icon-adornment">
                Identificación
              </InputLabel>
              <Input
                id="input-with-icon-adornment"
                value={name}
                fullWidth
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
          </Box>
          <Box sx={{ minWidth: 120, marginTop: 5 }}>
            <FormControl fullWidth>

              <InputLabel id="demo-simple-select-label" htmlFor="input-with-icon-adornment">Modelo</InputLabel>
              <Select
                labelId="demo-simple-select-label"

                id="demo-simple-select"
                value={age}
                label="Age"
                onChange={handleChange}
              >
                <MenuItem value={'carnival'}>Carnival</MenuItem>
                <MenuItem value={'cerato'}>Cerato</MenuItem>
                <MenuItem value={'niro'}>Niro</MenuItem>
                <MenuItem value={'optima'}>Optima</MenuItem>
                <MenuItem value={'picanto'}>Picanto</MenuItem>
                <MenuItem value={'rio'}>Rio</MenuItem>
                <MenuItem value={'seltos'}>Seltos</MenuItem>
                <MenuItem value={'sonet'}>Sonet</MenuItem>
                <MenuItem value={'sorento'}>Sorento</MenuItem>
                <MenuItem value={'soul'}>Soul</MenuItem>
                <MenuItem value={'sportage'}>Sportage</MenuItem>
                <MenuItem value={'stinger'}>Stinger</MenuItem>
                <MenuItem value={'ev5'}>Ev5</MenuItem>
                <MenuItem value={'ev6'}>Ev6</MenuItem>
                <MenuItem value={'ev9'}>Ev9</MenuItem>
                <MenuItem value={'k3'}>K3</MenuItem>
                <MenuItem value={'k5'}>K5</MenuItem>
                <MenuItem value={'stonic'}>Stonic</MenuItem>

                <MenuItem value={''}>Otros</MenuItem>
              </Select>
            </FormControl>
          </Box>
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
        <Typography gutterBottom variant="body2" component="div" sx={{ mt: 1.5 }} textAlign={'center'}>
          {"Modelo: " + age}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '70vh'
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

