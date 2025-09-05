import React, { useState } from "react";

export type ImageWidgetProps = {
  images: { url: string; alt?: string }[];
  title?: string;
  description?: string;
};

const ImageWidget: React.FC<ImageWidgetProps> = ({ images, title, description }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        style={{
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
          height: 180,
          cursor: 'pointer',
        }}
        onClick={() => setOpen(true)}
        title="Click to view images"
      >
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
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.55)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              minWidth: 220,
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#888',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {images.map((img, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                    {i === 0 ? '21 August 2025' : '21 July 2025'}
                  </div>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8, width: 'min(90vw, 320px)', maxWidth: '100%' }}>
                    {/* Top latitude label */}
                    <span style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: '#555', background: '#fff', padding: '0 4px' }}>
                      Lat: 26.85°N
                    </span>
                    {/* Left longitude label */}
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      left: -18,
                      transform: 'translateY(-50%) rotate(-90deg)',
                      transformOrigin: 'left center',
                      fontSize: 12,
                      color: '#555',
                      background: '#fff',
                      padding: '0 4px',
                      whiteSpace: 'nowrap',
                    }}>
                      Lon: 80.95°E
                    </span>
                    {/* Right longitude label */}
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      right: -18,
                      transform: 'translateY(-50%) rotate(90deg)',
                      transformOrigin: 'right center',
                      fontSize: 12,
                      color: '#555',
                      background: '#fff',
                      padding: '0 4px',
                      whiteSpace: 'nowrap',
                    }}>
                      Lon: 81.05°E
                    </span>
                    {/* Bottom latitude label */}
                    <span style={{ position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: '#555', background: '#fff', padding: '0 4px' }}>
                      Lat: 26.75°N
                    </span>
                    <img
                      src={img.url}
                      alt={img.alt || `Popup Image ${i+1}`}
                      style={{
                        width: '100%',
                        maxWidth: 320,
                        maxHeight: '55vh',
                        borderRadius: 10,
                        objectFit: 'contain',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                        border: '2px solid #fff',
                        background: '#eee',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageWidget;
