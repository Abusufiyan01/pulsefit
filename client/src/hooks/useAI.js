import { useState, useEffect, useCallback } from 'react'
import aiService from '../services/aiService'
import toast from 'react-hot-toast'

const FALLBACK_QUOTES = [
  {
    quote: 'The only bad workout is the one that did not happen.',
    author: 'Fitness Philosophy',
  },
  {
    quote: 'Strength does not come from what you can do. It comes from overcoming the things you once thought you could not.',
    author: 'Rikki Rogers',
  },
  {
    quote: 'Action is the foundational key to all success.',
    author: 'Pablo Picasso',
  },
  {
    quote: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Abraham Lincoln',
  },
  {
    quote: 'Success starts with self-discipline.',
    author: 'Dwayne Johnson',
  },
]

const FALLBACK_INSIGHTS = [
  {
    title: 'Consistency Spike',
    description: 'You are maintaining solid workout momentum! Focus on keeping progressive overload on primary compound lifts.',
    type: 'positive',
  },
  {
    title: 'Protein Optimization',
    description: 'Hitting your daily 2.2g/kg protein target will accelerate muscle repair and recovery after heavy sessions.',
    type: 'tip',
  },
  {
    title: 'Hydration Target',
    description: 'Hydration directly affects muscle output. Aim to hit your 2.5L-3L daily water goal before your workout window.',
    type: 'hydration',
  },
]

export function useAI() {
  const [quote, setQuote] = useState(() => {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
  })
  const [insights, setInsights] = useState(FALLBACK_INSIGHTS)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const fetchQuote = useCallback(async () => {
    setIsLoadingQuote(true)
    try {
      const res = await aiService.getQuote()
      if (res.data?.quote) {
        setQuote(res.data)
      }
    } catch (err) {
      // Graceful fallback to static quotes
      setQuote(FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)])
    } finally {
      setIsLoadingQuote(false)
    }
  }, [])

  const fetchInsights = useCallback(async () => {
    setIsLoadingInsights(true)
    try {
      const res = await aiService.getProgressInsights()
      const data = res.data?.insights || res.data?.data || res.data
      if (Array.isArray(data) && data.length > 0) {
        setInsights(data)
      }
    } catch (err) {
      // Graceful fallback
      setInsights(FALLBACK_INSIGHTS)
    } finally {
      setIsLoadingInsights(false)
    }
  }, [])

  useEffect(() => {
    fetchQuote()
    fetchInsights()
  }, [fetchQuote, fetchInsights])

  const generateWorkoutPlan = async (preferences) => {
    setIsGenerating(true)
    try {
      const res = await aiService.getWorkoutPlan(preferences)
      toast.success('AI Workout Plan generated! ✨')
      return res.data?.plan || res.data
    } catch (err) {
      console.warn('AI Workout Plan API unavailable, using smart template:', err)
      toast('Generated standard periodized template', { icon: '💡' })
      return {
        name: `${preferences.experienceLevel || 'Intermediate'} Strength & Hypertrophy`,
        description: 'Personalized routine focused on compound movements and balanced volume distribution.',
        difficulty: preferences.experienceLevel || 'intermediate',
        estimatedDuration: 55,
        exercises: [
          { name: 'Barbell Squat', muscleGroup: 'quads', sets: 4, reps: 8, rpe: 8 },
          { name: 'Bench Press', muscleGroup: 'chest', sets: 4, reps: 8, rpe: 8 },
          { name: 'Bent Over Row', muscleGroup: 'back', sets: 3, reps: 10, rpe: 8 },
          { name: 'Overhead Press', muscleGroup: 'shoulders', sets: 3, reps: 10, rpe: 8 },
          { name: 'Romanian Deadlift', muscleGroup: 'hamstrings', sets: 3, reps: 10, rpe: 8 },
        ],
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMealSuggestions = async (preferences) => {
    setIsGenerating(true)
    try {
      const res = await aiService.getMealSuggestions(preferences)
      toast.success('AI Meal suggestions ready! 🥗')
      return res.data?.suggestions || res.data
    } catch (err) {
      console.warn('AI Meal Suggestions API unavailable, using balanced suggestions:', err)
      toast('Generated high-protein nutrition plan', { icon: '🥗' })
      return {
        breakfast: {
          name: 'Oats with Whey Protein, Almonds & Banana',
          calories: 520,
          protein: 38,
          carbs: 65,
          fat: 12,
        },
        lunch: {
          name: 'Grilled Chicken Breast / Paneer Rice Bowl with Dal',
          calories: 680,
          protein: 48,
          carbs: 75,
          fat: 16,
        },
        dinner: {
          name: 'Salmon or Soy Chunks stir fry with Quinoa & Steamed Broccoli',
          calories: 620,
          protein: 46,
          carbs: 55,
          fat: 18,
        },
        snack: {
          name: 'Greek Yogurt with Mixed Berries & Chia Seeds',
          calories: 280,
          protein: 22,
          carbs: 28,
          fat: 6,
        },
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    quote,
    insights,
    isLoadingQuote,
    isLoadingInsights,
    isGenerating,
    refetchQuote: fetchQuote,
    refetchInsights: fetchInsights,
    generateWorkoutPlan,
    generateMealSuggestions,
  }
}

export default useAI
