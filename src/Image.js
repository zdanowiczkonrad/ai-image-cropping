import React, { Component } from 'react';
import './Image.css';

import * as smartcrop from 'smartcrop';
const tracking = window.tracking;

console.log(window.tracking);

/**
 * Props
 *  src: image src
 *  key: iteration key 
 *  className: class
 */
export class Image extends Component {
    state = {};
    uniqId = 'img-'+ Math.floor(Math.random()*1000);
    constructor(props) {
        super(props);
        this.state = {};
        this.imgRef = React.createRef();
    }

    componentDidMount() {

    }
    componentDidUpdate(prevProps) {
        if (this.props.src != prevProps.src) {
            this.setState({loaded: false});
        }
    }

    findNonWhiteGravity(gray) {

    }
    trackingFeatures(image) {

        const width = image.naturalWidth;
        const height = image.naturalHeight;

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');

     
        context.drawImage(image, 0, 0, width, height);
        var imageData = context.getImageData(0, 0, width, height);
        var gray = tracking.Image.grayscale(imageData.data, width, height);
        var sobel = tracking.Image.sobel(imageData.data, width, height);
     
        tracking.Fast.THRESHOLD = 10;
        var corners = tracking.Fast.findCorners(gray, width, height);

        tracking.Fast.THRESHOLD = 40;
        var graySob = tracking.Image.grayscale(sobel,width,height);
        var sobelCorners = tracking.Fast.findCorners(graySob,width,height);
       
          console.log(sobel);
          for (var i = 0; i < sobel.length; i += 4) {
            context.fillStyle = 'rgba('+sobel[i]+','+sobel[i+1]+','+sobel[i+2]+','+sobel[i+3]+')';
            context.fillRect(i/4%width, i/4/width, 1, 1);
          }
          for (var i = 0; i < corners.length; i += 2) {
            context.fillStyle = '#f00';
            context.fillRect(corners[i], corners[i + 1], 3, 3);
          }
          for (var i = 0; i < sobelCorners.length; i += 2) {
            context.fillStyle = 'rgba(0,0,255,50)';
            context.fillRect(sobelCorners[i], sobelCorners[i + 1], 1, 1);
          }
          image.parentElement.appendChild(canvas);
          
        console.log('sobel corners')
        console.log(sobelCorners);
        // starting averages from center
        var avgX = 0;
        var avgY = 0;

        for (let i = 0; i < corners.length; i += 2) {
            avgX += corners[i];
            avgY += corners[i+1];
        }

        avgX = avgX/corners.length*2;
        avgY = avgY/corners.length*2;
        console.log(this.props.src);
        console.log(avgX,avgY);

        var avgSobelX = 0;
        var avgSobelY = 0;

        for (let i = 0; i < sobelCorners.length; i += 2) {
            avgSobelX += sobelCorners[i];
            avgSobelY += sobelCorners[i+1];
        }

        avgSobelX = avgSobelX/sobelCorners.length*2;
        avgSobelY = avgSobelY/sobelCorners.length*2;
        this.setState({gravity: {x: avgX, y: avgY},sobel: {x: avgSobelX, y: avgSobelY}});

        var tracker = new tracking.ObjectTracker(['face']);
        tracker.setStepSize(1.7);
        tracking.track('#'+this.uniqId, tracker);


      tracker.on('track', (event) => {
          console.log('track event');
          console.log(this.props.src);
            event.data.forEach(rect => this.setState({face: rect}));
            ;
      });
    }

    onLoad = (e) => {
        const naturalDimensions = {
            width: e.target.naturalWidth,
            height: e.target.naturalHeight,
        };
        smartcrop.crop(e.target).then(cropped => {
            this.setState({
                naturalDimensions,
                guessedDimensions: cropped.topCrop,
                loaded: true
            });
        });

        this.trackingFeatures(e.target);
    }
    render() {
        console.log(this.state);
        let classNames = [];
        classNames.push('image-container');
        if (this.state.loaded) {
            classNames.push('loaded');
        }
        if (this.props.className) {
            classNames.push('this.props.className');
        }
        return <div className={classNames.join(' ')}>
        {this.state.loaded && this.state.guessedDimensions ? <div
            style={{
                width: this.state.guessedDimensions.width,
                height: this.state.guessedDimensions.height,
                top: this.state.guessedDimensions.y,
                left: this.state.guessedDimensions.x
            }}
            className="clipping-box"/> : false}

            {this.state.loaded && this.state.gravity ? <div
            style={{
                top: this.state.gravity.y,
                left: this.state.gravity.x
            }}
            className="gravity-box"/> : false}

{this.state.loaded && this.state.sobel ? <div
            style={{
                top: this.state.sobel.y,
                left: this.state.sobel.x
            }}
            className="sobel-box"/> : false}
            
            {this.state.loaded && this.state.face ? <div
            style={{
                width: this.state.face.width,
                height: this.state.face.height,
                top: this.state.face.y,
                left: this.state.face.x
            }}
            className="face-box"/> : false}


            <img
                id={this.uniqId}
                ref={this.imgRef}
                onLoad={this.onLoad}
                key={this.props.key || this.props.src}
                src={process.env.PUBLIC_URL + '/images/' + this.props.src}/>
            </div>;
    }
}