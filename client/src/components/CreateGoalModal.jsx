import React, { useState } from 'react'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { DatePicker } from './ui/DatePicker'
import { addDays, toISODateString } from '../utils/dates'

const GOAL_TYPES = [
  { value: 'weight', label: 'Body Weight Target' },
  { value: 'workout_frequency', label: 'Weekly Workout Frequency' },
  { value: 'lift_target', label: 'Strength / Lift Target' },
  { value: 'daily_steps', label: 'Daily Step Count' },
  { value: 'water_intake', label: 'Daily Water Intake' },
]

export function CreateGoalModal({ isOpen, onClose, onCreateGoal }) {
  const [type, setType] = useState('weight')
  const [title, setTitle] = useState('Reach Target Bodyweight')
  const [targetValue, setTargetValue] = useState('75')
  const [currentValue, setCurrentValue] = useState('80')
  const [unit, setUnit] = useState('kg')
  const [targetDate, setTargetDate] = useState(() => toISODateString(addDays(new Date(), 60)))
  const [isLoading, setIsLoading] = useState(false)

  const handleTypeChange = (newType) => {
    setType(newType)
    if (newType === 'weight') {
      setTitle('Target Bodyweight')
      setUnit('kg')
      setTargetValue('75')
    } else if (newType === 'workout_frequency') {
      setTitle('Workouts per week')
      setUnit('days/week')
      setTargetValue('5')
      setCurrentValue('3')
    } else if (newType === 'lift_target') {
      setTitle('Bench Press 100kg')
      setUnit('kg')
      setTargetValue('100')
      setCurrentValue('85')
    } else if (newType === 'daily_steps') {
      setTitle('Daily 10,000 Steps')
      setUnit('steps')
      setTargetValue('10000')
      setCurrentValue('6000')
    } else if (newType === 'water_intake') {
      setTitle('Daily Hydration')
      setUnit('ml')
      setTargetValue('3000')
      setCurrentValue('2000')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !targetValue) return

    setIsLoading(true)
    try {
      await onCreateGoal({
        type,
        title: title.trim(),
        targetValue: Number(targetValue),
        currentValue: Number(currentValue) || 0,
        unit,
        targetDate,
      })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Fitness Goal"
      subtitle="Define a measurable milestone to track your progress"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Goal Category"
          options={GOAL_TYPES}
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
        />

        <Input
          label="Goal Title *"
          required
          placeholder="e.g. Bench Press 100kg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Current Value"
            type="number"
            step="0.1"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
          <Input
            label="Target Value *"
            type="number"
            step="0.1"
            required
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Measurement Unit"
            placeholder="kg, reps, ml, etc."
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <DatePicker
            label="Target Completion Date"
            value={targetDate}
            onChange={setTargetDate}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateGoalModal
