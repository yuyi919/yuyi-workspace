import { strict as assert } from "assert";

// byte op helpers
function toUint32LE(uint32: number) {
  const b32 = Buffer.alloc(4);
  b32.writeUInt32LE(uint32, 0);
  return b32;
}

function toSampleRateLE(sampleRateUint32: 22050 | 44100, weight: 1 | 2) {
  const b32 = Buffer.alloc(4);
  b32.writeUInt32LE(sampleRateUint32 * weight, 0);
  return b32;
}

/**
 * Conversion result object that contains a PCM data and format information.
 */
export class WaveObject {
  /**
   * an array of signed 16bit integer values which represents 16bit Linear PCM data
   */
  data: Int16Array;
  /**
   * the bit depth of PCM data. this value is fixed to 16 unless any VOICEROID comes to support 24bit depth someday.
   */
  bitDepth: 8 | 16;
  /**
   * the sample-rate (samples per second) of PCM data. 22050Hz for VOICEROID+ and 44100Hz for VOICEROID2.
   * That's for now. Ebyroid's resampling feature will come soon.
   */
  sampleRate: 22050 | 44100;
  /**
   * the number of channels in PCM data. 1 for Mono, 2 for Stereo. It's fixed to 1 due to VOICEROID's nature.
   * That's for now. Ebyroid soon will provide an option to interleave data into Stereo.
   */
  numChannels: 1 | 2;
  /**
   * @param data 16bit PCM data
   * @param sampleRate sample-rate of the data (Hz)
   */
  constructor(data: Int16Array, sampleRate: 22050 | 44100) {
    this.data = data;
    this.bitDepth = 16;
    this.sampleRate = sampleRate;
    this.numChannels = 1;
  }

  /**
   * @returns the wave file header bytes corresponding to this object
   */
  waveFileHeader(): Buffer {
    const theRIFF = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
    const fileSize = toUint32LE(this.data.byteLength + 36); // 36 = headers(44) - RIFF(4) - this(4)
    const theWAVE = new Uint8Array([0x57, 0x41, 0x56, 0x45]);
    const theFmt = new Uint8Array([0x66, 0x6d, 0x74, 0x20]);
    const fmtSizeLE = new Uint8Array([0x10, 0x00, 0x00, 0x00]);
    const fmtCodeLE = new Uint8Array([0x01, 0x00]);
    const numChannelsLE = new Uint8Array([this.numChannels, 0x00]);
    const sampleRateLE = toSampleRateLE(this.sampleRate, 1);
    const bytesPerSecLE = toSampleRateLE(this.sampleRate, this.numChannels);
    const byteAlignmentLE = new Uint8Array([this.numChannels * 2, 0x00]);
    const bitsPerSampleLE = new Uint8Array([0x10, 0x00]);
    const theData = new Uint8Array([0x64, 0x61, 0x74, 0x61]);
    const dataSize = toUint32LE(this.data.byteLength);
    const header = Buffer.concat([
      theRIFF,
      fileSize,
      theWAVE,
      theFmt,
      fmtSizeLE,
      fmtCodeLE,
      numChannelsLE,
      sampleRateLE,
      bytesPerSecLE,
      byteAlignmentLE,
      bitsPerSampleLE,
      theData,
      dataSize,
    ]);
    assert(header.byteLength === 44, `wave header must have just 44 bytes`);
    return header;
  }

  getBuffer() {
    const dataBuffer = Buffer.from(this.data.buffer);
    const headerBuffer = this.waveFileHeader();
    const waveBuffer = Buffer.concat([headerBuffer, dataBuffer]);
    return waveBuffer;
  }
}
