export const dateDiffInDays = (a: Date, b: Date) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

export const convertContentToPythonCode = (content: string) => {
  if (content.startsWith("```python\n")) {
    content = content.slice("```python\n".length);
  }
  if (content.endsWith("\n```")) {
    content = content.slice(0, -"\n```".length);
  }
  return content;
};
