// import { strict as assert } from "assert";
import { logger } from "./logger";

const debug = logger.debug.bind(logger);

function sanitizePath(path?: string) {
  if ([...path].some((c) => c.charCodeAt(0) > 127)) {
    throw new Error("The path to VOICEROID directory may not contain any non-ascii character.");
  }
  if (path.endsWith("\\")) {
    return path.slice(0, path.length - 1);
  }
  return path;
}

function guessVersion(name?: string) {
  if (name.endsWith("_22")) {
    return "VOICEROID+";
  }
  if (name.endsWith("_44")) {
    return "VOICEROID2";
  }
  throw new Error(
    "Could not infer VOICEROID version. Make sure the given voice directory name is appropriate."
  );
}

function sanitizeName(name?: string) {
  if (name.endsWith("_22")) {
    const supports = ["kiritan", "zunko", "akane", "aoi"];
    if (supports.some((s) => name.startsWith(s))) {
      return name;
    }
    const names = supports.join('", "');
    throw new Error(
      `An unsopported VOICEROID+ library was given.\nEbyroid currently supports "${names}".\nWant your favorite library to get supported? Please open an issue or make a pull request!`
    );
  } else if (name.endsWith("_44")) {
    return name;
  } else {
    throw new Error("unreachable");
  }
}

function sanitizeVolume(volume?: number) {
  if (typeof volume === "undefined") {
    return 2.2;
  }
  if (typeof volume === "number" && volume <= 5.0 && volume >= 0.0) {
    return volume;
  }
  throw new RangeError("options.volume should range from 0.0 to 5.0");
}

function sanitizeSampleRate(
  sampleRate?: VoiceOption["sampleRate"],
  version?: Config["version"]
): 22050 | 44100 {
  if (typeof sampleRate === "undefined") {
    return version === "VOICEROID+" ? 22050 : 44100;
  }
  if (typeof sampleRate === "number" && [22050, 44100, 48000].includes(sampleRate)) {
    return sampleRate as 22050 | 44100;
  }
  throw new TypeError("options.sampleRate should be one of 22050, 44100 or 48000");
}

function sanitizeChannels(channels?: VoiceOption["channels"]) {
  if (typeof channels === "undefined") {
    return 1;
  }
  if (typeof channels === "number" && (channels === 1 || channels === 2)) {
    return channels;
  }
  throw new TypeError("options.channels should be 1 or 2");
}

/**
 * Configurative options for a Voiceroid.
 * Note another variety of these values never affects Ebyroid on decision of exclusive reloading of voice libraries.
 *
 * @typedef VoiceroidOptions
 * @type {object}
 * @property {number} [volume=2.2]
 * @property {(22050|44100|48000)} [sampleRate=(22050|44100)]
 * @property {(1|2)} [channels=1]
 */
export interface VoiceOption {
  /**
   * desired output volume (from 0.0 to 5.0) with 2.2 recommended.
   * @default 2.2
   */
  volume?: number;
  speed?: number;
  pitch?: number;
  range?: number;
  /**
   * desired sample-rate of output PCM.
   * VOICEROID+ defaults to 22050, and VOICEROID2 does to 44100.
   * if a higher rate than default is given, Ebyroid will resample (upconvert) it to the rate.
   */
  sampleRate?: 2050 | 44100 | 48000;
  /**
   * desired number of channels of output PCM.
   * 1 stands for Mono, and 2 does for Stereo.
   * since VOICEROID's output is always Mono, Ebyroid will manually interleave it when you set channels to 2.
   */
  channels?: 1 | 2;
}
/**
 * Voiceroid data class contains necessary information to load the native library.
 * Note another the name identitier and optional settings never affect Ebyroid on its determination of whether to reload native libraries or not whereas the other params do.
 */
export class Config {
  /**
   * the version of the library
   */
  version: "VOICEROID+" | "VOICEROID2";
  volume: number;
  speed: number;
  pitch: number;
  range: number;
  sampleRate: 22050 | 44100;
  shannels: number;
  baseSampleRate: 22050 | 44100;
  /**
   * Construct a Voiceroid data object.
   *
   * @param {string} name an unique, identifiable name for this object.
   * @param {string} baseDirPath a path in which your VOICEROID's `.exe` is installed.
   * @param {string} voiceDirName a voice library dir, like `zunko_22` or `yukari_44`.
   * @param {VoiceroidOptions} [options={}] optional settings for this voiceroid.
   * @example
   * const yukari = new Config('Yukari-chan', 'C:\\Program Files (x86)\\AHS\\VOICEROID2', 'yukari_44');
   * const kiritan = new Config('Kiritan-chan', 'C:\\Program Files (x86)\\AHS\\VOICEROID+\\KiritanEX', 'kiritan_22');
   * const ebyroid = new Ebyroid(yukari, kiritan);
   * ebyroid.use('Yukari-chan');
   */
  constructor(
    /**
     * the identifier of this object. {@link Ebyroid.use} takes this value as an argument.
     */
    public name: string,
    /**
     * the path in which `VOICEROID.exe` or `VoiceroidEditor.exe` is installed
     */
    public baseDirPath: string,
    /**
     * the name of the directory where the voice library files are installed
     */
    public voiceDirName: string,
    options: VoiceOption = {}
  ) {
    // assert(typeof name === "string" && name.length > 0);
    // assert(typeof baseDirPath === "string" && baseDirPath.length > 0);
    // assert(typeof voiceDirName === "string" && voiceDirName.length > 0);
    // assert(typeof options === "object");
    debug("name=%s path=%s voice=%s options=%o", name, baseDirPath, voiceDirName, options);

    this.name = name;

    this.baseDirPath = sanitizePath(baseDirPath);

    this.version = guessVersion(voiceDirName);

    this.voiceDirName = sanitizeName(voiceDirName);

    /**
     * desired output volume
     * @type {number}
     * @readonly
     */
    this.volume = sanitizeVolume(options.volume);
    /**
     * desired output volume
     * @type {number}
     * @readonly
     */
    this.speed = options.speed || 1.0;
    /**
     * desired output volume
     * @type {number}
     * @readonly
     */
    this.pitch = options.pitch || 1.0;
    /**
     * desired output volume
     * @type {number}
     * @readonly
     */
    this.range = options.range || 1.0;

    /**
     * desired sample-rate of output PCM
     * @type {22050|44100|48000}
     * @readonly
     */
    this.sampleRate = sanitizeSampleRate(options.sampleRate, this.version);

    /**
     * desired number of channels of output PCM
     * @type {1|2}
     * @readonly
     */
    this.shannels = sanitizeChannels(options.channels);

    /**
     * the library's output sample-rate in Hz
     * @type {22050|44100}
     * @readonly
     */
    this.baseSampleRate = this.version === "VOICEROID+" ? 22050 : 44100;

    debug("setup voiceroid object", this);
  }

  /**
   * Examine the equality.
   *
   * @param another the object another this instance examines equality with.
   * @returns
   */
  equals(another?: Config) {
    if (!another || !(another instanceof Config)) {
      return false;
    }
    return (
      this.name === another.name &&
      this.version === another.version &&
      this.baseDirPath === another.baseDirPath &&
      this.voiceDirName === another.voiceDirName &&
      this.volume === another.volume &&
      this.sampleRate === another.sampleRate &&
      this.shannels === another.shannels
    );
  }

  /**
   * Check if this and another are using same native library.
   *
   * @param {Config} another the object another this instance examines equality with.
   * @returns {boolean}
   */
  usesSameLibrary(another?: Config) {
    if (!(another instanceof Config)) {
      return false;
    }
    return this.baseDirPath === another.baseDirPath && this.voiceDirName === another.voiceDirName;
  }
}
