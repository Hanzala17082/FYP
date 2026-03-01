'use client'

import { useState } from 'react'
import { RoundedBox, Button, Input } from '../ui'
import { CreateTripRequestDTO } from '@/types/api/trips.types'
import { tripsService } from '@/services/trips.service'
import { useAuth } from '@/shared/contexts/AuthContext'

interface AddTripModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddTripModal({ isOpen, onClose, onSuccess }: AddTripModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateTripRequestDTO>>({
    title: '',
    description: '',
    shortDescription: '',
    destination: '',
    price: 0,
    duration: 1,
    images: [],
    availableDates: [],
    startDate: '',
    endDate: '',
    tags: [],
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.role !== 'Agency') return

    setIsSubmitting(true)
    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.shortDescription ||
        !formData.destination ||
        !formData.startDate ||
        !formData.endDate
      ) {
        alert('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      await tripsService.createTrip(formData as CreateTripRequestDTO)
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        destination: '',
        price: 0,
        duration: 1,
        images: [],
        availableDates: [],
        startDate: '',
        endDate: '',
        tags: [],
      })
    } catch (error) {
      console.error('Error creating trip:', error)
      alert('Failed to create trip. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof CreateTripRequestDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Trip</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Trip Title *
            </label>
            <Input
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Tech Conference 2024 - San Francisco"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Short Description *
            </label>
            <Input
              value={formData.shortDescription || ''}
              onChange={(e) => handleChange('shortDescription', e.target.value)}
              placeholder="Brief description (1-2 sentences)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Full Description *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the trip..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Destination *
              </label>
              <Input
                value={formData.destination || ''}
                onChange={(e) => handleChange('destination', e.target.value)}
                placeholder="e.g., San Francisco, CA"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Duration (Days) *
              </label>
              <Input
                type="number"
                value={formData.duration || 1}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || 1)}
                min={1}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                End Date *
              </label>
              <Input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Price (USD) *
            </label>
            <Input
              type="number"
              value={formData.price || 0}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              min={0}
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Tags (comma-separated)
            </label>
            <Input
              value={formData.tags?.join(', ') || ''}
              onChange={(e) =>
                handleChange(
                  'tags',
                  e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
                )
              }
              placeholder="e.g., Business, Conference, Networking"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Trip'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
