import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import CircularProgress from '@material-ui/core/CircularProgress';
import Error from '@material-ui/icons/Error';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import withRoot from './../withRoot';
import Cookies from 'universal-cookie';
import { Redirect } from 'react-router-dom';
import { isAuthenticated } from '../authenticate';
import config from '../config/config.json';

const REDIRECT_URI = config.REDIRECT_URI;

const CLIENT_ID = '488051554839035914';
const REDIRECT = encodeURIComponent(REDIRECT_URI);

const cookies = new Cookies();

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  error:{
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
});

class SignIn extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: isAuthenticated(),
      loading: false,
      error: null,
    };
  }

  componentDidMount() {
    const code =
        window.location.href.match(/\?code=(.*)/) &&
        window.location.href.match(/\?code=(.*)/)[1];

    if (code) {
      this.setState({loading: true});
      let data = {loading: false};
      fetch(`/discord/callback?code=${code}`)
          .then(resp => resp.json())

          .then(json => {
            if (json.error) {
              this.setState({error: json.error, ...data});
            } else if (!json.token) {
              this.setState({error: 'Internal server error (500)', ...data});
            } else {
              cookies.set('token', json.token ,{maxAge: json.expires_in, secure: true});
              this.setState({isAuthenticated: true, ...data})
            }
          })

          .catch(err => this.setState({error: err.message, ...data}))
    }
  }

  render() {
    const { classes } = this.props;
    let { from } = this.props.location.state || { from: { pathname: "/" } };
    const { isAuthenticated, loading, error} = this.state;
    if (isAuthenticated) return <Redirect to={from}/>;

    return (
        <main className={classes.main}>
          <CssBaseline />
          <Paper className={classes.paper}>
            {error ? <Error color="error" fontSize="large"/> :
            <Avatar className={classes.avatar}>
              {loading ? <CircularProgress/> : <LockOutlinedIcon/>}
            </Avatar>}
            <Typography component="h1" variant="h5">
                  Sign in
            </Typography>
            {error ?
            <Typography component="h2" fontSize="14">
              {error}
            </Typography> : ""}

              <form className={classes.form}>
              <Button
                  fullWidth
                  disabled={loading}
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={() => window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT}&response_type=code&scope=identify%20email`}
              >
                  Sign in using discord
                </Button>
              </form>
          </Paper>
      </main>
    );
  }
}

SignIn.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRoot(withStyles(styles)(SignIn));
