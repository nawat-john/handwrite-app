import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent, PointerEvent } from 'react-native';
import { Canvas, Path } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, PointerType } from 'react-native-gesture-handler';
import { usePracticeStore } from '../../store/usePracticeStore';
import { smoothPointsToPath } from '../../engine/strokeSmoother';
import { GuidelineOverlay } from './GuidelineOverlay';
import { TracingGhost } from './TracingGhost';
import type { Point } from '../../types/canvas';

interface HandwritingCanvasProps {
  textScale?: number;
  children?: React.ReactNode;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ textScale = 1, children }) => {
  const {
    strokes,
    strokeWidth,
    strokeColor,
    palmRejectionEnabled,
    addStroke,
    canvasSize,
    setCanvasSize,
  } = usePracticeStore();

  const [activePoints, setActivePoints] = useState<Point[]>([]);
  // Id of the touch that is currently drawing (the Pencil), null when idle
  const drawingTouchIdRef = useRef<number | null>(null);
  const currentPointsRef = useRef<Point[]>([]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      // Evaluation masks need integer pixel sizes
      if (width > 0 && height > 0) {
        setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    },
    [setCanvasSize]
  );

  const resetActiveStroke = useCallback(() => {
    drawingTouchIdRef.current = null;
    currentPointsRef.current = [];
    setActivePoints([]);
  }, []);

  const commitActiveStroke = useCallback(() => {
    const points = currentPointsRef.current;
    resetActiveStroke();
    if (points.length === 0) return;
    addStroke({
      id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      points,
      path: smoothPointsToPath(points, strokeWidth),
      strokeWidth,
      color: strokeColor,
      isStylus: palmRejectionEnabled,
    });
  }, [addStroke, resetActiveStroke, strokeWidth, strokeColor, palmRejectionEnabled]);

  // Each touch/pointer is tracked by id, so fingers or a palm resting on the glass never
  // draw and never disturb the Pencil stroke. Fingers stay free for the UI buttons.
  const beginStroke = useCallback((id: number, isPencil: boolean, x: number, y: number) => {
    if (drawingTouchIdRef.current !== null) return;
    if (palmRejectionEnabled && !isPencil) return;
    drawingTouchIdRef.current = id;
    currentPointsRef.current = [{ x, y, timestamp: Date.now() }];
    setActivePoints(currentPointsRef.current);
  }, [palmRejectionEnabled]);

  const extendStroke = useCallback((id: number, x: number, y: number) => {
    if (id !== drawingTouchIdRef.current) return;
    currentPointsRef.current.push({ x, y, timestamp: Date.now() });
    setActivePoints([...currentPointsRef.current]);
  }, []);

  const endStroke = useCallback((id: number, keep: boolean) => {
    if (id !== drawingTouchIdRef.current) return;
    if (keep) commitActiveStroke();
    else resetActiveStroke();
  }, [commitActiveStroke, resetActiveStroke]);

  // Native (Expo Go): gesture-handler touch events
  const drawGesture = useMemo(
    () =>
      Gesture.Manual()
        .runOnJS(true)
        .onTouchesDown((e, manager) => {
          manager.activate();
          if (e.changedTouches.length !== 1) return;
          // ponytail: gesture-handler reports one pointerType per event (taken from any touch on
          // screen), not per touch. Fine in practice because iPadOS cancels resting-palm touches
          // right away, so the Pencil is normally alone when it lands. A native per-touch
          // `UITouch.type` check needs a dev build, not Expo Go.
          const touch = e.changedTouches[0];
          beginStroke(touch.id, e.pointerType === PointerType.STYLUS, touch.x, touch.y);
        })
        .onTouchesMove((e) => {
          e.changedTouches.forEach((t) => extendStroke(t.id, t.x, t.y));
        })
        .onTouchesUp((e, manager) => {
          e.changedTouches.forEach((t) => endStroke(t.id, true));
          if (e.numberOfTouches === 0) manager.end();
        })
        .onTouchesCancelled((e, manager) => {
          e.changedTouches.forEach((t) => endStroke(t.id, false));
          if (e.numberOfTouches === 0) manager.end();
        })
        .onFinalize(() => {
          if (drawingTouchIdRef.current !== null) resetActiveStroke();
        }),
    [beginStroke, extendStroke, endStroke, resetActiveStroke]
  );

  // Web (PWA in Safari): DOM pointer events carry the real type of each pointer,
  // so a resting palm can never be mistaken for the Pencil.
  const webPointerProps = {
    onPointerDown: (e: PointerEvent) => {
      const { pointerId, pointerType, offsetX, offsetY } = e.nativeEvent;
      // Keep receiving this pointer even if it leaves the canvas mid-stroke (e.target is a DOM node on web)
      (e.target as unknown as Element).setPointerCapture?.(pointerId);
      beginStroke(pointerId, pointerType === 'pen', offsetX, offsetY);
    },
    onPointerMove: (e: PointerEvent) =>
      extendStroke(e.nativeEvent.pointerId, e.nativeEvent.offsetX, e.nativeEvent.offsetY),
    onPointerUp: (e: PointerEvent) => endStroke(e.nativeEvent.pointerId, true),
    onPointerCancel: (e: PointerEvent) => endStroke(e.nativeEvent.pointerId, false),
  };

  // Compute smooth path for the stroke currently being drawn
  const activePath = activePoints.length > 0 ? smoothPointsToPath(activePoints, strokeWidth) : null;

  const surface = (
    <View
      style={styles.container}
      onLayout={handleLayout}
      {...(Platform.OS === 'web' ? webPointerProps : null)}
    >
      <Canvas style={styles.canvas}>
        {/* 1. Guideline Overlay Layer (French/American 4-line Ruled + Slant Guides) */}
        <GuidelineOverlay width={canvasSize.width} scale={textScale} />

        {/* 2. Tracing Ghost Font Layer (LearningCurvePro-Dashed in Trace Mode) */}
        <TracingGhost scale={textScale} />

        {/* 3. Additional custom children layers if provided */}
        {children}

        {/* Render previously completed strokes */}
        {strokes.map((stroke) => (
          <Path
            key={stroke.id}
            path={stroke.path}
            color={stroke.color}
            style="stroke"
            strokeWidth={stroke.strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          />
        ))}

        {/* Render active stroke in real-time */}
        {activePath && (
          <Path
            path={activePath}
            color={strokeColor}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      </Canvas>
    </View>
  );

  return Platform.OS === 'web' ? surface : <GestureDetector gesture={drawGesture}>{surface}</GestureDetector>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7', // Paper notebook warm cream tone
  },
  canvas: {
    flex: 1,
  },
});
