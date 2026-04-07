// Predefined avatars stored on Cloudflare
// Using placeholder URLs - replace with actual Cloudflare URLs

export interface Avatar {
  id: string
  name: string
  category: 'animals' | 'robots' | 'monsters' | 'characters'
  url: string
}

// Using DiceBear API for avatars (can be replaced with Cloudflare URLs)
const AVATAR_BASE = 'https://api.dicebear.com/7.x'

export const avatars: Avatar[] = [
  // Animals
  { id: 'animal-1', name: 'Leon', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=lion&backgroundColor=ffdfbf` },
  { id: 'animal-2', name: 'Panda', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=panda&backgroundColor=d1d4f9` },
  { id: 'animal-3', name: 'Tigre', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=tiger&backgroundColor=ffd5dc` },
  { id: 'animal-4', name: 'Oso', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=bear&backgroundColor=c0aede` },
  { id: 'animal-5', name: 'Zorro', category: 'animals', url: `${AVATAR_BASE}/thumbs/svg?seed=fox&backgroundColor=b6e3f4` },
  
  // Robots
  { id: 'robot-1', name: 'Robo-1', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot1&backgroundColor=b6e3f4` },
  { id: 'robot-2', name: 'Robo-2', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot2&backgroundColor=c0aede` },
  { id: 'robot-3', name: 'Robo-3', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot3&backgroundColor=ffd5dc` },
  { id: 'robot-4', name: 'Robo-4', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot4&backgroundColor=d1d4f9` },
  { id: 'robot-5', name: 'Robo-5', category: 'robots', url: `${AVATAR_BASE}/bottts/svg?seed=robot5&backgroundColor=ffdfbf` },
  
  // Monsters
  { id: 'monster-1', name: 'Monstruo Azul', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster1&backgroundColor=b6e3f4` },
  { id: 'monster-2', name: 'Monstruo Verde', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster2&backgroundColor=c0aede` },
  { id: 'monster-3', name: 'Monstruo Rosa', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster3&backgroundColor=ffd5dc` },
  { id: 'monster-4', name: 'Monstruo Morado', category: 'monsters', url: `${AVATAR_BASE}/fun-emoji/svg?seed=monster4&backgroundColor=d1d4f9` },
  
  // Characters
  { id: 'char-1', name: 'Aventurero', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char1&backgroundColor=ffdfbf` },
  { id: 'char-2', name: 'Explorador', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char2&backgroundColor=b6e3f4` },
  { id: 'char-3', name: 'Astronauta', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char3&backgroundColor=c0aede` },
  { id: 'char-4', name: 'Ninja', category: 'characters', url: `${AVATAR_BASE}/adventurer/svg?seed=char4&backgroundColor=ffd5dc` },
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
  { id: 'animals', name: 'Animales' },
  { id: 'robots', name: 'Robots' },
  { id: 'monsters', name: 'Monstruos' },
  { id: 'characters', name: 'Personajes' },
] as const
