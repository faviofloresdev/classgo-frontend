// Predefined avatars stored on Cloudflare
// Using placeholder URLs - replace with actual Cloudflare URLs

export interface Avatar {
  id: string
  name: string
  category: 'animals' | 'robots' | 'monsters' | 'characters' | 'croodles' | 'dylan'
  url: string
}

// Using DiceBear API for avatars (can be replaced with Cloudflare URLs)
const AVATAR_BASE = 'https://api.dicebear.com/7.x'

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

export const getAvatarById = (id: string): Avatar | undefined => {
  return avatars.find(a => a.id === id)
}

export const getAvatarUrl = (id: string): string => {
  const avatar = getAvatarById(id)
  return avatar?.url || avatars[0].url
}

export const getAvatarsByCategory = (category: Avatar['category']): Avatar[] => {
  return avatars.filter(a => a.category === category)
}

export const avatarCategories = [
  { id: 'animals', name: 'Thumbs' },
  { id: 'robots', name: 'Robots' },
  { id: 'monsters', name: 'Fun Emoji' },
  { id: 'characters', name: 'Personajes' },
  { id: 'croodles', name: 'Croodles' },
  { id: 'dylan', name: 'Dylan' },
] as const
