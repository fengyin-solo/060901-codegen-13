import type { TopicType } from '@/types'
import { getRandomItem } from '@/utils/helpers'

export interface FollowUp {
  id: string
  type: TopicType
  pattern: string
  category: 'detail' | 'feeling' | 'story' | 'suggestion' | 'relate'
}

export interface FollowUpCategory {
  name: string
  emoji: string
  description: string
}

export const FOLLOWUP_CATEGORIES: Record<FollowUp['category'], FollowUpCategory> = {
  detail: {
    name: '挖细节',
    emoji: '🔍',
    description: '深入了解更多具体信息'
  },
  feeling: {
    name: '聊感受',
    emoji: '💭',
    description: '探索内心真实的情绪'
  },
  story: {
    name: '讲故事',
    emoji: '📖',
    description: '引导分享背后的经历'
  },
  suggestion: {
    name: '出主意',
    emoji: '💡',
    description: '一起想办法解决问题'
  },
  relate: {
    name: '联想法',
    emoji: '🔗',
    description: '用自己的经历拉近关系'
  }
}

const followUpDatabase: FollowUp[] = [
  // trouble - 烦心事
  { id: 't1', type: 'trouble', pattern: '这件事最让你头疼的部分是什么？', category: 'detail' },
  { id: 't2', type: 'trouble', pattern: '你现在心情怎么样？是焦虑更多还是疲惫更多？', category: 'feeling' },
  { id: 't3', type: 'trouble', pattern: '之前有遇到过类似的情况吗？当时是怎么处理的？', category: 'story' },
  { id: 't4', type: 'trouble', pattern: '如果让你把问题拆成三步来解决，第一步会是什么？', category: 'suggestion' },
  { id: 't5', type: 'trouble', pattern: '我之前也遇到过类似的，当时最难受的是...你们呢？', category: 'relate' },
  { id: 't6', type: 'trouble', pattern: '这件事持续多久了？是突然发生的还是慢慢变糟的？', category: 'detail' },
  { id: 't7', type: 'trouble', pattern: '有没有哪个瞬间让你觉得「啊这也太难了」？', category: 'story' },
  { id: 't8', type: 'trouble', pattern: '如果可以和一个人倾诉这件事，你会找谁？', category: 'feeling' },
  { id: 't9', type: 'trouble', pattern: '换个角度想，这个困境有没有让你看到什么之前忽略的东西？', category: 'suggestion' },
  { id: 't10', type: 'trouble', pattern: '大家有没有什么类似的经历可以分享？', category: 'relate' },

  // music - 音乐
  { id: 'm1', type: 'music', pattern: '这首歌是在什么场景下听到的？', category: 'story' },
  { id: 'm2', type: 'music', pattern: '歌词里有没有哪一句特别戳你？', category: 'detail' },
  { id: 'm3', type: 'music', pattern: '听这首歌的时候，你脑海里浮现的画面是什么？', category: 'feeling' },
  { id: 'm4', type: 'music', pattern: '如果把这首歌推荐给一个人，你会推荐给谁？为什么？', category: 'relate' },
  { id: 'm5', type: 'music', pattern: '有没有尝试过跟着唱？哪个部分最难唱？', category: 'story' },
  { id: 'm6', type: 'music', pattern: '这首歌的旋律、歌词、编曲，哪一部分最打动你？', category: 'detail' },
  { id: 'm7', type: 'music', pattern: '这首歌让你想起了哪段时光？', category: 'feeling' },
  { id: 'm8', type: 'music', pattern: '要不要现在一起搜出来听听？', category: 'suggestion' },
  { id: 'm9', type: 'music', pattern: '有没有和这首歌相关的趣事？', category: 'story' },
  { id: 'm10', type: 'music', pattern: '除了这首，还有没有同一类型的歌可以推荐？', category: 'relate' },

  // gossip - 八卦
  { id: 'g1', type: 'gossip', pattern: '后来呢？后续发展怎么样了？', category: 'detail' },
  { id: 'g2', type: 'gossip', pattern: '你当时听到这个消息的第一反应是什么？', category: 'feeling' },
  { id: 'g3', type: 'gossip', pattern: '有没有亲眼见证过这个瓜的某个瞬间？', category: 'story' },
  { id: 'g4', type: 'gossip', pattern: '如果让你给这个瓜起个热搜标题，会叫什么？', category: 'suggestion' },
  { id: 'g5', type: 'gossip', pattern: '大家有没有吃过什么类似的瓜？', category: 'relate' },
  { id: 'g6', type: 'gossip', pattern: '最离谱的细节是什么？', category: 'detail' },
  { id: 'g7', type: 'gossip', pattern: '你觉得当事人当时在想什么？', category: 'feeling' },
  { id: 'g8', type: 'gossip', pattern: '有没有哪个转折是你完全没想到的？', category: 'story' },
  { id: 'g9', type: 'gossip', pattern: '如果拍个剧，你觉得谁适合演主角？', category: 'suggestion' },
  { id: 'g10', type: 'gossip', pattern: '快说快说！还有什么我们不知道的内幕？', category: 'relate' },

  // recommend - 求推荐
  { id: 'r1', type: 'recommend', pattern: '具体是哪里打动了你？给它打几分？', category: 'detail' },
  { id: 'r2', type: 'recommend', pattern: '体验完之后最大的感受是什么？', category: 'feeling' },
  { id: 'r3', type: 'recommend', pattern: '是怎么发现这个宝藏的？背后有什么故事吗？', category: 'story' },
  { id: 'r4', type: 'recommend', pattern: '如果只能选一个最推荐的点，会是哪个？', category: 'suggestion' },
  { id: 'r5', type: 'recommend', pattern: '有没有类似的也可以一起推荐？', category: 'relate' },
  { id: 'r6', type: 'recommend', pattern: '有什么需要注意的避雷点吗？', category: 'detail' },
  { id: 'r7', type: 'recommend', pattern: '第一次体验的时候是什么心情？', category: 'feeling' },
  { id: 'r8', type: 'recommend', pattern: '是和谁一起发现这个的吗？', category: 'story' },
  { id: 'r9', type: 'recommend', pattern: '你一般在什么场景下会推荐这个？', category: 'suggestion' },
  { id: 'r10', type: 'recommend', pattern: '大家有没有用过类似的？可以一起聊聊对比！', category: 'relate' },

  // deep - 深度
  { id: 'd1', type: 'deep', pattern: '这个想法是什么时候出现在你脑海里的？', category: 'detail' },
  { id: 'd2', type: 'deep', pattern: '想到这些的时候，内心是什么样的感受？', category: 'feeling' },
  { id: 'd3', type: 'deep', pattern: '有没有某件事让你产生了这样的思考？', category: 'story' },
  { id: 'd4', type: 'deep', pattern: '如果给过去的自己说一句话关于这个话题，会说什么？', category: 'suggestion' },
  { id: 'd5', type: 'deep', pattern: '我也经常想这个问题...你们觉得呢？', category: 'relate' },
  { id: 'd6', type: 'deep', pattern: '你觉得这个问题有标准答案吗？', category: 'detail' },
  { id: 'd7', type: 'deep', pattern: '有没有人和你观点完全不同？你是怎么看待的？', category: 'feeling' },
  { id: 'd8', type: 'deep', pattern: '如果明天就是生命的最后一天，这个问题的答案会变吗？', category: 'story' },
  { id: 'd9', type: 'deep', pattern: '假设现在有个时光机，你想回到哪个时刻改变和这个话题有关的事情？', category: 'suggestion' },
  { id: 'd10', type: 'deep', pattern: '大家对这个话题有什么不同的视角？', category: 'relate' },

  // silly - 脑洞
  { id: 's1', type: 'silly', pattern: '如果真的发生了，你第一个反应会是什么？', category: 'feeling' },
  { id: 's2', type: 'silly', pattern: '展开说说！你脑海里的画面是什么样的？', category: 'detail' },
  { id: 's3', type: 'silly', pattern: '有没有做过类似的奇葩梦？', category: 'story' },
  { id: 's4', type: 'silly', pattern: '如果让你给这个设定写个结局，会怎么写？', category: 'suggestion' },
  { id: 's5', type: 'silly', pattern: '哈哈哈哈我也想过这个！你们还想过什么离谱的？', category: 'relate' },
  { id: 's6', type: 'silly', pattern: '最搞笑的版本会是什么样的？', category: 'detail' },
  { id: 's7', type: 'silly', pattern: '这种情况下，你觉得我们在场的谁会最先崩溃？', category: 'feeling' },
  { id: 's8', type: 'silly', pattern: '如果拍个短视频记录这个场景，BGM用什么？', category: 'story' },
  { id: 's9', type: 'silly', pattern: '要不要每人给这个脑洞加一个设定？', category: 'suggestion' },
  { id: 's10', type: 'silly', pattern: '快！一人说一个更离谱的脑洞！', category: 'relate' }
]

const genericFollowUps: Omit<FollowUp, 'type'>[] = [
  { id: 'x1', pattern: '然后呢？我想听更多！', category: 'detail' },
  { id: 'x2', pattern: '你当时的表情一定很精彩吧哈哈', category: 'feeling' },
  { id: 'x3', pattern: '这让我想起了一件事...', category: 'relate' },
  { id: 'x4', pattern: '如果让你用三个词形容这件事，会是什么？', category: 'detail' },
  { id: 'x5', pattern: '有没有想过如果当初换个选择会怎样？', category: 'story' },
  { id: 'x6', pattern: '大家听了有什么想说的吗？', category: 'relate' },
  { id: 'x7', pattern: '最意外的部分是什么？', category: 'detail' },
  { id: 'x8', pattern: '这件事之后你有什么变化吗？', category: 'feeling' },
  { id: 'x9', pattern: '要不要来个小投票？大家觉得呢？', category: 'suggestion' },
  { id: 'x10', pattern: '继续说！别停！我们都在听～', category: 'detail' }
]

export function getFollowUpsByType(type: TopicType): FollowUp[] {
  return followUpDatabase.filter(f => f.type === type)
}

export function getRandomFollowUp(type: TopicType): FollowUp {
  const typeSpecific = getFollowUpsByType(type)
  const shouldUseGeneric = Math.random() < 0.3
  if (shouldUseGeneric) {
    const generic = getRandomItem(genericFollowUps)
    return { ...generic, type }
  }
  return getRandomItem(typeSpecific)
}

export function getMultipleFollowUps(type: TopicType, count: number = 3): FollowUp[] {
  const typeSpecific = getFollowUpsByType(type)
  const shuffledType = [...typeSpecific].sort(() => Math.random() - 0.5)
  const results: FollowUp[] = []
  
  for (let i = 0; i < Math.min(count, shuffledType.length); i++) {
    results.push(shuffledType[i])
  }
  
  if (results.length < count) {
    const genericShuffled = [...genericFollowUps].sort(() => Math.random() - 0.5)
    const remaining = count - results.length
    for (let i = 0; i < remaining && i < genericShuffled.length; i++) {
      results.push({ ...genericShuffled[i], type })
    }
  }
  
  return results
}

export function formatFollowUpWithName(followUp: FollowUp, playerName: string): string {
  const pattern = followUp.pattern
  if (pattern.startsWith('我') || pattern.startsWith('大家') || pattern.startsWith('快') || pattern.startsWith('继续')) {
    return pattern
  }
  return `${playerName}，${pattern.charAt(0).toLowerCase()}${pattern.slice(1)}`
}
