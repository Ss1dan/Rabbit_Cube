import React from 'react';
import walls from '../../assets/Stena.svg';

// Места с координатами
const places = [
  // Standard 1-20
  { id: 1, type: 'Standard', x: 150, y: 230, w: 35, h: 35 },
  { id: 2, type: 'Standard', x: 200, y: 230, w: 35, h: 35 },
  { id: 3, type: 'Standard', x: 250, y: 230, w: 35, h: 35 },
  { id: 4, type: 'Standard', x: 300, y: 230, w: 35, h: 35 },
  { id: 5, type: 'Standard', x: 350, y: 230, w: 35, h: 35 },
  { id: 6, type: 'Standard', x: 150, y: 160, w: 35, h: 35 },
  { id: 7, type: 'Standard', x: 200, y: 160, w: 35, h: 35 },
  { id: 8, type: 'Standard', x: 250, y: 160, w: 35, h: 35 },
  { id: 9, type: 'Standard', x: 300, y: 160, w: 35, h: 35 },
  { id: 10, type: 'Standard', x: 350, y: 160, w: 35, h: 35 },
  { id: 11, type: 'Standard', x: 150, y: 85, w: 35, h: 35 },
  { id: 12, type: 'Standard', x: 200, y: 85, w: 35, h: 35 },
  { id: 13, type: 'Standard', x: 250, y: 85, w: 35, h: 35 },
  { id: 14, type: 'Standard', x: 300, y: 85, w: 35, h: 35 },
  { id: 15, type: 'Standard', x: 350, y: 85, w: 35, h: 35 },
  { id: 16, type: 'Standard', x: 150, y: 25, w: 35, h: 33 },
  { id: 17, type: 'Standard', x: 200, y: 25, w: 35, h: 33 },
  { id: 18, type: 'Standard', x: 250, y: 25, w: 35, h: 33 },
  { id: 19, type: 'Standard', x: 300, y: 25, w: 35, h: 33 },
  { id: 20, type: 'Standard', x: 350, y: 25, w: 35, h: 33 },
  // VIP 21-35
  { id: 21, type: 'VIP', x: 80, y: 225, w: 35, h: 35 },
  { id: 22, type: 'VIP', x: 80, y: 175, w: 35, h: 35 },
  { id: 23, type: 'VIP', x: 80, y: 125, w: 35, h: 35 },
  { id: 24, type: 'VIP', x: 80, y: 75, w: 35, h: 35 },
  { id: 25, type: 'VIP', x: 80, y: 25, w: 35, h: 35 },
  { id: 26, type: 'VIP', x: 20, y: 225, w: 35, h: 35 },
  { id: 27, type: 'VIP', x: 20, y: 175, w: 35, h: 35 },
  { id: 28, type: 'VIP', x: 20, y: 125, w: 35, h: 35 },
  { id: 29, type: 'VIP', x: 20, y: 75, w: 35, h: 35 },
  { id: 30, type: 'VIP', x: 20, y: 25, w: 35, h: 35 },
  { id: 31, type: 'VIP', x: 620, y: 265, w: 50, h: 40 },
  { id: 32, type: 'VIP', x: 620, y: 205, w: 50, h: 40 },
  { id: 33, type: 'VIP', x: 620, y: 145, w: 50, h: 40 },
  { id: 34, type: 'VIP', x: 620, y: 85, w: 50, h: 40 },
  { id: 35, type: 'VIP', x: 620, y: 25, w: 50, h: 40 },
  // PS5 36-38
  { id: 36, type: 'PS5', x: 500, y: 265, w: 60, h: 40 },
  { id: 37, type: 'PS5', x: 500, y: 150, w: 60, h: 40 },
  { id: 38, type: 'PS5', x: 500, y: 50, w: 60, h: 40 },
];

const strokeColors = {
  Standard: '#4ECCA3',
  VIP: '#7B00FF',
  PS5: '#FF6200'
};

const Scheme = ({ onPlaceClick, occupiedIds, selectedPlace }) => {
  const getColor = (id) => {
    if (occupiedIds.includes(id)) return '#2d2d2d';
    if (selectedPlace === id) return '#4ECCA3';
    return '#555';
  };

  const getStrokeColor = (type) => strokeColors[type] || '#4ECCA3';

  return (
    <svg viewBox="0 0 693 514" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">      <image href={walls} x="0" y="0" width="693" height="514" />
      
      {places.map(p => (
        <g key={p.id} onClick={() => onPlaceClick(p.id)} style={{ cursor: 'pointer' }}>
          <rect
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            fill={getColor(p.id)}
            strokeWidth="0.5"
            rx="3"
            opacity="0.9"
          />
          {/* Верхняя цветная линия */}
          <line
            x1={p.x}
            y1={p.y}
            x2={p.x + p.w}
            y2={p.y}
            stroke={getStrokeColor(p.type)}
            strokeWidth="3"
          />
          <text
            x={p.x + p.w / 2}
            y={p.y + p.h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fff"
            fontSize="12"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            {p.id}
          </text>
        </g>
      ))}

      {/* Легенда */}
      <g transform="translate(20, 440)">
        <line x1="0" y1="6" x2="12" y2="6" stroke={strokeColors.Standard} strokeWidth="3" />
        <text x="18" y="10" fill="#eee" fontSize="12">Standard</text>

        <line x1="0" y1="24" x2="12" y2="24" stroke={strokeColors.VIP} strokeWidth="3" />
        <text x="18" y="28" fill="#eee" fontSize="12">VIP</text>

        <line x1="0" y1="42" x2="12" y2="42" stroke={strokeColors.PS5} strokeWidth="3" />
        <text x="18" y="46" fill="#eee" fontSize="12">PlayStation 5</text>
      </g>
    </svg>
  );
};

export default Scheme;