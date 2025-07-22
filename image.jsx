import React, { useRef, useState, useCallback } from 'react';

const ImageCropper = () => {
  const [imageURL, setImageURL] = useState(null);         // Uploaded image URL
  const [cropBox, setCropBox] = useState(null);           // Crop area {x, y, width, height}
  const [isCropping, setIsCropping] = useState(false);    // Drag in progress
  const [croppedDataURL, setCroppedDataURL] = useState(); // Final cropped image preview

  const imageRef = useRef(null);                          // Ref to the uploaded <img>
  const containerRef = useRef(null);                      // Ref to drawing container
  const startPoint = useRef({ x: 0, y: 0 });              // Crop start point

  // Handle image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setCropBox(null);
    setCroppedDataURL(null);
  };

  // Start dragging crop
  const handleMouseDown = (e) => {
    if (!imageURL) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startPoint.current = { x, y };
    setIsCropping(true);
    setCropBox({ x, y, width: 0, height: 0 });
  };

  // Dragging crop box
  const handleMouseMove = (e) => {
    if (!isCropping) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - startPoint.current.x;
    const height = currentY - startPoint.current.y;

    setCropBox({
      x: startPoint.current.x,
      y: startPoint.current.y,
      width,
      height
    });
  };

  // Finish dragging
  const handleMouseUp = () => {
    setIsCropping(false);
  };

  // Apply the crop using canvas and generate preview
  const applyCrop = () => {
    if (!cropBox || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = Math.abs(cropBox.width);
    canvas.height = Math.abs(cropBox.height);
    const ctx = canvas.getContext('2d');

    const sx = cropBox.width < 0 ? cropBox.x + cropBox.width : cropBox.x;
    const sy = cropBox.height < 0 ? cropBox.y + cropBox.height : cropBox.y;

    ctx.drawImage(
      imageRef.current,
      sx,
      sy,
      Math.abs(cropBox.width),
      Math.abs(cropBox.height),
      0,
      0,
      Math.abs(cropBox.width),
      Math.abs(cropBox.height)
    );

    const dataURL = canvas.toDataURL('image/png');
    setCroppedDataURL(dataURL);
  };

  // Trigger browser download of cropped image
  const downloadCroppedImage = () => {
    if (!croppedDataURL) return;

    const link = document.createElement('a');
    link.href = croppedDataURL;
    link.download = 'cropped-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <h2>Image Crop & Download</h2>

      {/* Upload */}
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {/* Image + Crop Box */}
      {imageURL && (
        <div
          ref={containerRef}
          style={{ position: 'relative', display: 'inline-block', marginTop: 20 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageURL}
            alt="Uploaded"
            style={{ maxWidth: '100%' }}
          />

          {/* Crop Box Visual */}
          {cropBox && (
            <div
              style={{
                position: 'absolute',
                border: '2px dashed red',
                left: Math.min(cropBox.x, cropBox.x + cropBox.width),
                top: Math.min(cropBox.y, cropBox.y + cropBox.height),
                width: Math.abs(cropBox.width),
                height: Math.abs(cropBox.height),
                pointerEvents: 'none'
              }}
            />
          )}
        </div>
      )}

      {/* Action Buttons */}
      {cropBox && (
        <div style={{ marginTop: 20 }}>
          <button onClick={applyCrop}>Apply Crop</button>
        </div>
      )}

      {/* Preview and Download */}
      {croppedDataURL && (
        <div style={{ marginTop: 20 }}>
          <h4>Preview:</h4>
          <img src={croppedDataURL} alt="Cropped Preview" />
          <div>
            <button onClick={downloadCroppedImage} style={{ marginTop: 10 }}>
              Download Cropped Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
