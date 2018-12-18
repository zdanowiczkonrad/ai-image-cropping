import React, { Component } from 'react';
import './App.css';
import { Image } from './Image';


const IMAGES = [
  'dress.jpg',
  'parfume-horizontal.png',
  'parfume-vertical.png',
  'shoes.jpg',
  'old-man.png'
];

const PLACEHOLDER_DIMENSIONS = {
  width: 400,
  height: 400
}
class App extends Component {
  render() {
    return (
      <div className="App">
        {IMAGES.map(url => <div className="image-container">
          <Image src={url} dimensions={PLACEHOLDER_DIMENSIONS}/>
        </div>)}
      </div>
    );
  }
}



export default App;
