import type { TopicTemplate, TopicType } from '@/types'
import { defaultTopics } from './default'
import { deepTopics } from './deep'
import { sillyTopics } from './silly'
import { 
  getFollowUpsByType, 
  getRandomFollowUp, 
  getMultipleFollowUps,
  formatFollowUpWithName,
  FOLLOWUP_CATEGORIES 
} from './followUps'
import type { FollowUp, FollowUpCategory } from './followUps'

export const allTopics: TopicTemplate[] = [
  ...defaultTopics,
  deepTopics,
  sillyTopics
]

export function getTopicTemplate(type: TopicType): TopicTemplate | undefined {
  return allTopics.find(t => t.type === type)
}

export function getRandomQuestion(type: TopicType): string | undefined {
  const template = getTopicTemplate(type)
  if (!template || template.questions.length === 0) return undefined
  return template.questions[Math.floor(Math.random() * template.questions.length)]
}

export function getRandomBackupQuestion(): string {
  const allQuestions = allTopics.flatMap(t => t.questions)
  return allQuestions[Math.floor(Math.random() * allQuestions.length)]
}

export * from './default'
export * from './deep'
export * from './silly'
export * from './followUps'

export {
  getFollowUpsByType,
  getRandomFollowUp,
  getMultipleFollowUps,
  formatFollowUpWithName,
  FOLLOWUP_CATEGORIES
}

export type {
  FollowUp,
  FollowUpCategory
}
