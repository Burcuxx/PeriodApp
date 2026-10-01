import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'calendar'
  | 'chart'
  | 'settings'
  | 'chevron-left'
  | 'chevron-right'
  | 'drop'
  | 'bell'
  | 'info'
  | 'arrow-right'
  | 'today'
  | 'lock';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color = '#2B1A2C', strokeWidth = 1.9 }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'calendar' && (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={3} {...common} />
          <Path d="M3 10h18M8 3v4M16 3v4" {...common} />
        </>
      )}
      {name === 'chart' && <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" {...common} />}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3} {...common} />
          <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" {...common} />
        </>
      )}
      {name === 'chevron-left' && <Path d="M15 18l-6-6 6-6" {...common} />}
      {name === 'chevron-right' && <Path d="M9 18l6-6-6-6" {...common} />}
      {name === 'drop' && <Path d="M12 2.7s-6 6.4-6 11a6 6 0 0 0 12 0c0-4.6-6-11-6-11z" {...common} />}
      {name === 'bell' && <Path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" {...common} />}
      {name === 'info' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M12 11v5M12 8h.01" {...common} />
        </>
      )}
      {name === 'arrow-right' && <Path d="M5 12h14M13 6l6 6-6 6" {...common} />}
      {name === 'today' && (
        <>
          <Circle cx={12} cy={12} r={4} {...common} />
          <Path d="M12 2v2M12 20v2M2 12h2M20 12h2" {...common} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Rect x={4} y={11} width={16} height={10} rx={2} {...common} />
          <Path d="M8 11V7a4 4 0 0 1 8 0v4" {...common} />
        </>
      )}
    </Svg>
  );
}

/** Filled droplet used for flow intensity. */
export function Drop({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size * 0.75} height={size} viewBox="0 0 12 16">
      <Path d="M6 1s-5 5.3-5 9a5 5 0 0 0 10 0C11 6.3 6 1 6 1z" fill={color} />
    </Svg>
  );
}

/** The two-tone ring logo next to the wordmark. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30">
      <Circle cx={15} cy={15} r={12} fill="none" stroke="#EFD5E0" strokeWidth={5} />
      <Circle
        cx={15}
        cy={15}
        r={12}
        fill="none"
        stroke="#CC2F62"
        strokeWidth={5}
        strokeDasharray="20 76"
        transform="rotate(-90 15 15)"
      />
    </Svg>
  );
}
