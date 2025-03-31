export const convertToMono = (
  audioContext: AudioContext,
  audioBuffer: AudioBuffer
): AudioBuffer => {
  const monoBuffer = audioContext.createBuffer(
    1,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  const monoData = monoBuffer.getChannelData(0);
  const numChannels = audioBuffer.numberOfChannels;

  for (let i = 0; i < audioBuffer.length; i++) {
    let sum = 0;
    for (let channel = 0; channel < numChannels; channel++) {
      sum += audioBuffer.getChannelData(channel)[i];
    }
    monoData[i] = sum / numChannels;
  }
  return monoBuffer;
};

export const createAudioChunks = (
  audioContext: AudioContext,
  audioBuffer: AudioBuffer,
  chunkDuration: number,
  overlapDuration: number
): AudioBuffer[] => {
  if (overlapDuration >= chunkDuration) {
    throw new Error("Overlap duration must be smaller than chunk duration");
  }

  const chunks: AudioBuffer[] = [];
  const sampleRate = audioBuffer.sampleRate;
  const totalSamples = audioBuffer.length;

  const chunkSize = chunkDuration * sampleRate;
  const overlapSize = overlapDuration * sampleRate;
  const stepSize = chunkSize - overlapSize;

  for (let start = 0; start < totalSamples; start += stepSize) {
    const end = Math.min(start + chunkSize, totalSamples);
    const chunk = audioContext.createBuffer(1, end - start, sampleRate);
    const chunkData = chunk.getChannelData(0);
    const originalData = audioBuffer.getChannelData(0);

    for (let i = start; i < end; i++) {
      chunkData[i - start] = originalData[i];
    }

    chunks.push(chunk);
  }

  return chunks;
};

export const resampleAndConvertToInt16 = (
  audioBuffer: AudioBuffer
): Int16Array => {
  const targetSampleRate = 16000;
  const originalSampleRate = audioBuffer.sampleRate;
  const audioData = audioBuffer.getChannelData(0);

  const ratio = targetSampleRate / originalSampleRate;
  const newLength = Math.round(audioData.length * ratio);
  const resampledData = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const index = Math.round(i / ratio);
    resampledData[i] = audioData[Math.min(index, audioData.length - 1)];
  }

  const int16Array = new Int16Array(newLength);
  for (let i = 0; i < newLength; i++) {
    int16Array[i] = Math.max(-32768, Math.min(32767, resampledData[i] * 32768));
  }

  return int16Array;
};

export const base64ToAudioURL = (base64: string): string => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length)
    .fill(0)
    .map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "audio/wav" });

  return URL.createObjectURL(blob);
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(reader.result?.toString().split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const saveBlobToFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};



