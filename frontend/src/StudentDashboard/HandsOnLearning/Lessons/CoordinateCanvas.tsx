import React, { useState, useCallback } from "react";
import { Stage, Layer, Line, Circle, Text, Group } from "react-konva";

type Point = {
  id: string;
  x: number;
  y: number;
};

type Shape = {
  points: Point[];
  type: string;
  completed: boolean;
};

const GRID_SIZE = 400;
const CELL_SIZE = 20;
const AXIS_COLOR = "#333";

const CoordinateCanvas: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [currentMode, setCurrentMode] = useState<"plot" | "shape" | "parallel" | "perpendicular">("plot");
  const [currentShapeType, setCurrentShapeType] = useState<string>("line");

  const handleClick = useCallback((e: any) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) return;

    const snappedX = Math.round(pointerPosition.x / CELL_SIZE) * CELL_SIZE;
    const snappedY = Math.round(pointerPosition.y / CELL_SIZE) * CELL_SIZE;

    // Check if clicking on existing point
    const existingPoint = points.find(
      (p) => Math.abs(p.x - snappedX) < 10 && Math.abs(p.y - snappedY) < 10
    );

    if (existingPoint) {
      if (currentMode === "plot") {
        selectPoint(existingPoint);
      } else if (currentMode === "shape") {
        addToShape(existingPoint);
      }
      return;
    }

    const newPoint: Point = {
      id: Date.now().toString(),
      x: snappedX,
      y: snappedY,
    };

    setPoints((prev) => [...prev, newPoint]);

    if (currentMode === "shape") {
      addToShape(newPoint);
    } else if (currentMode === "plot") {
      selectPoint(newPoint);
    }
  }, [points, currentMode]);

  const selectPoint = useCallback((point: Point) => {
    setSelectedPoints((prev) => {
      if (prev.includes(point)) {
        return prev.filter(p => p !== point);
      }
      if (prev.length === 2) {
        return [prev[1], point];
      }
      return [...prev, point];
    });
  }, []);

  const addToShape = useCallback((point: Point) => {
    setShapes((prev) => {
      if (prev.length === 0 || prev[prev.length - 1].completed) {
        // Start new shape
        return [...prev, {
          points: [point],
          type: currentShapeType,
          completed: false
        }];
      } else {
        // Add to current shape
        const lastShape = prev[prev.length - 1];
        const newPoints = [...lastShape.points, point];
        
        // Check if shape is complete
        let completed = false;
        if (currentShapeType === "line" && newPoints.length === 2) {
          completed = true;
        } else if (currentShapeType === "triangle" && newPoints.length === 3) {
          completed = true;
        } else if (currentShapeType === "rectangle" && newPoints.length === 4) {
          completed = true;
        }

        return [
          ...prev.slice(0, -1),
          { ...lastShape, points: newPoints, completed }
        ];
      }
    });
  }, [currentShapeType]);

  const calculateDistance = (p1: Point, p2: Point) => {
    const dx = (p2.x - p1.x) / CELL_SIZE;
    const dy = (p1.y - p2.y) / CELL_SIZE;
    return Math.sqrt(dx * dx + dy * dy).toFixed(2);
  };

  const calculateGradient = (p1: Point, p2: Point): string => {
    const dx = (p2.x - p1.x) / CELL_SIZE;
    const dy = (p1.y - p2.y) / CELL_SIZE;
    if (dx === 0) return "undefined";
    return (dy / dx).toFixed(2);
  };

  const calculateMidpoint = (p1: Point, p2: Point) => {
    const midX = ((p1.x + p2.x) / 2) / CELL_SIZE;
    const midY = ((GRID_SIZE - (p1.y + p2.y) / 2) / CELL_SIZE);
    return `(${midX.toFixed(1)}, ${midY.toFixed(1)})`;
  };

  const getLineEquation = (p1: Point, p2: Point): string => {
    const dx = (p2.x - p1.x) / CELL_SIZE;
    const dy = (p1.y - p2.y) / CELL_SIZE;
    
    if (dx === 0) return `x = ${p1.x / CELL_SIZE}`;
    
    const m = dy / dx;
    const b = (GRID_SIZE - p1.y) / CELL_SIZE - m * (p1.x / CELL_SIZE);
    
    if (m === 0) return `y = ${b.toFixed(1)}`;
    return `y = ${m.toFixed(2)}x ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(1)}`;
  };

  const drawParallelLine = (p1: Point, p2: Point) => {
    if (selectedPoints.length !== 2) return null;
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const offset = 30; // Offset for parallel line
    
    return (
      <Line
        points={[p1.x + offset, p1.y - offset, p2.x + offset, p2.y - offset]}
        stroke="green"
        strokeWidth={2}
        dash={[5, 5]}
      />
    );
  };

  const drawPerpendicularLine = (p1: Point, p2: Point) => {
    if (selectedPoints.length !== 2) return null;
    
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const length = 50;
    
    // Calculate perpendicular slope
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    if (dx === 0) {
      // Original line is vertical, perpendicular is horizontal
      return (
        <Line
          points={[midX - length, midY, midX + length, midY]}
          stroke="red"
          strokeWidth={2}
          dash={[5, 5]}
        />
      );
    }
    
    if (dy === 0) {
      // Original line is horizontal, perpendicular is vertical
      return (
        <Line
          points={[midX, midY - length, midX, midY + length]}
          stroke="red"
          strokeWidth={2}
          dash={[5, 5]}
        />
      );
    }
    
    // Calculate perpendicular direction
    const perpDX = -dy;
    const perpDY = dx;
    const factor = length / Math.sqrt(perpDX * perpDX + perpDY * perpDY);
    
    return (
      <Line
        points={[
          midX - perpDX * factor,
          midY - perpDY * factor,
          midX + perpDX * factor,
          midY + perpDY * factor
        ]}
        stroke="red"
        strokeWidth={2}
        dash={[5, 5]}
      />
    );
  };

  const clearAll = () => {
    setPoints([]);
    setSelectedPoints([]);
    setShapes([]);
  };

  const getPointLabel = (point: Point) => {
    const xCoord = point.x / CELL_SIZE;
    const yCoord = (GRID_SIZE - point.y) / CELL_SIZE;
    return `(${xCoord},${yCoord})`;
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-6 w-full">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setCurrentMode("plot")}
              className={`px-4 py-2 rounded ${currentMode === "plot" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Plot Points
            </button>
            <button
              onClick={() => {
                setCurrentMode("shape");
                setCurrentShapeType("line");
              }}
              className={`px-4 py-2 rounded ${currentMode === "shape" && currentShapeType === "line" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Draw Line
            </button>
            <button
              onClick={() => {
                setCurrentMode("shape");
                setCurrentShapeType("triangle");
              }}
              className={`px-4 py-2 rounded ${currentMode === "shape" && currentShapeType === "triangle" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Draw Triangle
            </button>
            <button
              onClick={() => {
                setCurrentMode("shape");
                setCurrentShapeType("rectangle");
              }}
              className={`px-4 py-2 rounded ${currentMode === "shape" && currentShapeType === "rectangle" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Draw Rectangle
            </button>
            <button
              onClick={() => setCurrentMode("parallel")}
              className={`px-4 py-2 rounded ${currentMode === "parallel" ? "bg-green-600 text-white" : "bg-gray-200"}`}
            >
              Parallel Line
            </button>
            <button
              onClick={() => setCurrentMode("perpendicular")}
              className={`px-4 py-2 rounded ${currentMode === "perpendicular" ? "bg-red-600 text-white" : "bg-gray-200"}`}
            >
              Perpendicular Line
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              {showGrid ? "Hide Grid" : "Show Grid"}
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Clear All
            </button>
          </div>

          <div className="relative border border-gray-300 shadow-lg bg-white">
            <Stage
              width={GRID_SIZE}
              height={GRID_SIZE}
              onClick={handleClick}
            >
              <Layer>
                {/* Grid lines */}
                {showGrid && Array.from({ length: GRID_SIZE / CELL_SIZE + 1 }).map((_, i) => (
                  <React.Fragment key={`grid-${i}`}>
                    <Line
                      points={[i * CELL_SIZE, 0, i * CELL_SIZE, GRID_SIZE]}
                      stroke={i === GRID_SIZE / CELL_SIZE / 2 ? AXIS_COLOR : "#eee"}
                      strokeWidth={i === GRID_SIZE / CELL_SIZE / 2 ? 2 : 1}
                    />
                    <Line
                      points={[0, i * CELL_SIZE, GRID_SIZE, i * CELL_SIZE]}
                      stroke={i === GRID_SIZE / CELL_SIZE / 2 ? AXIS_COLOR : "#eee"}
                      strokeWidth={i === GRID_SIZE / CELL_SIZE / 2 ? 2 : 1}
                    />
                  </React.Fragment>
                ))}

                {/* Axes labels */}
                {showLabels && (
                  <Group>
                    {Array.from({ length: Math.floor(GRID_SIZE / CELL_SIZE / 2) }).map((_, i) => {
                      if (i === 0) return null;
                      return (
                        <React.Fragment key={`axis-label-${i}`}>
                          <Text
                            text={i.toString()}
                            x={GRID_SIZE / 2 + i * CELL_SIZE - 5}
                            y={GRID_SIZE / 2 + 15}
                            fontSize={12}
                            fill={AXIS_COLOR}
                          />
                          <Text
                            text={(-i).toString()}
                            x={GRID_SIZE / 2 - i * CELL_SIZE - 5}
                            y={GRID_SIZE / 2 + 15}
                            fontSize={12}
                            fill={AXIS_COLOR}
                          />
                          <Text
                            text={i.toString()}
                            x={GRID_SIZE / 2 - 20}
                            y={GRID_SIZE / 2 - i * CELL_SIZE + 5}
                            fontSize={12}
                            fill={AXIS_COLOR}
                          />
                          <Text
                            text={(-i).toString()}
                            x={GRID_SIZE / 2 - 20}
                            y={GRID_SIZE / 2 + i * CELL_SIZE + 5}
                            fontSize={12}
                            fill={AXIS_COLOR}
                          />
                        </React.Fragment>
                      );
                    })}
                    <Text
                      text="0"
                      x={GRID_SIZE / 2 - 10}
                      y={GRID_SIZE / 2 + 15}
                      fontSize={12}
                      fill={AXIS_COLOR}
                    />
                    <Text
                      text="x"
                      x={GRID_SIZE - 15}
                      y={GRID_SIZE / 2 + 15}
                      fontSize={14}
                      fill={AXIS_COLOR}
                      fontStyle="bold"
                    />
                    <Text
                      text="y"
                      x={GRID_SIZE / 2 - 15}
                      y={15}
                      fontSize={14}
                      fill={AXIS_COLOR}
                      fontStyle="bold"
                    />
                  </Group>
                )}

                {/* Shapes */}
                {shapes.map((shape, shapeIdx) => (
                  <Group key={`shape-${shapeIdx}`}>
                    {/* Lines connecting shape points */}
                    {shape.points.length > 1 && (
                      <Line
                        points={shape.points.flatMap(p => [p.x, p.y])}
                        stroke="blue"
                        strokeWidth={3}
                        closed={shape.completed && shape.type !== "line"}
                      />
                    )}
                    
                    {/* Points of the shape */}
                    {shape.points.map((point, pointIdx) => (
                      <React.Fragment key={`shape-point-${shapeIdx}-${pointIdx}`}>
                        <Circle
                          x={point.x}
                          y={point.y}
                          radius={6}
                          fill="blue"
                          stroke="white"
                          strokeWidth={1}
                        />
                        {showLabels && (
                          <Text
                            text={String.fromCharCode(65 + points.findIndex(p => p.id === point.id))}
                            x={point.x + 10}
                            y={point.y - 10}
                            fontSize={14}
                            fill="blue"
                            fontStyle="bold"
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </Group>
                ))}

                {/* Selected points connection */}
                {selectedPoints.length === 2 && (
                  <Group>
                    <Line
                      points={[
                        selectedPoints[0].x,
                        selectedPoints[0].y,
                        selectedPoints[1].x,
                        selectedPoints[1].y,
                      ]}
                      stroke="purple"
                      strokeWidth={3}
                      dash={[10, 5]}
                    />
                    {currentMode === "parallel" && drawParallelLine(selectedPoints[0], selectedPoints[1])}
                    {currentMode === "perpendicular" && drawPerpendicularLine(selectedPoints[0], selectedPoints[1])}
                  </Group>
                )}

                {/* All points */}
                {points.map((point, index) => (
                  <Group key={point.id}>
                    <Circle
                      x={point.x}
                      y={point.y}
                      radius={6}
                      fill={selectedPoints.includes(point) ? "red" : "purple"}
                      stroke="white"
                      strokeWidth={1}
                    />
                    {showLabels && (
                      <Text
                        text={String.fromCharCode(65 + index)}
                        x={point.x + 10}
                        y={point.y - 10}
                        fontSize={14}
                        fill={selectedPoints.includes(point) ? "red" : "purple"}
                        fontStyle="bold"
                      />
                    )}
                  </Group>
                ))}

                {/* Midpoint marker */}
                {selectedPoints.length === 2 && (
                  <Group>
                    <Circle
                      x={(selectedPoints[0].x + selectedPoints[1].x) / 2}
                      y={(selectedPoints[0].y + selectedPoints[1].y) / 2}
                      radius={5}
                      fill="orange"
                      stroke="white"
                      strokeWidth={1}
                    />
                    {showLabels && (
                      <Text
                        text="M"
                        x={(selectedPoints[0].x + selectedPoints[1].x) / 2 + 10}
                        y={(selectedPoints[0].y + selectedPoints[1].y) / 2 - 10}
                        fontSize={14}
                        fill="orange"
                        fontStyle="bold"
                      />
                    )}
                  </Group>
                )}
              </Layer>
            </Stage>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          {selectedPoints.length === 2 && (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4">
              <h3 className="text-xl font-semibold mb-3 text-purple-800">Line Analysis</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="font-semibold">Point A:</div>
                <div>{getPointLabel(selectedPoints[0])}</div>
                
                <div className="font-semibold">Point B:</div>
                <div>{getPointLabel(selectedPoints[1])}</div>
                
                <div className="font-semibold">Distance:</div>
                <div>{calculateDistance(selectedPoints[0], selectedPoints[1])} units</div>
                
                <div className="font-semibold">Gradient:</div>
                <div>{calculateGradient(selectedPoints[0], selectedPoints[1])}</div>
                
                <div className="font-semibold">Midpoint:</div>
                <div>{calculateMidpoint(selectedPoints[0], selectedPoints[1])}</div>
                
                <div className="font-semibold">Equation:</div>
                <div>{getLineEquation(selectedPoints[0], selectedPoints[1])}</div>
              </div>
            </div>
          )}

          {shapes.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-3 text-blue-800">Shape Properties</h3>
              {shapes.map((shape, index) => (
                <div key={`shape-details-${index}`} className="mb-4 last:mb-0">
                  <h4 className="font-semibold mb-1">
                    Shape {index + 1}: {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}
                  </h4>
                  {shape.points.length > 1 && (
                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm">
                      {shape.points.map((point, i) => (
                        <React.Fragment key={`shape-point-detail-${index}-${i}`}>
                          <div className="font-medium">
                            {String.fromCharCode(65 + points.findIndex(p => p.id === point.id))}:
                          </div>
                          <div>{getPointLabel(point)}</div>
                        </React.Fragment>
                      ))}
                      
                      {shape.points.length > 1 && (
                        <>
                          <div className="font-medium">Perimeter:</div>
                          <div>
                            {shape.points.reduce((total, p, i) => {
                              const next = shape.points[(i + 1) % shape.points.length];
                              return total + parseFloat(calculateDistance(p, next));
                            }, 0).toFixed(2)} units
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mt-4">
            <h3 className="text-xl font-semibold mb-2">Current Mode</h3>
            <p className="mb-2">
              <span className="font-semibold">{currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode</span>
              {currentMode === "shape" && ` (${currentShapeType})`}
            </p>
            <p className="text-sm text-gray-600">
              {currentMode === "plot" && "Click to plot points or select existing points"}
              {currentMode === "shape" && `Click to add points to your ${currentShapeType}`}
              {currentMode === "parallel" && "Select two points to see a parallel line (green dashed)"}
              {currentMode === "perpendicular" && "Select two points to see a perpendicular line (red dashed)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinateCanvas;