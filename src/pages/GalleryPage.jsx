import React from 'react';

const galleryPhotos = [
  { id: 1, img: "/factory/1000197409.jpg", title: "Manufacturing Facility" },
  { id: 2, img: "/factory/1000197411.jpg", title: "Production Line" },
  { id: 3, img: "/factory/1000197412.jpg", title: "Warehouse & Logistics" },
  { id: 4, img: "/factory/factory4.png", title: "Packaging Division" },
  { id: 5, img: "/factory/factory5.png", title: "Quality Inspection" }
];

export default function GalleryPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Infrastructure Gallery</h1>
          <div className="w-24 h-1 bg-amber-700 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take a look inside our state-of-the-art manufacturing facilities, production lines, and warehousing capabilities.
          </p>
        </div>

        {/* Vertical Gallery */}
        <div className="flex flex-col gap-12">
          {galleryPhotos.map((photo) => (
            <div key={photo.id} className="w-full flex flex-col group">
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-100">
                <img 
                  src={photo.img} 
                  alt={photo.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  onError={(e) => {
                    // Fallback to placeholder if the image path doesn't exist locally
                    e.target.src = "https://images.unsplash.com/photo-1580982327559-c1202864eb05?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-4 text-center">
                {photo.title}
              </h3>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
