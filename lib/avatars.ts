import type { AvatarId } from "./types"

export interface Avatar {
  id: AvatarId
  name: string
  category: 'animals' | 'robots' | 'monsters' | 'characters' | 'croodles' | 'dylan'
  url: string
}

const AVATAR_BASE = 'https://api.dicebear.com/7.x'
const DICEBEAR_V9 = 'https://api.dicebear.com/9.x'
const DEFAULT_AVATAR_ID: AvatarId = 'animal-1'

function buildSvgDataUrl(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function buildParentAvatarUrl() {
  return buildSvgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Parent avatar">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef3c7" />
          <stop offset="100%" stop-color="#dbeafe" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="32" fill="url(#bg)" />
      <circle cx="64" cy="42" r="22" fill="#f59e0b" />
      <path d="M40 40c2-14 13-24 25-24 11 0 22 7 25 19-4-2-9-3-14-3-7 0-14 2-19 6-5 3-11 4-17 2z" fill="#7c2d12" />
      <circle cx="56" cy="45" r="2.5" fill="#1f2937" />
      <circle cx="72" cy="45" r="2.5" fill="#1f2937" />
      <path d="M56 55c4 4 12 4 16 0" fill="none" stroke="#1f2937" stroke-linecap="round" stroke-width="2.5" />
      <path d="M28 108c0-20 16-36 36-36s36 16 36 36" fill="#fb923c" opacity="0.95" />
      <circle cx="95" cy="32" r="10" fill="#ffffff" opacity="0.85" />
      <path d="M95 26v12M89 32h12" stroke="#f59e0b" stroke-linecap="round" stroke-width="3" />
    </svg>
  `)
}

function buildFallbackAvatarUrl(avatarId: AvatarId) {
  return `${DICEBEAR_V9}/adventurer/svg?seed=${encodeURIComponent(avatarId)}&backgroundColor=b6e3f4,c7f0d8,d1d4f9,ffd5dc,ffdfbf`
}

export const avatars: Avatar[] = [
  // Thumbs
  { id: 'animal-1', name: 'Thumb Sun', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=lion&backgroundColor=ffdfbf` },
  { id: 'animal-2', name: 'Thumb Cloud', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=panda&backgroundColor=d1d4f9` },
  { id: 'animal-3', name: 'Thumb Pop', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=tiger&backgroundColor=ffd5dc` },
  { id: 'animal-4', name: 'Thumb Plum', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=bear&backgroundColor=c0aede` },
  { id: 'animal-5', name: 'Thumb Wave', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=fox&backgroundColor=b6e3f4` },
  { id: 'animal-6', name: 'Thumb Mint', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=koala&backgroundColor=c7f0d8` },
  { id: 'animal-7', name: 'Thumb Coral', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=otter&backgroundColor=fcc5c0` },
  { id: 'animal-8', name: 'Thumb Night', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=wolf&backgroundColor=d9d7f1` },
  
  // Robots
  { id: 'robot-1', name: 'Robo-1', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot1&backgroundColor=b6e3f4` },
  { id: 'robot-2', name: 'Robo-2', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot2&backgroundColor=c0aede` },
  { id: 'robot-3', name: 'Robo-3', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot3&backgroundColor=ffd5dc` },
  { id: 'robot-4', name: 'Robo-4', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot4&backgroundColor=d1d4f9` },
  { id: 'robot-5', name: 'Robo-5', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot5&backgroundColor=ffdfbf` },
  { id: 'robot-6', name: 'Robo-6', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot6&backgroundColor=c7f0d8` },
  { id: 'robot-7', name: 'Robo-7', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot7&backgroundColor=fcc5c0` },
  { id: 'robot-8', name: 'Robo-8', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot8&backgroundColor=d9d7f1` },
  
  // Fun Emoji
  { id: 'monster-1', name: 'Emoji Blue', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster1&backgroundColor=b6e3f4` },
  { id: 'monster-2', name: 'Emoji Green', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster2&backgroundColor=c0aede` },
  { id: 'monster-3', name: 'Emoji Pink', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster3&backgroundColor=ffd5dc` },
  { id: 'monster-4', name: 'Emoji Violet', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster4&backgroundColor=d1d4f9` },
  { id: 'monster-5', name: 'Emoji Sun', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster5&backgroundColor=ffdfbf` },
  { id: 'monster-6', name: 'Emoji Mint', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster6&backgroundColor=c7f0d8` },
  { id: 'monster-7', name: 'Emoji Coral', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster7&backgroundColor=fcc5c0` },
  
  // Characters
  { id: 'char-1', name: 'Aventurero', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char1&backgroundColor=ffdfbf` },
  { id: 'char-2', name: 'Explorador', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char2&backgroundColor=b6e3f4` },
  { id: 'char-3', name: 'Astronauta', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char3&backgroundColor=c0aede` },
  { id: 'char-4', name: 'Ninja', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char4&backgroundColor=ffd5dc` },
  { id: 'char-5', name: 'Voyager', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char5&backgroundColor=d1d4f9` },
  { id: 'char-6', name: 'Ranger', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char6&backgroundColor=c7f0d8` },
  { id: 'char-7', name: 'Blaze', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char7&backgroundColor=fcc5c0` },
  { id: 'parent-1', name: 'Parent Ally', category: 'characters', url: buildParentAvatarUrl() },

  // Croodles
  { id: 'croodles-1', name: 'Croodles Sun', category: 'croodles', url: `${AVATAR_BASE}/croodles/svg?seed=croodles1&backgroundColor=ffdfbf` },
  { id: 'croodles-2', name: 'Croodles Wave', category: 'croodles', url: `${AVATAR_BASE}/croodles/svg?seed=croodles2&backgroundColor=b6e3f4` },
  { id: 'croodles-3', name: 'Croodles Mint', category: 'croodles', url: `${AVATAR_BASE}/croodles/svg?seed=croodles3&backgroundColor=c0aede` },
  { id: 'croodles-4', name: 'Croodles Pop', category: 'croodles', url: `${AVATAR_BASE}/croodles/svg?seed=croodles4&backgroundColor=ffd5dc` },
  { id: 'croodles-5', name: 'Croodles Coral', category: 'croodles', url: `${AVATAR_BASE}/croodles/svg?seed=croodles5&backgroundColor=fcc5c0` },
  { id: 'croodles-6', name: 'Croodles Sky', category: 'croodles', url: `${AVATAR_BASE}/croodles/svg?seed=croodles6&backgroundColor=d1d4f9` },
  { id: 'croodles-7', name: 'Croodles Leaf', category: 'croodles', url: `${AVATAR_BASE}/croodles/svg?seed=croodles7&backgroundColor=c7f0d8` },

  // Dylan
  { id: 'dylan-1', name: 'Dylan Sky', category: 'dylan', url: `https://api.dicebear.com/9.x/dylan/svg?seed=dylan1&backgroundColor=b6e3f4` },
  { id: 'dylan-2', name: 'Dylan Peach', category: 'dylan', url: `https://api.dicebear.com/9.x/dylan/svg?seed=dylan2&backgroundColor=ffdfbf` },
  { id: 'dylan-3', name: 'Dylan Plum', category: 'dylan', url: `https://api.dicebear.com/9.x/dylan/svg?seed=dylan3&backgroundColor=c0aede` },
  { id: 'dylan-4', name: 'Dylan Rose', category: 'dylan', url: `https://api.dicebear.com/9.x/dylan/svg?seed=dylan4&backgroundColor=ffd5dc` },
  { id: 'dylan-5', name: 'Dylan Mint', category: 'dylan', url: `https://api.dicebear.com/9.x/dylan/svg?seed=dylan5&backgroundColor=c7f0d8` },
  { id: 'dylan-6', name: 'Dylan Coral', category: 'dylan', url: `https://api.dicebear.com/9.x/dylan/svg?seed=dylan6&backgroundColor=fcc5c0` },
  { id: 'dylan-7', name: 'Dylan Night', category: 'dylan', url: `https://api.dicebear.com/9.x/dylan/svg?seed=dylan7&backgroundColor=d9d7f1` },
]

export const getAvatarById = (id: AvatarId): Avatar | undefined => {
  return avatars.find(a => a.id === id)
}

export const buildAvatarUrl = (id: AvatarId): string => {
  const avatar = getAvatarById(id)
  return avatar?.url || buildFallbackAvatarUrl(id || DEFAULT_AVATAR_ID)
}

export const getAvatarUrl = buildAvatarUrl

export const getAvatarsByCategory = (category: Avatar['category']): Avatar[] => {
  return avatars.filter(a => a.category === category)
}

export function buildParentLinkedAvatarUrls(studentAvatarId: AvatarId, parentAvatarId?: AvatarId) {
  return {
    studentAvatarUrl: buildAvatarUrl(studentAvatarId || DEFAULT_AVATAR_ID),
    parentAvatarUrl: buildAvatarUrl(parentAvatarId || "parent-1"),
  }
}

export const avatarCategories = [
  { id: 'animals', name: 'Thumbs' },
  { id: 'robots', name: 'Robots' },
  { id: 'monsters', name: 'Fun Emoji' },
  { id: 'characters', name: 'Personajes' },
  { id: 'croodles', name: 'Croodles' },
  { id: 'dylan', name: 'Dylan' },
] as const
