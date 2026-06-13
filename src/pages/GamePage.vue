<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoom } from '@/composables/useRoom'
import { useGame } from '@/composables/useGame'
import { useExpire } from '@/composables/useExpire'
import { useHostHelper } from '@/composables/useHostHelper'
import FlipCard from '@/components/FlipCard.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import HostHelper from '@/components/HostHelper.vue'
import type { Topic } from '@/types'
import type { FollowUp } from '@/topics/followUps'

const route = useRoute()
const router = useRouter()
const { currentRoom, resetGame, endGame, loadRooms, loadRoom } = useRoom()
const { 
  currentTopic, 
  isFlipping, 
  isShuffling, 
  showTruthOrDare, 
  currentPlayer,
  progress,
  flipNextCard, 
  emergencyPick, 
  shuffleCards,
  closeTruthOrDare
} = useGame()
const { isRoomExpired } = useExpire()
const {
  elapsedSeconds,
  thresholdSeconds,
  isHelperEnabled,
  showHelperPanel,
  currentSuggestions,
  isWarning,
  isAlerting,
  progressPercentage,
  remainingSeconds,
  formattedTime,
  startSilenceTimer,
  stopSilenceTimer,
  refreshSuggestions,
  useSuggestion,
  manuallyTriggerHelper,
  dismissHelper,
  toggleHelper,
  resetHelper,
  setThreshold
} = useHostHelper()

const roomId = computed(() => route.params.id as string)
const showEndConfirm = ref(false)
const showResetConfirm = ref(false)
const showSettingsPanel = ref(false)
const usedFollowUps = ref<FollowUp[]>([])

const hasUnflippedTopics = computed(() => {
  if (!currentRoom.value) return false
  return currentRoom.value.topics.some((t: Topic) => !t.isFlipped)
})

const thresholdOptions = [
  { label: '快速模式 (10秒)', value: 10 },
  { label: '标准模式 (20秒)', value: 20 },
  { label: '宽松模式 (30秒)', value: 30 },
  { label: '从容模式 (45秒)', value: 45 }
]

watch(currentTopic, (newTopic) => {
  console.log('[GamePage] currentTopic 变化:', newTopic?.content)
  if (newTopic && currentPlayer.value) {
    console.log('[GamePage] 启动计时器，玩家:', currentPlayer.value)
    startSilenceTimer(newTopic, currentPlayer.value)
  }
})

onMounted(() => {
  loadRooms()
  const success = loadRoom(roomId.value)
  if (!success) {
    router.push('/')
    return
  }
  
  if (currentRoom.value && isRoomExpired(currentRoom.value.expiresAt)) {
    alert('房间已过期，话题已自动消失')
    router.push('/')
    return
  }
})

const handleFlipCard = () => {
  if (isFlipping.value || isShuffling.value) return
  
  resetHelper()
  usedFollowUps.value = []
  
  const topic = flipNextCard(roomId.value)
  if (!topic) {
    alert('所有话题都聊完了！点急救试试吧～')
  }
}

const handleEmergency = () => {
  if (isFlipping.value || isShuffling.value) return
  
  resetHelper()
  usedFollowUps.value = []
  
  const topic = emergencyPick(roomId.value)
  if (topic) {
    currentTopic.value = topic
    showTruthOrDare.value = true
  }
}

const handleShuffle = () => {
  if (isFlipping.value || isShuffling.value) return
  
  if (confirm('重新洗牌会重置所有话题，确定吗？')) {
    resetHelper()
    usedFollowUps.value = []
    shuffleCards(roomId.value)
  }
}

const handleEndGame = () => {
  if (confirm('确定要结束游戏吗？')) {
    stopSilenceTimer()
    resetHelper()
    endGame(roomId.value)
    showEndConfirm.value = false
    router.push(`/room/${roomId.value}`)
  }
}

const handleResetGame = () => {
  if (confirm('确定要重新开始吗？所有话题会被重置。')) {
    stopSilenceTimer()
    resetHelper()
    usedFollowUps.value = []
    resetGame(roomId.value)
    showResetConfirm.value = false
    router.push(`/room/${roomId.value}`)
  }
}

const goBack = () => {
  stopSilenceTimer()
  resetHelper()
  router.push(`/room/${roomId.value}`)
}

const handleChoice = (choice: 'talk' | 'truth' | 'dare') => {
  closeTruthOrDare()
  
  if (choice === 'talk') {
    stopSilenceTimer()
  }
  
  if (choice === 'dare') {
    stopSilenceTimer()
    alert('大胆去做吧！记得拍视频留证据 📸')
  } else if (choice === 'truth') {
    stopSilenceTimer()
    alert('说真话的孩子运气不会太差 👀')
  }
}

const handleHostUseSuggestion = (followUp: FollowUp) => {
  useSuggestion(followUp)
  if (!usedFollowUps.value.find(u => u.id === followUp.id)) {
    usedFollowUps.value.push(followUp)
  }
}

const handleManualTrigger = () => {
  if (currentTopic.value && currentPlayer.value) {
    manuallyTriggerHelper(currentTopic.value, currentPlayer.value)
  }
}

const handleSetThreshold = (value: number) => {
  setThreshold(value)
  showSettingsPanel.value = false
}

const handleToggleHelper = () => {
  toggleHelper()
}
</script>

<template>
  <div 
    v-if="currentRoom"
    class="game-page min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white"
  >
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">✨</div>
      <div class="absolute top-20 right-20 text-5xl opacity-20 animate-pulse" style="animation-delay: 0.5s">🌟</div>
      <div class="absolute bottom-20 left-20 text-5xl opacity-20 animate-pulse" style="animation-delay: 1s">💫</div>
      <div class="absolute bottom-10 right-10 text-6xl opacity-20 animate-pulse" style="animation-delay: 1.5s">🎆</div>
    </div>

    <HostHelper
      :elapsed-seconds="elapsedSeconds"
      :threshold-seconds="thresholdSeconds"
      :progress-percentage="progressPercentage"
      :is-warning="isWarning"
      :is-alerting="isAlerting"
      :remaining-seconds="remainingSeconds"
      :formatted-time="formattedTime"
      :show-helper-panel="showHelperPanel"
      :current-suggestions="currentSuggestions"
      :current-topic="currentTopic"
      :current-player-name="currentPlayer"
      :is-helper-enabled="isHelperEnabled"
      @refresh="refreshSuggestions"
      @use="handleHostUseSuggestion"
      @dismiss="dismissHelper"
      @manual-trigger="handleManualTrigger"
      @toggle-enabled="handleToggleHelper"
    />

    <div class="relative z-10 max-w-4xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <button 
          class="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          @click="goBack"
        >
          <span>←</span>
          <span>返回房间</span>
        </button>
        
        <div class="text-center">
          <h1 class="text-xl font-bold">{{ currentRoom.name }}</h1>
          <div class="text-sm text-white/60">🎴 游戏进行中</div>
        </div>
        
        <button 
          class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          @click="showSettingsPanel = true"
        >
          <span>⚙️</span>
        </button>
      </div>

      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-white/80">游戏进度</span>
          <span class="text-sm font-mono">{{ progress.flipped }} / {{ progress.total }}</span>
        </div>
        <div class="h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-green-400 to-teal-400 rounded-full transition-all duration-500"
            :style="{ width: `${progress.percentage}%` }"
          ></div>
        </div>
        <div class="mt-2 text-right text-xs text-white/60">
          {{ progress.percentage }}% 完成
        </div>
      </div>

      <div class="mb-8">
        <h3 class="text-sm font-medium text-white/80 mb-3 text-center flex items-center justify-center gap-2">
          <span>👥</span> 轮流顺序
        </h3>
        <div class="flex justify-center flex-wrap gap-2">
          <div 
            v-for="member in currentRoom.members" 
            :key="member.id"
            class="relative"
          >
            <div 
              class="transition-all duration-300"
              :class="{
                'scale-110': member.name === currentPlayer
              }"
            >
              <MemberAvatar 
                :name="member.name"
                :avatar="member.avatar"
                :is-host="member.isHost"
                size="sm"
              />
            </div>
            <div 
              v-if="member.name === currentPlayer"
              class="absolute -top-2 left-1/2 transform -translate-x-1/2 text-lg animate-bounce"
            >
              👇
            </div>
          </div>
        </div>
      </div>

      <div 
        class="relative mb-8 cursor-pointer select-none"
        @click="handleFlipCard"
        :class="{ 'pointer-events-none': isFlipping || isShuffling }"
      >
        <FlipCard 
          :topic="currentTopic"
          :is-flipping="isFlipping"
          :player-name="currentPlayer"
        />
        
        <div 
          v-if="isShuffling"
          class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"
        >
          <div class="text-center">
            <div class="text-5xl animate-spin mb-2">🎴</div>
            <div class="text-xl font-bold">洗牌中...</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-3 mb-6">
        <button 
          class="px-2 py-4 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!hasUnflippedTopics || isFlipping || isShuffling"
          @click="handleFlipCard"
        >
          <span class="text-3xl">🎴</span>
          <span class="text-xs font-medium">翻牌</span>
        </button>
        
        <button 
          class="px-2 py-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl hover:opacity-90 transition-all flex flex-col items-center gap-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isFlipping || isShuffling"
          @click="handleEmergency"
        >
          <span class="text-3xl animate-pulse">🆘</span>
          <span class="text-xs font-medium">急救</span>
        </button>
        
        <button 
          class="px-2 py-4 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed relative"
          :disabled="!currentTopic || isFlipping || isShuffling"
          @click.stop="handleManualTrigger"
          :class="{ 'ring-2 ring-yellow-400 ring-opacity-50': isWarning }"
        >
          <span class="text-3xl" :class="{ 'animate-bounce': isAlerting }">🎙️</span>
          <span class="text-xs font-medium">主持</span>
          <span 
            v-if="isHelperEnabled && currentTopic && elapsedSeconds > 0"
            class="absolute -top-1 -right-1 min-w-[24px] h-6 px-1.5 text-xs rounded-full flex items-center justify-center font-mono"
            :class="{
              'bg-red-500 text-white': isAlerting,
              'bg-yellow-500 text-white': isWarning && !isAlerting,
              'bg-white/20 text-white/70': !isWarning && !isAlerting
            }"
          >
            {{ formattedTime }}
          </span>
        </button>
        
        <button 
          class="px-2 py-4 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isFlipping || isShuffling"
          @click="handleShuffle"
        >
          <span class="text-3xl">🔄</span>
          <span class="text-xs font-medium">重洗</span>
        </button>
      </div>

      <div 
        v-if="usedFollowUps.length > 0" 
        class="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/10"
      >
        <h4 class="text-xs font-medium text-white/60 mb-3 flex items-center gap-2">
          <span>📝</span>
          本轮用过的追问 ({{ usedFollowUps.length }})
        </h4>
        <div class="space-y-2">
          <div 
            v-for="(fu, idx) in usedFollowUps.slice(-3)" 
            :key="fu.id + '-' + idx"
            class="text-xs text-white/70 bg-white/5 rounded-lg px-3 py-2"
          >
            {{ fu.pattern }}
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button 
          class="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all text-sm"
          @click="showResetConfirm = true"
        >
          🔄 重新开始
        </button>
        <button 
          class="flex-1 px-4 py-3 bg-red-500/80 hover:bg-red-500 rounded-xl transition-all text-sm"
          @click="showEndConfirm = true"
        >
          ⏹️ 结束游戏
        </button>
      </div>
    </div>

    <div 
      v-if="showTruthOrDare && currentTopic"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl text-center">
        <div class="text-5xl mb-4">🎯</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">
          轮到 {{ currentPlayer }} 啦！
        </h3>
        <p class="text-gray-600 mb-6">
          翻到了：<span class="font-medium">{{ currentTopic.content }}</span>
        </p>
        
        <p class="text-sm text-gray-500 mb-4">请选择：</p>
        
        <div class="space-y-3">
          <button 
            class="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            @click="handleChoice('talk')"
          >
            <span class="text-xl">💬</span>
            聊聊这个话题
          </button>
          
          <button 
            class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            @click="handleChoice('truth')"
          >
            <span class="text-xl">🤥</span>
            真心话
          </button>
          
          <button 
            class="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            @click="handleChoice('dare')"
          >
            <span class="text-xl">🎲</span>
            大冒险
          </button>
        </div>
        
        <button 
          class="mt-4 text-sm text-gray-400 hover:text-gray-600"
          @click="closeTruthOrDare"
        >
          跳过
        </button>
      </div>
    </div>

    <div 
      v-if="showSettingsPanel"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      @click.self="showSettingsPanel = false"
    >
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h3 class="text-xl font-bold text-gray-800 mb-2 text-center flex items-center justify-center gap-2">
          <span>⚙️</span> 主持助手设置
        </h3>
        <p class="text-sm text-gray-500 mb-6 text-center">
          调整冷场检测时间和助手开关
        </p>

        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-700">主持助手</span>
            <button 
              class="relative w-12 h-7 rounded-full transition-colors"
              :class="isHelperEnabled ? 'bg-purple-500' : 'bg-gray-300'"
              @click="handleToggleHelper"
            >
              <div 
                class="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform"
                :class="isHelperEnabled ? 'translate-x-5' : 'translate-x-0.5'"
              ></div>
            </button>
          </div>
          <p class="text-xs text-gray-400">
            {{ isHelperEnabled ? '助手会在冷场时自动给出追问建议' : '关闭后不会自动提醒' }}
          </p>
        </div>

        <div class="mb-6" :class="{ 'opacity-50 pointer-events-none': !isHelperEnabled }">
          <span class="text-sm font-medium text-gray-700 block mb-3">冷场触发时间</span>
          <div class="space-y-2">
            <button 
              v-for="opt in thresholdOptions" 
              :key="opt.value"
              class="w-full px-4 py-3 rounded-xl text-left text-sm transition-all flex items-center justify-between"
              :class="[
                thresholdSeconds === opt.value
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              ]"
              @click="handleSetThreshold(opt.value)"
            >
              <span>{{ opt.label }}</span>
              <span v-if="thresholdSeconds === opt.value">✓</span>
            </button>
          </div>
        </div>

        <button 
          class="w-full px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          @click="showSettingsPanel = false"
        >
          完成
        </button>
      </div>
    </div>

    <div 
      v-if="showEndConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showEndConfirm = false"
    >
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div class="text-5xl mb-4">😢</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">结束游戏？</h3>
        <p class="text-gray-500 text-sm mb-6">
          结束后可以回到房间查看聊过的话题
        </p>
        
        <div class="flex gap-3">
          <button 
            class="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            @click="showEndConfirm = false"
          >
            继续玩
          </button>
          <button 
            class="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            @click="handleEndGame"
          >
            结束
          </button>
        </div>
      </div>
    </div>

    <div 
      v-if="showResetConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showResetConfirm = false"
    >
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div class="text-5xl mb-4">🔄</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">重新开始？</h3>
        <p class="text-gray-500 text-sm mb-6">
          所有话题会被重置，可以重新洗牌翻牌
        </p>
        
        <div class="flex gap-3">
          <button 
            class="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            @click="showResetConfirm = false"
          >
            取消
          </button>
          <button 
            class="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            @click="handleResetGame"
          >
            重新开始
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
