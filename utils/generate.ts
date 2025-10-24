export const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`


export const generateColorIndex = (seed: string) => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash)
      hash |= 0
    }
    return Math.abs(hash) % 10
  }