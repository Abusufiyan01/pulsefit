import React, { useState } from 'react'
import { Plus, Trash2, Dumbbell } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { ExercisePicker } from './ExercisePicker'

export function CreateRoutineModal({ isOpen, onClose, onSaveRoutine }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [estimatedDuration, setEstimatedDuration] = useState(45)
  const [exercises, setExercises] = useState([])
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddExercise = (exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        exercise: exercise._id || exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        defaultSets: [
          { setNumber: 1, weight: 20, reps: 10, rpe: 8 },
          { setNumber: 2, weight: 20, reps: 10, rpe: 8 },
          { setNumber: 3, weight: 20, reps: 10, rpe: 8 },
        ],
      },
    ])
  }

  const handleRemoveExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleAddSet = (exIdx) => {
    setExercises((prev) => {
      const copy = [...prev]
      const target = copy[exIdx]
      const sets = [...target.defaultSets]
      const lastSet = sets[sets.length - 1]
      sets.push({
        setNumber: sets.length + 1,
        weight: lastSet ? lastSet.weight : 20,
        reps: lastSet ? lastSet.reps : 10,
        rpe: lastSet ? lastSet.rpe : 8,
      })
      copy[exIdx] = { ...target, defaultSets: sets }
      return copy
    })
  }

  const handleRemoveSet = (exIdx, setIdx) => {
    setExercises((prev) => {
      const copy = [...prev]
      const target = copy[exIdx]
      const sets = target.defaultSets
        .filter((_, s) => s !== setIdx)
        .map((s, i) => ({ ...s, setNumber: i + 1 }))
      copy[exIdx] = { ...target, defaultSets: sets }
      return copy
    })
  }

  const handleSetChange = (exIdx, setIdx, field, val) => {
    setExercises((prev) => {
      const copy = [...prev]
      const target = copy[exIdx]
      const sets = [...target.defaultSets]
      sets[setIdx] = { ...sets[setIdx], [field]: Number(val) }
      copy[exIdx] = { ...target, defaultSets: sets }
      return copy
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSaving(true)
    try {
      await onSaveRoutine({
        name: name.trim(),
        description: description.trim(),
        difficulty,
        estimatedDuration: Number(estimatedDuration) || 45,
        exercises,
      })
      onClose()
      setName('')
      setDescription('')
      setExercises([])
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create Custom Routine"
        subtitle="Build and organize a reusable workout routine template"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Routine Name *"
            required
            placeholder="e.g. Upper Body Hypertrophy"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Description"
            placeholder="Brief description of the focus or target split"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ]}
            />

            <Input
              label="Est. Duration (mins)"
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            />
          </div>

          {/* Exercise list builder */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-current/80">
                Routine Exercises ({exercises.length})
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsPickerOpen(true)}
              >
                Add Exercise
              </Button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {exercises.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted border border-dashed border-border rounded-xl">
                  No exercises added yet. Click "Add Exercise" to select from the library.
                </div>
              ) : (
                exercises.map((item, exIdx) => (
                  <div
                    key={exIdx}
                    className="p-3 bg-surface/40 border border-border rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-current">
                        {exIdx + 1}. {item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exIdx)}
                        className="text-muted hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sets rows */}
                    <div className="space-y-1.5 pt-1">
                      {item.defaultSets.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-xs">
                          <span className="text-muted font-bold w-12">Set {s.setNumber}</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.5"
                              value={s.weight}
                              onChange={(e) =>
                                handleSetChange(exIdx, sIdx, 'weight', e.target.value)
                              }
                              className="w-16 px-2 py-1 bg-surface border border-border rounded-md text-center text-xs font-semibold text-current"
                            />
                            <span className="text-muted text-[10px]">kg</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={s.reps}
                              onChange={(e) =>
                                handleSetChange(exIdx, sIdx, 'reps', e.target.value)
                              }
                              className="w-16 px-2 py-1 bg-surface border border-border rounded-md text-center text-xs font-semibold text-current"
                            />
                            <span className="text-muted text-[10px]">reps</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exIdx, sIdx)}
                            className="text-muted hover:text-red-500 text-xs p-1 ml-auto"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="text-xs text-primary-500 hover:underline font-semibold pt-1 block"
                    >
                      + Add Set
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={exercises.length === 0}>
              Save Routine
            </Button>
          </div>
        </form>
      </Modal>

      <ExercisePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectExercise={handleAddExercise}
      />
    </>
  )
}

export default CreateRoutineModal
