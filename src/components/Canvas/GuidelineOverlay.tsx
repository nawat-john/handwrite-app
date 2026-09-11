import React, { useMemo } from 'react';
import { Line, DashPathEffect, vec, Group } from '@shopify/react-native-skia';
import { usePracticeStore, DEFAULT_GUIDELINE_METRICS } from '../../store/usePracticeStore';

interface GuidelineOverlayProps {
  width?: number;
  scale?: number; // Same scale as the tracing text, so letters stay inside the bands
}

export const GuidelineOverlay: React.FC<GuidelineOverlayProps> = ({
  width = 1200,
  scale = 1,
}) => {
  const { guidelineBaseY } = usePracticeStore();
  const xHeight = DEFAULT_GUIDELINE_METRICS.xHeight * scale;
  const ascenderHeight = DEFAULT_GUIDELINE_METRICS.ascenderHeight * scale;
  const descenderDepth = DEFAULT_GUIDELINE_METRICS.descenderDepth * scale;

  // Vertical guideline metrics
  const topY = guidelineBaseY - (ascenderHeight + xHeight); // Top Ascender Line
  const midY = guidelineBaseY - xHeight;                     // Mid Line (x-height)
  const baseY = guidelineBaseY;                             // Base Line
  const botY = guidelineBaseY + descenderDepth;              // Bottom Descender Line

  // Slant guidelines (~70° cursive slant angle across the guideline band)
  // Height = 112px, deltaX = 112 / tan(70°) ≈ 41px
  const slantDeltaX = Math.round((botY - topY) / Math.tan((70 * Math.PI) / 180));

  const slantLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const step = 64; // Distance between slant guidelines
    for (let x = 40; x < width - 20; x += step) {
      lines.push({
        x1: x + slantDeltaX,
        y1: topY - 8,
        x2: x,
        y2: botY + 8,
      });
    }
    return lines;
  }, [width, slantDeltaX, topY, botY]);

  return (
    <Group>
      {/* 1. Subtle Cursive Slant Guide Lines (~70° Angle) */}
      {slantLines.map((line, idx) => (
        <Line
          key={`slant-${idx}`}
          p1={vec(line.x1, line.y1)}
          p2={vec(line.x2, line.y2)}
          color="#F1F5F9"
          strokeWidth={1}
        >
          <DashPathEffect intervals={[4, 8]} />
        </Line>
      ))}

      {/* 2. Top Ascender Line (Soft Blue, Dashed) */}
      <Line
        p1={vec(0, topY)}
        p2={vec(width, topY)}
        color="#93C5FD"
        strokeWidth={1.2}
      >
        <DashPathEffect intervals={[6, 4]} />
      </Line>

      {/* 3. Mid Line (x-height) (Soft Amber, Dashed) */}
      <Line
        p1={vec(0, midY)}
        p2={vec(width, midY)}
        color="#CBD5E1"
        strokeWidth={1.2}
      >
        <DashPathEffect intervals={[5, 4]} />
      </Line>

      {/* 4. Base Line (Solid Slate Grounding Line, 1.8px) */}
      <Line
        p1={vec(0, baseY)}
        p2={vec(width, baseY)}
        color="#64748B"
        strokeWidth={1.8}
      />

      {/* 5. Bottom Descender Line (Soft Rose, Dashed) */}
      <Line
        p1={vec(0, botY)}
        p2={vec(width, botY)}
        color="#FCA5A5"
        strokeWidth={1.2}
      >
        <DashPathEffect intervals={[6, 4]} />
      </Line>
    </Group>
  );
};
