import React from 'react';
import {
    LoadingBarStyled,
    BarContainerStyled,
    LoadingCircleStyled,
    LoadingLabelStyled
} from './LoadingBar.style';

const LoadingBar = ({ message }) => (
    <LoadingBarStyled>
        <BarContainerStyled>
            <LoadingCircleStyled></LoadingCircleStyled>
            <LoadingLabelStyled>{message ? message : 'Loading'}</LoadingLabelStyled>
        </BarContainerStyled>
    </LoadingBarStyled>
);

export default LoadingBar;