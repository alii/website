export const innerHtml = (html: string) => ({__html: html});

export const style = (entries: [string, string][]) => Object.fromEntries(entries);
