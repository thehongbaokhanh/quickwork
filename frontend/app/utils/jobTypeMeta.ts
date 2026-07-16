export type JobTypeMeta = {
  icon: string
  background: string
  text: string
  border: string
}

export function getJobTypeMeta(type: string): JobTypeMeta {
  const normalized = type.toLowerCase()

  if (normalized.includes('bán thời gian') || normalized.includes('part') || normalized.includes('freelance')) {
    return {
      icon: 'uil:clock',
      background: '#F3E8FF',
      text: '#7E22CE',
      border: '#D8B4FE'
    }
  }

  if (normalized.includes('thực tập') || normalized.includes('intern')) {
    return {
      icon: 'uil:graduation-cap',
      background: '#FEF3C7',
      text: '#B45309',
      border: '#FCD34D'
    }
  }

  if (normalized.includes('remote')) {
    return {
      icon: 'uil:laptop',
      background: '#D1FAE5',
      text: '#047857',
      border: '#6EE7B7'
    }
  }

  return {
    icon: 'uil:briefcase-alt',
    background: '#E0F2FE',
    text: '#0369A1',
    border: '#7DD3FC'
  }
}
