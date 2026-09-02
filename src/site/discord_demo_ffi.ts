export const defaultAvatarIndex = (id: string) => Number((BigInt(id) >> BigInt(22)) % BigInt(6));
