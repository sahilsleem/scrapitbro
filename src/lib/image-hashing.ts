export async function computeFileHash(fileOrBlob: Blob | File | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (fileOrBlob instanceof ArrayBuffer) {
    buffer = fileOrBlob;
  } else {
    buffer = await fileOrBlob.arrayBuffer();
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
