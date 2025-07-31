"use client";

import React from 'react';
import styled from 'styled-components';

interface AnimatedTopicCardProps {
  description: string;
  onClick: () => void;
}

const AnimatedTopicCard: React.FC<AnimatedTopicCardProps> = ({ description, onClick }) => {
  return (
    <StyledWrapper onClick={onClick}>
      <div className="card">
        <div className="bg" />
        <div className="blob" />
        <div className="content">
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    position: relative;
    width: 200px;
    height: 100px; /* Adjusted height for text only */
    border-radius: 14px;
    z-index: 1111;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: none;
    cursor: pointer; /* Add cursor pointer for clickability */
  }

  .bg {
    position: absolute;
    top: 5px;
    left: 5px;
    width: calc(100% - 10px); /* Adjust width to fit card */
    height: calc(100% - 10px); /* Adjust height to fit card */
    z-index: 2;
    background: rgb(255, 255, 255); /* More transparent for glassmorphism */
    backdrop-filter: blur(24px);
    border-radius: 10px;
    overflow: hidden;
    outline: 2px solid white;
  }

  .blob {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background-color:rgb(246, 173, 137); /* Less strong orange */
    opacity: 1;
    filter: blur(12px);
    animation: blob-bounce 5s infinite ease;
  }

  .content {
    position: relative;
    z-index: 3;
    text-align: center;
    padding: 10px;
  }

  @keyframes blob-bounce {
    0% {
      transform: translate(-100%, -100%) translate3d(0, 0, 0);
    }

    25% {
      transform: translate(-100%, -100%) translate3d(100%, 0, 0);
    }

    50% {
      transform: translate(-100%, -100%) translate3d(100%, 100%, 0);
    }

    75% {
      transform: translate(-100%, -100%) translate3d(0, 100%, 0);
    }

    100% {
      transform: translate(-100%, -100%) translate3d(0, 0, 0);
    }
  }
`;

export default AnimatedTopicCard;