import {createMuiTheme} from '@material-ui/core/styles';

export const dark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: { main: '#6200ea', contrastText: '#ffffff' },
    secondary: { main: '#AA00FF', contrastText: '#ffffff' }
  },
});

export const test = createMuiTheme({
  palette:{
    common:{black:"#000", white:"#fff"},
    background:{paper:"#fff", default:"#fafafa"},
    primary:{light:"#7986cb", main:"#3f51b5", dark:"#303f9f", contrastText:"#fff"},
    secondary:{light:"#ff4081", main:"#f50057", dark:"#c51162", contrastText:"#fff"},
    error:{light:"#e57373", main:"#f44336", dark:"#d32f2f", contrastText:"#fff"},
    text:{primary:"rgba(0, 0, 0, 0.87)", secondary:"rgba(0, 0, 0, 0.54)", disabled:"rgba(0, 0, 0, 0.38)", hint:"rgba(0, 0, 0, 0.38)"}
  }
});

export const violet = createMuiTheme({
  palette: {
    primary: {main: '#AA00FF'},
    secondary: {main: '#AA00FF'},
    action: {main: '#AA00FF'},
    background: {paper: '#AA00FF'},
  }
});


console.log(dark);
console.log(violet);
