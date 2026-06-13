<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { FollowUp, FollowUpCategory } from '@/topics/followUps'
import { FOLLOWUP_CATEGORIES } from '@/topics/followUps'
import { TOPIC_EMOJIS } from '@/types'
import type { Topic } from '@/types'

const props = defineProps<{
  elapsedSeconds: number
  thresholdSeconds: number
  progressPercentage: number
  isWarning: boolean
  isAlerting: boolean
  remainingSeconds: number
  formattedTime: string
  showHelperPanel: boolean
  currentSuggestions: FollowUp[]
  currentTopic: Topic | null
  currentPlayerName: string
  isHelperEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'use', followUp: FollowUp): void
  (e: 'dismiss'): void
  (e: 'manualTrigger'): void
}>()

const selectedFollowUp = ref<FollowUp | null>(null)

const progressColor = computed(() => {
  if (props.progressPercentage >= 100) return 'from-red-400 to-pink-500'
  if (props.progressPercentage >= 60) return 'from-yellow-400 to-orange-500'
  return 'from-green-400 to-teal-400'
})

const getCategoryInfo = (category: FollowUp['category']): FollowUpCategory => {
  return FOLLOWUP_CATEGORIES[category]
}

watch(() => props.showHelperPanel, (show) => {
  if (!show) {
    selectedFollowUp.value = null
  }
})

const handleUseSuggestion = (followUp: FollowUp) => {
  selectedFollowUp.value = followUp
  emit('use', followUp)
}

const handleRefresh = () => {
  emit('refresh')
}

const handleDismiss = () => {
  emit('dismiss')
}

const handleManualTrigger = () => {
  emit('manualTrigger')
}
</script>

<template>
  <div class="host-helper">
    <!-- 顶部计时进度条 -->
    <div 
      v-if="isHelperEnabled && currentTopic"
      class="fixed top-0 left-0 right-0 z-40 h-1.5 bg-black/30 overflow-hidden"
    >
      <div 
        class="h-full bg-gradient-to-r transition-all duration-500 ease-out"
        :class="progressColor"
        :style="{ width: `${progressPercentage}%` }"
      >
        <div 
          v-if="isAlerting" 
          class="h-full w-full bg-white/30 animate-pulse"
        ></div>
      </div>
    </div>

    <!-- 悬浮计时指示器 -->
    <div 
      v-if="isHelperEnabled && currentTopic && !showHelperPanel"
      class="fixed bottom-36 right-4 z-40"
    >
      <div class="flex flex-col items-center gap-2">
        <div 
          class="px-3 py-2 rounded-2xl backdrop-blur-md shadow-lg flex items-center gap-2 transition-all"
          :class="{
            'bg-red-500/90 text-white': isAlerting,
            'bg-yellow-500/90 text-white': isWarning && !isAlerting,
            'bg-white/20 text-white/80': !isWarning && !isAlerting
          }"
        >
          <span class="text-base">
            {{ isAlerting ? '😅' : isWarning ? '🤔' : '⏱️' }}
          </span>
          <span class="text-sm font-mono font-medium">
            {{ formattedTime }}
          </span>
        </div>
        
        <button 
          v-if="isAlerting"
          class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg text-sm font-medium hover:opacity-90 transition-opacity animate-pulse"
          @click.stop="handleManualTrigger"
        >
          🎙️ 接话
        </button>
      </div>
    </div>

    <!-- 主持助手底部面板 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div 
        v-if="showHelperPanel && currentTopic"
        class="fixed inset-x-0 bottom-0 z-50"
      >
        <!-- 背景遮罩 -->
        <div 
          class="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
          @click="handleDismiss"
        ></div>
        
        <!-- 主卡片 -->
        <div class="max-w-lg mx-auto p-4 pb-8">
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <!-- 头部 -->
            <div 
              class="px-6 py-4 text-white relative overflow-hidden"
              :style="{ background: `linear-gradient(135deg, ${currentTopic.color} 0%, ${currentTopic.color}dd 100%)` }"
            >
              <div class="absolute top-0 right-0 text-8xl opacity-20 transform translate-x-8 -translate-y-4">
                {{ TOPIC_EMOJIS[currentTopic.type] }}
              </div>
              
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">🎙️</span>
                    <span class="text-lg font-bold">主持助手</span>
                  </div>
                  <button 
                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    @click="handleDismiss"
                  >
                    <span class="text-sm">✕</span>
                  </button>
                </div>
                
                <div class="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <div class="flex items-start gap-2">
                    <span class="text-xl mt-0.5">{{ TOPIC_EMOJIS[currentTopic.type] }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm opacity-90 line-clamp-2">
                        {{ currentTopic.content }}
                      </p>
                      <p class="text-xs opacity-70 mt-1">
                        轮到：{{ currentPlayerName }} · 冷场 {{ formattedTime }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 建议列表 -->
            <div class="p-4 max-h-80 overflow-y-auto">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>💡</span>
                  追问建议
                </h4>
                <button 
                  class="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-purple-50 transition-colors"
                  @click="handleRefresh"
                >
                  <span>🔄</span>
                  换一批
                </button>
              </div>

              <div class="space-y-3">
                <div 
                  v-for="(followUp, index) in currentSuggestions" 
                  :key="followUp.id + '-' + index"
                  class="group relative rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden"
                  :class="[
                    selectedFollowUp?.id === followUp.id && selectedFollowUp?.pattern === followUp.pattern
                      ? 'border-purple-500 bg-purple-50 shadow-md scale-[1.02]'
                      : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-gray-50 hover:shadow-sm'
                  ]"
                  @click="handleUseSuggestion(followUp)"
                >
                  <div 
                    class="absolute left-0 top-0 bottom-0 w-1 transition-all"
                    :style="{ backgroundColor: currentTopic.color }"
                  ></div>
                  
                  <div class="p-4 pl-5">
                    <div class="flex items-start justify-between gap-3 mb-2">
                      <div 
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        :style="{ 
                          backgroundColor: `${currentTopic.color}15`,
                          color: currentTopic.color
                        }"
                      >
                        <span>{{ getCategoryInfo(followUp.category).emoji }}</span>
                        <span>{{ getCategoryInfo(followUp.category).name }}</span>
                      </div>
                      
                      <div 
                        v-if="selectedFollowUp?.id === followUp.id && selectedFollowUp?.pattern === followUp.pattern"
                        class="flex items-center gap-1 text-xs text-purple-600 font-medium"
                      >
                        <span>✓</span>
                        <span>已采用</span>
                      </div>
                    </div>
                    
                    <p class="text-gray-800 text-sm leading-relaxed">
                      {{ followUp.pattern }}
                    </p>
                    
                    <p class="text-xs text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {{ getCategoryInfo(followUp.category).description }}
                    </p>
                  </div>
                </div>
              </div>

              <div 
                v-if="currentSuggestions.length === 0"
                class="text-center py-8 text-gray-400"
              >
                <div class="text-4xl mb-2">🤷</div>
                <p class="text-sm">正在生成建议...</p>
              </div>
            </div>

            <!-- 底部操作 -->
            <div class="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
              <div class="grid grid-cols-2 gap-3">
                <button 
                  class="px-4 py-3 rounded-xl text-sm font-medium transition-all bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2"
                  @click="handleDismiss"
                >
                  <span>⏭️</span>
                  再给点时间
                </button>
                <button 
                  class="px-4 py-3 rounded-xl text-sm font-medium transition-all text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-95"
                  :style="{ 
                    background: `linear-gradient(135deg, ${currentTopic.color} 0%, ${currentTopic.color}dd 100%)`
                  }"
                  @click="handleRefresh"
                >
                  <span>🎲</span>
                  换个话题方向
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
