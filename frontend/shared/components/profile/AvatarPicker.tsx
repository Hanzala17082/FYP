'use client'

import { useRef, useState } from 'react'
import { Avatar, Button } from '@/shared/components/ui'
import { getErrorMessage } from '@/shared/utils/error-message'

interface AvatarPickerProps {
  avatarUrl?: string
  name: string
  uploading?: boolean
  onPick: (file: File) => void | Promise<void>
}

export function AvatarPicker({ avatarUrl, name, uploading = false, onPick }: AvatarPickerProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState('')

  const handleFile = async (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (!file) return
    setLocalError('')
    if (!file.type.startsWith('image/')) {
      setLocalError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Image must be 5 MB or smaller.')
      return
    }
    try {
      await onPick(file)
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err, 'Failed to upload avatar.'))
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs sm:max-w-sm mx-auto lg:mx-0">
      <Avatar src={avatarUrl} name={name} size="xl" />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files)
          e.target.value = ''
        }}
      />
      <div className="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="w-full sm:flex-1 sm:min-w-[8.5rem] justify-center"
          onClick={() => galleryInputRef.current?.click()}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">photo_library</span>
          <span className="truncate">{uploading ? 'Uploading…' : 'Choose from gallery'}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="w-full sm:flex-1 sm:min-w-[8.5rem] justify-center"
          onClick={() => cameraInputRef.current?.click()}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">photo_camera</span>
          <span className="truncate">Take photo</span>
        </Button>
      </div>
      {localError && (
        <p className="text-xs text-red-600 dark:text-red-400 text-center w-full px-1">{localError}</p>
      )}
    </div>
  )
}
