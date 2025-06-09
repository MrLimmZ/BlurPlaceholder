import React, { useRef, useEffect } from 'react';
import { decode } from 'blurhash';

interface BlurhashCanvasProps {
  blurhash: string;
  width?: number;
  height?: number;
}

const BlurhashCanvas: React.FC<BlurhashCanvasProps> = ({ blurhash, width = 400, height = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!blurhash) return;

    const pixels = decode(blurhash, width, height);
    const ctx = canvasRef.current?.getContext('2d');

    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }, [blurhash, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ borderRadius: 4, maxWidth: '100%' }} />;
};

export default BlurhashCanvas;
