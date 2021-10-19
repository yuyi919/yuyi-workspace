/* eslint-disable @typescript-eslint/no-explicit-any */
import { strict as assert } from "assert";
import { logger } from "./logger";
import * as iconv from "iconv-lite";
import { Semaphore } from "./semaphore";
import { WaveObject } from "./wave";
import { Config, VoiceOption } from "./voiceroid";
import { NativeOptions } from "../dll/ebyroid.node";

const native: typeof import("../dll/ebyroid.node")["default"] = require("../dll/ebyroid.node");

const SHIFT_JIS = "shiftjis";

/**
 * Class-wise global semaphore object.
 * @type {Semaphore}
 */
const semaphore: Semaphore = new Semaphore(2);

const fifo: Config[] = [];

/**
 * The voiceroid that is currently used **in the native library**.
 *
 */
let current: Config = null;

/**
 */
let singleton: Ebyroid = null;

/**
 */
function validateOpCall(self: Ebyroid) {
  assert(self.using !== null, "operation calls must be called after .use()");
  assert(current !== null, "ebyroid native module must have been initialized");
}

function errorroid(vr: Config, err: Error) {
  // FIXME more graceful way to handle errors?
  return Object.assign(Object.create(Object.getPrototypeOf(vr)), vr, {
    baseDirPath: "error",
    voiceDirName: err.message,
  }) as Config;
}

function lastRegistered(): Config | null {
  const vr = fifo[fifo.length - 1];
  return vr || null;
}

function register(vr: Config) {
  fifo.push(vr);
  logger.debug("(registered) fifo = %d", fifo.length);
}

/**
 */
function unregister(vr: Config) {
  assert(vr === fifo[0], "unregisteration is equivalent to fifo.shift()");
  fifo.shift();
  logger.debug("(unregistered) fifo = %d", fifo.length);
}

function needsLibraryReload(vr: Config) {
  const lastreg = lastRegistered();
  const comparison = lastreg || current;
  return !vr.usesSameLibrary(comparison);
}

/**
 * @this Ebyroid
 * @param text
 * @param vr
 */
async function internalConvertF(text: string, vr: Config): Promise<WaveObject> {
  const buffer = iconv.encode(text, SHIFT_JIS);
  await semaphore.acquire();

  assert(vr.usesSameLibrary(current), "it must not need to reload");

  // TODO setup full options here
  const options = {
    needs_reload: false,
    volume: vr.volume,
  };

  return new Promise((resolve, reject) =>
    native.convert(buffer, options, (err, pcmOut) => {
      current = vr;
      semaphore.release();
      if (err) {
        reject(err);
      } else {
        resolve(new WaveObject(pcmOut, vr.sampleRate));
      }
    })
  );
}

/**
 * Ebyroid class provides an access to the native VOICEROID+/VOICEROID2 libraries.
 */
export class Ebyroid {
  voiceroids: Map<string, Config>;
  using: Config;
  /**
   * Construct an Ebyroid instance.
   *
   * @param  {...Voiceroid} voiceroids voiceroids to use.
   */
  constructor(...voiceroids: Config[]) {
    assert(voiceroids.length > 0, "at least one voiceroid must be given");
    logger.verbose("load voiceroids", ...voiceroids.map((o) => o.name));
    /**
     * voiceroids to use.
     *
     * @type {Map<string, Voiceroid>}
     */
    this.voiceroids = new Map();
    voiceroids.forEach((vr) => this.voiceroids.set(vr.name, vr));

    /**
     * the voiceroid currently used **by this instance**.
     *
     * @type {Voiceroid?}
     */
    this.using = null;
  }

  /**
   * Let ebyroid use a specific voiceroid library.
   * Distinctively, this operation may take a few seconds to complete when called first time.
   *
   * @param {string} voiceroidName a name identifier of the voiceroid to use
   * @example
   * const yukari = new Voiceroid('Yukari-chan', 'C:\\Program Files (x86)\\AHS\\VOICEROID2', 'yukari_44');
   * const kiritan = new Voiceroid('Kiritan-chan', 'C:\\Program Files (x86)\\AHS\\VOICEROID+\\KiritanEX', 'kiritan_22');
   * const ebyroid = new Ebyroid(yukari, kiritan);
   * ebyroid.use('Kiritan-chan');
   */
  use(voiceroidName: string) {
    const vr = this.voiceroids.get(voiceroidName);
    if (!vr) {
      throw new Error(`Could not find a voiceroid by name "${voiceroidName}".`);
    }

    if (current === null) {
      logger.info("call init. voiceroid", vr);
      try {
        native.init(
          vr.baseDirPath,
          vr.voiceDirName,
          vr.volume,
          vr.speed,
          vr.pitch,
          vr.range,
          200,
          120,
          80
        );
        logger.info("call init. voiceroid");
      } catch (err) {
        // eslint-disable-next-line no-console
        logger.error("Failed to initialize ebyroid native module", err);
        throw err;
      }
      current = vr;
    }
    logger.debug("use `%s`", vr.name);
    this.using = vr;
  }

  /**
   * Convert text to a PCM buffer.
   * When a voiceroid corresponding to the given voiceroidName uses a different voice library than
   * the one currently used in the native library, it will acquire a mutex lock and reload native library.
   * In which case it may block all of other requests for fair amount of time like a two or three seconds.
   * See {@link Voiceroid} for further details.
   *
   * @param {string} text Raw utf-8 text to convert
   * @param {string} voiceroidName a name identifier of the voiceroid to use
   * @returns {Promise<WaveObject>} object that consists of a raw PCM buffer and format information
   */
  async convertEx(text: string, voiceroidName: string, other?: VoiceOption): Promise<WaveObject> {
    if (this.using === null) {
      // only when a user called this method without calling .use() once
      this.use(voiceroidName);
    }
    validateOpCall(this);

    const vr = this.voiceroids.get(voiceroidName);
    if (!vr) {
      throw new Error(`Could not find a voiceroid by name "${voiceroidName}".`);
    }

    if (!needsLibraryReload(vr)) {
      logger.debug("convertEx() delegates to internalConvertF %s", vr.name);
      return internalConvertF.call(this, text, vr);
    }

    const buffer = iconv.encode(text, SHIFT_JIS);

    logger.debug("register %s", vr.name);
    register(vr);

    logger.debug("waiting for a lock");
    await semaphore.lock();
    logger.debug("got a lock");

    assert(!vr.usesSameLibrary(current), "it must need to reload");
    const filterNumber = (a: any, b: number) => {
      const r = parseFloat(a);
      return Number.isFinite(r) && !Number.isNaN(r) ? r : b;
    };
    const options: NativeOptions = {
      needs_reload: true,
      base_dir: vr.baseDirPath,
      voice: vr.voiceDirName,
      volume: filterNumber(other.volume, vr.volume),
      speed: filterNumber(other.speed, vr.speed),
      pitch: filterNumber(other.pitch, vr.pitch),
      range: filterNumber(other.range, vr.range),
      pause_long: 200,
      pause_middle: 120,
      pause_sentence: 80,
    };
    console.log("convertEx", options);
    return new Promise((resolve, reject) =>
      native.convert(buffer, options, (err, pcmOut) => {
        logger.debug("unregister %s", vr.name);
        unregister(vr);
        if (err) {
          current = errorroid(vr, err);
          reject(err);
          logger.debug("unlock with error %O", err);
          setImmediate(() => semaphore.unlock());
        } else {
          current = vr;
          logger.debug("unlock");
          semaphore.unlock();
          resolve(new WaveObject(pcmOut, vr.sampleRate));
        }
      })
    );
  }

  /**
   * Convert text to a PCM buffer. Prefer using this method whenever you can.
   *
   * @param {string} text Raw utf-8 text to convert
   * @returns {Promise<WaveObject>} object that consists of a raw PCM buffer and format information
   */
  convert(text: string, other?: VoiceOption): Promise<WaveObject> {
    validateOpCall(this);
    if (needsLibraryReload(this.using)) {
      logger.debug("convert() escalates to convertEx()");
      return this.convertEx(text, this.using.name, other);
    }
    return internalConvertF.call(this, text, this.using);
  }

  /**
   * (Not Recommended) Compile text to an certain intermediate representation called 'AI Kana' that VOICEROID uses internally.
   * This method exists only to gratify your curiosity. No other use for it.
   *
   * @param {string} rawText Raw utf-8 text to reinterpret into 'AI Kana' representation
   * @returns {Promise<string>} AI Kana representation of the text
   */
  async rawApiCallTextToKana(rawText: string): Promise<string> {
    validateOpCall(this);
    const buffer = iconv.encode(rawText, SHIFT_JIS);
    await semaphore.acquire();

    return new Promise((resolve, reject) => {
      native.reinterpret(buffer, {}, (err, output) => {
        semaphore.release();
        if (err) {
          reject(err);
        } else {
          const utf8text = iconv.decode(output, SHIFT_JIS);
          resolve(utf8text);
        }
      });
    });
  }

  /**
   * (Not Recommended) Read out the given text __written in an intermediate representation called 'AI Kana'__ that VOICEROID uses internally.
   * This method exists only to gratify your curiosity. No other use for it.
   *
   * @param {string} aiKana AI Kana representation to read out
   * @returns {Promise<WaveObject>} object that consists of a raw PCM buffer and format information
   */
  async rawApiCallAiKanaToSpeech(aiKana: string): Promise<WaveObject> {
    validateOpCall(this);
    const buffer = iconv.encode(aiKana, SHIFT_JIS);
    await semaphore.acquire();

    return new Promise((resolve, reject) => {
      native.speech(buffer, {}, (err, pcmOut) => {
        semaphore.release();
        if (err) {
          reject(err);
        } else {
          resolve(new WaveObject(pcmOut, current.baseSampleRate));
        }
      });
    });
  }

  /**
   * Supportive static method for the case in which you like to use it as singleton.
   *
   * @param instance instance to save as singleton
   */
  static setInstance(instance: Ebyroid) {
    singleton = instance;
  }

  /**
   * Supportive static method for the case in which you like to use it as singleton.
   *
   * @returns the singleton instance (if set)
   */
  static getInstance(): Ebyroid | null {
    return singleton;
  }
}
