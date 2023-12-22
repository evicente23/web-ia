import './App.css';
import Speack from './Speack';

import { Grid } from "@mui/material";

function App() {
  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Speack></Speack>
    </Grid>
  );
}

export default App;
