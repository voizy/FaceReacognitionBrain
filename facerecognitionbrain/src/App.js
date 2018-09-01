import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';


// initialize with your api key. This will also work in your browser via http://browserify.org/
const app = new Clarifai.App({
  apiKey: 'bde092306fb047b8988e0d9a7431a2b0'
 });

const particlesOptions = {
  particles: {
    number: {
        value: 30,
        density: {
          enable: true,
          value_area: 800
        }
      }
    }
  }
class App extends Component {
  constructor() {
    super();
    this.state ={
      input: '',
      imageUrl: '',
      box: {}
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width,height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFacebox = (box) => {
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
      Clarifai.FACE_DETECT_MODEL,
      // URL
      this.state.input
      )
      .then(response => this.displayFacebox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err));
    }
  render() {
    return (
      <div className="App">
        <Particles className='particles' params={particlesOptions} />
        <Navigation />
        <Logo />
        <Rank />
        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/> 
        <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}></FaceRecognition>
      </div>
    );
  }
}

export default App;
