//Powered By @6ix9s

const { spawn } = require('child_process');

function install_jsdom() 
{
    return new Promise((resolve, reject) => {
        console.log("🔄 jsdom bulunamadı, yükleniyor...");

        const npmInstall = spawn("npm", ["install", "jsdom"], { stdio: "inherit", shell: true });

        npmInstall.on("close", (code) => {
            if (code === 0) {
                console.log("✅ jsdom başarıyla yüklendi.");
                resolve();
            } else {
                console.error("❌ jsdom yüklenirken hata oluştu!");
                reject(new Error("jsdom yükleme başarısız."));
            }
        });
    });
}

async function runScript() 
{
    try {
        require.resolve("jsdom");
    } catch (err) {
        await install_jsdom();
    }

    const { JSDOM } = require("jsdom"); // jsdom başarıyla yüklendiyse tekrar çağır

    const settings = require("./settings/setting.json");

    async function get_time() 
    {
        try {
            const response = await fetch(settings["url"], {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept": "text/html,application/xhtml+xml",
                    "Accept-Language": "tr-TR,tr;q=0.9"
                }
            });

            const html = await response.text();
            const dom = new JSDOM(html);
            const document = dom.window.document;

            let date = [...document.querySelectorAll(settings["query"].queryMainElements)]
                .find(s => s.innerHTML.includes(settings["query"].text))
                ?.querySelector(settings["query"].findDateElement)?.innerHTML;

            const regex = settings["query"].regex;
            const match = date.match(regex);

            if (!match) {
                await send_notif(settings.message["err_title"], settings.message["err_date"]);
                return null;
            }

            let [, day, month, year, hour, minute] = match;
            const isoDate = `${year}-${month}-${day}T${hour}:${minute}:00`;

            return new Date(isoDate);
        } catch (err) 
        {
            console.log(err)
            await send_notif(settings.message["err_title"], settings.message["err_message"]);
            return null;
        }
    }

    async function send_notif(title, message) 
    {
        if (process.platform !== "win32") return console.error("Bu script sadece Windows işletim sisteminde çalışır.");

        const script = `
            [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
            $template = [Windows.UI.Notifications.ToastTemplateType]::ToastText02
            $xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($template)
            $textNodes = $xml.GetElementsByTagName("text")
            $textNodes.Item(0).AppendChild($xml.CreateTextNode("${title}")) | Out-Null
            $textNodes.Item(1).AppendChild($xml.CreateTextNode("${message}")) | Out-Null
            $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
            $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("${settings.message["notif_title"]}")
            $notifier.Show($toast)
        `;

        const ps = spawn("powershell.exe", ["-ExecutionPolicy", "Bypass", "-NoProfile", "-Command", script]);

        ps.stderr.on("data", (data) => {
            console.error(`Hata: ${data}`);
        });
    }

    (async () => {
        const targetDate = await get_time();
        if (!targetDate) return;

        const currentDate = new Date();
        const diffMs = targetDate - currentDate;

        if (diffMs < 0) 
        {
            await send_notif(settings.message["title"], settings.message["err_day"]);
            return;
        }

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        await send_notif(settings.message["title"], `${settings.message["content"]}  ${diffDays} gün, ${diffHours} saat, ${diffMinutes} dakika`);
    })();
}

runScript();
