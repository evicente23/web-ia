import axios from 'axios';
import Cookie from 'universal-cookie';

async function get(value) {
    //res.setHeader('Content-Type', 'application/json');
    const speechKey = "cac56e183714404795ed460a62ca6c0c";
    const speechRegion = "eastus";

    if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
        //  res.status(400).send('You forgot to add your speech key or region to the .env file.');
    } else {
        const headers = {
            headers: {
                'Ocp-Apim-Subscription-Key': speechKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
            return ({ token: tokenResponse.data, region: speechRegion });
        } catch (err) {
            //res.status(401).send('There was an error authorizing your speech key.');
            return ('There was an error authorizing your speech key.')
        }
    }
};
async function post(value) {
    const headers = {
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://consultasecuador.com'

        }
    };
    try {
        const tokenResponse = await axios.post(`http://13.92.91.2:8095/questions`, {question:value},headers);
        return tokenResponse;
    } catch (err) {
        //res.status(401).send('There was an error authorizing your speech key.');
        return ('There was an error authorizing your speech key.')
    }
};

export async function getTokenOrRefresh() {
    const cookie = new Cookie();
    const speechToken = cookie.get('speech-token');

    if (speechToken === undefined) {
        try {
            const res = await get();
            console.info('res: ', res)
            const token = res.token;
            const region = res.region;
            cookie.set('speech-token', region + ':' + token, { maxAge: 540, path: '/' });

            console.log('Token fetched from back-end: ' + token);
            return { authToken: token, region: region };
        } catch (err) {
            console.log(err);
            return { authToken: null, error: err };
        }
    } else {
        console.log('Token fetched from cookie: ' + speechToken);
        const idx = speechToken.indexOf(':');
        return { authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
    }
}

export async function getRespuesta(value) {
    return  await post(value);

}