/* eslint-disable no-unused-vars */
import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
    c,
    c3,
    c4,
    java,
    js,
    python,
    ts,
    html,
    css,
    nodejs,
    react,
    npm,
    github
  } from '../assets/index';

// Sample image URLs
const images = [
    c,
    c3,
    c4,
    java,
    js,
    python,
  // Add more URLs as needed
];

// Keyframes for the scrolling animation
const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;

const ImageContainer = styled.div`
  display: flex;
  width: 100%;
  left: -2px;
  overflow: hidden;
  position: relative;
    border: 2px solid #00ff0090;
  border-radius: 30px;
  top: -47px;
  height: 70px;
`;

const ScrollingWrapper = styled.div`
  display: flex;
  width: 200%; /* Adjust according to the number of images */
  animation: ${scroll} 10s linear infinite;
  
  &:hover {
    animation-play-state: paused; /* Pause the animation on hover */
  }
`;

const ImageWrapper = styled.div`
  flex-shrink: 0;
  width: 20%; /* Adjust width according to the number of images */
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.5); /* Grow the image on hover */
    z-index: 1;
  }

  img {
    width: 70%;
    height: auto;
  }
`;

const ScrollUI = () => (
  <ImageContainer>
    <ScrollingWrapper>
      {images.map((src, index) => (
        <ImageWrapper key={index}>
          <img src={src} alt={`Image ${index + 1}`} />
        </ImageWrapper>
      ))}
      {/* Duplicate the images to create a seamless scroll effect */}
      {images.map((src, index) => (
        <ImageWrapper key={`${index}-duplicate`}>
          <img src={src} alt={`Image ${index + 1}`} />
        </ImageWrapper>
      ))}
    </ScrollingWrapper>
  </ImageContainer>
);

export default ScrollUI;
