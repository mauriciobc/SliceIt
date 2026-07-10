import '@testing-library/jest-dom/vitest';

HTMLCanvasElement.prototype.getContext = function () {
  const measureText = (text: string) => ({ width: text.length * 8 });
  return {
    font: '',
    measureText,
    canvas: document.createElement('canvas'),
    fillRect: () => {},
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    fillText: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    setTransform: () => {},
    drawImage: () => {},
    createImageData: (w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
    }),
    getImageData: (_x: number, _y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
    }),
    putImageData: () => {},
  };
} as unknown as typeof HTMLCanvasElement.prototype.getContext;
