import styled, { css, keyframes } from 'styled-components';

const circle_color1 = '#e66700';
const circle_color2 = '#263a7b';
const label_color = '#ffffff';
const circleSize = '180px';

export const LoadingBarStyled = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 9999;
    background-color: rgba(29, 28, 28, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const BarContainerStyled = styled.div`
    height: ${circleSize};
    position: relative;
    width: 90px;
    border-radius: 100%;
    margin: 0 auto; // adjusted margin for auto in all directions
`;

export const LoadingCircleStyled = styled.div`
    height: ${circleSize};
    width: ${circleSize};
    position: relative;
    border-radius: 100%;
    border: 3px solid transparent;
    border-color: transparent ${circle_color1} transparent ${circle_color2};
    animation: ${() => rotateLoadingAnimation};
    transform-origin: 50% 50%;
    transition: all 0.5s ease-in-out;
`;

export const LoadingLabelStyled = styled.div`
    width: ${circleSize};
    height: ${circleSize};
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    animation: ${() => loadingTextAnimation};
    color: ${label_color};
    opacity: 0;
    position: absolute;
    text-align: center;
    text-transform: uppercase;
    font-family: 'Open Sans', sans-serif;
`;

const rotateLoading = keyframes`
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
`;
const rotateLoadingAnimation = css`
    ${rotateLoading} 1.2s linear infinite;
`;

const loadingText = keyframes`
    0% {
        opacity: 1
    }
    20% {
        opacity: 0
    }
    50% {
        opacity: 0
    }
    100% {
        opacity: 1
    }
`;
const loadingTextAnimation = css`
    ${loadingText} 2s linear 0s infinite normal;
`;
