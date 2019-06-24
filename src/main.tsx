import React from "react";
import { render } from "react-dom";
import App from "src/components/App";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import primary from "@material-ui/core/colors/blue";
import secondary from "@material-ui/core/colors/pink";
// import {Context} from 'src/ducks';
// import Provider from 'src/components/Provider';

const container = document.getElementById("root");
if (!container) throw Error("no root container");

const theme = createMuiTheme({
  palette: {
    primary: {
      main: primary.A400
    },
    secondary
  }
});

// const Provider = 

render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  container
);
