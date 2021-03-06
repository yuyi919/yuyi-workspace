#include "api_adapter.h"

#include <stdexcept>

#include <Windows.h>

#include "ebyutil.h"

namespace ebyroid {

namespace {

template <class T>
inline T LoadProc(const HINSTANCE& handle, const char* proc_name) {
  FARPROC proc = GetProcAddress(handle, proc_name);
  if (proc == nullptr) {
    FreeLibrary(handle);
    char m[64];
    std::snprintf(m, 64, "Could not find '%s' in the library.", proc_name);
    throw std::runtime_error(m);
  }
  return reinterpret_cast<T>(proc);
}

}  // namespace

ApiAdapter* ApiAdapter::Create(const char* base_dir, const char* dll_path) {
  if (BOOL ok = SetDllDirectoryA(base_dir); !ok) {
    char m[128];
    Eprintf("SetDllDirectory (%s) failed with code %d (Check out the voiceroid path setting)",
            base_dir,
            GetLastError());
    throw new std::runtime_error(m);
  }

  HINSTANCE handle = LoadLibraryEx(dll_path, NULL, LOAD_WITH_ALTERED_SEARCH_PATH);
  if (handle == nullptr) {
    char m[128];
    Eprintf("LoadLibrary (%s) failed with code %d (Check out the voiceroid path setting)",
            dll_path,
            GetLastError());
    throw new std::runtime_error(m);
  }

  if (BOOL ok = SetDllDirectoryA(nullptr); !ok) {
    // this should not be so critical
    Eprintf("SetDllDirectoryA(NULL) failed with code %d", GetLastError());
    Eprintf("albeit the program will go on ignoring this error.");
  }

  ApiAdapter* adapter = new ApiAdapter(handle);
  adapter->init_ = LoadProc<ApiInit>(handle, "_AITalkAPI_Init@4");
  adapter->end_ = LoadProc<ApiEnd>(handle, "_AITalkAPI_End@0");
  adapter->voice_load_ = LoadProc<ApiVoiceLoad>(handle, "_AITalkAPI_VoiceLoad@4");
  adapter->voice_clear_ = LoadProc<ApiVoiceClear>(handle, "_AITalkAPI_VoiceClear@0");
  adapter->set_param_ = LoadProc<ApiSetParam>(handle, "_AITalkAPI_SetParam@4");
  adapter->get_param_ = LoadProc<ApiGetParam>(handle, "_AITalkAPI_GetParam@8");
  adapter->lang_load_ = LoadProc<ApiLangLoad>(handle, "_AITalkAPI_LangLoad@4");
  adapter->text_to_kana_ = LoadProc<ApiTextToKana>(handle, "_AITalkAPI_TextToKana@12");
  adapter->close_kana_ = LoadProc<ApiCloseKana>(handle, "_AITalkAPI_CloseKana@8");
  adapter->get_kana_ = LoadProc<ApiGetKana>(handle, "_AITalkAPI_GetKana@20");
  adapter->text_to_speech_ = LoadProc<ApiTextToSpeech>(handle, "_AITalkAPI_TextToSpeech@12");
  adapter->close_speech_ = LoadProc<ApiCloseSpeech>(handle, "_AITalkAPI_CloseSpeech@8");
  adapter->get_data_ = LoadProc<ApiGetData>(handle, "_AITalkAPI_GetData@16");

  return adapter;
}

ApiAdapter::~ApiAdapter() {
  if (BOOL result = FreeLibrary(dll_instance_); !result) {
    Eprintf("FreeLibrary(HMODULE) failed. Though the program will go on, may lead to fatal error.");
  }
  CloseHandle(reinterpret_cast<HANDLE>(m_CloseEventHandle));
}

ResultCode ApiAdapter::Init(TConfig* config) {
  m_CloseEventHandle = CreateEvent(NULL, TRUE, FALSE, NULL);
  // if (m_CloseEventHandle == NULL) {
  // throw std::errc::invalid_argument;
  // }
  return init_(config);
}

ResultCode ApiAdapter::End() {
  return end_();
}

ResultCode ApiAdapter::VoiceLoad(const char* voice_name) {
  return voice_load_(voice_name);
}

ResultCode ApiAdapter::VoiceClear() {
  return voice_clear_();
}

ResultCode ApiAdapter::SetParam(IntPtr p_param) {
  return set_param_(p_param);
}

ResultCode ApiAdapter::GetParam(IntPtr p_param, uint32_t* size) {
  return get_param_(p_param, size);
}

ResultCode ApiAdapter::LangLoad(const char* dir_lang) {
  return lang_load_(dir_lang);
}

ResultCode ApiAdapter::TextToKana(int32_t* job_id, TJobParam* param, const char* text) {
  return text_to_kana_(job_id, param, text);
}

void ApiAdapter::TextToKana2(int32_t* job_id, TJobParam* param, const char* text, std::string* kana, int timeout) {
  if (kana == nullptr) {
    throw std::errc::invalid_argument;
  }
  // m_KanaOutput = kana;
  // m_KanaOutput->clear();

  ResetEvent(reinterpret_cast<HANDLE>(m_CloseEventHandle));

  // ?????????????????????
  ResultCode result;
  result = text_to_kana_(job_id, param, text);
  if (result != ERR_SUCCESS) {
    Eprintf("ResultCode %d", result);
    throw std::errc::invalid_argument;
  }

  // ????????????????????????
  // timeout????????????????????????????????????
  DWORD timeout_winapi = (0 < timeout) ? timeout : INFINITE;
  DWORD result_winapi;
  result_winapi = WaitForSingleObject(reinterpret_cast<HANDLE>(m_CloseEventHandle), timeout_winapi);

  // ?????????????????????
  result = close_kana_((int32_t) job_id, 0);
  if (result != ERR_SUCCESS) {
    throw std::errc::invalid_argument;
  }
  if (result_winapi != WAIT_OBJECT_0) {
    // ?????????????????????????????????????????????
    kana->clear();
    throw std::errc::timed_out;
  }
}

ResultCode ApiAdapter::CloseKana(int32_t job_id, int32_t use_event) {
  return close_kana_(job_id, use_event);
}

ResultCode ApiAdapter::GetKana(int32_t job_id,
                               char* text_buf,
                               uint32_t len_buf,
                               uint32_t* size,
                               uint32_t* pos) {
  return get_kana_(job_id, text_buf, len_buf, size, pos);
}

ResultCode ApiAdapter::TextToSpeech(int32_t* job_id, TJobParam* param, const char* text) {
  return text_to_speech_(job_id, param, text);
}

ResultCode ApiAdapter::CloseSpeech(int32_t job_id, int32_t use_event) {
  return close_speech_(job_id, use_event);
}

ResultCode ApiAdapter::GetData(int32_t job_id, int16_t* raw_buf, uint32_t len_buf, uint32_t* size) {
  return get_data_(job_id, raw_buf, len_buf, size);
}

}  // namespace ebyroid
