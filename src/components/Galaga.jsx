import React, { useState, useEffect, useRef, useCallback } from 'react';
import { shuffle } from 'lodash';
import styled from 'styled-components';
import shipImage from '../assets/spaceAssets/Ship.png';
import bulletImage from '../assets/spaceAssets/bullet.png';
import shootSound from '../assets/spaceAssets/FighterBullet.mp3';
import killSound from '../assets/spaceAssets/killSound.mp3';
import killSound2 from '../assets/spaceAssets/killSound2.mp3';
import python from '../assets/icons/python.svg';

// Styled components
const GameContainer = styled.div`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  //background-color: #000;
`;

const GameBorder = styled.div`
  width: 32%;
  height: 395px;
  position: relative;
  overflow: hidden;
  border: 2px solid #ffffff28;
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
    backgroundImage: `url(${props.$image})`,
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
  border: 2px solid white;
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

const uniqueInvaderProfiles = [
  { id: 1, image: 'path/to/image1.png', color: 'red', velocityY: 1 },
  { id: 2, image: 'path/to/image2.png', color: 'blue', velocityY: -1 },
  { id: 3, image: 'path/to/image3.png', color: 'green', velocityY: 1 },
  { id: 4, image: 'path/to/image4.png', color: 'yellow', velocityY: -1 },
  { id: 5, image: 'path/to/image5.png', color: 'purple', velocityY: 1 },
  { id: 6, image: 'path/to/image6.png', color: 'orange', velocityY: -1 },
  { id: 7, image: 'path/to/image7.png', color: 'pink', velocityY: 1 },
  { id: 8, image: 'path/to/image8.png', color: 'cyan', velocityY: -1 },
  { id: 9, image: 'path/to/image9.png', color: 'magenta', velocityY: 1 },
  { id: 10, image: 'path/to/image10.png', color: 'lime', velocityY: -1 },
  { id: 11, image: 'path/to/image11.png', color: 'teal', velocityY: 1 },
  { id: 12, image: 'path/to/image12.png', color: 'brown', velocityY: -1 },
];


// Galaga component
const Galaga = () => {
  const [shipPosition, setShipPosition] = useState({ left: 10, top: 150 });
  const [targetShipPosition, setTargetShipPosition] = useState({ left: 10, top: 150 });
  const [invaders, setInvaders] = useState([]);
  const [timers, setTimers] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [canShoot, setCanShoot] = useState(true);
  const requestRef = useRef();
  const containerRef = useRef();

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
          top: 20.5 + row * (invaderSize + spacing),
          velocityY: 1.5, // Alternating direction per column
        });
      }
    }

    setTimers(newTimers);
  }, []);

  // Initialize invaders
  const initializeInvaders = useCallback(() => {
    const numColumns = 6;
    const numRows = 4;
    const invaderSize = 70;
    const spacing = 25;
    const defaultProfile = { image: python, color: 'white', velocityY: 0.5 };
  
    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = containerRect.width - (numColumns * (invaderSize + spacing)) - 20;
  
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
          color: profile.color,
          velocityY: 0.5 * (col % 2 === 0 ? 1 : -1),
        });
      }
    }
  
    setInvaders(newInvaders);
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
  
        if (newTop <= 0 || newTop + 30  >= containerRef.current.clientHeight) {
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
    const bulletSpeed = 20;
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
      const audio = new Audio(shootSound);
      audio.play();

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
    const newY = e.clientY - containerRect.top - 25;

    const constrainedX = Math.max(-10, Math.min(newX, containerRect.width - containerRect.width / 4 * 3));
    const constrainedY = Math.max(-5, Math.min(newY, containerRect.height - 100));

    setTargetShipPosition({ left: constrainedX, top: constrainedY });
  }, []);

  useEffect(() => {
    const smoothMoveShip = () => {
      setShipPosition((prevPosition) => {
        const targetPosition = targetShipPosition;
        const deltaX = targetPosition.left - prevPosition.left;
        const deltaY = targetPosition.top - prevPosition.top;
        return {
          left: prevPosition.left + deltaX * 0.2,
          top: prevPosition.top + deltaY * 0.2,
        };
      });

      requestRef.current = requestAnimationFrame(smoothMoveShip);
    };

    const animationId = requestAnimationFrame(smoothMoveShip);
    return () => cancelAnimationFrame(animationId);
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
const lastBulletId = useRef(0);

useEffect(() => {
  bullets.forEach((bullet) => {
    setInvaders((currentInvaders) => {
      return currentInvaders.map((invader) => {
        if (
          bullet.left + 20 >= invader.left &&
          bullet.left <= invader.left + 20 &&
          bullet.top + 40 >= invader.top &&
          bullet.top <= invader.top + 40 &&
          !invader.isShielded // Check if the invader is not shielded
        ) {
          const audio = new Audio(Math.random() > 0.5 ? killSound : killSound2);
          
          bullet.id === lastBulletId.current ? lastBulletId.current = bullet.id : audio.play();
          lastBulletId.current = bullet.id;

            setBullets((currentBullets) => currentBullets.filter((b) => b.id !== bullet.id));

          // Mark invader as hit
          const updatedInvader = {
            ...invader,
            isHit: true,
            opacity: 0.05, // Make the invader semi-transparent
            isShielded: true, // Make the invader immune to further hits
          };
          // Set a timeout to revert the opacity and remove immunity
          setTimeout(() => {
            setInvaders((currentInvaders) =>
              currentInvaders.map((inv) =>
                inv.id === invader.id
                  ? { ...inv, isHit: false, opacity: 1, isShielded: false }
                  : inv
              )
            );
          }, 2000); // 2 seconds immunity period

          
          return updatedInvader;
        }
      
        return invader;
      });
    });
  });
}, [bullets]);




  return (
    <GameContainer ref={containerRef} onMouseMove={handleMouseMove} onClick={handleShoot}>
      <GameBorder />
      <Ship $left={shipPosition.left} $top={shipPosition.top} />
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} $left={bullet.left} $top={bullet.top} />
      ))}
      {invaders.map((invader, index) => (
        <Invader
          key={invader.id}
          $color={invader.color}
          $top={invader.top}
          $left={invader.left}
          $image={invader.image}
          $opacity={invader.opacity}
        >
          {index} {/* Display the invader ID */}
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

// todo
// add score
// add hud
// add respawn system
// invader sprites
