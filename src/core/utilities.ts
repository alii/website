export function toBackground(url: string) {
  return `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url(${url}) no-repeat center center`;
}
