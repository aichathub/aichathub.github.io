export function generateColor(username: string): string {
  // Use a hash function (such as SHA-256) on the username to generate a unique value
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return h;
  };

  const hashValue = hash(username);

  // Map the hash value to an RGB color by masking the bits and shifting them
  const red = (hashValue & 0xFF0000) >> 16;
  const green = (hashValue & 0x00FF00) >> 8;
  const blue = hashValue & 0x0000FF;

  // Return the color as a string in hexadecimal format
  return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
}