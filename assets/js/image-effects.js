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

/*function bayerDither(ctx, imageData, palette, blockSize, bias = 1) {
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
      Math.floor(((imageData.data[currentPixel] * bias ) + threshold) / 2),
      Math.floor(((imageData.data[currentPixel + 1] * bias ) + threshold) / 2),
      Math.floor(((imageData.data[currentPixel + 2] * bias ) + threshold) / 2),
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
*/

/*function bayerDither(ctx, imageData, palette, blockSize, bias) {
  const bayerThresholdMap = [
    [15, 135, 45, 165],
    [195, 75, 225, 105],
    [60, 180, 30, 150],
    [240, 120, 210, 90],
  ];
  
  // Explicitly map your two colors
  const colorDark = palette[1];  // [40, 40, 40]
  const colorLight = palette[0]; // [102, 255, 102]
  
  const imageDataLength = imageData.data.length;
  const width = imageData.width;

  for (let currentPixel = 0; currentPixel <= imageDataLength - 4; currentPixel += 4) {
    const x = (currentPixel / 4) % width;
    const y = Math.floor(currentPixel / 4 / width);
    const threshold = bayerThresholdMap[x % 4][y % 4];

    // 1. Calculate the pixel's true brightness (Luminance: 0 to 255)
    const r = imageData.data[currentPixel];
    const g = imageData.data[currentPixel + 1];
    const b = imageData.data[currentPixel + 2];
    let luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // 2. Dark Mode Bias (Crucial Step)
    // Multiply by a value less than 1.0. This pushes mid-tones into the shadows
    // without inverting the image. 
    // - 1.0 is standard balance.
    // - 0.7 or 0.8 is usually perfect for a sleek "dark mode".
    //const darkModeBias = 0.75; 
    luminance = luminance * bias;

    // 3. Direct threshold comparison (Much faster than getClosestColor)
    // If the adjusted pixel is brighter than the threshold, make it green.
    // Otherwise, make it dark grey.
    const finalColor = luminance > threshold ? colorLight : colorDark;

    imageData.data[currentPixel] = finalColor[0];
    imageData.data[currentPixel + 1] = finalColor[1];
    imageData.data[currentPixel + 2] = finalColor[2];
  }

  ctx.putImageData(imageData, 0, 0);

  if (blockSize > 1) {
    addPixelation(ctx, ctx.canvas, imageData.width, imageData.height, blockSize);
  }
}*/


function bayerDither(ctx, imageData, palette, blockSize, gamma = 1) {
  const bayerThresholdMap = [
    [15, 135, 45, 165],
    [195, 75, 225, 105],
    [60, 180, 30, 150],
    [240, 120, 210, 90],
  ];
  
  const colorDark = palette[1];  // [40, 40, 40]
  const colorLight = palette[0]; // [102, 255, 102]
  
  const imageDataLength = imageData.data.length;
  const width = imageData.width;

  // --- DARK MODE CONTROLS ---
  // 1. Gamma: Values > 1.0 crush midtones into darkness without dimming the brightest highlights.
  // Try 2.0, 2.5, or 3.0 for a stark dark mode.
  //const gamma = 2.5; 
  
  // 2. Black Point: Any luminance below this number (0-255) is forced to be pure background.
  // This clears up "noisy" dark areas.
  const blackPoint = 40; 

  for (let currentPixel = 0; currentPixel <= imageDataLength - 4; currentPixel += 4) {
    const x = (currentPixel / 4) % width;
    const y = Math.floor(currentPixel / 4 / width);
    const threshold = bayerThresholdMap[x % 4][y % 4];

    const r = imageData.data[currentPixel];
    const g = imageData.data[currentPixel + 1];
    const b = imageData.data[currentPixel + 2];
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Apply Black Point
    if (lum < blackPoint) {
      lum = 0; 
    } else {
      // Normalize to 0-1, apply the Gamma curve, and scale back up to 0-255
      lum = 255 * Math.pow(lum / 255, gamma);
    }

    const finalColor = lum > threshold ? colorLight : colorDark;

    imageData.data[currentPixel] = finalColor[0];
    imageData.data[currentPixel + 1] = finalColor[1];
    imageData.data[currentPixel + 2] = finalColor[2];
  }

  ctx.putImageData(imageData, 0, 0);

  if (blockSize > 1) {
    addPixelation(ctx, ctx.canvas, imageData.width, imageData.height, blockSize);
  }
}