import { ref, computed, watch, onUnmounted } from 'vue'
import type { Topic, TopicType } from '@/types'
import type { FollowUp } from '@/topics/followUps'
import { 
  getMultipleFollowUps, 
  getRandomFollowUp, 
  formatFollowUpWithName,
  FOLLOWUP_CATEGORIES 
} from '@/topics/followUps'

export interface HostHelperState {
  isActive: boolean
  elapsedSeconds: number
  thresholdSeconds: number
  isWarning: boolean
  isAlerting: boolean
}

export const DEFAULT_SILENCE_THRESHOLD = 20
export const WARNING_THRESHOLD = 10

export function useHostHelper() {
  const silenceTimer = ref<ReturnType<typeof setInterval> | null>(null)
  const elapsedSeconds = ref(0)
  const thresholdSeconds = ref(DEFAULT_SILENCE_THRESHOLD)
  const isHelperEnabled = ref(true)
  const showHelperPanel = ref(false)
  const currentSuggestions = ref<FollowUp[]>([])
  const currentTopic = ref<Topic | null>(null)
  const currentPlayerName = ref('')
  const helperHistory = ref<Array<{ topic: string; used: FollowUp[]; timestamp: string }>>([])

  const isWarning = computed(() => 
    isHelperEnabled.value && 
    elapsedSeconds.value >= WARNING_THRESHOLD && 
    elapsedSeconds.value < thresholdSeconds.value
  )

  const isAlerting = computed(() => 
    isHelperEnabled.value && 
    elapsedSeconds.value >= thresholdSeconds.value
  )

  const progressPercentage = computed(() => {
    if (thresholdSeconds.value <= 0) return 0
    return Math.min(100, Math.round((elapsedSeconds.value / thresholdSeconds.value) * 100))
  })

  const remainingSeconds = computed(() => 
    Math.max(0, thresholdSeconds.value - elapsedSeconds.value)
  )

  const formattedTime = computed(() => {
    const mins = Math.floor(elapsedSeconds.value / 60)
    const secs = elapsedSeconds.value % 60
    if (mins > 0) {
      return `${mins}分${secs.toString().padStart(2, '0')}秒`
    }
    return `${secs}秒`
  })

  const startSilenceTimer = (topic: Topic, playerName: string) => {
    stopSilenceTimer()
    
    if (!isHelperEnabled.value) return

    currentTopic.value = topic
    currentPlayerName.value = playerName
    elapsedSeconds.value = 0
    showHelperPanel.value = false
    currentSuggestions.value = []

    console.log('[HostHelper] 开始计时：', topic.content, '轮到：', playerName)

    silenceTimer.value = setInterval(() => {
      elapsedSeconds.value++
      
      if (elapsedSeconds.value === WARNING_THRESHOLD) {
        console.log('[HostHelper] 冷场预警：已过', WARNING_THRESHOLD, '秒')
      }
      
      if (elapsedSeconds.value === thresholdSeconds.value) {
        console.log('[HostHelper] 触发冷场提醒！已过', thresholdSeconds.value, '秒')
        triggerHelperAlert()
      }
    }, 1000)
  }

  const stopSilenceTimer = () => {
    if (silenceTimer.value) {
      clearInterval(silenceTimer.value)
      silenceTimer.value = null
      console.log('[HostHelper] 计时器已停止，用时：', formattedTime.value)
    }
  }

  const generateSuggestions = (topicType: TopicType, playerName: string, count: number = 3) => {
    const suggestions = getMultipleFollowUps(topicType, count)
    currentSuggestions.value = suggestions.map(s => ({
      ...s,
      pattern: formatFollowUpWithName(s, playerName)
    }))
    console.log('[HostHelper] 生成追问建议：', currentSuggestions.value.length, '条')
    return currentSuggestions.value
  }

  const triggerHelperAlert = () => {
    if (!currentTopic.value) return
    
    showHelperPanel.value = true
    generateSuggestions(currentTopic.value.type, currentPlayerName.value, 3)
  }

  const refreshSuggestions = () => {
    if (!currentTopic.value) return
    
    const newSuggestion = getRandomFollowUp(currentTopic.value.type)
    const formatted: FollowUp = {
      ...newSuggestion,
      pattern: formatFollowUpWithName(newSuggestion, currentPlayerName.value)
    }
    
    if (currentSuggestions.value.length >= 3) {
      currentSuggestions.value.shift()
    }
    currentSuggestions.value.push(formatted)
    
    console.log('[HostHelper] 刷新建议：', formatted.pattern)
    return formatted
  }

  const useSuggestion = (followUp: FollowUp) => {
    if (!currentTopic.value) return
    
    const existingHistory = helperHistory.value.find(
      h => h.topic === currentTopic.value?.content
    )
    
    if (existingHistory) {
      if (!existingHistory.used.find(u => u.id === followUp.id)) {
        existingHistory.used.push(followUp)
      }
    } else {
      helperHistory.value.push({
        topic: currentTopic.value.content,
        used: [followUp],
        timestamp: new Date().toISOString()
      })
    }
    
    console.log('[HostHelper] 采用建议：', followUp.pattern)
  }

  const manuallyTriggerHelper = (topic: Topic, playerName: string) => {
    currentTopic.value = topic
    currentPlayerName.value = playerName
    showHelperPanel.value = true
    generateSuggestions(topic.type, playerName, 3)
    console.log('[HostHelper] 手动触发助手')
  }

  const dismissHelper = () => {
    showHelperPanel.value = false
    console.log('[HostHelper] 关闭助手面板')
  }

  const setThreshold = (seconds: number) => {
    thresholdSeconds.value = Math.max(10, Math.min(120, seconds))
    console.log('[HostHelper] 更新冷场阈值为：', thresholdSeconds.value, '秒')
  }

  const toggleHelper = (enabled?: boolean) => {
    isHelperEnabled.value = enabled ?? !isHelperEnabled.value
    
    if (!isHelperEnabled.value) {
      stopSilenceTimer()
      showHelperPanel.value = false
    }
    
    console.log('[HostHelper] 助手状态：', isHelperEnabled.value ? '开启' : '关闭')
  }

  const resetHelper = () => {
    stopSilenceTimer()
    elapsedSeconds.value = 0
    showHelperPanel.value = false
    currentSuggestions.value = []
    currentTopic.value = null
    currentPlayerName.value = ''
    console.log('[HostHelper] 重置助手状态')
  }

  onUnmounted(() => {
    stopSilenceTimer()
  })

  return {
    elapsedSeconds,
    thresholdSeconds,
    isHelperEnabled,
    showHelperPanel,
    currentSuggestions,
    currentTopic,
    currentPlayerName,
    helperHistory,
    isWarning,
    isAlerting,
    progressPercentage,
    remainingSeconds,
    formattedTime,
    FOLLOWUP_CATEGORIES,
    startSilenceTimer,
    stopSilenceTimer,
    generateSuggestions,
    triggerHelperAlert,
    refreshSuggestions,
    useSuggestion,
    manuallyTriggerHelper,
    dismissHelper,
    setThreshold,
    toggleHelper,
    resetHelper,
    WARNING_THRESHOLD,
    DEFAULT_SILENCE_THRESHOLD
  }
}
