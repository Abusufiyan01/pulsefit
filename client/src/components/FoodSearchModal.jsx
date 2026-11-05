import React, { useState, useEffect } from 'react'
import { Search, Plus, Apple, Zap, Sparkles } from 'lucide-react'
import { Modal } from './ui/Modal'
import { SearchInput } from './ui/SearchInput'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { Tabs } from './ui/Tabs'
import nutritionService from '../services/nutritionService'

const DEFAULT_FOODS = [
  { _id: 'f_1', name: 'Chicken Breast (Cooked)', brand: 'Generic', servingSize: 100, servingUnit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { _id: 'f_2', name: 'Brown Basmati Rice (Cooked)', brand: 'Generic', servingSize: 100, servingUnit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 1 },
  { _id: 'f_3', name: 'Whole Eggs (Boiled)', brand: 'Generic', servingSize: 1, servingUnit: 'large egg', calories: 74, protein: 6.3, carbs: 0.4, fat: 5 },
  { _id: 'f_4', name: 'Egg Whites', brand: 'Generic', servingSize: 100, servingUnit: 'ml', calories: 52, protein: 11, carbs: 0.7, fat: 0.2 },
  { _id: 'f_5', name: 'Rolled Oats (Dry)', brand: 'Generic', servingSize: 50, servingUnit: 'g', calories: 190, protein: 6.5, carbs: 34, fat: 3 },
  { _id: 'f_6', name: 'Whey Protein Isolate', brand: 'Gold Standard', servingSize: 30, servingUnit: 'scoop', calories: 120, protein: 24, carbs: 3, fat: 1 },
  { _id: 'f_7', name: 'Greek Yogurt (0% Fat)', brand: 'Generic', servingSize: 150, servingUnit: 'g', calories: 90, protein: 15, carbs: 6, fat: 0 },
  { _id: 'f_8', name: 'Peanut Butter', brand: 'Generic', servingSize: 32, servingUnit: 'tbsp (2)', calories: 188, protein: 8, carbs: 7, fat: 16 },
  { _id: 'f_9', name: 'Paneer (Cottage Cheese)', brand: 'Generic Indian', servingSize: 100, servingUnit: 'g', calories: 265, protein: 18, carbs: 3, fat: 20 },
  { _id: 'f_10', name: 'Roti / Chapati (Whole Wheat)', brand: 'Generic Indian', servingSize: 1, servingUnit: 'piece', calories: 104, protein: 3.5, carbs: 20, fat: 1.2 },
  { _id: 'f_11', name: 'Moong Dal (Cooked)', brand: 'Generic Indian', servingSize: 100, servingUnit: 'g', calories: 105, protein: 7, carbs: 19, fat: 0.4 },
  { _id: 'f_12', name: 'Banana', brand: 'Generic', servingSize: 1, servingUnit: 'medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
]

export function FoodSearchModal({ isOpen, onClose, mealType = 'breakfast', onAddFood }) {
  const [activeTab, setActiveTab] = useState('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(DEFAULT_FOODS)
  const [selectedFood, setSelectedFood] = useState(null)
  const [servings, setServings] = useState(1)

  // Quick Add state
  const [quickCalories, setQuickCalories] = useState('')
  const [quickProtein, setQuickProtein] = useState('')
  const [quickCarbs, setQuickCarbs] = useState('')
  const [quickFat, setQuickFat] = useState('')
  const [quickName, setQuickName] = useState('')

  // Custom Food state
  const [customName, setCustomName] = useState('')
  const [customCalories, setCustomCalories] = useState('')
  const [customProtein, setCustomProtein] = useState('')
  const [customCarbs, setCustomCarbs] = useState('')
  const [customFat, setCustomFat] = useState('')
  const [customServingUnit, setCustomServingUnit] = useState('g')

  useEffect(() => {
    if (!isOpen) return
    setSelectedFood(null)
    setServings(1)
  }, [isOpen])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(DEFAULT_FOODS)
      return
    }

    const searchApi = async () => {
      try {
        const res = await nutritionService.searchFoods(searchQuery)
        const items = res.data?.foods || res.data?.data || res.data
        if (Array.isArray(items) && items.length > 0) {
          setSearchResults(items)
        } else {
          // Filter default
          setSearchResults(
            DEFAULT_FOODS.filter((f) =>
              f.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        }
      } catch (e) {
        setSearchResults(
          DEFAULT_FOODS.filter((f) =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      }
    }

    searchApi()
  }, [searchQuery])

  const handleSelectFood = (food) => {
    setSelectedFood(food)
  }

  const handleConfirmAddFood = () => {
    if (!selectedFood) return
    const mult = Number(servings) || 1
    onAddFood({
      foodId: selectedFood._id || selectedFood.id,
      name: selectedFood.name,
      mealType,
      servings: mult,
      servingSize: selectedFood.servingSize || 100,
      servingUnit: selectedFood.servingUnit || 'g',
      calories: Math.round(selectedFood.calories * mult),
      protein: Math.round(selectedFood.protein * mult),
      carbs: Math.round(selectedFood.carbs * mult),
      fat: Math.round(selectedFood.fat * mult),
    })
    onClose()
  }

  const handleAddQuickCalories = (e) => {
    e.preventDefault()
    const cals = Number(quickCalories) || 0
    if (!cals) return

    onAddFood({
      name: quickName.trim() || 'Quick Calories',
      mealType,
      servings: 1,
      calories: cals,
      protein: Number(quickProtein) || 0,
      carbs: Number(quickCarbs) || 0,
      fat: Number(quickFat) || 0,
    })
    onClose()
  }

  const handleAddCustomFood = (e) => {
    e.preventDefault()
    if (!customName.trim() || !customCalories) return

    onAddFood({
      name: customName.trim(),
      mealType,
      servings: 1,
      servingSize: 1,
      servingUnit: customServingUnit,
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
    })
    onClose()
  }

  const tabs = [
    { id: 'search', label: 'Search Foods', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'quick', label: 'Quick Calories', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'custom', label: 'Custom Food', icon: <Plus className="w-3.5 h-3.5" /> },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Food for ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
      subtitle="Search database or enter quick macros"
      maxWidth="max-w-xl"
    >
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />

      {activeTab === 'search' && (
        <div className="space-y-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search chicken, oats, rice, eggs..."
            autoFocus
          />

          {selectedFood ? (
            <div className="p-4 rounded-xl border border-primary-500/30 bg-primary-500/5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-current">{selectedFood.name}</h4>
                  <p className="text-xs text-muted">
                    Base: {selectedFood.servingSize} {selectedFood.servingUnit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="text-xs text-primary-500 hover:underline font-semibold"
                >
                  Change
                </button>
              </div>

              {/* Servings input */}
              <div className="flex items-center gap-3">
                <div className="w-32">
                  <Input
                    label="Number of servings"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                  />
                </div>
                <div className="flex-1 text-xs text-muted pt-4">
                  Total: {Math.round(selectedFood.servingSize * (Number(servings) || 1))}{' '}
                  {selectedFood.servingUnit}
                </div>
              </div>

              {/* Calculated Totals */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                <div className="p-2 rounded-lg bg-surface border border-border">
                  <span className="block text-xs font-bold text-current">
                    {Math.round(selectedFood.calories * (Number(servings) || 1))}
                  </span>
                  <span className="text-[10px] text-muted">Calories</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-border">
                  <span className="block text-xs font-bold text-current">
                    {Math.round(selectedFood.protein * (Number(servings) || 1))}g
                  </span>
                  <span className="text-[10px] text-muted">Protein</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-border">
                  <span className="block text-xs font-bold text-current">
                    {Math.round(selectedFood.carbs * (Number(servings) || 1))}g
                  </span>
                  <span className="text-[10px] text-muted">Carbs</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-border">
                  <span className="block text-xs font-bold text-current">
                    {Math.round(selectedFood.fat * (Number(servings) || 1))}g
                  </span>
                  <span className="text-[10px] text-muted">Fat</span>
                </div>
              </div>

              <Button onClick={handleConfirmAddFood} fullWidth className="mt-2">
                Add to {mealType}
              </Button>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {searchResults.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted">
                  No foods found matching "{searchQuery}". Try adding a Custom Food!
                </div>
              ) : (
                searchResults.map((food) => {
                  const id = food._id || food.id
                  return (
                    <div
                      key={id}
                      onClick={() => handleSelectFood(food)}
                      className="p-3 rounded-xl bg-surface/40 border border-border hover:border-primary-500/40 hover:bg-surface transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-current">{food.name}</h4>
                        <p className="text-xs text-muted">
                          {food.calories} kcal • {food.servingSize} {food.servingUnit}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span>P: {food.protein}g</span>
                        <span>C: {food.carbs}g</span>
                        <span>F: {food.fat}g</span>
                        <Plus className="w-4 h-4 text-primary-500 ml-1" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quick' && (
        <form onSubmit={handleAddQuickCalories} className="space-y-4">
          <Input
            label="Description (optional)"
            placeholder="e.g. Protein bar, Snack"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
          />

          <Input
            label="Calories *"
            type="number"
            step="1"
            min="0"
            required
            placeholder="e.g. 350"
            value={quickCalories}
            onChange={(e) => setQuickCalories(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Protein (g)"
              type="number"
              step="0.5"
              placeholder="0"
              value={quickProtein}
              onChange={(e) => setQuickProtein(e.target.value)}
            />
            <Input
              label="Carbs (g)"
              type="number"
              step="0.5"
              placeholder="0"
              value={quickCarbs}
              onChange={(e) => setQuickCarbs(e.target.value)}
            />
            <Input
              label="Fat (g)"
              type="number"
              step="0.5"
              placeholder="0"
              value={quickFat}
              onChange={(e) => setQuickFat(e.target.value)}
            />
          </div>

          <Button type="submit" fullWidth>
            Log Quick Calories
          </Button>
        </form>
      )}

      {activeTab === 'custom' && (
        <form onSubmit={handleAddCustomFood} className="space-y-3">
          <Input
            label="Food Name *"
            required
            placeholder="e.g. Homemade Protein Pancake"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Serving Unit"
              placeholder="e.g. 1 plate, 100g, 1 bowl"
              value={customServingUnit}
              onChange={(e) => setCustomServingUnit(e.target.value)}
            />
            <Input
              label="Calories *"
              type="number"
              required
              placeholder="e.g. 400"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Protein (g)"
              type="number"
              placeholder="0"
              value={customProtein}
              onChange={(e) => setCustomProtein(e.target.value)}
            />
            <Input
              label="Carbs (g)"
              type="number"
              placeholder="0"
              value={customCarbs}
              onChange={(e) => setCustomCarbs(e.target.value)}
            />
            <Input
              label="Fat (g)"
              type="number"
              placeholder="0"
              value={customFat}
              onChange={(e) => setCustomFat(e.target.value)}
            />
          </div>

          <Button type="submit" fullWidth className="mt-2">
            Save & Log Custom Food
          </Button>
        </form>
      )}
    </Modal>
  )
}

export default FoodSearchModal
