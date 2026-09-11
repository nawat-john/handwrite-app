import React, { useMemo } from 'react';
import { Glyphs, Group, useFont, vec } from '@shopify/react-native-skia';
import { usePracticeStore } from '../../store/usePracticeStore';
import { BASE_FONT_SIZE, TEXT_START_X } from '../../types/canvas';

interface TracingGhostProps {
  scale?: number;
}

export const TracingGhost: React.FC<TracingGhostProps> = ({ scale = 1 }) => {
  const { mode, currentText, guidelineBaseY } = usePracticeStore();

  // Load the dashed tracing font through Skia font loader
  const font = useFont(
    require('../../../assets/fonts/LearningCurvePro-Dashed.otf'),
    BASE_FONT_SIZE
  );
  // Solid font = the scoring template. Its glyph advances are what the evaluator uses.
  const templateFont = useFont(require('../../../assets/fonts/LearningCurvePro.otf'), BASE_FONT_SIZE);

  // The dashed font's advances are 1-2px wider than the solid font's (~28px drift over a
  // sentence), so each dashed glyph is placed at the solid font's position instead.
  const glyphs = useMemo(() => {
    if (!font || !templateFont) return [];
    const advances = templateFont.getGlyphWidths(templateFont.getGlyphIDs(currentText));
    let x = 0;
    return font.getGlyphIDs(currentText).map((id, i) => {
      const glyph = { id, pos: vec(x, 0) };
      x += advances[i] ?? 0;
      return glyph;
    });
  }, [font, templateFont, currentText]);

  // In Blank mode or if fonts haven't loaded yet, do not render ghost overlay
  if (mode !== 'trace' || !font || glyphs.length === 0) {
    return null;
  }

  // Scale around the baseline start so long sentences shrink onto the same guidelines
  return (
    <Group transform={[{ scale }]} origin={vec(TEXT_START_X, guidelineBaseY)}>
      <Glyphs
        font={font}
        glyphs={glyphs}
        x={TEXT_START_X}
        y={guidelineBaseY}
        color="#94A3B8"
        opacity={0.45}
      />
    </Group>
  );
};
