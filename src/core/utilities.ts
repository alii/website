export function toBackground(url: string) {
  return `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url(${url}) no-repeat center center fixed`;
}

export function useReadingTime(content: string, wordsPerMinute = 260) {
  const match = content.match(/\w+/g) ?? [];
  return Math.ceil(match.length / wordsPerMinute);
}
