import React, { useRef, useState } from 'react';

const TiltCard = ({ children, className = '', max = 15, scale = 1.05, speed = 400 }) => {
    const cardRef = useRef(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * max * -1; // Invert X for natural feel
        const rotateY = ((x - centerX) / centerX) * max;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
            transition: 'none', // Remove transition for smooth tracking
            zIndex: 10
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`,
            transition: `all ${speed}ms ease-out`,
            zIndex: 1
        });
    };

    return (
        <div
            ref={cardRef}
            className={`${className}`}
            style={{
                ...style,
                transformStyle: 'preserve-3d',
                willChange: 'transform'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};

export default TiltCard;
