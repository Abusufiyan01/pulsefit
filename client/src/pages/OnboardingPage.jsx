import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  User,
  ArrowRight,
  ArrowLeft,
  Flame,
  Scale,
  Sparkles,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateDailyCalorieTarget,
  calculateMacros,
  kgToLbs,
  lbsToKg,
  cmToInches,
  inchesToCm,
} from '../utils/fitness'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [unitPreference, setUnitPreference] = useState(user?.unitPreference || 'metric')
  const [name, setName] = useState(user?.name || '')
  const [age, setAge] = useState(user?.age || 26)
  const [gender, setGender] = useState(user?.gender || 'male')
  const [height, setHeight] = useState(
    user?.height ? (unitPreference === 'imperial' ? cmToInches(user.height) : user.height) : 175
  )
  const [weight, setWeight] = useState(
    user?.weight ? (unitPreference === 'imperial' ? kgToLbs(user.weight) : user.weight) : 72
  )

  const [goal, setGoal] = useState(user?.goal || 'build_muscle')
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'intermediate')
  const [workoutDays, setWorkoutDays] = useState(user?.workoutDaysPerWeek || 4)
  const [equipment, setEquipment] = useState(
    user?.availableEquipment && user.availableEquipment.length > 0
      ? user.availableEquipment
      : ['barbell', 'dumbbell', 'bodyweight']
  )

  // Custom calories override in Step 4
  const [customCalories, setCustomCalories] = useState(null)

  // Convert height and weight when unit preference changes
  const handleUnitToggle = (newUnit) => {
    if (newUnit === unitPreference) return
    if (newUnit === 'imperial') {
      // Metric to Imperial
      setWeight((prev) => kgToLbs(Number(prev)))
      setHeight((prev) => cmToInches(Number(prev)))
    } else {
      // Imperial to Metric
      setWeight((prev) => lbsToKg(Number(prev)))
      setHeight((prev) => inchesToCm(Number(prev)))
    }
    setUnitPreference(newUnit)
  }

  // Calculate normalized metric values for calculations
  const weightKg = useMemo(() => {
    const val = Number(weight) || 70
    return unitPreference === 'imperial' ? lbsToKg(val) : val
  }, [weight, unitPreference])

  const heightCm = useMemo(() => {
    const val = Number(height) || 175
    return unitPreference === 'imperial' ? inchesToCm(val) : val
  }, [height, unitPreference])

  // Fitness calculations
  const bmi = useMemo(() => calculateBMI(weightKg, heightCm), [weightKg, heightCm])
  const bmiCategory = useMemo(() => getBMICategory(bmi), [bmi])
  const bmr = useMemo(() => calculateBMR(weightKg, heightCm, Number(age), gender), [
    weightKg,
    heightCm,
    age,
    gender,
  ])
  const tdee = useMemo(() => calculateTDEE(bmr, Number(workoutDays)), [bmr, workoutDays])
  const autoCalories = useMemo(() => calculateDailyCalorieTarget(tdee, goal), [tdee, goal])

  // Active calorie target (custom or auto)
  const targetCalories = customCalories !== null ? customCalories : autoCalories

  // Calculated macros based on active calorie target
  const macros = useMemo(() => calculateMacros(targetCalories, weightKg), [targetCalories, weightKg])

  // Macro percentages for visual distribution bar
  const macroBreakdown = useMemo(() => {
    const proteinCal = macros.protein * 4
    const carbsCal = macros.carbs * 4
    const fatCal = macros.fat * 9
    const totalCal = proteinCal + carbsCal + fatCal || targetCalories
    return {
      proteinPct: Math.round((proteinCal / totalCal) * 100),
      carbsPct: Math.round((carbsCal / totalCal) * 100),
      fatPct: Math.max(0, 100 - Math.round((proteinCal / totalCal) * 100) - Math.round((carbsCal / totalCal) * 100)),
    }
  }, [macros, targetCalories])

  // Goal options
  const goals = [
    {
      id: 'lose_fat',
      emoji: '🔥',
      title: 'Lose Fat',
      desc: 'Burn calories and shed body fat while preserving lean muscle mass.',
    },
    {
      id: 'build_muscle',
      emoji: '💪',
      title: 'Build Muscle',
      desc: 'Hypertrophy-focused training to maximize strength and muscle growth.',
    },
    {
      id: 'maintain',
      emoji: '⚖️',
      title: 'Maintain Weight',
      desc: 'Stay at current weight while toning up, optimizing energy and health.',
    },
    {
      id: 'improve_endurance',
      emoji: '🏃',
      title: 'Improve Endurance',
      desc: 'Boost cardiovascular capacity, athletic agility and stamina.',
    },
  ]

  // Experience level options
  const experienceLevels = [
    { id: 'beginner', label: 'Beginner', desc: '< 1 year training' },
    { id: 'intermediate', label: 'Intermediate', desc: '1 - 3 years training' },
    { id: 'advanced', label: 'Advanced', desc: '3+ years training' },
  ]

  // Equipment options
  const equipmentOptions = [
    { id: 'barbell', name: 'Barbell & Plates', icon: '🏋️‍♂️' },
    { id: 'dumbbell', name: 'Dumbbells', icon: '💪' },
    { id: 'machine_cables', name: 'Machine & Cables', icon: '🏗️' },
    { id: 'bodyweight', name: 'Bodyweight Only', icon: '🧘' },
    { id: 'resistance_bands', name: 'Resistance Bands', icon: '🎗️' },
    { id: 'kettlebells', name: 'Kettlebells', icon: '🔔' },
  ]

  const toggleEquipment = (id) => {
    setEquipment((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          toast.error('Please select at least one equipment option')
          return prev
        }
        return prev.filter((item) => item !== id)
      }
      return [...prev, id]
    })
  }

  // Step validation
  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!name.trim()) {
        toast.error('Please enter your name')
        return false
      }
      if (!age || age < 14 || age > 100) {
        toast.error('Please enter a valid age between 14 and 100')
        return false
      }
      if (!height || height <= 0) {
        toast.error('Please enter your height')
        return false
      }
      if (!weight || weight <= 0) {
        toast.error('Please enter your weight')
        return false
      }
    }
    if (currentStep === 2) {
      if (!goal) {
        toast.error('Please select a primary fitness goal')
        return false
      }
      if (!experienceLevel) {
        toast.error('Please select your experience level')
        return false
      }
    }
    if (currentStep === 3) {
      if (equipment.length === 0) {
        toast.error('Please select at least one equipment option')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4))
    }
  }

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  // Final submission on Step 4
  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        age: Number(age),
        gender,
        unitPreference,
        height: Math.round(heightCm),
        weight: Math.round(weightKg * 10) / 10,
        goal,
        experienceLevel,
        workoutDaysPerWeek: Number(workoutDays),
        availableEquipment: equipment,
        dailyCalorieTarget: Number(targetCalories),
        isOnboardingComplete: true,
      }

      const res = await api.put('/users/profile', payload)
      const updatedUser = res.data?.data || res.data?.user || payload

      // Update Zustand auth store
      updateUser({ ...payload, ...updatedUser, isOnboardingComplete: true })

      toast.success('Your profile is set up! Welcome to PulseFit 🚀')
      navigate('/app/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to complete onboarding'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col justify-between" style={{ background: 'var(--color-bg)' }}>
      {/* Top Header */}
      <div className="max-w-3xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-display font-black text-xl gradient-text">PulseFit</span>
          </div>
          <div className="text-sm font-semibold text-muted">
            Step <span className="text-primary-500 font-bold">{step}</span> of 4
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>

        {/* Step labels */}
        <div className="grid grid-cols-4 mt-3 text-center text-xs font-semibold">
          {[
            { num: 1, label: 'Personal Info' },
            { num: 2, label: 'Your Goal' },
            { num: 3, label: 'Schedule' },
            { num: 4, label: 'Your Plan' },
          ].map((item) => (
            <div
              key={item.num}
              className={`transition-colors ${
                step >= item.num ? 'text-primary-500' : 'text-muted'
              }`}
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.num}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Multi-Step Form */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 rounded-3xl"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black font-display mb-1">Tell us about yourself</h2>
                  <p className="text-sm text-muted">We use these to calculate your metabolic targets accurately</p>
                </div>

                {/* Unit Switcher */}
                <div
                  className="flex items-center p-1 rounded-xl"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('metric')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      unitPreference === 'metric' ? 'bg-primary-500 text-white shadow-sm' : 'text-muted hover:text-current'
                    }`}
                  >
                    Metric (kg/cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('imperial')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      unitPreference === 'imperial' ? 'bg-primary-500 text-white shadow-sm' : 'text-muted hover:text-current'
                    }`}
                  >
                    Imperial (lbs/in)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold mb-1">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="input pl-10"
                    />
                  </div>
                </div>

                {/* Gender selector */}
                <div>
                  <label className="block text-sm font-semibold mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'male', label: 'Male', emoji: '👨' },
                      { id: 'female', label: 'Female', emoji: '👩' },
                      { id: 'other', label: 'Other', emoji: '🧑' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGender(g.id)}
                        className={`p-3 rounded-2xl font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                          gender === g.id
                            ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-sm'
                            : 'border-border hover:border-primary-500/40 text-muted'
                        }`}
                        style={{ background: gender === g.id ? 'rgba(255,90,31,0.1)' : 'var(--color-surface)' }}
                      >
                        <span className="text-lg">{g.emoji}</span>
                        <span className="text-sm">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age, Height, Weight Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Age (years)</label>
                    <input
                      type="number"
                      min="14"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="26"
                      className="input"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Height ({unitPreference === 'metric' ? 'cm' : 'inches'})
                    </label>
                    <input
                      type="number"
                      step={unitPreference === 'imperial' ? '0.1' : '1'}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder={unitPreference === 'metric' ? '175' : '69'}
                      className="input"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Weight ({unitPreference === 'metric' ? 'kg' : 'lbs'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={unitPreference === 'metric' ? '72' : '158'}
                      className="input"
                    />
                  </div>
                </div>

                {/* Live BMI Preview Pill */}
                {bmi > 0 && (
                  <div
                    className="p-3.5 rounded-2xl flex items-center justify-between text-xs mt-3"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-primary-500" />
                      <span className="font-semibold text-muted">Estimated BMI:</span>
                      <span className="font-black text-sm">{bmi}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${bmiCategory.color} bg-black/20`}>
                      {bmiCategory.label}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Goal & Experience */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 rounded-3xl"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-black font-display mb-1">What is your primary goal?</h2>
                <p className="text-sm text-muted">We will tailor your workouts, calorie targets and macros to match</p>
              </div>

              {/* Goal Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGoal(g.id)
                      setCustomCalories(null) // reset custom calories to recalculate
                    }}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative ${
                      goal === g.id
                        ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                        : 'border-border hover:border-primary-500/40'
                    }`}
                    style={{ background: goal === g.id ? 'rgba(255,90,31,0.08)' : 'var(--color-surface)' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{g.emoji}</span>
                      {goal === g.id && (
                        <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-base mb-1">{g.title}</div>
                    <p className="text-xs text-muted leading-relaxed">{g.desc}</p>
                  </button>
                ))}
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-semibold mb-2">Experience Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {experienceLevels.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id)}
                      className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                        experienceLevel === lvl.id
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-bold'
                          : 'border-border hover:border-primary-500/40 text-muted'
                      }`}
                      style={{ background: experienceLevel === lvl.id ? 'rgba(255,90,31,0.1)' : 'var(--color-surface)' }}
                    >
                      <div className="text-sm font-bold text-current">{lvl.label}</div>
                      <div className="text-[11px] text-muted mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Schedule & Equipment */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 rounded-3xl"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-black font-display mb-1">Schedule & Equipment</h2>
                <p className="text-sm text-muted">Customize your training volume and gear availability</p>
              </div>

              {/* Days Per Week Picker */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">Workout Days Per Week</label>
                  <span className="text-sm font-black text-primary-500">{workoutDays} days / week</span>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setWorkoutDays(num)
                        setCustomCalories(null)
                      }}
                      className={`h-12 rounded-2xl font-black text-sm flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        workoutDays === num
                          ? 'border-primary-500 bg-primary-500 text-white shadow-glow'
                          : 'border-border hover:border-primary-500/40 text-muted'
                      }`}
                      style={workoutDays === num ? {} : { background: 'var(--color-surface)' }}
                    >
                      <span>{num}</span>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                  {workoutDays <= 2 && 'Good starting pace to build consistency and momentum.'}
                  {workoutDays >= 3 && workoutDays <= 4 && 'The sweet spot for strength gains and optimal muscular recovery.'}
                  {workoutDays === 5 && 'High volume split for focused muscle group isolation.'}
                  {workoutDays >= 6 && 'Intense regimen. Ensure adequate sleep and recovery protocols.'}
                </p>
              </div>

              {/* Equipment Checklist */}
              <div>
                <label className="block text-sm font-semibold mb-2">Available Equipment (select all you have)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {equipmentOptions.map((eq) => {
                    const isSelected = equipment.includes(eq.id)
                    return (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() => toggleEquipment(eq.id)}
                        className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-border hover:border-primary-500/40'
                        }`}
                        style={{ background: isSelected ? 'rgba(255,90,31,0.08)' : 'var(--color-surface)' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{eq.icon}</span>
                          <span className="text-sm font-semibold">{eq.name}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-primary-500 border-primary-500 text-white'
                              : 'border-zinc-500 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Summary & Nutrition Targets */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 rounded-3xl space-y-6"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-primary-500 mb-2" style={{ background: 'rgba(255,90,31,0.1)' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Tailored Plan
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-display">You're ready to train, {name}!</h2>
                <p className="text-sm text-muted">Here are your calculated baseline stats and daily nutrition goals</p>
              </div>

              {/* 3 Metric cards: BMI, BMR, TDEE */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="text-xs text-muted font-medium mb-1">BMI</div>
                  <div className="text-xl font-black">{bmi}</div>
                  <div className={`text-[10px] font-bold ${bmiCategory.color} mt-0.5`}>
                    {bmiCategory.label}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="text-xs text-muted font-medium mb-1">BMR</div>
                  <div className="text-xl font-black">{bmr.toLocaleString()}</div>
                  <div className="text-[10px] text-muted mt-0.5">kcal / day</div>
                </div>

                <div className="p-3.5 rounded-2xl text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="text-xs text-muted font-medium mb-1">TDEE</div>
                  <div className="text-xl font-black">{tdee.toLocaleString()}</div>
                  <div className="text-[10px] text-muted mt-0.5">Maintenance</div>
                </div>
              </div>

              {/* Daily Calorie Target Card (Editable) */}
              <div
                className="p-5 rounded-2xl border"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,90,31,0.08) 0%, rgba(240,38,27,0.04) 100%)',
                  borderColor: 'rgba(255,90,31,0.3)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">
                      Target Daily Calories
                    </span>
                    <p className="text-xs text-muted">Based on your {goals.find((g) => g.id === goal)?.title} goal</p>
                  </div>
                  {customCalories !== null && (
                    <button
                      type="button"
                      onClick={() => setCustomCalories(null)}
                      className="text-xs text-muted hover:text-primary-500 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={targetCalories}
                      onChange={(e) => setCustomCalories(Number(e.target.value) || 0)}
                      className="input font-display font-black text-2xl py-2 pl-4 pr-16 text-primary-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">
                      kcal
                    </span>
                  </div>
                </div>
              </div>

              {/* Macros Breakdown */}
              <div>
                <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Macro Targets Breakdown
                </div>

                {/* Macro progress bar */}
                <div className="h-2.5 rounded-full overflow-hidden flex gap-1 mb-3 bg-zinc-800">
                  <div
                    style={{ width: `${macroBreakdown.proteinPct}%` }}
                    className="h-full bg-primary-500 transition-all duration-300"
                    title={`Protein ${macroBreakdown.proteinPct}%`}
                  />
                  <div
                    style={{ width: `${macroBreakdown.carbsPct}%` }}
                    className="h-full bg-blue-500 transition-all duration-300"
                    title={`Carbs ${macroBreakdown.carbsPct}%`}
                  />
                  <div
                    style={{ width: `${macroBreakdown.fatPct}%` }}
                    className="h-full bg-amber-500 transition-all duration-300"
                    title={`Fat ${macroBreakdown.fatPct}%`}
                  />
                </div>

                {/* 3 Macro Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Protein */}
                  <div
                    className="p-3 rounded-2xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary-500 mb-1">
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                      Protein
                    </div>
                    <div className="text-lg font-black">{macros.protein}g</div>
                    <div className="text-[10px] text-muted">{macroBreakdown.proteinPct}% of total</div>
                  </div>

                  {/* Carbs */}
                  <div
                    className="p-3 rounded-2xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Carbs
                    </div>
                    <div className="text-lg font-black">{macros.carbs}g</div>
                    <div className="text-[10px] text-muted">{macroBreakdown.carbsPct}% of total</div>
                  </div>

                  {/* Fats */}
                  <div
                    className="p-3 rounded-2xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Fats
                    </div>
                    <div className="text-lg font-black">{macros.fat}g</div>
                    <div className="text-[10px] text-muted">{macroBreakdown.fatPct}% of total</div>
                  </div>
                </div>
              </div>

              {/* Training Summary Recap */}
              <div
                className="p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold text-muted">Plan Summary:</span>
                  <span className="font-bold">{goals.find((g) => g.id === goal)?.title}</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <span>{workoutDays} sessions/wk</span>
                  <span>•</span>
                  <span>{equipment.length} equipment types</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8">
          {step > 1 ? (
            <motion.button
              type="button"
              onClick={handleBack}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary btn-md inline-flex items-center gap-2 px-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </motion.button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <motion.button
              type="button"
              onClick={handleNext}
              whileTap={{ scale: 0.98 }}
              className="btn-primary btn-md inline-flex items-center gap-2 px-8"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="btn-primary btn-lg inline-flex items-center gap-2 px-8 shadow-glow"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Start Training <Sparkles className="w-5 h-5" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-muted mt-8">
        PulseFit respects your health journey. You can update your settings anytime in Profile Settings.
      </div>
    </div>
  )
}
