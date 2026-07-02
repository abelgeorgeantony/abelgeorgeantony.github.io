function getClosestColor(colors, [r2, g2, b2]) {
  let minDist = Infinity;
  let closest = colors[0];

  for (let i = 0; i < colors.length; i++) {
    const [, r1, g1, b1] = colors[i];
    const dist = (r2 - r1) ** 2 + (b2 - b1) ** 2 + (g2 - g1) ** 2;

    if (dist < minDist) {
      minDist = dist;
      closest = colors[i];
    }
  }

  return closest;
}

function addPixelation(ctx, sourceCanvas, width, height, blockSize) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = width / blockSize;
  tempCanvas.height = height / blockSize;

  tempCtx.msImageSmoothingEnabled = false;
  tempCtx.mozImageSmoothingEnabled = false;
  tempCtx.webkitImageSmoothingEnabled = false;
  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(sourceCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

  ctx.msImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    tempCanvas,
    0,
    0,
    tempCanvas.width,
    tempCanvas.height,
    0,
    0,
    width,
    height,
  );
}

function bayerDither(ctx, imageData, palette, blockSize) {
  const bayerThresholdMap = [
    [15, 135, 45, 165],
    [195, 75, 225, 105],
    [60, 180, 30, 150],
    [240, 120, 210, 90],
  ];
  const newPalette = palette.map((color, id) => [id].concat(color));
  const imageDataLength = imageData.data.length;
  const width = imageData.width;

  for (let currentPixel = 0; currentPixel <= imageDataLength - 4; currentPixel += 4) {
    const x = (currentPixel / 4) % width;
    const y = Math.floor(currentPixel / 4 / width);
    const threshold = bayerThresholdMap[x % 4][y % 4];
    const closestColor = getClosestColor(newPalette, [
      Math.floor((imageData.data[currentPixel] + threshold) / 2),
      Math.floor((imageData.data[currentPixel + 1] + threshold) / 2),
      Math.floor((imageData.data[currentPixel + 2] + threshold) / 2),
    ]);

    imageData.data[currentPixel] = closestColor[1];
    imageData.data[currentPixel + 1] = closestColor[2];
    imageData.data[currentPixel + 2] = closestColor[3];
  }

  ctx.putImageData(imageData, 0, 0);

  if (blockSize > 1) {
    addPixelation(ctx, ctx.canvas, imageData.width, imageData.height, blockSize);
  }
}

function quantizeImages() {
  const images = document.querySelectorAll("img:not(.icon)");

  images.forEach((img) => {
    img.style.width = "";
    img.style.height = "";

    const rect = img.getBoundingClientRect();
    const snappedWidth = Math.ceil(rect.width / cellW) * cellW;
    const snappedHeight = Math.ceil(rect.height / cellH) * cellH;

    img.style.width = `${snappedWidth}px`;
    img.style.height = `${snappedHeight}px`;
    img.style.objectFit = "cover";
    img.style.display = "block";
  });
}
