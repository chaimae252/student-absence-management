import React from 'react';
import './body.scss';
import Top from '../TopSection/Top';
import Bottom from '../BottomSection/Bottom';
import Accountt from '../Account Section/Accountt';
import ErrorBoundary from '../../../ErrorBoundary';
const Body = () => {
    return (
        <div className='bodyy'>
            <Top />
            <ErrorBoundary>
            <Bottom />
            </ErrorBoundary>
        </div>
    )
}

export default Body;