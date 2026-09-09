import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, GestureResponderEvent } from 'react-native';
import { Canvas, Path, useCanvasRef } from '@shopify/react-native-skia';
import { usePracticeStore } from '../../store/usePracticeStore';
import { smoothPointsToPath } from '../../engine/strokeSmoother';
import type { Point } from '../../types/canvas';

interface HandwritingCanvasProps {
  children?: React.ReactNode;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ children }) => {
  const canvasRef = useCanvasRef();
  const {
    strokes,
    strokeWidth,
    strokeColor,
    palmRejectionEnabled,
    addStroke,
  } = usePracticeStore();

  const [activePoints, setActivePoints] = useState<Point[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const currentPointsRef = useRef<Point[]>([]);
  const isStylusRef = useRef<boolean>(false);

  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      const touch = event.nativeEvent;

      // Stylus & Apple Pencil Detection
      // On iOS: Apple Pencil produces touch.force > 0, altitudeAngle, or stylusType === 1
      const isStylus =
        (touch.force ?? 0) > 0 ||
        (touch as any).stylusType === 1 ||
        (touch as any).altitudeAngle != null;

      isStylusRef.current = isStylus;

      // Palm Rejection: If enabled and touch is not a stylus, reject it
      if (palmRejectionEnabled && !isStylus) {
        isDrawingRef.current = false;
        return;
      }

      isDrawingRef.current = true;
      const initialPoint: Point = {
        x: touch.locationX,
        y: touch.locationY,
        force: touch.force,
        timestamp: Date.now(),
      };

      currentPointsRef.current = [initialPoint];
      setActivePoints([initialPoint]);
    },
    [palmRejectionEnabled]
  );

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    if (!isDrawingRef.current) return;

    const touch = event.nativeEvent;
    const newPoint: Point = {
      x: touch.locationX,
      y: touch.locationY,
      force: touch.force,
      timestamp: Date.now(),
    };

    currentPointsRef.current.push(newPoint);
    setActivePoints([...currentPointsRef.current]);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const points = currentPointsRef.current;
    if (points.length > 0) {
      const path = smoothPointsToPath(points, strokeWidth);
      addStroke({
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        points,
        path,
        strokeWidth,
        color: strokeColor,
        isStylus: isStylusRef.current,
      });
    }

    currentPointsRef.current = [];
    setActivePoints([]);
  }, [addStroke, strokeWidth, strokeColor]);

  const handleTouchCancel = useCallback(() => {
    isDrawingRef.current = false;
    currentPointsRef.current = [];
    setActivePoints([]);
  }, []);

  // Compute smooth path for the stroke currently being drawn
  const activePath = activePoints.length > 0 ? smoothPointsToPath(activePoints, strokeWidth) : null;

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleTouchStart}
      onResponderMove={handleTouchMove}
      onResponderRelease={handleTouchEnd}
      onResponderTerminate={handleTouchCancel}
    >
      <Canvas ref={canvasRef} style={styles.canvas}>
        {/* Render child layers first (e.g. guidelines and ghost template) */}
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
