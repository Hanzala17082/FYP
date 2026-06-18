'use client'

import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { RoundedBox } from '../ui/RoundedBox'

interface TripImageGalleryProps {
  images: string[]
  agencyImages?: string[]
  onAddImage?: (file: File) => void
  canAddImages?: boolean
}

export function TripImageGallery({
  images,
  agencyImages = [],
  onAddImage,
  canAddImages = false,
}: TripImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const allImages = [...images, ...agencyImages]

  const handleImageClick = (image: string) => {
    setSelectedImage(image)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onAddImage) {
      setIsUploading(true)
      try {
        await onAddImage(file)
      } finally {
        setIsUploading(false)
        e.target.value = '' // Reset input
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trip Gallery</h3>
        {canAddImages && (
          <label className="flex items-center gap-2 px-4 py-2 rounded-none bg-primary text-white font-semibold text-sm hover:bg-blue-600 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>Add Photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {allImages.length === 0 ? (
        <RoundedBox padding="lg" className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-2">
            photo_library
          </span>
          <p className="text-slate-500 dark:text-slate-400">No images yet</p>
          {canAddImages && (
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Click "Add Photos" to upload trip images
            </p>
          )}
        </RoundedBox>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-none overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image}
                alt={`Trip image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Image Viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-none text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full h-full object-contain rounded-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
