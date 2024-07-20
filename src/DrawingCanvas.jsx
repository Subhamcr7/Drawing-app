import React, { useRef, useState, useEffect } from 'react';

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [color, setColor] = useState('black');
  const [lineWidth, setLineWidth] = useState(2);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [drawings, setDrawings] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [mode, setMode] = useState('draw'); // mode: 'draw', 'erase', 'text'
  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [brushType, setBrushType] = useState('round'); // brush type: 'round', 'square', etc.
  const [eraserSize, setEraserSize] = useState(10);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = lineWidth;
    ctx.lineCap = brushType;
    ctx.strokeStyle = color;
    setContext(ctx);
    clearCanvas();
  }, [lineWidth, color, canvasWidth, canvasHeight, backgroundColor, brushType]);

  
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    if (mode === 'text') {
      setTextPosition({ x: offsetX, y: offsetY });
      addText();
    } else {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };


  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    if (mode === 'erase') {
      context.clearRect(offsetX - eraserSize / 2, offsetY - eraserSize / 2, eraserSize, eraserSize);
    } else {
      context.lineTo(offsetX, offsetY);
      context.stroke();
    }
  };

 
  const stopDrawing = () => {
    context.closePath();
    setIsDrawing(false);
    saveDrawing();
  };

 
  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    const newDrawings = [...drawings.slice(0, currentIndex + 1), dataUrl];
    setDrawings(newDrawings);
    setCurrentIndex(newDrawings.length - 1);
  };


  const handleUndo = () => {
    if (currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = drawings[prevIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setCurrentIndex(prevIndex);
    };
  };

 
  const handleRedo = () => {
    if (currentIndex >= drawings.length - 1) return;
    const nextIndex = currentIndex + 1;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = drawings[nextIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setCurrentIndex(nextIndex);
    };
  };

 
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveDrawing();
  };

  
  const addText = () => {
    if (text) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.font = '20px Arial';
      ctx.fillStyle = color;
      ctx.fillText(text, textPosition.x, textPosition.y);
      saveDrawing();
    }
  };

 
  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveDrawing();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="controls">
        <label>Brush Color:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <label>Brush Size:</label>
        <input
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
        />
        <label>Brush Type:</label>
        <select onChange={(e) => setBrushType(e.target.value)}>
          <option value="round">Round</option>
          <option value="square">Square</option>
        </select>
        <label>Background Color:</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
        <label>Width:</label>
        <input
          type="number"
          value={canvasWidth}
          onChange={(e) => setCanvasWidth(e.target.value)}
        />
        <label>Height:</label>
        <input
          type="number"
          value={canvasHeight}
          onChange={(e) => setCanvasHeight(e.target.value)}
        />
        <label>Eraser Size:</label>
        <input
          type="range"
          min="5"
          max="100"
          value={eraserSize}
          onChange={(e) => setEraserSize(e.target.value)}
        />
        <button onClick={() => setMode('erase')}>Eraser</button>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
        <button onClick={() => setMode('text')}>Add Text</button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
        />
        <button onClick={clearCanvas}>Clear Canvas</button>
        <button onClick={saveImage}>Save Drawing</button>
        <input type="file" id="file-upload" onChange={handleImageUpload} />
        <label htmlFor="file-upload">Add Image</label>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ border: '1px solid #000' }}
      />
    </div>
  );
};

export default DrawingCanvas;