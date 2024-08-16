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
    backgroundColor: props.$color,
    border: '2px solid white'
  }
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
    const numColumns = 2;
    const numRows = 1;
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
          color: `rgb(${(col * numRows + row + 1) * 10}, ${255 - (col * numRows + row + 1) * 10}, 255)`,
          velocityY: 0.0105 * (col % 2 === 0 ? 1 : -1), // Alternating direction per column
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
          color: `rgb(${(col * numRows + row + 1) * 10}, ${255 - (col * numRows + row + 1) * 10}, 255)`,
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
    setInvaders((currentInvaders) => {
      return currentInvaders.map((invader) => {
        let newTopi = invader.top + invader.velocityY;

        setTimers((currentTimers) => {
          return currentTimers.map((timer, index) => {
            let newTop = timer.top + timer.velocityY;
    
            if (newTop <= 0) {
              // Reverse direction of the current invader
              timer.velocityY *= -1;
              newTop = timer.top + timer.velocityY;
              
    
              // Check the index of the current invader
              const currentIndex = currentTimers.findIndex((inv) => inv.id === timer.id);
              console.log("Current invader index:", currentIndex);

              currentTimers[index === 0 ? 1 : 0].velocityY *= -1;
    
              // Reverse direction of the three preceding invaders if they exist
              if ((index) === 0) {
                for (let i = 0; i <= 23; i++) {
                    currentInvaders[i].velocityY *= -1;
                }
              }
              if ((index) === 1) {
                for (let i = 0; i <= 23; i++) {
                    currentInvaders[i].velocityY *= -1;
                }
              }
            }
    
            return { ...timer, top: newTop };


        
      });
    });
      return { ...invader, top: newTopi };
    }, []);
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
      {timers.map((timer, index) => (
        <Timer
          key={timer.id}
          $color={timer.color}
          $top={timer.top}
          $left={timer.left}
        >
          {index} {/* Display the timer ID */}
        </Timer>
      ))}
    </GameContainer>
  );
};

export default Galaga;
