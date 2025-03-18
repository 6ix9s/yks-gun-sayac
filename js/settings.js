window.settings = function() {
let settings_json =
{ 
  urls :
  {
    "osym_content": "https://yks-sayac.6ix9.workers.dev/",
    "add_notification": "https://yks-notification.6ix9.workers.dev/"
  },
  "req_method": ["GET", "POST"],
  "local_worker_path": "./sw.js",
  "public_vapid_key": "BNQe49T_uCXlxjgri4RKU5NScRicCmy0FqaFkdvOv7uL7h9B63BGOrCNMrB62KH6UDCdu0LsxyB3zxuMhewBZRU",
  "page_content": 
  {
    "title": "YKS Day Counter",
    "yks_title": "YKS'ye Kalan ",
    "wait_time": 1
  },
  "message":
  {
    "fetch_failed": "İstek Atarken Hata Oluştu.",
    "err_day": "Belirtilen Tarih Geçmiş!",
    "browser_not_support": "Tarayıcı Service Worker desteklemiyor.",
    "user_not_accept": "Bildirim izni verilmedi."
  },
  "query":
   {
    "text": "YKS",
    "queryMainElements" : "#printarea > div > div",
    "findDateElement" : "div:nth-child(2)",
    "regex" : "(\\d{2})\\.(\\d{2})\\.(\\d{4}) (\\d{2}):(\\d{2})",
    "in_page": 
    {
       "div_id": "yks_time"
    }
  } 
}

return settings_json
}
