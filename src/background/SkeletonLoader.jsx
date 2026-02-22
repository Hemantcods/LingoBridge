import React from 'react';
import './SkeletonLoader.css';

export const SkeletonLoader = () => {
  return (
    <div className="skeleton-loader" role="status" aria-label="Loading translation">
      <div className="skeleton-bar" style={{ width: '90%', animationDelay: '0s' }} />
      <div className="skeleton-bar" style={{ width: '75%', animationDelay: '0.1s' }} />
      <div className="skeleton-bar" style={{ width: '40%', animationDelay: '0.2s' }} />
    </div>
  );
};

export default SkeletonLoader;
