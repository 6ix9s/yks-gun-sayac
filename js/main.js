//get osym content
async function request(x,y,z,t)
{
    try 
    {  

        let method =  z === null ? y["req_method"][0] : z;
        let response;
        
        if(method ===  y["req_method"][0]) return  response = await fetch(x); else  response = await fetch(x, { method : method, body:  t});
      

        const html = await response.text();

        return html;
     }
     catch (error)
     {
        document.getElementById(y.query.in_page.div_id).innerHTML = `<span style="color:red;">${y["message"].fetch_failed}</span>`;
        return null; 
     }
}







//main
document.addEventListener("DOMContentLoaded", async () => {
     let settings = window.settings()
     delete window.settings;
      
     document.title = settings["page_content"].title

     let osym_content = await request(settings["urls"].osym_content, settings); 
     if (!osym_content) return;

     let parser = new DOMParser();
     let doc = parser.parseFromString(osym_content, "text/html");

     let date = [...doc.querySelectorAll(settings["query"].queryMainElements)]
     .find(s => s.innerHTML.includes(settings["query"].text))
     ?.querySelector(settings["query"].findDateElement)?.innerHTML;

     const regex = settings["query"].regex;
     const match = date.match(regex);

     if (!match)  return null;

     let [, day, month, year, hour, minute] = match;
     const isoDate = `${year}-${month}-${day}T${hour}:${minute}:00`;
     let targetDate = new Date(isoDate);
      
     if (!targetDate || isNaN(targetDate)) return null;
    
     function updateCountdown() 
     {
        let currentDate = new Date();
        let diffMs = targetDate - currentDate;
    
        if (diffMs < 0) 
        {
            document.getElementById(settings.query.in_page.div_id).innerHTML = `<span style="color:red;">${settings.message.err_day}</span>`;
            return;
        }
    
        let days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
        document.getElementById(settings.query.in_page.div_id).innerHTML = 
            `<span style="color:red;">${settings.page_content.yks_title}</span> : ${days} gün ${hours} saat ${minutes} dakika ${seconds} saniye.`;
    
     }
    
    updateCountdown();
    
    setInterval(updateCountdown, settings.page_content.wait_time * 1000);
    
    
    async function registerPush() {
        
        if (!("serviceWorker" in navigator)) {
            console.error(settings["message"].browser_not_support);
            return;
        }
    
        const registration = await navigator.serviceWorker.register(settings["local_worker_path"]); 
    

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.error(settings["message"].user_not_accept);
            return;
        }
    
        const pushSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: settings["public_vapid_key"] //this is public vapid key
        });
    
       let posted_ = await request(settings["urls"].add_notification, settings, settings["req_method"][1], JSON.stringify(pushSubscription));
        
       console.info(posted_)
    }
    
    registerPush();
    
})




