import { WebAudio, Graphics, Utils } from "../../dom";
import { MZ } from "../../MZ";

//-----------------------------------------------------------------------------
// AudioManager
//
// The static class that handles BGM, BGS, ME and SE.

export class AudioManager {
  static _bgmVolume = 100;
  static _bgsVolume = 100;
  static _meVolume = 100;
  static _seVolume = 100;
  static _currentBgm: MZ.AudioParam | null = null;
  static _currentBgs: MZ.AudioParam | null = null;
  static _currentMe: MZ.AudioParam | null = null;
  static _bgmBuffer: WebAudio | null = null;
  static _bgsBuffer: WebAudio | null = null;
  static _meBuffer: WebAudio | null = null;
  static _seBuffers: Array<WebAudio> = [];
  static _staticBuffers: Array<WebAudio> = [];
  static _replayFadeTime = 0.5;
  static _path = "audio/";

  static get bgmVolume(): number {
    return _this._bgmVolume;
  }
  static set bgmVolume(value: number) {
    _this._bgmVolume = value;
    _this.updateBgmParameters(_this._currentBgm!);
  }

  static get bgsVolume(): number {
    return _this._bgsVolume;
  }
  static set bgsVolume(value: number) {
    _this._bgsVolume = value;
    _this.updateBgsParameters(_this._currentBgs!);
  }

  static get meVolume(): number {
    return _this._meVolume;
  }
  static set meVolume(value: number) {
    _this._meVolume = value;
    _this.updateMeParameters(_this._currentMe!);
  }

  static get seVolume(): number {
    return _this._seVolume;
  }
  static set seVolume(value: number) {
    _this._seVolume = value;
  }

  static playBgm(bgm: MZ.AudioParam, pos?: number): void {
    if (_this.isCurrentBgm(bgm)) {
      _this.updateBgmParameters(bgm);
    } else {
      _this.stopBgm();
      if (bgm.name) {
        _this._bgmBuffer = _this.createBuffer("bgm/", bgm.name);
        _this.updateBgmParameters(bgm);
        if (!_this._meBuffer) {
          _this._bgmBuffer.play(true, pos || 0);
        }
      }
    }
    _this.updateCurrentBgm(bgm, pos);
  }

  static replayBgm(bgm: MZ.AudioParam): void {
    if (_this.isCurrentBgm(bgm)) {
      _this.updateBgmParameters(bgm);
    } else {
      _this.playBgm(bgm, bgm.pos!);
      if (_this._bgmBuffer) {
        _this._bgmBuffer.fadeIn(_this._replayFadeTime);
      }
    }
  }

  static isCurrentBgm(bgm: MZ.AudioParam): boolean {
    return !!(_this._currentBgm && _this._bgmBuffer && _this._currentBgm.name === bgm.name);
  }

  static updateBgmParameters(bgm: MZ.AudioParam): void {
    _this.updateBufferParameters(_this._bgmBuffer!, _this._bgmVolume, bgm);
  }

  static updateCurrentBgm(bgm: MZ.AudioParam, pos?: number): void {
    _this._currentBgm = {
      name: bgm.name,
      volume: bgm.volume,
      pitch: bgm.pitch,
      pan: bgm.pan,
      pos: pos,
    };
  }

  static stopBgm(): void {
    if (_this._bgmBuffer) {
      _this._bgmBuffer.destroy();
      _this._bgmBuffer = null;
      _this._currentBgm = null;
    }
  }

  static fadeOutBgm(duration: number): void {
    if (_this._bgmBuffer && _this._currentBgm) {
      _this._bgmBuffer.fadeOut(duration);
      _this._currentBgm = null;
    }
  }

  static fadeInBgm(duration: number): void {
    if (_this._bgmBuffer && _this._currentBgm) {
      _this._bgmBuffer.fadeIn(duration);
    }
  }

  static playBgs(bgs: MZ.AudioParam, pos?: number): void {
    if (_this.isCurrentBgs(bgs)) {
      _this.updateBgsParameters(bgs);
    } else {
      _this.stopBgs();
      if (bgs.name) {
        _this._bgsBuffer = _this.createBuffer("bgs/", bgs.name);
        _this.updateBgsParameters(bgs);
        _this._bgsBuffer.play(true, pos || 0);
      }
    }
    _this.updateCurrentBgs(bgs, pos);
  }

  static replayBgs(bgs: MZ.AudioParam): void {
    if (_this.isCurrentBgs(bgs)) {
      _this.updateBgsParameters(bgs);
    } else {
      _this.playBgs(bgs, bgs.pos!);
      if (_this._bgsBuffer) {
        _this._bgsBuffer.fadeIn(_this._replayFadeTime);
      }
    }
  }

  static isCurrentBgs(bgs: MZ.AudioParam): boolean {
    return !!(_this._currentBgs && _this._bgsBuffer && _this._currentBgs.name === bgs.name);
  }

  static updateBgsParameters(bgs: MZ.AudioParam): void {
    _this.updateBufferParameters(_this._bgsBuffer!, _this._bgsVolume, bgs);
  }

  static updateCurrentBgs(bgs: MZ.AudioParam, pos?: number): void {
    _this._currentBgs = {
      name: bgs.name,
      volume: bgs.volume,
      pitch: bgs.pitch,
      pan: bgs.pan,
      pos: pos,
    };
  }

  static stopBgs(): void {
    if (_this._bgsBuffer) {
      _this._bgsBuffer.destroy();
      _this._bgsBuffer = null;
      _this._currentBgs = null;
    }
  }

  static fadeOutBgs(duration: number): void {
    if (_this._bgsBuffer && _this._currentBgs) {
      _this._bgsBuffer.fadeOut(duration);
      _this._currentBgs = null;
    }
  }

  static fadeInBgs(duration: number): void {
    if (_this._bgsBuffer && _this._currentBgs) {
      _this._bgsBuffer.fadeIn(duration);
    }
  }

  static playMe(me: MZ.AudioParam): void {
    _this.stopMe();
    if (me.name) {
      if (_this._bgmBuffer && _this._currentBgm) {
        _this._currentBgm.pos = _this._bgmBuffer.seek();
        _this._bgmBuffer.stop();
      }
      _this._meBuffer = _this.createBuffer("me/", me.name);
      _this.updateMeParameters(me);
      _this._meBuffer.play(false);
      _this._meBuffer.addStopListener(_this.stopMe.bind(_this));
    }
  }

  static updateMeParameters(me: MZ.AudioParam): void {
    _this.updateBufferParameters(_this._meBuffer!, _this._meVolume, me);
  }

  static fadeOutMe(duration: number): void {
    if (_this._meBuffer) {
      _this._meBuffer.fadeOut(duration);
    }
  }

  static stopMe(): void {
    if (_this._meBuffer) {
      _this._meBuffer.destroy();
      _this._meBuffer = null;
      if (_this._bgmBuffer && _this._currentBgm && !_this._bgmBuffer.isPlaying()) {
        _this._bgmBuffer.play(true, _this._currentBgm.pos);
        _this._bgmBuffer.fadeIn(_this._replayFadeTime);
      }
    }
  }

  static playSe(se: MZ.AudioParam): void {
    if (se.name) {
      // [Note] Do not play the same sound in the same frame.
      const latestBuffers = _this._seBuffers.filter(
        (buffer) => buffer.frameCount === Graphics.frameCount
      );
      if (latestBuffers.find((buffer) => buffer.name === se.name)) {
        return;
      }
      const buffer = _this.createBuffer("se/", se.name);
      _this.updateSeParameters(buffer, se);
      buffer.play(false);
      _this._seBuffers.push(buffer);
      _this.cleanupSe();
    }
  }

  static updateSeParameters(buffer: WebAudio, se: MZ.AudioParam): void {
    _this.updateBufferParameters(buffer, _this._seVolume, se);
  }

  static cleanupSe(): void {
    for (const buffer of _this._seBuffers) {
      if (!buffer.isPlaying()) {
        buffer.destroy();
      }
    }
    _this._seBuffers = _this._seBuffers.filter((buffer) => buffer.isPlaying());
  }

  static stopSe(): void {
    for (const buffer of _this._seBuffers) {
      buffer.destroy();
    }
    _this._seBuffers = [];
  }

  static playStaticSe(se: MZ.AudioParam): void {
    if (se.name) {
      _this.loadStaticSe(se);
      for (const buffer of _this._staticBuffers) {
        if (buffer.name === se.name) {
          buffer.stop();
          _this.updateSeParameters(buffer, se);
          buffer.play(false);
          break;
        }
      }
    }
  }

  static loadStaticSe(se: MZ.AudioParam): void {
    if (se.name && !_this.isStaticSe(se)) {
      const buffer = _this.createBuffer("se/", se.name);
      _this._staticBuffers.push(buffer);
    }
  }

  static isStaticSe(se: MZ.AudioParam): boolean {
    for (const buffer of _this._staticBuffers) {
      if (buffer.name === se.name) {
        return true;
      }
    }
    return false;
  }

  static stopAll(): void {
    _this.stopMe();
    _this.stopBgm();
    _this.stopBgs();
    _this.stopSe();
  }

  static saveBgm(): MZ.AudioParam {
    if (_this._currentBgm) {
      const bgm = _this._currentBgm;
      return {
        name: bgm.name,
        volume: bgm.volume,
        pitch: bgm.pitch,
        pan: bgm.pan,
        pos: _this._bgmBuffer ? _this._bgmBuffer.seek() : 0,
      };
    } else {
      return _this.makeEmptyAudioObject();
    }
  }

  static saveBgs(): MZ.AudioParam {
    if (_this._currentBgs) {
      const bgs = _this._currentBgs;
      return {
        name: bgs.name,
        volume: bgs.volume,
        pitch: bgs.pitch,
        pan: bgs.pan,
        pos: _this._bgsBuffer ? _this._bgsBuffer.seek() : 0,
      };
    } else {
      return _this.makeEmptyAudioObject();
    }
  }

  static makeEmptyAudioObject(): MZ.AudioParam {
    return { name: "", volume: 0, pitch: 0 };
  }

  static createBuffer(folder: string, name: string): WebAudio {
    const ext = /\.(wav|mp3)$/gi.test(name) ? "" : _this.audioFileExt();
    const url = _this._path + folder + Utils.encodeURI(name) + ext;
    const buffer = new WebAudio(url, /^!/.test(name));
    buffer.name = name;
    buffer.frameCount = Graphics.frameCount;
    return buffer;
  }

  static updateBufferParameters(
    buffer: WebAudio,
    configVolume: number,
    audio: MZ.AudioParam
  ): void {
    if (buffer && audio) {
      buffer.volume = (configVolume * (audio.volume || 0)) / 10000;
      buffer.pitch = (audio.pitch || 0) / 100;
      buffer.pan = (audio.pan || 0) / 100;
    }
  }

  static audioFileExt(): string {
    return ".ogg";
  }

  static checkErrors(): void {
    const buffers = [_this._bgmBuffer, _this._bgsBuffer, _this._meBuffer];
    buffers.push(..._this._seBuffers);
    buffers.push(..._this._staticBuffers);
    for (const buffer of buffers) {
      if (buffer && buffer.isError()) {
        _this.throwLoadError(buffer);
      }
    }
  }

  static throwLoadError(webAudio: WebAudio): void {
    const retry = webAudio.retry.bind(webAudio);
    throw ["LoadError", webAudio.url, retry];
  }
}
const _this = AudioManager;
