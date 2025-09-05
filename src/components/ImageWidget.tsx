import React from "react";

export type ImageWidgetProps = {
  images: { url: string; alt?: string }[];
  title?: string;
  description?: string;
};

const ImageWidget: React.FC<ImageWidgetProps> = ({ images, title, description }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      padding: 16,
      marginBottom: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: 120,
      maxWidth: 220,
      height: 180
    }}>
      {title && <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{title}</div>}
        {description && <div style={{ fontSize: 13, color: '#888' }}>{description}</div>}
      <div style={{ position: 'relative', width: '100%', height: 100, marginBottom: 8 }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={img.alt || `Widget Image ${i+1}`}
            style={{
              width: '80%',
              height: 80,
              borderRadius: 8,
              objectFit: 'cover',
              position: 'absolute',
              left: i * 24,
              top: i * 12,
              zIndex: images.length - i,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              border: '2px solid #fff',
              background: '#eee',
              transition: 'box-shadow 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageWidget;
