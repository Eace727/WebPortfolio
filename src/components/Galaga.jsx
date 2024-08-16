import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import shipImage from '../assets/spaceAssets/Ship.png';
import bulletImage from '../assets/spaceAssets/bullet.png';
import shootSound from '../assets/spaceAssets/FighterBullet.mp3';
import killSound from '../assets/spaceAssets/killSound.mp3';
import killSound2 from '../assets/spaceAssets/killSound2.mp3';

// Styled components
const GameContainer = styled.div`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  background-color: #000;
`;

const GameBorder = styled.div`
  width: 32%;
  height: 395px;
  position: relative;
  overflow: hidden;
  border: 2px solid #ff000028;
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
    backgroundColor: props.$color,
    border: '2px solid white'
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
          top: 20 + row * (invaderSize + spacing),
          velocityY: 0.5, // Alternating direction per column
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

    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = containerRect.width - (numColumns * (invaderSize + spacing)) - 20;

    const newInvaders = [];

    for (let col = 0; col < numColumns; col++) {
      for (let row = 0; row < numRows; row++) {
      newInvaders.push({
        id: col * numRows + row + 1,
        left: startX + col * (invaderSize + spacing),
        top: 20 + row * (invaderSize + spacing),
        image: `url(../assets/icons${col * numRows + row + 1}.png)`,
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
    const bulletSpeed = 10;
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

  // Handle collision detection and invader respawn
  useEffect(() => {
    bullets.forEach((bullet) => {
      setInvaders((currentInvaders) =>
        currentInvaders.filter((invader) => {
          if (
            bullet.left + 20 >= invader.left &&
            bullet.left <= invader.left + 20 &&
            bullet.top + 40 >= invader.top &&
            bullet.top <= invader.top + 40
          ) {
            const audio = new Audio(Math.random() < 0.5 ? killSound : killSound2);
            audio.play();

            // Add a new invader at the end of the list
            return false; // Remove this invader from the list
          }

          return true; // Keep this invader
        })
      );
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
