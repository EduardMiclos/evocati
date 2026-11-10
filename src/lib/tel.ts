// "+40 752 217 745" → "tel:+40752217745"
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`
