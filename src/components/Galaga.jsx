import React, { useState, useEffect, useRef, useCallback } from 'react';
import { shuffle } from 'lodash';
import styled from 'styled-components';
import './Galaga.css';
import {
  shipImage,
  bulletImage,
  defaultinvader,
  shootSound,
  killSound,
  killSound2,
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
import ScrollUI from './ScrollUI';


// Styled components
const GameContainer = styled.div`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  background-color: #000;
  border: 2px solid #ffffff;
`;

const GameBorder = styled.div`
  width: 23%;
  height: 396px;
  position: static;
  overflow: hidden;
  border: 2px solid #ffffff28;
`;

const Description = styled.div`
top: 80px;
left: 60.5%;
width: 38%;
height: 280px;
position: absolute;
overflow: hidden;
border: 2px solid #ffffff;
border-radius: 50px;
`;

const DescriptionIcon = styled.div.attrs((props) => ({
  style: {
    backgroundImage: `url(${defaultinvader}), linear-gradient(to bottom, #0000ff, #FF0000)`,
  }}))`
  left: 20px;
  top: 20px;
  position: absolute;
  width: 22%;
  height: 40%;
  border: 2px solid #ffffff;
  border-radius: 30px;
`;

const SkillContainer = styled.div.attrs((props) => ({
  style: {
  }
}))`
  position: absolute;
  left: 30%;
  top: 20px;
  width: 66%;
  height: 25%;
  border: 2px solid #ffffff;
  border-radius: 30px;
  background-image: linear-gradient(to bottom, #0000ff, #ff0000);
`;

const SmallSkillContainer = styled.div.attrs((props) => ({
  style: {
  }
}))`
  position: absolute;
  left: 30%;
  top: 180px;
  width: 32%;
  height: 28%;
  border: 2px solid #ffffff;
  border-radius: 30px;
  background-image: linear-gradient(to bottom, #0000ff, #ff0000);
`;

const Ship = styled.div.attrs((props) => ({
  style: {
    left: `${props.$left}px`,
    top: `${props.$top}px`,
  },
}))`
  width: 100px;
  height: 100px;
  background-image: url(${shipImage});
  background-size: cover;
  position: absolute;
  transform: rotate(90deg);
`;

const Bullet = styled.div.attrs((props) => ({
  style: {
    left: `${props.$left}px`,
    top: `${props.$top}px`,
  },
}))`
  width: 35px;
  height: 70px;
  background-image: url(${bulletImage});
  background-size: cover;
  position: absolute;
  transform: rotate(90deg);
`;

const Invader = styled.div.attrs((props) => ({
  style: {
    left: `${props.$left}px`,
    top: `${props.$top}px`,
    backgroundImage: `url(${props.$image}), linear-gradient(to bottom, #ffffff, #CEC2D650)`,
    backgroundColor: props.$color,
    opacity: props.$opacity,
  },
}))`
  width: 70px;
  height: 70px;
  position: absolute;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  background-size: cover;
  background-position: center;
`;

const Timer = styled.div.attrs((props) => ({
  style: {
    left: `${props.$left}px`,
    top: `${props.$top}px`,
  }
}))`
  width: 70px;
  height: 70px;

`;

const HUD = styled.div`
  position: absolute;
  top: 0px;
  left: 24%;
  color: red;
  font-size: 20px;
  font-family: 'Emulogic', sans-serif;
`;

const Score = styled.div`
  position: absolute;
  top: 25px;
  left: 24%;
  color: white;
  font-size: 20px;
  font-family: 'Emulogic', sans-serif;
  `;

const uniqueInvaderProfiles = [
  { id: 1, image: python },
  { id: 2, image: c },
  { id: 3, image: c3 },
  { id: 4, image: c4 },
  { id: 5, image: java },
  { id: 6, image: js },
  { id: 7, image: ts },
  { id: 8, image: html },
  { id: 9, image: css },
  { id: 10, image: react },
  { id: 11, image: nodejs },
  { id: 12, image: npm },
  { id: 13, image: github },
];


// Galaga component
const Galaga = () => {
  const [shipPosition, setShipPosition] = useState({ left: 10, top: 150 });
  const [targetShipPosition, setTargetShipPosition] = useState({ left: 10, top: 150 });
  const [invaders, setInvaders] = useState([]);
  const [timers, setTimers] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [canShoot, setCanShoot] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem("highScore"), 10) || 0);
  const [, setRespawning] = useState(false);
  const requestRef = useRef();
  const containerRef = useRef();
  const lastBulletId = useRef(0);

  // Initialize invaders
  const initializeInvaders = useCallback(() => {
    const numColumns = 4;
    const numRows = 4;
    const invaderSize = 70;
    const spacing = 25;
    const defaultProfile = { image: defaultinvader};
  
    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = containerRect.width - containerRect.width / 5 * 2 - (numColumns * (invaderSize + spacing)) - 20;
  
    const shuffledProfiles = shuffle([...uniqueInvaderProfiles]);
    const newInvaders = [];
  
      for (let col = 0; col < numColumns; col++) {
        for (let row = 0; row < numRows; row++) {
          const profile = shuffledProfiles.length > 0 ? shuffledProfiles.pop() : defaultProfile;
    
          newInvaders.push({
            id: col * numRows + row + 1,
            left: startX + col * (invaderSize + spacing),
            top: 20 + row * (invaderSize + spacing),
            image: profile.image,
            velocityY: 0.5 * (col % 2 === 0 ? 1 : -1),
          });
        }
      }
  
    setInvaders(newInvaders);
  }, []);

  // Initialize timers
  const initializeTimers = useCallback(() => {
    const numColumns = 1;
    const numRows = 4;
    const invaderSize = 70;
    const spacing = 25;

    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = containerRect.width - (numColumns * (invaderSize + spacing)) - 20;

    const newTimers = [];

    for (let col = 0; col < numColumns; col++) {
      for (let row = 0; row < numRows; row++) {
        newTimers.push({
          id: col * numRows + row + 1,
          left: startX + col * (invaderSize + spacing),
          top: 20 + row * (invaderSize + spacing),
          velocityY: 0.5,
        });
      }
    }

    setTimers(newTimers);
  }, []);  

  useEffect(() => {
    initializeInvaders();
    initializeTimers();
  }, [initializeInvaders, initializeTimers]);

  const updateInvadersPosition = useCallback(() => {
    setTimers((currentTimers) => {
      let globalVelocityChange = false;
      let newVelocityY = 0;
  
      const updatedTimers = currentTimers.map((timer) => {
        let newTop = timer.top + timer.velocityY;
  
        if (newTop <= 0 || newTop + 74  >= containerRef.current.clientHeight) {
          // Reverse direction of all timers
          newVelocityY = timer.velocityY * -1;
          globalVelocityChange = true; // Indicate that we need to change all timers' and invaders' velocity
        }
  
        return { ...timer, top: newTop, velocityY: globalVelocityChange ? newVelocityY : timer.velocityY };
      });
  
      if (globalVelocityChange) {
        // Apply the velocity change to all timers and invaders
        setTimers((currentTimers) => {
          return currentTimers.map((timer) => ({
            ...timer,
            velocityY: newVelocityY,
          }));
        });
  
        setInvaders((currentInvaders) => {
          return currentInvaders.map((invader) => ({
            ...invader,
            velocityY: invader.velocityY * -1,
          }));
        });
      }
  
      return updatedTimers;
    });
  
    setInvaders((currentInvaders) => {
      return currentInvaders.map((invader) => ({
        ...invader,
        top: invader.top + invader.velocityY,
      }));
    });
  }, []);
  


  const moveObjects = useCallback(() => {
    const bulletSpeed = 15;
    const containerRect = containerRef.current.getBoundingClientRect();

    setBullets((currentBullets) =>
      currentBullets
        .map((bullet) => ({
          ...bullet,
          left: bullet.left + bulletSpeed,
        }))
        .filter((bullet) => bullet.left < containerRect.width)
    );

    updateInvadersPosition(); // Update invader positions

    requestRef.current = requestAnimationFrame(moveObjects);
  }, [updateInvadersPosition]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(moveObjects);
    return () => cancelAnimationFrame(requestRef.current);
  }, [moveObjects]);

  // Handle shooting
  const handleShoot = useCallback(() => {
    if (canShoot) {
      try {
        const audio = new Audio(shootSound);
        audio.play();
      } catch (error) {
        console.error('Audio playback failed:', error);
      }
  
      setBullets((prevBullets) => [
        ...prevBullets,
        { id: Date.now(), left: shipPosition.left + 80, top: shipPosition.top + 12 },
      ]);
      setCanShoot(false);
      setTimeout(() => setCanShoot(true), 150);
    }
  }, [canShoot, shipPosition]);
  

  // Handle mouse movement
  const handleMouseMove = useCallback((e) => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - 25;
    const newY = e.clientY - containerRect.top - 50;

    const constrainedX = Math.max(-10, Math.min(newX, containerRect.width - containerRect.width / 6 * 5));
    const constrainedY = Math.max(-5, Math.min(newY, containerRect.height - 90));

    setTargetShipPosition({ left: constrainedX, top: constrainedY });
  }, []);

  useEffect(() => {
    const smoothMoveShip = () => {
      setShipPosition((prevPosition) => {
        const targetPosition = targetShipPosition;
        const deltaX = targetPosition.left - prevPosition.left;
        const deltaY = targetPosition.top - prevPosition.top;
        return {
          left: prevPosition.left + deltaX * 0.3,
          top: prevPosition.top + deltaY * 0.3,
        };
      });

      requestRef.current = requestAnimationFrame(smoothMoveShip);
    };

    requestRef.current = requestAnimationFrame(smoothMoveShip);
    return () => cancelAnimationFrame(requestRef.current);
  }, [targetShipPosition]);

  // Handle key press for shooting
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        handleShoot();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleShoot]);

// Handle collision detection, invader respawn, and transparency logic

useEffect(() => {
  bullets.forEach((bullet) => {
    setInvaders((currentInvaders) => {
      const updatedInvaders = currentInvaders.map((invader) => {
        if (
          bullet.left + 20 >= invader.left &&
          bullet.left <= invader.left + 50 &&
          bullet.top + 40 >= invader.top &&
          bullet.top <= invader.top + 40 &&
          !invader.isShielded
        ) {
          const audio = new Audio(Math.random() > 0.5 ? killSound : killSound2);

          if (bullet.id === lastBulletId.current) {
            audio.play();
            setScore((prevScore) => prevScore + 50);
          }
          lastBulletId.current = bullet.id;

          setBullets((currentBullets) => currentBullets.filter((b) => b.id !== bullet.id));

          return {
            ...invader,
            isHit: true,
            opacity: 0, // Make the invader semi-transparent
            isShielded: true, // Make the invader immune to further hits
          };
        }
        return invader;
      });

      // Check if all invaders are hit
      if (updatedInvaders.every((invader) => invader.isHit)) {
        handleRespawn();
      }

      return updatedInvaders;
    });
  });
}, [bullets]);

const handleRespawn = () => {
  setRespawning(true);

  // Fade out invaders
  setInvaders((currentInvaders) =>
    currentInvaders.map((invader) => ({
      ...invader,
      opacity: 0, // Set opacity to 0 to fade out
    }))
  );

  // Wait for fade-out animation
  setTimeout(() => {
    // Randomize positions
    setInvaders((currentTimers) => {
      const numColumns = 4;
      const numRows = 4;
      const invaderSize = 70;
      const spacing = 25;

      const containerRect = containerRef.current.getBoundingClientRect();
      const startX = containerRect.width - containerRect.width / 5 * 2 - (numColumns * (invaderSize + spacing)) - 20;

      const shuffledProfiles = shuffle([...uniqueInvaderProfiles]);
      const newInvaders = [];

      for (let col = 0; col < numColumns; col++) {
        for (let row = 0; row < numRows; row++) {
          const profile = shuffledProfiles.length > 0 ? shuffledProfiles.pop() : { image: defaultinvader };

          newInvaders.push({
            id: col * numRows + row + 1,
            left: startX + col * (invaderSize + spacing),
            top: currentTimers[0].top + row * (invaderSize + spacing) + (col % 2 === 0 ? 0 : -2 * currentTimers[0].top + 40),
            image: profile.image,
            velocityY: currentTimers[0].velocityY * (col % 2 === 0 ? 1 : -1),
            isHit: false,
            isShielded: true,
            opacity: 0, // Start with 0 opacity for fade-in effect
            transition: 'opacity 0.5s ease-in-out',
          });
        }
      }

      return newInvaders;
    });

    // Fade in invaders
    setTimeout(() => {
      setInvaders((currentInvaders) =>
        currentInvaders.map((invader) => ({
          ...invader,
          opacity: 1, // Fade back in
          isShielded: false, // Make the invader vulnerable again
        }))
      );
      setRespawning(false);
    }, 500); // Fade-in duration
  }, 500); // Fade-out duration
};

useEffect(() => {
  if (score > highScore) {
    setHighScore(score);
    localStorage.setItem("highScore", score);
  }
}, [score, highScore]);

useEffect(() => {
  const handleResize = () => {
    initializeInvaders();
    initializeTimers();
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [initializeInvaders, initializeTimers]);

function setupStars() {
  const starField = document.createElement('div');
  starField.style.position = 'absolute';
  starField.style.top = '0';
  starField.style.left = '0';
  starField.style.width = '100%';
  starField.style.height = '100%';
  starField.style.overflow = 'hidden';

  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    const starY = Math.floor(Math.random() * containerRef.current.clientHeight);
    const starX = Math.floor(Math.random() * containerRef.current.clientWidth);
    star.style.position = 'absolute';
    star.style.top = `${starY}px`;
    star.style.left = `${starX}px`;
    star.style.width = '2px';
    star.style.height = '2px';
    star.style.backgroundColor = 'white';
    star.style.animation = `rainbowTwinkle ${Math.random() * 3 + 2}s infinite ease-in-out`; // Randomize the duration
    starField.appendChild(star);
  }

  containerRef.current.appendChild(starField);
}



useEffect(() => {
  setupStars();
}, []);



  return (
    <GameContainer ref={containerRef} onMouseMove={handleMouseMove} onClick={handleShoot}>
      <Description>
        <DescriptionIcon />
        <SkillContainer>
        <h1 className='skillContainerBig'>FRONTEND</h1>
        <ScrollUI />
        </SkillContainer>
        <SkillContainer style={{ top: '100px', backgroundImage: 'linear-gradient(to bottom, #0000ff, #ffffff)' }}>
          <h1 style={{ color: 'white', textAlign: 'center', fontSize: '20px', fontFamily: 'Emulogic', marginTop: '2px' }}>BACKEND</h1>
        </SkillContainer>
        <SmallSkillContainer>
          <h1 style={{ color: 'white', textAlign: 'center', fontSize: '12px', fontFamily: 'Emulogic', marginTop: '2px' }}>CLOUD/DEVOPS</h1>
        </SmallSkillContainer>
        <SmallSkillContainer style={{left: '63%'}} />
      </Description>
      <GameBorder />
      <HUD>1UP</HUD>
      <Score>{score}</Score>
      <HUD style={{ left: '60%' }}>HI-SCORE</HUD>
      <Score style={{ left: '60%' }}>{highScore}</Score>
      <Ship $left={shipPosition.left} $top={shipPosition.top} />
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} $left={bullet.left} $top={bullet.top} />
      ))}
      {invaders.map((invader) => (
        <Invader
          key={invader.id}
          $color={invader.color}
          $top={invader.top}
          $left={invader.left}
          $image={invader.image}
          $opacity={invader.opacity}
        >
        </Invader>
      ))}
      {timers.map((timer) => (
        <Timer
          key={timer.id}
          $color={timer.color}
          $top={timer.top}
          $left={timer.left}
        >
        </Timer>
      ))}
    </GameContainer>
  );
};

export default Galaga;


