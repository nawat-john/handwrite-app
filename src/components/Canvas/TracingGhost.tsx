import React from 'react';
import { Text, useFont } from '@shopify/react-native-skia';
import { usePracticeStore } from '../../store/usePracticeStore';

interface TracingGhostProps {
  startX?: number;
  fontSize?: number;
}

export const TracingGhost: React.FC<TracingGhostProps> = ({
  startX = 60,
  fontSize = 96,
}) => {
  const { mode, currentText, guidelineBaseY } = usePracticeStore();

  // Load the dashed tracing font through Skia font loader
  const font = useFont(
    require('../../../assets/fonts/LearningCurvePro-Dashed.otf'),
    fontSize
  );

  // In Blank mode or if font hasn't loaded yet, do not render ghost overlay
  if (mode !== 'trace' || !font) {
    return null;
  }

  return (
    <Text
      text={currentText}
      x={startX}
      y={guidelineBaseY}
      font={font}
      color="#94A3B8"
      opacity={0.45}
    />
  );
};
