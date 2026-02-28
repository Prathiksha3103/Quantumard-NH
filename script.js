const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton= document.querySelector("#send-message");
const fileInput= document.querySelector("#file-input");
const fileUploadWrapper= document.querySelector(".file-upload-wrapper");
const fileCancelButton= document.querySelector("#file-cancel");
const chatbotToggler= document.querySelector("#chatbot-toggler");
const closeChatbot= document.querySelector("#close-chatbot");



const API_KEY = "AIzaSyB61M8XSFjgrKWEMbFVJOHSRbZcvbOQFzw";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}
const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

const createMessageElement =  (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;

}

const generateBotResponse = async(incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    


    chatHistory.push({
        role: "user",
        "parts": [{"text": userData.message}, ...(userData.file.data ? [{inline_data: userData.file}] : 
            [])]
      });
const requestOptions = {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        contents: chatHistory
    })
}


    try {
        const response = await fetch(API_URL, requestOptions);
const data = await response.json();

if (!response.ok || !data.candidates) {
  throw new Error(data.error?.message || "No candidates returned");
}

const apiResponseText =
  data?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\*\*(.*?)\*\*/g, '$1') || 
  "No response from AI";

messageElement.innerText = apiResponseText;


        messageElement.innerText = apiResponseText;

        chatHistory.push({
        role: "model",
        "parts": [{"text": userData.message}]
        });

    }catch (error) {
        console.log(error);
        messageElement.innerText = error.message;
        messageElement.style.color = "#ff0000";

    } finally {
        userData.file = {}
        incomingMessageDiv.classList.remove("thinking");
        chatBody .scrollTo({ top: chatBody .scrollHeight, behavior: "smooth"});
    }
}
const handleOutgoingMessage = (e) => {
    e.preventDefault();

    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));

    const messageContent = `<div class="message-text"></div>
                            ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,
                            ${userData.file.data}" class="attachment" />` : ""}`;
    const outgoingMessageDiv =createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody .appendChild(outgoingMessageDiv);
    chatBody .scrollTo({ top: chatBody .scrollHeight, behavior: "smooth"});

    setTimeout(() => {
        const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
</svg>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`;
    const incomingMessageDiv =createMessageElement(messageContent, "bot-message","thinking");
    
    chatBody .appendChild(incomingMessageDiv);
    chatBody .scrollTo({ top: chatBody .scrollHeight, behavior: "smooth"});
    generateBotResponse(incomingMessageDiv);
}, 600);
}


messageInput.addEventListener("keydown", (e) => {
    const userMessage =e.target.value.trim();
    if(e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
        handleOutgoingMessage(e);
    }
});

messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";

});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];


    userData.file= {
             
        data: base64String,
        mime_type: file.type
    }
        
       fileInput.value = "";
    }
    reader.readAsDataURL(file);

});

fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");

});

const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },


    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }

});

document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
chatbotToggler.addEventListener("click", () => document.body.classList.toggle ("show-chatbot"));
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

let tamil=false;


/* ========= 100 CRIMES DATA ========= */
const crimes=[
/* 1–20 */

  {
  name: {
    en: "Theft",
    hi: "चोरी",
    bn: "চুরি",
    te: "దొంగతనం",
    mr: "चोरी",
    ta: "திருட்டு",
    gu: "ચોરી",
    ur: "چوری",
    kn: "ಕಳ್ಳತನ",
    or: "ଚୋରି",
    ml: "മോഷണം",
    pa: "ਚੋਰੀ",
    as: "চুৰি",
    sa: "चौर्यम्"
  },
  sec: "IPC 378",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },

  complaintLink: {
    text: {
      en: "Register Police Complaint",
      ta: "போலீஸ் புகார் பதிவு செய்ய"
    },
    url: "https://eservices.tnpolice.gov.in/CCTNSNICSDC/ComplaintRegistrationPage?0"
  },

  lvl: "low"
},

  {
    name: {
      en: "Robbery",
      hi: "डकैती",
      bn: "ডাকাতি",
      te: "దోపిడి",
      mr: "दरोडा",
      ta: "கொள்ளை",
      gu: "લૂંટ",
      ur: "ڈکیتی",
      kn: "ದರೋಡೆ",
      or: "ଡକାୟତି",
      ml: "കവർച്ച",
      pa: "ਡਾਕਾ",
      as: "ডকাইতি",
      sa: "सहसाचौर्यम्"
    },
    sec: "IPC 392",
    punishment: {
      en: "Up to 10 years",
      hi: "10 वर्ष तक",
      bn: "১০ বছর পর্যন্ত",
      te: "10 సంవత్సరాల వరకు",
      mr: "10 वर्षांपर्यंत",
      ta: "10 ஆண்டுகள் வரை",
      gu: "10 વર્ષ સુધી",
      ur: "10 سال تک",
      kn: "10 ವರ್ಷಗಳವರೆಗೆ",
      or: "10 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
      ml: "10 വർഷം വരെ",
      pa: "10 ਸਾਲ ਤੱਕ",
      as: "১০ বছৰৰ ভিতৰত",
      sa: "दशवर्षपर्यन्तम्"
    },
    lvl: "medium"
  },
{
  name: {
    en: "Dacoity",
    hi: "डकैती",
    bn: "ডাকাতি",
    te: "డకాయితీ",
    mr: "डाकूगिरी",
    ta: "கொடுங்கொள்ளை",
    gu: "ડાકૂતી",
    ur: "ڈکیتی",
    kn: "ಡಕಾಯಿತಿ",
    or: "ଡକାୟତି",
    ml: "ഡകൈതി",
    pa: "ਡਕੈਤੀ",
    as: "ডকাইতি",
    sa: "दस्युत्वम्"
  },
  sec: "IPC 395",
  punishment: {
    en: "Life imprisonment",
    hi: "आजीवन कारावास",
    bn: "যাবজ্জীবন কারাদণ্ড",
    te: "ఆజీవ కారాగారం",
    mr: "आजीवन कारावास",
    ta: "ஆயுள் சிறை",
    gu: "આજીવન કેદ",
    ur: "عمر قید",
    kn: "ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or: "ଆଜୀବନ କାରାଦଣ୍ଡ",
    ml: "ജീവപര്യന്തം തടവ്",
    pa: "ਉਮਰ ਕੈਦ",
    as: "আজীৱন কাৰাদণ্ড",
    sa: "आजीवनकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Murder",
    hi: "हत्या",
    bn: "হত্যা",
    te: "హత్య",
    mr: "खून",
    ta: "கொலை",
    gu: "હત્યા",
    ur: "قتل",
    kn: "ಕೊಲೆ",
    or: "ହତ୍ୟା",
    ml: "കൊലപാതകം",
    pa: "ਕਤਲ",
    as: "হত্যা",
    sa: "हत्या"
  },
  sec: "IPC 302",
  punishment: {
    en: "Death / Life imprisonment",
    hi: "मृत्युदंड / आजीवन कारावास",
    bn: "মৃত্যুদণ্ড / যাবজ্জীবন কারাদণ্ড",
    te: "మరణదండన / ఆజీవ కారాగారం",
    mr: "मृत्युदंड / आजीवन कारावास",
    ta: "மரணம் / ஆயுள் சிறை",
    gu: "મૃત્યુદંડ / આજીવન કેદ",
    ur: "سزائے موت / عمر قید",
    kn: "ಮರಣದಂಡನೆ / ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or: "ମୃତ୍ୟୁଦଣ୍ଡ / ଆଜୀବନ କାରାଦଣ୍ଡ",
    ml: "വധശിക്ഷ / ജീവപര്യന്തം തടവ്",
    pa: "ਮੌਤ ਦੀ ਸਜ਼ਾ / ਉਮਰ ਕੈਦ",
    as: "মৃত্যুদণ্ড / আজীৱন কাৰাদণ্ড",
    sa: "मृत्युदण्डः / आजीवनकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Attempt to Murder",
    hi: "हत्या का प्रयास",
    bn: "হত্যার চেষ্টা",
    te: "హత్యాయత్నం",
    mr: "खुनाचा प्रयत्न",
    ta: "கொலை முயற்சி",
    gu: "હત્યાનો પ્રયાસ",
    ur: "قتل کی کوشش",
    kn: "ಕೊಲೆಯ ಯತ್ನ",
    or: "ହତ୍ୟାର ଚେଷ୍ଟା",
    ml: "കൊലപാതകശ്രമം",
    pa: "ਕਤਲ ਦੀ ਕੋਸ਼ਿਸ਼",
    as: "হত্যাৰ চেষ্টা",
    sa: "हत्याप्रयत्नः"
  },
  sec: "IPC 307",
  punishment: {
    en: "Up to life imprisonment",
    hi: "आजीवन कारावास तक",
    bn: "যাবজ্জীবন পর্যন্ত",
    te: "ఆజీవ కారాగారం వరకు",
    mr: "आजीवन कारावासापर्यंत",
    ta: "ஆயுள் சிறை வரை",
    gu: "આજીવન કેદ સુધી",
    ur: "عمر قید تک",
    kn: "ಜೀವಾವಧಿ ಕಾರಾಗೃಹವರೆಗೆ",
    or: "ଆଜୀବନ କାରାଦଣ୍ଡ ପର୍ଯ୍ୟନ୍ତ",
    ml: "ജീവപര്യന്തം തടവ് വരെ",
    pa: "ਉਮਰ ਕੈਦ ਤੱਕ",
    as: "আজীৱন কাৰাদণ্ডলৈকে",
    sa: "आजीवनकारावासपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Kidnapping",
    hi: "अपहरण",
    bn: "অপহরণ",
    te: "అపహరణ",
    mr: "अपहरण",
    ta: "கடத்தல்",
    gu: "અપહરણ",
    ur: "اغوا",
    kn: "ಅಪಹರಣ",
    or: "ଅପହରଣ",
    ml: "അപഹരണം",
    pa: "ਅਗਵਾ",
    as: "অপহৰণ",
    sa: "अपहरणम्"
  },
  sec: "IPC 363",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Abduction",
    hi: "अपहरण",
    bn: "অপহরণ",
    te: "అపహరణ",
    mr: "अपहरण",
    ta: "அப்பகரிப்பு",
    gu: "અપહરણ",
    ur: "اغوا",
    kn: "ಅಪಹರಣ",
    or: "ଅପହରଣ",
    ml: "അപഹരണം",
    pa: "ਅਗਵਾ",
    as: "অপহৰণ",
    sa: "अपहरणम्"
  },
  sec: "IPC 362",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Rape",
    hi: "बलात्कार",
    bn: "ধর্ষণ",
    te: "అత్యాచారం",
    mr: "बलात्कार",
    ta: "பாலியல் வன்கொடுமை",
    gu: "બળાત્કાર",
    ur: "عصمت دری",
    kn: "ಅತ್ಯಾಚಾರ",
    or: "ବଳାତ୍କାର",
    ml: "ബലാത്സംഗം",
    pa: "ਬਲਾਤਕਾਰ",
    as: "ধর্ষণ",
    sa: "बलात्कारः"
  },
  sec: "IPC 376",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Sexual Harassment",
    hi: "यौन उत्पीड़न",
    bn: "যৌন হয়রানি",
    te: "లైంగిక వేధింపులు",
    mr: "लैंगिक छळ",
    ta: "பாலியல் தொல்லை",
    gu: "લૈંગિક સતામણી",
    ur: "جنسی ہراسانی",
    kn: "ಲೈಂಗಿಕ ಕಿರುಕುಳ",
    or: "ଲୈଙ୍ଗିକ ଉତ୍ପୀଡନ",
    ml: "ലൈംഗിക പീഡനം",
    pa: "ਲੈੰਗਿਕ ਉਤਪੀੜਨ",
    as: "যৌন হয়ৰানি",
    sa: "लैङ्गिकउत्पीडनम्"
  },
  sec: "IPC 354A",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Domestic Violence",
    hi: "घरेलू हिंसा",
    bn: "গার্হস্থ্য হিংসা",
    te: "గృహ హింస",
    mr: "घरगुती हिंसा",
    ta: "குடும்ப வன்முறை",
    gu: "ઘરેલુ હિંસા",
    ur: "گھریلو تشدد",
    kn: "ಗೃಹ ಹಿಂಸೆ",
    or: "ଗୃହହିଂସା",
    ml: "ഗാർഹിക പീഡനം",
    pa: "ਘਰੇਲੂ ਹਿੰਸਾ",
    as: "গৃহস্থালী হিংসা",
    sa: "गृहहिंसा"
  },
  sec: "DV Act",
  punishment: {
    en: "Imprisonment / Fine",
    hi: "कारावास / जुर्माना",
    bn: "কারাদণ্ড / জরিমানা",
    te: "కారాగారం / జరిమానా",
    mr: "कारावास / दंड",
    ta: "சிறை / அபராதம்",
    gu: "કેદ / દંડ",
    ur: "قید / جرمانہ",
    kn: "ಕಾರಾಗೃಹ / ದಂಡ",
    or: "କାରାଦଣ୍ଡ / ଜରିମାନା",
    ml: "തടവ് / പിഴ",
    pa: "ਕੈਦ / ਜੁਰਮਾਨਾ",
    as: "কাৰাদণ্ড / জৰিমনা",
    sa: "कारावासः / दण्डः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Cheating",
    hi: "धोखाधड़ी",
    bn: "প্রতারণা",
    te: "మోసం",
    mr: "फसवणूक",
    ta: "ஏமாற்றுதல்",
    gu: "છેતરપિંડી",
    ur: "دھوکہ دہی",
    kn: "ಮೋಸ",
    or: "ଠକେଇ",
    ml: "വഞ്ചന",
    pa: "ਧੋਖਾਧੜੀ",
    as: "প্ৰতাৰণা",
    sa: "छलनम्"
  },
  sec: "IPC 420",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Criminal Breach of Trust",
    hi: "आपराधिक विश्वासघात",
    bn: "অপরাধমূলক বিশ্বাসভঙ্গ",
    te: "నమ్మక ద్రోహం",
    mr: "गुन्हेगारी विश्वासघात",
    ta: "நம்பிக்கை மீறல்",
    gu: "ફોજદારી વિશ્વાસઘાત",
    ur: "مجرمانہ خیانت",
    kn: "ಅಪರಾಧ ನಂಬಿಕೆಭಂಗ",
    or: "ଆପରାଧିକ ବିଶ୍ୱାସଘାତ",
    ml: "വിശ്വാസവഞ്ചന",
    pa: "ਆਪਰਾਧਿਕ ਭਰੋਸਾ ਭੰਗ",
    as: "অপৰাধমূলক বিশ্বাসভংগ",
    sa: "विश्वासभङ्गः"
  },
  sec: "IPC 406",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Forgery",
    hi: "जालसाजी",
    bn: "জালিয়াতি",
    te: "నకిలీ",
    mr: "बनावट",
    ta: "போலி ஆவணம்",
    gu: "ખોટી બનાવટ",
    ur: "جعلسازی",
    kn: "ನಕಲಿ",
    or: "ଜାଲସାଜି",
    ml: "കൃത്രിമരേഖ",
    pa: "ਜਾਲਸਾਜ਼ੀ",
    as: "জালিয়াতি",
    sa: "कूटलेखनम्"
  },
  sec: "IPC 465",
  punishment: {
    en: "Up to 2 years",
    hi: "2 वर्ष तक",
    bn: "২ বছর পর্যন্ত",
    te: "2 సంవత్సరాల వరకు",
    mr: "2 वर्षांपर्यंत",
    ta: "2 ஆண்டுகள் வரை",
    gu: "2 વર્ષ સુધી",
    ur: "2 سال تک",
    kn: "2 ವರ್ಷಗಳವರೆಗೆ",
    or: "2 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "2 വർഷം വരെ",
    pa: "2 ਸਾਲ ਤੱਕ",
    as: "২ বছৰৰ ভিতৰত",
    sa: "द्विवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Criminal Intimidation",
    hi: "आपराधिक धमकी",
    bn: "অপরাধমূলক ভীতি প্রদর্শন",
    te: "నేర బెదిరింపు",
    mr: "गुन्हेगारी धमकी",
    ta: "மிரட்டல்",
    gu: "ફોજદારી ધમકી",
    ur: "مجرمانہ دھمکی",
    kn: "ಅಪರಾಧ ಬೆದರಿಕೆ",
    or: "ଆପରାଧିକ ଧମକ",
    ml: "ഭീഷണി",
    pa: "ਆਪਰਾਧਿਕ ਧਮਕੀ",
    as: "অপৰাধমূলক ভাবুকি",
    sa: "आपराधिकधमकी"
  },
  sec: "IPC 506",
  punishment: {
    en: "Up to 2 years",
    hi: "2 वर्ष तक",
    bn: "২ বছর পর্যন্ত",
    te: "2 సంవత్సరాల వరకు",
    mr: "2 वर्षांपर्यंत",
    ta: "2 ஆண்டுகள் வரை",
    gu: "2 વર્ષ સુધી",
    ur: "2 سال تک",
    kn: "2 ವರ್ಷಗಳವರೆಗೆ",
    or: "2 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "2 വർഷം വരെ",
    pa: "2 ਸਾਲ ਤੱਕ",
    as: "২ বছৰৰ ভিতৰত",
    sa: "द्विवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Defamation",
    hi: "मानहानि",
    bn: "মানহানি",
    te: "అపకీర్తి",
    mr: "अब्रुनुकसानी",
    ta: "அவதூறு",
    gu: "બદનામી",
    ur: "ہتکِ عزت",
    kn: "ಅಪಖ್ಯಾತಿ",
    or: "ମାନହାନି",
    ml: "അപകീർത്തി",
    pa: "ਬਦਨਾਮੀ",
    as: "মানহানি",
    sa: "अपकीर्तनम्"
  },
  sec: "IPC 499",
  punishment: {
    en: "Up to 2 years",
    hi: "2 वर्ष तक",
    bn: "২ বছর পর্যন্ত",
    te: "2 సంవత్సరాల వరకు",
    mr: "2 वर्षांपर्यंत",
    ta: "2 ஆண்டுகள் வரை",
    gu: "2 વર્ષ સુધી",
    ur: "2 سال تک",
    kn: "2 ವರ್ಷಗಳವರೆಗೆ",
    or: "2 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "2 വർഷം വരെ",
    pa: "2 ਸਾਲ ਤੱਕ",
    as: "২ বছৰৰ ভিতৰত",
    sa: "द्विवर्षपर्यन्तम्"
  },
  lvl: "low"
},

{
  name: {
    en: "Rioting",
    hi: "दंगा",
    bn: "দাঙ্গা",
    te: "అల్లర్లు",
    mr: "दंगल",
    ta: "கலவரம்",
    gu: "દંગલ",
    ur: "فساد",
    kn: "ಗಲಭೆ",
    or: "ଦଙ୍ଗା",
    ml: "കലാപം",
    pa: "ਦੰਗਾ",
    as: "দাঙ্গা",
    sa: "दङ्गा"
  },
  sec: "IPC 147",
  punishment: {
    en: "Up to 2 years",
    hi: "2 वर्ष तक",
    bn: "২ বছর পর্যন্ত",
    te: "2 సంవత్సరాల వరకు",
    mr: "2 वर्षांपर्यंत",
    ta: "2 ஆண்டுகள் வரை",
    gu: "2 વર્ષ સુધી",
    ur: "2 سال تک",
    kn: "2 ವರ್ಷಗಳವರೆಗೆ",
    or: "2 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "2 വർഷം വരെ",
    pa: "2 ਸਾਲ ਤੱਕ",
    as: "২ বছৰৰ ভিতৰত",
    sa: "द्विवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Unlawful Assembly",
    hi: "अवैध सभा",
    bn: "অবৈধ সমাবেশ",
    te: "అక్రమ సభ",
    mr: "बेकायदेशीर सभा",
    ta: "சட்டவிரோத கூட்டம்",
    gu: "ગેરકાયદેસર સભા",
    ur: "غیر قانونی اجتماع",
    kn: "ಅಕ್ರಮ ಸಭೆ",
    or: "ଅବୈଧ ସଭା",
    ml: "നിയമവിരുദ്ധ കൂട്ടായ്മ",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਇਕੱਠ",
    as: "অবৈধ সমাৱেশ",
    sa: "अवैधसभा"
  },
  sec: "IPC 141",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Public Nuisance",
    hi: "सार्वजनिक उपद्रव",
    bn: "সার্বজনিক উপদ্রব",
    te: "ప్రజా ఉపద్రవం",
    mr: "सार्वजनिक उपद्रव",
    ta: "பொது தொல்லை",
    gu: "જાહેર તકલીફ",
    ur: "عوامی خلل",
    kn: "ಸಾರ್ವಜನಿಕ ಉಪದ್ರವ",
    or: "ସାର୍ବଜନୀନ ଉପଦ୍ରବ",
    ml: "പൊതു ശല്യം",
    pa: "ਸਾਰਵਜਨਿਕ ਉਪਦ੍ਰਵ",
    as: "সাৰ্বজনিক উপদ্ৰৱ",
    sa: "सार्वजनिकोपद्रवः"
  },
  sec: "IPC 268",
  punishment: {
    en: "Fine",
    hi: "जुर्माना",
    bn: "জরিমানা",
    te: "జరిమానా",
    mr: "दंड",
    ta: "அபராதம்",
    gu: "દંડ",
    ur: "جرمانہ",
    kn: "ದಂಡ",
    or: "ଜରିମାନା",
    ml: "പിഴ",
    pa: "ਜੁਰਮਾਨਾ",
    as: "জৰিমনা",
    sa: "दण्डः"
  },
  lvl: "low"
},

{
  name: {
    en: "Obscenity",
    hi: "अश्लीलता",
    bn: "অশ্লীলতা",
    te: "అశ్లీలత",
    mr: "अश्लीलता",
    ta: "அவலச்செயல்",
    gu: "અશ્લીલતા",
    ur: "فحاشی",
    kn: "ಅಶ್ಲೀಲತೆ",
    or: "ଅଶ୍ଳୀଳତା",
    ml: "അശ്ലീലത",
    pa: "ਅਸ਼ਲੀਲਤਾ",
    as: "অশ্লীলতা",
    sa: "अश्लीलता"
  },
  sec: "IPC 294",
  punishment: {
    en: "3 months",
    hi: "3 महीने",
    bn: "৩ মাস",
    te: "3 నెలలు",
    mr: "3 महिने",
    ta: "3 மாதங்கள்",
    gu: "3 મહિના",
    ur: "3 ماہ",
    kn: "3 ತಿಂಗಳು",
    or: "3 ମାସ",
    ml: "3 മാസം",
    pa: "3 ਮਹੀਨੇ",
    as: "৩ মাহ",
    sa: "त्रिमासपर्यन्तम्"
  },
  lvl: "low"
},

{
  name: {
    en: "House Trespass",
    hi: "गृह अतिक्रमण",
    bn: "গৃহ অনধিকার প্রবেশ",
    te: "ఇంటి అక్రమ ప్రవేశం",
    mr: "घरात घुसखोरी",
    ta: "வீடு புகுதல்",
    gu: "ઘરમાં ઘુસણખોરી",
    ur: "گھر میں غیر قانونی داخلہ",
    kn: "ಮನೆ ಅಕ್ರಮ ಪ್ರವೇಶ",
    or: "ଘର ଅନଧିକାର ପ୍ରବେଶ",
    ml: "വീട്ടിൽ അനധികൃത പ്രവേശനം",
    pa: "ਘਰ ਵਿੱਚ ਗੈਰਕਾਨੂੰਨੀ ਦਾਖਲਾ",
    as: "ঘৰত অবৈধ প্ৰৱেশ",
    sa: "गृहप्रवेशः"
  },
  sec: "IPC 448",
  punishment: {
    en: "1 year",
    hi: "1 वर्ष",
    bn: "১ বছর",
    te: "1 సంవత్సరం",
    mr: "1 वर्ष",
    ta: "1 ஆண்டு",
    gu: "1 વર્ષ",
    ur: "1 سال",
    kn: "1 ವರ್ಷ",
    or: "1 ବର୍ଷ",
    ml: "1 വർഷം",
    pa: "1 ਸਾਲ",
    as: "১ বছৰ",
    sa: "एकवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

/* 21–40 */
{
  name: {
    en: "Arson",
    hi: "आगजनी",
    bn: "অগ্নিসংযোগ",
    te: "అగ్ని ప్రదీపనం",
    mr: "आगजनी",
    ta: "தீவைத்தல்",
    gu: "આગજણી",
    ur: "آتش زنی",
    kn: "ಅಗ್ನಿಸಂಯೋಗ",
    or: "ଅଗ୍ନିସଂଯୋଗ",
    ml: "തീ കൊളുത്തൽ",
    pa: "ਅੱਗਜ਼ਨੀ",
    as: "অগ্নিসংযোগ",
    sa: "अग्निदाहः"
  },
  sec: "IPC 435",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Dowry Death",
    hi: "दहेज मृत्यु",
    bn: "পণমৃত্যু",
    te: "వరకట్న మరణం",
    mr: "हुंडा मृत्यू",
    ta: "வரதட்சணை மரணம்",
    gu: "દહેજ મૃત્યુ",
    ur: "جہیز موت",
    kn: "ವರದಕ್ಷಿಣೆ ಮರಣ",
    or: "ଯୌତୁକ ମୃତ୍ୟୁ",
    ml: "വരദക്ഷിണ മരണം",
    pa: "ਦਾਜ ਮੌਤ",
    as: "যৌতুক মৃত্যু",
    sa: "दहेजमृत्युः"
  },
  sec: "IPC 304B",
  punishment: {
    en: "Minimum 7 years",
    hi: "न्यूनतम 7 वर्ष",
    bn: "ন্যূনতম ৭ বছর",
    te: "కనీసం 7 సంవత్సరాలు",
    mr: "किमान 7 वर्षे",
    ta: "குறைந்தது 7 ஆண்டுகள்",
    gu: "ન્યૂનતમ 7 વર્ષ",
    ur: "کم از کم 7 سال",
    kn: "ಕನಿಷ್ಠ 7 ವರ್ಷಗಳು",
    or: "ନ୍ୟୁନତମ 7 ବର୍ଷ",
    ml: "കുറഞ്ഞത് 7 വർഷം",
    pa: "ਘੱਟੋ-ਘੱਟ 7 ਸਾਲ",
    as: "নূন্যতম ৭ বছৰ",
    sa: "न्यूनतमं सप्तवर्षाणि"
  },
  lvl: "high"
},

{
  name: {
    en: "Child Labour",
    hi: "बाल श्रम",
    bn: "শিশু শ্রম",
    te: "బాల కార్మికత్వం",
    mr: "बालकामगार",
    ta: "குழந்தை தொழில்",
    gu: "બાળ મજૂરી",
    ur: "بچوں سے مشقت",
    kn: "ಮಕ್ಕಳ ಕಾರ್ಮಿಕತೆ",
    or: "ଶିଶୁ ଶ୍ରମ",
    ml: "ശിശു തൊഴിൽ",
    pa: "ਬਾਲ ਮਜ਼ਦੂਰੀ",
    as: "শিশু শ্ৰম",
    sa: "बालश्रमः"
  },
  sec: "CLPR Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Human Trafficking",
    hi: "मानव तस्करी",
    bn: "মানব পাচার",
    te: "మానవ అక్రమ రవాణా",
    mr: "मानव तस्करी",
    ta: "மனிதக் கடத்தல்",
    gu: "માનવ વાણિજ્ય",
    ur: "انسانی اسمگلنگ",
    kn: "ಮಾನವ ಕಳ್ಳಸಾಗಣೆ",
    or: "ମାନବ ପାଚାର",
    ml: "മനുഷ്യ കടത്ത്",
    pa: "ਮਨੁੱਖੀ ਤਸਕਰੀ",
    as: "মানৱ সৰবৰাহ",
    sa: "मानवव्यापारः"
  },
  sec: "IPC 370",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Cyber Fraud",
    hi: "साइबर धोखाधड़ी",
    bn: "সাইবার প্রতারণা",
    te: "సైబర్ మోసం",
    mr: "सायबर फसवणूक",
    ta: "இணைய மோசடி",
    gu: "સાયબર છેતરપિંડી",
    ur: "سائبر فراڈ",
    kn: "ಸೈಬರ್ ಮೋಸ",
    or: "ସାଇବର ଠକେଇ",
    ml: "സൈബർ തട്ടിപ്പ്",
    pa: "ਸਾਇਬਰ ਧੋਖਾਧੜੀ",
    as: "চাইবাৰ প্ৰতাৰণা",
    sa: "साइबरछलनम्"
  },
  sec: "IT Act 66D",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Identity Theft",
    hi: "पहचान की चोरी",
    bn: "পরিচয় চুরি",
    te: "గుర్తింపు దొంగతనం",
    mr: "ओळख चोरी",
    ta: "அடையாள திருட்டு",
    gu: "ઓળખ ચોરી",
    ur: "شناخت کی چوری",
    kn: "ಗುರುತು ಕಳವು",
    or: "ପରିଚୟ ଚୋରି",
    ml: "ഐഡന്റിറ്റി മോഷണം",
    pa: "ਪਛਾਣ ਚੋਰੀ",
    as: "পৰিচয় চুৰি",
    sa: "परिचयचौर्यम्"
  },
  sec: "IT Act 66C",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Hacking",
    hi: "हैकिंग",
    bn: "হ্যাকিং",
    te: "హ్యాకింగ్",
    mr: "हॅकिंग",
    ta: "ஹேக்கிங்",
    gu: "હેકિંગ",
    ur: "ہیکنگ",
    kn: "ಹ್ಯಾಕಿಂಗ್",
    or: "ହ୍ୟାକିଂ",
    ml: "ഹാക്കിംഗ്",
    pa: "ਹੈਕਿੰਗ",
    as: "হেকিং",
    sa: "सङ्गणकभेदनम्"
  },
  sec: "IT Act 66",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Cyber Stalking",
    hi: "साइबर पीछा",
    bn: "সাইবার অনুসরণ",
    te: "సైబర్ వెంబడింపు",
    mr: "सायबर पाठलाग",
    ta: "இணைய பின்தொடர்வு",
    gu: "સાયબર પીછો",
    ur: "سائبر تعاقب",
    kn: "ಸೈಬರ್ ಹಿಂಬಾಲನೆ",
    or: "ସାଇବର ପଛୁଆଁ ଚାଲିବା",
    ml: "സൈബർ പിന്തുടർച്ച",
    pa: "ਸਾਇਬਰ ਪਿੱਛਾ",
    as: "চাইবাৰ অনুসৰণ",
    sa: "साइबरअनुसरणम्"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Data Theft",
    hi: "डेटा चोरी",
    bn: "ডেটা চুরি",
    te: "డేటా దొంగతనం",
    mr: "माहिती चोरी",
    ta: "தகவல் திருட்டு",
    gu: "ડેટા ચોરી",
    ur: "ڈیٹا چوری",
    kn: "ಡೇಟಾ ಕಳವು",
    or: "ଡାଟା ଚୋରି",
    ml: "ഡാറ്റ മോഷണം",
    pa: "ਡਾਟਾ ਚੋਰੀ",
    as: "ডাটা চুৰি",
    sa: "दत्तांशचौर्यम्"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Drug Possession",
    hi: "मादक पदार्थ का कब्जा",
    bn: "মাদক দ্রব্য দখল",
    te: "మత్తు పదార్థాల స్వాధీనం",
    mr: "अंमली पदार्थ ताबा",
    ta: "மருந்து குற்றம்",
    gu: "માદક દ્રવ્ય કબજો",
    ur: "منشیات کا قبضہ",
    kn: "ಮಾದಕ ವಸ್ತುಗಳ ಸ್ವಾಧೀನ",
    or: "ମାଦକ ଦ୍ରବ୍ୟ ଅଧିକାର",
    ml: "മയക്കുമരുന്ന് കൈവശം",
    pa: "ਨਸ਼ੀਲੇ ਪਦਾਰਥ ਦੀ ਕਬਜ਼ਾ",
    as: "মাদক দ্ৰব্য দখল",
    sa: "मादकद्रव्यस्वामित्वम्"
  },
  sec: "NDPS Act",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Drug Trafficking",
    hi: "मादक पदार्थ तस्करी",
    bn: "মাদক পাচার",
    te: "మత్తు పదార్థాల అక్రమ రవాణా",
    mr: "अंमली पदार्थ तस्करी",
    ta: "மருந்து கடத்தல்",
    gu: "માદક દ્રવ્ય તસ્કરી",
    ur: "منشیات کی اسمگلنگ",
    kn: "ಮಾದಕ ವಸ್ತುಗಳ ಕಳ್ಳಸಾಗಣೆ",
    or: "ମାଦକ ପାଚାର",
    ml: "മയക്കുമരുന്ന് കടത്ത്",
    pa: "ਨਸ਼ੀਲੇ ਪਦਾਰਥਾਂ ਦੀ ਤਸਕਰੀ",
    as: "মাদক সৰবৰাহ",
    sa: "मादकद्रव्यव्यापारः"
  },
  sec: "NDPS Act",
  punishment: {
    en: "Long imprisonment",
    hi: "दीर्घकालीन कारावास",
    bn: "দীর্ঘমেয়াদী কারাদণ্ড",
    te: "దీర్ఘకాల కారాగారం",
    mr: "दीर्घकालीन कारावास",
    ta: "நீண்ட சிறை",
    gu: "દીર્ઘકાલીન કેદ",
    ur: "طویل قید",
    kn: "ದೀರ್ಘಾವಧಿ ಕಾರಾಗೃಹ",
    or: "ଦୀର୍ଘକାଳୀନ କାରାଦଣ୍ଡ",
    ml: "ദീർഘകാല തടവ്",
    pa: "ਲੰਬੀ ਕੈਦ",
    as: "দীৰ্ঘকালীন কাৰাদণ্ড",
    sa: "दीर्घकालकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Drunk & Drive",
    hi: "नशे में वाहन चलाना",
    bn: "মদ্যপ অবস্থায় গাড়ি চালানো",
    te: "మద్యం సేవించి వాహనం నడపడం",
    mr: "नशेत वाहन चालवणे",
    ta: "மது அருந்தி ஓட்டுதல்",
    gu: "નશામાં વાહન ચલાવવું",
    ur: "نشے میں گاڑی چلانا",
    kn: "ಮದ್ಯಪಾನ ಮಾಡಿ ವಾಹನ ಚಾಲನೆ",
    or: "ମଦ୍ୟପାନ କରି ଯାନ ଚାଳନା",
    ml: "മദ്യപിച്ച് വാഹനമോടിക്കൽ",
    pa: "ਨਸ਼ੇ ਵਿੱਚ ਗੱਡੀ ਚਲਾਉਣਾ",
    as: "মদ্যপ অৱস্থাত বাহন চলোৱা",
    sa: "मद्यपानसमये वाहनचालनम्"
  },
  sec: "MV Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Hit and Run",
    hi: "दुर्घटना कर फरार",
    bn: "দুর্ঘটনা করে পালানো",
    te: "అపఘాతం చేసి పారిపోవడం",
    mr: "अपघात करून पळ काढणे",
    ta: "விபத்து & தப்புதல்",
    gu: "અકસ્માત કરીને ફરાર",
    ur: "حادثہ کرکے فرار",
    kn: "ಅಪಘಾತ ಮಾಡಿ ಪರಾರಿಯಾಗುವುದು",
    or: "ଦୁର୍ଘଟଣା କରି ପଳାୟନ",
    ml: "അപകടം ചെയ്ത് ഓടി രക്ഷപ്പെടൽ",
    pa: "ਹਾਦਸਾ ਕਰਕੇ ਫਰਾਰ",
    as: "দুৰ্ঘটনা কৰি পলাই যোৱা",
    sa: "आघातकृत्वा पलायनम्"
  },
  sec: "IPC 279",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Rash Driving",
    hi: "लापरवाह वाहन चलाना",
    bn: "বেপরোয়া গাড়ি চালানো",
    te: "అజాగ్రత్తగా వాహనం నడపడం",
    mr: "अविचारी वाहन चालवणे",
    ta: "அவசர ஓட்டம்",
    gu: "બેદરકારીથી વાહન ચલાવવું",
    ur: "لاپرواہی سے گاڑی چلانا",
    kn: "ಅಜಾಗರೂಕ ಚಾಲನೆ",
    or: "ଅସାବଧାନ ଚାଳନା",
    ml: "അശ്രദ്ധാപൂർവമായ ഡ്രൈവിംഗ്",
    pa: "ਲਾਪਰਵਾਹੀ ਨਾਲ ਗੱਡੀ ਚਲਾਉਣਾ",
    as: "অসাৱধান বাহন চলোৱা",
    sa: "अविवेकी वाहनचालनम्"
  },
  sec: "IPC 279",
  punishment: {
    en: "6 months",
    hi: "6 महीने",
    bn: "৬ মাস",
    te: "6 నెలలు",
    mr: "6 महिने",
    ta: "6 மாதங்கள்",
    gu: "6 મહિના",
    ur: "6 ماہ",
    kn: "6 ತಿಂಗಳು",
    or: "6 ମାସ",
    ml: "6 മാസം",
    pa: "6 ਮਹੀਨੇ",
    as: "৬ মাহ",
    sa: "षड्मासपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Arms Possession",
    hi: "अवैध हथियार रखना",
    bn: "অস্ত্র ধারণ",
    te: "అక్రమ ఆయుధ కలిగి ఉండడం",
    mr: "बेकायदेशीर शस्त्र बाळगणे",
    ta: "ஆயுதம் வைத்தல்",
    gu: "અवैધ હથિયાર ધરાવવું",
    ur: "غیر قانونی اسلحہ رکھنا",
    kn: "ಅಕ್ರಮ ಶಸ್ತ್ರಾಸ್ತ್ರ ಹೊಂದಿಕೆ",
    or: "ଅସ୍ତ୍ର ଧାରଣ",
    ml: "അനധികൃത ആയുധ കൈവശം",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਹਥਿਆਰ ਰੱਖਣਾ",
    as: "অস্ত্ৰ ধাৰণ",
    sa: "अवैधशस्त्रधारणम्"
  },
  sec: "Arms Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Illegal Mining",
    hi: "अवैध खनन",
    bn: "অবৈধ খনন",
    te: "అక్రమ గనుల తవ్వకం",
    mr: "बेकायदेशीर खनन",
    ta: "சட்டவிரோத சுரங்கம்",
    gu: "અवैધ ખનન",
    ur: "غیر قانونی کان کنی",
    kn: "ಅಕ್ರಮ ಗಣಿಗಾರಿಕೆ",
    or: "ଅବୈଧ ଖନନ",
    ml: "നിയമവിരുദ്ധ ഖനനം",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਖਨਨ",
    as: "অবৈধ খনন",
    sa: "अवैधखननम्"
  },
  sec: "MMDR Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Corruption",
    hi: "भ्रष्टाचार",
    bn: "দুর্নীতি",
    te: "అవినీతి",
    mr: "भ्रष्टाचार",
    ta: "ஊழல்",
    gu: "ભ્રષ્ટાચાર",
    ur: "بدعنوانی",
    kn: "ಭ್ರಷ್ಟಾಚಾರ",
    or: "ଦୁର୍ନୀତି",
    ml: "അഴിമതി",
    pa: "ਭ੍ਰਿਸ਼ਟਾਚਾਰ",
    as: "দুৰ্নীতি",
    sa: "भ्रष्टाचारः"
  },
  sec: "PC Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Bribery",
    hi: "रिश्वत",
    bn: "ঘুষ",
    te: "లంచం",
    mr: "लाच",
    ta: "லஞ்சம்",
    gu: "લાંચ",
    ur: "رشوت",
    kn: "ಲಂಚ",
    or: "ଘୁଷ",
    ml: "ലഞ്ചം",
    pa: "ਰਿਸ਼ਵਤ",
    as: "ঘুষ",
    sa: "घूस"
  },
  sec: "PC Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Money Laundering",
    hi: "धन शोधन",
    bn: "অর্থ পাচার",
    te: "ధన శుద్ధి",
    mr: "पैसा शुद्धीकरण",
    ta: "பண மோசடி",
    gu: "ધન ધોળાઈ",
    ur: "منی لانڈرنگ",
    kn: "ಹಣ ಶುದ್ಧೀಕರಣ",
    or: "ଧନ ପଚାର",
    ml: "പണം വെളുപ്പിക്കൽ",
    pa: "ਮਨੀ ਲਾਂਡਰਿੰਗ",
    as: "ধন ধুৱনি",
    sa: "धनशोधनम्"
  },
  sec: "PMLA",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Tax Evasion",
    hi: "कर चोरी",
    bn: "কর ফাঁকি",
    te: "పన్ను ఎగవేత",
    mr: "करचुकवेगिरी",
    ta: "வரி ஏமாற்றம்",
    gu: "કર ચોરી",
    ur: "ٹیکس چوری",
    kn: "ತೆರಿಗೆ ತಪ್ಪಿಸುವಿಕೆ",
    or: "କର ଚୁକାଇବାରେ ଅନିୟମ",
    ml: "നികുതി വെട്ടിപ്പ്",
    pa: "ਟੈਕਸ ਚੋਰੀ",
    as: "কৰ ফাঁকি",
    sa: "करापहारः"
  },
  sec: "IT Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "House Breaking",
    hi: "गृह भेदन",
    bn: "ঘর ভাঙা",
    te: "ఇంటి తాళం విరగదీసి ప్రవేశం",
    mr: "घरफोडी",
    ta: "வீடு உடைத்து புகுதல்",
    gu: "ઘરફોડ",
    ur: "گھر توڑنا",
    kn: "ಮನೆ ಒಡೆದು ಪ್ರವೇಶ",
    or: "ଘରଭେଦନ",
    ml: "വീട് പൊളിച്ച് കയറൽ",
    pa: "ਘਰ ਤੋੜ ਕੇ ਦਾਖ਼ਲਾ",
    as: "ঘৰ ভঙা",
    sa: "गृहभेदनम्"
  },
  sec: "IPC 445",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Criminal Trespass",
    hi: "आपराधिक अतिक्रमण",
    bn: "অপরাধমূলক অনধিকার প্রবেশ",
    te: "నేరపూరిత అక్రమ ప్రవేశం",
    mr: "गुन्हेगारी अतिक्रमण",
    ta: "சட்டவிரோத நுழைவு",
    gu: "ફોજદારી અતિક્રમણ",
    ur: "مجرمانہ دراندازی",
    kn: "ಅಪರಾಧ ಪ್ರವೇಶ",
    or: "ଆପରାଧିକ ଅନଧିକାର ପ୍ରବେଶ",
    ml: "അപരാധപരമായ അനധികൃത പ്രവേശനം",
    pa: "ਆਪਰਾਧਿਕ ਦਾਖ਼ਲਾ",
    as: "অপৰাধমূলক অনধিকার প্ৰৱেশ",
    sa: "आपराधिकप्रवेशः"
  },
  sec: "IPC 441",
  punishment: {
    en: "3 months",
    hi: "3 महीने",
    bn: "৩ মাস",
    te: "3 నెలలు",
    mr: "3 महिने",
    ta: "3 மாதங்கள்",
    gu: "3 મહિના",
    ur: "3 ماہ",
    kn: "3 ತಿಂಗಳು",
    or: "3 ମାସ",
    ml: "3 മാസം",
    pa: "3 ਮਹੀਨੇ",
    as: "৩ মাহ",
    sa: "त्रिमासपर्यन्तम्"
  },
  lvl: "low"
},

{
  name: {
    en: "Mischief",
    hi: "नुकसान पहुँचाना",
    bn: "ক্ষতি সাধন",
    te: "నష్టం కలిగించడం",
    mr: "नुकसान करणे",
    ta: "சேதம் விளைவித்தல்",
    gu: "નુકસાન કરવું",
    ur: "نقصان پہنچانا",
    kn: "ಹಾನಿ ಮಾಡುವುದು",
    or: "କ୍ଷତି ସାଧନ",
    ml: "നാശം വരുത്തൽ",
    pa: "ਨੁਕਸਾਨ ਪਹੁੰਚਾਉਣਾ",
    as: "ক্ষতি সাধন",
    sa: "हानिकरणम्"
  },
  sec: "IPC 425",
  punishment: {
    en: "Up to 1 year",
    hi: "1 वर्ष तक",
    bn: "১ বছর পর্যন্ত",
    te: "1 సంవత్సరం వరకు",
    mr: "1 वर्षापर्यंत",
    ta: "1 ஆண்டு வரை",
    gu: "1 વર્ષ સુધી",
    ur: "1 سال تک",
    kn: "1 ವರ್ಷವರೆಗೆ",
    or: "1 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "1 വർഷം വരെ",
    pa: "1 ਸਾਲ ਤੱਕ",
    as: "১ বছৰৰ ভিতৰত",
    sa: "एकवर्षपर्यन्तम्"
  },
  lvl: "low"
},

{
  name: {
    en: "Extortion",
    hi: "जबरन वसूली",
    bn: "চাঁদাবাজি",
    te: "బలవంతపు వసూలు",
    mr: "खंडणी",
    ta: "பணமிரட்டல்",
    gu: "જબરદસ્તી વસૂલાત",
    ur: "بھتہ خوری",
    kn: "ಬಲವಂತದ ವಸೂಲಾತಿ",
    or: "ଜବରଦସ୍ତି ଆଦାୟ",
    ml: "പണം പിരിവ്",
    pa: "ਜ਼ਬਰਦਸਤੀ ਵਸੂਲੀ",
    as: "জোৰজবৰদস্তি আদায়",
    sa: "अपहरणद्वारा द्रव्यग्रहणम्"
  },
  sec: "IPC 383",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Stalking",
    hi: "पीछा करना",
    bn: "পিছু নেওয়া",
    te: "వెంటాడటం",
    mr: "पाठलाग",
    ta: "பின்தொடர்வு",
    gu: "પીછો કરવો",
    ur: "پیچھا کرنا",
    kn: "ಹಿಂಬಾಲನೆ",
    or: "ପଛୁଆଁ ଚାଲିବା",
    ml: "പിന്തുടർച്ച",
    pa: "ਪਿੱਛਾ ਕਰਨਾ",
    as: "পিছুফালে অনুসৰণ",
    sa: "अनुसरणम्"
  },
  sec: "IPC 354D",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Voyeurism",
    hi: "दृश्यरति",
    bn: "গুপ্তদর্শন",
    te: "రహస్యంగా చూడడం",
    mr: "गुप्त निरीक्षण",
    ta: "ரகசியமாக படம் எடுதல்",
    gu: "છુપાઈને જોવું",
    ur: "خفیہ نگرانی",
    kn: "ಗುಪ್ತ ನೋಟ",
    or: "ଗୁପ୍ତ ଦର୍ଶନ",
    ml: "രഹസ്യനോട്ടം",
    pa: "ਚੁਪਚਾਪ ਦੇਖਣਾ",
    as: "গোপন দৰ্শন",
    sa: "गुप्तदर्शनम्"
  },
  sec: "IPC 354C",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Dowry Harassment",
    hi: "दहेज उत्पीड़न",
    bn: "পণ হয়রানি",
    te: "వరకట్న వేధింపులు",
    mr: "हुंडा छळ",
    ta: "வரதட்சணை தொல்லை",
    gu: "દહેજ સતામણી",
    ur: "جہیز ہراسانی",
    kn: "ವರದಕ್ಷಿಣೆ ಕಿರುಕುಳ",
    or: "ଯୌତୁକ ଉତ୍ପୀଡନ",
    ml: "വരദക്ഷിണ പീഡനം",
    pa: "ਦਾਜ ਉਤਪੀੜਨ",
    as: "যৌতুক হয়ৰানি",
    sa: "दहेजउत्पीडनम्"
  },
  sec: "IPC 498A",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Child Abuse",
    hi: "बाल शोषण",
    bn: "শিশু নির্যাতন",
    te: "బాల దుర్వినియోగం",
    mr: "बाल अत्याचार",
    ta: "குழந்தை துஷ்பிரயோகம்",
    gu: "બાળ દુર્વ્યવહાર",
    ur: "بچوں پر تشدد",
    kn: "ಮಕ್ಕಳ ದೌರ್ಜನ್ಯ",
    or: "ଶିଶୁ ନିର୍ଯାତନା",
    ml: "കുട്ടികളുടെ പീഡനം",
    pa: "ਬੱਚਿਆਂ ਨਾਲ ਦੁਰਵਿਹਾਰ",
    as: "শিশু নিৰ্যাতন",
    sa: "बालदुर्व्यवहारः"
  },
  sec: "POCSO Act",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Child Marriage",
    hi: "बाल विवाह",
    bn: "বাল্যবিবাহ",
    te: "బాల్య వివాహం",
    mr: "बालविवाह",
    ta: "குழந்தை திருமணம்",
    gu: "બાળલગ્ન",
    ur: "کم عمری کی شادی",
    kn: "ಬಾಲ್ಯವಿವಾಹ",
    or: "ଶିଶୁ ବିବାହ",
    ml: "ശിശു വിവാഹം",
    pa: "ਬਾਲ ਵਿਆਹ",
    as: "বাল্যবিবাহ",
    sa: "बालविवाहः"
  },
  sec: "PCMA Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Illegal Detention",
    hi: "अवैध निरोध",
    bn: "অবৈধ আটক",
    te: "అక్రమ నిర్బంధం",
    mr: "बेकायदेशीर नजरकैद",
    ta: "சட்டவிரோத அடைப்பு",
    gu: "અवैધ કેદ",
    ur: "غیر قانونی حراست",
    kn: "ಅಕ್ರಮ ಬಂಧನ",
    or: "ଅବୈଧ ଅଟକ",
    ml: "നിയമവിരുദ്ധ തടങ്കൽ",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਹਿਰਾਸਤ",
    as: "অবৈধ আটক",
    sa: "अवैधनिरोधः"
  },
  sec: "IPC 340",
  punishment: {
    en: "1 month",
    hi: "1 महीना",
    bn: "১ মাস",
    te: "1 నెల",
    mr: "1 महिना",
    ta: "1 மாதம்",
    gu: "1 મહિનો",
    ur: "1 مہینہ",
    kn: "1 ತಿಂಗಳು",
    or: "1 ମାସ",
    ml: "1 മാസം",
    pa: "1 ਮਹੀਨਾ",
    as: "১ মাহ",
    sa: "एकमासपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Wrongful Restraint",
    hi: "गलत अवरोध",
    bn: "অন্যায় বাধা",
    te: "తప్పు నిరోధం",
    mr: "चुकीची अडथळा",
    ta: "தவறான தடை",
    gu: "ખોટો અવરોધ",
    ur: "غلط روک",
    kn: "ತಪ್ಪಾದ ತಡೆ",
    or: "ଅନ୍ୟାୟ ଅବରୋଧ",
    ml: "അന്യായ തടസം",
    pa: "ਗਲਤ ਰੋਕ",
    as: "অন্যায় বাধা",
    sa: "अन्यायप्रतिबन्धः"
  },
  sec: "IPC 339",
  punishment: {
    en: "1 month",
    hi: "1 महीना",
    bn: "১ মাস",
    te: "1 నెల",
    mr: "1 महिना",
    ta: "1 மாதம்",
    gu: "1 મહિનો",
    ur: "1 مہینہ",
    kn: "1 ತಿಂಗಳು",
    or: "1 ମାସ",
    ml: "1 മാസം",
    pa: "1 ਮਹੀਨਾ",
    as: "১ মাহ",
    sa: "एकमासपर्यन्तम्"
  },
  lvl: "low"
},

{
  name: {
    en: "Wrongful Confinement",
    hi: "गलत निरुद्ध",
    bn: "অন্যায় আটক",
    te: "తప్పు నిర్బంధం",
    mr: "चुकीची नजरकैद",
    ta: "தவறான சிறை",
    gu: "ખોટી કેદ",
    ur: "غلط قید",
    kn: "ತಪ್ಪಾದ ಬಂಧನ",
    or: "ଅନ୍ୟାୟ ଅଟକ",
    ml: "അന്യായ തടങ്കൽ",
    pa: "ਗਲਤ ਕੈਦ",
    as: "অন্যায় আটক",
    sa: "अन्यायनिरोधः"
  },
  sec: "IPC 340",
  punishment: {
    en: "Up to 1 year",
    hi: "1 वर्ष तक",
    bn: "১ বছর পর্যন্ত",
    te: "1 సంవత్సరం వరకు",
    mr: "1 वर्षापर्यंत",
    ta: "1 ஆண்டு வரை",
    gu: "1 વર્ષ સુધી",
    ur: "1 سال تک",
    kn: "1 ವರ್ಷವರೆಗೆ",
    or: "1 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "1 വർഷം വരെ",
    pa: "1 ਸਾਲ ਤੱਕ",
    as: "১ বছৰৰ ভিতৰত",
    sa: "एकवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Assault",
    hi: "हमला",
    bn: "আক্রমণ",
    te: "దాడి",
    mr: "हल्ला",
    ta: "தாக்குதல்",
    gu: "હુમલો",
    ur: "حملہ",
    kn: "ದಾಳಿ",
    or: "ଆକ୍ରମଣ",
    ml: "ആക്രമണം",
    pa: "ਹਮਲਾ",
    as: "আক্রমণ",
    sa: "आक्रमणम्"
  },
  sec: "IPC 351",
  punishment: {
    en: "Up to 3 months",
    hi: "3 महीने तक",
    bn: "৩ মাস পর্যন্ত",
    te: "3 నెలల వరకు",
    mr: "3 महिन्यांपर्यंत",
    ta: "3 மாதங்கள்",
    gu: "3 મહિના સુધી",
    ur: "3 ماہ تک",
    kn: "3 ತಿಂಗಳವರೆಗೆ",
    or: "3 ମାସ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 മാസം വരെ",
    pa: "3 ਮਹੀਨੇ ਤੱਕ",
    as: "৩ মাহ",
    sa: "त्रिमासपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Grievous Hurt",
    hi: "गंभीर चोट",
    bn: "গুরুতর আঘাত",
    te: "తీవ్ర గాయం",
    mr: "गंभीर इजा",
    ta: "கடுமையான காயம்",
    gu: "ગંભીર ઇજા",
    ur: "سنگین چوٹ",
    kn: "ಗಂಭೀರ ಗಾಯ",
    or: "ଗୁରୁତର ଆହତ",
    ml: "ഗുരുതര പരിക്ക്",
    pa: "ਗੰਭੀਰ ਚੋਟ",
    as: "গুৰুতৰ আঘাত",
    sa: "गम्भीरव्रणः"
  },
  sec: "IPC 320",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Public Gambling",
    hi: "सार्वजनिक जुआ",
    bn: "সার্বজনিক জুয়া",
    te: "ప్రజా జూదం",
    mr: "सार्वजनिक जुगार",
    ta: "பொது சூதாட்டம்",
    gu: "જાહેર જુગાર",
    ur: "عوامی جواء",
    kn: "ಸಾರ್ವಜನಿಕ ಜೂಜು",
    or: "ସାର୍ବଜନୀନ ଜୁଆ",
    ml: "പൊതു ചൂതാട്ടം",
    pa: "ਸਾਰਵਜਨਿਕ ਜੂਆ",
    as: "সাৰ্বজনিক জুৱা",
    sa: "सार्वजनिकद्यूतम्"
  },
  sec: "Public Gambling Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "low"
},

 {
  name: {
    en: "Illegal Betting",
    hi: "अवैध सट्टेबाजी",
    bn: "অবৈধ বাজি",
    te: "అక్రమ బెట్టింగ్",
    mr: "बेकायदेशीर सट्टा",
    ta: "சட்டவிரோத பந்தயம்",
    gu: "ગેરકાયદેસર શરત",
    ur: "غیر قانونی شرط",
    kn: "ಅಕ್ರಮ ಪಣವಾಡು",
    or: "ଅବୈଧ ପାଣ୍ଡି",
    ml: "നിയമവിരുദ്ധ പന്തയം",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਸੱਟਾ",
    as: "অবৈধ বাজি",
    sa: "अवैधपणः"
  },
  sec: "IPC 294A",
  punishment: {
    en: "Fine",
    hi: "जुर्माना",
    bn: "জরিমানা",
    te: "జరిమానా",
    mr: "दंड",
    ta: "அபராதம்",
    gu: "દંડ",
    ur: "جرمانہ",
    kn: "ದಂಡ",
    or: "ଜରିମାନା",
    ml: "പിഴ",
    pa: "ਜੁਰਮਾਨਾ",
    as: "জৰিমনা",
    sa: "दण्डः"
  },
  lvl: "low"
},

{
  name: {
    en: "Fake News Spread",
    hi: "फर्जी समाचार प्रसार",
    bn: "ভুয়া সংবাদ প্রচার",
    te: "తప్పుడు వార్తల వ్యాప్తి",
    mr: "खोटी बातमी प्रसार",
    ta: "பொய் செய்தி பரப்பல்",
    gu: "ખોટી ખબર ફેલાવવી",
    ur: "جھوٹی خبر پھیلانا",
    kn: "ಸುಳ್ಳು ಸುದ್ದಿ ಹರಡುವುದು",
    or: "ଭୁଲ ସମାଚାର ପ୍ରସାର",
    ml: "വ്യാജ വാർത്ത പ്രചരിപ്പിക്കൽ",
    pa: "ਝੂਠੀ ਖ਼ਬਰ ਫੈਲਾਉਣਾ",
    as: "ভুৱা সংবাদ প্ৰচাৰ",
    sa: "मिथ्यासमाचारप्रसारणम्"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Online Abuse",
    hi: "ऑनलाइन उत्पीड़न",
    bn: "অনলাইন নির্যাতন",
    te: "ఆన్‌లైన్ దుర్వినియోగం",
    mr: "ऑनलाइन छळ",
    ta: "இணைய துஷ்பிரயோகம்",
    gu: "ઓનલાઇન દુર્વ્યવહાર",
    ur: "آن لائن بدسلوکی",
    kn: "ಆನ್‌ಲೈನ್ ದುರುಪಯೋಗ",
    or: "ଅନଲାଇନ ନିର୍ଯାତନା",
    ml: "ഓൺലൈൻ പീഡനം",
    pa: "ਆਨਲਾਈਨ ਦੁਰਵਿਹਾਰ",
    as: "অনলাইন নিৰ্যাতন",
    sa: "जालदुर्व्यवहारः"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Cyber Bullying",
    hi: "साइबर धमकाना",
    bn: "সাইবার বুলিং",
    te: "సైబర్ వేధింపులు",
    mr: "सायबर छळ",
    ta: "இணைய தொல்லை",
    gu: "સાયબર ધમકી",
    ur: "سائبر ہراسانی",
    kn: "ಸೈಬರ್ ಕಿರುಕುಳ",
    or: "ସାଇବର ଉତ୍ପୀଡନ",
    ml: "സൈബർ പീഡനം",
    pa: "ਸਾਇਬਰ ਧਮਕਾਉਣਾ",
    as: "চাইবাৰ বুলিং",
    sa: "साइबरउत्पीडनम्"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Phishing",
    hi: "फ़िशिंग धोखाधड़ी",
    bn: "ফিশিং প্রতারণা",
    te: "ఫిషింగ్ మోసం",
    mr: "फिशिंग फसवणूक",
    ta: "பிஷிங் மோசடி",
    gu: "ફિશિંગ છેતરપિંડી",
    ur: "فشنگ فراڈ",
    kn: "ಫಿಶಿಂಗ್ ಮೋಸ",
    or: "ଫିସିଂ ଠକେଇ",
    ml: "ഫിഷിംഗ് തട്ടിപ്പ്",
    pa: "ਫਿਸ਼ਿੰਗ ਧੋਖਾਧੜੀ",
    as: "ফিশিং প্ৰতাৰণা",
    sa: "फिशिंगछलनम्"
  },
  sec: "IT Act 66D",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Email Spoofing",
    hi: "ईमेल जालसाजी",
    bn: "ইমেল জালিয়াতি",
    te: "ఇమెయిల్ నకిలీ",
    mr: "ईमेल बनावट",
    ta: "மின்னஞ்சல் போலி",
    gu: "ઈમેઇલ નકલી",
    ur: "ای میل جعلسازی",
    kn: "ಇಮೇಲ್ ನಕಲಿ",
    or: "ଇମେଲ ନକଲ",
    ml: "ഇമെയിൽ വ്യാജം",
    pa: "ਈਮੇਲ ਜਾਲਸਾਜ਼ੀ",
    as: "ইমেইল জালিয়াতি",
    sa: "ईमेलकूटलेखनम्"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "ATM Fraud",
    hi: "एटीएम धोखाधड़ी",
    bn: "এটিএম প্রতারণা",
    te: "ఏటీఎం మోసం",
    mr: "एटीएम फसवणूक",
    ta: "ATM மோசடி",
    gu: "એટીએમ છેતરપિંડી",
    ur: "اے ٹی ایم فراڈ",
    kn: "ಎಟಿಎಂ ಮೋಸ",
    or: "ଏଟିଏମ ଠକେଇ",
    ml: "എടിഎം തട്ടിപ്പ്",
    pa: "ਏਟੀਐਮ ਧੋਖਾਧੜੀ",
    as: "এটিএম প্ৰতাৰণা",
    sa: "एटीएमछलनम्"
  },
  sec: "IPC 420",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Credit Card Fraud",
    hi: "क्रेडिट कार्ड धोखाधड़ी",
    bn: "ক্রেডিট কার্ড প্রতারণা",
    te: "క్రెడిట్ కార్డ్ మోసం",
    mr: "क्रेडिट कार्ड फसवणूक",
    ta: "கிரெடிட் கார்டு மோசடி",
    gu: "ક્રેડિટ કાર્ડ છેતરપિંડી",
    ur: "کریڈٹ کارڈ فراڈ",
    kn: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಮೋಸ",
    or: "କ୍ରେଡିଟ୍ କାର୍ଡ ଠକେଇ",
    ml: "ക്രെഡിറ്റ് കാർഡ് തട്ടിപ്പ്",
    pa: "ਕ੍ਰੈਡਿਟ ਕਾਰਡ ਧੋਖਾਧੜੀ",
    as: "ক্ৰেডিট কাৰ্ড প্ৰতাৰণা",
    sa: "क्रेडिटकार्डछलनम्"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Fake Certificate",
    hi: "जाली प्रमाणपत्र",
    bn: "ভুয়া শংসাপত্র",
    te: "నకిలీ ధృవీకరణ పత్రం",
    mr: "बनावट प्रमाणपत्र",
    ta: "போலி சான்றிதழ்",
    gu: "ખોટું પ્રમાણપત્ર",
    ur: "جعلی سرٹیفکیٹ",
    kn: "ನಕಲಿ ಪ್ರಮಾಣಪತ್ರ",
    or: "ନକଲ ସାର୍ଟିଫିକେଟ୍",
    ml: "വ്യാജ സർട്ടിഫിക്കറ്റ്",
    pa: "ਨਕਲੀ ਸਰਟੀਫਿਕੇਟ",
    as: "ভুৱা প্ৰমাণপত্ৰ",
    sa: "कूटप्रमाणपत्रम्"
  },
  sec: "IPC 465",
  punishment: {
    en: "Up to 2 years",
    hi: "2 वर्ष तक",
    bn: "২ বছর পর্যন্ত",
    te: "2 సంవత్సరాల వరకు",
    mr: "2 वर्षांपर्यंत",
    ta: "2 ஆண்டுகள் வரை",
    gu: "2 વર્ષ સુધી",
    ur: "2 سال تک",
    kn: "2 ವರ್ಷಗಳವರೆಗೆ",
    or: "2 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "2 വർഷം വരെ",
    pa: "2 ਸਾਲ ਤੱਕ",
    as: "২ বছৰৰ ভিতৰত",
    sa: "द्विवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Impersonation",
    hi: "छद्म रूप धारण",
    bn: "ছদ্মবেশ ধারণ",
    te: "నకిలీ వ్యక్తిత్వం",
    mr: "खोटा अवतार",
    ta: "போலி அடையாளம்",
    gu: "ખોટી ઓળખ",
    ur: "جعلی شناخت",
    kn: "ನಕಲಿ ವ್ಯಕ್ತಿತ್ವ",
    or: "ନକଲ ପରିଚୟ",
    ml: "അവതരണ വഞ്ചന",
    pa: "ਝੂਠੀ ਪਛਾਣ",
    as: "ভুৱা পৰিচয়",
    sa: "छद्मपरिचयः"
  },
  sec: "IPC 416",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Passport Forgery",
    hi: "पासपोर्ट जालसाजी",
    bn: "পাসপোর্ট জালিয়াতি",
    te: "పాస్‌పోర్ట్ నకిలీ",
    mr: "पासपोर्ट बनावट",
    ta: "பாஸ்போர்ட் போலி",
    gu: "પાસપોર્ટ નકલી",
    ur: "پاسپورٹ جعلسازی",
    kn: "ಪಾಸ್‌ಪೋರ್ಟ್ ನಕಲಿ",
    or: "ପାସପୋର୍ଟ ଜାଲି",
    ml: "പാസ്‌പോർട്ട് വ്യാജം",
    pa: "ਪਾਸਪੋਰਟ ਜਾਲਸਾਜ਼ੀ",
    as: "পাছপোৰ্ট জালিয়াতি",
    sa: "पासपोर्टकूटलेखनम्"
  },
  sec: "Passport Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Illegal Immigration",
    hi: "अवैध आव्रजन",
    bn: "অবৈধ অভিবাসন",
    te: "అక్రమ వలస",
    mr: "बेकायदेशीर स्थलांतर",
    ta: "சட்டவிரோத குடியேற்றம்",
    gu: "ગેરકાયદેસર વસવાટ",
    ur: "غیر قانونی امیگریشن",
    kn: "ಅಕ್ರಮ ವಲಸೆ",
    or: "ଅବୈଧ ପ୍ରବାସ",
    ml: "നിയമവിരുദ്ധ കുടിയേറ്റം",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਇਮੀਗ੍ਰੇਸ਼ਨ",
    as: "অবৈধ অভিবাসন",
    sa: "अवैधप्रवासनम्"
  },
  sec: "Foreigners Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Smuggling",
    hi: "तस्करी",
    bn: "চোরাচালান",
    te: "స్మగ్లింగ్",
    mr: "तस्करी",
    ta: "கடத்தல்",
    gu: "સ્મગ્લિંગ",
    ur: "اسمگلنگ",
    kn: "ಕಳ್ಳಸಾಗಣೆ",
    or: "ଚୋରାଚାଲାନ",
    ml: "കടത്ത്",
    pa: "ਤਸਕਰੀ",
    as: "চোৰাচালান",
    sa: "तस्करी"
  },
  sec: "Customs Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Wildlife Poaching",
    hi: "वन्यजीव शिकार",
    bn: "বন্যপ্রাণী শিকার",
    te: "వన్యప్రాణి వేట",
    mr: "वन्यजीव शिकार",
    ta: "வனவிலங்கு வேட்டை",
    gu: "વન્યજીવ શિકાર",
    ur: "جنگلی حیات کا شکار",
    kn: "ವನ್ಯಜೀವಿ ಬೇಟೆ",
    or: "ବନ୍ୟପ୍ରାଣୀ ସିକାର",
    ml: "വന്യജീവി വേട്ട",
    pa: "ਜੰਗਲੀ ਜੀਵ ਸ਼ਿਕਾਰ",
    as: "বন্যপ্ৰাণী শিকার",
    sa: "वन्यजीववधः"
  },
  sec: "Wildlife Act",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Environmental Pollution",
    hi: "पर्यावरण प्रदूषण",
    bn: "পরিবেশ দূষণ",
    te: "పర్యావరణ కాలుష్యం",
    mr: "पर्यावरण प्रदूषण",
    ta: "சுற்றுச்சூழல் மாசு",
    gu: "પર્યાવરણીય પ્રદૂષણ",
    ur: "ماحولیاتی آلودگی",
    kn: "ಪರಿಸರ ಮಾಲಿನ್ಯ",
    or: "ପରିବେଶ ଦୂଷଣ",
    ml: "പരിസ്ഥിതി മലിനീകരണം",
    pa: "ਵਾਤਾਵਰਣ ਪ੍ਰਦੂਸ਼ਣ",
    as: "পৰিৱেশ দূষণ",
    sa: "पर्यावरणप्रदूषणम्"
  },
  sec: "EPA Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},
{
  name: {
    en: "Illegal Sand Mining",
    hi: "अवैध रेत खनन",
    bn: "অবৈধ বালু উত্তোলন",
    te: "అక్రమ ఇసుక తవ్వకం",
    mr: "बेकायदेशीर वाळू उत्खनन",
    ta: "சட்டவிரோத மணல் எடுப்பு",
    gu: "ગેરકાયદેસર રેતી ખનન",
    ur: "غیر قانونی ریت کی کان کنی",
    kn: "ಅಕ್ರಮ ಮರಳು ಗಣಿಗಾರಿಕೆ",
    or: "ଅବୈଧ ବାଲୁକା ଖନନ",
    ml: "നിയമവിരുദ്ധ മണൽ ഖനനം",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਰੇਤ ਖਨਨ",
    as: "অবৈধ বালু খনন",
    sa: "अवैधवालुकाखननम्"
  },
  sec: "MMDR Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Electricity Theft",
    hi: "बिजली चोरी",
    bn: "বিদ্যুৎ চুরি",
    te: "విద్యుత్ చోరీ",
    mr: "वीज चोरी",
    ta: "மின்சாரம் திருட்டு",
    gu: "વિજળી ચોરી",
    ur: "بجلی چوری",
    kn: "ವಿದ್ಯುತ್ ಕಳ್ಳತನ",
    or: "ବିଦ୍ୟୁତ୍ ଚୋରି",
    ml: "വൈദ്യുതി മോഷണം",
    pa: "ਬਿਜਲੀ ਚੋਰੀ",
    as: "বিদ্যুৎ চুৰি",
    sa: "विद्युत्चौर्यम्"
  },
  sec: "Electricity Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Food Adulteration",
    hi: "खाद्य मिलावट",
    bn: "খাদ্য ভেজাল",
    te: "ఆహార కల్తీ",
    mr: "अन्न भेसळ",
    ta: "உணவு கலப்படம்",
    gu: "ખાદ્ય મિલાવટ",
    ur: "غذائی ملاوٹ",
    kn: "ಆಹಾರ ಮಿಶ್ರಣ",
    or: "ଖାଦ୍ୟ ମିଶ୍ରଣ",
    ml: "ഭക്ഷ്യ കലർപ്പ്",
    pa: "ਖਾਦ ਮਿਲਾਵਟ",
    as: "খাদ্য ভেজাল",
    sa: "आहारमिश्रणम्"
  },
  sec: "FSS Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Medical Negligence",
    hi: "चिकित्सीय लापरवाही",
    bn: "চিকিৎসাগত অবহেলা",
    te: "వైద్య నిర్లక్ష్యం",
    mr: "वैद्यकीय निष्काळजीपणा",
    ta: "மருத்துவ அலட்சியம்",
    gu: "વૈદ્યકીય બેદરકારી",
    ur: "طبی غفلت",
    kn: "ವೈದ್ಯಕೀಯ ನಿರ್ಲಕ್ಷ್ಯ",
    or: "ଚିକିତ୍ସା ଅବହେଳା",
    ml: "മെഡിക്കൽ അനാസ്ഥ",
    pa: "ਚਿਕਿਤਸਕ ਲਾਪਰਵਾਹੀ",
    as: "চিকিৎসা অবহেলা",
    sa: "चिकित्सानिर्लक्ष्यम्"
  },
  sec: "IPC 304A",
  punishment: {
    en: "Up to 2 years",
    hi: "2 वर्ष तक",
    bn: "২ বছর পর্যন্ত",
    te: "2 సంవత్సరాల వరకు",
    mr: "2 वर्षांपर्यंत",
    ta: "2 ஆண்டுகள் வரை",
    gu: "2 વર્ષ સુધી",
    ur: "2 سال تک",
    kn: "2 ವರ್ಷಗಳವರೆಗೆ",
    or: "2 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "2 വർഷം വരെ",
    pa: "2 ਸਾਲ ਤੱਕ",
    as: "২ বছৰৰ ভিতৰত",
    sa: "द्विवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Illegal Organ Trade",
    hi: "अवैध अंग व्यापार",
    bn: "অবৈধ অঙ্গ পাচার",
    te: "అక్రమ అవయవ వ్యాపారం",
    mr: "बेकायदेशीर अवयव व्यापार",
    ta: "உறுப்பு கடத்தல்",
    gu: "અવૈધ અંગ વેપાર",
    ur: "غیر قانونی اعضاء کی تجارت",
    kn: "ಅಕ್ರಮ ಅಂಗ ವ್ಯಾಪಾರ",
    or: "ଅବୈଧ ଅଙ୍ଗ ବ୍ୟବସାୟ",
    ml: "അനധികൃത അവയവക്കച്ചവടം",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਅੰਗ ਵਪਾਰ",
    as: "অবৈধ অঙ্গ ব্যৱসায়",
    sa: "अवैधाङ्गव्यापारः"
  },
  sec: "THOA Act",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Begging Racket",
    hi: "भीख मंगवाने का गिरोह",
    bn: "ভিক্ষাবৃত্তি চক্র",
    te: "భిక్షాటన ముఠా",
    mr: "भिक्षावृत्ती रॅकेट",
    ta: "பிச்சை மோசடி",
    gu: "ભીખ માગવાની ટોળકી",
    ur: "بھیک مانگنے کا گینگ",
    kn: "ಭಿಕ್ಷಾಟನೆ ಗುಂಪು",
    or: "ଭିକ୍ଷା ଚକ୍ର",
    ml: "ഭിക്ഷാടക സംഘം",
    pa: "ਭਿੱਖ ਮੰਗਣ ਵਾਲਾ ਗਿਰੋਹ",
    as: "ভিক্ষাবৃত্তি চক্ৰ",
    sa: "भिक्षाटनचक्रः"
  },
  sec: "IPC 363A",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "low"
},

{
  name: {
    en: "Fake NGO Scam",
    hi: "फर्जी एनजीओ घोटाला",
    bn: "ভুয়া এনজিও কেলেঙ্কারি",
    te: "నకిలీ ఎన్జీవో మోసం",
    mr: "बनावट एनजीओ घोटाळा",
    ta: "போலி NGO மோசடி",
    gu: "નકલી એનજીઓ કૌભાંડ",
    ur: "جعلی این جی او اسکینڈل",
    kn: "ನಕಲಿ ಎನ್‌ಜಿಓ ಮೋಸ",
    or: "ଭୁଆ ଏନଜିଓ ଠକେଇ",
    ml: "വ്യാജ എൻജിഒ തട്ടിപ്പ്",
    pa: "ਨਕਲੀ ਐਨਜੀਓ ਘਪਲਾ",
    as: "ভুৱা এনজিঅ’ কেলেঙ্কাৰী",
    sa: "कूटएनजीओछलनम्"
  },
  sec: "IPC 420",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Land Grabbing",
    hi: "भूमि हड़पना",
    bn: "জমি দখল",
    te: "భూమి ఆక్రమణ",
    mr: "जमीन बळकावणे",
    ta: "நிலம் அபகரிப்பு",
    gu: "જમીન કબજો",
    ur: "زمین پر قبضہ",
    kn: "ಭೂಮಿ ಅಕ್ರಮ ವಶ",
    or: "ଭୂମି ଦଖଲ",
    ml: "ഭൂമി കയ്യേറ്റം",
    pa: "ਜ਼ਮੀਨ ਕਬਜ਼ਾ",
    as: "ভূমি দখল",
    sa: "भूम्यपहरणम्"
  },
  sec: "IPC 447",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Election Malpractice",
    hi: "चुनाव कदाचार",
    bn: "নির্বাচনী অনিয়ম",
    te: "ఎన్నికల అక్రమాలు",
    mr: "निवडणूक गैरप्रकार",
    ta: "தேர்தல் மோசடி",
    gu: "ચૂંટણી ગેરરીતિ",
    ur: "انتخابی بدعنوانی",
    kn: "ಚುನಾವಣಾ ಅಕ್ರಮ",
    or: "ନିର୍ବାଚନ ଅନିୟମ",
    ml: "തിരഞ്ഞെടുപ്പ് അഴിമതി",
    pa: "ਚੋਣ ਧਾਂਧਲੀ",
    as: "নিৰ্বাচনী অনিয়ম",
    sa: "निर्वाचनदुराचारः"
  },
  sec: "RP Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Hate Speech",
    hi: "घृणास्पद भाषण",
    bn: "ঘৃণামূলক বক্তব্য",
    te: "ద్వేషపూరిత ప్రసంగం",
    mr: "द्वेषपूर्ण भाषण",
    ta: "வெறுப்பு பேச்சு",
    gu: "દ્વેષપૂર્ણ ભાષણ",
    ur: "نفرت انگیز تقریر",
    kn: "ದ್ವೇಷ ಭಾಷಣ",
    or: "ଘୃଣାମୂଳକ ଭାଷଣ",
    ml: "വിദ്വേഷ പ്രസംഗം",
    pa: "ਨਫ਼ਰਤੀ ਭਾਸ਼ਣ",
    as: "ঘৃণামূলক ভাষণ",
    sa: "द्वेषपूर्णभाषणम्"
  },
  sec: "IPC 153A",
  punishment: {
    en: "Up to 3 years",
    hi: "3 वर्ष तक",
    bn: "৩ বছর পর্যন্ত",
    te: "3 సంవత్సరాల వరకు",
    mr: "3 वर्षांपर्यंत",
    ta: "3 ஆண்டுகள் வரை",
    gu: "3 વર્ષ સુધી",
    ur: "3 سال تک",
    kn: "3 ವರ್ಷಗಳವರೆಗೆ",
    or: "3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "3 വർഷം വരെ",
    pa: "3 ਸਾਲ ਤੱਕ",
    as: "৩ বছৰৰ ভিতৰত",
    sa: "त्रिवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Communal Violence",
    hi: "सांप्रदायिक हिंसा",
    bn: "সাম্প্রদায়িক হিংসা",
    te: "సామూహిక హింస",
    mr: "सांप्रदायिक हिंसा",
    ta: "சமூக வன்முறை",
    gu: "સાંપ્રદાયિક હિંસા",
    ur: "فرقہ وارانہ تشدد",
    kn: "ಸಾಂಪ್ರದಾಯಿಕ ಹಿಂಸೆ",
    or: "ସାମ୍ପ୍ରଦାୟିକ ହିଂସା",
    ml: "സാമുദായിക അക്രമം",
    pa: "ਸਾਂਪ੍ਰਦਾਇਕ ਹਿੰਸਾ",
    as: "সাম্প্ৰদায়িক হিংসা",
    sa: "साम्प्रदायिकहिंसा"
  },
  sec: "IPC",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Contempt of Court",
    hi: "न्यायालय की अवमानना",
    bn: "আদালত অবমাননা",
    te: "న్యాయస్థాన అవమానం",
    mr: "न्यायालयाचा अवमान",
    ta: "நீதிமன்ற அவமதிப்பு",
    gu: "અદાલત અવમાનના",
    ur: "عدالت کی توہین",
    kn: "ನ್ಯಾಯಾಲಯ ಅವಮಾನ",
    or: "ନ୍ୟାୟାଳୟ ଅବମାନନା",
    ml: "കോടതി അവഹേളന",
    pa: "ਅਦਾਲਤ ਦੀ ਅਵਮਾਨਨਾ",
    as: "আদালতৰ অৱমাননা",
    sa: "न्यायालयावमानना"
  },
  sec: "CoC Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},
{
  name: {
    en: "Illegal Arms Trafficking",
    hi: "अवैध हथियार तस्करी",
    bn: "অবৈধ অস্ত্র পাচার",
    te: "అక్రమ ఆయుధాల అక్రమ రవాణా",
    mr: "बेकायदेशीर शस्त्र तस्करी",
    ta: "சட்டவிரோத ஆயுத கடத்தல்",
    gu: "અवैધ હથિયાર તસ્કરી",
    ur: "غیر قانونی اسلحہ اسمگلنگ",
    kn: "ಅಕ್ರಮ ಶಸ್ತ್ರಾಸ್ತ್ರ ಕಳ್ಳಸಾಗಣೆ",
    or: "ଅବୈଧ ଅସ୍ତ୍ର ପାଚାର",
    ml: "അനധികൃത ആയുധ കടത്ത്",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਹਥਿਆਰ ਤਸਕਰੀ",
    as: "অবৈধ অস্ত্ৰ সৰবৰাহ",
    sa: "अवैधशस्त्रतस्करी"
  },
  sec: "Arms Act",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Bomb Threat",
    hi: "बम की धमकी",
    bn: "বোমা হুমকি",
    te: "బాంబు బెదిరింపు",
    mr: "बॉम्ब धमकी",
    ta: "வெடிகுண்டு மிரட்டல்",
    gu: "બોમ્બ ધમકી",
    ur: "بم کی دھمکی",
    kn: "ಬಾಂಬ್ ಬೆದರಿಕೆ",
    or: "ବୋମା ଧମକ",
    ml: "ബോംബ് ഭീഷണി",
    pa: "ਬੰਬ ਧਮਕੀ",
    as: "বোমা ভাবুকি",
    sa: "बमधमकी"
  },
  sec: "IPC 505",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Terror Funding",
    hi: "आतंकवाद वित्तपोषण",
    bn: "সন্ত্রাসী অর্থায়ন",
    te: "ఉగ్రవాద నిధుల సమకూర్చడం",
    mr: "दहशतवादी अर्थसहाय्य",
    ta: "தீவிரவாத நிதி",
    gu: "આતંકવાદી નાણાં પુરવઠો",
    ur: "دہشت گردی کی مالی معاونت",
    kn: "ಭಯೋತ್ಪಾದಕ ಹಣಕಾಸು",
    or: "ଆତଙ୍କବାଦୀ ଅର୍ଥ ପୋଷଣ",
    ml: "ഭീകരവാദ ധനസഹായം",
    pa: "ਆਤੰਕਵਾਦੀ ਫੰਡਿੰਗ",
    as: "সন্ত্ৰাসবাদী অৰ্থপোষণ",
    sa: "आतंकवित्तपोषणम्"
  },
  sec: "UAPA",
  punishment: {
    en: "Life imprisonment",
    hi: "आजीवन कारावास",
    bn: "যাবজ্জীবন কারাদণ্ড",
    te: "ఆజీవ కారాగారం",
    mr: "आजीवन कारावास",
    ta: "ஆயுள் சிறை",
    gu: "આજીવન કેદ",
    ur: "عمر قید",
    kn: "ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or: "ଆଜୀବନ କାରାଦଣ୍ଡ",
    ml: "ജീവപര്യന്തം തടവ്",
    pa: "ਉਮਰ ਕੈਦ",
    as: "আজীৱন কাৰাদণ্ড",
    sa: "आजीवनकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Terrorist Act",
    hi: "आतंकवादी कृत्य",
    bn: "সন্ত্রাসবাদী কার্যকলাপ",
    te: "ఉగ్రవాద చర్య",
    mr: "दहशतवादी कृत्य",
    ta: "தீவிரவாத செயல்",
    gu: "આતંકવાદી કૃત્ય",
    ur: "دہشت گردی کا عمل",
    kn: "ಭಯೋತ್ಪಾದಕ ಕೃತ್ಯ",
    or: "ଆତଙ୍କବାଦୀ କାର୍ଯ୍ୟ",
    ml: "ഭീകരവാദ പ്രവർത്തനം",
    pa: "ਆਤੰਕਵਾਦੀ ਕਰਤੂਤ",
    as: "সন্ত্ৰাসবাদী কাৰ্য",
    sa: "आतंकवादीकृत्यम्"
  },
  sec: "UAPA",
  punishment: {
    en: "Death / Life imprisonment",
    hi: "मृत्युदंड / आजीवन कारावास",
    bn: "মৃত্যুদণ্ড / যাবজ্জীবন কারাদণ্ড",
    te: "మరణదండన / ఆజీవ కారాగారం",
    mr: "मृत्युदंड / आजीवन कारावास",
    ta: "மரணம் / ஆயுள் சிறை",
    gu: "મૃત્યુદંડ / આજીવન કેદ",
    ur: "سزائے موت / عمر قید",
    kn: "ಮರಣದಂಡನೆ / ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or: "ମୃତ୍ୟୁଦଣ୍ଡ / ଆଜୀବନ କାରାଦଣ୍ଡ",
    ml: "വധശിക്ഷ / ജീവപര്യന്തം തടവ്",
    pa: "ਮੌਤ ਦੀ ਸਜ਼ਾ / ਉਮਰ ਕੈਦ",
    as: "মৃত্যুদণ্ড / আজীৱন কাৰাদণ্ড",
    sa: "मृत्युदण्डः / आजीवनकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Fake Currency Circulation",
    hi: "नकली मुद्रा प्रचलन",
    bn: "জাল মুদ্রা প্রচলন",
    te: "నకిలీ కరెన్సీ ప్రచారం",
    mr: "बनावट चलन प्रसार",
    ta: "போலி நாணயம் பரவல்",
    gu: "નકલી ચલણ પ્રસાર",
    ur: "جعلی کرنسی کی گردش",
    kn: "ನಕಲಿ ನಾಣ್ಯ ಹರಡುವಿಕೆ",
    or: "ନକଲ ମୁଦ୍ରା ପ୍ରଚାର",
    ml: "കള്ളനോട്ട പ്രചരണം",
    pa: "ਨਕਲੀ ਕਰੰਸੀ ਚਲਾਉਣਾ",
    as: "নকল মুদ্ৰা প্ৰচলন",
    sa: "कूटमुद्राप्रसारः"
  },
  sec: "IPC 489B",
  punishment: {
    en: "Life imprisonment",
    hi: "आजीवन कारावास",
    bn: "যাবজ্জীবন কারাদণ্ড",
    te: "ఆజీవ కారాగారం",
    mr: "आजीवन कारावास",
    ta: "ஆயுள் சிறை",
    gu: "આજીવન કેદ",
    ur: "عمر قید",
    kn: "ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or: "ଆଜୀବନ କାରାଦଣ୍ଡ",
    ml: "ജീവപര്യന്തം തടവ്",
    pa: "ਉਮਰ ਕੈਦ",
    as: "আজীৱন কাৰাদণ্ড",
    sa: "आजीवनकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Counterfeiting Coins",
    hi: "सिक्के की जालसाजी",
    bn: "মুদ্রা জালিয়াতি",
    te: "నాణేలు నకిలీ తయారీ",
    mr: "नाणे बनावट",
    ta: "நாணய போலி தயாரிப்பு",
    gu: "સિક્કા નકલી બનાવટ",
    ur: "سکوں کی جعلسازی",
    kn: "ನಾಣ್ಯ ನಕಲಿ ತಯಾರಿ",
    or: "ନାଣ୍ୟ ନକଲ ତିଆରି",
    ml: "നാണയ വ്യാജനിർമ്മാണം",
    pa: "ਸਿੱਕਿਆਂ ਦੀ ਜਾਲਸਾਜ਼ੀ",
    as: "মুদ্ৰা জালিয়াতি",
    sa: "मुद्राकूटनिर्माणम्"
  },
  sec: "IPC 232",
  punishment: {
    en: "Life imprisonment",
    hi: "आजीवन कारावास",
    bn: "যাবজ্জীবন কারাদণ্ড",
    te: "ఆజీవ కారాగారం",
    mr: "आजीवन कारावास",
    ta: "ஆயுள் சிறை",
    gu: "આજીવન કેદ",
    ur: "عمر قید",
    kn: "ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or: "ଆଜୀବନ କାରାଦଣ୍ଡ",
    ml: "ജീവപര്യന്തം തടവ്",
    pa: "ਉਮਰ ਕੈਦ",
    as: "আজীৱন কাৰাদণ্ড",
    sa: "आजीवनकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Illegal Lottery",
    hi: "अवैध लॉटरी",
    bn: "অবৈধ লটারি",
    te: "అక్రమ లాటరీ",
    mr: "बेकायदेशीर लॉटरी",
    ta: "சட்டவிரோத லாட்டரி",
    gu: "અવૈધ લોટરી",
    ur: "غیر قانونی لاٹری",
    kn: "ಅಕ್ರಮ ಲಾಟರಿ",
    or: "ଅବୈଧ ଲଟେରି",
    ml: "നിയമവിരുദ്ധ ലോട്ടറി",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਲਾਟਰੀ",
    as: "অবৈধ লটাৰী",
    sa: "अवैधलॉटरी"
  },
  sec: "Lotteries Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Black Marketing",
    hi: "काला बाज़ारी",
    bn: "কালোবাজারি",
    te: "బ్లాక్ మార్కెటింగ్",
    mr: "काळाबाजार",
    ta: "கருப்பு சந்தை",
    gu: "કાળો બજાર",
    ur: "کالا بازاری",
    kn: "ಕಪ್ಪು ಮಾರುಕಟ್ಟೆ",
    or: "କଳା ବଜାର",
    ml: "കരിഞ്ചന്ത",
    pa: "ਕਾਲਾਬਾਜ਼ਾਰੀ",
    as: "ক'লা বজাৰ",
    sa: "कृष्णवाणिज्यम्"
  },
  sec: "EC Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Hoarding Essential Goods",
    hi: "आवश्यक वस्तुओं का जमाखोरी",
    bn: "প্রয়োজনীয় পণ্যের মজুতদারি",
    te: "అత్యవసర వస్తువుల నిల్వ",
    mr: "अत्यावश्यक वस्तू साठवण",
    ta: "அத்தியாவசிய பொருள் குவிப்பு",
    gu: "આવશ્યક વસ્તુઓનો સંગ્રહ",
    ur: "ضروری اشیاء کی ذخیرہ اندوزی",
    kn: "ಅಗತ್ಯ ವಸ್ತು ಸಂಗ್ರಹ",
    or: "ଆବଶ୍ୟକ ବସ୍ତୁ ସଂଗ୍ରହ",
    ml: "അത്യാവശ്യ സാധന ശേഖരണം",
    pa: "ਜ਼ਰੂਰੀ ਵਸਤੂਆਂ ਦੀ ਸਟਾਕਬੰਦੀ",
    as: "অত্যাৱশ্যক সামগ্ৰী সঞ্চয়",
    sa: "आवश्यकवस्तुसंचयः"
  },
  sec: "EC Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Price Manipulation",
    hi: "मूल्य हेरफेर",
    bn: "মূল্য কারসাজি",
    te: "ధరల మోసపూరిత మార్పు",
    mr: "किंमत छेडछाड",
    ta: "விலை மாற்றம் மோசடி",
    gu: "કિંમત હેરફેર",
    ur: "قیمت میں ہیرا پھیری",
    kn: "ಬೆಲೆ ಕೃತಕ ಬದಲಾವಣೆ",
    or: "ମୂଲ୍ୟ ହେରଫେର",
    ml: "വില കൃത്രിമം",
    pa: "ਕੀਮਤ ਹੇਰਾਫੇਰੀ",
    as: "মূল্য হেৰফেৰ",
    sa: "मूल्यहेरफेरः"
  },
  sec: "EC Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Illegal Recruitment Scam",
    hi: "अवैध भर्ती घोटाला",
    bn: "অবৈধ নিয়োগ কেলেঙ্কারি",
    te: "అక్రమ నియామక మోసం",
    mr: "बेकायदेशीर भरती घोटाळा",
    ta: "சட்டவிரோத வேலை மோசடி",
    gu: "ગેરકાયદેસર ભરતી કૌભાંડ",
    ur: "غیر قانونی بھرتی فراڈ",
    kn: "ಅಕ್ರಮ ನೇಮಕಾತಿ ಮೋಸ",
    or: "ଅବୈଧ ନିଯୁକ୍ତି ଠକେଇ",
    ml: "നിയമവിരുദ്ധ നിയമന തട്ടിപ്പ്",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਭਰਤੀ ਘਪਲਾ",
    as: "অবৈধ নিযুক্তি কেলেঙ্কাৰী",
    sa: "अवैधनियुक्तिछलनम्"
  },
  sec: "IPC 420",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Visa Fraud",
    hi: "वीज़ा धोखाधड़ी",
    bn: "ভিসা প্রতারণা",
    te: "వీసా మోసం",
    mr: "व्हिसा फसवणूक",
    ta: "விசா மோசடி",
    gu: "વીસા છેતરપિંડી",
    ur: "ویزا فراڈ",
    kn: "ವೀಸಾ ಮೋಸ",
    or: "ଭିସା ଠକେଇ",
    ml: "വിസ തട്ടിപ്പ്",
    pa: "ਵੀਜ਼ਾ ਧੋਖਾਧੜੀ",
    as: "ভিছা প্ৰতাৰণা",
    sa: "वीजाछलनम्"
  },
  sec: "IPC / Passport Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Fake University Scam",
    hi: "फर्जी विश्वविद्यालय घोटाला",
    bn: "ভুয়া বিশ্ববিদ্যালয় কেলেঙ্কারি",
    te: "నకిలీ విశ్వవిద్యాలయ మోసం",
    mr: "बनावट विद्यापीठ घोटाळा",
    ta: "போலி பல்கலை மோசடி",
    gu: "નકલી યુનિવર્સિટી કૌભાંડ",
    ur: "جعلی یونیورسٹی اسکینڈل",
    kn: "ನಕಲಿ ವಿಶ್ವವಿದ್ಯಾಲಯ ಮೋಸ",
    or: "ଭୁଆ ବିଶ୍ୱବିଦ୍ୟାଳୟ ଠକେଇ",
    ml: "വ്യാജ സർവകലാശാല തട്ടിപ്പ്",
    pa: "ਨਕਲੀ ਯੂਨੀਵਰਸਿਟੀ ਘਪਲਾ",
    as: "ভুৱা বিশ্ববিদ্যালয় কেলেঙ্কাৰী",
    sa: "कूटविश्वविद्यालयछलनम्"
  },
  sec: "IPC 420",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Education Certificate Fraud",
    hi: "शैक्षणिक प्रमाणपत्र धोखाधड़ी",
    bn: "শিক্ষাগত শংসাপত্র প্রতারণা",
    te: "విద్యా ధృవీకరణ మోసం",
    mr: "शैक्षणिक प्रमाणपत्र फसवणूक",
    ta: "கல்வி சான்றிதழ் மோசடி",
    gu: "શૈક્ષણિક પ્રમાણપત્ર છેતરપિંડી",
    ur: "تعلیمی سرٹیفکیٹ فراڈ",
    kn: "ಶೈಕ್ಷಣಿಕ ಪ್ರಮಾಣಪತ್ರ ಮೋಸ",
    or: "ଶିକ୍ଷାଗତ ସାର୍ଟିଫିକେଟ୍ ଠକେଇ",
    ml: "വിദ്യാഭ്യാസ സർട്ടിഫിക്കറ്റ് തട്ടിപ്പ്",
    pa: "ਸ਼ਿੱਖਿਆ ਸਰਟੀਫਿਕੇਟ ਧੋਖਾਧੜੀ",
    as: "শিক্ষাগত প্ৰমাণপত্ৰ প্ৰতাৰণা",
    sa: "शैक्षणिकप्रमाणपत्रछलनम्"
  },
  sec: "IPC 465",
  punishment: {
    en: "Up to 2 years",
    hi: "2 वर्ष तक",
    bn: "২ বছর পর্যন্ত",
    te: "2 సంవత్సరాల వరకు",
    mr: "2 वर्षांपर्यंत",
    ta: "2 ஆண்டுகள் வரை",
    gu: "2 વર્ષ સુધી",
    ur: "2 سال تک",
    kn: "2 ವರ್ಷಗಳವರೆಗೆ",
    or: "2 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "2 വർഷം വരെ",
    pa: "2 ਸਾਲ ਤੱਕ",
    as: "২ বছৰৰ ভিতৰত",
    sa: "द्विवर्षपर्यन्तम्"
  },
  lvl: "medium"
},

{
  name: {
    en: "Placement Fraud",
    hi: "प्लेसमेंट धोखाधड़ी",
    bn: "প্লেসমেন্ট প্রতারণা",
    te: "ప్లేస్‌మెంట్ మోసం",
    mr: "प्लेसमेंट फसवणूक",
    ta: "வேலைவாய்ப்பு மோசடி",
    gu: "પ્લેસમેન્ટ છેતરપિંડી",
    ur: "پلیسمنٹ فراڈ",
    kn: "ಪ್ಲೇಸ್ಮೆಂಟ್ ಮೋಸ",
    or: "ପ୍ଲେସମେଣ୍ଟ ଠକେଇ",
    ml: "പ്ലേസ്മെന്റ് തട്ടിപ്പ്",
    pa: "ਪਲੇਸਮੈਂਟ ਧੋਖਾਧੜੀ",
    as: "প্লেচমেণ্ট প্ৰতাৰণা",
    sa: "नियोजनछलनम्"
  },
  sec: "IPC 420",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "high"
},
{
  name: {
    en: "Social Media Impersonation",
    hi: "सोशल मीडिया प्रतिरूपण",
    bn: "সোশ্যাল মিডিয়া ছদ্মবেশ",
    te: "సోషల్ మీడియా నకిలీ గుర్తింపు",
    mr: "सोशल मीडिया बनावट ओळख",
    ta: "சமூக ஊடக போலி கணக்கு",
    gu: "સોશિયલ મીડિયા નકલી ઓળખ",
    ur: "سوشل میڈیا نقالی",
    kn: "ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ನಕಲಿ ಗುರುತು",
    or: "ସୋସିଆଲ୍ ମିଡିଆ ଛଦ୍ମ ପରିଚୟ",
    ml: "സോഷ്യൽ മീഡിയ വ്യാജ തിരിച്ചറിയൽ",
    pa: "ਸੋਸ਼ਲ ਮੀਡੀਆ ਨਕਲੀ ਪਛਾਣ",
    as: "চ'চিয়েল মিডিয়া ভুৱা পৰিচয়",
    sa: "सामाजिकमाध्यमछद्मपरिचयः"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Deepfake Creation",
    hi: "डीपफेक निर्माण",
    bn: "ডিপফেক তৈরি",
    te: "డీప్‌ఫేక్ సృష్టి",
    mr: "डीपफेक निर्मिती",
    ta: "டீப்-ஃபேக் உருவாக்கம்",
    gu: "ડીપફેક નિર્માણ",
    ur: "ڈیپ فیک تخلیق",
    kn: "ಡೀಪ್‌ಫೇಕ್ ಸೃಷ್ಟಿ",
    or: "ଡିପ୍‌ଫେକ୍ ସୃଷ୍ଟି",
    ml: "ഡീപ്‌ഫേക്ക് സൃഷ്ടി",
    pa: "ਡੀਪਫੇਕ ਬਣਾਉਣਾ",
    as: "ডিপফেক সৃষ্টি",
    sa: "डीपफेकनिर्माणम्"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Online Radicalization",
    hi: "ऑनलाइन कट्टरपंथ",
    bn: "অনলাইন উগ্রবাদ",
    te: "ఆన్‌లైన్ తీవ్రవాదం",
    mr: "ऑनलाइन अतिरेकीकरण",
    ta: "இணைய தீவிரவாதம்",
    gu: "ઓનલાઇન ઉગ્રવાદ",
    ur: "آن لائن شدت پسندی",
    kn: "ಆನ್‌ಲೈನ್ ಉಗ್ರವಾದೀಕರಣ",
    or: "ଅନଲାଇନ୍ ଉଗ୍ରବାଦ",
    ml: "ഓൺലൈൻ തീവ്രവാദവൽക്കരണം",
    pa: "ਆਨਲਾਈਨ ਅਤਿਵਾਦ",
    as: "অনলাইন উগ্ৰবাদ",
    sa: "आनलाइनतीव्रवादः"
  },
  sec: "UAPA",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Crypto Currency Scam",
    hi: "क्रिप्टो मुद्रा घोटाला",
    bn: "ক্রিপ্টো মুদ্রা কেলেঙ্কারি",
    te: "క్రిప్టో కరెన్సీ మోసం",
    mr: "क्रिप्टो चलन घोटाळा",
    ta: "கிரிப்டோ மோசடி",
    gu: "ક્રિપ્ટો કરન્સી કૌભાંડ",
    ur: "کرپٹو کرنسی فراڈ",
    kn: "ಕ್ರಿಪ್ಟೋ ಕರೆನ್ಸಿ ಮೋಸ",
    or: "କ୍ରିପ୍ଟୋ ମୁଦ୍ରା ଠକେଇ",
    ml: "ക്രിപ്റ്റോ കറൻസി തട്ടിപ്പ്",
    pa: "ਕ੍ਰਿਪਟੋ ਕਰੰਸੀ ਧੋਖਾਧੜੀ",
    as: "ক্ৰিপ্টো মুদ্ৰা কেলেঙ্কাৰী",
    sa: "क्रिप्टोमुद्राछलनम्"
  },
  sec: "IPC / IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Online Investment Fraud",
    hi: "ऑनलाइन निवेश धोखाधड़ी",
    bn: "অনলাইন বিনিয়োগ প্রতারণা",
    te: "ఆన్‌లైన్ పెట్టుబడి మోసం",
    mr: "ऑनलाइन गुंतवणूक फसवणूक",
    ta: "இணைய முதலீட்டு மோசடி",
    gu: "ઓનલાઇન રોકાણ છેતરપિંડી",
    ur: "آن لائن سرمایہ کاری فراڈ",
    kn: "ಆನ್‌ಲೈನ್ ಹೂಡಿಕೆ ಮೋಸ",
    or: "ଅନଲାଇନ୍ ନିବେଶ ଠକେଇ",
    ml: "ഓൺലൈൻ നിക്ഷേപ തട്ടിപ്പ്",
    pa: "ਆਨਲਾਈਨ ਨਿਵੇਸ਼ ਧੋਖਾਧੜੀ",
    as: "অনলাইন বিনিয়োগ প্ৰতাৰণা",
    sa: "आनलाइननिवेशछलनम्"
  },
  sec: "IPC 420",
  punishment: {
    en: "Up to 7 years",
    hi: "7 वर्ष तक",
    bn: "৭ বছর পর্যন্ত",
    te: "7 సంవత్సరాల వరకు",
    mr: "7 वर्षांपर्यंत",
    ta: "7 ஆண்டுகள் வரை",
    gu: "7 વર્ષ સુધી",
    ur: "7 سال تک",
    kn: "7 ವರ್ಷಗಳವರೆಗೆ",
    or: "7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml: "7 വർഷം വരെ",
    pa: "7 ਸਾਲ ਤੱਕ",
    as: "৭ বছৰৰ ভিতৰত",
    sa: "सप्तवर्षपर्यन्तम्"
  },
  lvl: "high"
},

{
  name: {
    en: "Illegal Call Center Scam",
    hi: "अवैध कॉल सेंटर घोटाला",
    bn: "অবৈধ কল সেন্টার কেলেঙ্কারি",
    te: "అక్రమ కాల్ సెంటర్ మోసం",
    mr: "बेकायदेशीर कॉल सेंटर घोटाळा",
    ta: "சட்டவிரோத கால்செண்டர் மோசடி",
    gu: "ગેરકાયદેસર કોલ સેન્ટર કૌભાંડ",
    ur: "غیر قانونی کال سینٹر فراڈ",
    kn: "ಅಕ್ರಮ ಕಾಲ್ ಸೆಂಟರ್ ಮೋಸ",
    or: "ଅବୈଧ କଲ୍ ସେଣ୍ଟର ଠକେଇ",
    ml: "നിയമവിരുദ്ധ കോള്സെന്റർ തട്ടിപ്പ്",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਕਾਲ ਸੈਂਟਰ ਘਪਲਾ",
    as: "অবৈধ কল চেণ্টাৰ কেলেঙ্কাৰী",
    sa: "अवैधआह्वानकेन्द्रछलनम्"
  },
  sec: "IPC / IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "SIM Card Fraud",
    hi: "सिम कार्ड धोखाधड़ी",
    bn: "সিম কার্ড প্রতারণা",
    te: "సిమ్ కార్డ్ మోసం",
    mr: "सिम कार्ड फसवणूक",
    ta: "சிம் கார்டு மோசடி",
    gu: "સિમ કાર્ડ છેતરપિંડી",
    ur: "سم کارڈ فراڈ",
    kn: "ಸಿಮ್ ಕಾರ್ಡ್ ಮೋಸ",
    or: "ସିମ୍ କାର୍ଡ ଠକେଇ",
    ml: "സിം കാർഡ് തട്ടിപ്പ്",
    pa: "ਸਿਮ ਕਾਰਡ ਧੋਖਾਧੜੀ",
    as: "চিম কাৰ্ড প্ৰতাৰণা",
    sa: "सिमकार्डछलनम्"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Aadhaar Misuse",
    hi: "आधार दुरुपयोग",
    bn: "আধার অপব্যবহার",
    te: "ఆధార్ దుర్వినియోగం",
    mr: "आधार गैरवापर",
    ta: "ஆதார் தவறான பயன்பாடு",
    gu: "આધાર દુરુપયોગ",
    ur: "آدھار کا غلط استعمال",
    kn: "ಆಧಾರ್ ದುರುಪಯೋಗ",
    or: "ଆଧାର ଦୁରୁପଯୋଗ",
    ml: "ആധാർ ദുരുപയോഗം",
    pa: "ਆਧਾਰ ਦੁਰੁਪਯੋਗ",
    as: "আধাৰ দুৰ্ব্যৱহাৰ",
    sa: "आधारदुरुपयोगः"
  },
  sec: "Aadhaar Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "PAN Card Fraud",
    hi: "पैन कार्ड धोखाधड़ी",
    bn: "প্যান কার্ড প্রতারণা",
    te: "పాన్ కార్డ్ మోసం",
    mr: "पॅन कार्ड फसवणूक",
    ta: "பான் கார்டு மோசடி",
    gu: "પાન કાર્ડ છેતરપિંડી",
    ur: "پین کارڈ فراڈ",
    kn: "ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಮೋಸ",
    or: "ପ୍ୟାନ୍ କାର୍ଡ ଠକେଇ",
    ml: "പാൻ കാർഡ് തട്ടിപ്പ്",
    pa: "ਪੈਨ ਕਾਰਡ ਧੋਖਾਧੜੀ",
    as: "পেন কাৰ্ড প্ৰতাৰণা",
    sa: "पैनकार्डछलनम्"
  },
  sec: "IPC / IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Digital Payment Fraud",
    hi: "डिजिटल भुगतान धोखाधड़ी",
    bn: "ডিজিটাল পেমেন্ট প্রতারণা",
    te: "డిజిటల్ చెల్లింపు మోసం",
    mr: "डिजिटल पेमेंट फसवणूक",
    ta: "டிஜிட்டல் பண மோசடி",
    gu: "ડિજિટલ ચુકવણી છેતરપિંડી",
    ur: "ڈیجیٹل ادائیگی فراڈ",
    kn: "ಡಿಜಿಟಲ್ ಪಾವತಿ ಮೋಸ",
    or: "ଡିଜିଟାଲ ପେମେଣ୍ଟ ଠକେଇ",
    ml: "ഡിജിറ്റൽ പേയ്മെന്റ് തട്ടിപ്പ്",
    pa: "ਡਿਜ਼ੀਟਲ ਭੁਗਤਾਨ ਧੋਖਾਧੜੀ",
    as: "ডিজিটেল পেমেণ্ট প্ৰতাৰণা",
    sa: "डिजिटलभुगतानछलनम्"
  },
  sec: "IT Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Illegal Adoption",
    hi: "अवैध गोद लेना",
    bn: "অবৈধ দত্তক",
    te: "అక్రమ దత్తత",
    mr: "बेकायदेशीर दत्तक",
    ta: "சட்டவிரோத தத்தெடுப்பு",
    gu: "અવૈધ દત્તક",
    ur: "غیر قانونی گود لینا",
    kn: "ಅಕ್ರಮ ದತ್ತಕ",
    or: "ଅବୈଧ ଦତକ",
    ml: "നിയമവിരുദ്ധ ദത്തെടുക്കൽ",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਗੋਦ ਲੈਣਾ",
    as: "অবৈধ দত্তক",
    sa: "अवैधदत्तकग्रहणम्"
  },
  sec: "JJ Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Surrogacy Violation",
    hi: "सरोगेसी कानून उल्लंघन",
    bn: "সারোগেসি আইন লঙ্ঘন",
    te: "సరోగసీ చట్ట ఉల్లంఘన",
    mr: "सरोगसी कायदा उल्लंघन",
    ta: "சுரோகசி சட்ட மீறல்",
    gu: "સરોગેસી કાયદા ઉલ્લંઘન",
    ur: "سروگیسی قانون کی خلاف ورزی",
    kn: "ಸರೋಗಸಿ ಕಾನೂನು ಉಲ್ಲಂಘನೆ",
    or: "ସରୋଗେସି ଆଇନ ଉଲ୍ଲଂଘନ",
    ml: "സറോഗസി നിയമ ലംഘനം",
    pa: "ਸਰੋਗੇਸੀ ਕਾਨੂੰਨ ਉਲੰਘਣਾ",
    as: "সৰোগেচী আইন লংঘন",
    sa: "सरोगेसीनियमउल्लङ्घनम्"
  },
  sec: "Surrogacy Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Child Pornography",
    hi: "बाल अश्लील सामग्री",
    bn: "শিশু অশ্লীলতা",
    te: "బాల అశ్లీల కంటెంట్",
    mr: "बाल अश्लीलता",
    ta: "குழந்தை அசிங்க வீடியோ",
    gu: "બાળ અશ્લીલ સામગ્રી",
    ur: "بچوں کی فحش مواد",
    kn: "ಮಕ್ಕಳ ಅಶ್ಲೀಲ ವಿಷಯ",
    or: "ଶିଶୁ ଅଶ୍ଳୀଳ ସାମଗ୍ରୀ",
    ml: "കുട്ടികളുടെ അശ്ലീല ഉള്ളടക്കം",
    pa: "ਬੱਚਿਆਂ ਦੀ ਅਸ਼ਲੀਲ ਸਮੱਗਰੀ",
    as: "শিশু অশ্লীল সামগ্ৰী",
    sa: "बालअश्लीलसामग्री"
  },
  sec: "POCSO / IT Act",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Sex Trafficking",
    hi: "यौन तस्करी",
    bn: "যৌন পাচার",
    te: "లైంగిక అక్రమ రవాణా",
    mr: "लैंगिक तस्करी",
    ta: "பாலியல் கடத்தல்",
    gu: "લૈંગિક તસ્કરી",
    ur: "جنسی اسمگلنگ",
    kn: "ಲೈಂಗಿಕ ಕಳ್ಳಸಾಗಣೆ",
    or: "ଲୈଙ୍ଗିକ ପାଚାର",
    ml: "ലൈംഗിക കടത്ത്",
    pa: "ਯੌਨ ਤਸਕਰੀ",
    as: "যৌন সৰবৰাহ",
    sa: "लैंगिकतस्करी"
  },
  sec: "IPC 370",
  punishment: {
    en: "Life imprisonment",
    hi: "आजीवन कारावास",
    bn: "যাবজ্জীবন কারাদণ্ড",
    te: "ఆజీవ కారాగారం",
    mr: "आजीवन कारावास",
    ta: "ஆயுள் சிறை",
    gu: "આજીવન કેદ",
    ur: "عمر قید",
    kn: "ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or: "ଆଜୀବନ କାରାଦଣ୍ଡ",
    ml: "ജീവപര്യന്തം തടവ്",
    pa: "ਉਮਰ ਕੈਦ",
    as: "আজীৱন কাৰাদণ্ড",
    sa: "आजीवनकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Forced Labour",
    hi: "बंधुआ मजदूरी",
    bn: "বাধ্যতামূলক শ্রম",
    te: "బలవంతపు శ్రమ",
    mr: "बंधमजुरी",
    ta: "கட்டாய உழைப்பு",
    gu: "બળજબરીથી કામ",
    ur: "جبری مشقت",
    kn: "ಬಲವಂತದ ಕೆಲಸ",
    or: "ବାଧ୍ୟତାମୂଳକ ଶ୍ରମ",
    ml: "ബലവത്കൃത തൊഴിൽ",
    pa: "ਜ਼ਬਰਦਸਤੀ ਮਜ਼ਦੂਰੀ",
    as: "বাধ্যতামূলক শ্রম",
    sa: "बन्धितश्रमः"
  },
  sec: "Bonded Labour Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Illegal Construction",
    hi: "अवैध निर्माण",
    bn: "অবৈধ নির্মাণ",
    te: "అక్రమ నిర్మాణం",
    mr: "बेकायदेशीर बांधकाम",
    ta: "சட்டவிரோத கட்டிடம்",
    gu: "અવૈધ બાંધકામ",
    ur: "غیر قانونی تعمیرات",
    kn: "ಅಕ್ರಮ ನಿರ್ಮಾಣ",
    or: "ଅବୈଧ ନିର୍ମାଣ",
    ml: "നിയമവിരുദ്ധ നിർമ്മാണം",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਨਿਰਮਾਣ",
    as: "অবৈধ নিৰ্মাণ",
    sa: "अवैधनिर्माणम्"
  },
  sec: "Municipal Laws",
  punishment: {
    en: "Fine / Demolition",
    hi: "जुर्माना / ध्वस्तीकरण",
    bn: "জরিমানা / ভাঙচুর",
    te: "జరిమానా / కూల్చివేత",
    mr: "दंड / पाडकाम",
    ta: "அபராதம் / இடிப்பு",
    gu: "દંડ / ધરાશાયી",
    ur: "جرمانہ / انہدام",
    kn: "ದಂಡ / ಧ್ವಂಸ",
    or: "ଜରିମାନା / ଧ୍ୱଂସ",
    ml: "പിഴ / പൊളിക്കൽ",
    pa: "ਜੁਰਮਾਨਾ / ਢਾਹੁਣਾ",
    as: "জৰিমনা / ভাঙনি",
    sa: "दण्डः / ध्वंसः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Encroachment of Public Land",
    hi: "सार्वजनिक भूमि अतिक्रमण",
    bn: "সরকারি জমি দখল",
    te: "ప్రజా భూమి ఆక్రమణ",
    mr: "सार्वजनिक जमीन अतिक्रमण",
    ta: "பொது நிலம் ஆக்கிரமிப்பு",
    gu: "જાહેર જમીન પર કબજો",
    ur: "سرکاری زمین پر قبضہ",
    kn: "ಸಾರ್ವಜನಿಕ ಭೂಮಿ ಅಕ್ರಮ ವಶ",
    or: "ସର୍ବଜନୀନ ଜମି ଦଖଲ",
    ml: "പൊതു ഭൂമി കയ്യേറ്റം",
    pa: "ਸਰਕਾਰੀ ਜ਼ਮੀਨ ਕਬਜ਼ਾ",
    as: "ৰাজহুৱা ভূমি দখল",
    sa: "सार्वजनिकभूम्यतिक्रमणम्"
  },
  sec: "Land Revenue Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Illegal Tree Cutting",
    hi: "अवैध वृक्ष कटाई",
    bn: "অবৈধ গাছ কাটা",
    te: "అక్రమ వృక్ష నరుకుడు",
    mr: "बेकायदेशीर वृक्षतोड",
    ta: "சட்டவிரோத மரவெட்டு",
    gu: "અવૈધ વૃક્ષ કાપ",
    ur: "غیر قانونی درخت کٹائی",
    kn: "ಅಕ್ರಮ ಮರ ಕಡಿತ",
    or: "ଅବୈଧ ଗଛ କଟା",
    ml: "നിയമവിരുദ്ധ വൃക്ഷവെട്ട്",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਦਰੱਖਤ ਕਟਾਈ",
    as: "অবৈধ গছ কাটনি",
    sa: "अवैधवृक्षकर्तनम्"
  },
  sec: "Forest Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Forest Land Encroachment",
    hi: "वन भूमि अतिक्रमण",
    bn: "বনভূমি দখল",
    te: "అరణ్య భూమి ఆక్రమణ",
    mr: "वनजमीन अतिक्रमण",
    ta: "வன நில ஆக்கிரமிப்பு",
    gu: "વન જમીન કબજો",
    ur: "جنگلاتی زمین پر قبضہ",
    kn: "ಅರಣ್ಯ ಭೂಮಿ ಅಕ್ರಮ ವಶ",
    or: "ବନଭୂମି ଦଖଲ",
    ml: "വനഭൂമി കയ്യേറ്റം",
    pa: "ਜੰਗਲਾਤੀ ਜ਼ਮੀਨ ਕਬਜ਼ਾ",
    as: "বনভূমি দখল",
    sa: "वनभूम्यतिक्रमणम्"
  },
  sec: "Forest Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Wildlife Trade",
    hi: "वन्यजीव व्यापार",
    bn: "বন্যপ্রাণী বাণিজ্য",
    te: "వన్యప్రాణి వ్యాపారం",
    mr: "वन्यजीव व्यापार",
    ta: "வனவிலங்கு வர்த்தகம்",
    gu: "વન્યજીવ વેપાર",
    ur: "جنگلی حیات کی تجارت",
    kn: "ವನ್ಯಜೀವಿ ವ್ಯಾಪಾರ",
    or: "ବନ୍ୟଜନ୍ତୁ ବାଣିଜ୍ୟ",
    ml: "വന്യജീവി വ്യാപാരം",
    pa: "ਵਨਜੀਵ ਵਪਾਰ",
    as: "বন্যপ্ৰাণী ব্যৱসায়",
    sa: "वन्यजीवव्यापारः"
  },
  sec: "Wildlife Act",
  punishment: {
    en: "Rigorous imprisonment",
    hi: "कठोर कारावास",
    bn: "সশ্রম কারাদণ্ড",
    te: "కఠిన కారాగారం",
    mr: "कठोर कारावास",
    ta: "கடுமையான சிறை",
    gu: "કઠોર કેદ",
    ur: "سخت قید",
    kn: "ಕಠಿಣ ಕಾರಾಗೃಹ",
    or: "କଠୋର କାରାଦଣ୍ଡ",
    ml: "കർശന തടവ്",
    pa: "ਸਖ਼ਤ ਕੈਦ",
    as: "কঠোৰ কাৰাদণ্ড",
    sa: "कठोरकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Public Drinking",
    hi: "सार्वजनिक रूप से शराब पीना",
    bn: "সর্বজনসমক্ষে মদ্যপান",
    te: "బహిరంగ మద్యపానం",
    mr: "सार्वजनिक मद्यपान",
    ta: "பொது இடத்தில் மது அருந்துதல்",
    gu: "જાહેર સ્થળે દારૂ પીવું",
    ur: "عوامی شراب نوشی",
    kn: "ಸಾರ್ವಜನಿಕ ಮದ್ಯಪಾನ",
    or: "ସାର୍ବଜନୀନ ମଦ୍ୟପାନ",
    ml: "പൊതു മദ്യപാനം",
    pa: "ਸਰਵਜਨਿਕ ਸ਼ਰਾਬ ਪੀਣਾ",
    as: "সাৰ্বজনিক মদ্যপান",
    sa: "सार्वजनिकमद्यपानम्"
  },
  sec: "State Excise Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "low"
},

{
  name: {
    en: "Illegal Liquor Sale",
    hi: "अवैध शराब बिक्री",
    bn: "অবৈধ মদ বিক্রি",
    te: "అక్రమ మద్యం విక్రయం",
    mr: "बेकायदेशीर दारू विक्री",
    ta: "சட்டவிரோத மதுபான விற்பனை",
    gu: "અવૈધ દારૂ વેચાણ",
    ur: "غیر قانونی شراب فروخت",
    kn: "ಅಕ್ರಮ ಮದ್ಯ ಮಾರಾಟ",
    or: "ଅବୈଧ ମଦ ବିକ୍ରୟ",
    ml: "നിയമവിരുദ്ധ മദ്യവിൽപ്പന",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਸ਼ਰਾਬ ਵਿਕਰੀ",
    as: "অবৈধ মদ বিক্ৰী",
    sa: "अवैधमद्यविक्रयः"
  },
  sec: "Excise Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Spurious Liquor Case",
    hi: "नकली शराब मामला",
    bn: "নকল মদ মামলা",
    te: "నకిలీ మద్యం కేసు",
    mr: "बनावट दारू प्रकरण",
    ta: "போலி மதுபானம்",
    gu: "નકલી દારૂ કેસ",
    ur: "جعلی شراب کیس",
    kn: "ನಕಲಿ ಮದ್ಯ ಪ್ರಕರಣ",
    or: "ନକଲ ମଦ ମାମଲା",
    ml: "വ്യാജ മദ്യ കേസ്",
    pa: "ਨਕਲੀ ਸ਼ਰਾਬ ਮਾਮਲਾ",
    as: "নকল মদ মামলা",
    sa: "कूटमद्यप्रकरणम्"
  },
  sec: "IPC 272",
  punishment: {
    en: "Life imprisonment",
    hi: "आजीवन कारावास",
    bn: "যাবজ্জীবন কারাদণ্ড",
    te: "ఆజీవ కారాగారం",
    mr: "आजीवन कारावास",
    ta: "ஆயுள் சிறை",
    gu: "આજીવન કેદ",
    ur: "عمر قید",
    kn: "ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or: "ଆଜୀବନ କାରାଦଣ୍ଡ",
    ml: "ജീവപര്യന്തം തടവ്",
    pa: "ਉਮਰ ਕੈਦ",
    as: "আজীৱন কাৰাদণ্ড",
    sa: "आजीवनकारावासः"
  },
  lvl: "high"
},

{
  name: {
    en: "Public Smoking",
    hi: "सार्वजनिक धूम्रपान",
    bn: "সর্বজনসমক্ষে ধূমপান",
    te: "బహిరంగ ధూమపానం",
    mr: "सार्वजनिक धूम्रपान",
    ta: "பொது இடத்தில் புகைத்தல்",
    gu: "જાહેર ધૂમ્રપાન",
    ur: "عوامی تمباکو نوشی",
    kn: "ಸಾರ್ವಜನಿಕ ಧೂಮಪಾನ",
    or: "ସାର୍ବଜନୀନ ଧୂମପାନ",
    ml: "പൊതു പുകവലി",
    pa: "ਸਰਵਜਨਿਕ ਧੂਮਰਪਾਨ",
    as: "সাৰ্বজনিক ধূমপান",
    sa: "सार्वजनिकधूम्रपानम्"
  },
  sec: "COTPA Act",
  punishment: {
    en: "Fine",
    hi: "जुर्माना",
    bn: "জরিমানা",
    te: "జరిమానా",
    mr: "दंड",
    ta: "அபராதம்",
    gu: "દંડ",
    ur: "جرمانہ",
    kn: "ದಂಡ",
    or: "ଜରିମାନା",
    ml: "പിഴ",
    pa: "ਜੁਰਮਾਨਾ",
    as: "জৰিমনা",
    sa: "दण्डः"
  },
  lvl: "low"
},

{
  name: {
    en: "Drug Consumption",
    hi: "मादक पदार्थ सेवन",
    bn: "মাদক সেবন",
    te: "మత్తు పదార్థ వినియోగం",
    mr: "अंमली पदार्थ सेवन",
    ta: "மருந்து பயன்பாடு",
    gu: "માદક દ્રવ્ય સેવન",
    ur: "منشیات کا استعمال",
    kn: "ಮಾದಕ ವಸ್ತು ಬಳಕೆ",
    or: "ମାଦକ ପଦାର୍ଥ ସେବନ",
    ml: "മയക്കുമരുന്ന് ഉപയോഗം",
    pa: "ਨਸ਼ੀਲੇ ਪਦਾਰਥਾਂ ਦੀ ਵਰਤੋਂ",
    as: "নেশাজাতীয় দ্ৰব্য সেৱন",
    sa: "मादकद्रव्यसेवनम्"
  },
  sec: "NDPS Act",
  punishment: {
    en: "Imprisonment",
    hi: "कारावास",
    bn: "কারাদণ্ড",
    te: "కారాగారం",
    mr: "कारावास",
    ta: "சிறை",
    gu: "કારાવાસ",
    ur: "قید",
    kn: "ಕಾರಾಗೃಹ",
    or: "କାରାଦଣ୍ଡ",
    ml: "തടവ്",
    pa: "ਕੈਦ",
    as: "কাৰাদণ্ড",
    sa: "कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Selling Tobacco to Minors",
    hi: "नाबालिगों को तंबाकू बिक्री",
    bn: "অপ্রাপ্তবয়স্কদের তামাক বিক্রি",
    te: "మైనర్లకు పొగాకు విక్రయం",
    mr: "अल्पवयीनांना तंबाखू विक्री",
    ta: "சிறார்களுக்கு புகையிலை விற்பனை",
    gu: "નાબાલિકોને તમાકુ વેચાણ",
    ur: "نابالغوں کو تمباکو فروخت",
    kn: "ಅಪ್ರಾಪ್ತರಿಗೆ ತಂಬಾಕು ಮಾರಾಟ",
    or: "ଅପ୍ରାପ୍ତବୟସ୍କଙ୍କୁ ତମାକୁ ବିକ୍ରୟ",
    ml: "കുട്ടികൾക്ക് പുകയില വിൽപ്പന",
    pa: "ਨਾਬਾਲਗਾਂ ਨੂੰ ਤੰਬਾਕੂ ਵੇਚਣਾ",
    as: "নাবালকক তামাক বিক্ৰী",
    sa: "अल्पवयस्केभ्यः तम्बाकुविक्रयः"
  },
  sec: "COTPA Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Noise Pollution",
    hi: "ध्वनि प्रदूषण",
    bn: "শব্দ দূষণ",
    te: "శబ్ద కాలుష్యం",
    mr: "ध्वनी प्रदूषण",
    ta: "ஒலி மாசுபாடு",
    gu: "ધ્વનિ પ્રદૂષણ",
    ur: "شور کی آلودگی",
    kn: "ಶಬ್ದ ಮಾಲಿನ್ಯ",
    or: "ଶବ୍ଦ ଦୂଷଣ",
    ml: "ശബ്ദ മലിനീകരണം",
    pa: "ਧੁਨੀ ਪ੍ਰਦੂਸ਼ਣ",
    as: "শব্দ দূষণ",
    sa: "ध्वनिप्रदूषणम्"
  },
  sec: "Noise Pollution Rules",
  punishment: {
    en: "Fine",
    hi: "जुर्माना",
    bn: "জরিমানা",
    te: "జరిమానా",
    mr: "दंड",
    ta: "அபராதம்",
    gu: "દંડ",
    ur: "جرمانہ",
    kn: "ದಂಡ",
    or: "ଜରିମାନା",
    ml: "പിഴ",
    pa: "ਜੁਰਮਾਨਾ",
    as: "জৰিমনা",
    sa: "दण्डः"
  },
  lvl: "low"
},

{
  name: {
    en: "Violation of COVID Rules",
    hi: "कोविड नियम उल्लंघन",
    bn: "কোভিড নিয়ম লঙ্ঘন",
    te: "కోవిడ్ నిబంధనల ఉల్లంఘన",
    mr: "कोविड नियम उल्लंघन",
    ta: "கோவிட் விதி மீறல்",
    gu: "કોરોના નિયમ ભંગ",
    ur: "کووڈ قوانین کی خلاف ورزی",
    kn: "ಕೋವಿಡ್ ನಿಯಮ ಉಲ್ಲಂಘನೆ",
    or: "କୋଭିଡ୍ ନିୟମ ଉଲ୍ଲଂଘନ",
    ml: "കോവിഡ് നിയമ ലംഘനം",
    pa: "ਕੋਵਿਡ ਨਿਯਮ ਉਲੰਘਣਾ",
    as: "কোভিড নিয়ম লংঘন",
    sa: "कोविड्नियमउल्लङ्घनम्"
  },
  sec: "Disaster Management Act",
  punishment: {
    en: "Fine / Jail",
    hi: "जुर्माना / कारावास",
    bn: "জরিমানা / কারাদণ্ড",
    te: "జరిమానా / కారాగారం",
    mr: "दंड / कारावास",
    ta: "அபராதம் / சிறை",
    gu: "દંડ / કેદ",
    ur: "جرمانہ / قید",
    kn: "ದಂಡ / ಕಾರಾಗೃಹ",
    or: "ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml: "പിഴ / തടവ്",
    pa: "ਜੁਰਮਾਨਾ / ਕੈਦ",
    as: "জৰিমনা / কাৰাদণ্ড",
    sa: "दण्डः / कारावासः"
  },
  lvl: "medium"
},

{
  name: {
    en: "Mask Violation",
    hi: "मास्क नियम उल्लंघन",
    bn: "মাস্ক নিয়ম লঙ্ঘন",
    te: "మాస్క్ నిబంధన ఉల్లంఘన",
    mr: "मास्क नियम उल्लंघन",
    ta: "முககவச விதி மீறல்",
    gu: "માસ્ક નિયમ ભંગ",
    ur: "ماسک قانون کی خلاف ورزی",
    kn: "ಮಾಸ್ಕ್ ನಿಯಮ ಉಲ್ಲಂಘನೆ",
    or: "ମାସ୍କ ନିୟମ ଉଲ୍ଲଂଘନ",
    ml: "മാസ്ക് നിയമ ലംഘനം",
    pa: "ਮਾਸਕ ਨਿਯਮ ਉਲੰਘਣਾ",
    as: "মাস্ক নিয়ম লংঘন",
    sa: "मुखावरणनियमउल्लङ्घनम्"
  },
  sec: "DM Act",
  punishment: {
    en: "Fine",
    hi: "जुर्माना",
    bn: "জরিমানা",
    te: "జరిమానా",
    mr: "दंड",
    ta: "அபராதம்",
    gu: "દંડ",
    ur: "جرمانہ",
    kn: "ದಂಡ",
    or: "ଜରିମାନା",
    ml: "പിഴ",
    pa: "ਜੁਰਮਾਨਾ",
    as: "জৰিমনা",
    sa: "दण्डः"
  },
  lvl: "low"
},

{
  name: {
    en: "Illegal Hawking",
    hi: "अवैध फेरीवाला",
    bn: "অবৈধ ফেরিওয়ালা",
    te: "అక్రమ వీధి వ్యాపారం",
    mr: "बेकायदेशीर फेरीवाला",
    ta: "சட்டவிரோத நடைபாதை விற்பனை",
    gu: "અવૈધ ફેરીવાળો",
    ur: "غیر قانونی فٹ پاتھ فروش",
    kn: "ಅಕ್ರಮ ಬೀದಿ ವ್ಯಾಪಾರ",
    or: "ଅବୈଧ ପଥବିକ୍ରୟ",
    ml: "നിയമവിരുദ്ധ വഴിവ്യാപാരം",
    pa: "ਗੈਰਕਾਨੂੰਨੀ ਫੜੀਵਾਲਾ",
    as: "অবৈধ ফেৰিওৱালা",
    sa: "अवैधपथविक्रयः"
  },
  sec: "Municipal Act",
  punishment: {
    en: "Fine",
    hi: "जुर्माना",
    bn: "জরিমানা",
    te: "జరిమానా",
    mr: "दंड",
    ta: "அபராதம்",
    gu: "દંડ",
    ur: "جرمانہ",
    kn: "ದಂಡ",
    or: "ଜରିମାନା",
    ml: "പിഴ",
    pa: "ਜੁਰਮਾਨਾ",
    as: "জৰিমনা",
    sa: "दण्डः"
  },
  lvl: "low"
},

{
  name: {
    en: "Street Obstruction",
    hi: "सार्वजनिक मार्ग अवरोध",
    bn: "পথ অবরোধ",
    te: "రోడ్డు అడ్డంకి",
    mr: "रस्ता अडथळा",
    ta: "பொது வழி மறியல்",
    gu: "જાહેર રસ્તા અવરોધ",
    ur: "سڑک میں رکاوٹ",
    kn: "ರಸ್ತೆ ತಡೆ",
    or: "ରାସ୍ତା ଅବରୋଧ",
    ml: "റോഡ് തടസം",
    pa: "ਸੜਕ ਰੁਕਾਵਟ",
    as: "পথ অৱৰোধ",
    sa: "मार्गावरोधः"
  },
  sec: "IPC 283",
  punishment: {
    en: "Fine",
    hi: "जुर्माना",
    bn: "জরিমানা",
    te: "జరిమానా",
    mr: "दंड",
    ta: "அபராதம்",
    gu: "દંડ",
    ur: "جرمانہ",
    kn: "ದಂಡ",
    or: "ଜରିମାନା",
    ml: "പിഴ",
    pa: "ਜੁਰਮਾਨਾ",
    as: "জৰিমনা",
    sa: "दण्डः"
  },
  lvl: "low"
},

{
  name: {
    en: "Unauthorized Advertisement",
    hi: "अनधिकृत विज्ञापन",
    bn: "অননুমোদিত বিজ্ঞাপন",
    te: "అనధికార ప్రకటన",
    mr: "अनधिकृत जाहिरात",
    ta: "அனுமதி இல்லா விளம்பரம்",
    gu: "અનધિકૃત જાહેરાત",
    ur: "غیر مجاز اشتہار",
    kn: "ಅನಧಿಕೃತ ಜಾಹೀರಾತು",
    or: "ଅନୁମତିବିହୀନ ବିଜ୍ଞାପନ",
    ml: "അനുമതിയില്ലാത്ത പരസ്യം",
    pa: "ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਇਸ਼ਤਿਹਾਰ",
    as: "অনুমতি বিহীন বিজ্ঞাপন",
    sa: "अनधिकृतविज्ञापनम्"
  },
  sec: "Municipal Act",
  punishment: {
    en: "Fine",
    hi: "जुर्माना",
    bn: "জরিমানা",
    te: "జరిమానా",
    mr: "दंड",
    ta: "அபராதம்",
    gu: "દંડ",
    ur: "جرمانہ",
    kn: "ದಂಡ",
    or: "ଜରିମାନା",
    ml: "പിഴ",
    pa: "ਜੁਰਮਾਨਾ",
    as: "জৰিমনা",
    sa: "दण्डः"
  },
  lvl: "low"
},
{
  name:{
    en:"Fake Job Offer Scam",hi:"फर्जी नौकरी प्रस्ताव घोटाला",bn:"ভুয়া চাকরির অফার কেলেঙ্কারি",
    te:"నకిలీ ఉద్యోగ ఆఫర్ మోసం",mr:"बनावट नोकरी ऑफर घोटाळा",ta:"போலி வேலைவாய்ப்பு மோசடி",
    gu:"નકલી નોકરી ઓફર કૌભાંડ",ur:"جعلی نوکری آفر فراڈ",kn:"ನಕಲಿ ಉದ್ಯೋಗ ಆಫರ್ ಮೋಸ",
    or:"ନକଲି ଚାକିରି ପ୍ରସ୍ତାବ ଠକେଇ",ml:"വ്യാജ ജോലി ഓഫർ തട്ടിപ്പ്",
    pa:"ਨਕਲੀ ਨੌਕਰੀ ਆਫ਼ਰ ਘਪਲਾ",as:"ভুৱা চাকৰি অফাৰ কেলেঙ্কাৰী",sa:"कूटनियोजनप्रस्तावछलनम्"
  },
  sec:"IPC 420",
  punishment:{
    en:"Up to 7 years",hi:"7 वर्ष तक",bn:"৭ বছর পর্যন্ত",te:"7 సంవత్సరాల వరకు",
    mr:"7 वर्षांपर्यंत",ta:"7 ஆண்டுகள் வரை",gu:"7 વર્ષ સુધી",ur:"7 سال تک",
    kn:"7 ವರ್ಷಗಳವರೆಗೆ",or:"7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",ml:"7 വർഷം വരെ",
    pa:"7 ਸਾਲ ਤੱਕ",as:"৭ বছৰৰ ভিতৰত",sa:"सप्तवर्षपर्यन्तम्"
  },
  lvl:"high"
},

{
  name:{
    en:"Online Loan App Fraud",hi:"ऑनलाइन लोन ऐप धोखाधड़ी",bn:"অনলাইন ঋণ অ্যাপ প্রতারণা",
    te:"ఆన్‌లైన్ లోన్ యాప్ మోసం",mr:"ऑनलाइन कर्ज अ‍ॅप फसवणूक",ta:"இணைய கடன் ஆப் மோசடி",
    gu:"ઓનલાઇન લોન એપ છેતરપિંડી",ur:"آن لائن لون ایپ فراڈ",kn:"ಆನ್‌ಲೈನ್ ಸಾಲ ಅಪ್ ಮೋಸ",
    or:"ଅନଲାଇନ୍ ଋଣ ଆପ୍ ଠକେଇ",ml:"ഓൺലൈൻ ലോൺ ആപ്പ് തട്ടിപ്പ്",
    pa:"ਆਨਲਾਈਨ ਲੋਨ ਐਪ ਧੋਖਾਧੜੀ",as:"অনলাইন ঋণ এপ প্ৰতাৰণা",sa:"आनलाइनऋणएपछलनम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",mr:"कारावास",
    ta:"சிறை",gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Ponzi Scheme",hi:"पोंजी योजना",bn:"পনজি স্কিম",te:"పాన్జీ పథకం",
    mr:"पोंझी योजना",ta:"பான்சி திட்ட மோசடி",gu:"પોન્ઝી યોજના",
    ur:"پونزی اسکیم",kn:"ಪಾಂಝಿ ಯೋಜನೆ",or:"ପଞ୍ଜି ଯୋଜନା",
    ml:"പോൺസി പദ്ധതി",pa:"ਪੌਂਜ਼ੀ ਸਕੀਮ",as:"পনজি আঁচনি",sa:"पोंजीयोजना"
  },
  sec:"BUDS Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",mr:"कारावास",
    ta:"சிறை",gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Insurance Scam",hi:"फर्जी बीमा घोटाला",bn:"ভুয়া বীমা কেলেঙ্কারি",
    te:"నకిలీ బీమా మోసం",mr:"बनावट विमा घोटाळा",ta:"போலி காப்பீடு மோசடி",
    gu:"નકલી વીમા કૌભાંડ",ur:"جعلی انشورنس فراڈ",kn:"ನಕಲಿ ವಿಮಾ ಮೋಸ",
    or:"ନକଲି ବୀମା ଠକେଇ",ml:"വ്യാജ ഇൻഷുറൻസ് തട്ടിപ്പ്",
    pa:"ਨਕਲੀ ਬੀਮਾ ਘਪਲਾ",as:"ভুৱা বীমা কেলেঙ্কাৰী",sa:"कूटबीमाछलनम्"
  },
  sec:"IPC 420",
  punishment:{
    en:"Up to 7 years",hi:"7 वर्ष तक",bn:"৭ বছর পর্যন্ত",te:"7 సంవత్సరాల వరకు",
    mr:"7 वर्षांपर्यंत",ta:"7 ஆண்டுகள் வரை",gu:"7 વર્ષ સુધી",ur:"7 سال تک",
    kn:"7 ವರ್ಷಗಳವರೆಗೆ",or:"7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",ml:"7 വർഷം വരെ",
    pa:"7 ਸਾਲ ਤੱਕ",as:"৭ বছৰৰ ভিতৰত",sa:"सप्तवर्षपर्यन्तम्"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Banking Calls",hi:"फर्जी बैंक कॉल",bn:"ভুয়া ব্যাংক কল",
    te:"నకిలీ బ్యాంక్ కాల్స్",mr:"बनावट बँक कॉल",ta:"போலி வங்கி அழைப்புகள்",
    gu:"નકલી બેંક કોલ",ur:"جعلی بینک کالز",kn:"ನಕಲಿ ಬ್ಯಾಂಕ್ ಕರೆಗಳು",
    or:"ନକଲି ବ୍ୟାଙ୍କ କଲ୍",ml:"വ്യാജ ബാങ്ക് കോളുകൾ",
    pa:"ਨਕਲੀ ਬੈਂਕ ਕਾਲਾਂ",as:"ভুৱা বেংক কল",sa:"कूटबैंकआह्वानम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",mr:"कारावास",
    ta:"சிறை",gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"QR Code Scam",hi:"क्यूआर कोड धोखाधड़ी",bn:"কিউআর কোড প্রতারণা",
    te:"క్యూఆర్ కోడ్ మోసం",mr:"क्यूआर कोड फसवणूक",ta:"QR கோடு மோசடி",
    gu:"ક્યુઆર કોડ છેતરપિંડી",ur:"کیو آر کوڈ فراڈ",kn:"ಕ್ಯೂಆರ್ ಕೋಡ್ ಮೋಸ",
    or:"କ୍ୟୁଆର୍ କୋଡ୍ ଠକେଇ",ml:"ക്യൂആർ കോഡ് തട്ടിപ്പ്",
    pa:"ਕਿਊਆਰ ਕੋਡ ਧੋਖਾਧੜੀ",as:"কিউআর কোড প্ৰতাৰণা",sa:"क्यूआरकोडछलनम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",mr:"कारावास",
    ta:"சிறை",gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Parking",hi:"अवैध पार्किंग",bn:"অবৈধ পার্কিং",
    te:"అక్రమ పార్కింగ్",mr:"बेकायदेशीर पार्किंग",ta:"சட்டவிரோத நிறுத்தம்",
    gu:"અવૈધ પાર્કિંગ",ur:"غیر قانونی پارکنگ",kn:"ಅಕ್ರಮ ಪಾರ್ಕಿಂಗ್",
    or:"ଅବୈଧ ପାର୍କିଂ",ml:"നിയമവിരുദ്ധ പാർക്കിംഗ്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਪਾਰਕਿੰਗ",as:"অবৈধ পাৰ্কিং",sa:"अवैधवाहनस्थापनम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",mr:"दंड",
    ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",kn:"ದಂಡ",
    or:"ଜରିମାନା",ml:"പിഴ",pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Driving Without License",hi:"बिना लाइसेंस ड्राइविंग",bn:"লাইসেন্স ছাড়া গাড়ি চালানো",
    te:"లైసెన్స్ లేకుండా డ్రైవింగ్",mr:"परवाना नसताना वाहन चालवणे",
    ta:"உரிமம் இன்றி ஓட்டுதல்",gu:"લાયસન્સ વગર ડ્રાઇવિંગ",
    ur:"بغیر لائسنس ڈرائیونگ",kn:"ಪರವಾನಗಿ ಇಲ್ಲದೆ ಚಾಲನೆ",
    or:"ଲାଇସେନ୍ସ ବିନା ଚଳାନ",
    ml:"ലൈസൻസില്ലാതെ വാഹനമോടിക്കൽ",
    pa:"ਲਾਇਸੈਂਸ ਤੋਂ ਬਿਨਾਂ ਡਰਾਈਵਿੰਗ",
    as:"লাইচেন্স নোহোৱাকৈ গাড়ী চলোৱা",sa:"अनुज्ञापत्रविना वाहनचालनम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Over Speeding",hi:"अधिक गति से वाहन चलाना",bn:"অতিরিক্ত গতিতে চালানো",
    te:"అధిక వేగం",mr:"अतिवेग",ta:"அதிவேக ஓட்டம்",
    gu:"વધુ ઝડપ",ur:"تیز رفتاری",kn:"ಅತಿವೇಗ",
    or:"ଅତିବେଗ",ml:"അതിവേഗം",
    pa:"ਜ਼ਿਆਦਾ ਰਫ਼ਤਾਰ",as:"অধিক গতি",sa:"अतिवेगः"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",mr:"दंड",
    ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",kn:"ದಂಡ",
    or:"ଜରିମାନା",ml:"പിഴ",pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},
{
  name:{
    en:"Helmet Rule Violation",hi:"हेलमेट नियम उल्लंघन",bn:"হেলমেট নিয়ম লঙ্ঘন",
    te:"హెల్మెట్ నిబంధన ఉల్లంఘన",mr:"हेल्मेट नियम उल्लंघन",
    ta:"ஹெல்மெட் விதி மீறல்",gu:"હેલ્મેટ નિયમ ભંગ",
    ur:"ہیلمٹ قانون کی خلاف ورزی",kn:"ಹೆಲ್ಮೆಟ್ ನಿಯಮ ಉಲ್ಲಂಘನೆ",
    or:"ହେଲମେଟ୍ ନିୟମ ଉଲ୍ଲଂଘନ",
    ml:"ഹെൽമറ്റ് നിയമ ലംഘനം",pa:"ਹੈਲਮੈਟ ਨਿਯਮ ਉਲੰਘਣਾ",
    as:"হেলমেট নিয়ম উলংঘন",sa:"शिरस्त्राणनियमउल्लंघनम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",mr:"दंड",
    ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",kn:"ದಂಡ",
    or:"ଜରିମାନା",ml:"പിഴ",pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Seat Belt Violation",hi:"सीट बेल्ट नियम उल्लंघन",bn:"সিট বেল্ট নিয়ম লঙ্ঘন",
    te:"సీట్ బెల్ట్ నిబంధన ఉల్లంఘన",mr:"सीट बेल्ट नियम उल्लंघन",
    ta:"சீட் பெல்ட் விதி மீறல்",gu:"સીટ બેલ્ટ નિયમ ભંગ",
    ur:"سیٹ بیلٹ قانون کی خلاف ورزی",kn:"ಸೀಟ್ ಬೆಲ್ಟ್ ನಿಯಮ ಉಲ್ಲಂಘನೆ",
    or:"ସିଟ୍ ବେଲ୍ଟ ନିୟମ ଉଲ୍ଲଂଘନ",
    ml:"സീറ്റ് ബെൽറ്റ് നിയമ ലംഘനം",pa:"ਸੀਟ ਬੈਲਟ ਨਿਯਮ ਉਲੰਘਣਾ",
    as:"চিট বেল্ট নিয়ম উলংঘন",sa:"आसनपट्टिकानियमउल्लंघनम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",mr:"दंड",
    ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",kn:"ದಂಡ",
    or:"ଜରିମାନା",ml:"പിഴ",pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Signal Jumping",hi:"सिग्नल तोड़ना",bn:"সিগন্যাল ভাঙা",
    te:"సిగ్నల్ దాటడం",mr:"सिग्नल तोडणे",
    ta:"சிக்னல் மீறல்",gu:"સિગ્નલ તોડવું",
    ur:"سگنل توڑنا",kn:"ಸಿಗ್ನಲ್ ಜಂಪ್",
    or:"ସିଗ୍ନାଲ ଉଲ୍ଲଂଘନ",
    ml:"സിഗ്നൽ ലംഘനം",pa:"ਸਿਗਨਲ ਤੋੜਨਾ",
    as:"চিগনেল ভঙা",sa:"संकेतउल्लंघनम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",mr:"दंड",
    ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",kn:"ದಂಡ",
    or:"ଜରିମାନା",ml:"പിഴ",pa:"ਜੁਰਮਾਨਾ",as:"জৰிமনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Illegal Water Connection",hi:"अवैध जल कनेक्शन",bn:"অবৈধ জল সংযোগ",
    te:"అక్రమ నీటి కనెక్షన్",mr:"बेकायदेशीर पाणी जोडणी",
    ta:"சட்டவிரோத நீர் இணைப்பு",gu:"અવૈધ પાણી જોડાણ",
    ur:"غیر قانونی پانی کنکشن",kn:"ಅಕ್ರಮ ನೀರಿನ ಸಂಪರ್ಕ",
    or:"ଅବୈଧ ଜଳ ସଂଯୋଗ",
    ml:"നിയമവിരുദ്ധ ജല ബന്ധം",pa:"ਗੈਰਕਾਨੂੰਨੀ ਪਾਣੀ ਕਨੈਕਸ਼ਨ",
    as:"অবৈধ পানী সংযোগ",sa:"अवैधजलसंयोगः"
  },
  sec:"Municipal Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Electricity Hooking",hi:"अवैध बिजली हुकिंग",bn:"অবৈধ বিদ্যুৎ সংযোগ",
    te:"అక్రమ విద్యుత్ హుకింగ్",mr:"बेकायदेशीर वीज हुकिंग",
    ta:"மின்சார ஹூக்கிங்",gu:"અવૈધ વિજળી હુકિંગ",
    ur:"غیر قانونی بجلی ہکنگ",kn:"ಅಕ್ರಮ ವಿದ್ಯುತ್ ಹೂಕಿಂಗ್",
    or:"ଅବୈଧ ବିଦ୍ୟୁତ୍ ହୁକିଂ",
    ml:"നിയമവിരുദ്ധ വൈദ്യുതി ഹുക്കിംഗ്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਬਿਜਲੀ ਹੂਕਿੰਗ",
    as:"অবৈধ বিদ্যুৎ হুকিং",sa:"अवैधविद्युत्संयोजनम्"
  },
  sec:"Electricity Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Water Pollution",hi:"जल प्रदूषण",bn:"জল দূষণ",
    te:"నీటి కాలుష్యం",mr:"जल प्रदूषण",
    ta:"நீர் மாசுபாடு",gu:"જળ પ્રદૂષણ",
    ur:"آبی آلودگی",kn:"ನೀರಿನ ಮಾಲಿನ್ಯ",
    or:"ଜଳ ଦୂଷଣ",ml:"ജല മലിനീകരണം",
    pa:"ਜਲ ਪ੍ਰਦੂਸ਼ਣ",as:"জল দূষণ",sa:"जलप्रदूषणम्"
  },
  sec:"Water Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Animal Cruelty",hi:"पशु क्रूरता",bn:"প্রাণী নির্যাতন",
    te:"జంతు క్రూరత్వం",mr:"प्राणी क्रूरता",
    ta:"விலங்கு கொடுமை",gu:"પ્રાણી ક્રૂરતા",
    ur:"جانوروں پر ظلم",kn:"ಪ್ರಾಣಿ ಕ್ರೂರತೆ",
    or:"ପଶୁ ନିର୍ଯାତନା",ml:"മൃഗപീഡനം",
    pa:"ਪਸ਼ੂ ਕਿਰੂਰਤਾ",as:"পশু নিষ্ঠুৰতা",sa:"पशुक्रूरता"
  },
  sec:"PCA Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Stray Animal Abuse",hi:"आवारा पशु दुर्व्यवहार",bn:"ভবঘুরে প্রাণী নির্যাতন",
    te:"దారి తప్పిన జంతు దుర్వినియోగం",mr:"भटकी प्राणी छळ",
    ta:"தெரு விலங்கு துஷ்பிரயோகம்",gu:"આવારા પ્રાણી દુર્વ્યવહાર",
    ur:"آوارہ جانوروں پر ظلم",kn:"ಬೀದಿ ಪ್ರಾಣಿ ದೌರ್ಜನ್ಯ",
    or:"ଭ୍ରମଣଶୀଳ ପଶୁ ନିର୍ଯାତନା",
    ml:"തെരുവ് മൃഗ പീഡനം",pa:"ਆਵਾਰਾ ਜਾਨਵਰ ਜ਼ੁਲਮ",
    as:"ভ্ৰাম্যমান পশু নিৰ্যাতন",sa:"भ्रमणशीलपशुदुराचारः"
  },
  sec:"IPC / PCA Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Slaughter",hi:"अवैध वध",bn:"অবৈধ জবাই",
    te:"అక్రమ వధ",mr:"बेकायदेशीर कत्तल",
    ta:"சட்டவிரோத அறுத்தல்",gu:"અવૈધ કતલ",
    ur:"غیر قانونی ذبح",kn:"ಅಕ್ರಮ ವಧೆ",
    or:"ଅବୈଧ ବଧ",ml:"നിയമവിരുദ്ധ അറുക്കൽ",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਵੱਧ",as:"অবৈধ বধ",sa:"अवैधवधः"
  },
  sec:"State Animal Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},
{
  name:{
    en:"Temple Property Encroachment",
    hi:"मंदिर संपत्ति अतिक्रमण",
    bn:"মন্দির সম্পত্তি দখল",
    te:"ఆలయ ఆస్తి ఆక్రమణ",
    mr:"मंदिर मालमत्ता अतिक्रमण",
    ta:"கோவில் சொத்து ஆக்கிரமிப்பு",
    gu:"મંદિર મિલકત પર કબજો",
    ur:"مندر کی جائیداد پر قبضہ",
    kn:"ದೇವಾಲಯ ಆಸ್ತಿ ಅಕ್ರಮ ವಶ",
    or:"ମନ୍ଦିର ସମ୍ପତ୍ତି ଦଖଲ",
    ml:"ക്ഷേത്ര സ്വത്ത് കയ്യേറ്റം",
    pa:"ਮੰਦਰ ਸੰਪਤੀ ਕਬਜ਼ਾ",
    as:"মন্দিৰ সম্পত্তি দখল",
    sa:"देवालयसम्पत्त्यतिक्रमणम्"
  },
  sec:"HR&CE Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Religious Property Damage",
    hi:"धार्मिक संपत्ति को नुकसान",
    bn:"ধর্মীয় সম্পত্তি ক্ষতি",
    te:"మత ఆస్తి నష్టం",
    mr:"धार्मिक मालमत्तेचे नुकसान",
    ta:"மத சொத்து சேதம்",
    gu:"ધાર્મિક મિલકતને નુકસાન",
    ur:"مذہبی املاک کو نقصان",
    kn:"ಧಾರ್ಮಿಕ ಆಸ್ತಿಗೆ ಹಾನಿ",
    or:"ଧାର୍ମିକ ସମ୍ପତ୍ତି କ୍ଷତି",
    ml:"മതസ്വത്തിന് നാശം",
    pa:"ਧਾਰਮਿਕ ਸੰਪਤੀ ਨੁਕਸਾਨ",
    as:"ধাৰ্মিক সম্পত্তি ক্ষতি",
    sa:"धार्मिकसम्पत्तिनाशः"
  },
  sec:"IPC 295",
  punishment:{
    en:"Up to 2 years",
    hi:"2 वर्ष तक",
    bn:"২ বছর পর্যন্ত",
    te:"2 సంవత్సరాల వరకు",
    mr:"2 वर्षांपर्यंत",
    ta:"2 ஆண்டுகள் வரை",
    gu:"2 વર્ષ સુધી",
    ur:"2 سال تک",
    kn:"2 ವರ್ಷಗಳವರೆಗೆ",
    or:"2 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml:"2 വർഷം വരെ",
    pa:"2 ਸਾਲ ਤੱਕ",
    as:"২ বছৰৰ ভিতৰত",
    sa:"द्विवर्षपर्यन्तम्"
  },
  lvl:"high"
},

{
  name:{
    en:"Religious Hatred Speech",
    hi:"धार्मिक घृणा भाषण",
    bn:"ধর্মীয় বিদ্বেষমূলক বক্তব্য",
    te:"మత ద్వేష ప్రసంగం",
    mr:"धार्मिक द्वेषपूर्ण भाषण",
    ta:"மத வெறுப்பு பேச்சு",
    gu:"ધાર્મિક દ્વેષ ભાષણ",
    ur:"مذہبی نفرت انگیز تقریر",
    kn:"ಧಾರ್ಮಿಕ ದ್ವೇಷ ಭಾಷಣ",
    or:"ଧାର୍ମିକ ଘୃଣା ଭାଷଣ",
    ml:"മതവിദ്വേഷ പ്രസംഗം",
    pa:"ਧਾਰਮਿਕ ਨਫ਼ਰਤੀ ਭਾਸ਼ਣ",
    as:"ধাৰ্মিক ঘৃণামূলক ভাষণ",
    sa:"धार्मिकद्वेषभाषणम्"
  },
  sec:"IPC 153A",
  punishment:{
    en:"Up to 3 years",
    hi:"3 वर्ष तक",
    bn:"৩ বছর পর্যন্ত",
    te:"3 సంవత్సరాల వరకు",
    mr:"3 वर्षांपर्यंत",
    ta:"3 ஆண்டுகள் வரை",
    gu:"3 વર્ષ સુધી",
    ur:"3 سال تک",
    kn:"3 ವರ್ಷಗಳವರೆಗೆ",
    or:"3 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml:"3 വർഷം വരെ",
    pa:"3 ਸਾਲ ਤੱਕ",
    as:"৩ বছৰৰ ভিতৰত",
    sa:"त्रिवर्षपर्यन्तम्"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Surveillance",
    hi:"अवैध निगरानी",
    bn:"অবৈধ নজরদারি",
    te:"అక్రమ నిఘా",
    mr:"बेकायदेशीर पाळत ठेवणे",
    ta:"சட்டவிரோத கண்காணிப்பு",
    gu:"અવૈધ નજર રાખવું",
    ur:"غیر قانونی نگرانی",
    kn:"ಅಕ್ರಮ ನಿಗಾವಹಣೆ",
    or:"ଅବୈଧ ନିରୀକ୍ଷଣ",
    ml:"നിയമവിരുദ്ധ നിരീക്ഷണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਨਿਗਰਾਨੀ",
    as:"অবৈধ নিৰীক্ষণ",
    sa:"अवैधनिरीक्षणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Phone Tapping Without Authority",
    hi:"अनधिकृत फोन टैपिंग",
    bn:"অননুমোদিত ফোন ট্যাপিং",
    te:"అనుమతి లేని ఫోన్ ట్యాపింగ్",
    mr:"अनधिकृत फोन टॅपिंग",
    ta:"அனுமதி இல்லா தொலைபேசி ஒட்டுக்கேட்பு",
    gu:"અનધિકૃત ફોન ટેપિંગ",
    ur:"غیر مجاز فون ٹیپنگ",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಫೋನ್ ಟ್ಯಾಪಿಂಗ್",
    or:"ଅନଧିକୃତ ଫୋନ୍ ଟ୍ୟାପିଂ",
    ml:"അനുമതിയില്ലാത്ത ഫോൺ ടാപ്പിംഗ്",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਫੋਨ ਟੈਪਿੰਗ",
    as:"অনুমতি নথকা ফোন টেপিং",
    sa:"अनधिकृतदूरभाषाश्रवणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Privacy Invasion",
    hi:"निजता का उल्लंघन",
    bn:"গোপনীয়তা লঙ্ঘন",
    te:"గోప్యత ఉల్లంఘన",
    mr:"गोपनीयतेचा भंग",
    ta:"தனியுரிமை மீறல்",
    gu:"ગોપનીયતા ભંગ",
    ur:"نجی زندگی میں مداخلت",
    kn:"ಗೌಪ್ಯತೆ ಉಲ್ಲಂಘನೆ",
    or:"ଗୋପନୀୟତା ଉଲ୍ଲଂଘନ",
    ml:"സ്വകാര്യത ലംഘനം",
    pa:"ਨਿੱਜਤਾ ਦਾ ਉਲੰਘਣ",
    as:"গোপনীয়তা লঙ্ঘন",
    sa:"गोपनीयताभङ्गः"
  },
  sec:"IT Act",
  punishment:{
    en:"Fine / Jail",
    hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Revenge Porn",
    hi:"बदले की अश्लील सामग्री",
    bn:"প্রতিশোধমূলক পর্নোগ্রাফি",
    te:"ప్రతీకార అశ్లీలత",
    mr:"सूडकामासाठी अश्लीलता",
    ta:"பழிவாங்கும் ஆபாசம்",
    gu:"પ્રતિશોધરૂપ અશ્લીલતા",
    ur:"انتقامی فحش مواد",
    kn:"ಪ್ರತೀಕಾರ ಅಶ್ಲೀಲತೆ",
    or:"ପ୍ରତିଶୋଧମୂଳକ ଅଶ୍ଳୀଳତା",
    ml:"പ്രതികാര അശ്ലീലത",
    pa:"ਬਦਲਾ ਲੈਣ ਵਾਲੀ ਅਸ਼ਲੀਲਤਾ",
    as:"প্ৰতিশোধমূলক অশ্লীলতা",
    sa:"प्रतिशोधाश्लीलता"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Non-consensual Image Sharing",
    hi:"बिना सहमति तस्वीर साझा करना",
    bn:"সম্মতি ছাড়া ছবি শেয়ার",
    te:"అనుమతి లేకుండా చిత్రాల పంచకం",
    mr:"संमतीशिवाय प्रतिमा शेअर करणे",
    ta:"அனுமதி இல்லா புகைப்பட பகிர்வு",
    gu:"સંમતિ વિના તસવીર વહેંચણી",
    ur:"بغیر اجازت تصویر شیئر کرنا",
    kn:"ಒಪ್ಪಿಗೆಯಿಲ್ಲದೆ ಚಿತ್ರ ಹಂಚಿಕೆ",
    or:"ସମ୍ମତି ବିନା ଛବି ସେୟାର",
    ml:"അനുമതിയില്ലാതെ ചിത്രം പങ്കിടൽ",
    pa:"ਬਿਨਾਂ ਸਹਿਮਤੀ ਤਸਵੀਰ ਸਾਂਝੀ ਕਰਨਾ",
    as:"অনুমতি নোহোৱাকৈ ছবি শ্বেয়াৰ",
    sa:"अननुमतचित्रसाझाकरणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"False FIR Filing",
    hi:"झूठी एफआईआर दर्ज करना",
    bn:"মিথ্যা এফআইআর দায়ের",
    te:"తప్పుడు ఎఫ్ఐఆర్ నమోదు",
    mr:"खोटी एफआयआर दाखल",
    ta:"பொய் FIR பதிவு",
    gu:"ખોટી એફઆઈઆર નોંધણી",
    ur:"جھوٹی ایف آئی آر درج کرنا",
    kn:"ಸುಳ್ಳು ಎಫ್ಐಆರ್ ದಾಖಲು",
    or:"ମିଥ୍ୟା ଏଫଆଇଆର୍ ଦାଖଲ",
    ml:"വ്യാജ എഫ്ഐആർ ഫയൽ ചെയ്യൽ",
    pa:"ਝੂਠੀ ਐਫਆਈਆਰ ਦਰਜ",
    as:"মিছা এফআইআৰ দাখিল",
    sa:"मिथ्याएफआईआरदाखिलम्"
  },
  sec:"IPC 182",
  punishment:{
    en:"Up to 6 months",
    hi:"6 महीने तक",
    bn:"৬ মাস পর্যন্ত",
    te:"6 నెలల వరకు",
    mr:"6 महिन्यांपर्यंत",
    ta:"6 மாதங்கள் வரை",
    gu:"6 મહિના સુધી",
    ur:"6 ماہ تک",
    kn:"6 ತಿಂಗಳವರೆಗೆ",
    or:"6 ମାସ ପର୍ଯ୍ୟନ୍ତ",
    ml:"6 മാസം വരെ",
    pa:"6 ਮਹੀਨੇ ਤੱਕ",
    as:"৬ মাহ",
    sa:"षट्मासपर्यन्तम्"
  },
  lvl:"medium"
},

{
  name:{
    en:"False Evidence",
    hi:"झूठी गवाही",
    bn:"মিথ্যা সাক্ষ্য",
    te:"తప్పుడు సాక్ష్యం",
    mr:"खोटी साक्ष",
    ta:"பொய் சாட்சி",
    gu:"ખોટી સાક્ષી",
    ur:"جھوٹی گواہی",
    kn:"ಸುಳ್ಳು ಸಾಕ್ಷ್ಯ",
    or:"ମିଥ୍ୟା ସାକ୍ଷ୍ୟ",
    ml:"വ്യാജ സാക്ഷ്യം",
    pa:"ਝੂਠੀ ਗਵਾਹੀ",
    as:"মিছা সাক্ষ্য",
    sa:"मिथ्यासाक्ष्यम्"
  },
  sec:"IPC 191",
  punishment:{
    en:"Up to 7 years",
    hi:"7 वर्ष तक",
    bn:"৭ বছর পর্যন্ত",
    te:"7 సంవత్సరాల వరకు",
    mr:"7 वर्षांपर्यंत",
    ta:"7 ஆண்டுகள் வரை",
    gu:"7 વર્ષ સુધી",
    ur:"7 سال تک",
    kn:"7 ವರ್ಷಗಳವರೆಗೆ",
    or:"7 ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ",
    ml:"7 വർഷം വരെ",
    pa:"7 ਸਾਲ ਤੱਕ",
    as:"৭ বছৰৰ ভিতৰত",
    sa:"सप्तवर्षपर्यन्तम्"
  },
  lvl:"high"
},

{
  name:{
    en:"Evidence Tampering",
    hi:"सबूत से छेड़छाड़",
    bn:"প্রমাণ নষ্ট করা",
    te:"సాక్ష్యాలను మార్చడం",
    mr:"पुरावा छेडछाड",
    ta:"சாட்சிய மாற்றம்",
    gu:"પુરાવામાં હેરફેર",
    ur:"شواہد سے چھیڑ چھاڑ",
    kn:"ಸಾಕ್ಷ್ಯ ತಿರುವು",
    or:"ସାକ୍ଷ୍ୟ ନଷ୍ଟ",
    ml:"തെളിവ് കൈക്കളവ്",
    pa:"ਸਬੂਤ ਨਾਲ ਛੇੜਛਾੜ",
    as:"প্ৰমাণ নষ্ট কৰা",
    sa:"प्रमाणविकृति"
  },
  sec:"IPC 201",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Witness Threatening",
    hi:"गवाह को धमकी",
    bn:"সাক্ষীকে হুমকি",
    te:"సాక్షికి బెదిరింపు",
    mr:"साक्षीला धमकी",
    ta:"சாட்சிய மிரட்டல்",
    gu:"સાક્ષીને ધમકી",
    ur:"گواہ کو دھمکی",
    kn:"ಸಾಕ್ಷಿಗೆ ಬೆದರಿಕೆ",
    or:"ସାକ୍ଷୀକୁ ଧମକ",
    ml:"സാക്ഷിയെ ഭീഷണിപ്പെടുത്തൽ",
    pa:"ਗਵਾਹ ਨੂੰ ਧਮਕੀ",
    as:"সাক্ষীক ধমকি",
    sa:"साक्षिभयप्रदर्शनम्"
  },
  sec:"IPC 506",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Court Document Destruction",
    hi:"न्यायालय दस्तावेज़ नष्ट करना",
    bn:"আদালতের নথি ধ্বংস",
    te:"కోర్టు పత్రాలు నాశనం",
    mr:"न्यायालयीन कागदपत्र नष्ट करणे",
    ta:"நீதிமன்ற ஆவணம் அழித்தல்",
    gu:"અદાલતી દસ્તાવેજ નાશ",
    ur:"عدالتی دستاویزات کی تباہی",
    kn:"ನ್ಯಾಯಾಲಯದ ದಾಖಲೆ ನಾಶ",
    or:"ନ୍ୟାୟାଳୟ ଦଲିଲ ନଷ୍ଟ",
    ml:"കോടതി രേഖ നശിപ്പിക്കൽ",
    pa:"ਅਦਾਲਤੀ ਦਸਤਾਵੇਜ਼ ਨਸ਼ਟ",
    as:"আদালতৰ নথি ধ্বংস",
    sa:"न्यायालयलेखनाशः"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Illegal Strike Violence",
    hi:"अवैध हड़ताल हिंसा",
    bn:"অবৈধ ধর্মঘট সহিংসতা",
    te:"అక్రమ సమ్మె హింస",
    mr:"बेकायदेशीर संप हिंसा",
    ta:"சட்டவிரோத வேலைநிறுத்த வன்முறை",
    gu:"અવૈધ હડતાલ હિંસા",
    ur:"غیر قانونی ہڑتال تشدد",
    kn:"ಅಕ್ರಮ ಮುಷ್ಕರ ಹಿಂಸೆ",
    or:"ଅବୈଧ ହଡତାଳ ହିଂସା",
    ml:"നിയമവിരുദ്ധ പണിമുടക്ക് അക്രമം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਹੜਤਾਲ ਹਿੰਸਾ",
    as:"অবৈধ ধৰ্মঘট হিংসা",
    sa:"अवैधहड़तालहिंसा"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Union Coercion",
    hi:"यूनियन द्वारा दबाव",
    bn:"ইউনিয়ন জবরদস্তি",
    te:"యూనియన్ బలవంతం",
    mr:"संघटनेचा दबाव",
    ta:"தொழிற்சங்க கட்டாயப்படுத்தல்",
    gu:"યુનિયન દબાણ",
    ur:"یونین جبر",
    kn:"ಯೂನಿಯನ್ ಬಲವಂತ",
    or:"ୟୁନିଅନ ଜବରଦସ୍ତି",
    ml:"യൂണിയൻ നിർബന്ധം",
    pa:"ਯੂਨੀਅਨ ਜ਼ਬਰਦਸਤੀ",
    as:"ইউনিয়ন জোৰজবৰদস্তি",
    sa:"संघदबावः"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Workplace Sexual Abuse",
    hi:"कार्यस्थल पर यौन शोषण",
    bn:"কর্মক্ষেত্রে যৌন নির্যাতন",
    te:"పనిస్థల లైంగిక వేధింపులు",
    mr:"कामाच्या ठिकाणी लैंगिक छळ",
    ta:"வேலை இட பாலியல் துஷ்பிரயோகம்",
    gu:"કાર્યસ્થળે જાતીય શોષણ",
    ur:"کام کی جگہ جنسی استحصال",
    kn:"ಕಾರ್ಯಸ್ಥಳ ಲೈಂಗಿಕ ದೌರ್ಜನ್ಯ",
    or:"କାର୍ଯ୍ୟସ୍ଥଳରେ ଯୌନ ଉତ୍ପୀଡନ",
    ml:"ജോലിസ്ഥല ലൈംഗിക പീഡനം",
    pa:"ਕੰਮਕਾਜ ਦੀ ਥਾਂ ਤੇ ਜਿਨਸੀ ਦੁਰਵਿਹਾਰ",
    as:"কৰ্মক্ষেত্ৰত যৌন নিৰ্যাতন",
    sa:"कार्यस्थले लैङ्गिकदुराचारः"
  },
  sec:"POSH Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Forced Resignation",
    hi:"जबरन इस्तीफा",
    bn:"জোরপূর্বক পদত্যাগ",
    te:"బలవంతపు రాజీనామా",
    mr:"जबरदस्ती राजीनामा",
    ta:"கட்டாய ராஜினாமா",
    gu:"જબરદસ્તી રાજીનામું",
    ur:"زبردستی استعفیٰ",
    kn:"ಬಲವಂತದ ರಾಜೀನಾಮೆ",
    or:"ଜବରଦସ୍ତି ପଦତ୍ୟାଗ",
    ml:"ബലപ്രയോഗ രാജി",
    pa:"ਜ਼ਬਰਦਸਤੀ ਅਸਤੀਫ਼ਾ",
    as:"জোৰপূৰ্বক পদত্যাগ",
    sa:"बलात् त्यागः"
  },
  sec:"Labour Laws",
  punishment:{
    en:"Fine / Jail",
    hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Wage Withholding",
    hi:"वेतन रोकना",
    bn:"মজুরি আটকে রাখা",
    te:"వేతనం నిలిపివేత",
    mr:"वेतन रोखणे",
    ta:"ஊதியம் தடுத்து வைத்தல்",
    gu:"વેતન અટકાવવું",
    ur:"تنخواہ روکنا",
    kn:"ವೇತನ ತಡೆ",
    or:"ମଜୁରି ଅଟକ",
    ml:"വേതനം തടഞ്ഞുവെക്കൽ",
    pa:"ਤਨਖਾਹ ਰੋਕਣਾ",
    as:"মজুৰি আটকোৱা",
    sa:"वेतननिरोधः"
  },
  sec:"Payment of Wages Act",
  punishment:{
    en:"Fine / Jail",
    hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Data Brokerage",
    hi:"अवैध डेटा दलाली",
    bn:"অবৈধ ডেটা দালালি",
    te:"అక్రమ డేటా దళారీ",
    mr:"बेकायदेशीर डेटा दलाली",
    ta:"சட்டவிரோத தரவு விற்பனை",
    gu:"અવૈધ ડેટા દલાલી",
    ur:"غیر قانونی ڈیٹا دلالی",
    kn:"ಅಕ್ರಮ ಡೇಟಾ ದಲ್ಲಾಳಿ",
    or:"ଅବୈଧ ଡାଟା ଦଲାଲି",
    ml:"നിയമവിരുദ്ധ ഡാറ്റ ബ്രോക്കറേജ്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਡਾਟਾ ਦਲਾਲੀ",
    as:"অবৈধ ডাটা দালালি",
    sa:"अवैधदत्तवणिज्यम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Sale of Personal Data",
    hi:"व्यक्तिगत डेटा की बिक्री",
    bn:"ব্যক্তিগত তথ্য বিক্রি",
    te:"వ్యక్తిగత డేటా విక్రయం",
    mr:"वैयक्तिक डेटाची विक्री",
    ta:"தனிப்பட்ட தகவல் விற்பனை",
    gu:"વ્યક્તિગત ડેટા વેચાણ",
    ur:"ذاتی ڈیٹا کی فروخت",
    kn:"ವೈಯಕ್ತಿಕ ಡೇಟಾ ಮಾರಾಟ",
    or:"ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ବିକ୍ରୟ",
    ml:"വ്യക്തിഗത ഡാറ്റ വിൽപ്പന",
    pa:"ਨਿੱਜੀ ਡਾਟਾ ਵਿਕਰੀ",
    as:"ব্যক্তিগত তথ্য বিক্ৰী",
    sa:"व्यक्तिगतदत्तविक्रयः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Biometric Data Misuse",
    hi:"बायोमेट्रिक डेटा का दुरुपयोग",
    bn:"বায়োমেট্রিক ডেটার অপব্যবহার",
    te:"బయోమెట్రిక్ డేటా దుర్వినియోగం",
    mr:"बायोमेट्रिक डेटाचा गैरवापर",
    ta:"உயிரளவியல் தரவு தவறான பயன்பாடு",
    gu:"બાયોમેટ્રિક ડેટાનો દુરુપયોગ",
    ur:"بایومیٹرک ڈیٹا کا غلط استعمال",
    kn:"ಜೈವಮಿತೀಯ ಡೇಟಾ ದುರ್ಬಳಕೆ",
    or:"ବାୟୋମେଟ୍ରିକ୍ ଡାଟା ଦୁର୍ବ୍ୟବହାର",
    ml:"ബയോമെട്രിക് ഡാറ്റ ദുരുപയോഗം",
    pa:"ਬਾਇਓਮੈਟ੍ਰਿਕ ਡਾਟਾ ਦੁਰਵਰਤੋਂ",
    as:"বায়োমেট্ৰিক ডাটা অপব্যৱহাৰ",
    sa:"जैवमितीयदत्तदुरुपयोगः"
  },
  sec:"IT / Aadhaar Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Facial Recognition Abuse",
    hi:"चेहरा पहचान दुरुपयोग",
    bn:"মুখ শনাক্তকরণ অপব্যবহার",
    te:"ముఖ గుర్తింపు దుర్వినియోగం",
    mr:"चेहरा ओळख गैरवापर",
    ta:"முக அடையாள தொழில்நுட்ப துஷ்பிரயோகம்",
    gu:"ચહેરા ઓળખ દુરુપયોગ",
    ur:"چہرہ شناخت کا غلط استعمال",
    kn:"ಮುಖ ಗುರುತಿಸುವಿಕೆ ದುರ್ಬಳಕೆ",
    or:"ମୁଖ ପରିଚୟ ଦୁର୍ବ୍ୟବହାର",
    ml:"മുഖ തിരിച്ചറിയൽ ദുരുപയോഗം",
    pa:"ਚਿਹਰਾ ਪਹਿਚਾਣ ਦੁਰਵਰਤੋਂ",
    as:"মুখ চিনাক্তকৰণ অপব্যৱহাৰ",
    sa:"मुखपरिचयदुरुपयोगः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized AI Profiling",
    hi:"अनधिकृत एआई प्रोफाइलिंग",
    bn:"অননুমোদিত এআই প্রোফাইলিং",
    te:"అనుమతి లేని ఏఐ ప్రొఫైలింగ్",
    mr:"अनधिकृत एआय प्रोफाइलिंग",
    ta:"அனுமதி இல்லா AI விவரப்படுத்தல்",
    gu:"અનધિકૃત એઆઈ પ્રોફાઇલિંગ",
    ur:"غیر مجاز اے آئی پروفائلنگ",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಎಐ ಪ್ರೊಫೈಲಿಂಗ್",
    or:"ଅନଧିକୃତ ଏଆଇ ପ୍ରୋଫାଇଲିଂ",
    ml:"അനുമതിയില്ലാത്ത എഐ പ്രൊഫൈലിംഗ്",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਏਆਈ ਪ੍ਰੋਫਾਇਲਿੰਗ",
    as:"অনুমতি নোহোৱা এআই প্ৰোফাইলিং",
    sa:"अनधिकृतकृत्रिमबुद्धिपरिचयः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Crowd Control Violence",
    hi:"अवैध भीड़ नियंत्रण हिंसा",
    bn:"অবৈধ ভিড় নিয়ন্ত্রণ সহিংসতা",
    te:"అక్రమ జనసమూహ నియంత్రణ హింస",
    mr:"बेकायदेशीर गर्दी नियंत्रण हिंसा",
    ta:"சட்டவிரோத கூட்ட கட்டுப்பாட்டு வன்முறை",
    gu:"અવૈધ ભીડ નિયંત્રણ હિંસા",
    ur:"غیر قانونی ہجوم کنٹرول تشدد",
    kn:"ಅಕ್ರಮ ಗುಂಪು ನಿಯಂತ್ರಣ ಹಿಂಸೆ",
    or:"ଅବୈଧ ଭିଡ଼ ନିୟନ୍ତ୍ରଣ ହିଂସା",
    ml:"നിയമവിരുദ്ധ ജനക്കൂട്ട നിയന്ത്രണ അക്രമം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਭੀੜ ਨਿਯੰਤਰਣ ਹਿੰਸਾ",
    as:"অবৈধ ভিৰ নিয়ন্ত্ৰণ হিংসা",
    sa:"अवैधजनसमूहनियन्त्रणहिंसा"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Use of Excessive Force",
    hi:"अत्यधिक बल का प्रयोग",
    bn:"অতিরিক্ত বল প্রয়োগ",
    te:"అతిశయ బల వినియోగం",
    mr:"अत्याधिक बळाचा वापर",
    ta:"அதிகப்படியான பலம் பயன்பாடு",
    gu:"અતિશય બળનો ઉપયોગ",
    ur:"حد سے زیادہ طاقت کا استعمال",
    kn:"ಅತಿಯಾದ ಬಲ ಬಳಕೆ",
    or:"ଅତ୍ୟଧିକ ବଳ ପ୍ରୟୋଗ",
    ml:"അധികബലം പ്രയോഗം",
    pa:"ਹੱਦ ਤੋਂ ਵੱਧ ਬਲ ਵਰਤੋਂ",
    as:"অত্যাধিক বল প্ৰয়োগ",
    sa:"अतिबलप्रयोगः"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Custodial Negligence",
    hi:"हिरासत में लापरवाही",
    bn:"হেফাজতে অবহেলা",
    te:"కస్టడీ నిర్లక్ష్యం",
    mr:"कोठडीतील निष्काळजीपणा",
    ta:"காவல் அலட்சியம்",
    gu:"કસ્ટડી બેદરકારી",
    ur:"حراست میں غفلت",
    kn:"ಬಂಧನ ನಿರ್ಲಕ್ಷ್ಯ",
    or:"ହିରାସତରେ ଅବହେଳା",
    ml:"കസ്റ്റഡിയിൽ അനാസ്ഥ",
    pa:"ਹਿਰਾਸਤ ਵਿੱਚ ਲਾਪਰਵਾਹੀ",
    as:"হেফাজতত অবহেলা",
    sa:"अभिरक्षानिर्लक्ष्यम्"
  },
  sec:"IPC 304A",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Detention by Authority",
    hi:"प्राधिकरण द्वारा अवैध हिरासत",
    bn:"কর্তৃপক্ষের অবৈধ আটক",
    te:"అధికారుల అక్రమ నిర్బంధం",
    mr:"अधिकाऱ्यांकडून बेकायदेशीर नजरकैद",
    ta:"அதிகாரி சட்டவிரோத அடைப்பு",
    gu:"સત્તાધિકારી દ્વારા અવૈધ કેદ",
    ur:"اختیار کی غیر قانونی حراست",
    kn:"ಅಧಿಕಾರಿಯಿಂದ ಅಕ್ರಮ ಬಂಧನ",
    or:"କର୍ତ୍ତୃପକ୍ଷଙ୍କ ଅବୈଧ ଅଟକ",
    ml:"അധികാരിയുടെ നിയമവിരുദ്ധ തടങ്കൽ",
    pa:"ਅਧਿਕਾਰੀ ਵੱਲੋਂ ਗੈਰਕਾਨੂੰਨੀ ਕੈਦ",
    as:"কৰ্তৃপক্ষৰ অবৈধ আটক",
    sa:"अधिकारिणा अवैधनिरोधः"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",
    hi:"कारावास",
    bn:"কারাদণ্ড",
    te:"కారాగారం",
    mr:"कारावास",
    ta:"சிறை",
    gu:"કારાવાસ",
    ur:"قید",
    kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",
    pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",
    sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Denial of Legal Aid",
    hi:"कानूनी सहायता से इनकार",
    bn:"আইনি সহায়তা অস্বীকার",
    te:"న్యాయ సహాయం నిరాకరణ",
    mr:"कायदेशीर मदत नाकारणे",
    ta:"சட்ட உதவி மறுப்பு",
    gu:"કાનૂની સહાય નકાર",
    ur:"قانونی امداد سے انکار",
    kn:"ಕಾನೂನು ಸಹಾಯ ನಿರಾಕರಣೆ",
    or:"ଆଇନ ସହାୟତା ଅସ୍ୱୀକୃତି",
    ml:"നിയമ സഹായം നിഷേധിക്കൽ",
    pa:"ਕਾਨੂੰਨੀ ਮਦਦ ਤੋਂ ਇਨਕਾਰ",
    as:"আইনী সহায়তা অস্বীকাৰ",
    sa:"कानूनीसहायनिषेधः"
  },
  sec:"Legal Services Act",
  punishment:{
    en:"Fine / Action",
    hi:"जुर्माना / कार्रवाई",
    bn:"জরিমানা / ব্যবস্থা",
    te:"జరిమానా / చర్య",
    mr:"दंड / कारवाई",
    ta:"அபராதம் / நடவடிக்கை",
    gu:"દંડ / કાર્યવાહી",
    ur:"جرمانہ / کارروائی",
    kn:"ದಂಡ / ಕ್ರಮ",
    or:"ଜରିମାନା / କାର୍ଯ୍ୟ",
    ml:"പിഴ / നടപടി",
    pa:"ਜੁਰਮਾਨਾ / ਕਾਰਵਾਈ",
    as:"জৰিমনা / ব্যৱস্থা",
    sa:"दण्डः / कार्यवाही"
  },
  lvl:"medium"
},
{
  name:{
    en:"Illegal Arms Display",hi:"अवैध हथियार प्रदर्शन",bn:"অবৈধ অস্ত্র প্রদর্শন",
    te:"అక్రమ ఆయుధ ప్రదర్శన",mr:"बेकायदेशीर शस्त्र प्रदर्शन",
    ta:"சட்டவிரோத ஆயுத காட்சி",gu:"અવૈધ હથિયાર પ્રદર્શન",
    ur:"غیر قانونی اسلحہ نمائش",kn:"ಅಕ್ರಮ ಆಯುಧ ಪ್ರದರ್ಶನ",
    or:"ଅବୈଧ ଅସ୍ତ୍ର ପ୍ରଦର୍ଶନ",
    ml:"നിയമവിരുദ്ധ ആയുധ പ്രദർശനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਹਥਿਆਰ ਪ੍ਰਦਰਸ਼ਨ",
    as:"অবৈধ অস্ত্ৰ প্ৰদৰ্শন",sa:"अवैधायुधप्रदर्शनम्"
  },
  sec:"Arms Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Firearm Training",hi:"अनधिकृत आग्नेयास्त्र प्रशिक्षण",
    bn:"অননুমোদিত আগ্নেয়াস্ত্র প্রশিক্ষণ",
    te:"అనుమతి లేని తుపాకీ శిక్షణ",
    mr:"अनधिकृत बंदूक प्रशिक्षण",
    ta:"அனுமதி இல்லா துப்பாக்கி பயிற்சி",
    gu:"અનધિકૃત ફાયરઆર્મ તાલીમ",
    ur:"غیر مجاز آتشیں اسلحہ تربیت",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಬಂದೂಕು ತರಬೇತಿ",
    or:"ଅନଧିକୃତ ଆଗ୍ନେୟାସ୍ତ୍ର ପ୍ରଶିକ୍ଷଣ",
    ml:"അനുമതിയില്ലാത്ത തോക്ക് പരിശീലനം",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਹਥਿਆਰ ਸਿਖਲਾਈ",
    as:"অনুমতি নথকা আগ্নেয়াস্ত্ৰ প্ৰশিক্ষণ",
    sa:"अनधिकृतशस्त्रप्रशिक्षणम्"
  },
  sec:"Arms Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Explosive Storage Violation",hi:"विस्फोटक भंडारण उल्लंघन",
    bn:"বিস্ফোরক সংরক্ষণ লঙ্ঘন",
    te:"విస్ఫోటక నిల్వ ఉల్లంఘన",
    mr:"स्फोटक साठवण उल्लंघन",
    ta:"வெடிபொருள் சேமிப்பு மீறல்",
    gu:"વિસ્ફોટક સંગ્રહ ભંગ",
    ur:"بارودی مواد ذخیرہ خلاف ورزی",
    kn:"ಸ್ಫೋಟಕ ಸಂಗ್ರಹ ಉಲ್ಲಂಘನೆ",
    or:"ବିସ୍ଫୋଟକ ସଂରକ୍ଷଣ ଉଲ୍ଲଂଘନ",
    ml:"സ്ഫോടക വസ്തു സംഭരണ ലംഘനം",
    pa:"ਵਿਸਫੋਟਕ ਸਟੋਰੇਜ ਉਲੰਘਣਾ",
    as:"বিস্ফোৰক সংৰক্ষণ উলংঘন",
    sa:"विस्फोटकसंग्रहउल्लंघनम्"
  },
  sec:"Explosives Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Fireworks Manufacturing",
    hi:"अवैध पटाखा निर्माण",
    bn:"অবৈধ আতশবাজি উৎপাদন",
    te:"అక్రమ బాణసంచా తయారీ",
    mr:"बेकायदेशीर फटाके उत्पादन",
    ta:"சட்டவிரோத பட்டாசு உற்பத்தி",
    gu:"અવૈધ ફટાકડા ઉત્પાદન",
    ur:"غیر قانونی آتش بازی تیاری",
    kn:"ಅಕ್ರಮ ಪಟಾಕಿ ತಯಾರಿಕೆ",
    or:"ଅବୈଧ ଆତଶବାଜି ଉତ୍ପାଦନ",
    ml:"നിയമവിരുദ്ധ പടക്കം നിർമ്മാണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਪਟਾਕੇ ਤਿਆਰ",
    as:"অবৈধ আতচবাজী উৎপাদন",
    sa:"अवैधदीपावलीनिर्माणम्"
  },
  sec:"Explosives Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Transport of Explosives Without Permit",
    hi:"बिना अनुमति विस्फोटक परिवहन",
    bn:"অনুমতি ছাড়া বিস্ফোরক পরিবহন",
    te:"అనుమతి లేకుండా విస్ఫోటక రవాణా",
    mr:"परवानगीशिवाय स्फोटक वाहतूक",
    ta:"அனுமதி இல்லா வெடிபொருள் கடத்தல்",
    gu:"પરમિટ વિના વિસ્ફોટક પરિવહન",
    ur:"بغیر اجازت بارودی مواد نقل و حمل",
    kn:"ಅನುಮತಿ ಇಲ್ಲದೆ ಸ್ಫೋಟಕ ಸಾಗಣೆ",
    or:"ଅନୁମତି ବିନା ବିସ୍ଫୋଟକ ପରିବହନ",
    ml:"അനുമതിയില്ലാതെ സ്ഫോടക ഗതാഗതം",
    pa:"ਬਿਨਾਂ ਪਰਮਿਟ ਵਿਸਫੋਟਕ ਟਰਾਂਸਪੋਰਟ",
    as:"অনুমতি নথকা বিস্ফোৰক পৰিবহন",
    sa:"अननुमतिविस्फोटकपरिवहनम्"
  },
  sec:"Explosives Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Medical Practice",
    hi:"अवैध चिकित्सा अभ्यास",
    bn:"অবৈধ চিকিৎসা পদ্ধতি",
    te:"అక్రమ వైద్య ప్రాక్టీస్",
    mr:"बेकायदेशीर वैद्यकीय सराव",
    ta:"சட்டவிரோத மருத்துவம்",
    gu:"અવૈધ તબીબી વ્યવહાર",
    ur:"غیر قانونی طبی عمل",
    kn:"ಅಕ್ರಮ ವೈದ್ಯಕೀಯ ಅಭ್ಯಾಸ",
    or:"ଅବୈଧ ଚିକିତ୍ସା ପ୍ରଚଳନ",
    ml:"നിയമവിരുദ്ധ ചികിത്സ",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਮੈਡੀਕਲ ਅਭਿਆਸ",
    as:"অবৈধ চিকিৎসা প্ৰচলন",
    sa:"अवैधचिकित्साप्रयोगः"
  },
  sec:"Medical Council Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Medical Degree",
    hi:"फर्जी मेडिकल डिग्री",
    bn:"ভুয়া চিকিৎসা ডিগ্রি",
    te:"నకిలీ వైద్య డిగ్రీ",
    mr:"बनावट वैद्यकीय पदवी",
    ta:"போலி மருத்துவ பட்டம்",
    gu:"નકલી તબીબી ડિગ્રી",
    ur:"جعلی میڈیکل ڈگری",
    kn:"ನಕಲಿ ವೈದ್ಯಕೀಯ ಪದವಿ",
    or:"ନକଲି ଚିକିତ୍ସା ଡିଗ୍ରୀ",
    ml:"വ്യാജ മെഡിക്കൽ ബിരുദം",
    pa:"ਨਕਲੀ ਮੈਡੀਕਲ ਡਿਗਰੀ",
    as:"ভুৱা চিকিৎসা ডিগ্ৰী",
    sa:"कूटचिकित्सापदवी"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Surgery",
    hi:"अनधिकृत शल्य चिकित्सा",
    bn:"অননুমোদিত অস্ত্রোপচার",
    te:"అనుమతి లేని శస్త్రచికిత్స",
    mr:"अनधिकृत शस्त्रक्रिया",
    ta:"அனுமதி இல்லா அறுவை சிகிச்சை",
    gu:"અનધિકૃત સર્જરી",
    ur:"غیر مجاز سرجری",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ",
    or:"ଅନଧିକୃତ ଶସ୍ତ୍ରକ୍ରିୟା",
    ml:"അനുമതിയില്ലാത്ത ശസ്ത്രക്രിയ",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਸਰਜਰੀ",
    as:"অনুমতি নথকা অস্ত্ৰোপচাৰ",
    sa:"अनधिकृतशस्त्रक्रिया"
  },
  sec:"IPC 304A",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Blood Trade",
    hi:"अवैध रक्त व्यापार",
    bn:"অবৈধ রক্ত বাণিজ্য",
    te:"అక్రమ రక్త వ్యాపారం",
    mr:"बेकायदेशीर रक्त व्यापार",
    ta:"சட்டவிரோத இரத்த வியாபாரம்",
    gu:"અવૈધ રક્ત વેપાર",
    ur:"غیر قانونی خون کی تجارت",
    kn:"ಅಕ್ರಮ ರಕ್ತ ವ್ಯಾಪಾರ",
    or:"ଅବୈଧ ରକ୍ତ ବ୍ୟବସାୟ",
    ml:"നിയമവിരുദ്ധ രക്ത വ്യാപാരം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਖੂਨ ਵਪਾਰ",
    as:"অবৈধ ৰক্ত ব্যৱসায়",
    sa:"अवैधरक्तव्यापारः"
  },
  sec:"Drugs Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Medical Data Breach",
    hi:"चिकित्सा डेटा उल्लंघन",
    bn:"চিকিৎসা তথ্য ফাঁস",
    te:"వైద్య డేటా ఉల్లంఘన",
    mr:"वैद्यकीय डेटा उल्लंघन",
    ta:"மருத்துவ தரவு கசிவு",
    gu:"તબીબી ડેટા ભંગ",
    ur:"طبی ڈیٹا کی خلاف ورزی",
    kn:"ವೈದ್ಯಕೀಯ ಡೇಟಾ ಉಲ್ಲಂಘನೆ",
    or:"ଚିକିତ୍ସା ତଥ୍ୟ ଉଲ୍ଲଂଘନ",
    ml:"മെഡിക്കൽ ഡാറ്റ ചോർച്ച",
    pa:"ਮੈਡੀਕਲ ਡਾਟਾ ਉਲੰਘਣਾ",
    as:"চিকিৎসা ডাটা লঙ্ঘন",
    sa:"चिकित्सादत्तभङ्गः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal School Operation",
    hi:"अवैध विद्यालय संचालन",
    bn:"অবৈধ বিদ্যালয় পরিচালনা",
    te:"అక్రమ పాఠశాల నిర్వహణ",
    mr:"बेकायदेशीर शाळा संचालन",
    ta:"சட்டவிரோத பள்ளி இயக்கம்",
    gu:"અવૈધ શાળા સંચાલન",
    ur:"غیر قانونی اسکول آپریشن",
    kn:"ಅಕ್ರಮ ಶಾಲೆ ನಡೆಸಿಕೆ",
    or:"ଅବୈଧ ବିଦ୍ୟାଳୟ ପରିଚାଳନା",
    ml:"നിയമവിരുദ്ധ സ്കൂൾ പ്രവർത്തനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਸਕੂਲ ਚਲਾਉਣਾ",
    as:"অবৈধ বিদ্যালয় পৰিচালনা",
    sa:"अवैधविद्यालयसञ्चालनम्"
  },
  sec:"Education Act",
  punishment:{
    en:"Fine / Closure",hi:"जुर्माना / बंद",
    bn:"জরিমানা / বন্ধ",te:"జరిమానా / మూసివేత",
    mr:"दंड / बंद",ta:"அபராதம் / மூடல்",
    gu:"દંડ / બંધ",ur:"جرمانہ / بندش",
    kn:"ದಂಡ / ಮುಚ್ಚುವಿಕೆ",
    or:"ଜରିମାନା / ବନ୍ଦ",
    ml:"പിഴ / അടച്ചുപൂട്ടൽ",
    pa:"ਜੁਰਮਾਨਾ / ਬੰਦ",
    as:"জৰিমনা / বন্ধ",sa:"दण्डः / निरोधः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unrecognized Board Certificate",
    hi:"अमान्य बोर्ड प्रमाणपत्र",
    bn:"অস্বীকৃত বোর্ড সার্টিফিকেট",
    te:"గుర్తింపు లేని బోర్డు సర్టిఫికేట్",
    mr:"अमान्य बोर्ड प्रमाणपत्र",
    ta:"அங்கீகரிக்காத கல்வி சான்றிதழ்",
    gu:"માન્યતા વિનાનું બોર્ડ પ્રમાણપત્ર",
    ur:"غیر تسلیم شدہ بورڈ سرٹیفکیٹ",
    kn:"ಗುರುತಿಸದ ಮಂಡಳಿ ಪ್ರಮಾಣಪತ್ರ",
    or:"ଅସ୍ୱୀକୃତ ବୋର୍ଡ ସର୍ଟିଫିକେଟ",
    ml:"അംഗീകാരമില്ലാത്ത ബോർഡ് സർട്ടിഫിക്കറ്റ്",
    pa:"ਅਣਮਾਨਤਾ ਪ੍ਰਾਪਤ ਬੋਰਡ ਸਰਟੀਫਿਕੇਟ",
    as:"অস্বীকৃত বোৰ্ড প্ৰমাণপত্ৰ",
    sa:"अस्वीकृतमण्डलप्रमाणपत्रम्"
  },
  sec:"Education Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",
    te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",ml:"തടവ്",pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Examination Paper Leak",
    hi:"परीक्षा प्रश्नपत्र लीक",
    bn:"পরীক্ষার প্রশ্নপত্র ফাঁস",
    te:"పరీక్ష ప్రశ్నాపత్రం లీక్",
    mr:"परीक्षा प्रश्नपत्रिका लीक",
    ta:"தேர்வு வினாத்தாள் கசிவு",
    gu:"પરીક્ષા પ્રશ્નપત્ર લીક",
    ur:"امتحانی پرچہ لیک",
    kn:"ಪರೀಕ್ಷಾ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ ಲೀಕ್",
    or:"ପରୀକ୍ଷା ପ୍ରଶ୍ନପତ୍ର ଲିକ୍",
    ml:"പരീക്ഷാ ചോദ്യപേപ്പർ ചോർച്ച",
    pa:"ਪਰੀਖਿਆ ਪ੍ਰਸ਼ਨ ਪੱਤਰ ਲੀਕ",
    as:"পৰীক্ষাৰ প্ৰশ্নকাকত ফাঁস",
    sa:"परीक्षाप्रश्नपत्रप्रसारणम्"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",
    te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",ml:"തടവ്",pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Impersonation in Exams",
    hi:"परीक्षा में प्रतिरूपण",
    bn:"পরীক্ষায় ছদ্মবেশ",
    te:"పరీక్షలో మోసపూరిత హాజరు",
    mr:"परीक्षेत बनावट उमेदवार",
    ta:"தேர்வில் போலி தேர்வாளர்",
    gu:"પરીક્ષામાં નકલી ઉમેદવાર",
    ur:"امتحان میں نقالی",
    kn:"ಪರೀಕ್ಷೆಯಲ್ಲಿ ನಕಲಿ ಅಭ್ಯರ್ಥಿ",
    or:"ପରୀକ୍ଷାରେ ନକଲି ପ୍ରାର୍ଥୀ",
    ml:"പരീക്ഷയിൽ വ്യാജ സ്ഥാനാർത്ഥി",
    pa:"ਪਰੀਖਿਆ ਵਿੱਚ ਨਕਲੀ ਉਮੀਦਵਾਰ",
    as:"পৰীক্ষাত ভুৱা প্ৰার্থী",
    sa:"परीक्षायां प्रतिरूपणम्"
  },
  sec:"IPC 419",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",
    te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",ml:"തടവ്",pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Marks Manipulation",
    hi:"अंकों में हेरफेर",
    bn:"নম্বর জালিয়াতি",
    te:"మార్కుల మోసం",
    mr:"गुणांमध्ये फेरफार",
    ta:"மதிப்பெண் மாற்றம்",
    gu:"અંકમાં ફેરફાર",
    ur:"نمبروں میں رد و بدل",
    kn:"ಅಂಕಗಳಲ್ಲಿ ಹಸ್ತಕ್ಷೇಪ",
    or:"ମାର୍କ୍ସ ଚେଡ଼ାଛେଡ଼ି",
    ml:"മാർക്ക് കൈക്കളവ്",
    pa:"ਅੰਕਾਂ ਨਾਲ ਛੇੜਛਾੜ",
    as:"নম্বৰ জালিয়াতি",
    sa:"अङ्कपरिवर्तनम्"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",
    te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",ml:"തടവ്",pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},
{
  name:{
    en:"Illegal Crowd Funding",hi:"अवैध क्राउड फंडिंग",bn:"অবৈধ ক্রাউড ফান্ডিং",
    te:"అక్రమ క్రౌడ్ ఫండింగ్",mr:"बेकायदेशीर क्राउड फंडिंग",
    ta:"சட்டவிரோத கூட்ட நிதி திரட்டல்",gu:"અવૈધ ક્રાઉડ ફંડિંગ",
    ur:"غیر قانونی کراؤڈ فنڈنگ",kn:"ಅಕ್ರಮ ಕ್ರೌಡ್ ಫಂಡಿಂಗ್",
    or:"ଅବୈଧ କ୍ରାଉଡ୍ ଫଣ୍ଡିଂ",
    ml:"നിയമവിരുദ്ധ ക്രൗഡ് ഫണ്ടിംഗ്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਕਰਾਊਡ ਫੰਡਿੰਗ",
    as:"অবৈধ ক্রাউড ফাণ্ডিং",sa:"अवैधजननिधिसंग्रहः"
  },
  sec:"Companies Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unregistered NGO Operation",hi:"अपंजीकृत एनजीओ संचालन",
    bn:"নিবন্ধনহীন এনজিও পরিচালনা",
    te:"నమోదు లేని ఎన్జీవో కార్యకలాపాలు",
    mr:"नोंदणी नसलेली एनजीओ कार्यवाही",
    ta:"பதிவு இல்லா NGO இயக்கம்",
    gu:"નોંધણી વગરની એનજીઓ કામગીરી",
    ur:"غیر رجسٹرڈ این جی او آپریشن",
    kn:"ನೋಂದಣಿ ಇಲ್ಲದ ಎನ್‌ಜಿಓ ಕಾರ್ಯಾಚರಣೆ",
    or:"ଅନପଞ୍ଜିକୃତ ଏନଜିଓ ପରିଚାଳନା",
    ml:"രജിസ്റ്റർ ചെയ്യാത്ത എൻജിഒ പ്രവർത്തനം",
    pa:"ਗੈਰ-ਰਜਿਸਟਰਡ ਐਨਜੀਓ ਚਲਾਉਣਾ",
    as:"পঞ্জীকৰণ নথকা এনজিঅ’ পৰিচালনা",
    sa:"अपञ्जीकृतएनजीओसञ्चालनम्"
  },
  sec:"FCRA",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Misuse of Charity Funds",hi:"दान निधि का दुरुपयोग",
    bn:"চ্যারিটি তহবিলের অপব্যবহার",
    te:"దాన నిధుల దుర్వినియోగం",
    mr:"दान निधीचा गैरवापर",
    ta:"தொண்டு நிதி தவறான பயன்பாடு",
    gu:"ચેરિટી ફંડનો દુરુપયોગ",
    ur:"خیراتی فنڈز کا غلط استعمال",
    kn:"ದಾನ ನಿಧಿಗಳ ದುರುಪಯೋಗ",
    or:"ଦାନ ତହବିଲ ଦୁରୁପଯୋଗ",
    ml:"ചാരിറ്റി ഫണ്ടുകളുടെ ദുരുപയോഗം",
    pa:"ਚੈਰਿਟੀ ਫੰਡ ਦੀ ਗਲਤ ਵਰਤੋਂ",
    as:"দান তহবিলৰ অপব্যৱহাৰ",
    sa:"दाननिधिदुरुपयोगः"
  },
  sec:"IPC 409",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Foreign Donation",hi:"अवैध विदेशी दान",
    bn:"অবৈধ বিদেশি অনুদান",
    te:"అక్రమ విదేశీ విరాళం",
    mr:"बेकायदेशीर विदेशी देणगी",
    ta:"சட்டவிரோத வெளிநாட்டு நன்கொடை",
    gu:"અવૈધ વિદેશી દાન",
    ur:"غیر قانونی غیر ملکی عطیہ",
    kn:"ಅಕ್ರಮ ವಿದೇಶಿ ದಾನ",
    or:"ଅବୈଧ ବିଦେଶୀ ଦାନ",
    ml:"നിയമവിരുദ്ധ വിദേശ സംഭാവന",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਵਿਦੇਸ਼ੀ ਦਾਨ",
    as:"অবৈধ বিদেশী দান",
    sa:"अवैधविदेशिदानम्"
  },
  sec:"FCRA",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Disaster Relief Collection",
    hi:"फर्जी आपदा राहत संग्रह",
    bn:"ভুয়া দুর্যোগ ত্রাণ সংগ্রহ",
    te:"నకిలీ విపత్తు సహాయ సేకరణ",
    mr:"बनावट आपत्ती मदत संकलन",
    ta:"போலி பேரிடர் நிதி சேகரிப்பு",
    gu:"નકલી આપત્તિ રાહત સંಗ್ರહ",
    ur:"جعلی آفت ریلیف چندہ",
    kn:"ನಕಲಿ ವಿಪತ್ತು ಪರಿಹಾರ ಸಂಗ್ರಹ",
    or:"ଭୁଆ ବିପର୍ଯ୍ୟୟ ସହାୟତା ସଂଗ୍ରହ",
    ml:"വ്യാജ ദുരന്ത സഹായ ശേഖരണം",
    pa:"ਨਕਲੀ ਆਫ਼ਤ ਰਾਹਤ ਇਕੱਠ",
    as:"ভুৱা দুৰ্যোগ সাহায্য সংগ্ৰহ",
    sa:"कूटआपदाराहतसंग्रहः"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Surveillance Drone Use",
    hi:"अवैध निगरानी ड्रोन उपयोग",
    bn:"অবৈধ নজরদারি ড্রোন ব্যবহার",
    te:"అక్రమ నిఘా డ్రోన్ వినియోగం",
    mr:"बेकायदेशीर निगराणी ड्रोन वापर",
    ta:"சட்டவிரோத ட்ரோன் கண்காணிப்பு",
    gu:"અવૈધ નજરદારી ડ્રોન ઉપયોગ",
    ur:"غیر قانونی نگرانی ڈرون استعمال",
    kn:"ಅಕ್ರಮ ನಿಗಾವಳಿ ಡ್ರೋನ್ ಬಳಕೆ",
    or:"ଅବୈଧ ଡ୍ରୋନ୍ ନିରୀକ୍ଷଣ",
    ml:"നിയമവിരുദ്ധ നിരീക്ഷണ ഡ്രോൺ ഉപയോഗം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਡ੍ਰੋਨ ਨਿਗਰਾਨੀ",
    as:"অবৈধ ড্ৰোন নজৰদাৰী",
    sa:"अवैधड्रोननिरीक्षणम्"
  },
  sec:"DGCA Rules",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},
{
  name:{
    en:"No-Fly Zone Violation",
    hi:"नो-फ्लाई ज़ोन उल्लंघन",
    bn:"নো-ফ্লাই জোন লঙ্ঘন",
    te:"నో-ఫ్లై జోన్ ఉల్లంఘన",
    mr:"नो-फ्लाय झोन उल्लंघन",
    ta:"விமானத் தடை பகுதி மீறல்",
    gu:"નો-ફ્લાય ઝોન ઉલ્લંઘન",
    ur:"نو فلائی زون کی خلاف ورزی",
    kn:"ನೋ-ಫ್ಲೈ ವಲಯ ಉಲ್ಲಂಘನೆ",
    or:"ନୋ-ଫ୍ଲାଇ ଜୋନ ଉଲ୍ଲଂଘନ",
    ml:"നോ-ഫ്ലൈ സോൺ ലംഘനം",
    pa:"ਨੋ-ਫਲਾਈ ਜ਼ੋਨ ਉਲੰਘਣਾ",
    as:"নো-ফ্লাই জোন উলংঘন",
    sa:"नोफ्लायक्षेत्रउल्लंघनम्"
  },
  sec:"Aircraft Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Drone Smuggling",
    hi:"ड्रोन तस्करी",
    bn:"ড্রোন পাচার",
    te:"డ్రోన్ స్మగ్లింగ్",
    mr:"ड्रोन तस्करी",
    ta:"ட்ரோன் மூலம் கடத்தல்",
    gu:"ડ્રોન તસ્કરી",
    ur:"ڈرون اسمگلنگ",
    kn:"ಡ್ರೋನ್ ಕಳ್ಳಸಾಗಣೆ",
    or:"ଡ୍ରୋନ ଚୋରାଚାଲାଣ",
    ml:"ഡ്രോൺ കടത്തൽ",
    pa:"ਡ੍ਰੋਨ ਤਸਕਰੀ",
    as:"ড্ৰোন সৰবৰাহ",
    sa:"ड्रोनचौर्यव्यापारः"
  },
  sec:"Customs Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Aerial Photography",
    hi:"अनधिकृत हवाई फोटोग्राफी",
    bn:"অননুমোদিত আকাশচিত্র ধারণ",
    te:"అనుమతి లేని వైమానిక చిత్రీకరణ",
    mr:"अनधिकृत हवाई छायाचित्रण",
    ta:"அனுமதி இல்லா வான்படம்",
    gu:"અનધિકૃત હવાઈ ફોટોગ્રાફી",
    ur:"غیر مجاز فضائی فوٹوگرافی",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ವೈಮಾನಿಕ ಛಾಯಾಗ್ರಹಣ",
    or:"ଅନଧିକୃତ ବିମାନ ଫଟୋଗ୍ରାଫି",
    ml:"അനുമതിയില്ലാത്ത വ്യോമ ഫോട്ടോഗ്രഫി",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਹਵਾਈ ਫੋਟੋਗ੍ਰਾਫੀ",
    as:"অনুমতি নথকা আকাশী ফটো",
    sa:"अनधिकृतनभःछायांकनम्"
  },
  sec:"Aircraft Rules",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Critical Infrastructure Surveillance",
    hi:"महत्वपूर्ण अवसंरचना की निगरानी",
    bn:"গুরুত্বপূর্ণ অবকাঠামো নজরদারি",
    te:"ముఖ్య మౌలిక వసతుల గమనింపు",
    mr:"महत्त्वाच्या पायाभूत सुविधांची निगराणी",
    ta:"முக்கிய வசதி கண்காணிப்பு",
    gu:"મહત્વપૂર્ણ માળખાની નજરદારી",
    ur:"اہم تنصیبات کی نگرانی",
    kn:"ಮುಖ್ಯ ಮೂಲಸೌಕರ್ಯ ನಿಗಾವಹಣೆ",
    or:"ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଢାଞ୍ଚା ନିରୀକ୍ଷଣ",
    ml:"പ്രധാന അടിസ്ഥാന സൗകര്യ നിരീക്ഷണം",
    pa:"ਅਹੰਕਾਰਪੂਰਕ ਢਾਂਚੇ ਦੀ ਨਿਗਰਾਨੀ",
    as:"গুরুত্বপূর্ণ অৱকাঠামো নিৰীক্ষণ",
    sa:"महत्वपूर्णसंरचनानिरीक्षणम्"
  },
  sec:"Official Secrets Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Land Conversion",
    hi:"अवैध भूमि परिवर्तन",
    bn:"অবৈধ জমি রূপান্তর",
    te:"అక్రమ భూమి మార్పు",
    mr:"बेकायदेशीर जमीन रूपांतरण",
    ta:"சட்டவிரோத நில மாற்றம்",
    gu:"અવૈધ જમીન રૂપાંતર",
    ur:"غیر قانونی زمین کی تبدیلی",
    kn:"ಅಕ್ರಮ ಭೂ ಪರಿವರ್ತನೆ",
    or:"ଅବୈଧ ଜମି ପରିବର୍ତ୍ତନ",
    ml:"നിയമവിരുദ്ധ ഭൂമി മാറ്റം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਜ਼ਮੀਨ ਤਬਦੀਲੀ",
    as:"অবৈধ ভূমি ৰূপান্তৰ",
    sa:"अवैधभूमिपरिवर्तनम्"
  },
  sec:"Land Revenue Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Benami Property Holding",
    hi:"बेनामी संपत्ति रखना",
    bn:"বেনামি সম্পত্তি ধারণ",
    te:"బెనామీ ఆస్తి కలిగి ఉండడం",
    mr:"बेनामी मालमत्ता धारण",
    ta:"பெனாமி சொத்து வைத்தல்",
    gu:"બેનામી મિલકત ધરાવવી",
    ur:"بے نامی جائیداد رکھنا",
    kn:"ಬೆನಾಮಿ ಆಸ್ತಿ ಹೊಂದಿಕೆ",
    or:"ବେନାମି ସମ୍ପତ୍ତି ଧାରଣ",
    ml:"ബേനാമി സ്വത്ത് കൈവശം വയ്ക്കൽ",
    pa:"ਬੇਨਾਮੀ ਸੰਪਤੀ ਰੱਖਣਾ",
    as:"বেনামি সম্পত্তি ধাৰণ",
    sa:"बेनामिसम्पत्तिधारणम्"
  },
  sec:"Benami Act",
  punishment:{
    en:"Rigorous Imprisonment",hi:"कठोर कारावास",
    bn:"সশ্রম কারাদণ্ড",
    te:"కఠిన కారాగారం",
    mr:"कठोर कारावास",
    ta:"கடுமையான சிறை",
    gu:"કઠોર કેદ",
    ur:"سخت قید",
    kn:"ಕಠಿಣ ಕಾರಾಗೃಹ",
    or:"କଠୋର କାରାଦଣ୍ଡ",
    ml:"കർശന തടവ്",
    pa:"ਸਖ਼ਤ ਕੈਦ",
    as:"কঠোৰ কাৰাদণ্ড",
    sa:"कठोरकारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Property Documents",
    hi:"फर्जी संपत्ति दस्तावेज़",
    bn:"ভুয়া সম্পত্তি নথি",
    te:"నకిలీ ఆస్తి పత్రాలు",
    mr:"बनावट मालमत्ता कागदपत्रे",
    ta:"போலி நில ஆவணங்கள்",
    gu:"નકલી મિલકત દસ્તાવેજો",
    ur:"جعلی جائیداد دستاویزات",
    kn:"ನಕಲಿ ಆಸ್ತಿ ದಾಖಲೆಗಳು",
    or:"ନକଲି ସମ୍ପତ୍ତି ଦଲିଲ",
    ml:"വ്യാജ സ്വത്ത് രേഖകൾ",
    pa:"ਨਕਲੀ ਜਾਇਦਾਦ ਦਸਤਾਵੇਜ਼",
    as:"ভুৱা সম্পত্তি নথি",
    sa:"कूटसम्पत्तिदस्तावेजाः"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",
    te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",ml:"തടവ്",pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Plot Layout",
    hi:"अवैध प्लॉट लेआउट",
    bn:"অবৈধ প্লট লেআউট",
    te:"అక్రమ ప్లాట్ లేఅవుట్",
    mr:"बेकायदेशीर प्लॉट लेआउट",
    ta:"சட்டவிரோத வீட்டு மனை அமைப்பு",
    gu:"અવૈધ પ્લોટ લેઆઉટ",
    ur:"غیر قانونی پلاٹ لے آؤٹ",
    kn:"ಅಕ್ರಮ ಪ್ಲಾಟ್ ವಿನ್ಯಾಸ",
    or:"ଅବୈଧ ପ୍ଲଟ୍ ଆକୃତି",
    ml:"നിയമവിരുദ്ധ പ്ലോട്ട് ലേയൗട്ട്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਪਲਾਟ ਲੇਆਉਟ",
    as:"অবৈধ প্লট বিন্যাস",
    sa:"अवैधभूखण्डविन्यासः"
  },
  sec:"Town Planning Act",
  punishment:{
    en:"Fine / Demolition",hi:"जुर्माना / ध्वस्तीकरण",
    bn:"জরিমানা / ভাঙন",
    te:"జరిమానా / కూల్చివేత",
    mr:"दंड / पाडकाम",
    ta:"அபராதம் / இடிப்பு",
    gu:"દંડ / તોડફોડ",
    ur:"جرمانہ / انہدام",
    kn:"ದಂಡ / ಧ್ವಂಸ",
    or:"ଜରିମାନା / ଧ୍ୱଂସ",
    ml:"പിഴ / പൊളിക്കൽ",
    pa:"ਜੁਰਮਾਨਾ / ਢਾਹੁਣਾ",
    as:"জৰিমনা / ধ্বংস",
    sa:"दण्डः / ध्वंसः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized Building Occupancy",
    hi:"अनधिकृत भवन अधिवास",
    bn:"অননুমোদিত ভবন দখল",
    te:"అనుమతి లేని భవన నివాసం",
    mr:"अनधिकृत इमारत अधिवास",
    ta:"அனுமதி இல்லா குடியிருப்பு",
    gu:"અનધિકૃત મકાન વપરાશ",
    ur:"غیر مجاز عمارت رہائش",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಕಟ್ಟಡ ವಾಸ",
    or:"ଅନଧିକୃତ ଭବନ ଦଖଲ",
    ml:"അനുമതിയില്ലാത്ത കെട്ടിട വാസം",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਇਮਾਰਤ ਕਬਜ਼ਾ",
    as:"অনুমতি নথকা অট্টালিকা দখল",
    sa:"अनधिकृतभवननिवासः"
  },
  sec:"Municipal Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Fake Cooperative Society",
    hi:"फर्जी सहकारी संस्था",
    bn:"ভুয়া সমবায় সমিতি",
    te:"నకిలీ సహకార సంఘం",
    mr:"बनावट सहकारी संस्था",
    ta:"போலி கூட்டுறவு சங்கம்",
    gu:"નકલી સહકારી સંસ્થા",
    ur:"جعلی کوآپریٹو سوسائٹی",
    kn:"ನಕಲಿ ಸಹಕಾರಿ ಸಂಘ",
    or:"ଭୁଆ ସହକାରୀ ସଂସ୍ଥା",
    ml:"വ്യാജ സഹകരണ സംഘം",
    pa:"ਨਕਲੀ ਸਹਿਕਾਰੀ ਸੰਸਥਾ",
    as:"ভুৱা সহকাৰী সমিতি",
    sa:"कूटसहकारीसंस्था"
  },
  sec:"Cooperative Societies Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",
    te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",ml:"തടവ്",pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Chit Fund Scam",
    hi:"चिट फंड घोटाला",
    bn:"চিট ফান্ড কেলেঙ্কারি",
    te:"చిట్ ఫండ్ మోసం",
    mr:"चिट फंड घोटाळा",
    ta:"சிட் ஃபண்ட் மோசடி",
    gu:"ચિટ ફંડ કૌભાંડ",
    ur:"چٹ فنڈ فراڈ",
    kn:"ಚಿಟ್ ಫಂಡ್ ಮೋಸ",
    or:"ଚିଟ୍ ଫଣ୍ଡ ଠକେଇ",
    ml:"ചിറ്റ് ഫണ്ട് തട്ടിപ്പ്",
    pa:"ਚਿੱਟ ਫੰਡ ਘਪਲਾ",
    as:"চিট ফাণ্ড কেলেঙ্কাৰী",
    sa:"चिटिनिधिघोटालः"
  },
  sec:"Chit Funds Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",
    te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",ml:"തടവ്",pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Microfinance Operation",
    hi:"अवैध माइक्रोफाइनेंस संचालन",
    bn:"অবৈধ মাইক্রোফাইন্যান্স কার্যক্রম",
    te:"అక్రమ మైక్రోఫైనాన్స్ కార్యకలాపాలు",
    mr:"बेकायदेशीर मायक्रोफायनान्स संचालन",
    ta:"சட்டவிரோத மைக்ரோஃபைனான்ஸ்",
    gu:"અવૈધ માઇક્રોફાઇનાન્સ કામગીરી",
    ur:"غیر قانونی مائیکرو فنانس آپریشن",
    kn:"ಅಕ್ರಮ ಮೈಕ್ರೋಫೈನಾನ್ಸ್ ಕಾರ್ಯಾಚರಣೆ",
    or:"ଅବୈଧ ମାଇକ୍ରୋଫାଇନାନ୍ସ ପରିଚାଳନା",
    ml:"നിയമവിരുദ്ധ മൈക്രോഫിനാൻസ് പ്രവർത്തനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਮਾਈਕ੍ਰੋਫਾਇਨੈਂਸ ਚਲਾਉਣਾ",
    as:"অবৈধ মাইক্রোফাইনেন্স পৰিচালনা",
    sa:"अवैधसूक्ष्मवित्तसञ्चालनम्"
  },
  sec:"RBI Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",
    te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",ml:"തടവ്",pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Loan Sharking",
    hi:"सूदखोरी",
    bn:"অতিরিক্ত সুদের ঋণ",
    te:"అధిక వడ్డీ అప్పు",
    mr:"अत्याधिक व्याज कर्ज",
    ta:"அதிக வட்டி கடன்",
    gu:"અતિશય વ્યાજ વસૂલાત",
    ur:"سود خوری",
    kn:"ಅತಿಯಾದ ಬಡ್ಡಿ ಸಾಲ",
    or:"ଅତ୍ୟଧିକ ସୁଧ ଋଣ",
    ml:"അതികം പലിശ കടം",
    pa:"ਵੱਧ ਬਿਆਜ ਵਾਲਾ ਕਰਜ਼ਾ",
    as:"অত্যাধিক সূদ ঋণ",
    sa:"अतिव्याजऋणम्"
  },
  sec:"Money Lenders Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Recovery Agent Harassment",
    hi:"वसूली एजेंट उत्पीड़न",
    bn:"রিকভারি এজেন্ট হয়রানি",
    te:"వసూలీ ఏజెంట్ వేధింపులు",
    mr:"वसुली प्रतिनिधी छळ",
    ta:"வசூல் முகவர் தொல்லை",
    gu:"રીકવરી એજન્ટ હેરાનગતિ",
    ur:"وصولی ایجنٹ ہراسانی",
    kn:"ವಸೂಲಾತಿ ಏಜೆಂಟ್ ಕಿರುಕುಳ",
    or:"ରିକଭରି ଏଜେଣ୍ଟ ହେରାସମେଣ୍ଟ",
    ml:"റിക്കവറി ഏജന്റ് പീഡനം",
    pa:"ਵਸੂਲੀ ਏਜੰਟ ਤੰਗ ਪਰੇਸ਼ਾਨੀ",
    as:"ৰিকভাৰী এজেণ্ট হয়ৰানি",
    sa:"वसूलीप्रतिनिध्युपद्रवः"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",
    te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",
    or:"କାରାଦଣ୍ଡ",ml:"തടവ്",pa:"ਕੈਦ",
    as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},
{
  name:{
    en:"Fake Tender Bidding",
    hi:"फर्जी टेंडर बोली",
    bn:"ভুয়া টেন্ডার দরপত্র",
    te:"నకిలీ టెండర్ బిడ్డింగ్",
    mr:"बनावट टेंडर बोली",
    ta:"போலி டெண்டர் மோசடி",
    gu:"નકલી ટેન્ડર બિડિંગ",
    ur:"جعلی ٹینڈر بولی",
    kn:"ನಕಲಿ ಟೆಂಡರ್ ಬಿಡ್ಡಿಂಗ್",
    or:"ଭୁଆ ଟେଣ୍ଡର ବୋଲି",
    ml:"വ്യാജ ടെൻഡർ ബിഡ്ഡിംഗ്",
    pa:"ਨਕਲੀ ਟੈਂਡਰ ਬੋਲੀ",
    as:"ভুৱা টেণ্ডাৰ বিডিং",
    sa:"कूटनिविदाबोली"
  },
  sec:"IPC / PC Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Public Procurement Fraud",
    hi:"सरकारी खरीद घोटाला",
    bn:"সরকারি ক্রয় জালিয়াতি",
    te:"ప్రభుత్వ కొనుగోలు మోసం",
    mr:"शासकीय खरेदी घोटाळा",
    ta:"அரசு கொள்முதல் மோசடி",
    gu:"સરકારી ખરીદી છેતરપિંડી",
    ur:"سرکاری خریداری فراڈ",
    kn:"ಸರ್ಕಾರಿ ಖರೀದಿ ಮೋಸ",
    or:"ସରକାରୀ କ୍ରୟ ଠକେଇ",
    ml:"സർക്കാർ വാങ്ങൽ തട്ടിപ്പ്",
    pa:"ਸਰਕਾਰੀ ਖਰੀਦ ਧੋਖਾਧੜੀ",
    as:"চৰকাৰী ক্ৰয় জালিয়াতি",
    sa:"सार्वजनिकक्रयछलनम्"
  },
  sec:"PC Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Misuse of Government Subsidy",
    hi:"सरकारी सब्सिडी का दुरुपयोग",
    bn:"সরকারি ভর্তুকির অপব্যবহার",
    te:"ప్రభుత్వ సబ్సిడీ దుర్వినియోగం",
    mr:"सरकारी अनुदानाचा गैरवापर",
    ta:"அரசு மானியம் தவறான பயன்பாடு",
    gu:"સરકારી સબસિડીનો દુરુપયોગ",
    ur:"سرکاری سبسڈی کا غلط استعمال",
    kn:"ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿ ದುರುಪಯೋಗ",
    or:"ସରକାରୀ ଅନୁଦାନ ଦୁରୁପଯୋଗ",
    ml:"സർക്കാർ സബ്സിഡി ദുരുപയോഗം",
    pa:"ਸਰਕਾਰੀ ਸਬਸਿਡੀ ਦੀ ਗਲਤ ਵਰਤੋਂ",
    as:"চৰকাৰী ভৰ্তুকিৰ অপব্যৱহাৰ",
    sa:"सरकारीअनुदानदुरुपयोगः"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Ration Card",
    hi:"फर्जी राशन कार्ड",
    bn:"ভুয়া রেশন কার্ড",
    te:"నకిలీ రేషన్ కార్డు",
    mr:"बनावट रेशन कार्ड",
    ta:"போலி ரேஷன் கார்டு",
    gu:"નકલી રેશન કાર્ડ",
    ur:"جعلی راشن کارڈ",
    kn:"ನಕಲಿ ರೇಷನ್ ಕಾರ್ಡ್",
    or:"ଭୁଆ ରେସନ୍ କାର୍ଡ",
    ml:"വ്യാജ റേഷൻ കാർഡ്",
    pa:"ਨਕਲੀ ਰਾਸ਼ਨ ਕਾਰਡ",
    as:"ভুৱা ৰেচন কাৰ্ড",
    sa:"कूटराशनपत्रम्"
  },
  sec:"Essential Commodities Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Black Market Fuel Sale",
    hi:"काला बाज़ार ईंधन बिक्री",
    bn:"কালোবাজারে জ্বালানি বিক্রি",
    te:"బ్లాక్ మార్కెట్ ఇంధన విక్రయం",
    mr:"काळाबाजार इंधन विक्री",
    ta:"கருப்பு சந்தை எரிபொருள் விற்பனை",
    gu:"કાળાબજાર ઈંધણ વેચાણ",
    ur:"بلیک مارکیٹ ایندھن فروخت",
    kn:"ಕಪ್ಪುಬಜಾರ್ ಇಂಧನ ಮಾರಾಟ",
    or:"କଳାବଜାର ଇନ୍ଧନ ବିକ୍ରୟ",
    ml:"കറുത്ത വിപണി ഇന്ധന വിൽപ്പന",
    pa:"ਕਾਲੇ ਬਾਜ਼ਾਰ ਵਿੱਚ ਇੰਧਨ ਵਿਕਰੀ",
    as:"কালোবজাৰ ইন্ধন বিক্ৰী",
    sa:"कृष्णविपणनइन्धनविक्रयः"
  },
  sec:"EC Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Sand Transport",
    hi:"अवैध रेत परिवहन",
    bn:"অবৈধ বালু পরিবহন",
    te:"అక్రమ ఇసుక రవాణా",
    mr:"बेकायदेशीर वाळू वाहतूक",
    ta:"சட்டவிரோத மணல் கடத்தல்",
    gu:"અવૈધ રેતી પરિવહન",
    ur:"غیر قانونی ریت کی نقل و حمل",
    kn:"ಅಕ್ರಮ ಮರಳು ಸಾಗಣೆ",
    or:"ଅବୈଧ ବାଲୁକା ପରିବହନ",
    ml:"നിയമവിരുദ്ധ മണൽ ഗതാഗതം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਰੇਤ ਟਰਾਂਸਪੋਰਟ",
    as:"অবৈধ বালু পৰিবহন",
    sa:"अवैधवालुकापरिवहनम्"
  },
  sec:"MMDR Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"River Encroachment",
    hi:"नदी अतिक्रमण",
    bn:"নদী দখল",
    te:"నది ఆక్రమణ",
    mr:"नदी अतिक्रमण",
    ta:"நதி ஆக்கிரமிப்பு",
    gu:"નદી પર કબજો",
    ur:"دریا پر قبضہ",
    kn:"ನದಿ ಅಕ್ರಮ ವಶ",
    or:"ନଦୀ ଆକ୍ରମଣ",
    ml:"നദി കയ്യേറ്റം",
    pa:"ਦਰਿਆ ਕਬਜ਼ਾ",
    as:"নদী দখল",
    sa:"नदीअतिक्रमणम्"
  },
  sec:"WR Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Borewell Drilling",
    hi:"अवैध बोरवेल खुदाई",
    bn:"অবৈধ বোরওয়েল খনন",
    te:"అక్రమ బోర్‌వెల్ తవ్వకం",
    mr:"बेकायदेशीर बोअरवेल खोदकाम",
    ta:"சட்டவிரோத போர்வெல்",
    gu:"અવૈધ બોરવેલ ખોદકામ",
    ur:"غیر قانونی بورویل کھدائی",
    kn:"ಅಕ್ರಮ ಬೋರ್‌ವೆಲ್ ತೋಡಿಕೆ",
    or:"ଅବୈଧ ବୋରୱେଲ୍ ଖନନ",
    ml:"നിയമവിരുദ്ധ ബോർവെൽ ഖനനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਬੋਰਵੈੱਲ ਖੁਦਾਈ",
    as:"অবৈধ বোৰৱেল খনন",
    sa:"अवैधकूपखननम्"
  },
  sec:"Groundwater Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Water Theft",
    hi:"पानी चोरी",
    bn:"পানি চুরি",
    te:"నీటి దొంగతనం",
    mr:"पाणी चोरी",
    ta:"நீர் திருட்டு",
    gu:"પાણી ચોરી",
    ur:"پانی چوری",
    kn:"ನೀರು ಕಳ್ಳತನ",
    or:"ପାଣି ଚୋରି",
    ml:"വെള്ള മോഷണം",
    pa:"ਪਾਣੀ ਚੋਰੀ",
    as:"পানী চুৰি",
    sa:"जलचौर्यम्"
  },
  sec:"Water Supply Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Destruction of Water Bodies",
    hi:"जल निकायों का विनाश",
    bn:"জলাশয় ধ্বংস",
    te:"నీటి వనరుల నాశనం",
    mr:"जलस्रोत नष्ट करणे",
    ta:"நீர்நிலைகள் அழித்தல்",
    gu:"જળાશયોનો નાશ",
    ur:"آبی ذخائر کی تباہی",
    kn:"ನೀರು ಮೂಲಗಳ ನಾಶ",
    or:"ଜଳାଶୟ ଧ୍ୱଂସ",
    ml:"ജലാശയ നാശം",
    pa:"ਜਲ ਸ੍ਰੋਤਾਂ ਦੀ ਤਬਾਹੀ",
    as:"জলাশয় ধ্বংস",
    sa:"जलाशयध्वंसः"
  },
  sec:"EPA Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Fake Fertilizer Sale",
    hi:"फर्जी उर्वरक बिक्री",
    bn:"ভুয়া সার বিক্রি",
    te:"నకిలీ ఎరువు విక్రయం",
    mr:"बनावट खत विक्री",
    ta:"போலி உரம் விற்பனை",
    gu:"નકલી ખાતર વેચાણ",
    ur:"جعلی کھاد فروخت",
    kn:"ನಕಲಿ ರಸಗೊಬ್ಬರ ಮಾರಾಟ",
    or:"ଭୁଆ ସର ବିକ୍ରୟ",
    ml:"വ്യാജ വള വിൽപ്പന",
    pa:"ਨਕਲੀ ਖਾਦ ਵਿਕਰੀ",
    as:"ভুৱা সাৰ বিক্ৰী",
    sa:"कूटखाद्यविक्रयः"
  },
  sec:"Fertilizer Control Order",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Adulterated Seeds Sale",
    hi:"मिलावटी बीज बिक्री",
    bn:"ভেজাল বীজ বিক্রি",
    te:"కల్తీ విత్తనాల విక్రయం",
    mr:"भेसळयुक्त बियाणे विक्री",
    ta:"கலப்பட விதை விற்பனை",
    gu:"મિલાવટવાળા બીજ વેચાણ",
    ur:"ملاوٹ شدہ بیج فروخت",
    kn:"ಕಲಬೆರಕೆ ಬೀಜ ಮಾರಾಟ",
    or:"ମିଶ୍ରିତ ବୀଜ ବିକ୍ରୟ",
    ml:"കള്ളവിത്ത് വിൽപ്പന",
    pa:"ਮਿਲਾਵਟੀ ਬੀਜ ਵਿਕਰੀ",
    as:"ভেজাল বীজ বিক্ৰী",
    sa:"मिश्रितबीजविक्रयः"
  },
  sec:"Seeds Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Pesticide Use",
    hi:"अवैध कीटनाशक उपयोग",
    bn:"অবৈধ কীটনাশক ব্যবহার",
    te:"అక్రమ పురుగుమందు వినియోగం",
    mr:"बेकायदेशीर कीटकनाशक वापर",
    ta:"சட்டவிரோத பூச்சிக்கொல்லி",
    gu:"અવૈધ કીટનાશક ઉપયોગ",
    ur:"غیر قانونی کیڑے مار دوا کا استعمال",
    kn:"ಅಕ್ರಮ ಕೀಟನಾಶಕ ಬಳಕೆ",
    or:"ଅବୈଧ କୀଟନାଶକ ବ୍ୟବହାର",
    ml:"നിയമവിരുദ്ധ കീടനാശിനി ഉപയോഗം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਕੀਟਨਾਸ਼ਕ ਵਰਤੋਂ",
    as:"অবৈধ কীটনাশক ব্যৱহাৰ",
    sa:"अवैधकीटनाशकप्रयोगः"
  },
  sec:"Insecticides Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Crop Insurance Fraud",
    hi:"फसल बीमा घोटाला",
    bn:"ফসল বীমা জালিয়াতি",
    te:"పంట బీమా మోసం",
    mr:"पीक विमा घोटाळा",
    ta:"பயிர் காப்பீடு மோசடி",
    gu:"પાક વીમા છેતરપિંડી",
    ur:"فصل بیمہ فراڈ",
    kn:"ಬೆಳೆ ವಿಮಾ ಮೋಸ",
    or:"ଫସଲ ବୀମା ଠକେଇ",
    ml:"വിള ഇൻഷുറൻസ് തട്ടിപ്പ്",
    pa:"ਫਸਲ ਬੀਮਾ ਧੋਖਾਧੜੀ",
    as:"শস্য বীমা জালিয়াতি",
    sa:"फसलबीमाछलनम्"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"False Crop Loss Claim",
    hi:"झूठा फसल नुकसान दावा",
    bn:"মিথ্যা ফসল ক্ষতি দাবি",
    te:"తప్పుడు పంట నష్టం దావా",
    mr:"खोटा पीक नुकसान दावा",
    ta:"பொய் பயிர் இழப்பு கோரிக்கை",
    gu:"ખોટો પાક નુકસાન દાવો",
    ur:"جھوٹا فصل نقصان دعویٰ",
    kn:"ಸುಳ್ಳು ಬೆಳೆ ನಷ್ಟ ದಾವೆ",
    or:"ମିଥ୍ୟା ଫସଲ କ୍ଷତି ଦାବି",
    ml:"വ്യാജ വിള നഷ്ട അവകാശവാദം",
    pa:"ਝੂਠਾ ਫਸਲ ਨੁਕਸਾਨ ਦਾਅਵਾ",
    as:"ভুৱা শস্য ক্ষতি দাবী",
    sa:"मिथ्याफसलहानिदावा"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Fishing",
    hi:"अवैध मछली पकड़ना",
    bn:"অবৈধ মাছ ধরা",
    te:"అక్రమ మత్స్యకార్యం",
    mr:"बेकायदेशीर मासेमारी",
    ta:"சட்டவிரோத மீன்பிடி",
    gu:"અવૈધ માછીમારી",
    ur:"غیر قانونی ماہی گیری",
    kn:"ಅಕ್ರಮ ಮೀನುಗಾರಿಕೆ",
    or:"ଅବୈଧ ମାଛଧରା",
    ml:"നിയമവിരുദ്ധ മത്സ്യബന്ധനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਮੱਛੀ ਮਾਰਨਾ",
    as:"অবৈধ মাছ ধৰা",
    sa:"अवैधमत्स्यग्रहणम्"
  },
  sec:"Fisheries Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Use of Banned Fishing Nets",
    hi:"प्रतिबंधित जाल का उपयोग",
    bn:"নিষিদ্ধ জাল ব্যবহার",
    te:"నిషేధిత వలల వినియోగం",
    mr:"प्रतिबंधित जाळ्यांचा वापर",
    ta:"தடை செய்யப்பட்ட வலை பயன்பாடு",
    gu:"પ્રતિબંધિત જાળનો ઉપયોગ",
    ur:"پابندی شدہ جال کا استعمال",
    kn:"ನಿಷೇಧಿತ ಬಲೆಯ ಬಳಕೆ",
    or:"ନିଷିଦ୍ଧ ଜାଲ ବ୍ୟବହାର",
    ml:"നിരോധിത വല ഉപയോഗം",
    pa:"ਪਾਬੰਦੀਸ਼ੁਦਾ ਜਾਲ ਦੀ ਵਰਤੋਂ",
    as:"নিষিদ্ধ জাল ব্যৱহাৰ",
    sa:"निषिद्धजालप्रयोगः"
  },
  sec:"Fisheries Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Sand Dune Destruction",
    hi:"रेत टीलों का विनाश",
    bn:"বালিয়াড়ি ধ্বংস",
    te:"ఇసుక మడులు నాశనం",
    mr:"वाळू टेकड्यांचा नाश",
    ta:"மணல் மேடு அழித்தல்",
    gu:"રેતીના ટેકરાનો નાશ",
    ur:"ریت کے ٹیلوں کی تباہی",
    kn:"ಮರಳು ಗುಡ್ಡ ನಾಶ",
    or:"ବାଲୁକା ଟିବା ଧ୍ୱଂସ",
    ml:"മണൽതിട്ട നാശം",
    pa:"ਰੇਤਲੇ ਟੀਲਿਆਂ ਦੀ ਤਬਾਹੀ",
    as:"বালিৰ ঢিবি ধ্বংস",
    sa:"वालुकाटीभध्वंसः"
  },
  sec:"CRZ Rules",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Coastal Construction",
    hi:"अवैध तटीय निर्माण",
    bn:"অবৈধ উপকূলীয় নির্মাণ",
    te:"అక్రమ తీర నిర్మాణం",
    mr:"बेकायदेशीर किनारी बांधकाम",
    ta:"சட்டவிரோத கடற்கரை கட்டிடம்",
    gu:"અવૈધ તટિય બાંધકામ",
    ur:"غیر قانونی ساحلی تعمیر",
    kn:"ಅಕ್ರಮ ಕರಾವಳಿ ನಿರ್ಮಾಣ",
    or:"ଅବୈଧ ଉପକୂଳ ନିର୍ମାଣ",
    ml:"നിയമവിരുദ്ധ തീരദേശ നിർമ്മാണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਤਟਵਰਤੀ ਨਿਰਮਾਣ",
    as:"অবৈধ উপকূলীয় নিৰ্মাণ",
    sa:"अवैधतटीयनिर्माणम्"
  },
  sec:"CRZ Act",
  punishment:{
    en:"Demolition / Jail",
    hi:"ध्वस्तीकरण / कारावास",
    bn:"ভাঙন / কারাদণ্ড",
    te:"కూల్చివేత / కారాగారం",
    mr:"पाडकाम / कारावास",
    ta:"இடிப்பு / சிறை",
    gu:"ધ્વંસ / કેદ",
    ur:"مسلسل / قید",
    kn:"ಧ್ವಂಸ / ಕಾರಾಗೃಹ",
    or:"ଧ୍ୱଂସ / କାରାଦଣ୍ଡ",
    ml:"പൊളിക്കൽ / തടവ്",
    pa:"ਢਾਹੁਣਾ / ਕੈਦ",
    as:"ভাঙনি / কাৰাদণ্ড",
    sa:"विध्वंसः / कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Marine Pollution",
    hi:"समुद्री प्रदूषण",
    bn:"সামুদ্রিক দূষণ",
    te:"సముద్ర కాలుష్యం",
    mr:"सागरी प्रदूषण",
    ta:"கடல் மாசுபாடு",
    gu:"સમુદ્રી પ્રદૂષણ",
    ur:"سمندری آلودگی",
    kn:"ಸಮುದ್ರ ಮಾಲಿನ್ಯ",
    or:"ସମୁଦ୍ର ପ୍ରଦୂଷଣ",
    ml:"സമുദ്ര മലിനീകരണം",
    pa:"ਸਮੁੰਦਰੀ ਪ੍ਰਦੂਸ਼ਣ",
    as:"সামুদ্রিক প্ৰদূষণ",
    sa:"समुद्रप्रदूषणम्"
  },
  sec:"Marine Pollution Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake E-commerce Seller",
    hi:"फर्जी ई-कॉमर्स विक्रेता",
    bn:"ভুয়া ই-কমার্স বিক্রেতা",
    te:"నకిలీ ఈ-కామర్స్ విక్రేత",
    mr:"बनावट ई-कॉमर्स विक्रेता",
    ta:"போலி ஆன்லைன் விற்பனையாளர்",
    gu:"નકલી ઈ-કોમર્સ વેચનાર",
    ur:"جعلی ای کامرس فروش کنندہ",
    kn:"ನಕಲಿ ಇ-ಕಾಮರ್ಸ್ ಮಾರಾಟಗಾರ",
    or:"ଭୁଆ ଇ-କମର୍ସ ବିକ୍ରେତା",
    ml:"വ്യാജ ഇ-കൊമേഴ്‌സ് വിൽപ്പനക്കാരൻ",
    pa:"ਨਕਲੀ ਈ-ਕਾਮਰਸ ਵਿਕਰੇਤਾ",
    as:"ভুৱা ই-কমাৰ্চ বিক্ৰেতা",
    sa:"कूटईवाणिज्यविक्रेता"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Online Review Manipulation",
    hi:"ऑनलाइन समीक्षा हेरफेर",
    bn:"অনলাইন রিভিউ কারসাজি",
    te:"ఆన్‌లైన్ సమీక్ష మోసం",
    mr:"ऑनलाइन पुनरावलोकन छेडछाड",
    ta:"ஆன்லைன் விமர்சன மோசடி",
    gu:"ઑનલાઇન સમીક્ષા હેરફેર",
    ur:"آن لائن ریویو میں ہیرا پھیری",
    kn:"ಆನ್‌ಲೈನ್ ವಿಮರ್ಶೆ ಕೈಚಳಕ",
    or:"ଅନଲାଇନ୍ ସମୀକ୍ଷା ହେରାଫେରି",
    ml:"ഓൺലൈൻ റിവ്യൂ കൈകാര്യം",
    pa:"ਆਨਲਾਈਨ ਸਮੀਖਿਆ ਹੇਰਾਫੇਰੀ",
    as:"অনলাইন সমীক্ষা কাৰসাজি",
    sa:"जालसमीक्षाहेराफेरी"
  },
  sec:"IT Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Cashback Offer",
    hi:"फर्जी कैशबैक ऑफर",
    bn:"ভুয়া ক্যাশব্যাক অফার",
    te:"నకిలీ క్యాష్‌బ్యాక్ ఆఫర్",
    mr:"बनावट कॅशबॅक ऑफर",
    ta:"போலி கேஷ்பேக் சலுகை",
    gu:"નકલી કેશબેક ઓફર",
    ur:"جعلی کیش بیک آفر",
    kn:"ನಕಲಿ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಆಫರ್",
    or:"ଭୁଆ କ୍ୟାଶବ୍ୟାକ୍ ପ୍ରସ୍ତାବ",
    ml:"വ്യാജ ക്യാഷ്ബാക്ക് ഓഫർ",
    pa:"ਨਕਲੀ ਕੈਸ਼ਬੈਕ ਆਫ਼ਰ",
    as:"ভুৱা কেছবেক অফাৰ",
    sa:"कूटकैशबैकप्रस्तावः"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Affiliate Marketing Scam",
    hi:"एफिलिएट मार्केटिंग घोटाला",
    bn:"অ্যাফিলিয়েট মার্কেটিং জালিয়াতি",
    te:"అఫిలియేట్ మార్కెటింగ్ మోసం",
    mr:"अ‍ॅफिलिएट मार्केटिंग घोटाळा",
    ta:"அஃபிலியேட் மார்க்கெட்டிங் மோசடி",
    gu:"એફિલિયેટ માર્કેટિંગ કૌભાંડ",
    ur:"ایفیلیٹ مارکیٹنگ فراڈ",
    kn:"ಅಫಿಲಿಯೇಟ್ ಮಾರ್ಕೆಟಿಂಗ್ ಮೋಸ",
    or:"ଅଫିଲିଏଟ୍ ମାର୍କେଟିଂ ଠକେଇ",
    ml:"അഫിലിയേറ്റ് മാർക്കറ്റിംഗ് തട്ടിപ്പ്",
    pa:"ਐਫਿਲੀਏਟ ਮਾਰਕੀਟਿੰਗ ਧੋਖਾਧੜੀ",
    as:"এফিলিয়েট মাৰ্কেটিং জালিয়াতি",
    sa:"संबद्धविपणनछलनम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake App Publishing",
    hi:"फर्जी ऐप प्रकाशन",
    bn:"ভুয়া অ্যাপ প্রকাশ",
    te:"నకిలీ యాప్ ప్రచురణ",
    mr:"बनावट अ‍ॅप प्रकाशन",
    ta:"போலி ஆப் வெளியீடு",
    gu:"નકલી એપ પ્રકાશન",
    ur:"جعلی ایپ شائع کرنا",
    kn:"ನಕಲಿ ಆ್ಯಪ್ ಪ್ರಕಟಣೆ",
    or:"ଭୁଆ ଆପ୍ ପ୍ରକାଶନ",
    ml:"വ്യാജ ആപ്പ് പ്രസിദ്ധീകരണം",
    pa:"ਨਕਲੀ ਐਪ ਪ੍ਰਕਾਸ਼ਨ",
    as:"ভুৱা এপ প্ৰকাশ",
    sa:"कूटअनुप्रयोगप्रकाशनम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

 {
  name:{
    en:"Unauthorized Cloud Data Storage",
    hi:"अनधिकृत क्लाउड डेटा भंडारण",
    bn:"অননুমোদিত ক্লাউড ডেটা সংরক্ষণ",
    te:"అనుమతి లేని క్లౌడ్ డేటా నిల్వ",
    mr:"अनधिकृत क्लाउड डेटा साठवण",
    ta:"அனுமதி இல்லா கிளவுட் தரவு சேமிப்பு",
    gu:"અનધિકૃત ક્લાઉડ ડેટા સંગ્રહ",
    ur:"غیر مجاز کلاؤڈ ڈیٹا ذخیرہ",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಕ್ಲೌಡ್ ಡೇಟಾ ಸಂಗ್ರಹ",
    or:"ଅନଧିକୃତ କ୍ଲାଉଡ୍ ତଥ୍ୟ ସଂରକ୍ଷଣ",
    ml:"അനുമതിയില്ലാത്ത ക്ലൗഡ് ഡാറ്റ സംഭരണം",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਕਲਾਊਡ ਡਾਟਾ ਸਟੋਰੇਜ",
    as:"অনুমতি নথকা ক্লাউড ডাটা সংৰক্ষণ",
    sa:"अनधिकृतमेघदत्तसंग्रहणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Cross-border Data Transfer Violation",
    hi:"सीमा पार डेटा स्थानांतरण उल्लंघन",
    bn:"সীমান্ত পার ডেটা স্থানান্তর লঙ্ঘন",
    te:"సరిహద్దు దాటే డేటా బదిలీ ఉల్లంఘన",
    mr:"सीमापार डेटा हस्तांतरण उल्लंघन",
    ta:"தரவு எல்லை மீறல்",
    gu:"સરહદપાર ડેટા ટ્રાન્સફર ઉલ્લંઘન",
    ur:"سرحد پار ڈیٹا منتقلی کی خلاف ورزی",
    kn:"ಸೀಮೆ ದಾಟಿದ ಡೇಟಾ ವರ್ಗಾವಣೆ ಉಲ್ಲಂಘನೆ",
    or:"ସୀମାପାର ତଥ୍ୟ ସ୍ଥାନାନ୍ତର ଉଲ୍ଲଂଘନ",
    ml:"അതിർത്തി കടന്ന ഡാറ്റ കൈമാറ്റ ലംഘനം",
    pa:"ਸਰਹੱਦ ਪਾਰ ਡਾਟਾ ਟ੍ਰਾਂਸਫਰ ਉਲੰਘਣਾ",
    as:"সীমা অতিক্ৰম কৰা ডাটা স্থানান্তৰ লংঘন",
    sa:"सीमापारदत्तस्थानान्तरणलङ्घनम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Critical Data Infrastructure Attack",
    hi:"महत्वपूर्ण डेटा अवसंरचना पर हमला",
    bn:"গুরুত্বপূর্ণ ডেটা পরিকাঠামোতে আক্রমণ",
    te:"ముఖ్య డేటా మౌలిక సదుపాయాలపై దాడి",
    mr:"महत्त्वाच्या डेटा पायाभूत सुविधांवरील हल्ला",
    ta:"முக்கிய தரவு கட்டமைப்பு தாக்குதல்",
    gu:"મહત્વપૂર્ણ ડેટા માળખા પર હુમલો",
    ur:"اہم ڈیٹا انفراسٹرکچر پر حملہ",
    kn:"ಮಹತ್ವದ ಡೇಟಾ ಮೂಲಸೌಕರ್ಯದ ಮೇಲೆ ದಾಳಿ",
    or:"ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ତଥ୍ୟ ଢାଞ୍ଚା ଉପରେ ଆକ୍ରମଣ",
    ml:"പ്രധാന ഡാറ്റ ഇൻഫ്രാസ്ട്രക്ചറിനുള്ള ആക്രമണം",
    pa:"ਮਹੱਤਵਪੂਰਨ ਡਾਟਾ ਢਾਂਚੇ ’ਤੇ ਹਮਲਾ",
    as:"গুৰুত্বপূৰ্ণ ডাটা পৰিকাঠামোত আক্ৰমণ",
    sa:"महत्वदत्तसंरचनायामाक्रमणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized VPN Service",
    hi:"अनधिकृत वीपीएन सेवा",
    bn:"অননুমোদিত ভিপিএন পরিষেবা",
    te:"అనుమతి లేని VPN సేవ",
    mr:"अनधिकृत व्हीपीएन सेवा",
    ta:"அனுமதி இல்லா VPN சேவை",
    gu:"અનધિકૃત VPN સેવા",
    ur:"غیر مجاز وی پی این سروس",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ VPN ಸೇವೆ",
    or:"ଅନଧିକୃତ VPN ସେବା",
    ml:"അനുമതിയില്ലാത്ത VPN സേവനം",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ VPN ਸੇਵਾ",
    as:"অনুমতি নথকা VPN সেৱা",
    sa:"अनधिकृतVPNसेवा"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Dark Web Trading",
    hi:"डार्क वेब व्यापार",
    bn:"ডার্ক ওয়েব বাণিজ্য",
    te:"డార్క్ వెబ్ వ్యాపారం",
    mr:"डार्क वेब व्यापार",
    ta:"டார்க் வெப் வர்த்தகம்",
    gu:"ડાર્ક વેબ વેપાર",
    ur:"ڈارک ویب تجارت",
    kn:"ಡಾರ್ಕ್ ವೆಬ್ ವ್ಯಾಪಾರ",
    or:"ଡାର୍କ ୱେବ ବାଣିଜ୍ୟ",
    ml:"ഡാർക്ക് വെബ് വ്യാപാരം",
    pa:"ਡਾਰਕ ਵੈੱਬ ਵਪਾਰ",
    as:"ডাৰ্ক ৱেব ব্যৱসায়",
    sa:"अन्धजालव्यापारः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Mining Explosives Use",
    hi:"अवैध खनन में विस्फोटक उपयोग",
    bn:"অবৈধ খননে বিস্ফোরক ব্যবহার",
    te:"అక్రమ గనుల్లో పేలుడు పదార్థాల వినియోగం",
    mr:"बेकायदेशीर खाणीत स्फोटक वापर",
    ta:"சட்டவிரோத சுரங்க வெடிபொருள்",
    gu:"અવૈધ ખનનમાં વિસ્ફોટક ઉપયોગ",
    ur:"غیر قانونی کان کنی میں دھماکہ خیز مواد",
    kn:"ಅಕ್ರಮ ಗಣಿಯಲ್ಲಿ ಸ್ಫೋಟಕ ಬಳಕೆ",
    or:"ଅବୈଧ ଖନନରେ ବିସ୍ଫୋଟକ ବ୍ୟବହାର",
    ml:"നിയമവിരുദ്ധ ഖനനത്തിൽ സ്ഫോടക വസ്തുക്കളുടെ ഉപയോഗം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਖਣਨ ਵਿੱਚ ਧਮਾਕੇਦਾਰ ਪਦਾਰਥ ਵਰਤੋਂ",
    as:"অবৈধ খননত বিস্ফোৰক ব্যৱহাৰ",
    sa:"अवैधखनने विस्फोटकप्रयोगः"
  },
  sec:"Explosives Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Safety Certificate",
    hi:"फर्जी सुरक्षा प्रमाणपत्र",
    bn:"ভুয়া নিরাপত্তা শংসাপত্র",
    te:"నకిలీ భద్రతా సర్టిఫికేట్",
    mr:"बनावट सुरक्षा प्रमाणपत्र",
    ta:"போலி பாதுகாப்பு சான்றிதழ்",
    gu:"નકલી સુરક્ષા પ્રમાણપત્ર",
    ur:"جعلی حفاظتی سرٹیفکیٹ",
    kn:"ನಕಲಿ ಭದ್ರತಾ ಪ್ರಮಾಣಪತ್ರ",
    or:"ଭୁଆ ସୁରକ୍ଷା ପ୍ରମାଣପତ୍ର",
    ml:"വ്യാജ സുരക്ഷാ സർട്ടിഫിക്കറ്റ്",
    pa:"ਨਕਲੀ ਸੁਰੱਖਿਆ ਸਰਟੀਫਿਕੇਟ",
    as:"ভুৱা সুৰক্ষা প্ৰমাণপত্ৰ",
    sa:"कूटसुरक्षाप्रमाणपत्रम्"
  },
  sec:"Factories Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Industrial Waste Dumping",
    hi:"औद्योगिक कचरा डंपिंग",
    bn:"শিল্প বর্জ্য ফেলা",
    te:"పరిశ్రమల వ్యర్థాల పారవేత",
    mr:"औद्योगिक कचरा टाकणे",
    ta:"தொழிற்சாலை கழிவு குப்பை",
    gu:"ઔદ્યોગિક કચરો ફેંકવો",
    ur:"صنعتی فضلہ پھینکنا",
    kn:"ಕೈಗಾರಿಕಾ ತ್ಯಾಜ್ಯ ವಿಸರ್ಜನೆ",
    or:"ଔଦ୍ୟୋଗିକ ଅବଶିଷ୍ଟ ପତନ",
    ml:"വ്യവസായ മാലിന്യ തള്ളൽ",
    pa:"ਉદ્યોગਿਕ ਕਚਰਾ ਸੁੱਟਣਾ",
    as:"ঔদ্যোগিক আৱৰ্জনা পেলোৱা",
    sa:"औद्योगिकअपशिष्टनिक्षेपणम्"
  },
  sec:"EPA Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Hazardous Waste Transport Violation",
    hi:"खतरनाक कचरा परिवहन उल्लंघन",
    bn:"বিপজ্জনক বর্জ্য পরিবহন লঙ্ঘন",
    te:"ఆపదకర వ్యర్థాల రవాణా ఉల్లంఘన",
    mr:"धोकादायक कचरा वाहतूक उल्लंघन",
    ta:"ஆபத்தான கழிவு கடத்தல்",
    gu:"હાનિકારક કચરા પરિવહન ઉલ્લંઘન",
    ur:"خطرناک فضلہ نقل و حمل کی خلاف ورزی",
    kn:"ಅಪಾಯಕಾರಿ ತ್ಯಾಜ್ಯ ಸಾಗಣೆ ಉಲ್ಲಂಘನೆ",
    or:"ବିପଦଜନକ ଅବଶିଷ୍ଟ ପରିବହନ ଉଲ୍ଲଂଘନ",
    ml:"അപകടകരമായ മാലിന്യ ഗതാഗത ലംഘനം",
    pa:"ਖ਼ਤਰਨਾਕ ਕਚਰਾ ਟਰਾਂਸਪੋਰਟ ਉਲੰਘਣਾ",
    as:"বিপজ্জনক আৱৰ্জনা পৰিবহন লংঘন",
    sa:"विषमअपशिष्टपरिवहनलङ्घनम्"
  },
  sec:"EPA Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Chemical Storage Violation",
    hi:"रासायनिक भंडारण उल्लंघन",
    bn:"রাসায়নিক সংরক্ষণ লঙ্ঘন",
    te:"రసాయన నిల్వ ఉల్లంఘన",
    mr:"रासायनिक साठवण उल्लंघन",
    ta:"ரசாயன சேமிப்பு மீறல்",
    gu:"રાસાયણિક સંગ્રહ ઉલ્લંઘન",
    ur:"کیمیائی ذخیرہ خلاف ورزی",
    kn:"ರಾಸಾಯನಿಕ ಸಂಗ್ರಹ ಉಲ್ಲಂಘನೆ",
    or:"ରସାୟନିକ ସଂରକ୍ଷଣ ଉଲ୍ଲଂଘନ",
    ml:"രാസവസ്തു സംഭരണ ലംഘനം",
    pa:"ਰਸਾਇਣਕ ਸਟੋਰੇਜ ਉਲੰਘਣਾ",
    as:"ৰাসায়নিক সংৰক্ষণ লংঘন",
    sa:"रासायनिकसंग्रहलङ्घनम्"
  },
  sec:"Factories Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Contract Labour Supply",
    hi:"अवैध ठेका श्रमिक आपूर्ति",
    bn:"অবৈধ চুক্তিভিত্তিক শ্রম সরবরাহ",
    te:"అక్రమ కాంట్రాక్ట్ కార్మిక సరఫరా",
    mr:"बेकायदेशीर कंत्राटी कामगार पुरवठा",
    ta:"சட்டவிரோத ஒப்பந்த தொழிலாளர்",
    gu:"અવૈધ કોન્ટ્રાક્ટ મજૂર પુરવઠો",
    ur:"غیر قانونی کنٹریکٹ لیبر سپلائی",
    kn:"ಅಕ್ರಮ ಒಪ್ಪಂದ ಕಾರ್ಮಿಕ ಪೂರೈಕೆ",
    or:"ଅବୈଧ ଠିକା ଶ୍ରମିକ ଯୋଗାଣ",
    ml:"നിയമവിരുദ്ധ കരാർ തൊഴിലാളി വിതരണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਠੇਕੇਦਾਰ ਮਜ਼ਦੂਰ ਸਪਲਾਈ",
    as:"অবৈধ চুক্তিভিত্তিক শ্ৰমিক যোগান",
    sa:"अवैधसंविदाश्रमिकपुरवठा"
  },
  sec:"CLRA Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Child Labour in Hazardous Work",
    hi:"खतरनाक कार्य में बाल श्रम",
    bn:"ঝুঁকিপূর্ণ কাজে শিশু শ্রম",
    te:"ప్రమాదకర పనిలో బాల కార్మికత్వం",
    mr:"धोकादायक कामातील बालकामगार",
    ta:"ஆபத்தான குழந்தை தொழில்",
    gu:"જોખમી કામમાં બાળ મજૂરી",
    ur:"خطرناک کام میں چائلڈ لیبر",
    kn:"ಅಪಾಯಕಾರಿ ಕೆಲಸದಲ್ಲಿ ಬಾಲ ಕಾರ್ಮಿಕತೆ",
    or:"ବିପଦଜନକ କାମରେ ଶିଶୁ ଶ୍ରମ",
    ml:"അപകടകരമായ ജോലിയിൽ ബാലതൊഴിൽ",
    pa:"ਖ਼ਤਰਨਾਕ ਕੰਮ ਵਿੱਚ ਬਾਲ ਮਜ਼ਦੂਰੀ",
    as:"বিপজ্জনক কামত শিশু শ্ৰম",
    sa:"विपन्नकार्ये बालश्रमः"
  },
  sec:"CLPR Act",
  punishment:{
    en:"Rigorous imprisonment",hi:"कठोर कारावास",bn:"সশ্রম কারাদণ্ড",
    te:"కఠిన కారాగారం",mr:"कठोर कारावास",ta:"கடுமையான சிறை",
    gu:"કઠોર કેદ",ur:"سخت قید",kn:"ಕಠಿಣ ಕಾರಾಗೃಹ",
    or:"କଠୋର କାରାଦଣ୍ଡ",ml:"കർശന തടവ്",
    pa:"ਸਖ਼ਤ ਕੈਦ",as:"কঠোৰ কাৰাদণ্ড",sa:"कठोरकारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Human Smuggling",
    hi:"मानव तस्करी",
    bn:"মানব পাচার",
    te:"మానవ అక్రమ రవాణా",
    mr:"मानव तस्करी",
    ta:"மனிதர் கடத்தல்",
    gu:"માનવ તસ્કરી",
    ur:"انسانی اسمگلنگ",
    kn:"ಮಾನವ ಕಳ್ಳಸಾಗಣೆ",
    or:"ମାନବ ଚୋରାଚାଳା",
    ml:"മനുഷ്യ കടത്തൽ",
    pa:"ਮਨੁੱਖੀ ਤਸਕਰੀ",
    as:"মানৱ পাচাৰ",
    sa:"मानवतस्करी"
  },
  sec:"IPC 370",
  punishment:{
    en:"Life imprisonment",hi:"आजीवन कारावास",bn:"যাবজ্জীবন কারাদণ্ড",
    te:"ఆజీవ కారాగారం",mr:"आजीवन कारावास",ta:"ஆயுள் சிறை",
    gu:"આજીવન કેદ",ur:"عمر قید",kn:"ಆಜೀವ ಕಾರಾಗೃಹ",
    or:"ଆଜୀବନ କାରାଦଣ୍ଡ",ml:"ജീവപര്യന്തം തടവ്",
    pa:"ਉਮਰ ਕੈਦ",as:"আজীৱন কাৰাদণ্ড",sa:"आजीवनकारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Employment of Foreigners",
    hi:"विदेशियों की अवैध नियुक्ति",
    bn:"বিদেশিদের অবৈধ নিয়োগ",
    te:"విదేశీయులను అక్రమంగా ఉద్యోగంలో పెట్టడం",
    mr:"परदेशी नागरिकांची बेकायदेशीर नेमणूक",
    ta:"வெளிநாட்டவர்களை சட்டவிரோதமாக வேலைக்கு எடுதல்",
    gu:"વિદેશીઓની અવૈધ નિમણૂક",
    ur:"غیر ملکیوں کی غیر قانونی ملازمت",
    kn:"ವಿದೇಶಿಗಳನ್ನು ಅಕ್ರಮವಾಗಿ ಉದ್ಯೋಗಕ್ಕೆ ನೇಮಕ",
    or:"ବିଦେଶୀଙ୍କ ଅବୈଧ ନିଯୁକ୍ତି",
    ml:"വിദേശികളെ അനധികൃതമായി നിയമിക്കൽ",
    pa:"ਵਿਦੇਸ਼ੀਆਂ ਦੀ ਗੈਰਕਾਨੂੰਨੀ ਨੌਕਰੀ",
    as:"বিদেশী লোকৰ অবৈধ নিয়োগ",
    sa:"विदेशिनामवैधनियोजनम्"
  },
  sec:"Foreigners Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Employment Visa",
    hi:"फर्जी रोजगार वीज़ा",
    bn:"ভুয়া কর্মসংস্থান ভিসা",
    te:"నకిలీ ఉద్యోగ వీసా",
    mr:"बनावट रोजगार व्हिसा",
    ta:"போலி வேலை விசா",
    gu:"નકલી રોજગાર વિઝા",
    ur:"جعلی روزگار ویزا",
    kn:"ನಕಲಿ ಉದ್ಯೋಗ ವೀಸಾ",
    or:"ଭୁଆ ନିଯୁକ୍ତି ଭିସା",
    ml:"വ്യാജ തൊഴിൽ വിസ",
    pa:"ਨਕਲੀ ਰੋਜ਼ਗਾਰ ਵੀਜ਼ਾ",
    as:"ভুৱা চাকৰি ভিছা",
    sa:"कूटनियोजनवीजा"
  },
  sec:"Passport Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Illegal Arms Repair Workshop",
    hi:"अवैध हथियार मरम्मत कार्यशाला",
    bn:"অবৈধ অস্ত্র মেরামত কর্মশালা",
    te:"అక్రమ ఆయుధ మరమ్మత్తు కేంద్రం",
    mr:"बेकायदेशीर शस्त्र दुरुस्ती कार्यशाळा",
    ta:"சட்டவிரோத ஆயுத பழுது நிலையம்",
    gu:"અવૈધ હથિયાર મરામત વર્કશોપ",
    ur:"غیر قانونی اسلحہ مرمت ورکشاپ",
    kn:"ಅಕ್ರಮ ಆಯುಧ ದುರಸ್ತಿ ಕಾರ್ಯಾಗಾರ",
    or:"ଅବୈଧ ଅସ୍ତ୍ର ମରାମତି କାରଖାନା",
    ml:"നിയമവിരുദ്ധ ആയുധ അറ്റകുറ്റപ്പണി കേന്ദ്രം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਹਥਿਆਰ ਮੁਰੰਮਤ ਵਰਕਸ਼ਾਪ",
    as:"অবৈধ অস্ত্ৰ মেৰামতি কাৰখানা",
    sa:"अवैधायुधमरम्मतकार्यशाला"
  },
  sec:"Arms Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Ammunition Reloading",
    hi:"अनधिकृत गोला-बारूद पुनः भरना",
    bn:"অননুমোদিত গোলাবারুদ পুনর্ভরণ",
    te:"అనుమతి లేని అమ్యూనిషన్ రీలోడింగ్",
    mr:"अनधिकृत दारुगोळा पुनर्भरण",
    ta:"அனுமதி இல்லா குண்டு நிரப்பல்",
    gu:"અનધિકૃત ગોળા-બારુદ રીલોડિંગ",
    ur:"غیر مجاز گولہ بارود بھرائی",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಗುಂಡು ಮರುಭರ್ತಿ",
    or:"ଅନଧିକୃତ ଗୋଲାବାରୁଦ ପୁନଃଭରଣ",
    ml:"അനുമതിയില്ലാത്ത വെടിക്കോപ്പ് പുനർനിറയ്ക്കൽ",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਗੋਲਾ-ਬਾਰੂਦ ਰੀਲੋਡਿੰਗ",
    as:"অনুমতি নথকা গোলাবাৰুদ পুনৰ ভৰ্তি",
    sa:"अनधिकृतगोलीपुनर्भरणम्"
  },
  sec:"Arms Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Tampering with Ballistic Evidence",
    hi:"बैलिस्टिक साक्ष्य से छेड़छाड़",
    bn:"ব্যালিস্টিক প্রমাণ বিকৃতি",
    te:"బ్యాలిస్టిక్ ఆధారాల మార్పు",
    mr:"बॅलिस्टिक पुराव्याची छेडछाड",
    ta:"துப்பாக்கி சாட்சி மாற்றம்",
    gu:"બેલિસ્ટિક પુરાવામાં છેડછાડ",
    ur:"بالیسٹک ثبوت میں چھیڑ چھاڑ",
    kn:"ಬ್ಯಾಲಿಸ್ಟಿಕ್ ಸಾಕ್ಷ್ಯದಲ್ಲಿ ಕೈಚಳಕ",
    or:"ବ୍ୟାଲିଷ୍ଟିକ୍ ପ୍ରମାଣ ଛେଡ଼ଛାଡ଼",
    ml:"ബാലിസ്റ്റിക് തെളിവ് കൃത്രിമം",
    pa:"ਬੈਲਿਸਟਿਕ ਸਬੂਤ ਨਾਲ ਛੇੜਛਾੜ",
    as:"বেলিষ্টিক প্ৰমাণ বিকৃতি",
    sa:"प्रक्षेप्यसाक्ष्यविकृति"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Arms Export",
    hi:"अवैध हथियार निर्यात",
    bn:"অবৈধ অস্ত্র রপ্তানি",
    te:"అక్రమ ఆయుధ ఎగుమతి",
    mr:"बेकायदेशीर शस्त्र निर्यात",
    ta:"சட்டவிரோத ஆயுத ஏற்றுமதி",
    gu:"અવૈધ હથિયાર નિકાસ",
    ur:"غیر قانونی اسلحہ برآمد",
    kn:"ಅಕ್ರಮ ಆಯುಧ ರಫ್ತು",
    or:"ଅବୈଧ ଅସ୍ତ୍ର ରପ୍ତାନି",
    ml:"നിയമവിരുദ്ധ ആയുധ കയറ്റുമതി",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਹਥਿਆਰ ਨਿਰਯਾਤ",
    as:"অবৈধ অস্ত্ৰ ৰপ্তানি",
    sa:"अवैधायुधनिर्यातः"
  },
  sec:"Customs Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Arms License Forgery",
    hi:"हथियार लाइसेंस जालसाजी",
    bn:"অস্ত্র লাইসেন্স জালিয়াতি",
    te:"ఆయుధ లైసెన్స్ నకిలీ",
    mr:"शस्त्र परवाना बनावट",
    ta:"ஆயுத உரிமம் போலி",
    gu:"હથિયાર લાઇસન્સ નકલી",
    ur:"اسلحہ لائسنس جعلسازی",
    kn:"ಆಯುಧ ಪರವಾನಗಿ ನಕಲಿ",
    or:"ଅସ୍ତ୍ର ଲାଇସେନ୍ସ ଜାଲିଆତି",
    ml:"ആയുധ ലൈസൻസ് വ്യാജം",
    pa:"ਹਥਿਆਰ ਲਾਇਸੈਂਸ ਜਾਲਸਾਜ਼ੀ",
    as:"অস্ত্ৰ লাইচেন্স জালিয়াতি",
    sa:"आयुधअनुज्ञापत्रकूटकरणम्"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Prison Communication",
    hi:"जेल में अवैध संचार",
    bn:"কারাগারে অবৈধ যোগাযোগ",
    te:"జైల్లో అక్రమ సమాచార మార్పిడి",
    mr:"कारागृहातील बेकायदेशीर संपर्क",
    ta:"சிறை உள்ளே சட்டவிரோத தொடர்பு",
    gu:"જેલમાં અવૈધ સંચાર",
    ur:"جیل میں غیر قانونی رابطہ",
    kn:"ಜೈಲಿನಲ್ಲಿನ ಅಕ್ರಮ ಸಂಪರ್ಕ",
    or:"କାରାଗାର ଭିତରେ ଅବୈଧ ସଂଯୋଗ",
    ml:"ജയിൽ അകത്തെ അനധികൃത ബന്ധം",
    pa:"ਜੇਲ੍ਹ ਵਿੱਚ ਗੈਰਕਾਨੂੰਨੀ ਸੰਚਾਰ",
    as:"কাৰাগাৰত অবৈধ যোগাযোগ",
    sa:"कारागारअवैधसंपर्कः"
  },
  sec:"Prisons Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Prison Contraband Supply",
    hi:"जेल में प्रतिबंधित वस्तु आपूर्ति",
    bn:"কারাগারে নিষিদ্ধ সামগ্রী সরবরাহ",
    te:"జైల్లో నిషేధిత వస్తువుల సరఫరా",
    mr:"कारागृहात प्रतिबंधित वस्तू पुरवठा",
    ta:"சிறைக்கு தடை பொருள் கடத்தல்",
    gu:"જેલમાં પ્રતિબંધિત સામગ્રી પુરવઠો",
    ur:"جیل میں ممنوعہ سامان کی فراہمی",
    kn:"ಜೈಲಿಗೆ ನಿಷೇಧಿತ ವಸ್ತು ಪೂರೈಕೆ",
    or:"କାରାଗାରକୁ ନିଷିଦ୍ଧ ସାମଗ୍ରୀ ଯୋଗାଣ",
    ml:"ജയിൽ നിരോധിത വസ്തു വിതരണം",
    pa:"ਜੇਲ੍ਹ ਵਿੱਚ ਪਾਬੰਦੀਸ਼ੁਦਾ ਸਮਾਨ ਸਪਲਾਈ",
    as:"কাৰাগাৰত নিষিদ্ধ সামগ্ৰী যোগান",
    sa:"कारागारनिषिद्धवस्तुपूरणम्"
  },
  sec:"Prisons Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Aiding Prison Escape",
    hi:"कैदी को भगाने में सहायता",
    bn:"কারাবন্দী পলায়নে সহায়তা",
    te:"ఖైదీ పారిపోవడానికి సహాయం",
    mr:"कैद्याला पळून जाण्यास मदत",
    ta:"சிறை தப்பிக்க உதவி",
    gu:"કેદીને ફરાર થવામાં મદદ",
    ur:"قیدی کو فرار میں مدد",
    kn:"ಕೈದಿಯನ್ನು ತಪ್ಪಿಸಿಕೊಳ್ಳಲು ಸಹಾಯ",
    or:"କଏଦୀ ପଳାୟନରେ ସାହାଯ୍ୟ",
    ml:"തടവുകാരൻ രക്ഷപ്പെടാൻ സഹായം",
    pa:"ਕੈਦੀ ਨੂੰ ਭੱਜਣ ਵਿੱਚ ਮਦਦ",
    as:"বন্দীক পলায়নত সহায়তা",
    sa:"बन्दिपलायनसहायः"
  },
  sec:"IPC 225",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Harbouring Escaped Prisoner",
    hi:"फरार कैदी को शरण देना",
    bn:"পলাতক বন্দীকে আশ্রয়",
    te:"పారిపోయిన ఖైదీకి ఆశ్రయం",
    mr:"पलायन केलेल्या कैद्याला आश्रय",
    ta:"தப்பிய கைதியை மறைத்தல்",
    gu:"ફરાર કેદીને આશ્રય આપવો",
    ur:"فرار شدہ قیدی کو پناہ دینا",
    kn:"ಪಾರಾದ ಕೈದಿಗೆ ಆಶ್ರಯ",
    or:"ପଳାୟନ କରିଥିବା କଏଦୀକୁ ଆଶ୍ରୟ",
    ml:"ഒളിച്ചോടിയ തടവുകാരനെ ഒളിപ്പിക്കൽ",
    pa:"ਭੱਜੇ ਕੈਦੀ ਨੂੰ ਛੁਪਾਉਣਾ",
    as:"পলাতক বন্দীক আশ্ৰয়",
    sa:"पलायितबन्दिनाश्रयः"
  },
  sec:"IPC 212",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Bail Surety",
    hi:"फर्जी जमानत जमानती",
    bn:"ভুয়া জামিন জামিনদার",
    te:"నకిలీ బెయిల్ హామీదారు",
    mr:"बनावट जामीनदार",
    ta:"போலி ஜாமீன் உறுதி",
    gu:"નકલી જામીનદાર",
    ur:"جعلی ضمانتی",
    kn:"ನಕಲಿ ಜಾಮೀನುದಾರ",
    or:"ଭୁଆ ଜାମିନଦାର",
    ml:"വ്യാജ ജാമ്യദാർ",
    pa:"ਨਕਲੀ ਜ਼ਮਾਨਤੀ",
    as:"ভুৱা জামিনদাৰ",
    sa:"कूटजामीनदाता"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Telecom Tower Vandalism",
    hi:"दूरसंचार टावर तोड़फोड़",
    bn:"টেলিকম টাওয়ার ভাঙচুর",
    te:"టెలికాం టవర్ ధ్వంసం",
    mr:"दूरसंचार मनोरा तोडफोड",
    ta:"தொலைத்தொடர்பு கோபுர சேதம்",
    gu:"ટેલિકોમ ટાવર તોડફોડ",
    ur:"ٹیلی کام ٹاور توڑ پھوڑ",
    kn:"ಟೆಲಿಕಾಂ ಟವರ್ ಧ್ವಂಸ",
    or:"ଟେଲିକମ୍ ଟାୱାର ଧ୍ୱଂସ",
    ml:"ടെലികോം ടവർ നശീകരണം",
    pa:"ਟੈਲੀਕਾਮ ਟਾਵਰ ਤੋੜਫੋੜ",
    as:"টেলিকম টাৱাৰ ধ্বংস",
    sa:"दूरसंचारस्तम्भध्वंसः"
  },
  sec:"Telecom Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"SIM Cloning",
    hi:"सिम क्लोनिंग",
    bn:"সিম ক্লোনিং",
    te:"సిమ్ క్లోనింగ్",
    mr:"सिम क्लोनिंग",
    ta:"சிம் நகல் உருவாக்கம்",
    gu:"સિમ ક્લોનિંગ",
    ur:"سم کلوننگ",
    kn:"ಸಿಮ್ ಕ್ಲೋನಿಂಗ್",
    or:"ସିମ୍ କ୍ଲୋନିଂ",
    ml:"സിം ക്ലോണിംഗ്",
    pa:"ਸਿਮ ਕਲੋਨਿੰਗ",
    as:"চিম ক্লোনিং",
    sa:"सिम्प्रतिरूपणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Call Detail Record Misuse",
    hi:"कॉल विवरण रिकॉर्ड का दुरुपयोग",
    bn:"কল ডিটেইল রেকর্ডের অপব্যবহার",
    te:"కాల్ వివరాల రికార్డు దుర్వినియోగం",
    mr:"कॉल तपशील नोंदींचा गैरवापर",
    ta:"அழைப்பு விவரத் தகவல் தவறான பயன்பாடு",
    gu:"કોલ ડીટેઈલ રેકોર્ડનો દુરુપયોગ",
    ur:"کال تفصیلات ریکارڈ کا غلط استعمال",
    kn:"ಕಾಲ್ ವಿವರ ದಾಖಲೆ ದುರುಪಯೋಗ",
    or:"କଲ୍ ବିବରଣୀ ରେକର୍ଡ ଦୁରୁପଯୋଗ",
    ml:"കോൾ വിശദാംശ രേഖ ദുരുപയോഗം",
    pa:"ਕਾਲ ਡੀਟੇਲ ਰਿਕਾਰਡ ਦੀ ਗਲਤ ਵਰਤੋਂ",
    as:"কল ডিটেইল ৰেকৰ্ডৰ অপব্যৱহাৰ",
    sa:"दूरवाणीविवरणलेखदुरुपयोगः"
  },
  sec:"IT Act",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Mobile Tower Installation",
    hi:"फर्जी मोबाइल टावर स्थापना",
    bn:"ভুয়া মোবাইল টাওয়ার স্থাপন",
    te:"నకిలీ మొబైల్ టవర్ ఏర్పాటు",
    mr:"बनावट मोबाईल टॉवर स्थापना",
    ta:"போலி மொபைல் டவர் நிறுவல்",
    gu:"નકલી મોબાઇલ ટાવર સ્થાપન",
    ur:"جعلی موبائل ٹاور تنصیب",
    kn:"ನಕಲಿ ಮೊಬೈಲ್ ಟವರ್ ಸ್ಥಾಪನೆ",
    or:"ଭୁଆ ମୋବାଇଲ୍ ଟାୱାର ସ୍ଥାପନ",
    ml:"വ്യാജ മൊബൈൽ ടവർ സ്ഥാപിക്കൽ",
    pa:"ਨਕਲੀ ਮੋਬਾਈਲ ਟਾਵਰ ਸਥਾਪਨਾ",
    as:"ভুৱা মোবাইল টাৱাৰ স্থাপন",
    sa:"कूटचलदूरभाषास्तम्भस्थापनम्"
  },
  sec:"Telecom Rules",
  punishment:{
    en:"Fine / Jail",hi:"जुर्माना / कारावास",
    bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",
    mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",
    kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",
    ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",
    as:"জৰিমনা / কাৰাদণ্ড",
    sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Signal Booster Use",
    hi:"अवैध सिग्नल बूस्टर उपयोग",
    bn:"অবৈধ সিগন্যাল বুস্টার ব্যবহার",
    te:"అక్రమ సిగ్నల్ బూస్టర్ వినియోగం",
    mr:"बेकायदेशीर सिग्नल बूस्टर वापर",
    ta:"சட்டவிரோத சிக்னல் பூஸ்டர் பயன்பாடு",
    gu:"અવૈધ સિગ્નલ બૂસ્ટર ઉપયોગ",
    ur:"غیر قانونی سگنل بوسٹر استعمال",
    kn:"ಅಕ್ರಮ ಸಿಗ್ನಲ್ ಬೂಸ್ಟರ್ ಬಳಕೆ",
    or:"ଅବୈଧ ସିଗ୍ନାଲ୍ ବୁଷ୍ଟର ବ୍ୟବହାର",
    ml:"നിയമവിരുദ്ധ സിഗ്നൽ ബൂസ്റ്റർ ഉപയോഗം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਸਿਗਨਲ ਬੂਸਟਰ ਵਰਤੋਂ",
    as:"অবৈধ চিগনেল বুস্টাৰ ব্যৱহাৰ",
    sa:"अवैधसंकेतवर्धकप्रयोगः"
  },
  sec:"Telecom Rules",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},
{
  name:{
    en:"Bank KYC Forgery",hi:"बैंक KYC जालसाजी",bn:"ব্যাংক KYC জালিয়াতি",te:"బ్యాంక్ KYC నకిలీ",
    mr:"बँक KYC बनावट",ta:"வங்கி KYC போலி",gu:"બેંક KYC નકલી",ur:"بینک KYC جعلسازی",
    kn:"ಬ್ಯಾಂಕ್ KYC ನಕಲಿ",or:"ବ୍ୟାଙ୍କ KYC ଜାଲିଆତି",ml:"ബാങ്ക് KYC വ്യാജം",
    pa:"ਬੈਂਕ KYC ਜਾਲਸਾਜ਼ੀ",as:"ব্যাংক KYC জালিয়াতি",sa:"बैंक KYC कूटकरणम्"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Cheque Truncation Fraud",hi:"चेक ट्रंकेशन धोखाधड़ी",bn:"চেক ট্রাঙ্কেশন জালিয়াতি",
    te:"చెక్ ట్రంకేషన్ మోసం",mr:"चेक ट्रंकेशन फसवणूक",ta:"காசோலை டிரங்க்ஷன் மோசடி",
    gu:"ચેક ટ્રન્કેશન છેતરપિંડી",ur:"چیک ٹرنکیشن فراڈ",kn:"ಚೆಕ್ ಟ್ರಂಕೇಶನ್ ಮೋಸ",
    or:"ଚେକ୍ ଟ୍ରଙ୍କେସନ୍ ଠକେଇ",ml:"ചെക്ക് ട്രങ്കേഷൻ തട്ടിപ്പ്",
    pa:"ਚੈਕ ਟਰੰਕੇਸ਼ਨ ਧੋਖਾਧੜੀ",as:"চেক ট্ৰাঙ্কেশন জালিয়াতি",sa:"धनादेशसंक्षेपणछलनम्"
  },
  sec:"NI Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"ATM Skimming Device Use",hi:"एटीएम स्किमिंग उपकरण उपयोग",bn:"এটিএম স্কিমিং ডিভাইস ব্যবহার",
    te:"ATM స్కిమ్మింగ్ పరికరం వినియోగం",mr:"ATM स्किमिंग साधन वापर",
    ta:"ATM ஸ்கிம்மிங் சாதனம் பயன்பாடு",gu:"ATM સ્કિમિંગ ઉપકરણ ઉપયોગ",
    ur:"اے ٹی ایم اسکمنگ ڈیوائس استعمال",kn:"ATM ಸ್ಕಿಮ್ಮಿಂಗ್ ಸಾಧನ ಬಳಕೆ",
    or:"ATM ସ୍କିମିଂ ଯନ୍ତ୍ର ବ୍ୟବହାର",ml:"ATM സ്കിമ്മിംഗ് ഉപകരണം ഉപയോഗം",
    pa:"ATM ਸਕਿਮਿੰਗ ਡਿਵਾਈਸ ਵਰਤੋਂ",as:"ATM স্কিমিং ডিভাইচ ব্যৱহাৰ",
    sa:"ATM स्किमिङ् उपकरणप्रयोगः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Bank API Access",hi:"अनधिकृत बैंक API पहुंच",
    bn:"অননুমোদিত ব্যাংক API প্রবেশ",te:"అనుమతి లేని బ్యాంక్ API ప్రాప్తి",
    mr:"अनधिकृत बँक API प्रवेश",ta:"அனுமதி இல்லா வங்கி API அணுகல்",
    gu:"અનધિકૃત બેંક API ઍક્સેસ",ur:"غیر مجاز بینک API رسائی",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಬ್ಯಾಂಕ್ API ಪ್ರವೇಶ",or:"ଅନଧିକୃତ ବ୍ୟାଙ୍କ API ପ୍ରବେଶ",
    ml:"അനുമതിയില്ലാത്ത ബാങ്ക് API പ്രവേശനം",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਬੈਂਕ API ਐਕਸੈਸ",as:"অনুমতি নথকা বেংক API প্ৰৱেশ",
    sa:"अनधिकृतबैंकAPIप्रवेशः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Bank Branch Operation",hi:"फर्जी बैंक शाखा संचालन",
    bn:"ভুয়া ব্যাংক শাখা পরিচালনা",te:"నకిలీ బ్యాంక్ శాఖ నిర్వహణ",
    mr:"बनावट बँक शाखा संचालन",ta:"போலி வங்கி கிளை இயக்கம்",
    gu:"નકલી બેંક શાખા સંચાલન",ur:"جعلی بینک برانچ آپریشن",
    kn:"ನಕಲಿ ಬ್ಯಾಂಕ್ ಶಾಖೆ ಕಾರ್ಯಾಚರಣೆ",or:"ଭୁଆ ବ୍ୟାଙ୍କ ଶାଖା ସଞ୍ଚାଳନ",
    ml:"വ്യാജ ബാങ്ക് ശാഖ പ്രവർത്തനം",
    pa:"ਨਕਲੀ ਬੈਂਕ ਸ਼ਾਖਾ ਚਲਾਉਣਾ",as:"ভুৱা বেংক শাখা পৰিচালনা",
    sa:"कूटबैंकशाखासञ्चालनम्"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",mr:"कारावास",ta:"சிறை",
    gu:"કારાવાસ",ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Aviation Fuel Theft",
    hi:"विमान ईंधन चोरी",
    bn:"বিমান জ্বালানি চুরি",
    te:"విమాన ఇంధన దొంగతనం",
    mr:"विमान इंधन चोरी",
    ta:"விமான எரிபொருள் திருட்டு",
    gu:"વિમાન ઇંધણ ચોરી",
    ur:"ہوائی جہاز کے ایندھن کی چوری",
    kn:"ವಿಮಾನ ಇಂಧನ ಕಳ್ಳತನ",
    or:"ବିମାନ ଇଂଧନ ଚୋରି",
    ml:"വിമാന ഇന്ധന മോഷണം",
    pa:"ਵਿਮਾਨ ਈਂਧਨ ਚੋਰੀ",
    as:"বিমান ইন্ধন চুৰি",
    sa:"विमानइन्धनचौर्यम्"
  },
  sec:"Aircraft Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Airport Security Breach",
    hi:"हवाई अड्डा सुरक्षा उल्लंघन",
    bn:"বিমানবন্দর নিরাপত্তা লঙ্ঘন",
    te:"విమానాశ్రయ భద్రత ఉల్లంఘన",
    mr:"विमानतळ सुरक्षा उल्लंघन",
    ta:"விமான நிலைய பாதுகாப்பு மீறல்",
    gu:"વિમાનમથક સુરક્ષા ભંગ",
    ur:"ہوائی اڈے کی سیکیورٹی کی خلاف ورزی",
    kn:"ವಿಮಾನ ನಿಲ್ದಾಣ ಭದ್ರತಾ ಉಲ್ಲಂಘನೆ",
    or:"ବିମାନବନ୍ଦର ସୁରକ୍ଷା ଉଲ୍ଲଂଘନ",
    ml:"വിമാനത്താവള സുരക്ഷ ലംഘനം",
    pa:"ਹਵਾਈ ਅੱਡਾ ਸੁਰੱਖਿਆ ਉਲੰਘਣਾ",
    as:"বিমানবন্দৰ সুৰক্ষা লঙ্ঘন",
    sa:"विमानस्थानसुरक्षालङ्घनम्"
  },
  sec:"Aircraft Security Rules",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Laser Pointer at Aircraft",
    hi:"विमान पर लेज़र प्रकाश डालना",
    bn:"বিমানের দিকে লেজার আলো照射",
    te:"విమానంపై లేజర్ కాంతి照射",
    mr:"विमानावर लेझर प्रकाश照射",
    ta:"விமானத்திற்கு லேசர் ஒளி照射",
    gu:"વિમાન પર લેસર પ્રકાશ照射",
    ur:"ہوائی جہاز پر لیزر روشنی照射",
    kn:"ವಿಮಾನಕ್ಕೆ ಲೇಸರ್ ಬೆಳಕು照射",
    or:"ବିମାନକୁ ଲେଜର ଆଲୋକ照射",
    ml:"വിമാനത്തിലേക്ക് ലേസർ പ്രകാശ照射",
    pa:"ਵਿਮਾਨ ਵੱਲ ਲੇਜ਼ਰ ਰੌਸ਼ਨੀ照射",
    as:"বিমানলৈ লেজাৰ পোহৰ照射",
    sa:"विमानलेसरप्रकाशप्रक्षेपणम्"
  },
  sec:"Aircraft Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Drone Near Airport",
    hi:"हवाई अड्डे के पास अनधिकृत ड्रोन",
    bn:"বিমানবন্দরের কাছে অননুমোদিত ড্রোন",
    te:"విమానాశ్రయం సమీపంలో అనుమతి లేని డ్రోన్",
    mr:"विमानतळाजवळ अनधिकृत ड्रोन",
    ta:"விமான நிலைய அருகே அனுமதி இல்லா ட்ரோன்",
    gu:"વિમાનમથક નજીક અનધિકૃત ડ્રોન",
    ur:"ہوائی اڈے کے قریب غیر مجاز ڈرون",
    kn:"ವಿಮಾನ ನಿಲ್ದಾಣದ ಬಳಿ ಅನುಮತಿ ಇಲ್ಲದ ಡ್ರೋನ್",
    or:"ବିମାନବନ୍ଦର ନିକଟରେ ଅନଧିକୃତ ଡ୍ରୋନ୍",
    ml:"വിമാനത്താവളത്തിന് സമീപം അനുമതിയില്ലാത്ത ഡ്രോൺ",
    pa:"ਹਵਾਈ ਅੱਡੇ ਨੇੜੇ ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਡਰੋਨ",
    as:"বিমানবন্দৰৰ ওচৰত অনুমতি নথকা ড্ৰোন",
    sa:"विमानस्थानसमीपेअनधिकृतड्रोनः"
  },
  sec:"DGCA Rules",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Pilot License",
    hi:"फर्जी पायलट लाइसेंस",
    bn:"ভুয়া পাইলট লাইসেন্স",
    te:"నకిలీ పైలట్ లైసెన్స్",
    mr:"बनावट वैमानिक परवाना",
    ta:"போலி விமான ஓட்டுநர் உரிமம்",
    gu:"નકલી પાયલટ લાઇસન્સ",
    ur:"جعلی پائلٹ لائسنس",
    kn:"ನಕಲಿ ಪೈಲಟ್ ಪರವಾನಗಿ",
    or:"ଭୁଆ ପାଇଲଟ୍ ଲାଇସେନ୍ସ",
    ml:"വ്യാജ പൈലറ്റ് ലൈസൻസ്",
    pa:"ਨਕਲੀ ਪਾਇਲਟ ਲਾਇਸੈਂਸ",
    as:"ভুৱা পাইলট লাইচেন্স",
    sa:"कूटवैमानिकलाइसेंसम्"
  },
  sec:"Aircraft Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Maritime Piracy",
    hi:"समुद्री डकैती",
    bn:"সমুদ্র ডাকাতি",
    te:"సముద్ర దోపిడి",
    mr:"समुद्री चाचेगिरी",
    ta:"கடல் கொள்ளை",
    gu:"સમુદ્રી લૂંટ",
    ur:"بحری قزاقی",
    kn:"ಸಮುದ್ರ ದೋಚಾಟ",
    or:"ସମୁଦ୍ର ଡକାୟତି",
    ml:"കടൽ കള്ളക്കടത്ത്",
    pa:"ਸਮੁੰਦਰੀ ਡਾਕੇ",
    as:"সামুদ্ৰিক ডাকাইতি",
    sa:"समुद्रदस्युत्वम्"
  },
  sec:"Maritime Act",
  punishment:{
    en:"Life imprisonment",hi:"आजीवन कारावास",bn:"যাবজ্জীবন কারাদণ্ড",
    te:"ఆజీవ కారాగారం",mr:"आजीवन कारावास",ta:"ஆயுள் சிறை",
    gu:"આજીવન કેદ",ur:"عمر قید",kn:"ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or:"ଆଜୀବନ କାରାଦଣ୍ଡ",ml:"ജീവപര്യന്തം തടവ്",
    pa:"ਉਮਰ ਕੈਦ",as:"আজীৱন কাৰাদণ্ড",sa:"आजीवनकारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Fishing in EEZ",
    hi:"EEZ में अवैध मछली पकड़ना",
    bn:"EEZ এলাকায় অবৈধ মাছ ধরা",
    te:"EEZ ప్రాంతంలో అక్రమ మత్స్యకార్యం",
    mr:"EEZ मध्ये बेकायदेशीर मासेमारी",
    ta:"EEZ பகுதியில் சட்டவிரோத மீன்பிடி",
    gu:"EEZ વિસ્તારમાં અવૈધ માછીમારી",
    ur:"EEZ علاقے میں غیر قانونی ماہی گیری",
    kn:"EEZ ಪ್ರದೇಶದಲ್ಲಿ ಅಕ್ರಮ ಮೀನುಗಾರಿಕೆ",
    or:"EEZ ଅଞ୍ଚଳରେ ଅବୈଧ ମାଛଧରା",
    ml:"EEZ മേഖലയിൽ അനധികൃത മത്സ്യബന്ധനം",
    pa:"EEZ ਖੇਤਰ ਵਿੱਚ ਗੈਰਕਾਨੂੰਨੀ ਮੱਛੀ ਫੜਨਾ",
    as:"EEZ অঞ্চলত অবৈধ মাছ ধৰা",
    sa:"EEZप्रदेशेअवैधमत्स्यग्रहणम्"
  },
  sec:"Maritime Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Port Security Violation",
    hi:"बंदरगाह सुरक्षा उल्लंघन",
    bn:"বন্দর নিরাপত্তা লঙ্ঘন",
    te:"నౌకాశ్రయ భద్రత ఉల్లంఘన",
    mr:"बंदर सुरक्षा उल्लंघन",
    ta:"துறைமுக பாதுகாப்பு மீறல்",
    gu:"બંદર સુરક્ષા ભંગ",
    ur:"بندرگاہ سیکیورٹی کی خلاف ورزی",
    kn:"ಬಂದರು ಭದ್ರತಾ ಉಲ್ಲಂಘನೆ",
    or:"ବନ୍ଦର ସୁରକ୍ଷା ଉଲ୍ଲଂଘନ",
    ml:"തുറമുഖ സുരക്ഷ ലംഘനം",
    pa:"ਬੰਦਰਗਾਹ ਸੁਰੱਖਿਆ ਉਲੰਘਣਾ",
    as:"বন্দৰ সুৰক্ষা লঙ্ঘন",
    sa:"पत्तनसुरक्षालङ्घनम्"
  },
  sec:"Port Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Ship Registration Forgery",
    hi:"जहाज पंजीकरण जालसाजी",
    bn:"জাহাজ নিবন্ধন জালিয়াতি",
    te:"నౌక నమోదు నకిలీ",
    mr:"जहाज नोंदणी बनावट",
    ta:"கப்பல் பதிவு போலி",
    gu:"જહાજ નોંધણી નકલી",
    ur:"جہاز رجسٹریشن جعلسازی",
    kn:"ಹಡಗು ನೋಂದಣಿ ನಕಲಿ",
    or:"ଜାହାଜ ପଞ୍ଜିକରଣ ଜାଲିଆତି",
    ml:"കപ്പൽ രജിസ്ട്രേഷൻ വ്യാജം",
    pa:"ਜਹਾਜ਼ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਜਾਲਸਾਜ਼ੀ",
    as:"জাহাজ পঞ্জীয়ন জালিয়াতি",
    sa:"नौकापञ्जीकरणकूटकरणम्"
  },
  sec:"Merchant Shipping Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Oil Spill Concealment",
    hi:"तेल रिसाव छुपाना",
    bn:"তেল ছড়িয়ে পড়া গোপন করা",
    te:"నూనె లీకేజీ దాచడం",
    mr:"तेल गळती लपवणे",
    ta:"எண்ணெய் கசிவு மறைத்தல்",
    gu:"તેલ રિસાવ છુપાવવું",
    ur:"تیل کے رساؤ کو چھپانا",
    kn:"ಎಣ್ಣೆ ಸೋರಿಕೆಯನ್ನು ಮುಚ್ಚಿಡುವುದು",
    or:"ତେଲ ଝରିବାକୁ ଲୁଚାଇବା",
    ml:"എണ്ണ ചോർച്ച മറച്ചുവയ്ക്കൽ",
    pa:"ਤੇਲ ਰਿਸਾਅ ਛੁਪਾਉਣਾ",
    as:"তেল নিঃসৰণ গোপন কৰা",
    sa:"तैलस्रावगोपनम्"
  },
  sec:"Marine Pollution Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Illegal Spectrum Usage",
    hi:"अवैध स्पेक्ट्रम उपयोग",
    bn:"অবৈধ স্পেকট্রাম ব্যবহার",
    te:"అక్రమ స్పెక్ట్రమ్ వినియోగం",
    mr:"बेकायदेशीर स्पेक्ट्रम वापर",
    ta:"சட்டவிரோத அலைவரிசை பயன்பாடு",
    gu:"અવૈધ સ્પેક્ટ્રમ ઉપયોગ",
    ur:"غیر قانونی اسپیکٹرم استعمال",
    kn:"ಅಕ್ರಮ ಸ್ಪೆಕ್ಟ್ರಮ್ ಬಳಕೆ",
    or:"ଅବୈଧ ସ୍ପେକ୍ଟ୍ରମ୍ ବ୍ୟବହାର",
    ml:"നിയമവിരുദ്ധ സ്പെക്ട്രം ഉപയോഗം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਸਪੈਕਟ੍ਰਮ ਵਰਤੋਂ",
    as:"অবৈধ স্পেকট্ৰাম ব্যৱহাৰ",
    sa:"अवैधस्पेक्ट्रमप्रयोगः"
  },
  sec:"Telecom Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Radio Frequency Jamming",
    hi:"रेडियो आवृत्ति जैमिंग",
    bn:"রেডিও ফ্রিকোয়েন্সি জ্যামিং",
    te:"రేడియో ఫ్రీక్వెన్సీ జ్యామింగ్",
    mr:"रेडिओ फ्रिक्वेन्सी जॅमिंग",
    ta:"ரேடியோ அலை குறுக்கீடு",
    gu:"રેડિયો ફ્રિક્વન્સી જામિંગ",
    ur:"ریڈیو فریکوئنسی جامنگ",
    kn:"ರೇಡಿಯೋ ಫ್ರೀಕ್ವೆನ್ಸಿ ಜ್ಯಾಮಿಂಗ್",
    or:"ରେଡିଓ ଫ୍ରିକ୍ୱେନ୍ସି ଜ୍ୟାମିଂ",
    ml:"റേഡിയോ ഫ്രീക്വൻസി ജാമിംഗ്",
    pa:"ਰੇਡੀਓ ਫ੍ਰਿਕਵੈਂਸੀ ਜੈਮਿੰਗ",
    as:"ৰেডিঅ’ ফ্ৰিকুৱেন্সী জেমিং",
    sa:"रेडियोआवृत्तिनिरोधः"
  },
  sec:"Wireless Telegraphy Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Emergency Signal Misuse",
    hi:"आपातकालीन सिग्नल का दुरुपयोग",
    bn:"জরুরি সংকেতের অপব্যবহার",
    te:"అత్యవసర సంకేతం దుర్వినియోగం",
    mr:"आपत्कालीन सिग्नलचा गैरवापर",
    ta:"அவசர சிக்னல் தவறான பயன்பாடு",
    gu:"આપાતકાલીન સિગ્નલનો દુરુપયોગ",
    ur:"ہنگامی سگنل کا غلط استعمال",
    kn:"ತುರ್ತು ಸಿಗ್ನಲ್ ದುರುಪಯೋಗ",
    or:"ଜରୁରୀ ସଙ୍କେତର ଦୁରୁପଯୋଗ",
    ml:"അത്യാവശ്യ സിഗ്നൽ ദുരുപയോഗം",
    pa:"ਐਮਰਜੈਂਸੀ ਸਿਗਨਲ ਦੀ ਗਲਤ ਵਰਤੋਂ",
    as:"জৰুৰী সংকেতৰ অপব্যৱহাৰ",
    sa:"आपत्संकेतदुरुपयोगः"
  },
  sec:"Telecom Rules",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Broadcast Station",
    hi:"अवैध प्रसारण केंद्र",
    bn:"অবৈধ সম্প্রচার কেন্দ্র",
    te:"అక్రమ ప్రసార కేంద్రం",
    mr:"बेकायदेशीर प्रसारण केंद्र",
    ta:"சட்டவிரோத ஒளிபரப்பு நிலையம்",
    gu:"અવૈધ પ્રસારણ કેન્દ્ર",
    ur:"غیر قانونی نشریاتی اسٹیشن",
    kn:"ಅಕ್ರಮ ಪ್ರಸಾರ ಕೇಂದ್ರ",
    or:"ଅବୈଧ ପ୍ରସାରଣ କେନ୍ଦ୍ର",
    ml:"നിയമവിരുദ്ധ പ്രക്ഷേപണ കേന്ദ്രം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਪ੍ਰਸਾਰਣ ਕੇਂਦਰ",
    as:"অবৈধ প্ৰচাৰ কেন্দ্ৰ",
    sa:"अवैधप्रसारणकेन्द्रम्"
  },
  sec:"Broadcasting Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake TV Channel Operation",
    hi:"फर्जी टीवी चैनल संचालन",
    bn:"ভুয়া টিভি চ্যানেল পরিচালনা",
    te:"నకిలీ టీవీ ఛానల్ నిర్వహణ",
    mr:"बनावट टीव्ही चॅनल संचालन",
    ta:"போலி டிவி சேனல் இயக்கம்",
    gu:"નકલી ટીવી ચેનલ સંચાલન",
    ur:"جعلی ٹی وی چینل آپریشن",
    kn:"ನಕಲಿ ಟಿವಿ ಚಾನೆಲ್ ಕಾರ್ಯಾಚರಣೆ",
    or:"ଭୁଆ ଟିଭି ଚ୍ୟାନେଲ୍ ସଞ୍ଚାଳନ",
    ml:"വ്യാജ ടിവി ചാനൽ പ്രവർത്തനം",
    pa:"ਨਕਲੀ ਟੀਵੀ ਚੈਨਲ ਚਲਾਉਣਾ",
    as:"ভুৱা টিভি চেনেল পৰিচালনা",
    sa:"कूटदूरदर्शनचैनलसञ्चालनम्"
  },
  sec:"Broadcasting Rules",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Copyright Infringement Software",
    hi:"सॉफ़्टवेयर कॉपीराइट उल्लंघन",
    bn:"সফটওয়্যার কপিরাইট লঙ্ঘন",
    te:"సాఫ్ట్‌వేర్ కాపీరైట్ ఉల్లంఘన",
    mr:"सॉफ्टवेअर कॉपीराइट उल्लंघन",
    ta:"மென்பொருள் காப்புரிமை மீறல்",
    gu:"સોફ્ટવેર કૉપિરાઇટ ભંગ",
    ur:"سافٹ ویئر کاپی رائٹ خلاف ورزی",
    kn:"ಸಾಫ್ಟ್‌ವೇರ್ ಕಾಪಿರೈಟ್ ಉಲ್ಲಂಘನೆ",
    or:"ସଫ୍ଟୱେୟାର କପିରାଇଟ୍ ଉଲ୍ଲଂଘନ",
    ml:"സോഫ്റ്റ്‌വെയർ കാപിറൈറ്റ് ലംഘനം",
    pa:"ਸਾਫਟਵੇਅਰ ਕਾਪੀਰਾਈਟ ਉਲੰਘਣਾ",
    as:"চফ্টৱেৰ কপিৰাইট লঙ্ঘন",
    sa:"तन्त्रांशस्वाम्यधिकारभङ्गः"
  },
  sec:"Copyright Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Patent Infringement",
    hi:"पेटेंट उल्लंघन",
    bn:"পেটেন্ট লঙ্ঘন",
    te:"పేటెంట్ ఉల్లంఘన",
    mr:"पेटंट उल्लंघन",
    ta:"பேட்டென்ட் மீறல்",
    gu:"પેટન્ટ ભંગ",
    ur:"پیٹنٹ کی خلاف ورزی",
    kn:"ಪೇಟೆಂಟ್ ಉಲ್ಲಂಘನೆ",
    or:"ପେଟେଣ୍ଟ ଉଲ୍ଲଂଘନ",
    ml:"പേറ്റന്റ് ലംഘനം",
    pa:"ਪੇਟੈਂਟ ਉਲੰਘਣਾ",
    as:"পেটেন্ট লঙ্ঘন",
    sa:"पेटेंटभङ्गः"
  },
  sec:"Patent Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Trademark Counterfeiting",
    hi:"ट्रेडमार्क जालसाजी",
    bn:"ট্রেডমার্ক জালিয়াতি",
    te:"ట్రేడ్‌మార్క్ నకిలీ",
    mr:"ट्रेडमार्क बनावट",
    ta:"வர்த்தக முத்திரை போலி",
    gu:"ટ્રેડમાર્ક નકલી",
    ur:"ٹریڈ مارک جعلسازی",
    kn:"ಟ್ರೇಡ್‌ಮಾರ್ಕ್ ನಕಲಿ",
    or:"ଟ୍ରେଡମାର୍କ ଜାଲିଆତି",
    ml:"ട്രേഡ്മാർക്ക് വ്യാജം",
    pa:"ਟ੍ਰੇਡਮਾਰਕ ਜਾਲਸਾਜ਼ੀ",
    as:"ট্ৰেডমাৰ্ক জালিয়াতি",
    sa:"व्यापारचिह्नकूटकरणम्"
  },
  sec:"Trademark Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Pirated OTT Streaming",
    hi:"पायरेटेड OTT स्ट्रीमिंग",
    bn:"পাইরেটেড OTT স্ট্রিমিং",
    te:"పైరేటెడ్ OTT స్ట్రీమింగ్",
    mr:"पायरेटेड OTT स्ट्रीमिंग",
    ta:"பைரேட் OTT ஸ்ட்ரீமிங்",
    gu:"પાયરેટેડ OTT સ્ટ્રીમિંગ",
    ur:"پائریٹڈ OTT اسٹریمنگ",
    kn:"ಪೈರೇಟೆಡ್ OTT ಸ್ಟ್ರೀಮಿಂಗ್",
    or:"ପାଇରେଟେଡ୍ OTT ସ୍ଟ୍ରିମିଂ",
    ml:"പൈറേറ്റഡ് OTT സ്ട്രീമിംഗ്",
    pa:"ਪਾਇਰੇਟਡ OTT ਸਟ੍ਰੀਮਿੰਗ",
    as:"পাইৰেটেড OTT ষ্ট্ৰিমিং",
    sa:"अवैधOTTप्रसारणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal IPTV Distribution",
    hi:"अवैध IPTV वितरण",
    bn:"অবৈধ IPTV বিতরণ",
    te:"అక్రమ IPTV పంపిణీ",
    mr:"बेकायदेशीर IPTV वितरण",
    ta:"சட்டவிரோத IPTV விநியோகம்",
    gu:"અવૈધ IPTV વિતરણ",
    ur:"غیر قانونی IPTV تقسیم",
    kn:"ಅಕ್ರಮ IPTV ವಿತರಣೆ",
    or:"ଅବୈଧ IPTV ବିତରଣ",
    ml:"നിയമവിരുദ്ധ IPTV വിതരണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ IPTV ਵੰਡ",
    as:"অবৈধ IPTV বিতৰণ",
    sa:"अवैधIPTVवितरणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Fake News Channel Funding",
    hi:"फर्जी समाचार चैनल वित्तपोषण",
    bn:"ভুয়া সংবাদ চ্যানেল অর্থায়ন",
    te:"నకిలీ వార్తా ఛానల్ నిధులు",
    mr:"बनावट न्यूज चॅनल वित्तपुरवठा",
    ta:"பொய் செய்தி சேனல் நிதியியல்",
    gu:"નકલી સમાચાર ચેનલ નાણાંકીય સહાય",
    ur:"جعلی نیوز چینل کی فنڈنگ",
    kn:"ನಕಲಿ ಸುದ್ದಿ ಚಾನೆಲ್ ಹಣಕಾಸು",
    or:"ଭୁଆ ଖବର ଚ୍ୟାନେଲ୍ ଅର୍ଥସହାୟତା",
    ml:"വ്യാജ വാർത്താ ചാനൽ ധനസഹായം",
    pa:"ਨਕਲੀ ਨਿਊਜ਼ ਚੈਨਲ ਫੰਡਿੰਗ",
    as:"ভুৱা সংবাদ চেনেল অৰ্থায়ন",
    sa:"कूटसमाचारवाहिन्याः वित्तपोषणम्"
  },
  sec:"IPC / IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Paid News Manipulation",
    hi:"पेड न्यूज़ में हेरफेर",
    bn:"পেইড নিউজ কারসাজি",
    te:"చెల్లింపు వార్తల మోసం",
    mr:"पेड न्यूज फेरफार",
    ta:"பணம் வாங்கி செய்தி மாற்றம்",
    gu:"પેઈડ ન્યૂઝ હેરફેર",
    ur:"ادا شدہ خبروں میں رد و بدل",
    kn:"ಪೇಡ್ ನ್ಯೂಸ್ ಮ್ಯಾನಿಪ್ಯುಲೇಶನ್",
    or:"ପେଇଡ୍ ନ୍ୟୁଜ୍ ହେରାଫେରି",
    ml:"പെയ്ഡ് ന്യൂസ് കൃത്രിമം",
    pa:"ਪੇਡ ਨਿਊਜ਼ ਹੇਰਾਫੇਰੀ",
    as:"পেইড নিউজ হেৰফেৰ",
    sa:"वेतनसमाचारविकृति"
  },
  sec:"IPC",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Media Blackmail",
    hi:"मीडिया ब्लैकमेल",
    bn:"মিডিয়া ব্ল্যাকমেইল",
    te:"మీడియా బ్లాక్‌మెయిల్",
    mr:"मीडिया ब्लॅकमेल",
    ta:"ஊடக மிரட்டல்",
    gu:"મીડિયા બ્લેકમેઇલ",
    ur:"میڈیا بلیک میل",
    kn:"ಮಾಧ್ಯಮ ಬ್ಲ್ಯಾಕ್‌ಮೇಲ್",
    or:"ମିଡିଆ ବ୍ଲାକମେଲ୍",
    ml:"മാധ്യമ ബ്ലാക്ക്മെയിൽ",
    pa:"ਮੀਡੀਆ ਬਲੈਕਮੇਲ",
    as:"মিডিয়া ব্লেকমেইল",
    sa:"माध्यमब्लैकमेलः"
  },
  sec:"IPC 384",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"TRP Rating Manipulation",
    hi:"टीआरपी रेटिंग में हेरफेर",
    bn:"টিআরপি রেটিং কারসাজি",
    te:"TRP రేటింగ్ మోసం",
    mr:"TRP रेटिंग फेरफार",
    ta:"TRP மதிப்பீடு மாற்றம்",
    gu:"TRP રેટિંગ હેરફેર",
    ur:"ٹی آر پی ریٹنگ میں رد و بدل",
    kn:"TRP ರೇಟಿಂಗ್ ಮ್ಯಾನಿಪ್ಯುಲೇಶನ್",
    or:"TRP ରେଟିଂ ହେରାଫେରି",
    ml:"TRP റേറ്റിംഗ് കൃത്രിമം",
    pa:"TRP ਰੇਟਿੰਗ ਹੇਰਾਫੇਰੀ",
    as:"TRP ৰেটিং হেৰফেৰ",
    sa:"TRPमूल्यांकनविकृति"
  },
  sec:"Broadcasting Rules",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Press Accreditation",
    hi:"अनधिकृत प्रेस मान्यता",
    bn:"অননুমোদিত প্রেস স্বীকৃতি",
    te:"అనుమతి లేని ప్రెస్ గుర్తింపు",
    mr:"अनधिकृत प्रेस मान्यता",
    ta:"அனுமதி இல்லா பத்திரிகை அங்கீகாரம்",
    gu:"અનધિકૃત પ્રેસ માન્યતા",
    ur:"غیر مجاز پریس منظوری",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಪ್ರೆಸ್ ಮಾನ್ಯತೆ",
    or:"ଅନଧିକୃତ ପ୍ରେସ୍ ମାନ୍ୟତା",
    ml:"അനുമതിയില്ലാത്ത പത്ര അംഗീകാരം",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਪ੍ਰੈਸ ਮਾਨਤਾ",
    as:"অনুমতি নথকা প্ৰেছ স্বীকৃতি",
    sa:"अनधिकृतपत्रमान्यता"
  },
  sec:"Press Rules",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Illegal Space Object Tracking",
    hi:"अवैध अंतरिक्ष वस्तु ट्रैकिंग",
    bn:"অবৈধ মহাকাশ বস্তু পর্যবেক্ষণ",
    te:"అక్రమ అంతరిక్ష వస్తు ట్రాకింగ్",
    mr:"बेकायदेशीर अंतराळ वस्तू निरीक्षण",
    ta:"சட்டவிரோத விண்வெளி கண்காணிப்பு",
    gu:"અવૈધ અવકાશી પદાર્થ ટ્રેકિંગ",
    ur:"غیر قانونی خلائی نگرانی",
    kn:"ಅಕ್ರಮ ಬಾಹ್ಯಾಕಾಶ ವಸ್ತು ನಿಗಾವಳಿ",
    or:"ଅବୈଧ ଅନ୍ତରିକ୍ଷ ନିରୀକ୍ଷଣ",
    ml:"നിയമവിരുദ്ധ ബഹിരാകാശ നിരീക്ഷണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਅੰਤਰਿਕਸ਼ ਨਿਗਰਾਨੀ",
    as:"অবৈধ মহাকাশ পৰ্যবেক্ষণ",
    sa:"अवैधान्तरिक्षनिगमनम्"
  },
  sec:"Space Activities Bill",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Satellite Signal Hijacking",
    hi:"उपग्रह सिग्नल अपहरण",
    bn:"স্যাটেলাইট সিগন্যাল ছিনতাই",
    te:"ఉపగ్రహ సిగ్నల్ హైజాకింగ్",
    mr:"उपग्रह सिग्नल अपहरण",
    ta:"செயற்கைக்கோள் சிக்னல் கடத்தல்",
    gu:"સેટેલાઇટ સિગ્નલ હાઇજેકિંગ",
    ur:"سیٹلائٹ سگنل ہائی جیکنگ",
    kn:"ಉಪಗ್ರಹ ಸಿಗ್ನಲ್ ಅಪಹರಣ",
    or:"ଉପଗ୍ରହ ସିଗ୍ନାଲ୍ ହାଇଜାକ୍",
    ml:"ഉപഗ്രഹ സിഗ്നൽ അപഹരണം",
    pa:"ਸੈਟੇਲਾਈਟ ਸਿਗਨਲ ਹਾਈਜੈਕ",
    as:"উপগ্ৰহ সংকেত অপহৰণ",
    sa:"उपग्रहसंकेतापहरणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Satellite Launch Support",
    hi:"अनधिकृत उपग्रह प्रक्षेपण सहायता",
    bn:"অননুমোদিত স্যাটেলাইট উৎক্ষেপণ সহায়তা",
    te:"అనుమతి లేని ఉపగ్రహ ప్రయోగ సహాయం",
    mr:"अनधिकृत उपग्रह प्रक्षेपण सहाय्य",
    ta:"அனுமதி இல்லா செயற்கைக்கோள் ஏவுதல் உதவி",
    gu:"અનધિકૃત સેટેલાઇટ લોન્ચ સહાય",
    ur:"غیر مجاز سیٹلائٹ لانچ مدد",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಉಪಗ್ರಹ ಉಡಾವಣೆ ಸಹಾಯ",
    or:"ଅନଧିକୃତ ଉପଗ୍ରହ ଉଡାଣ ସହାୟତା",
    ml:"അനുമതിയില്ലാത്ത ഉപഗ്രഹ വിക്ഷേപണ സഹായം",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਸੈਟੇਲਾਈਟ ਲਾਂਚ ਸਹਾਇਤਾ",
    as:"অনুমতি নথকা উপগ্ৰহ উৎক্ষেপণ সহায়তা",
    sa:"अनधिकृतउपग्रहप्रक्षेपणसहायता"
  },
  sec:"Space Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Space Data Leakage",
    hi:"अंतरिक्ष डेटा रिसाव",
    bn:"মহাকাশ ডেটা ফাঁস",
    te:"అంతరిక్ష డేటా లీక్",
    mr:"अंतराळ डेटा गळती",
    ta:"விண்வெளி தரவு கசிவு",
    gu:"અવકાશ ડેટા લીકેજ",
    ur:"خلائی ڈیٹا لیک",
    kn:"ಬಾಹ್ಯಾಕಾಶ ಡೇಟಾ ಸೋರಿಕೆ",
    or:"ଅନ୍ତରିକ୍ଷ ତଥ୍ୟ ଲିକ୍",
    ml:"ബഹിരാകാശ ഡാറ്റ ചോർച്ച",
    pa:"ਅੰਤਰਿਕਸ਼ ਡਾਟਾ ਲੀਕ",
    as:"মহাকাশ ডাটা লিক",
    sa:"अन्तरिक्षदत्तांशस्रावः"
  },
  sec:"Official Secrets Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Space Imaging Sale",
    hi:"अवैध अंतरिक्ष चित्र बिक्री",
    bn:"অবৈধ মহাকাশ চিত্র বিক্রয়",
    te:"అక్రమ అంతరిక్ష చిత్ర విక్రయం",
    mr:"बेकायदेशीर अंतराळ प्रतिमा विक्री",
    ta:"சட்டவிரோத விண்வெளி பட விற்பனை",
    gu:"અવૈધ અવકાશી છબી વેચાણ",
    ur:"غیر قانونی خلائی تصاویر کی فروخت",
    kn:"ಅಕ್ರಮ ಬಾಹ್ಯಾಕಾಶ ಚಿತ್ರ ಮಾರಾಟ",
    or:"ଅବୈଧ ଅନ୍ତରିକ୍ଷ ଚିତ୍ର ବିକ୍ରୟ",
    ml:"നിയമവിരുദ്ധ ബഹിരാകാശ ചിത്ര വിൽപ്പന",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਅੰਤਰਿਕਸ਼ ਚਿੱਤਰ ਵਿਕਰੀ",
    as:"অবৈধ মহাকাশ ছবি বিক্ৰী",
    sa:"अवैधान्तरिक्षचित्रविक्रयः"
  },
  sec:"Space Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Fake Government Website",
    hi:"फर्जी सरकारी वेबसाइट",
    bn:"ভুয়া সরকারি ওয়েবসাইট",
    te:"నకిలీ ప్రభుత్వ వెబ్‌సైట్",
    mr:"बनावट सरकारी वेबसाइट",
    ta:"போலி அரசு இணையதளம்",
    gu:"નકલી સરકારી વેબસાઇટ",
    ur:"جعلی سرکاری ویب سائٹ",
    kn:"ನಕಲಿ ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್",
    or:"ଭୁଆ ସରକାରୀ ୱେବସାଇଟ୍",
    ml:"വ്യാജ സർക്കാർ വെബ്സൈറ്റ്",
    pa:"ਨਕਲੀ ਸਰਕਾਰੀ ਵੈੱਬਸਾਈਟ",
    as:"ভুৱা চৰকাৰী ৱেবছাইট",
    sa:"कूटसरकारीजालस्थलम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Government Logo Use",
    hi:"सरकारी लोगो का अनधिकृत उपयोग",
    bn:"সরকারি লোগোর অননুমোদিত ব্যবহার",
    te:"ప్రభుత్వ లోగో అనధికార వినియోగం",
    mr:"सरकारी लोगोचा अनधिकृत वापर",
    ta:"அரசு லோகோ அனுமதி இல்லா பயன்பாடு",
    gu:"સરકારી લોગોનો અનધિકૃત ઉપયોગ",
    ur:"سرکاری لوگو کا غیر مجاز استعمال",
    kn:"ಸರ್ಕಾರಿ ಲೋಗೋ ಅನಧಿಕೃತ ಬಳಕೆ",
    or:"ସରକାରୀ ଲୋଗୋର ଅନଧିକୃତ ବ୍ୟବହାର",
    ml:"സർക്കാർ ലോഗോയുടെ അനധികൃത ഉപയോഗം",
    pa:"ਸਰਕਾਰੀ ਲੋਗੋ ਦੀ ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਵਰਤੋਂ",
    as:"চৰকাৰী লোগোৰ অননুমোদিত ব্যৱহাৰ",
    sa:"सरकारीचिह्नस्य अनधिकृतप्रयोगः"
  },
  sec:"Emblems Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Forged Government Notification",
    hi:"फर्जी सरकारी अधिसूचना",
    bn:"ভুয়া সরকারি বিজ্ঞপ্তি",
    te:"నకిలీ ప్రభుత్వ నోటిఫికేషన్",
    mr:"बनावट सरकारी अधिसूचना",
    ta:"போலி அரசு அறிவிப்பு",
    gu:"નકલી સરકારી જાહેરનામું",
    ur:"جعلی سرکاری نوٹیفکیشن",
    kn:"ನಕಲಿ ಸರ್ಕಾರಿ ಅಧಿಸೂಚನೆ",
    or:"ଭୁଆ ସରକାରୀ ଘୋଷଣା",
    ml:"വ്യാജ സർക്കാർ വിജ്ഞാപനം",
    pa:"ਨਕਲੀ ਸਰਕਾਰੀ ਸੂਚਨਾ",
    as:"ভুৱা চৰকাৰী অধিসূচনা",
    sa:"कूटसरकारीअधिसूचना"
  },
  sec:"IPC 466",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Gazette Publication",
    hi:"फर्जी राजपत्र प्रकाशन",
    bn:"ভুয়া গেজেট প্রকাশনা",
    te:"నకిలీ గెజిట్ ప్రచురణ",
    mr:"बनावट राजपत्र प्रकाशन",
    ta:"போலி கசேட் வெளியீடு",
    gu:"નકલી ગેઝેટ પ્રકાશન",
    ur:"جعلی گزٹ اشاعت",
    kn:"ನಕಲಿ ಗಜೇಟ್ ಪ್ರಕಟಣೆ",
    or:"ଭୁଆ ଗଜେଟ୍ ପ୍ରକାଶନ",
    ml:"വ്യാജ ഗസറ്റ് പ്രസിദ്ധീകരണം",
    pa:"ਨਕਲੀ ਗਜ਼ਟ ਪ੍ਰਕਾਸ਼ਨ",
    as:"ভুৱা গেজেট প্ৰকাশন",
    sa:"कूटराजपत्रप्रकाशनम्"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Misuse of National Symbols",
    hi:"राष्ट्रीय प्रतीकों का दुरुपयोग",
    bn:"জাতীয় প্রতীকের অপব্যবহার",
    te:"జాతీయ చిహ్నాల దుర్వినియోగం",
    mr:"राष्ट्रीय चिन्हांचा गैरवापर",
    ta:"தேசிய சின்னங்கள் தவறான பயன்பாடு",
    gu:"રાષ્ટ્રીય ચિહ્નોનો દુરુપયોગ",
    ur:"قومی علامات کا غلط استعمال",
    kn:"ರಾಷ್ಟ್ರೀಯ ಚಿಹ್ನೆಗಳ ದುರುಪಯೋಗ",
    or:"ଜାତୀୟ ପ୍ରତୀକର ଦୁରୁପଯୋଗ",
    ml:"ദേശീയ ചിഹ്നങ്ങളുടെ ദുരുപയോഗം",
    pa:"ਰਾਸ਼ਟਰੀ ਨਿਸ਼ਾਨਾਂ ਦੀ ਗਲਤ ਵਰਤੋਂ",
    as:"ৰাষ্ট্ৰীয় চিহ্নৰ অপব্যৱহাৰ",
    sa:"राष्ट्रीयचिह्नदुरुपयोगः"
  },
  sec:"Prevention of Insults Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Census Data Tampering",
    hi:"जनगणना डेटा में छेड़छाड़",
    bn:"জনগণনা তথ্য বিকৃতি",
    te:"జనగణన డేటా మార్పు",
    mr:"जनगणना डेटामध्ये छेडछाड",
    ta:"மக்கள் தொகை தரவு மாற்றம்",
    gu:"જનગણના ડેટામાં છેડછાડ",
    ur:"مردم شماری ڈیٹا میں چھیڑ چھاڑ",
    kn:"ಜನಗಣತಿ ಡೇಟಾ ಮಾರ್ಪಾಡು",
    or:"ଜନଗଣନା ତଥ୍ୟ ଛେଡ଼ଛାଡ଼",
    ml:"ജനഗണന ഡാറ്റ കൃത്രിമം",
    pa:"ਜਨਗਣਨਾ ਡਾਟਾ ਨਾਲ ਛੇੜਛਾੜ",
    as:"জনগণনা তথ্য বিকৃতি",
    sa:"जनगणनादत्तांशविकृति"
  },
  sec:"Census Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Election Booth Capturing",
    hi:"चुनाव बूथ पर कब्जा",
    bn:"নির্বাচনী বুথ দখল",
    te:"ఎన్నికల బూత్ ఆక్రమణ",
    mr:"निवडणूक बूथ ताबा",
    ta:"வாக்குச்சாவடி கைப்பற்றல்",
    gu:"મતદાન મથક કબજા",
    ur:"انتخابی بوتھ پر قبضہ",
    kn:"ಚುನಾವಣೆ ಬೂತ್ ವಶಪಡಿಕೆ",
    or:"ଭୋଟକେନ୍ଦ୍ର ଦଖଲ",
    ml:"തിരഞ്ഞെടുപ്പ് ബൂത്ത് കൈയേറ്റം",
    pa:"ਚੋਣ ਬੂਥ ਕਬਜ਼ਾ",
    as:"ভোটকেন্দ্ৰ দখল",
    sa:"निर्वाचनकेन्द्रअपहरणम्"
  },
  sec:"RP Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Voter Slip Distribution",
    hi:"फर्जी मतदाता पर्ची वितरण",
    bn:"ভুয়া ভোটার স্লিপ বিতরণ",
    te:"నకిలీ ఓటరు స్లిప్ పంపిణీ",
    mr:"बनावट मतदार चिठ्ठी वाटप",
    ta:"போலி வாக்காளர் சீட்டு விநியோகம்",
    gu:"નકલી મતદાર સ્લિપ વિતરણ",
    ur:"جعلی ووٹر سلپ تقسیم",
    kn:"ನಕಲಿ ಮತದಾರ ಸ್ಲಿಪ್ ವಿತರಣೆ",
    or:"ଭୁଆ ଭୋଟର୍ ସ୍ଲିପ୍ ବଣ୍ଟନ",
    ml:"വ്യാജ വോട്ടർ സ്ലിപ്പ് വിതരണം",
    pa:"ਨਕਲੀ ਵੋਟਰ ਸਲਿਪ ਵੰਡ",
    as:"ভুৱা ভোটাৰ স্লিপ বিতৰণ",
    sa:"कूटमतदाता-पत्रवितरणम्"
  },
  sec:"RP Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Electronic Voting Machine Tampering",
    hi:"ईवीएम से छेड़छाड़",
    bn:"ইভিএম কারসাজি",
    te:"ఈవీఎం మార్పు",
    mr:"ईव्हीएम छेडछाड",
    ta:"EVM மாற்றம்",
    gu:"EVM છેડછાડ",
    ur:"ای وی ایم میں چھیڑ چھاڑ",
    kn:"EVM ಮಾರ್ಪಾಡು",
    or:"EVM ଛେଡ଼ଛାଡ଼",
    ml:"ഇവിഎം കൃത്രിമം",
    pa:"EVM ਨਾਲ ਛੇੜਛਾੜ",
    as:"EVM বিকৃতি",
    sa:"मतयन्त्रविकृति"
  },
  sec:"RP Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Opinion Poll Publication",
    hi:"अवैध जनमत सर्वेक्षण प्रकाशन",
    bn:"অবৈধ মতামত জরিপ প্রকাশ",
    te:"అక్రమ అభిప్రాయ సర్వే ప్రచురణ",
    mr:"बेकायदेशीर जनमत सर्वेक्षण प्रकाशन",
    ta:"சட்டவிரோத கருத்துக் கணிப்பு வெளியீடு",
    gu:"અવૈધ મત સર્વે પ્રકાશન",
    ur:"غیر قانونی رائے شماری اشاعت",
    kn:"ಅಕ್ರಮ ಅಭಿಪ್ರಾಯ ಸಮೀಕ್ಷೆ ಪ್ರಕಟಣೆ",
    or:"ଅବୈଧ ମତାମତ ସର୍ବେ ପ୍ରକାଶନ",
    ml:"നിയമവിരുദ്ധ അഭിപ്രായ സർവേ പ്രസിദ്ധീകരണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਰਾਇ ਸਰਵੇ ਪ੍ਰਕਾਸ਼ਨ",
    as:"অবৈধ মতামত সমীক্ষা প্ৰকাশ",
    sa:"अवैधमतसर्वेक्षणप्रकाशनम्"
  },
  sec:"RP Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},
{
  name:{
    en:"International Treaty Violation",
    hi:"अंतरराष्ट्रीय संधि उल्लंघन",
    bn:"আন্তর্জাতিক চুক্তি লঙ্ঘন",
    te:"అంతర్జాతీయ ఒప్పందం ఉల్లంఘన",
    mr:"आंतरराष्ट्रीय करार उल्लंघन",
    ta:"சர்வதேச உடன்படிக்கை மீறல்",
    gu:"આંતરરાષ્ટ્રીય કરાર ઉલ્લંઘન",
    ur:"بین الاقوامی معاہدے کی خلاف ورزی",
    kn:"ಅಂತರರಾಷ್ಟ್ರೀಯ ಒಪ್ಪಂದ ಉಲ್ಲಂಘನೆ",
    or:"ଆନ୍ତର୍ଜାତୀୟ ସନ୍ଦି ଉଲ୍ଲଂଘନ",
    ml:"അന്താരാഷ്ട്ര ഉടമ്പടി ലംഘനം",
    pa:"ਅੰਤਰਰਾਸ਼ਟਰੀ ਸੰਧੀ ਉਲੰਘਣਾ",
    as:"আন্তর্জাতিক চুক্তি লঙ্ঘন",
    sa:"अन्तरराष्ट्रीयसन्धिभङ्गः"
  },
  sec:"IPC / Intl Law",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Arms Transit Through India",
    hi:"भारत के माध्यम से अवैध हथियार पारगमन",
    bn:"ভারতের মাধ্যমে অবৈধ অস্ত্র পরিবহন",
    te:"భారతదేశం ద్వారా అక్రమ ఆయుధ రవాణా",
    mr:"भारतामार्गे बेकायदेशीर शस्त्र वाहतूक",
    ta:"இந்தியா வழியாக சட்டவிரோத ஆயுத கடத்தல்",
    gu:"ભારત મારફતે અવૈધ હથિયાર પરિવહન",
    ur:"بھارت کے ذریعے غیر قانونی اسلحہ ترسیل",
    kn:"ಭಾರತದ ಮೂಲಕ ಅಕ್ರಮ ಆಯುಧ ಸಾಗಣೆ",
    or:"ଭାରତ ମାର୍ଗରେ ଅବୈଧ ଅସ୍ତ୍ର ପରିବହନ",
    ml:"ഇന്ത്യ വഴി അനധികൃത ആയുധ ഗതാഗതം",
    pa:"ਭਾਰਤ ਰਾਹੀਂ ਗੈਰਕਾਨੂੰਨੀ ਹਥਿਆਰ ਆਵਾਜਾਈ",
    as:"ভাৰতৰ জৰিয়তে অবৈধ অস্ত্ৰ পৰিবহন",
    sa:"भारतमार्गेण अवैधायुधपरिवहनम्"
  },
  sec:"Customs Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Foreign Spy Assistance",
    hi:"विदेशी जासूस को सहायता",
    bn:"বিদেশি গুপ্তচর সহায়তা",
    te:"విదేశీ గూఢచారికి సహాయం",
    mr:"परदेशी हेराला मदत",
    ta:"வெளிநாட்டு உளவு உதவி",
    gu:"વિદેશી જાસૂસને સહાય",
    ur:"غیر ملکی جاسوس کی مدد",
    kn:"ವಿದೇಶಿ ಗುಪ್ತಚರಿಗೆ ಸಹಾಯ",
    or:"ବିଦେଶୀ ଗୁପ୍ତଚରକୁ ସହାୟତା",
    ml:"വിദേശ ചാരന് സഹായം",
    pa:"ਵਿਦੇਸ਼ੀ ਜਾਸੂਸ ਦੀ ਮਦਦ",
    as:"বিদেশী গুপ্তচৰক সহায়",
    sa:"विदेशीयगुप्तचरसमर्थनम्"
  },
  sec:"Official Secrets Act",
  punishment:{
    en:"Life imprisonment",hi:"आजीवन कारावास",bn:"যাবজ্জীবন কারাদণ্ড",
    te:"ఆజీవ కారాగారం",mr:"आजीवन कारावास",ta:"ஆயுள் சிறை",
    gu:"આજીવન કેદ",ur:"عمر قید",kn:"ಜೀವಾವಧಿ ಕಾರಾಗೃಹ",
    or:"ଆଜୀବନ କାରାଦଣ୍ଡ",ml:"ആജീവനാന്ത തടവ്",
    pa:"ਉਮਰ ਕੈਦ",as:"আজীৱন কাৰাদণ্ড",sa:"आजीवनकारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Diplomatic Communication",
    hi:"अनधिकृत राजनयिक संचार",
    bn:"অননুমোদিত কূটনৈতিক যোগাযোগ",
    te:"అనుమతి లేని దౌత్య సమాచార మార్పిడి",
    mr:"अनधिकृत राजनैतिक संवाद",
    ta:"அனுமதி இல்லா தூதரக தொடர்பு",
    gu:"અનધિકૃત રાજદૂતીય સંચાર",
    ur:"غیر مجاز سفارتی رابطہ",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ರಾಜತಾಂತ್ರಿಕ ಸಂವಹನ",
    or:"ଅନଧିକୃତ କୂଟନୀତିକ ସଂଯୋଗ",
    ml:"അനധികൃത നയതന്ത്ര ആശയവിനിമയം",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਕੂਟਨੀਤਿਕ ਸੰਚਾਰ",
    as:"অননুমোদিত কূটনৈতিক যোগাযোগ",
    sa:"अनधिकृतराजनयिकसंवादः"
  },
  sec:"Official Secrets Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Cross-border Cyber Warfare Support",
    hi:"सीमा पार साइबर युद्ध सहायता",
    bn:"সীমান্তপারের সাইবার যুদ্ধ সহায়তা",
    te:"సరిహద్దు దాటి సైబర్ యుద్ధ సహాయం",
    mr:"सीमापार सायबर युद्ध मदत",
    ta:"எல்லை தாண்டிய சைபர் போர் உதவி",
    gu:"સીમા પાર સાયબર યુદ્ધ સહાય",
    ur:"سرحد پار سائبر جنگ میں مدد",
    kn:"ಸೀಮಾಪಾರ ಸೈಬರ್ ಯುದ್ಧ ಸಹಾಯ",
    or:"ସୀମାପାର ସାଇବର ଯୁଦ୍ଧ ସହାୟତା",
    ml:"അതിർത്തി കടന്ന സൈബർ യുദ്ധ സഹായം",
    pa:"ਸਰਹੱਦ ਪਾਰ ਸਾਈਬਰ ਜੰਗ ਸਹਾਇਤਾ",
    as:"সীমান্ত পাৰ সাইবাৰ যুদ্ধ সহায়",
    sa:"सीमापारसाइबरयुद्धसमर्थनम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Clinical Trial",
    hi:"फर्जी नैदानिक परीक्षण",
    bn:"ভুয়া ক্লিনিকাল ট্রায়াল",
    te:"నకిలీ క్లినికల్ ట్రయల్",
    mr:"बनावट वैद्यकीय चाचणी",
    ta:"போலி மருத்துவ பரிசோதனை",
    gu:"નકલી ક્લિનિકલ ટ્રાયલ",
    ur:"جعلی طبی آزمائش",
    kn:"ನಕಲಿ ಕ್ಲಿನಿಕಲ್ ಪರೀಕ್ಷೆ",
    or:"ଭୁଆ କ୍ଲିନିକାଲ ପରୀକ୍ଷା",
    ml:"വ്യാജ ക്ലിനിക്കൽ പരീക്ഷണം",
    pa:"ਨਕਲੀ ਕਲੀਨਿਕਲ ਟ੍ਰਾਇਲ",
    as:"ভুৱা ক্লিনিকেল পৰীক্ষা",
    sa:"कूटचिकित्सापरीक्षणम्"
  },
  sec:"Drugs & Cosmetics Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Vaccine Sale",
    hi:"अनधिकृत टीका बिक्री",
    bn:"অননুমোদিত ভ্যাকসিন বিক্রি",
    te:"అనుమతి లేని టీకా విక్రయం",
    mr:"अनधिकृत लस विक्री",
    ta:"அனுமதி இல்லா தடுப்பூசி விற்பனை",
    gu:"અનધિકૃત રસી વેચાણ",
    ur:"غیر مجاز ویکسین فروخت",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಲಸಿಕೆ ಮಾರಾಟ",
    or:"ଅନଧିକୃତ ଟିକା ବିକ୍ରୟ",
    ml:"അനുമതിയില്ലാത്ത വാക്സിൻ വിൽപ്പന",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਟੀਕੇ ਦੀ ਵਿਕਰੀ",
    as:"অননুমোদিত ভেকচিন বিক্ৰী",
    sa:"अनधिकृतटीकाविक्रयः"
  },
  sec:"Drugs Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Medical Insurance Abuse",
    hi:"चिकित्सा बीमा दुरुपयोग",
    bn:"চিকিৎসা বিমা অপব্যবহার",
    te:"వైద్య బీమా దుర్వినియోగం",
    mr:"वैद्यकीय विमा गैरवापर",
    ta:"மருத்துவ காப்பீடு துஷ்பிரயோகம்",
    gu:"મેડિકલ ઇન્શ્યોરન્સ દુરુપયોગ",
    ur:"طبی انشورنس کا غلط استعمال",
    kn:"ವೈದ್ಯಕೀಯ ವಿಮೆ ದುರುಪಯೋಗ",
    or:"ଚିକିତ୍ସା ବୀମା ଦୁରୁପଯୋଗ",
    ml:"മെഡിക്കൽ ഇൻഷുറൻസ് ദുരുപയോഗം",
    pa:"ਮੈਡੀਕਲ ਬੀਮਾ ਦੁਰਵਰਤੋਂ",
    as:"চিকিৎসা বীমা অপব্যৱহাৰ",
    sa:"चिकित्साविमादुरुपयोगः"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Ambulance Service",
    hi:"फर्जी एम्बुलेंस सेवा",
    bn:"ভুয়া অ্যাম্বুলেন্স পরিষেবা",
    te:"నకిలీ అంబులెన్స్ సేవ",
    mr:"बनावट रुग्णवाहिका सेवा",
    ta:"போலி ஆம்புலன்ஸ் சேவை",
    gu:"નકલી એમ્બ્યુલન્સ સેવા",
    ur:"جعلی ایمبولینس سروس",
    kn:"ನಕಲಿ ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆ",
    or:"ଭୁଆ ଆମ୍ବୁଲାନ୍ସ ସେବା",
    ml:"വ്യാജ ആംബുലൻസ് സേവനം",
    pa:"ਨਕਲੀ ਐਂਬੂਲੈਂਸ ਸੇਵਾ",
    as:"ভুৱা এম্বুলেন্স সেৱা",
    sa:"कूटरुग्णवाहनसेवा"
  },
  sec:"Motor Vehicles Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Organ Storage",
    hi:"अवैध अंग भंडारण",
    bn:"অবৈধ অঙ্গ সংরক্ষণ",
    te:"అక్రమ అవయవ నిల్వ",
    mr:"बेकायदेशीर अवयव साठवणूक",
    ta:"சட்டவிரோத உறுப்பு சேமிப்பு",
    gu:"અવૈધ અંગ સંગ્રહ",
    ur:"غیر قانونی اعضاء ذخیرہ",
    kn:"ಅಕ್ರಮ ಅಂಗ ಸಂಗ್ರಹ",
    or:"ଅବୈଧ ଅଙ୍ଗ ସଂରକ୍ଷଣ",
    ml:"അനധികൃത അവയവ സംഭരണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਅੰਗ ਸਟੋਰੇਜ",
    as:"অবৈধ অঙ্গ সংৰক্ষণ",
    sa:"अवैधाङ्गसंग्रहः"
  },
  sec:"THOA Act",
  punishment:{
    en:"Rigorous imprisonment",hi:"कठोर कारावास",bn:"সশ্রম কারাদণ্ড",
    te:"కఠిన కారాగారం",mr:"कठोर कारावास",ta:"கடுமையான சிறை",
    gu:"કઠોર કેદ",ur:"سخت قید",kn:"ಕಠಿಣ ಕಾರಾಗೃಹ",
    or:"କଠୋର କାରାଦଣ୍ଡ",ml:"കർശന തടവ്",
    pa:"ਸਖ਼ਤ ਕੈਦ",as:"কঠোৰ কাৰাদণ্ড",sa:"कठोरकारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Railway Signal Tampering",
    hi:"रेलवे सिग्नल से छेड़छाड़",
    bn:"রেল সিগন্যাল বিকৃতি",
    te:"రైల్వే సిగ్నల్ మార్పు",
    mr:"रेल्वे सिग्नल छेडछाड",
    ta:"ரயில் சிக்னல் மாற்றம்",
    gu:"રેલવે સિગ્નલ ચેડછાડ",
    ur:"ریلوے سگنل میں چھیڑ چھاڑ",
    kn:"ರೈಲ್ವೆ ಸಿಗ್ನಲ್ ತೊಂದರೆ",
    or:"ରେଲୱେ ସିଗ୍ନାଲ୍ ଛେଡ଼ଛାଡ଼",
    ml:"റെയിൽവേ സിഗ്നൽ കൈക്കളി",
    pa:"ਰੇਲਵੇ ਸਿਗਨਲ ਨਾਲ ਛੇੜਛਾੜ",
    as:"ৰেলৱে সংকেত বিকৃতি",
    sa:"रेलमार्गसंकेतविकृतिः"
  },
  sec:"Railways Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Ticketless Group Travel Scam",
    hi:"बिना टिकट सामूहिक यात्रा घोटाला",
    bn:"টিকিট ছাড়া দলগত ভ্রমণ প্রতারণা",
    te:"టికెట్ లేకుండా గుంపు ప్రయాణ మోసం",
    mr:"तिकीटविना सामूहिक प्रवास फसवणूक",
    ta:"குழு டிக்கெட் இல்லா பயணம் மோசடி",
    gu:"ટિકિટ વગર જૂથ મુસાફરી કૌભાંડ",
    ur:"بغیر ٹکٹ گروہی سفر فراڈ",
    kn:"ಟಿಕೆಟ್ ಇಲ್ಲದ ಗುಂಪು ಪ್ರಯಾಣ ಮೋಸ",
    or:"ଟିକେଟ୍ ବିନା ଦଳୀୟ ଯାତ୍ରା ଠକେଇ",
    ml:"ടിക്കറ്റ് ഇല്ലാത്ത സംഘം യാത്ര തട്ടിപ്പ്",
    pa:"ਟਿਕਟ ਬਿਨਾਂ ਸਮੂਹਕ ਯਾਤਰਾ ਧੋਖਾਧੜੀ",
    as:"টিকট নথকা দলীয় ভ্ৰমণ জালিয়াতি",
    sa:"विनाटिकटसमूहयात्राछलनम्"
  },
  sec:"Railways Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Railway Recruitment",
    hi:"फर्जी रेलवे भर्ती",
    bn:"ভুয়া রেলওয়ে নিয়োগ",
    te:"నకిలీ రైల్వే నియామకం",
    mr:"बनावट रेल्वे भरती",
    ta:"போலி ரயில்வே வேலைவாய்ப்பு",
    gu:"નકલી રેલવે ભરતી",
    ur:"جعلی ریلوے بھرتی",
    kn:"ನಕಲಿ ರೈಲ್ವೆ ನೇಮಕಾತಿ",
    or:"ଭୁଆ ରେଲୱେ ନିଯୁକ୍ତି",
    ml:"വ്യാജ റെയിൽവേ നിയമനം",
    pa:"ਨਕਲੀ ਰੇਲਵੇ ਭਰਤੀ",
    as:"ভুৱা ৰেলৱে নিযুক্তি",
    sa:"कूटरेलमार्गनियोजनम्"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Railway Property Theft",
    hi:"रेलवे संपत्ति चोरी",
    bn:"রেলওয়ে সম্পত্তি চুরি",
    te:"రైల్వే ఆస్తి దొంగతనం",
    mr:"रेल्वे मालमत्ता चोरी",
    ta:"ரயில்வே சொத்து திருட்டு",
    gu:"રેલવે મિલકત ચોરી",
    ur:"ریلوے املاک کی چوری",
    kn:"ರೈಲ್ವೆ ಆಸ್ತಿ ಕಳವು",
    or:"ରେଲୱେ ସମ୍ପତ୍ତି ଚୋରି",
    ml:"റെയിൽവേ സ്വത്ത് മോഷണം",
    pa:"ਰੇਲਵੇ ਸੰਪਤੀ ਚੋਰੀ",
    as:"ৰেলৱে সম্পত্তি চুৰি",
    sa:"रेलमार्गसम्पत्तिचौर्यम्"
  },
  sec:"RPUP Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized Track Crossing",
    hi:"अनधिकृत रेल पथ पार करना",
    bn:"অননুমোদিত রেলপথ অতিক্রম",
    te:"అనుమతి లేని ట్రాక్ దాటడం",
    mr:"अनधिकृत रेल्वे मार्ग ओलांडणे",
    ta:"அனுமதி இல்லா தடம் கடத்தல்",
    gu:"અનધિકૃત રેલ ટ્રેક પાર કરવું",
    ur:"غیر مجاز ریلوے پٹری عبور",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಹಳಿ ದಾಟುವುದು",
    or:"ଅନଧିକୃତ ରେଲ୍ ପଥ ଅତିକ୍ରମ",
    ml:"അനുമതിയില്ലാത്ത ട്രാക്ക് കടക്കൽ",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਰੇਲ ਟਰੈਕ ਪਾਰ ਕਰਨਾ",
    as:"অননুমোদিত ৰেলপথ অতিক্ৰম",
    sa:"अनधिकृतरेलपथातिक्रमणम्"
  },
  sec:"Railways Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Fake LPG Agency",
    hi:"फर्जी एलपीजी एजेंसी",
    bn:"ভুয়া এলপিজি এজেন্সি",
    te:"నకిలీ LPG ఏజెన్సీ",
    mr:"बनावट एलपीजी एजन्सी",
    ta:"போலி எரிவாயு முகவர்",
    gu:"નકલી LPG એજન્સી",
    ur:"جعلی ایل پی جی ایجنسی",
    kn:"ನಕಲಿ LPG ಏಜೆನ್ಸಿ",
    or:"ଭୁଆ LPG ଏଜେନ୍ସି",
    ml:"വ്യാജ LPG ഏജൻസി",
    pa:"ਨਕਲੀ LPG ਏਜੰਸੀ",
    as:"ভুৱা LPG এজেন্সি",
    sa:"कूटद्रवीभूतवायुएजेन्सी"
  },
  sec:"Essential Commodities Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Gas Cylinder Refilling",
    hi:"अवैध गैस सिलेंडर रिफिलिंग",
    bn:"অবৈধ গ্যাস সিলিন্ডার ভরাট",
    te:"అక్రమ గ్యాస్ సిలిండర్ రీఫిల్లింగ్",
    mr:"बेकायदेशीर गॅस सिलिंडर भरणे",
    ta:"சட்டவிரோத எரிவாயு நிரப்பு",
    gu:"અવૈધ ગેસ સિલિન્ડર રિફિલિંગ",
    ur:"غیر قانونی گیس سلنڈر بھرائی",
    kn:"ಅಕ್ರಮ ಗ್ಯಾಸ್ ಸಿಲಿಂಡರ್ ಮರುಭರ್ತಿ",
    or:"ଅବୈଧ ଗ୍ୟାସ୍ ସିଲିଣ୍ଡର ପୁନଃଭରଣ",
    ml:"നിയമവിരുദ്ധ ഗ്യാസ് സിലിണ്ടർ നിറയ്ക്കൽ",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਗੈਸ ਸਿਲੰਡਰ ਭਰਨ",
    as:"অবৈধ গেছ চিলিণ্ডাৰ ভৰ্তি",
    sa:"अवैधगैससिलिण्डरपुनर्भरणम्"
  },
  sec:"Explosives Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Petrol Pump Meter Tampering",
    hi:"पेट्रोल पंप मीटर छेड़छाड़",
    bn:"পেট্রোল পাম্প মিটার বিকৃতি",
    te:"పెట్రోల్ పంప్ మీటర్ మార్పు",
    mr:"पेट्रोल पंप मीटर छेडछाड",
    ta:"பெட்ரோல் மீட்டர் மாற்றம்",
    gu:"પેટ્રોલ પંપ મીટર ચેડછાડ",
    ur:"پیٹرول پمپ میٹر میں چھیڑ چھاڑ",
    kn:"ಪೆಟ್ರೋಲ್ ಪಂಪ್ ಮೀಟರ್ ತೊಂದರೆ",
    or:"ପେଟ୍ରୋଲ୍ ପମ୍ପ୍ ମିଟର୍ ଛେଡ଼ଛାଡ଼",
    ml:"പെട്രോൾ പമ്പ് മീറ്റർ കൈക്കളി",
    pa:"ਪੈਟਰੋਲ ਪੰਪ ਮੀਟਰ ਨਾਲ ਛੇੜਛਾੜ",
    as:"পেট্ৰ’ল পাম্প মিটাৰ বিকৃতি",
    sa:"पेट्रोलपम्पमापकयन्त्रविकृतिः"
  },
  sec:"Legal Metrology Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Adulterated Fuel Sale",
    hi:"मिलावटी ईंधन बिक्री",
    bn:"ভেজাল জ্বালানি বিক্রি",
    te:"కల్తీ ఇంధన విక్రయం",
    mr:"भेसळयुक्त इंधन विक्री",
    ta:"கலப்பட எரிபொருள் விற்பனை",
    gu:"મિલાવટવાળું ઇંધણ વેચાણ",
    ur:"ملاوٹ شدہ ایندھن فروخت",
    kn:"ಕಲ್ತೀ ಇಂಧನ ಮಾರಾಟ",
    or:"ମିଶ୍ରିତ ଇନ୍ଧନ ବିକ୍ରୟ",
    ml:"കൽത്തിയ ഇന്ധന വിൽപ്പന",
    pa:"ਮਿਲਾਵਟੀ ਇੰਧਨ ਵਿਕਰੀ",
    as:"ভেজাল ইন্ধন বিক্ৰী",
    sa:"मिश्रितइन्धनविक्रयः"
  },
  sec:"IPC 272",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Biofuel Production",
    hi:"अवैध जैव ईंधन उत्पादन",
    bn:"অবৈধ জৈব জ্বালানি উৎপাদন",
    te:"అక్రమ బయో ఇంధన ఉత్పత్తి",
    mr:"बेकायदेशीर जैवइंधन उत्पादन",
    ta:"சட்டவிரோத உயிர் எரிபொருள் உற்பத்தி",
    gu:"અવૈધ બાયો ઈંધણ ઉત્પાદન",
    ur:"غیر قانونی حیاتیاتی ایندھن پیداوار",
    kn:"ಅಕ್ರಮ ಜೈವ ಇಂಧನ ಉತ್ಪಾದನೆ",
    or:"ଅବୈଧ ଜୈବ ଇନ୍ଧନ ଉତ୍ପାଦନ",
    ml:"നിയമവിരുദ്ധ ജൈവ ഇന്ധന നിർമ്മാണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਬਾਇਓ ਇੰਧਨ ਉਤਪਾਦਨ",
    as:"অবৈধ জৈৱ ইন্ধন উৎপাদন",
    sa:"अवैधजैवइन्धनोत्पादनम्"
  },
  sec:"Energy Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Coaching Institute",
    hi:"फर्जी कोचिंग संस्थान",
    bn:"ভুয়া কোচিং প্রতিষ্ঠান",
    te:"నకిలీ కోచింగ్ సంస్థ",
    mr:"बनावट कोचिंग संस्था",
    ta:"போலி பயிற்சி நிறுவனம்",
    gu:"નકલી કોચિંગ સંસ્થા",
    ur:"جعلی کوچنگ ادارہ",
    kn:"ನಕಲಿ ಕೋಚಿಂಗ್ ಸಂಸ್ಥೆ",
    or:"ଭୁଆ କୋଚିଂ ସଂସ୍ଥା",
    ml:"വ്യാജ കോച്ചിംഗ് സ്ഥാപനo",
    pa:"ਨਕਲੀ ਕੋਚਿੰਗ ਸੰਸਥਾ",
    as:"ভুৱা কোচিং প্ৰতিষ্ঠান",
    sa:"कूटप्रशिक्षणसंस्था"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Education Loan Fraud",
    hi:"शिक्षा ऋण धोखाधड़ी",
    bn:"শিক্ষা ঋণ প্রতারণা",
    te:"విద్యా రుణ మోసం",
    mr:"शैक्षणिक कर्ज फसवणूक",
    ta:"கல்விக் கடன் மோசடி",
    gu:"શૈક્ષણિક લોન કૌભાંડ",
    ur:"تعلیمی قرض فراڈ",
    kn:"ಶೈಕ್ಷಣಿಕ ಸಾಲ ವಂಚನೆ",
    or:"ଶିକ୍ଷା ଋଣ ଠକେଇ",
    ml:"വിദ്യാഭ്യാസ വായ്പ തട്ടിപ്പ്",
    pa:"ਸਿੱਖਿਆ ਕਰਜ਼ਾ ਧੋਖਾਧੜੀ",
    as:"শিক্ষা ঋণ জালিয়াতি",
    sa:"शिक्षणऋणछलनम्"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Online Course Certification",
    hi:"फर्जी ऑनलाइन पाठ्यक्रम प्रमाणपत्र",
    bn:"ভুয়া অনলাইন কোর্স সনদ",
    te:"నకిలీ ఆన్‌లైన్ కోర్సు సర్టిఫికెట్",
    mr:"बनावट ऑनलाइन अभ्यासक्रम प्रमाणपत्र",
    ta:"போலி ஆன்லைன் பாட சான்றிதழ்",
    gu:"નકલી ઓનલાઈન કોર્સ પ્રમાણપત્ર",
    ur:"جعلی آن لائن کورس سرٹیفکیٹ",
    kn:"ನಕಲಿ ಆನ್‌ಲೈನ್ ಕೋರ್ಸ್ ಪ್ರಮಾಣಪತ್ರ",
    or:"ଭୁଆ ଅନଲାଇନ୍ କୋର୍ସ ପ୍ରମାଣପତ୍ର",
    ml:"വ്യാജ ഓൺലൈൻ കോഴ്‌സ് സർട്ടിഫിക്കറ്റ്",
    pa:"ਨਕਲੀ ਆਨਲਾਈਨ ਕੋਰਸ ਸਰਟੀਫਿਕੇਟ",
    as:"ভুৱা অনলাইন পাঠ্যক্রম প্ৰমাণপত্ৰ",
    sa:"कूटअनलाइनपाठ्यक्रमप्रमाणपत्रम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"University Seat Blocking Scam",
    hi:"विश्वविद्यालय सीट अवरोध घोटाला",
    bn:"বিশ্ববিদ্যালয় আসন অবরোধ প্রতারণা",
    te:"విశ్వవిద్యాలయ సీటు నిరోధ మోసం",
    mr:"विद्यापीठ प्रवेश जागा अडवणूक",
    ta:"பல்கலைக்கழக இடம் அடைப்பு மோசடி",
    gu:"વિશ્વવિદ્યાલય બેઠક અવરોધ કૌભાંડ",
    ur:"یونیورسٹی نشست روکنے کا فراڈ",
    kn:"ವಿಶ್ವವಿದ್ಯಾಲಯ ಸೀಟ್ ತಡೆ ಮೋಸ",
    or:"ବିଶ୍ୱବିଦ୍ୟାଳୟ ସୀଟ୍ ଅବରୋଧ ଠକେଇ",
    ml:"സർവകലാശാല സീറ്റ് തടയൽ തട്ടിപ്പ്",
    pa:"ਯੂਨੀਵਰਸਿਟੀ ਸੀਟ ਰੋਕਣ ਧੋਖਾਧੜੀ",
    as:"বিশ্ববিদ্যালয় আসন অৱৰোধ জালিয়াতি",
    sa:"विश्वविद्यालयस्थानावरोधछलनम्"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Scholarship Scheme",
    hi:"फर्जी छात्रवृत्ति योजना",
    bn:"ভুয়া বৃত্তি প্রকল্প",
    te:"నకిలీ స్కాలర్‌షిప్ పథకం",
    mr:"बनावट शिष्यवृत्ती योजना",
    ta:"போலி கல்வி உதவித்தொகை",
    gu:"નકલી સ્કોલરશિપ યોજના",
    ur:"جعلی اسکالرشپ اسکیم",
    kn:"ನಕಲಿ ವಿದ್ಯಾರ್ಥಿವೇತನ ಯೋಜನೆ",
    or:"ଭୁଆ ବୃତ୍ତି ଯୋଜନା",
    ml:"വ്യാജ സ്കോളർഷിപ്പ് പദ്ധതി",
    pa:"ਨਕਲੀ ਸਕਾਲਰਸ਼ਿਪ ਯੋਜਨਾ",
    as:"ভুৱা বৃত্তি আঁচনি",
    sa:"कूटछात्रवृत्तियोजना"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારावास",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Match Fixing",
    hi:"मैच फिक्सिंग",
    bn:"ম্যাচ ফিক্সিং",
    te:"మ్యాచ్ ఫిక్సింగ్",
    mr:"सामना फिक्सिंग",
    ta:"போட்டி முடிவு மோசடி",
    gu:"મેચ ફિક્સિંગ",
    ur:"میچ فکسنگ",
    kn:"ಮ್ಯಾಚ್ ಫಿಕ್ಸಿಂಗ್",
    or:"ମ୍ୟାଚ୍ ଫିକ୍ସିଂ",
    ml:"മാച്ച് ഫിക്സിംഗ്",
    pa:"ਮੈਚ ਫਿਕਸਿੰਗ",
    as:"মেচ ফিক্সিং",
    sa:"क्रीडासंघटनवंचना"
  },
  sec:"IPC / Sports Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Sports Betting App",
    hi:"अवैध खेल सट्टा ऐप",
    bn:"অবৈধ ক্রীড়া বাজি অ্যাপ",
    te:"అక్రమ క్రీడా బెట్టింగ్ యాప్",
    mr:"बेकायदेशीर क्रीडा सट्टा अॅप",
    ta:"சட்டவிரோத விளையாட்டு பந்தயம் ஆப்",
    gu:"અવૈધ રમત સટ્ટા એપ",
    ur:"غیر قانونی اسپورٹس بیٹنگ ایپ",
    kn:"ಅಕ್ರಮ ಕ್ರೀಡಾ ಬೆಟ್ಟಿಂಗ್ ಆಪ್",
    or:"ଅବୈଧ କ୍ରୀଡା ବେଟିଂ ଆପ୍",
    ml:"നിയമവിരുദ്ധ സ്പോർട്സ് ബെറ്റിംഗ് ആപ്പ്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਖੇਡ ਸੱਟਾ ਐਪ",
    as:"অবৈধ ক্ৰীড়া বেটিং এপ",
    sa:"अवैधक्रीडाशर्तअनुप्रयोगः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Player Age Certificate",
    hi:"फर्जी खिलाड़ी आयु प्रमाणपत्र",
    bn:"ভুয়া খেলোয়াড় বয়স সনদ",
    te:"నకిలీ క్రీడాకారుడి వయస్సు సర్టిఫికెట్",
    mr:"बनावट खेळाडू वय प्रमाणपत्र",
    ta:"போலி வயது சான்றிதழ்",
    gu:"નકલી ખેલાડી ઉંમર પ્રમાણપત્ર",
    ur:"جعلی کھلاڑی عمر سرٹیفکیٹ",
    kn:"ನಕಲಿ ಆಟಗಾರ ವಯಸ್ಸು ಪ್ರಮಾಣಪತ್ರ",
    or:"ଭୁଆ ଖେଳାଳି ବୟସ ପ୍ରମାଣପତ୍ର",
    ml:"വ്യാജ കളിക്കാരൻ പ്രായ സർട്ടിഫിക്കറ്റ്",
    pa:"ਨਕਲੀ ਖਿਡਾਰੀ ਉਮਰ ਸਰਟੀਫਿਕੇਟ",
    as:"ভুৱা খেলুৱৈ বয়স প্ৰমাণপত্ৰ",
    sa:"कूटक्रीडावयःप्रमाणपत्रम्"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારावાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Doping Violation",
    hi:"डोपिंग उल्लंघन",
    bn:"ডোপিং লঙ্ঘন",
    te:"డోపింగ్ ఉల్లంఘన",
    mr:"डोपिंग उल्लंघन",
    ta:"மருந்து ஊக்க விதி மீறல்",
    gu:"ડોપિંગ ઉલ્લંઘન",
    ur:"ڈوپنگ خلاف ورزی",
    kn:"ಡೋಪಿಂಗ್ ಉಲ್ಲಂಘನೆ",
    or:"ଡୋପିଂ ଉଲ୍ଲଂଘନ",
    ml:"ഡോപിംഗ് ലംഘനം",
    pa:"ਡੋਪਿੰਗ ਉਲੰਘਣਾ",
    as:"ডোপিং উলংঘন",
    sa:"डोपिङनियमभङ्गः"
  },
  sec:"Sports Authority Rules",
  punishment:{
    en:"Ban / fine",hi:"प्रतिबंध / जुर्माना",bn:"নিষেধাজ্ঞা / জরিমানা",
    te:"నిషేధం / జరిమానా",mr:"बंदी / दंड",ta:"தடை / அபராதம்",
    gu:"પ્રતિબંધ / દંડ",ur:"پابندی / جرمانہ",kn:"ನಿಷೇಧ / ದಂಡ",
    or:"ନିଷେଧ / ଜରିମାନା",ml:"നിരോധനം / പിഴ",
    pa:"ਪਾਬੰਦੀ / ਜੁਰਮਾਨਾ",as:"নিষেধ / জৰিমনা",sa:"प्रतिबन्धः / दण्डः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Sports Academy",
    hi:"फर्जी खेल अकादमी",
    bn:"ভুয়া ক্রীড়া একাডেমি",
    te:"నకిలీ క్రీడా అకాడమీ",
    mr:"बनावट क्रीडा अकादमी",
    ta:"போலி விளையாட்டு அகாடமி",
    gu:"નકલી રમત અકાદમી",
    ur:"جعلی اسپورٹس اکیڈمی",
    kn:"ನಕಲಿ ಕ್ರೀಡಾ ಅಕಾಡೆಮಿ",
    or:"ଭୁଆ କ୍ରୀଡା ଏକାଡେମି",
    ml:"വ്യാജ സ്പോർട്സ് അക്കാദമി",
    pa:"ਨਕਲੀ ਖੇਡ ਅਕੈਡਮੀ",
    as:"ভুৱা ক্ৰীড়া একাডেমি",
    sa:"कूटक्रीडाअकादमी"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Consumer Warranty Fraud",
    hi:"उपभोक्ता वारंटी धोखाधड़ी",
    bn:"ভোক্তা ওয়ারেন্টি প্রতারণা",
    te:"వినియోగదారుల వారంటీ మోసం",
    mr:"ग्राहक हमी फसवणूक",
    ta:"நுகர்வோர் உத்தரவாத மோசடி",
    gu:"ગ્રાહક વોરંટી કૌભાંડ",
    ur:"صارف وارنٹی فراڈ",
    kn:"ಗ್ರಾಹಕ ವಾರಂಟಿ ವಂಚನೆ",
    or:"ଭୋକ୍ତା ୱାରଣ୍ଟି ଠକେଇ",
    ml:"ഉപഭോക്തൃ വാറന്റി തട്ടിപ്പ്",
    pa:"ਖਪਤਕਾਰ ਵਾਰੰਟੀ ਧੋਖਾਧੜੀ",
    as:"গ্ৰাহক ওৱাৰেণ্টি জালিয়াতি",
    sa:"उपभोक्तृआश्वासनछलनम्"
  },
  sec:"Consumer Protection Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Product Reviews",
    hi:"फर्जी उत्पाद समीक्षा",
    bn:"ভুয়া পণ্য পর্যালোচনা",
    te:"నకిలీ ఉత్పత్తి సమీక్షలు",
    mr:"बनावट उत्पादन पुनरावलोकन",
    ta:"போலி பொருள் விமர்சனங்கள்",
    gu:"નકલી ઉત્પાદન સમીક્ષા",
    ur:"جعلی مصنوعات کے تبصرے",
    kn:"ನಕಲಿ ಉತ್ಪನ್ನ ವಿಮರ್ಶೆಗಳು",
    or:"ଭୁଆ ପଣ୍ୟ ସମୀକ୍ଷା",
    ml:"വ്യാജ ഉൽപ്പന്ന അവലോകനം",
    pa:"ਨਕਲੀ ਉਤਪਾਦ ਸਮੀਖਿਆ",
    as:"ভুৱা সামগ্ৰী সমীক্ষা",
    sa:"कूटउत्पादसमीक्षा"
  },
  sec:"IT Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"MRP Overcharging",
    hi:"एमआरपी से अधिक वसूली",
    bn:"এমআরপি বেশি আদায়",
    te:"ఎంఆర్‌పీకి మించి వసూలు",
    mr:"एमआरपीपेक्षा जास्त आकारणी",
    ta:"அதிக விலை வசூல்",
    gu:"એમઆરપી કરતાં વધુ વસૂલાત",
    ur:"ایم آر پی سے زیادہ وصولی",
    kn:"ಎಂಆರ್‌ಪಿಗಿಂತ ಹೆಚ್ಚುವರಿ ವಸೂಲಿ",
    or:"ଏମଆରପି ଅଧିକ ଆଦାୟ",
    ml:"എംആർപിയേക്കാൾ അധിക വില",
    pa:"ਐਮਆਰਪੀ ਤੋਂ ਵੱਧ ਵਸੂਲੀ",
    as:"এমআৰপিতকৈ অধিক আদায়",
    sa:"अधिकमूल्यवसूली"
  },
  sec:"Legal Metrology Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Counterfeit Spare Parts Sale",
    hi:"नकली स्पेयर पार्ट्स बिक्री",
    bn:"নকল যন্ত্রাংশ বিক্রয়",
    te:"నకిలీ విడిభాగాల విక్రయం",
    mr:"नकली सुटे भाग विक्री",
    ta:"போலி உதிரிபாகங்கள் விற்பனை",
    gu:"નકલી સ્પેર પાર્ટ્સ વેચાણ",
    ur:"نقلی پرزہ جات کی فروخت",
    kn:"ನಕಲಿ ಸ್ಪೇರ್ ಪಾರ್ಟ್ಸ್ ಮಾರಾಟ",
    or:"ନକଲି ଖଣ୍ଡପାତ ବିକ୍ରୟ",
    ml:"വ്യാജ സ്പെയർ പാർട്സ് വിൽപ്പന",
    pa:"ਨਕਲੀ ਸਪੇਅਰ ਪਾਰਟਸ ਵਿਕਰੀ",
    as:"নকল স্পেয়াৰ পাৰ্টছ বিক্ৰী",
    sa:"कूटयन्त्रांशविक्रयः"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake ISI Mark",
    hi:"फर्जी आईएसआई मार्क",
    bn:"ভুয়া আইএসআই চিহ্ন",
    te:"నకిలీ ఐఎస్ఐ ముద్ర",
    mr:"बनावट आयएसआय चिन्ह",
    ta:"போலி ISI முத்திரை",
    gu:"નકલી ISI ચિહ્ન",
    ur:"جعلی آئی ایس آئی نشان",
    kn:"ನಕಲಿ ISI ಗುರುತು",
    or:"ଭୁଆ ISI ଚିହ୍ନ",
    ml:"വ്യാജ ISI അടയാളം",
    pa:"ਨਕਲੀ ISI ਨਿਸ਼ਾਨ",
    as:"ভুৱা ISI চিহ্ন",
    sa:"कूटISIचिह्नम्"
  },
  sec:"BIS Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Biomedical Waste Disposal",
    hi:"अवैध जैव-चिकित्सीय कचरा निपटान",
    bn:"অবৈধ জৈব চিকিৎসা বর্জ্য নিষ্পত্তি",
    te:"అక్రమ బయోమెడికల్ వ్యర్థాల నిర్వాహణ",
    mr:"बेकायदेशीर जैववैद्यकीय कचरा विल्हेवाट",
    ta:"சட்டவிரோத உயிர் மருத்துவ கழிவு",
    gu:"અવૈધ બાયોમેડિકલ કચરો નિકાલ",
    ur:"غیر قانونی بایومیڈیکل فضلہ تلفی",
    kn:"ಅಕ್ರಮ ಜೈವವೈದ್ಯಕೀಯ ತ್ಯಾಜ್ಯ ವಿಲೇವಾರಿ",
    or:"ଅବୈଧ ବାୟୋମେଡିକାଲ୍ ବର୍ଜ୍ୟ ନିଷ୍ପତ୍ତି",
    ml:"നിയമവിരുദ്ധ ബയോമെഡിക്കൽ മാലിന്യ നിർമാർജ്ജനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਬਾਇਓਮੈਡੀਕਲ ਕੂੜਾ ਨਿਸ਼ਕਾਸਨ",
    as:"অবৈধ বায়োমেডিকেল বর্জ্য নিষ্পত্তি",
    sa:"अवैधजैववैद्यकीयअपशिष्टनिष्कासनम्"
  },
  sec:"BMW Rules",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Hospital Fire Safety Violation",
    hi:"अस्पताल अग्नि सुरक्षा उल्लंघन",
    bn:"হাসপাতাল অগ্নি নিরাপত্তা লঙ্ঘন",
    te:"ఆసుపత్రి అగ్ని భద్రత ఉల్లంఘన",
    mr:"रुग्णालय अग्निसुरक्षा उल्लंघन",
    ta:"மருத்துவமனை தீ பாதுகாப்பு மீறல்",
    gu:"હોસ્પિટલ ફાયર સેફ્ટી ઉલ્લંઘન",
    ur:"ہسپتال فائر سیفٹی خلاف ورزی",
    kn:"ಆಸ್ಪತ್ರೆ ಅಗ್ನಿ ಸುರಕ್ಷತಾ ಉಲ್ಲಂಘನೆ",
    or:"ହସ୍ପିଟାଲ୍ ଅଗ୍ନି ସୁରକ୍ଷା ଉଲ୍ଲଂଘନ",
    ml:"ആശുപത്രി അഗ്നി സുരക്ഷാ ലംഘനം",
    pa:"ਹਸਪਤਾਲ ਅੱਗ ਸੁਰੱਖਿਆ ਉਲੰਘਣਾ",
    as:"হাসপাতাল অগ্নি সুৰক্ষা উলংঘন",
    sa:"चिकित्सालयअग्निसुरक्षाभङ्गः"
  },
  sec:"Fire Safety Act",
  punishment:{
    en:"Fine / closure",hi:"जुर्माना / बंद",bn:"জরিমানা / বন্ধ",
    te:"జరిమానా / మూసివేత",mr:"दंड / बंद",ta:"அபராதம் / மூடல்",
    gu:"દંડ / બંધ",ur:"جرمانہ / بندش",kn:"ದಂಡ / ಮುಚ್ಚುವಿಕೆ",
    or:"ଜରିମାନା / ବନ୍ଦ",ml:"പിഴ / അടച്ചുപൂട്ടൽ",
    pa:"ਜੁਰਮਾਨਾ / ਬੰਦ",as:"জৰিমনা / বন্ধ",sa:"दण्डः / निरोधनम्"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Nursing Home Registration",
    hi:"फर्जी नर्सिंग होम पंजीकरण",
    bn:"ভুয়া নার্সিং হোম নিবন্ধন",
    te:"నకిలీ నర్సింగ్ హోం నమోదు",
    mr:"बनावट नर्सिंग होम नोंदणी",
    ta:"போலி நர்சிங் ஹோம் பதிவு",
    gu:"નકલી નર્સિંગ હોમ નોંધણી",
    ur:"جعلی نرسنگ ہوم رجسٹریشن",
    kn:"ನಕಲಿ ನರ್ಸಿಂಗ್ ಹೋಮ್ ನೋಂದಣಿ",
    or:"ଭୁଆ ନର୍ସିଂ ହୋମ୍ ପଞ୍ଜିକରଣ",
    ml:"വ്യാജ നഴ്സിംഗ് ഹോം രജിസ്ട്രേഷൻ",
    pa:"ਨਕਲੀ ਨਰਸਿੰਗ ਹੋਮ ਰਜਿਸਟ੍ਰੇਸ਼ਨ",
    as:"ভুৱা নার্সিং হোম পঞ্জীয়ন",
    sa:"कूटपरिचर्यागृहपंजीकरणम्"
  },
  sec:"Clinical Establishments Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Cosmetic Testing",
    hi:"अवैध सौंदर्य प्रसाधन परीक्षण",
    bn:"অবৈধ কসমেটিক পরীক্ষা",
    te:"అక్రమ కాస్మెటిక్ పరీక్ష",
    mr:"बेकायदेशीर सौंदर्य प्रसाधन चाचणी",
    ta:"சட்டவிரோத அழகு பொருள் சோதனை",
    gu:"અવૈધ કોસ્મેટિક પરીક્ષણ",
    ur:"غیر قانونی کاسمیٹک جانچ",
    kn:"ಅಕ್ರಮ ಸೌಂದರ್ಯ ಉತ್ಪನ್ನ ಪರೀಕ್ಷೆ",
    or:"ଅବୈଧ କସ୍ମେଟିକ୍ ପରୀକ୍ଷା",
    ml:"നിയമവിരുദ്ധ സൗന്ദര്യ ഉൽപ്പന്ന പരിശോധന",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਕਾਸਮੇਟਿਕ ਟੈਸਟਿੰਗ",
    as:"অবৈধ কসমেটিক পৰীক্ষা",
    sa:"अवैधसौन्दर्यपरीक्षणम्"
  },
  sec:"Drugs Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unlicensed Diagnostic Lab",
    hi:"बिना लाइसेंस जांच प्रयोगशाला",
    bn:"লাইসেন্সবিহীন ডায়াগনস্টিক ল্যাব",
    te:"లైసెన్స్ లేని నిర్ధారణ ప్రయోగశాల",
    mr:"परवाना नसलेली निदान प्रयोगशाळा",
    ta:"உரிமம் இல்லா ஆய்வகம்",
    gu:"લાયસન્સ વગરની નિદાન લેબ",
    ur:"بغیر لائسنس تشخیصی لیب",
    kn:"ಪರವಾನಗಿ ಇಲ್ಲದ ನಿರ್ಣಾಯಕ ಪ್ರಯೋಗಾಲಯ",
    or:"ଲାଇସେନ୍ସ ବିହୀନ ନିର୍ଣ୍ଣୟ ଲ୍ୟାବ୍",
    ml:"ലൈസൻസ് ഇല്ലാത്ത ഡയഗ്നോസ്റ്റിക് ലാബ്",
    pa:"ਬਿਨਾਂ ਲਾਇਸੈਂਸ ਡਾਇਗਨੋਸਟਿਕ ਲੈਬ",
    as:"লাইচেন্স নথকা নিৰ্ণয় লেব",
    sa:"अनुज्ञारहितनिदानप्रयोगशाला"
  },
  sec:"Clinical Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Fake Gold Hallmarking",
    hi:"फर्जी सोना हॉलमार्किंग",
    bn:"ভুয়া সোনার হলমার্কিং",
    te:"నకిలీ బంగారు హాల్‌మార్కింగ్",
    mr:"बनावट सोन्याची हॉलमार्किंग",
    ta:"போலி தங்க முத்திரை",
    gu:"નકલી સોનાની હોલમાર્કિંગ",
    ur:"جعلی سونے کی ہال مارکنگ",
    kn:"ನಕಲಿ ಚಿನ್ನದ ಹಾಲ್‌ಮಾರ್ಕಿಂಗ್",
    or:"ଭୁଆ ସୁନା ହଲମାର୍କିଂ",
    ml:"വ്യാജ സ്വർണ്ണ ഹാൾമാർക്കിംഗ്",
    pa:"ਨਕਲੀ ਸੋਨੇ ਦੀ ਹਾਲਮਾਰਕਿੰਗ",
    as:"ভুৱা সোণ হ’লমাৰ্কিং",
    sa:"कूटस्वर्णमुद्रांकनम्"
  },
  sec:"BIS Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Diamond Weight Manipulation",
    hi:"हीरे के वजन में हेरफेर",
    bn:"হীরার ওজন জালিয়াতি",
    te:"వజ్ర బరువు మార్పిడి",
    mr:"हिऱ्याच्या वजनात फेरफार",
    ta:"வைரம் எடை மாற்றம்",
    gu:"હીરાના વજનમાં હેરફેર",
    ur:"ہیروں کے وزن میں رد و بدل",
    kn:"ವಜ್ರ ತೂಕದಲ್ಲಿ ಬದಲಾವಣೆ",
    or:"ହୀରା ଓଜନ ପରିବର୍ତ୍ତନ",
    ml:"വജ്ര ഭാരം കൃത്രിമം",
    pa:"ਹੀਰੇ ਦੇ ਭਾਰ ਵਿੱਚ ਹੇਰਾਫੇਰੀ",
    as:"হীৰাৰ ওজন বিকৃতি",
    sa:"वज्रभारविकृति"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Antique Sale",
    hi:"फर्जी प्राचीन वस्तु बिक्री",
    bn:"ভুয়া প্রাচীন সামগ্রী বিক্রয়",
    te:"నకిలీ పురాతన వస్తు విక్రయం",
    mr:"बनावट प्राचीन वस्तू विक्री",
    ta:"போலி பழமையான பொருள் விற்பனை",
    gu:"નકલી પ્રાચીન વસ્તુ વેચાણ",
    ur:"جعلی قدیم نوادرات کی فروخت",
    kn:"ನಕಲಿ ಪುರಾತನ ವಸ್ತು ಮಾರಾಟ",
    or:"ଭୁଆ ପୁରାତନ ବସ୍ତୁ ବିକ୍ରୟ",
    ml:"വ്യാജ പുരാവസ്തു വിൽപ്പന",
    pa:"ਨਕਲੀ ਪ੍ਰਾਚੀਨ ਵਸਤੂ ਵਿਕਰੀ",
    as:"ভুৱা প্ৰাচীন বস্তু বিক্ৰী",
    sa:"कूटप्राचीनवस्तुविक्रयः"
  },
  sec:"Antiquities Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Art Export",
    hi:"अवैध कला निर्यात",
    bn:"অবৈধ শিল্পকর্ম রপ্তানি",
    te:"అక్రమ కళా ఎగుమతి",
    mr:"बेकायदेशीर कला निर्यात",
    ta:"சட்டவிரோத கலை ஏற்றுமதி",
    gu:"અવૈધ કલા નિકાસ",
    ur:"غیر قانونی فن پاروں کی برآمد",
    kn:"ಅಕ್ರಮ ಕಲಾ ರಫ್ತು",
    or:"ଅବୈଧ କଳା ରପ୍ତାନି",
    ml:"നിയമവിരുദ്ധ കല കയറ്റുമതി",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਕਲਾ ਨਿਰਯਾਤ",
    as:"অবৈধ কলা ৰপ্তানি",
    sa:"अवैधकलानिर्यातः"
  },
  sec:"Customs Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Heritage Property Damage",
    hi:"विरासत संपत्ति को नुकसान",
    bn:"ঐতিহ্যবাহী সম্পত্তির ক্ষতি",
    te:"పారంపర్య ఆస్తి నష్టం",
    mr:"वारसा मालमत्तेचे नुकसान",
    ta:"பாரம்பரிய சொத்து சேதம்",
    gu:"વારસાગત મિલકત નુકસાન",
    ur:"ورثے کی جائیداد کو نقصان",
    kn:"ಪಾರಂಪರಿಕ ಆಸ್ತಿಗೆ ಹಾನಿ",
    or:"ଐତିହ୍ୟ ସମ୍ପତ୍ତି କ୍ଷତି",
    ml:"പൈതൃക സ്വത്തുക്കൾക്ക് നാശം",
    pa:"ਵਿਰਾਸਤੀ ਸੰਪਤੀ ਨੂੰ ਨੁਕਸਾਨ",
    as:"ঐতিহ্য সম্পত্তিৰ ক্ষতি",
    sa:"धरोहरसम्पत्तिनाशः"
  },
  sec:"AMASR Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Mobile App Reviews",
    hi:"फर्जी मोबाइल ऐप समीक्षा",
    bn:"ভুয়া মোবাইল অ্যাপ রিভিউ",
    te:"నకిలీ మొబైల్ యాప్ సమీక్షలు",
    mr:"बनावट मोबाईल अॅप पुनरावलोकन",
    ta:"போலி மொபைல் ஆப் விமர்சனங்கள்",
    gu:"નકલી મોબાઇલ એપ સમીક્ષા",
    ur:"جعلی موبائل ایپ ریویوز",
    kn:"ನಕಲಿ ಮೊಬೈಲ್ ಆಪ್ ವಿಮರ್ಶೆಗಳು",
    or:"ଭୁଆ ମୋବାଇଲ୍ ଆପ୍ ସମୀକ୍ଷା",
    ml:"വ്യാജ മൊബൈൽ ആപ്പ് റിവ്യൂ",
    pa:"ਨਕਲੀ ਮੋਬਾਈਲ ਐਪ ਸਮੀਖਿਆ",
    as:"ভুৱা মোবাইল এপ সমীক্ষা",
    sa:"कूटचलदूरभाषाअनुप्रयोगसमीक्षा"
  },
  sec:"IT Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Unauthorized App Permissions Abuse",
    hi:"अनधिकृत ऐप अनुमति का दुरुपयोग",
    bn:"অননুমোদিত অ্যাপ অনুমতির অপব্যবহার",
    te:"అనధికార యాప్ అనుమతి దుర్వినియోగం",
    mr:"अनधिकृत अॅप परवानगीचा गैरवापर",
    ta:"ஆப் அனுமதி தவறான பயன்பாடு",
    gu:"અનધિકૃત એપ પરવાનગી દુરુપયોગ",
    ur:"ایپ اجازت کا غیر مجاز استعمال",
    kn:"ಅನಧಿಕೃತ ಆಪ್ ಅನುಮತಿ ದುರುಪಯೋಗ",
    or:"ଅନଧିକୃତ ଆପ୍ ଅନୁମତି ଦୁରୁପଯୋଗ",
    ml:"അനധികൃത ആപ്പ് അനുമതി ദുരുപയോഗം",
    pa:"ਗੈਰਅਧਿਕ੍ਰਿਤ ਐਪ ਅਨੁਮਤੀ ਦੁਰਵਰਤੋਂ",
    as:"অননুমোদিত এপ অনুমতি অপব্যৱহাৰ",
    sa:"अनधिकृतअनुप्रयोगानुज्ञादुरुपयोगः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Dark Pattern UX Fraud",
    hi:"डार्क पैटर्न यूएक्स धोखाधड़ी",
    bn:"ডার্ক প্যাটার্ন ইউএক্স প্রতারণা",
    te:"డార్క్ ప్యాటర్న్ UX మోసం",
    mr:"डार्क पॅटर्न UX फसवणूक",
    ta:"டார்க் பேட்டர்ன் UX மோசடி",
    gu:"ડાર્ક પેટર્ન UX છેતરપિંડી",
    ur:"ڈارک پیٹرن یو ایکس فراڈ",
    kn:"ಡಾರ್ಕ್ ಪ್ಯಾಟರ್ನ್ UX ವಂಚನೆ",
    or:"ଡାର୍କ ପ୍ୟାଟର୍ନ UX ଠକେଇ",
    ml:"ഡാർക്ക് പാറ്റേൺ UX തട്ടിപ്പ്",
    pa:"ਡਾਰਕ ਪੈਟਰਨ UX ਧੋਖਾਧੜੀ",
    as:"ডাৰ্ক পেটাৰ্ন UX জালিয়াতি",
    sa:"गूढरूपप्रयोक्तृअनुभवछलनम्"
  },
  sec:"Consumer Protection Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Ad Tracking",
    hi:"अवैध विज्ञापन ट्रैकिंग",
    bn:"অবৈধ বিজ্ঞাপন ট্র্যাকিং",
    te:"అక్రమ ప్రకటన ట్రాకింగ్",
    mr:"बेकायदेशीर जाहिरात ट्रॅकिंग",
    ta:"சட்டவிரோத விளம்பர கண்காணிப்பு",
    gu:"અવૈધ જાહેરાત ટ્રેકિંગ",
    ur:"غیر قانونی اشتہاری ٹریکنگ",
    kn:"ಅಕ್ರಮ ಜಾಹೀರಾತು ಟ್ರ್ಯಾಕಿಂಗ್",
    or:"ଅବୈଧ ବିଜ୍ଞାପନ ଟ୍ରାକିଂ",
    ml:"നിയമവിരുദ്ധ പരസ്യ ട്രാക്കിംഗ്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਇਸ਼ਤਿਹਾਰ ਟ੍ਰੈਕਿੰਗ",
    as:"অবৈধ বিজ্ঞাপন ট্ৰেকিং",
    sa:"अवैधविज्ञापनानुसरणम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized Cookie Data Sale",
    hi:"अनधिकृत कुकी डेटा बिक्री",
    bn:"অননুমোদিত কুকি ডেটা বিক্রয়",
    te:"అనధికార కుకీ డేటా విక్రయం",
    mr:"अनधिकृत कुकी डेटा विक्री",
    ta:"குக்கி தரவு அனுமதி இல்லா விற்பனை",
    gu:"અનધિકૃત કૂકી ડેટા વેચાણ",
    ur:"غیر مجاز کوکی ڈیٹا فروخت",
    kn:"ಅನಧಿಕೃತ ಕುಕಿ ಡೇಟಾ ಮಾರಾಟ",
    or:"ଅନଧିକୃତ କୁକି ତଥ୍ୟ ବିକ୍ରୟ",
    ml:"അനധികൃത കുക്കി ഡാറ്റ വിൽപ്പന",
    pa:"ਗੈਰਅਧਿਕ੍ਰਿਤ ਕੁਕੀ ਡਾਟਾ ਵਿਕਰੀ",
    as:"অননুমোদিত কুকি ডাটা বিক্ৰী",
    sa:"अनधिकृतकुकीदत्तविक्रयः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Recycling Certificate",
    hi:"फर्जी रीसाइक्लिंग प्रमाणपत्र",
    bn:"ভুয়া পুনর্ব্যবহার শংসাপত্র",
    te:"నకిలీ రీసైక్లింగ్ సర్టిఫికేట్",
    mr:"बनावट पुनर्वापर प्रमाणपत्र",
    ta:"போலி மறுசுழற்சி சான்றிதழ்",
    gu:"નકલી રિસાયક્લિંગ પ્રમાણપત્ર",
    ur:"جعلی ری سائیکلنگ سرٹیفکیٹ",
    kn:"ನಕಲಿ ಮರುಬಳಕೆ ಪ್ರಮಾಣಪತ್ರ",
    or:"ଭୁଆ ପୁନଃଚକ୍ରଣ ପ୍ରମାଣପତ୍ର",
    ml:"വ്യാജ റീസൈക്ലിംഗ് സർട്ടിഫിക്കറ്റ്",
    pa:"ਨਕਲੀ ਰੀਸਾਈਕਲਿੰਗ ਸਰਟੀਫਿਕੇਟ",
    as:"ভুৱা পুনৰচକ্ৰণ প্ৰমাণপত্ৰ",
    sa:"कूटपुनर्चक्रणप्रमाणपत्रम्"
  },
  sec:"EPA Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"E-Waste Smuggling",
    hi:"ई-कचरा तस्करी",
    bn:"ই-বর্জ্য পাচার",
    te:"ఈ-వేస్ట్ అక్రమ రవాణా",
    mr:"ई-कचरा तस्करी",
    ta:"மின்னணு கழிவு கடத்தல்",
    gu:"ઇ-વેસ્ટ તસ્કરી",
    ur:"ای ویسٹ اسمگلنگ",
    kn:"ಇ-ತ್ಯಾಜ್ಯ ಕಳ್ಳಸಾಗಣೆ",
    or:"ଇ-ବର୍ଜ୍ୟ ଚୋରାଚାଳାନ",
    ml:"ഇ-മാലിന്യ കടത്തൽ",
    pa:"ਈ-ਵੇਸਟ ਤਸਕਰੀ",
    as:"ই-বর্জ্য চোৰাচালান",
    sa:"विद्युत्कचोरासारः"
  },
  sec:"E-Waste Rules",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Battery Disposal",
    hi:"अवैध बैटरी निपटान",
    bn:"অবৈধ ব্যাটারি নিষ্পত্তি",
    te:"అక్రమ బ్యాటరీ పారవేత",
    mr:"बेकायदेशीर बॅटरी विल्हेवाट",
    ta:"சட்டவிரோத பேட்டரி குப்பை",
    gu:"અવૈધ બેટરી નિકાલ",
    ur:"غیر قانونی بیٹری تلفی",
    kn:"ಅಕ್ರಮ ಬ್ಯಾಟರಿ ವಿಲೇವಾರಿ",
    or:"ଅବୈଧ ବ୍ୟାଟେରୀ ବିସର୍ଜନ",
    ml:"നിയമവിരുദ്ധ ബാറ്ററി നിക്ഷേപം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਬੈਟਰੀ ਨਿਪਟਾਰਾ",
    as:"অবৈধ বেটাৰী নিষ্পত্তি",
    sa:"अवैधविद्युत्कोषनिक्षेपः"
  },
  sec:"Battery Rules",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Plastic Waste Burning",
    hi:"प्लास्टिक कचरा जलाना",
    bn:"প্লাস্টিক বর্জ্য পোড়ানো",
    te:"ప్లాస్టిక్ వ్యర్థాల దహనం",
    mr:"प्लास्टिक कचरा जाळणे",
    ta:"பிளாஸ்டிக் கழிவு எரித்தல்",
    gu:"પ્લાસ્ટિક કચરો સળગાવવો",
    ur:"پلاسٹک فضلہ جلانا",
    kn:"ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ ದಹನ",
    or:"ପ୍ଲାଷ୍ଟିକ୍ ବର୍ଜ୍ୟ ଜ୍ୱାଳନ",
    ml:"പ്ലാസ്റ്റിക് മാലിന്യം കത്തിക്കൽ",
    pa:"ਪਲਾਸਟਿਕ ਕੂੜਾ ਸਾੜਨਾ",
    as:"প্লাষ্টিক আৱৰ্জনা জ্বলন",
    sa:"प्लास्टिककचराज्वलनम्"
  },
  sec:"Plastic Waste Rules",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Greenwashing Fraud",
    hi:"ग्रीनवॉशिंग धोखाधड़ी",
    bn:"গ্রিনওয়াশিং প্রতারণা",
    te:"గ్రీన్‌వాషింగ్ మోసం",
    mr:"ग्रीनवॉशिंग फसवणूक",
    ta:"பசுமை போலி விளம்பரம்",
    gu:"ગ્રીનવોશિંગ છેતરપિંડી",
    ur:"گرین واشنگ فراڈ",
    kn:"ಗ್ರೀನ್‌ವಾಷಿಂಗ್ ವಂಚನೆ",
    or:"ଗ୍ରୀନ୍‌ୱାସିଂ ଠକେଇ",
    ml:"ഗ്രീൻവാഷിംഗ് തട്ടിപ്പ്",
    pa:"ਗ੍ਰੀਨਵਾਸ਼ਿੰਗ ਧੋਖਾਧੜੀ",
    as:"গ্ৰীণৱাশিং জালিয়াতি",
    sa:"हरितप्रचारछलनम्"
  },
  sec:"Consumer Protection Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},
{
  name:{
    en:"Fake Disaster Alert Message",
    hi:"फर्जी आपदा चेतावनी संदेश",
    bn:"ভুয়া দুর্যোগ সতর্কবার্তা",
    te:"నకిలీ విపత్తు హెచ్చరిక సందేశం",
    mr:"बनावट आपत्ती इशारा संदेश",
    ta:"போலி பேரிடர் எச்சரிக்கை",
    gu:"નકલી આપત્તિ ચેતવણી સંદેશ",
    ur:"جعلی آفت الرٹ پیغام",
    kn:"ನಕಲಿ ವಿಪತ್ತು ಎಚ್ಚರಿಕೆ ಸಂದೇಶ",
    or:"ଭୁଆ ବିପଦ ସତର୍କ ବାର୍ତ୍ତା",
    ml:"വ്യാജ ദുരന്ത മുന്നറിയിപ്പ് സന്ദേശം",
    pa:"ਨਕਲੀ ਆਫ਼ਤ ਚੇਤਾਵਨੀ ਸੁਨੇਹਾ",
    as:"ভুৱা দুৰ্যোগ সতৰ্কবাৰ্তা",
    sa:"कूटआपद्सूचनासन्देशः"
  },
  sec:"DM Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"False Weather Warning",
    hi:"झूठी मौसम चेतावनी",
    bn:"মিথ্যা আবহাওয়া সতর্কতা",
    te:"తప్పుడు వాతావరణ హెచ్చరిక",
    mr:"खोटी हवामान सूचना",
    ta:"பொய் வானிலை எச்சரிக்கை",
    gu:"ખોટી હવામાન ચેતવણી",
    ur:"جھوٹی موسمی وارننگ",
    kn:"ಸುಳ್ಳು ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ",
    or:"ମିଥ୍ୟା ପାଣିପାଗ ସତର୍କତା",
    ml:"തെറ്റായ കാലാവസ്ഥ മുന്നറിയിപ്പ്",
    pa:"ਝੂਠੀ ਮੌਸਮ ਚੇਤਾਵਨੀ",
    as:"মিছা বতৰ সতৰ্কতা",
    sa:"मिथ्यावातावरणसूचना"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Emergency Helpline Abuse",
    hi:"आपातकालीन हेल्पलाइन का दुरुपयोग",
    bn:"জরুরি হেল্পলাইনের অপব্যবহার",
    te:"అత్యవసర హెల్ప్‌లైన్ దుర్వినియోగం",
    mr:"आपत्कालीन हेल्पलाईनचा गैरवापर",
    ta:"அவசர உதவி எண் துஷ்பிரயோகம்",
    gu:"ઇમરજન્સી હેલ્પલાઇનનો દુરુપયોગ",
    ur:"ایمرجنسی ہیلپ لائن کا غلط استعمال",
    kn:"ತುರ್ತು ಸಹಾಯವಾಣಿ ದುರುಪಯೋಗ",
    or:"ଜରୁରୀ ସହାୟତା ନମ୍ବର ଦୁରୁପଯୋଗ",
    ml:"അത്യാവശ്യ ഹെൽപ്‌ലൈൻ ദുരുപയോഗം",
    pa:"ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ ਦੀ ਦੁਰਵਰਤੋਂ",
    as:"জৰুৰী হেল্পলাইন অপব্যৱহাৰ",
    sa:"आपत्सहायवाणीदुरुपयोगः"
  },
  sec:"IPC",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Rescue Operation",
    hi:"फर्जी बचाव अभियान",
    bn:"ভুয়া উদ্ধার অভিযান",
    te:"నకిలీ రక్షణ ఆపరేషన్",
    mr:"बनावट बचाव मोहीम",
    ta:"போலி மீட்பு நடவடிக்கை",
    gu:"નકલી બચાવ કામગીરી",
    ur:"جعلی ریسکیو آپریشن",
    kn:"ನಕಲಿ ರಕ್ಷಣಾ ಕಾರ್ಯಾಚರಣೆ",
    or:"ଭୁଆ ଉଦ୍ଧାର ଅଭିଯାନ",
    ml:"വ്യാജ രക്ഷാപ്രവർത്തനം",
    pa:"ਨਕਲੀ ਬਚਾਅ ਅਭਿਆਨ",
    as:"ভুৱা উদ্ধাৰ অভিযান",
    sa:"कूटउद्धारकार्यः"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Disaster Relief Material Theft",
    hi:"आपदा राहत सामग्री चोरी",
    bn:"দুর্যোগ ত্রাণ সামগ্রী চুরি",
    te:"విపత్తు సహాయ సామగ్రి దొంగతనం",
    mr:"आपत्ती मदत साहित्य चोरी",
    ta:"பேரிடர் நிவாரண பொருள் திருட்டு",
    gu:"આપત્તિ રાહત સામગ્રી ચોરી",
    ur:"آفت امدادی سامان کی چوری",
    kn:"ವಿಪತ್ತು ಪರಿಹಾರ ಸಾಮಗ್ರಿ ಕಳವು",
    or:"ବିପଦ ସହାୟତା ସାମଗ୍ରୀ ଚୋରି",
    ml:"ദുരന്ത സഹായ വസ്തു മോഷണം",
    pa:"ਆਫ਼ਤ ਰਾਹਤ ਸਮੱਗਰੀ ਚੋਰੀ",
    as:"দুৰ্যোগ সাহায্য সামগ্ৰী চুৰি",
    sa:"आपद्सहायसामग्रीचौर्यम्"
  },
  sec:"DM Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Water Tanker Operation",
    hi:"अवैध जल टैंकर संचालन",
    bn:"অবৈধ জল ট্যাঙ্কার পরিচালনা",
    te:"అక్రమ వాటర్ ట్యాంకర్ నిర్వహణ",
    mr:"बेकायदेशीर पाणी टँकर संचालन",
    ta:"சட்டவிரோத நீர் டேங்கர் இயக்கம்",
    gu:"અવૈધ પાણી ટેન્કર સંચાલન",
    ur:"غیر قانونی واٹر ٹینکر آپریشن",
    kn:"ಅಕ್ರಮ ನೀರು ಟ್ಯಾಂಕರ್ ಕಾರ್ಯಾಚರಣೆ",
    or:"ଅବୈଧ ଜଳ ଟ୍ୟାଙ୍କର ଚାଳନା",
    ml:"നിയമവിരുദ്ധ ജല ടാങ്കർ പ്രവർത്തനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਪਾਣੀ ਟੈਂਕਰ ਚਲਾਣਾ",
    as:"অবৈধ পানী টেংকাৰ চলাচল",
    sa:"अवैधजलटंकीपरिचालनम्"
  },
  sec:"Municipal Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake RO Water Plant",
    hi:"फर्जी आरओ जल संयंत्र",
    bn:"ভুয়া আরও জল শোধনাগার",
    te:"నకిలీ RO వాటర్ ప్లాంట్",
    mr:"बनावट आरओ पाणी प्रकल्प",
    ta:"போலி RO நீர் ஆலை",
    gu:"નકલી RO પાણી પ્લાન્ટ",
    ur:"جعلی آر او واٹر پلانٹ",
    kn:"ನಕಲಿ RO ನೀರು ಘಟಕ",
    or:"ଭୁଆ RO ଜଳ ପ୍ଲାଣ୍ଟ",
    ml:"വ്യാജ RO ജല പ്ലാന്റ്",
    pa:"ਨਕਲੀ RO ਵਾਟਰ ਪਲਾਂਟ",
    as:"ভুৱা RO পানী প্লান্ট",
    sa:"कूटआरओजलसंयंत्रम्"
  },
  sec:"Water Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Contaminated Drinking Water Supply",
    hi:"दूषित पेयजल आपूर्ति",
    bn:"দূষিত পানীয় জল সরবরাহ",
    te:"కాలుష్య త్రాగునీటి సరఫరా",
    mr:"दूषित पिण्याचे पाणी पुरवठा",
    ta:"மாசடைந்த குடிநீர் விநியோகம்",
    gu:"પ્રદૂષિત પીવાનું પાણી પુરવઠો",
    ur:"آلودہ پینے کے پانی کی فراہمی",
    kn:"ಕಲುಷಿತ ಕುಡಿಯುವ ನೀರು ಪೂರೈಕೆ",
    or:"ଦୂଷିତ ପାନୀୟ ଜଳ ଯୋଗାଣ",
    ml:"മലിനമായ കുടിവെള്ള വിതരണം",
    pa:"ਦੂਸ਼ਿਤ ਪੀਣ ਵਾਲੇ ਪਾਣੀ ਦੀ ਸਪਲਾਈ",
    as:"দূষিত পানীয় জল যোগান",
    sa:"दूषितपेयजलवितरणम्"
  },
  sec:"Water Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Borewell Commercial Use",
    hi:"अवैध बोरवेल व्यावसायिक उपयोग",
    bn:"অবৈধ বোরওয়েল বাণিজ্যিক ব্যবহার",
    te:"అక్రమ బోర్‌వెల్ వాణిజ్య వినియోగం",
    mr:"बेकायदेशीर बोअरवेल व्यावसायिक वापर",
    ta:"சட்டவிரோத போர்வெல் வணிக பயன்பாடு",
    gu:"અવૈધ બોરવેલ વ્યાવસાયિક ઉપયોગ",
    ur:"غیر قانونی بورویل تجارتی استعمال",
    kn:"ಅಕ್ರಮ ಬೋರ್‌ವೆಲ್ ವಾಣಿಜ್ಯ ಬಳಕೆ",
    or:"ଅବୈଧ ବୋରୱେଲ୍ ବାଣିଜ୍ୟିକ ବ୍ୟବହାର",
    ml:"നിയമവിരുദ്ധ ബോർവെൽ വാണിജ്യ ഉപയോഗം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਬੋਰਵੈੱਲ ਵਪਾਰਕ ਵਰਤੋਂ",
    as:"অবৈধ বোৰৱেল বাণিজ্যিক ব্যৱহাৰ",
    sa:"अवैधबोरवेलव्यावसायिकप्रयोगः"
  },
  sec:"Groundwater Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Water Meter Tampering",
    hi:"जल मीटर से छेड़छाड़",
    bn:"জল মিটার বিকৃতি",
    te:"నీటి మీటర్ మార్పు",
    mr:"पाणी मीटर छेडछाड",
    ta:"நீர் மீட்டர் மாற்றம்",
    gu:"પાણી મીટર છેડછાડ",
    ur:"واٹر میٹر میں چھیڑ چھاڑ",
    kn:"ನೀರು ಮೀಟರ್ ತಿದ್ದುಪಡಿ",
    or:"ଜଳ ମିଟର ଛେଡ଼ଛାଡ଼",
    ml:"വാട്ടർ മീറ്റർ കൃത്രിമം",
    pa:"ਵਾਟਰ ਮੀਟਰ ਨਾਲ ਛੇੜਛਾੜ",
    as:"পানী মিটাৰ বিকৃতি",
    sa:"जलमापकयन्त्रविकृति"
  },
  sec:"Municipal Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},
{
  name:{
    en:"Fake Milk Distribution",
    hi:"फर्जी दूध वितरण",
    bn:"ভুয়া দুধ বিতরণ",
    te:"నకిలీ పాలు పంపిణీ",
    mr:"बनावट दूध वितरण",
    ta:"போலி பால் விநியோகம்",
    gu:"નકલી દૂધ વિતરણ",
    ur:"جعلی دودھ کی تقسیم",
    kn:"ನಕಲಿ ಹಾಲು ವಿತರಣೆ",
    or:"ଭୁଆ ଦୁଧ ବଣ୍ଟନ",
    ml:"വ്യാജ പാൽ വിതരണം",
    pa:"ਨਕਲੀ ਦੁੱਧ ਵੰਡ",
    as:"ভুৱা দুধ বিতৰণ",
    sa:"कूटदुग्धवितरणम्"
  },
  sec:"FSS Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Milk Adulteration",
    hi:"दूध में मिलावट",
    bn:"দুধে ভেজাল",
    te:"పాలలో కల్తీ",
    mr:"दूध भेसळ",
    ta:"பால் கலப்படம்",
    gu:"દૂધમાં ભેળસેળ",
    ur:"دودھ میں ملاوٹ",
    kn:"ಹಾಲಿನಲ್ಲಿ ಕಲಬೆರೆ",
    or:"ଦୁଧରେ ମିଶ୍ରଣ",
    ml:"പാൽ കലർത്തൽ",
    pa:"ਦੁੱਧ ਵਿੱਚ ਮਿਲਾਵਟ",
    as:"দুধত ভেজাল",
    sa:"दुग्धमिश्रणम्"
  },
  sec:"FSS Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Expired Food Sale",
    hi:"एक्सपायर्ड खाद्य बिक्री",
    bn:"মেয়াদোত্তীর্ণ খাবার বিক্রি",
    te:"గడువు ముగిసిన ఆహార విక్రయం",
    mr:"कालबाह्य अन्न विक्री",
    ta:"காலாவதியான உணவு விற்பனை",
    gu:"મિયાદ પૂરી થયેલ ખોરાક વેચાણ",
    ur:"میعاد ختم شدہ خوراک کی فروخت",
    kn:"ಕಾಲಾವಧಿ ಮೀರಿದ ಆಹಾರ ಮಾರಾಟ",
    or:"ମেয়ାଦ ସମାପ୍ତ ଖାଦ୍ୟ ବିକ୍ରୟ",
    ml:"കാലഹരണപ്പെട്ട ഭക്ഷണ വിൽപ്പന",
    pa:"ਮਿਆਦ ਪੁੱਗਿਆ ਭੋਜਨ ਵਿਕਰੀ",
    as:"মেয়াদ উকলি যোৱা খাদ্য বিক্ৰী",
    sa:"कालातीतभोजनविक्रयः"
  },
  sec:"FSS Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Organic Food Label",
    hi:"फर्जी ऑर्गेनिक फूड लेबल",
    bn:"ভুয়া অর্গানিক খাদ্য লেবেল",
    te:"నకిలీ ఆర్గానిక్ ఆహార లేబుల్",
    mr:"बनावट ऑर्गेनिक अन्न लेबल",
    ta:"போலி ஆர்கானிக் லேபிள்",
    gu:"નકલી ઓર્ગેનિક ફૂડ લેબલ",
    ur:"جعلی آرگینک فوڈ لیبل",
    kn:"ನಕಲಿ ಆರ್ಗ್ಯಾನಿಕ್ ಆಹಾರ ಲೇಬಲ್",
    or:"ଭୁଆ ଓର୍ଗାନିକ୍ ଖାଦ୍ୟ ଲେବେଲ୍",
    ml:"വ്യാജ ഓർഗാനിക് ഭക്ഷ്യ ലേബൽ",
    pa:"ਨਕਲੀ ਆਰਗੈਨਿਕ ਫੂਡ ਲੇਬਲ",
    as:"ভুৱা অর্গানিক খাদ্য লেবেল",
    sa:"कूटसेंद्रियभोजनलेबलम्"
  },
  sec:"FSS Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unlicensed Catering Service",
    hi:"बिना लाइसेंस कैटरिंग सेवा",
    bn:"লাইসেন্সবিহীন ক্যাটারিং পরিষেবা",
    te:"లైసెన్స్ లేని క్యాటరింగ్ సేవ",
    mr:"परवाना नसलेली केटरिंग सेवा",
    ta:"உரிமம் இல்லா கேட்டரிங் சேவை",
    gu:"લાઇસન્સ વિના કેટરિંગ સેવા",
    ur:"بغیر لائسنس کیٹرنگ سروس",
    kn:"ಪರವಾನಗಿ ಇಲ್ಲದ ಕ್ಯಾಟರಿಂಗ್ ಸೇವೆ",
    or:"ଲାଇସେନ୍ସ ନଥିବା କେଟରିଂ ସେବା",
    ml:"ലൈസൻസ് ഇല്ലാത്ത കാറ്ററിംഗ് സേവനം",
    pa:"ਬਿਨਾਂ ਲਾਇਸੈਂਸ ਕੈਟਰਿੰਗ ਸੇਵਾ",
    as:"লাইচেন্স নথকা কেটাৰিং সেৱা",
    sa:"अननुज्ञातपाकसेवा"
  },
  sec:"FSS Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Illegal Slum Eviction",
    hi:"अवैध झुग्गी बेदखली",
    bn:"অবৈধ বস্তি উচ্ছেদ",
    te:"అక్రమ స్లమ్ ఖాళీ చేయడం",
    mr:"बेकायदेशीर झोपडपट्टी हटवणे",
    ta:"சட்டவிரோத குடிசை அகற்றல்",
    gu:"અવૈધ ઝૂંપડપટ્ટી ખસેડવું",
    ur:"غیر قانونی کچی آبادی بے دخلی",
    kn:"ಅಕ್ರಮ ಸ್ಲಮ್ ತೆರವು",
    or:"ଅବୈଧ ଝୁପଡ଼ି ଉଚ୍ଛେଦ",
    ml:"നിയമവിരുദ്ധ ചേരിപ്പുറം ഒഴിപ്പിക്കൽ",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਝੁੱਗੀ ਹਟਾਉਣਾ",
    as:"অবৈধ বস্তি উচ্ছেদ",
    sa:"अवैधकुटीरनिष्कासनम्"
  },
  sec:"IPC / Housing Laws",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Housing Scheme",
    hi:"फर्जी आवास योजना",
    bn:"ভুয়া আবাসন প্রকল্প",
    te:"నకిలీ గృహ పథకం",
    mr:"बनावट गृहनिर्माण योजना",
    ta:"போலி வீட்டு திட்டம்",
    gu:"નકલી આવાસ યોજના",
    ur:"جعلی رہائشی اسکیم",
    kn:"ನಕಲಿ ವಸತಿ ಯೋಜನೆ",
    or:"ଭୁଆ ଆବାସ ଯୋଜନା",
    ml:"വ്യാജ ഭവന പദ്ധതി",
    pa:"ਨਕਲੀ ਹਾਊਸਿੰਗ ਸਕੀਮ",
    as:"ভুৱা গৃহ নিৰ্মাণ যোজনা",
    sa:"कूटआवासयोजना"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Rent Hike",
    hi:"अनधिकृत किराया वृद्धि",
    bn:"অননুমোদিত ভাড়া বৃদ্ধি",
    te:"అనధికార అద్దె పెంపు",
    mr:"अनधिकृत भाडेवाढ",
    ta:"அனுமதி இல்லா வாடகை உயர்வு",
    gu:"અનધિકૃત ભાડા વધારો",
    ur:"غیر مجاز کرایہ اضافہ",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಬಾಡಿಗೆ ಹೆಚ್ಚಳ",
    or:"ଅନଧିକୃତ ଭଡା ବୃଦ୍ଧି",
    ml:"അനധികൃത വാടക വർധന",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਕਿਰਾਇਆ ਵਾਧਾ",
    as:"অনুমতি নথকা ভাড়া বৃদ্ধি",
    sa:"अननुज्ञातभाडावृद्धिः"
  },
  sec:"Rent Control Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Illegal Tenant Eviction",
    hi:"अवैध किरायेदार बेदखली",
    bn:"অবৈধ ভাড়াটিয়া উচ্ছেদ",
    te:"అక్రమ అద్దెదారు వెలివేత",
    mr:"बेकायदेशीर भाडेकरू हकालपट्टी",
    ta:"சட்டவிரோத வாடகையாளர் வெளியேற்றம்",
    gu:"અવૈધ ભાડુઆત બહાર કાઢવો",
    ur:"غیر قانونی کرایہ دار بے دخلی",
    kn:"ಅಕ್ರಮ ಬಾಡಿಗೆದಾರ ಹೊರಹಾಕುವುದು",
    or:"ଅବୈଧ ଭଡ଼ାଟିଆ ଉଚ୍ଛେଦ",
    ml:"നിയമവിരുദ്ധ വാടകക്കാരൻ ഒഴിപ്പിക്കൽ",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਕਿਰਾਏਦਾਰ ਬੇਦਖਲੀ",
    as:"অবৈধ ভাড়াটীয়া উচ্ছেদ",
    sa:"अवैधभाटकनिष्कासनम्"
  },
  sec:"Rent Control Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Property Tax Receipt",
    hi:"फर्जी संपत्ति कर रसीद",
    bn:"ভুয়া সম্পত্তি কর রসিদ",
    te:"నకిలీ ఆస్తి పన్ను రసీదు",
    mr:"बनावट मालमत्ता कर पावती",
    ta:"போலி சொத்து வரி ரசீது",
    gu:"નકલી મિલકત કર રસીદ",
    ur:"جعلی پراپرٹی ٹیکس رسید",
    kn:"ನಕಲಿ ಆಸ್ತಿ ತೆರಿಗೆ ರಸೀದಿ",
    or:"ଭୁଆ ସମ୍ପତ୍ତି କର ରସିଦ",
    ml:"വ്യാജ സ്വത്ത് നികുതി രസീത്",
    pa:"ਨਕਲੀ ਜਾਇਦਾਦ ਟੈਕਸ ਰਸੀਦ",
    as:"ভুৱা সম্পত্তি কৰ ৰচিদ",
    sa:"कूटसम्पत्तिकररसीदः"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Illegal Street Racing",
    hi:"अवैध सड़क रेसिंग",
    bn:"অবৈধ রাস্তার রেসিং",
    te:"అక్రమ వీధి రేసింగ్",
    mr:"बेकायदेशीर रस्ते शर्यत",
    ta:"சட்டவிரோத தெரு பந்தயம்",
    gu:"અવૈધ સ્ટ્રીટ રેસિંગ",
    ur:"غیر قانونی اسٹریٹ ریسنگ",
    kn:"ಅಕ್ರಮ ಬೀದಿ ರೇಸಿಂಗ್",
    or:"ଅବୈଧ ସଡକ ଦୌଡ଼",
    ml:"നിയമവിരുദ്ധ തെരുവ് റേസിംഗ്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਸੜਕ ਰੇਸਿੰਗ",
    as:"অবৈধ পথ দৌৰ",
    sa:"अवैधरथमार्गधावनम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Vehicle Odometer Tampering",
    hi:"वाहन ओडोमीटर छेड़छाड़",
    bn:"যানবাহনের ওডোমিটার কারসাজি",
    te:"వాహన ఓడోమీటర్ మార్పు",
    mr:"वाहन ओडोमीटर छेडछाड",
    ta:"வாகன ஓடோமீட்டர் மாற்றம்",
    gu:"વાહન ઓડોમિટર ફેરફાર",
    ur:"گاڑی اوڈومیٹر میں ردوبدل",
    kn:"ವಾಹನ ಓಡೋಮೀಟರ್ ತೊಂದರೆ",
    or:"ଯାନ ଓଡୋମିଟର୍ ଛେଡ଼ଛାଡ଼",
    ml:"വാഹന ഓഡോമീറ്റർ കൈകാര്യം",
    pa:"ਵਾਹਨ ਓਡੋਮੀਟਰ ਛੇੜਛਾੜ",
    as:"বাহনৰ ওডোমিটাৰ বিকৃতি",
    sa:"यानमापकविकृतिः"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Vehicle Insurance",
    hi:"फर्जी वाहन बीमा",
    bn:"ভুয়া যানবাহন বীমা",
    te:"నకిలీ వాహన బీమా",
    mr:"बनावट वाहन विमा",
    ta:"போலி வாகன காப்பீடு",
    gu:"નકલી વાહન વીમા",
    ur:"جعلی گاڑی بیمہ",
    kn:"ನಕಲಿ ವಾಹನ ವಿಮೆ",
    or:"ଭୁଆ ଯାନ ବୀମା",
    ml:"വ്യാജ വാഹന ഇൻഷുറൻസ്",
    pa:"ਨਕਲੀ ਵਾਹਨ ਬੀਮਾ",
    as:"ভুৱা বাহন বীমা",
    sa:"कूटयानबीमा"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Driving School",
    hi:"अनधिकृत ड्राइविंग स्कूल",
    bn:"অননুমোদিত ড্রাইভিং স্কুল",
    te:"అనధికార డ్రైవింగ్ స్కూల్",
    mr:"अनधिकृत ड्रायव्हिंग स्कूल",
    ta:"அனுமதி இல்லா ஓட்டுநர் பள்ளி",
    gu:"અનધિકૃત ડ્રાઇવિંગ સ્કૂલ",
    ur:"غیر مجاز ڈرائیونگ اسکول",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಡ್ರೈವಿಂಗ್ ಶಾಲೆ",
    or:"ଅନଧିକୃତ ଡ୍ରାଇଭିଂ ସ୍କୁଲ୍",
    ml:"അനധികൃത ഡ്രൈവിംഗ് സ്കൂൾ",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਡਰਾਈਵਿੰਗ ਸਕੂਲ",
    as:"অনুমতি নথকা ড্ৰাইভিং স্কুল",
    sa:"अननुज्ञातवाहनचालनविद्यालयः"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Fake Emission Certificate",
    hi:"फर्जी प्रदूषण प्रमाणपत्र",
    bn:"ভুয়া দূষণ শংসাপত্র",
    te:"నకిలీ కాలుష్య సర్టిఫికేట్",
    mr:"बनावट प्रदूषण प्रमाणपत्र",
    ta:"போலி மாசு சான்றிதழ்",
    gu:"નકલી પ્રદૂષણ પ્રમાણપત્ર",
    ur:"جعلی آلودگی سرٹیفکیٹ",
    kn:"ನಕಲಿ ಮಾಲಿನ್ಯ ಪ್ರಮಾಣಪತ್ರ",
    or:"ଭୁଆ ପ୍ରଦୂଷଣ ପ୍ରମାଣପତ୍ର",
    ml:"വ്യാജ മലിനീകരണ സർട്ടിഫിക്കറ്റ്",
    pa:"ਨਕਲੀ ਪ੍ਰਦੂਸ਼ਣ ਸਰਟੀਫਿਕੇਟ",
    as:"ভুৱা দূষণ প্ৰমাণপত্ৰ",
    sa:"कूटप्रदूषणप्रमाणपत्रम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Tuition Centre",
    hi:"अवैध ट्यूशन केंद्र",
    bn:"অবৈধ টিউশন কেন্দ্র",
    te:"అక్రమ ట్యూషన్ కేంద్రం",
    mr:"बेकायदेशीर ट्युशन सेंटर",
    ta:"சட்டவிரோத டியூஷன் மையம்",
    gu:"અવૈધ ટ્યુશન સેન્ટર",
    ur:"غیر قانونی ٹیوشن سینٹر",
    kn:"ಅಕ್ರಮ ಟ್ಯೂಷನ್ ಕೇಂದ್ರ",
    or:"ଅବୈଧ ଟ୍ୟୁସନ୍ କେନ୍ଦ୍ର",
    ml:"നിയമവിരുദ്ധ ട്യൂഷൻ സെന്റർ",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਟਿਊਸ਼ਨ ਸੈਂਟਰ",
    as:"অবৈধ টিউচন কেন্দ্ৰ",
    sa:"अवैधशिक्षणकेन्द्रम्"
  },
  sec:"Education Act",
  punishment:{
    en:"Fine / closure",hi:"जुर्माना / बंद",bn:"জরিমানা / বন্ধ",
    te:"జరిమానా / మూసివేత",mr:"दंड / बंद",ta:"அபராதம் / மூடல்",
    gu:"દંડ / બંધ",ur:"جرمانہ / بندش",kn:"ದಂಡ / ಮುಚ್ಚುವುದು",
    or:"ଜରିମାନା / ବନ୍ଦ",ml:"പിഴ / അടച്ചുപൂട്ടൽ",
    pa:"ਜੁਰਮਾਨਾ / ਬੰਦ",as:"জৰিমনা / বন্ধ",sa:"दण्डः / निरोधः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake School Recognition",
    hi:"फर्जी स्कूल मान्यता",
    bn:"ভুয়া স্কুল স্বীকৃতি",
    te:"నకిలీ పాఠశాల గుర్తింపు",
    mr:"बनावट शाळा मान्यता",
    ta:"போலி பள்ளி அங்கீகாரம்",
    gu:"નકલી શાળા માન્યતા",
    ur:"جعلی اسکول منظوری",
    kn:"ನಕಲಿ ಶಾಲಾ ಮಾನ್ಯತೆ",
    or:"ଭୁଆ ବିଦ୍ୟାଳୟ ସ୍ୱୀକୃତି",
    ml:"വ്യാജ സ്കൂൾ അംഗീകാരം",
    pa:"ਨਕਲੀ ਸਕੂਲ ਮਾਨਤਾ",
    as:"ভুৱা বিদ্যালয় স্বীকৃতি",
    sa:"कूटविद्यालयमान्यता"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Exam Hall Cheating Racket",
    hi:"परीक्षा कक्ष नकल गिरोह",
    bn:"পরীক্ষা হলে নকল চক্র",
    te:"పరీక్ష హాల్ మోసపు ముఠా",
    mr:"परीक्षा हॉल नकल रॅकेट",
    ta:"தேர்வு மண்டப மோசடி வலை",
    gu:"પરીક્ષા હોલ નકલ રેકેટ",
    ur:"امتحانی ہال نقل گینگ",
    kn:"ಪರೀಕ್ಷಾ ಸಭಾಂಗಣ ಮೋಸ ಜಾಲ",
    or:"ପରୀକ୍ଷା ହଲ୍ ଠକେଇ ଚକ୍ର",
    ml:"പരീക്ഷാഹാൾ ചതിക്കൂട്ടം",
    pa:"ਇਮਤਿਹਾਨ ਹਾਲ ਨਕਲ ਗਿਰੋਹ",
    as:"পৰীক্ষা হল নকল চক্ৰ",
    sa:"परीक्षागृहकपटचक्रम्"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Question Paper Printing Fraud",
    hi:"प्रश्नपत्र मुद्रण धोखाधड़ी",
    bn:"প্রশ্নপত্র মুদ্রণ জালিয়াতি",
    te:"ప్రశ్నాపత్ర ముద్రణ మోసం",
    mr:"प्रश्नपत्र छपाई घोटाळा",
    ta:"வினாத்தாள் அச்சிடல் மோசடி",
    gu:"પ્રશ્નપત્ર છાપકામ છેતરપિંડી",
    ur:"سوالیہ پرچہ پرنٹنگ فراڈ",
    kn:"ಪ್ರಶ್ನೆ ಪತ್ರ ಮುದ್ರಣ ಮೋಸ",
    or:"ପ୍ରଶ୍ନପତ୍ର ମୁଦ୍ରଣ ଠକେଇ",
    ml:"ചോദ്യപേപ്പർ അച്ചടി തട്ടിപ്പ്",
    pa:"ਪ੍ਰਸ਼ਨ ਪੱਤਰ ਛਪਾਈ ਧੋਖਾਧੜੀ",
    as:"প্ৰশ্নপত্ৰ ছপা জালিয়াতি",
    sa:"प्रश्नपत्रमुद्रणछलनम्"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Teacher Appointment",
    hi:"फर्जी शिक्षक नियुक्ति",
    bn:"ভুয়া শিক্ষক নিয়োগ",
    te:"నకిలీ ఉపాధ్యాయ నియామకం",
    mr:"बनावट शिक्षक नियुक्ती",
    ta:"போலி ஆசிரியர் நியமனம்",
    gu:"નકલી શિક્ષક નિમણૂક",
    ur:"جعلی استاد تقرری",
    kn:"ನಕಲಿ ಶಿಕ್ಷಕ ನೇಮಕ",
    or:"ଭୁଆ ଶିକ୍ଷକ ନିଯୁକ୍ତି",
    ml:"വ്യാജ അധ്യാപക നിയമനം",
    pa:"ਨਕਲੀ ਅਧਿਆਪਕ ਨਿਯੁਕਤੀ",
    as:"ভুৱা শিক্ষক নিযুক্তি",
    sa:"कूटशिक्षकनियुक्तिः"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Fake NGO Donation Campaign",
    hi:"फर्जी एनजीओ दान अभियान",
    bn:"ভুয়া এনজিও দান প্রচার",
    te:"నకిలీ ఎన్‌జీఓ విరాళ ప్రచారం",
    mr:"बनावट एनजीओ देणगी मोहीम",
    ta:"போலி NGO நன்கொடை பிரச்சாரம்",
    gu:"નકલી એનજીઓ દાન અભિયાન",
    ur:"جعلی این جی او عطیہ مہم",
    kn:"ನಕಲಿ ಎನ್‌ಜಿಒ ದೇಣಿಗೆ ಅಭಿಯಾನ",
    or:"ଭୁଆ ଏନଜିଓ ଦାନ ଅଭିଯାନ",
    ml:"വ്യാജ എൻജിഒ സംഭാവന പ്രചാരണം",
    pa:"ਨਕਲੀ ਐਨਜੀਓ ਦਾਨ ਮੁਹਿੰਮ",
    as:"ভুৱা এনজিঅ’ দান অভিযান",
    sa:"कूटएनजीओदानअभियानम्"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Crowd Donation Collection",
    hi:"अवैध भीड़ दान संग्रह",
    bn:"অবৈধ ভিড় দান সংগ্রহ",
    te:"అక్రమ గుంపు విరాళ సేకరణ",
    mr:"बेकायदेशीर जमाव देणगी संकलन",
    ta:"சட்டவிரோத கூட்ட நன்கொடை சேகரிப்பு",
    gu:"અવૈધ ભીડ દાન સંગ્રહ",
    ur:"غیر قانونی ہجوم چندہ جمع کرنا",
    kn:"ಅಕ್ರಮ ಗುಂಪು ದೇಣಿಗೆ ಸಂಗ್ರಹ",
    or:"ଅବୈଧ ଭିଡ଼ ଦାନ ସଂଗ୍ରହ",
    ml:"നിയമവിരുദ്ധ കൂട്ട സംഭാവന ശേഖരണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਭੀੜ ਦਾਨ ਇਕੱਠਾ",
    as:"অবৈধ জনসমাৱেশ দান সংগ্ৰহ",
    sa:"अवैधसमूहदानसंग्रहः"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Relief Material Distribution",
    hi:"फर्जी राहत सामग्री वितरण",
    bn:"ভুয়া ত্রাণ সামগ্রী বিতরণ",
    te:"నకిలీ సహాయ సామగ్రి పంపిణీ",
    mr:"बनावट मदत साहित्य वितरण",
    ta:"போலி நிவாரண பொருள் விநியோகம்",
    gu:"નકલી રાહત સામગ્રી વિતરણ",
    ur:"جعلی امدادی سامان تقسیم",
    kn:"ನಕಲಿ ಪರಿಹಾರ ಸಾಮಗ್ರಿ ವಿತರಣೆ",
    or:"ଭୁଆ ରାହତ ସାମଗ୍ରୀ ବଣ୍ଟନ",
    ml:"വ്യാജ ദുരിതാശ്വാസ വസ്തു വിതരണം",
    pa:"ਨਕਲੀ ਰਾਹਤ ਸਮੱਗਰੀ ਵੰਡ",
    as:"ভুৱা সাহায্য সামগ্ৰী বিতৰণ",
    sa:"कूटसहाय्यसामग्रीवितरणम्"
  },
  sec:"DM Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Disaster Fund Misuse",
    hi:"आपदा निधि का दुरुपयोग",
    bn:"দুর্যোগ তহবিল অপব্যবহার",
    te:"విపత్తు నిధి దుర్వినియోగం",
    mr:"आपत्ती निधीचा गैरवापर",
    ta:"பேரிடர் நிதி தவறான பயன்பாடு",
    gu:"આપત્તિ ફંડનો દુરુપયોગ",
    ur:"آفتی فنڈ کا غلط استعمال",
    kn:"ವಿಪತ್ತು ನಿಧಿಯ ದುರುಪಯೋಗ",
    or:"ଦୁର୍ଯ୍ୟୋଗ ତହବିଲ୍ ଦୁରୁପଯୋଗ",
    ml:"ദുരന്ത നിധി ദുരുപയോഗം",
    pa:"ਆਫ਼ਤ ਫੰਡ ਦਾ ਦੁਰੁਪਯੋਗ",
    as:"দুৰ্যোগ নিধিৰ অপব্যৱহাৰ",
    sa:"आपत्तिनिधिदुरुपयोगः"
  },
  sec:"DM Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Volunteer Deployment",
    hi:"अनधिकृत स्वयंसेवक तैनाती",
    bn:"অননুমোদিত স্বেচ্ছাসেবক নিয়োগ",
    te:"అనధికార వాలంటీర్ నియామకం",
    mr:"अनधिकृत स्वयंसेवक नेमणूक",
    ta:"அனுமதி இல்லா தன்னார்வலர் நியமனம்",
    gu:"અનધિકૃત સ્વયંસેવક નિમણૂક",
    ur:"غیر مجاز رضاکار تعیناتی",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಸ್ವಯಂಸೇವಕ ನಿಯೋಜನೆ",
    or:"ଅନଧିକୃତ ସ୍ୱଇଚ୍ଛାସେବକ ନିଯୁକ୍ତି",
    ml:"അനധികൃത സന്നദ്ധപ്രവർത്തക നിയോഗം",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਸਵੈਸੇਵਕ ਤਾਇਨਾਤੀ",
    as:"অনুমতি নথকা স্বেচ্ছাসেৱক নিযুক্তি",
    sa:"अननुज्ञातस्वयंसेवकनियोजनम्"
  },
  sec:"DM Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Mobile Repair Franchise",
    hi:"फर्जी मोबाइल मरम्मत फ्रेंचाइज़ी",
    bn:"ভুয়া মোবাইল রিপেয়ার ফ্র্যাঞ্চাইজি",
    te:"నకిలీ మొబైల్ రిపేర్ ఫ్రాంచైజీ",
    mr:"बनावट मोबाईल दुरुस्ती फ्रँचायझी",
    ta:"போலி மொபைல் சர்வீஸ் பிராஞ்சைஸ்",
    gu:"નકલી મોબાઇલ રિપેર ફ્રેન્ચાઇઝ",
    ur:"جعلی موبائل مرمت فرنچائز",
    kn:"ನಕಲಿ ಮೊಬೈಲ್ ರಿಪೇರಿ ಫ್ರಾಂಚೈಸಿ",
    or:"ଭୁଆ ମୋବାଇଲ୍ ମରାମତି ଫ୍ରାଞ୍ଚାଇଜି",
    ml:"വ്യാജ മൊബൈൽ റിപ്പയർ ഫ്രാഞ്ചൈസി",
    pa:"ਨਕਲੀ ਮੋਬਾਈਲ ਮੁਰੰਮਤ ਫ੍ਰੈਂਚਾਈਜ਼ੀ",
    as:"ভুৱা মোবাইল মেৰামতি ফ্ৰেঞ্চাইজি",
    sa:"कूटचलदूरभाषामरम्मतअनुज्ञा"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Refurbished Phone Sold as New",
    hi:"रीफर्बिश्ड फोन को नया बताकर बेचना",
    bn:"রিফারবিশড ফোন নতুন বলে বিক্রি",
    te:"రిఫర్బిష్డ్ ఫోన్ కొత్తగా అమ్మకం",
    mr:"दुरुस्त केलेला फोन नवीन म्हणून विक्री",
    ta:"பழுதுபார்த்த கைபேசி புதியதாக விற்பனை",
    gu:"રિફર્બિશ્ડ ફોનને નવો કહી વેચાણ",
    ur:"ریفربشڈ فون کو نیا بتا کر فروخت",
    kn:"ಪುನಶ್ಚೇತನಗೊಂಡ ಫೋನ್ ಹೊಸದಾಗಿ ಮಾರಾಟ",
    or:"ପୁନଃସଂସ୍କୃତ ଫୋନ୍ ନୂଆ ଭାବେ ବିକ୍ରୟ",
    ml:"പുനർനിർമ്മിത ഫോൺ പുതിയത് എന്ന് വിൽപ്പന",
    pa:"ਰੀਫਰਬਿਸ਼ਡ ਫੋਨ ਨਵਾਂ ਦੱਸ ਕੇ ਵੇਚਣਾ",
    as:"পুনঃসংস্কৃত ফোন নতুন বুলি বিক্ৰী",
    sa:"पुनर्निर्मितदूरवाणीं नूतनवत् विक्रयः"
  },
  sec:"Consumer Protection Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized Service Centre Branding",
    hi:"अनधिकृत सेवा केंद्र ब्रांडिंग",
    bn:"অননুমোদিত সার্ভিস সেন্টার ব্র্যান্ডিং",
    te:"అనధికార సేవా కేంద్ర బ్రాండింగ్",
    mr:"अनधिकृत सेवा केंद्र ब्रँडिंग",
    ta:"அனுமதி இல்லா சேவை மைய பிராண்டிங்",
    gu:"અનધિકૃત સર્વિસ સેન્ટર બ્રાન્ડિંગ",
    ur:"غیر مجاز سروس سینٹر برانڈنگ",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಸೇವಾ ಕೇಂದ್ರ ಬ್ರ್ಯಾಂಡಿಂಗ್",
    or:"ଅନଧିକୃତ ସେବା କେନ୍ଦ୍ର ବ୍ରାଣ୍ଡିଂ",
    ml:"അനധികൃത സർവീസ് സെന്റർ ബ്രാൻഡിംഗ്",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਸਰਵਿਸ ਸੈਂਟਰ ਬ੍ਰਾਂਡਿੰਗ",
    as:"অনুমতি নথকা সেৱা কেন্দ্ৰ ব্ৰ্যান্ডিং",
    sa:"अननुज्ञातसेवाकेन्द्रब्राण्डिङ्"
  },
  sec:"Trademark Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Software License Sale",
    hi:"फर्जी सॉफ्टवेयर लाइसेंस बिक्री",
    bn:"ভুয়া সফটওয়্যার লাইসেন্স বিক্রি",
    te:"నకిలీ సాఫ్ట్‌వేర్ లైసెన్స్ విక్రయం",
    mr:"बनावट सॉफ्टवेअर परवाना विक्री",
    ta:"போலி மென்பொருள் உரிமம் விற்பனை",
    gu:"નકલી સોફ્ટવેર લાઇસન્સ વેચાણ",
    ur:"جعلی سافٹ ویئر لائسنس فروخت",
    kn:"ನಕಲಿ ಸಾಫ್ಟ್‌ವೇರ್ ಪರವಾನಗಿ ಮಾರಾಟ",
    or:"ଭୁଆ ସଫ୍ଟୱେର୍ ଲାଇସେନ୍ସ ବିକ୍ରୟ",
    ml:"വ്യാജ സോഫ്റ്റ്വെയർ ലൈസൻസ് വിൽപ്പന",
    pa:"ਨਕਲੀ ਸਾਫਟਵੇਅਰ ਲਾਇਸੈਂਸ ਵਿਕਰੀ",
    as:"ভুৱা চফ্টৱেৰ লাইচেন্স বিক্ৰী",
    sa:"कूटसङ्गणकअनुज्ञाविक्रयः"
  },
  sec:"Copyright Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Pirated Firmware Installation",
    hi:"पायरेटेड फर्मवेयर इंस्टॉलेशन",
    bn:"পাইরেটেড ফার্মওয়্যার ইনস্টলেশন",
    te:"పైరేటెడ్ ఫర్మ్‌వేర్ ఇన్‌స్టాలేషన్",
    mr:"पायरेटेड फर्मवेअर इंस्टॉलेशन",
    ta:"பைரேட் ஃபெர்ம்வேர் நிறுவல்",
    gu:"પાયરેટેડ ફર્મવેર ઇન્સ્ટોલેશન",
    ur:"پائریٹڈ فرم ویئر انسٹالیشن",
    kn:"ಪೈರೇಟೆಡ್ ಫರ್ಮ್‌ವೇರ್ ಸ್ಥಾಪನೆ",
    or:"ପାଇରେଟେଡ୍ ଫର୍ମୱେୟାର୍ ସ୍ଥାପନ",
    ml:"പൈറേറ്റഡ് ഫർമ്വെയർ ഇൻസ്റ്റലേഷൻ",
    pa:"ਪਾਇਰੇਟਡ ਫਰਮਵੇਅਰ ਇੰਸਟਾਲੇਸ਼ਨ",
    as:"পাইৰেটেড ফাৰ্মৱেৰ ইনষ্টলেশ্যন",
    sa:"चौर्यफर्मवेयरस्थापनम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},
{
  name:{
    en:"Illegal Animal Breeding",
    hi:"अवैध पशु प्रजनन",
    bn:"অবৈধ পশু প্রজনন",
    te:"అక్రమ జంతు افزాదన",
    mr:"बेकायदेशीर प्राणी प्रजनन",
    ta:"சட்டவிரோத விலங்கு இனப்பெருக்கம்",
    gu:"અવૈધ પશુ પ્રજનન",
    ur:"غیر قانونی جانوروں کی افزائش",
    kn:"ಅಕ್ರಮ ಪ್ರಾಣಿ ಸಂಕರಣೆ",
    or:"ଅବୈଧ ପଶୁ ପ୍ରଜନନ",
    ml:"നിയമവിരുദ്ധ മൃഗ പ്രജനനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਪਸ਼ੂ ਪ੍ਰਜਨਨ",
    as:"অবৈধ পশু প্ৰজনন",
    sa:"अवैधपशुप्रजननम्"
  },
  sec:"PCA Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Pet Trade Without License",
    hi:"बिना लाइसेंस पालतू पशु व्यापार",
    bn:"লাইসেন্স ছাড়া পোষা প্রাণী বাণিজ্য",
    te:"లైసెన్స్ లేకుండా పెంపుడు జంతు వ్యాపారం",
    mr:"परवाना नसलेला पाळीव प्राणी व्यापार",
    ta:"உரிமம் இல்லா செல்லப்பிராணி விற்பனை",
    gu:"લાઇસન્સ વગર પાળતુ પ્રાણી વેપાર",
    ur:"بغیر لائسنس پالتو جانوروں کی تجارت",
    kn:"ಪರವಾನಗಿ ಇಲ್ಲದ ಪಾಳುಪ್ರಾಣಿ ವ್ಯಾಪಾರ",
    or:"ଲାଇସେନ୍ସ ବିନା ପାଳିତ ପଶୁ ବ୍ୟବସାୟ",
    ml:"ലൈസൻസ് ഇല്ലാത്ത വളർത്തുമൃഗ വ്യാപാരം",
    pa:"ਲਾਇਸੈਂਸ ਤੋਂ ਬਿਨਾਂ ਪਾਲਤੂ ਪਸ਼ੂ ਵਪਾਰ",
    as:"লাইচেন্স নথকা পোহনীয়া পশু ব্যৱসায়",
    sa:"अननुज्ञातपालितपशुव्यापारः"
  },
  sec:"PCA Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Fake Veterinary Certificate",
    hi:"फर्जी पशु चिकित्सकीय प्रमाणपत्र",
    bn:"ভুয়া পশু চিকিৎসা সনদ",
    te:"నకిలీ వెటర్నరీ సర్టిఫికేట్",
    mr:"बनावट पशुवैद्यकीय प्रमाणपत्र",
    ta:"போலி கால்நடை சான்றிதழ்",
    gu:"નકલી પશુચિકિત્સા પ્રમાણપત્ર",
    ur:"جعلی ویٹرنری سرٹیفکیٹ",
    kn:"ನಕಲಿ ಪಶುವೈದ್ಯಕೀಯ ಪ್ರಮಾಣಪತ್ರ",
    or:"ଭୁଆ ପଶୁଚିକିତ୍ସା ପ୍ରମାଣପତ୍ର",
    ml:"വ്യാജ വെറ്ററിനറി സർട്ടിഫിക്കറ്റ്",
    pa:"ਨਕਲੀ ਵੈਟਰਨਰੀ ਸਰਟੀਫਿਕੇਟ",
    as:"ভুৱা পশু চিকিৎসা প্ৰমাণপত্ৰ",
    sa:"कूटपशुचिकित्साप्रमाणपत्रम्"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Animal Transport",
    hi:"अवैध पशु परिवहन",
    bn:"অবৈধ পশু পরিবহন",
    te:"అక్రమ జంతు రవాణా",
    mr:"बेकायदेशीर प्राणी वाहतूक",
    ta:"சட்டவிரோத விலங்கு கடத்தல்",
    gu:"અવૈધ પશુ પરિવહન",
    ur:"غیر قانونی جانوروں کی نقل و حمل",
    kn:"ಅಕ್ರಮ ಪ್ರಾಣಿ ಸಾಗಣೆ",
    or:"ଅବୈଧ ପଶୁ ପରିବହନ",
    ml:"നിയമവിരുദ്ധ മൃഗ ഗതാഗതം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਪਸ਼ੂ ਆਵਾਜਾਈ",
    as:"অবৈধ পশু পৰিবহণ",
    sa:"अवैधपशुपरिवहनम्"
  },
  sec:"Transport Rules",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Slaughterhouse Hygiene Violation",
    hi:"वधशाला स्वच्छता उल्लंघन",
    bn:"জবাইখানা স্বাস্থ্যবিধি লঙ্ঘন",
    te:"వధశాల పరిశుభ్రత ఉల్లంఘన",
    mr:"कत्तलखाना स्वच्छता उल्लंघन",
    ta:"வதைசாலை சுகாதார மீறல்",
    gu:"વધશાળા સ્વચ્છતા ભંગ",
    ur:"ذبح خانے کی صفائی کی خلاف ورزی",
    kn:"ವಧಾಗೃಹ ಸ್ವಚ್ಛತೆ ಉಲ್ಲಂಘನೆ",
    or:"ବଧଶାଳା ସ୍ୱଚ୍ଛତା ଉଲ୍ଲଂଘନ",
    ml:"കശാപ്പുശാല ശുചിത്വ ലംഘനം",
    pa:"ਕਸਾਈਖਾਨਾ ਸਫ਼ਾਈ ਉਲੰਘਣਾ",
    as:"বধশালাৰ পৰিচ্ছন্নতা উলংঘন",
    sa:"वधशालाशौचउल्लंघनम्"
  },
  sec:"FSS Act",
  punishment:{
    en:"Fine / closure",hi:"जुर्माना / बंद",bn:"জরিমানা / বন্ধ",
    te:"జరిమానా / మూసివేత",mr:"दंड / बंद",ta:"அபராதம் / மூடல்",
    gu:"દંડ / બંધ",ur:"جرمانہ / بندش",kn:"ದಂಡ / ಮುಚ್ಚುವಿಕೆ",
    or:"ଜରିମାନା / ବନ୍ଦ",ml:"പിഴ / അടച്ചുപൂട്ടൽ",
    pa:"ਜੁਰਮਾਨਾ / ਬੰਦ",as:"জৰিমনা / বন্ধ",sa:"दण्डः / निरोधनम्"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Job Portal",
    hi:"फर्जी नौकरी पोर्टल",
    bn:"ভুয়া চাকরি পোর্টাল",
    te:"నకిలీ ఉద్యోగ పోర్టల్",
    mr:"बनावट नोकरी पोर्टल",
    ta:"போலி வேலைவாய்ப்பு இணையதளம்",
    gu:"નકલી નોકરી પોર્ટલ",
    ur:"جعلی جاب پورٹل",
    kn:"ನಕಲಿ ಉದ್ಯೋಗ ಪೋರ್ಟಲ್",
    or:"ଭୁଆ ଚାକିରି ପୋର୍ଟାଲ",
    ml:"വ്യാജ ജോബ് പോർട്ടൽ",
    pa:"ਨਕਲੀ ਨੌਕਰੀ ਪੋਰਟਲ",
    as:"ভুৱা চাকৰি পোৰ্টেল",
    sa:"कूटनियोजनपोर्टलम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Resume Data Theft",
    hi:"रिज़्यूमे डेटा चोरी",
    bn:"রেজিউমে ডেটা চুরি",
    te:"రెజ్యూమ్ డేటా దొంగతనం",
    mr:"रेझ्युमे डेटा चोरी",
    ta:"ரெசுமே தரவு திருட்டு",
    gu:"રિઝ્યુમે ડેટા ચોરી",
    ur:"ریزیوم ڈیٹا چوری",
    kn:"ರೆಸ್ಯೂಮ್ ಡೇಟಾ ಕಳ್ಳತನ",
    or:"ରେଜ୍ୟୁମେ ତଥ୍ୟ ଚୋରି",
    ml:"റെസ്യൂം ഡാറ്റ മോഷണം",
    pa:"ਰਿਜ਼ਿਊਮੇ ਡਾਟਾ ਚੋਰੀ",
    as:"ৰিজিউমে ডাটা চুৰি",
    sa:"जीवनवृत्तदत्तचौर्यम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Online Interview Scam",
    hi:"ऑनलाइन साक्षात्कार घोटाला",
    bn:"অনলাইন ইন্টারভিউ প্রতারণা",
    te:"ఆన్‌లైన్ ఇంటర్వ్యూ మోసం",
    mr:"ऑनलाईन मुलाखत घोटाळा",
    ta:"ஆன்லைன் நேர்முகத் தேர்வு மோசடி",
    gu:"ઓનલાઇન ઇન્ટરવ્યૂ કૌભાંડ",
    ur:"آن لائن انٹرویو فراڈ",
    kn:"ಆನ್‌ಲೈನ್ ಸಂದರ್ಶನ ವಂಚನೆ",
    or:"ଅନଲାଇନ୍ ସାକ୍ଷାତ୍କାର ଠକେଇ",
    ml:"ഓൺലൈൻ ഇന്റർവ്യൂ തട്ടിപ്പ്",
    pa:"ਆਨਲਾਈਨ ਇੰਟਰਵਿਊ ਧੋਖਾਧੜੀ",
    as:"অনলাইন সাক্ষাৎকাৰ কেলেঙ্কাৰী",
    sa:"आनलाइनसाक्षात्कारवञ्चना"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Offer Letter",
    hi:"फर्जी नियुक्ति पत्र",
    bn:"ভুয়া নিয়োগপত্র",
    te:"నకిలీ నియామక పత్రం",
    mr:"बनावट नियुक्ती पत्र",
    ta:"போலி பணிநியமன கடிதம்",
    gu:"નકલી નિમણૂક પત્ર",
    ur:"جعلی تقرری خط",
    kn:"ನಕಲಿ ನೇಮಕಾತಿ ಪತ್ರ",
    or:"ଭୁଆ ନିଯୁକ୍ତି ପତ୍ର",
    ml:"വ്യാജ നിയമന കത്ത്",
    pa:"ਨਕਲੀ ਨਿਯੁਕਤੀ ਪੱਤਰ",
    as:"ভুৱা নিযুক্তি পত্ৰ",
    sa:"कूटनियुक्तिपत्रम्"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Training Fee Scam",
    hi:"प्रशिक्षण शुल्क घोटाला",
    bn:"প্রশিক্ষণ ফি প্রতারণা",
    te:"శిక్షణ ఫీజు మోసం",
    mr:"प्रशिक्षण शुल्क घोटाळा",
    ta:"பயிற்சி கட்டணம் மோசடி",
    gu:"ટ્રેનિંગ ફી કૌભાંડ",
    ur:"تربیتی فیس فراڈ",
    kn:"ಪ್ರಶಿಕ್ಷಣ ಶುಲ್ಕ ವಂಚನೆ",
    or:"ପ୍ରଶିକ୍ଷଣ ଶୁଳ୍କ ଠକେଇ",
    ml:"പരിശീലന ഫീസ് തട്ടിപ്പ്",
    pa:"ਟ੍ਰੇਨਿੰਗ ਫੀ ਧੋਖਾਧੜੀ",
    as:"প্ৰশিক্ষণ মাচুল কেলেঙ্কাৰী",
    sa:"प्रशिक्षणशुल्कवञ्चना"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Unauthorized Cloud Mining",
    hi:"अनधिकृत क्लाउड माइनिंग",
    bn:"অননুমোদিত ক্লাউড মাইনিং",
    te:"అనుమతి లేని క్లౌడ్ మైనింగ్",
    mr:"अनधिकृत क्लाउड मायनिंग",
    ta:"அனுமதி இல்லா கிளவுட் மைனிங்",
    gu:"અનધિકૃત ક્લાઉડ માઇનિંગ",
    ur:"غیر مجاز کلاؤڈ مائننگ",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಕ್ಲೌಡ್ ಮೈನಿಂಗ್",
    or:"ଅନଧିକୃତ କ୍ଲାଉଡ୍ ମାଇନିଂ",
    ml:"അനുമതിയില്ലാത്ത ക്ലൗഡ് മൈനിംഗ്",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਕਲਾਉਡ ਮਾਈਨਿੰਗ",
    as:"অনুমতি নথকা ক্লাউড মাইনিং",
    sa:"अनधिकृतमेघखननम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake NFT Sale",
    hi:"फर्जी NFT बिक्री",
    bn:"ভুয়া NFT বিক্রি",
    te:"నకిలీ NFT విక్రయం",
    mr:"बनावट NFT विक्री",
    ta:"போலி NFT விற்பனை",
    gu:"નકલી NFT વેચાણ",
    ur:"جعلی NFT فروخت",
    kn:"ನಕಲಿ NFT ಮಾರಾಟ",
    or:"ଭୁଆ NFT ବିକ୍ରୟ",
    ml:"വ്യാജ NFT വിൽപ്പന",
    pa:"ਨਕਲੀ NFT ਵਿਕਰੀ",
    as:"ভুৱা NFT বিক্ৰী",
    sa:"कूटNFTविक्रयः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Metaverse Property Scam",
    hi:"मेटावर्स संपत्ति घोटाला",
    bn:"মেটাভার্স সম্পত্তি প্রতারণা",
    te:"మెటావర్స్ ఆస్తి మోసం",
    mr:"मेटाव्हर्स मालमत्ता घोटाळा",
    ta:"மெட்டாவெர்ஸ் சொத்து மோசடி",
    gu:"મેટાવર્સ સંપત્તિ કૌભાંડ",
    ur:"میٹاورس جائیداد فراڈ",
    kn:"ಮೆಟಾವರ್ಸ್ ಆಸ್ತಿ ವಂಚನೆ",
    or:"ମେଟାଭର୍ସ ସମ୍ପତ୍ତି ଠକେଇ",
    ml:"മെറ്റാവേഴ്‌സ് സ്വത്ത് തട്ടിപ്പ്",
    pa:"ਮੈਟਾਵਰਸ ਜਾਇਦਾਦ ਧੋਖਾਧੜੀ",
    as:"মেটাভাৰ্স সম্পত্তি কেলেঙ্কাৰী",
    sa:"मेटाविश्वसम्पत्तिवञ्चना"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized AI Model Sale",
    hi:"अनधिकृत AI मॉडल बिक्री",
    bn:"অননুমোদিত AI মডেল বিক্রি",
    te:"అనుమతి లేని AI మోడల్ విక్రయం",
    mr:"अनधिकृत AI मॉडेल विक्री",
    ta:"அனுமதி இல்லா AI மாதிரி விற்பனை",
    gu:"અનધિકૃત AI મોડલ વેચાણ",
    ur:"غیر مجاز AI ماڈل فروخت",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ AI ಮಾದರಿ ಮಾರಾಟ",
    or:"ଅନଧିକୃତ AI ମଡେଲ୍ ବିକ୍ରୟ",
    ml:"അനുമതിയില്ലാത്ത AI മോഡൽ വിൽപ്പന",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ AI ਮਾਡਲ ਵਿਕਰੀ",
    as:"অনুমতি নথকা AI মডেল বিক্ৰী",
    sa:"अनधिकृतकृत्रिमबुद्धिमॉडेलविक्रयः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Synthetic Identity Fraud",
    hi:"सिंथेटिक पहचान धोखाधड़ी",
    bn:"সিন্থেটিক পরিচয় প্রতারণা",
    te:"సింథటిక్ గుర్తింపు మోసం",
    mr:"सिंथेटिक ओळख फसवणूक",
    ta:"செயற்கை அடையாள மோசடி",
    gu:"સિંથેટિક ઓળખ ઠગાઈ",
    ur:"مصنوعی شناخت فراڈ",
    kn:"ಸಿಂಥೆಟಿಕ್ ಗುರುತು ವಂಚನೆ",
    or:"କୃତ୍ରିମ ପରିଚୟ ଠକେଇ",
    ml:"സിന്തറ്റിക് തിരിച്ചറിയൽ തട്ടിപ്പ്",
    pa:"ਸਿੰਥੈਟਿਕ ਪਛਾਣ ਧੋਖਾਧੜੀ",
    as:"কৃত্ৰিম পৰিচয় কেলেঙ্কাৰী",
    sa:"कृत्रिमपरिचयवञ्चना"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Solar Power Connection",
    hi:"अवैध सौर विद्युत कनेक्शन",
    bn:"অবৈধ সৌর বিদ্যুৎ সংযোগ",
    te:"అక్రమ సౌర విద్యుత్ కనెక్షన్",
    mr:"बेकायदेशीर सौर वीज जोडणी",
    ta:"சட்டவிரோத சூரிய மின்சார இணைப்பு",
    gu:"અવૈધ સૌર વીજ જોડાણ",
    ur:"غیر قانونی شمسی بجلی کنکشن",
    kn:"ಅಕ್ರಮ ಸೌರ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ",
    or:"ଅବୈଧ ସୌର ବିଦ୍ୟୁତ ସଂଯୋଗ",
    ml:"നിയമവിരുദ്ധ സൗര വൈദ്യുതി ബന്ധം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਸੂਰਜੀ ਬਿਜਲੀ ਕਨੈਕਸ਼ਨ",
    as:"অবৈধ সৌৰ বিদ্যুৎ সংযোগ",
    sa:"अवैधसौरविद्युत्संयोजनम्"
  },
  sec:"Electricity Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Renewable Energy Certificate",
    hi:"फर्जी नवीकरणीय ऊर्जा प्रमाणपत्र",
    bn:"ভুয়া নবায়নযোগ্য শক্তি সনদ",
    te:"నకిలీ పునరుత్పాదక శక్తి సర్టిఫికేట్",
    mr:"बनावट नवीकरणीय ऊर्जा प्रमाणपत्र",
    ta:"போலி புதுப்பிக்கத்தக்க ஆற்றல் சான்றிதழ்",
    gu:"નકલી નવિનીકરણીય ઊર્જા પ્રમાણપત્ર",
    ur:"جعلی قابلِ تجدید توانائی سرٹیفکیٹ",
    kn:"ನಕಲಿ ನವೀಕರಿಸಬಹುದಾದ ಇಂಧನ ಪ್ರಮಾಣಪತ್ರ",
    or:"ଭୁଆ ପୁନର୍ନବୀକରଣ ଶକ୍ତି ପ୍ରମାଣପତ୍ର",
    ml:"വ്യാജ നവീകരണ ഊർജ സർട്ടിഫിക്കറ്റ്",
    pa:"ਨਕਲੀ ਨਵੀਕਰਣਯੋਗ ਊਰਜਾ ਸਰਟੀਫਿਕੇਟ",
    as:"ভুৱা নবীকৰণযোগ্য শক্তি প্ৰমাণপত্ৰ",
    sa:"कूटनवीकरणीयऊर्जाप्रमाणपत्रम्"
  },
  sec:"Energy Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Wind Turbine Land Encroachment",
    hi:"पवन टरबाइन भूमि अतिक्रमण",
    bn:"উইন্ড টারবাইন জমি দখল",
    te:"విండ్ టర్బైన్ భూమి ఆక్రమణ",
    mr:"विंड टर्बाइन जमीन अतिक्रमण",
    ta:"காற்றாலை நில ஆக்கிரமிப்பு",
    gu:"પવન ટર્બાઇન જમીન અતિક્રમણ",
    ur:"ونڈ ٹربائن زمین پر قبضہ",
    kn:"ವಿಂಡ್ ಟರ್ಬೈನ್ ಭೂಮಿ ಅತಿಕ್ರಮಣ",
    or:"ପବନ ଟର୍ବାଇନ୍ ଜମି ଆକ୍ରମଣ",
    ml:"കാറ്റാടി ഭൂമി കൈയേറ്റം",
    pa:"ਵਿੰਡ ਟਰਬਾਈਨ ਜ਼ਮੀਨ ਕਬਜ਼ਾ",
    as:"বায়ু টাৰ্বাইন ভূমি দখল",
    sa:"वातचक्क्रभूम्यतिक्रमणम्"
  },
  sec:"Land Revenue Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Power Grid Tapping",
    hi:"अवैध बिजली ग्रिड टैपिंग",
    bn:"অবৈধ বিদ্যুৎ গ্রিড ট্যাপিং",
    te:"అక్రమ పవర్ గ్రిడ్ ట్యాపింగ్",
    mr:"बेकायदेशीर वीज ग्रीड टॅपिंग",
    ta:"மின்கம்பி சட்டவிரோத இணைப்பு",
    gu:"અવૈધ પાવર ગ્રિડ ટૅપિંગ",
    ur:"غیر قانونی پاور گرڈ ٹیپنگ",
    kn:"ಅಕ್ರಮ ಪವರ್ ಗ್ರಿಡ್ ಟ್ಯಾಪಿಂಗ್",
    or:"ଅବୈଧ ବିଦ୍ୟୁତ ଗ୍ରିଡ୍ ଟ୍ୟାପିଂ",
    ml:"നിയമവിരുദ്ധ വൈദ്യുതി ഗ്രിഡ് ടാപ്പിംഗ്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਪਾਵਰ ਗ੍ਰਿਡ ਟੈਪਿੰਗ",
    as:"অবৈধ বিদ্যুৎ গ্ৰিড টেপিং",
    sa:"अवैधविद्युत्जालसंयोजनम्"
  },
  sec:"Electricity Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Energy Meter Software Manipulation",
    hi:"ऊर्जा मीटर सॉफ्टवेयर में छेड़छाड़",
    bn:"এনার্জি মিটার সফটওয়্যার বিকৃতি",
    te:"ఎనర్జీ మీటర్ సాఫ్ట్‌వేర్ మార్పు",
    mr:"ऊर्जा मीटर सॉफ्टवेअर छेडछाड",
    ta:"மின்மீட்டர் மென்பொருள் மாற்றம்",
    gu:"ઊર્જા મીટર સોફ્ટવેર ચેડછાડ",
    ur:"انرجی میٹر سافٹ ویئر میں چھیڑ چھاڑ",
    kn:"ಎನರ್ಜಿ ಮೀಟರ್ ಸಾಫ್ಟ್‌ವೇರ್ ಕೈಚಳಕ",
    or:"ଏନର୍ଜି ମିଟର ସଫ୍ଟୱେୟାର ଛେଡ଼ଛାଡ଼",
    ml:"എനർജി മീറ്റർ സോഫ്റ്റ്‌വെയർ കൈക്കളി",
    pa:"ਐਨਰਜੀ ਮੀਟਰ ਸਾਫਟਵੇਅਰ ਨਾਲ ਛੇੜਛਾੜ",
    as:"এনাৰ্জি মিটাৰ চফ্টৱেৰ বিকৃতি",
    sa:"ऊर्जामापकसॉफ्टवेयरविकृतिः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
{
  name:{
    en:"Fake Carbon Credit Trading",
    hi:"फर्जी कार्बन क्रेडिट व्यापार",
    bn:"ভুয়া কার্বন ক্রেডিট বাণিজ্য",
    te:"నకిలీ కార్బన్ క్రెడిట్ ట్రేడింగ్",
    mr:"बनावट कार्बन क्रेडिट व्यापार",
    ta:"போலி கார்பன் கிரெடிட் வர்த்தகம்",
    gu:"નકલી કાર્બન ક્રેડિટ વેપાર",
    ur:"جعلی کاربن کریڈٹ تجارت",
    kn:"ನಕಲಿ ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ ವ್ಯಾಪಾರ",
    or:"ଭୁଆ କାର୍ବନ୍ କ୍ରେଡିଟ୍ ବ୍ୟବସାୟ",
    ml:"വ്യാജ കാർബൺ ക്രെഡിറ്റ് വ്യാപാരം",
    pa:"ਨਕਲੀ ਕਾਰਬਨ ਕਰੈਡਿਟ ਵਪਾਰ",
    as:"ভুৱা কাৰ্বন ক্ৰেডিট বাণিজ্য",
    sa:"कूटकार्बनश्रेयव्यापारः"
  },
  sec:"Environment Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Emission Certificate",
    hi:"अवैध उत्सर्जन प्रमाणपत्र",
    bn:"অবৈধ নির্গমন শংসাপত্র",
    te:"అక్రమ ఉద్గార సర్టిఫికేట్",
    mr:"बेकायदेशीर उत्सर्जन प्रमाणपत्र",
    ta:"சட்டவிரோத உமிழ்வு சான்றிதழ்",
    gu:"અવૈધ ઉત્સર્જન પ્રમાણપત્ર",
    ur:"غیر قانونی اخراج سرٹیفکیٹ",
    kn:"ಅಕ್ರಮ ಉತ್ಸರ್ಜನ ಪ್ರಮಾಣಪತ್ರ",
    or:"ଅବୈଧ ନିସ୍ସର୍ଗ ପ୍ରମାଣପତ୍ର",
    ml:"നിയമവിരുദ്ധ ഉത്സർജ സർട്ടിഫിക്കറ്റ്",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਉਤਸਰਜਨ ਸਰਟੀਫਿਕੇਟ",
    as:"অবৈধ নিৰ্গমন প্ৰমাণপত্ৰ",
    sa:"अवैधनिःसारणप्रमाणपत्रम्"
  },
  sec:"Environment Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Industrial Smoke Concealment",
    hi:"औद्योगिक धुआँ छिपाना",
    bn:"শিল্প ধোঁয়া গোপনকরণ",
    te:"పారిశ్రామిక పొగ దాచివేత",
    mr:"औद्योगिक धूर लपविणे",
    ta:"தொழிற்சாலை புகை மறைத்தல்",
    gu:"ઔદ્યોગિક ધુમાડો છુપાવવો",
    ur:"صنعتی دھواں چھپانا",
    kn:"ಕೈಗಾರಿಕಾ ಹೊಗೆ ಮರೆಮಾಚುವುದು",
    or:"ଔଦ୍ୟୋଗିକ ଧୂଆଁ ଲୁଚାଇବା",
    ml:"വ്യവസായ പുക മറയ്ക്കൽ",
    pa:"ਉਦਯੋਗਿਕ ਧੂੰਆਂ ਛੁਪਾਉਣਾ",
    as:"ঔদ্যোগিক ধোঁৱা লুকুৱোৱা",
    sa:"औद्योगिकधूमगोपनम्"
  },
  sec:"Air Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Hazard Gas Storage",
    hi:"अवैध खतरनाक गैस भंडारण",
    bn:"অবৈধ বিপজ্জনক গ্যাস সংরক্ষণ",
    te:"అక్రమ ప్రమాదకర వాయు నిల్వ",
    mr:"बेकायदेशीर धोकादायक वायू साठवण",
    ta:"ஆபத்தான வாயு சட்டவிரோத சேமிப்பு",
    gu:"અવૈધ જોખમી ગેસ સંગ્રહ",
    ur:"غیر قانونی خطرناک گیس ذخیرہ",
    kn:"ಅಕ್ರಮ ಅಪಾಯಕಾರಿ ಅನಿಲ ಸಂಗ್ರಹ",
    or:"ଅବୈଧ ବିପଜ୍ଜନକ ଗ୍ୟାସ ସଂରକ୍ଷଣ",
    ml:"നിയമവിരുദ്ധ അപകടകരമായ വാതക സംഭരണം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਖਤਰਨਾਕ ਗੈਸ ਸਟੋਰੇਜ",
    as:"অবৈধ বিপজ্জনক গেছ সংৰক্ষণ",
    sa:"अवैधविषवायुसंग्रहः"
  },
  sec:"Factories Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Pollution Clearance",
    hi:"फर्जी प्रदूषण स्वीकृति",
    bn:"ভুয়া দূষণ অনুমোদন",
    te:"నకిలీ కాలుష్య అనుమతి",
    mr:"बनावट प्रदूषण मंजुरी",
    ta:"போலி மாசு அனுமதி",
    gu:"નકલી પ્રદૂષણ મંજૂરી",
    ur:"جعلی آلودگی کلیئرنس",
    kn:"ನಕಲಿ ಮಾಲಿನ್ಯ ಅನುಮತಿ",
    or:"ଭୁଆ ପ୍ରଦୂଷଣ ଅନୁମତି",
    ml:"വ്യാജ മലിനീകരണ അനുമതി",
    pa:"ਨਕਲੀ ਪ੍ਰਦੂਸ਼ਣ ਮਨਜ਼ੂਰੀ",
    as:"ভুৱা প্ৰদূষণ অনুমতি",
    sa:"कूटप्रदूषणस्वीकृतिः"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unregistered Labour Contractor",
    hi:"अपंजीकृत श्रम ठेकेदार",
    bn:"নিবন্ধনহীন শ্রম ঠিকাদার",
    te:"నమోదు లేని కార్మిక కాంట్రాక్టర్",
    mr:"नोंदणी नसलेला कामगार ठेकेदार",
    ta:"பதிவு இல்லா தொழிலாளர் ஒப்பந்ததாரர்",
    gu:"નોંધણી વગરનો મજૂર કોન્ટ્રાકટર",
    ur:"غیر رجسٹرڈ لیبر ٹھیکیدار",
    kn:"ನೋಂದಣಿ ಇಲ್ಲದ ಕಾರ್ಮಿಕ ಗುತ್ತಿಗೆದಾರ",
    or:"ଅପଞ୍ଜିକୃତ ଶ୍ରମ ଠିକାଦାର",
    ml:"രജിസ്റ്റർ ചെയ്യാത്ത തൊഴിലാളി കരാറുകാരൻ",
    pa:"ਗੈਰ-ਰਜਿਸਟਰਡ ਮਜ਼ਦੂਰ ਠੇਕੇਦਾਰ",
    as:"নিবন্ধন নথকা শ্ৰম ঠিকাদাৰ",
    sa:"अपंजीकृतश्रमठेकेदारः"
  },
  sec:"Labour Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Wage Slip Forgery",
    hi:"वेतन पर्ची जालसाजी",
    bn:"মজুরি স্লিপ জালিয়াতি",
    te:"జీతపు స్లిప్ నకిలీ",
    mr:"पगार पावती बनावट",
    ta:"ஊதிய சீட்டு போலி",
    gu:"પગાર સ્લિપ નકલી",
    ur:"تنخواہ پرچی جعلسازی",
    kn:"ವೇತನ ಸ್ಲಿಪ್ ನಕಲಿ",
    or:"ବେତନ ସ୍ଲିପ୍ ଜାଲିଆତି",
    ml:"ശമ്പള സ്ലിപ്പ് വ്യാജം",
    pa:"ਤਨਖਾਹ ਸਲਿੱਪ ਜਾਲਸਾਜ਼ੀ",
    as:"দৰমহা চিঠি জালিয়াতি",
    sa:"वेतनपत्रकूटकरणम्"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Overtime Enforcement",
    hi:"अवैध ओवरटाइम लागू करना",
    bn:"অবৈধ অতিরিক্ত সময় বাধ্যবাধকতা",
    te:"అక్రమ ఓవర్‌టైమ్ అమలు",
    mr:"बेकायदेशीर ओव्हरटाईम सक्ती",
    ta:"சட்டவிரோத கூடுதல் நேர வேலை",
    gu:"અવૈધ ઓવરટાઈમ અમલ",
    ur:"غیر قانونی اوور ٹائم نافذ کرنا",
    kn:"ಅಕ್ರಮ ಓವರ್‌ಟೈಮ್ ಜಾರಿ",
    or:"ଅବୈଧ ଅତିରିକ୍ତ କାମ ବାଧ୍ୟତା",
    ml:"നിയമവിരുദ്ധ ഓവർടൈം നിർബന്ധനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਓਵਰਟਾਈਮ ਲਾਗੂ ਕਰਨਾ",
    as:"অবৈধ অতিৰিক্ত কাম বলৱৎ",
    sa:"अवैधअधिककालप्रवर्तनम्"
  },
  sec:"Factories Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",ur:"جرمانہ",
    kn:"ದಂಡ",or:"ଜରିମାନା",ml:"പിഴ",
    pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Workplace Safety Equipment Removal",
    hi:"कार्यस्थल सुरक्षा उपकरण हटाना",
    bn:"কর্মক্ষেত্রের নিরাপত্তা সরঞ্জাম অপসারণ",
    te:"పనిస్థల భద్రతా పరికరాల తొలగింపు",
    mr:"कार्यस्थळी सुरक्षा उपकरण काढणे",
    ta:"பாதுகாப்பு உபகரணம் அகற்றல்",
    gu:"કાર્યસ્થળ સુરક્ષા સાધન દૂર કરવું",
    ur:"کام کی جگہ حفاظتی سامان ہٹانا",
    kn:"ಕಾರ್ಯಸ್ಥಳ ಸುರಕ್ಷತಾ ಉಪಕರಣ ತೆರವು",
    or:"କାର୍ଯ୍ୟସ୍ଥଳ ସୁରକ୍ଷା ସାଧନ ଅପସାରଣ",
    ml:"ജോലിസ്ഥല സുരക്ഷാ ഉപകരണങ്ങൾ നീക്കംചെയ്യൽ",
    pa:"ਕੰਮਕਾਜ ਸਥਾਨ ਸੁਰੱਖਿਆ ਸਾਜੋ-ਸਾਮਾਨ ਹਟਾਉਣਾ",
    as:"কৰ্মক্ষেত্ৰ সুৰক্ষা সঁজুলি আঁতৰোৱা",
    sa:"कार्यस्थलसुरक्षासाधननिष्कासनम्"
  },
  sec:"Factories Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake ESI Registration",
    hi:"फर्जी ESI पंजीकरण",
    bn:"ভুয়া ESI নিবন্ধন",
    te:"నకిలీ ESI నమోదు",
    mr:"बनावट ESI नोंदणी",
    ta:"போலி ESI பதிவு",
    gu:"નકલી ESI નોંધણી",
    ur:"جعلی ESI رجسٹریشن",
    kn:"ನಕಲಿ ESI ನೋಂದಣಿ",
    or:"ଭୁଆ ESI ପଞ୍ଜୀକରଣ",
    ml:"വ്യാജ ESI രജിസ്ട്രേഷൻ",
    pa:"ਨਕਲੀ ESI ਰਜਿਸਟ੍ਰੇਸ਼ਨ",
    as:"ভুৱা ESI পঞ্জীয়ন",
    sa:"कूटESIपंजीकरणम्"
  },
  sec:"ESI Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
 {
  name:{
    en:"Illegal Clinical Waste Transport",
    hi:"अवैध चिकित्सीय अपशिष्ट परिवहन",
    bn:"অবৈধ চিকিৎসা বর্জ্য পরিবহন",
    te:"అక్రమ వైద్య వ్యర్థ రవాణా",
    mr:"बेकायदेशीर वैद्यकीय कचरा वाहतूक",
    ta:"சட்டவிரோத மருத்துவ கழிவு கடத்தல்",
    gu:"અવૈધ તબીબી કચરો પરિવહન",
    ur:"غیر قانونی طبی فضلہ نقل و حمل",
    kn:"ಅಕ್ರಮ ವೈದ್ಯಕೀಯ ತ್ಯಾಜ್ಯ ಸಾಗಣೆ",
    or:"ଅବୈଧ ଚିକିତ୍ସା ବର୍ଜ୍ୟ ପରିବହନ",
    ml:"നിയമവിരുദ്ധ മെഡിക്കൽ മാലിന്യ ഗതാഗതം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਮੈਡੀਕਲ ਕਚਰਾ ਆਵਾਜਾਈ",
    as:"অবৈধ চিকিৎসা আৱৰ্জনা পৰিবহন",
    sa:"अवैधचिकित्साकचरसञ्चलनम्"
  },
  sec:"BMW Rules",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Blood Test Report",
    hi:"फर्जी रक्त परीक्षण रिपोर्ट",
    bn:"ভুয়া রক্ত পরীক্ষার রিপোর্ট",
    te:"నకిలీ రక్త పరీక్ష నివేదిక",
    mr:"बनावट रक्त तपासणी अहवाल",
    ta:"போலி இரத்த பரிசோதனை அறிக்கை",
    gu:"નકલી રક્ત પરીક્ષણ અહેવાલ",
    ur:"جعلی خون کے ٹیسٹ کی رپورٹ",
    kn:"ನಕಲಿ ರಕ್ತ ಪರೀಕ್ಷಾ ವರದಿ",
    or:"ଭୁଆ ରକ୍ତ ପରୀକ୍ଷା ରିପୋର୍ଟ",
    ml:"വ്യാജ രക്തപരിശോധന റിപ്പോർട്ട്",
    pa:"ਨਕਲੀ ਖੂਨ ਜਾਂਚ ਰਿਪੋਰਟ",
    as:"ভুৱা ৰক্ত পৰীক্ষা প্ৰতিবেদন",
    sa:"कूटरक्तपरीक्षणप्रतिवेदनम्"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Unauthorized Telemedicine Practice",
    hi:"अनधिकृत टेलीमेडिसिन अभ्यास",
    bn:"অননুমোদিত টেলিমেডিসিন চর্চা",
    te:"అనుమతి లేని టెలిమెడిసిన్ ప్రాక్టీస్",
    mr:"अनधिकृत टेलिमेडिसिन सराव",
    ta:"அனுமதி இல்லா தொலை மருத்துவம்",
    gu:"અનધિકૃત ટેલિમેડિસિન પ્રથા",
    ur:"غیر مجاز ٹیلی میڈیسن پریکٹس",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಟೆಲಿಮೆಡಿಸಿನ್ ಅಭ್ಯಾಸ",
    or:"ଅନନୁମୋଦିତ ଟେଲିମେଡିସିନ୍ ପ୍ରାକ୍ଟିସ୍",
    ml:"അനുമതിയില്ലാത്ത ടെലിമെഡിസിൻ പ്രാക്ടീസ്",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਟੈਲੀਮੈਡੀਸਿਨ ਅਭਿਆਸ",
    as:"অনুমতি নথকা টেলিমেডিচিন অনুশীলন",
    sa:"अनधिकृतदूरचिकित्साप्रयोगः"
  },
  sec:"Medical Council Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Expired Medicine Repackaging",
    hi:"समाप्त दवा पुनः पैकेजिंग",
    bn:"মেয়াদোত্তীর্ণ ওষুধ পুনঃপ্যাকেজিং",
    te:"గడువు ముగిసిన ఔషధాల మళ్లీ ప్యాకింగ్",
    mr:"कालबाह्य औषधांचे पुनर्पॅकेजिंग",
    ta:"காலாவதி மருந்து மறுபேக்கிங்",
    gu:"સમાપ્ત દવાઓનું ફરી પેકિંગ",
    ur:"میعاد ختم شدہ ادویات کی ری پیکنگ",
    kn:"ಅವಧಿ ಮುಗಿದ ಔಷಧ ಮರುಪ್ಯಾಕಿಂಗ್",
    or:"ମেয়ାଦ ସମାପ୍ତ ଔଷଧ ପୁନଃପ୍ୟାକେଜିଂ",
    ml:"കാലഹരണപ്പെട്ട മരുന്ന് പുനർപാക്കിംഗ്",
    pa:"ਮਿਆਦ ਪੁੱਗੀ ਦਵਾਈ ਮੁੜ ਪੈਕਿੰਗ",
    as:"মেয়াদ উকলি যোৱা ঔষধ পুনৰ পেকেজিং",
    sa:"अवधिसमाप्तौषधपुनर्पुटीकरणम्"
  },
  sec:"Drugs Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Health Camp Organization",
    hi:"फर्जी स्वास्थ्य शिविर आयोजन",
    bn:"ভুয়া স্বাস্থ্য শিবির আয়োজন",
    te:"నకిలీ ఆరోగ్య శిబిరం నిర్వహణ",
    mr:"बनावट आरोग्य शिबिर आयोजन",
    ta:"போலி மருத்துவ முகாம்",
    gu:"નકલી આરોગ્ય કેમ્પ આયોજન",
    ur:"جعلی طبی کیمپ کا انعقاد",
    kn:"ನಕಲಿ ಆರೋಗ್ಯ ಶಿಬಿರ ಆಯೋಜನೆ",
    or:"ଭୁଆ ସ୍ୱାସ୍ଥ୍ୟ ଶିବିର ଆୟୋଜନ",
    ml:"വ്യാജ ആരോഗ്യ ക്യാമ്പ് സംഘടിപ്പിക്കൽ",
    pa:"ਨਕਲੀ ਸਿਹਤ ਕੈਂਪ ਆਯੋਜਨ",
    as:"ভুৱা স্বাস্থ্য শিবিৰ আয়োজন",
    sa:"कूटस्वास्थ्यशिविरआयोजनम्"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized Bus Route Operation",
    hi:"अनधिकृत बस मार्ग संचालन",
    bn:"অননুমোদিত বাস রুট পরিচালনা",
    te:"అనుమతి లేని బస్ మార్గం నిర్వహణ",
    mr:"अनधिकृत बस मार्ग संचालन",
    ta:"அனுமதி இல்லா பேருந்து வழித்தடம்",
    gu:"અનધિકૃત બસ રૂટ સંચાલન",
    ur:"غیر مجاز بس روٹ آپریشن",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಬಸ್ ಮಾರ್ಗ ಕಾರ್ಯಾಚರಣೆ",
    or:"ଅନନୁମୋଦିତ ବସ୍ ରୁଟ୍ ପରିଚାଳନା",
    ml:"അനുമതിയില്ലാത്ത ബസ് റൂട്ട് പ്രവർത്തനം",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਬੱਸ ਰੂਟ ਚਲਾਉਣਾ",
    as:"অনুমতি নথকা বাছ পথ পৰিচালনা",
    sa:"अनधिकृतबसमार्गसञ्चालनम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Transport Permit",
    hi:"फर्जी परिवहन परमिट",
    bn:"ভুয়া পরিবহন পারমিট",
    te:"నకిలీ రవాణా అనుమతి",
    mr:"बनावट परिवहन परवाना",
    ta:"போலி போக்குவரத்து அனுமதி",
    gu:"નકલી પરિવહન પરમિટ",
    ur:"جعلی ٹرانسپورٹ پرمٹ",
    kn:"ನಕಲಿ ಸಾರಿಗೆ ಪರವಾನಗಿ",
    or:"ଭୁଆ ପରିବହନ ଅନୁମତି",
    ml:"വ്യാജ ഗതാഗത അനുമതി",
    pa:"ਨਕਲੀ ਟ੍ਰਾਂਸਪੋਰਟ ਪਰਮਿਟ",
    as:"ভুৱা পৰিবহন অনুমতি",
    sa:"कूटपरिवहनअनुज्ञा"
  },
  sec:"IPC 465",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal School Van Operation",
    hi:"अवैध स्कूल वैन संचालन",
    bn:"অবৈধ স্কুল ভ্যান পরিচালনা",
    te:"అక్రమ స్కూల్ వాన్ నిర్వహణ",
    mr:"बेकायदेशीर शाळा व्हॅन संचालन",
    ta:"சட்டவிரோத பள்ளி வாகனம்",
    gu:"અવૈધ સ્કૂલ વાન સંચાલન",
    ur:"غیر قانونی اسکول وین آپریشن",
    kn:"ಅಕ್ರಮ ಶಾಲಾ ವ್ಯಾನ್ ಕಾರ್ಯಾಚರಣೆ",
    or:"ଅବୈଧ ସ୍କୁଲ୍ ଭାନ୍ ପରିଚାଳନା",
    ml:"നിയമവിരുദ്ധ സ്കൂൾ വാൻ പ്രവർത്തനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਸਕੂਲ ਵੈਨ ਚਲਾਉਣਾ",
    as:"অবৈধ স্কুল ভেন পৰিচালনা",
    sa:"अवैधविद्यालययानसञ्चालनम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"GPS Tracker Manipulation",
    hi:"GPS ट्रैकर छेड़छाड़",
    bn:"GPS ট্র্যাকার বিকৃতি",
    te:"GPS ట్రాకర్ మార్పిడి",
    mr:"GPS ट्रॅकर छेडछाड",
    ta:"GPS கண்காணிப்பு மாற்றம்",
    gu:"GPS ટ્રેકર સાથે છેડછાડ",
    ur:"GPS ٹریکر میں چھیڑ چھاڑ",
    kn:"GPS ಟ್ರ್ಯಾಕರ್ ಕದಡುವಿಕೆ",
    or:"GPS ଟ୍ରାକର୍ ଛେଡ଼ଛାଡ଼",
    ml:"GPS ട്രാക്കർ കൈക്കളവ്",
    pa:"GPS ਟ੍ਰੈਕਰ ਨਾਲ ਛੇੜਛਾੜ",
    as:"GPS ট্ৰেকাৰ বিকৃতি",
    sa:"GPSअनुवर्तनयन्त्रविकृति"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",ur:"قید",
    kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",ml:"തടവ്",
    pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Vehicle Fitness Certificate",
    hi:"फर्जी वाहन फिटनेस प्रमाणपत्र",
    bn:"ভুয়া যান ফিটনেস শংসাপত্র",
    te:"నకిలీ వాహన ఫిట్‌నెస్ సర్టిఫికేట్",
    mr:"बनावट वाहन फिटनेस प्रमाणपत्र",
    ta:"போலி வாகன தகுதி சான்றிதழ்",
    gu:"નકલી વાહન ફિટનેસ પ્રમાણપત્ર",
    ur:"جعلی گاڑی فٹنس سرٹیفکیٹ",
    kn:"ನಕಲಿ ವಾಹನ ಫಿಟ್‌ನೆಸ್ ಪ್ರಮಾಣಪತ್ರ",
    or:"ଭୁଆ ଯାନ ଫିଟନେସ୍ ପ୍ରମାଣପତ୍ର",
    ml:"വ്യാജ വാഹന ഫിറ്റ്നസ് സർട്ടിഫിക്കറ്റ്",
    pa:"ਨਕਲੀ ਵਾਹਨ ਫਿਟਨੈਸ ਸਰਟੀਫਿਕੇਟ",
    as:"ভুৱা বাহন ফিটনেছ প্ৰমাণপত্ৰ",
    sa:"कूटवाहनयोग्यताप्रमाणपत्रम्"
  },
  sec:"MV Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",ta:"அபராதம் / சிறை",
    gu:"દંડ / કેદ",ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},
{
  name:{
    en:"Illegal Coaching Hostel",
    hi:"अवैध कोचिंग छात्रावास",
    bn:"অবৈধ কোচিং হোস্টেল",
    te:"అక్రమ కోచింగ్ హాస్టల్",
    mr:"बेकायदेशीर कोचिंग वसतिगृह",
    ta:"சட்டவிரோத பயிற்சி விடுதி",
    gu:"અવૈધ કોચિંગ હોસ્ટેલ",
    ur:"غیر قانونی کوچنگ ہاسٹل",
    kn:"ಅಕ್ರಮ ಕೋಚಿಂಗ್ ವಸತಿ ಗೃಹ",
    or:"ଅବୈଧ କୋଚିଂ ହୋଷ୍ଟେଲ",
    ml:"നിയമവിരുദ്ധ കോച്ചിംഗ് ഹോസ്റ്റൽ",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਕੋਚਿੰਗ ਹੋਸਟਲ",
    as:"অবৈধ কোচিং হোষ্টেল",
    sa:"अवैधप्रशिक्षणावासः"
  },
  sec:"Education Act",
  punishment:{
    en:"Fine / closure",hi:"जुर्माना / बंदी",bn:"জরিমানা / বন্ধ",
    te:"జరిమానా / మూసివేత",mr:"दंड / बंद",
    ta:"அபராதம் / மூடல்",gu:"દંડ / બંધ",
    ur:"جرمانہ / بندش",kn:"ದಂಡ / ಮುಚ್ಚುವಿಕೆ",
    or:"ଜରିମାନା / ବନ୍ଦ",ml:"പിഴ / അടച്ചുപൂട്ടൽ",
    pa:"ਜੁਰਮਾਨਾ / ਬੰਦ",as:"জৰিমনা / বন্ধ",sa:"दण्डः / निरोधनम्"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Student Attendance Records",
    hi:"फर्जी छात्र उपस्थिति रिकॉर्ड",
    bn:"ভুয়া ছাত্র উপস্থিতি নথি",
    te:"నకిలీ విద్యార్థి హాజరు రికార్డులు",
    mr:"बनावट विद्यार्थी उपस्थिती नोंदी",
    ta:"போலி மாணவர் வருகை பதிவு",
    gu:"નકલી વિદ્યાર્થી હાજરી નોંધ",
    ur:"جعلی طالب علم حاضری ریکارڈ",
    kn:"ನಕಲಿ ವಿದ್ಯಾರ್ಥಿ ಹಾಜರಿ ದಾಖಲೆ",
    or:"ଭୁଆ ଛାତ୍ର ଉପସ୍ଥିତି ରେକର୍ଡ",
    ml:"വ്യാജ വിദ്യാർത്ഥി ഹാജർ രേഖ",
    pa:"ਨਕਲੀ ਵਿਦਿਆਰਥੀ ਹਾਜ਼ਰੀ ਰਿਕਾਰਡ",
    as:"ভুৱা ছাত্ৰ উপস্থিতি নথি",
    sa:"कूटछात्रउपस्थितिलेखः"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized Online Exam Platform",
    hi:"अनधिकृत ऑनलाइन परीक्षा मंच",
    bn:"অননুমোদিত অনলাইন পরীক্ষা প্ল্যাটফর্ম",
    te:"అనుమతి లేని ఆన్‌లైన్ పరీక్ష వేదిక",
    mr:"अनधिकृत ऑनलाइन परीक्षा व्यासपीठ",
    ta:"அனுமதி இல்லா ஆன்லைன் தேர்வு தளம்",
    gu:"અનધિકૃત ઓનલાઈન પરીક્ષા પ્લેટફોર્મ",
    ur:"غیر مجاز آن لائن امتحانی پلیٹ فارم",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷಾ ವೇದಿಕೆ",
    or:"ଅନନୁମୋଦିତ ଅନଲାଇନ୍ ପରୀକ୍ଷା ପ୍ଲାଟଫର୍ମ",
    ml:"അനുമതിയില്ലാത്ത ഓൺലൈൻ പരീക്ഷ പ്ലാറ്റ്ഫോം",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਆਨਲਾਈਨ ਇਮਤਿਹਾਨ ਪਲੇਟਫਾਰਮ",
    as:"অনুমতি নথকা অনলাইন পৰীক্ষা মঞ্চ",
    sa:"अनधिकृतसञ्जालपरीक्षामञ्चः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Education Board Website",
    hi:"फर्जी शिक्षा बोर्ड वेबसाइट",
    bn:"ভুয়া শিক্ষা বোর্ড ওয়েবসাইট",
    te:"నకిలీ విద్యా మండలి వెబ్‌సైట్",
    mr:"बनावट शिक्षण मंडळ संकेतस्थळ",
    ta:"போலி கல்வி வாரிய இணையதளம்",
    gu:"નકલી શિક્ષણ બોર્ડ વેબસાઇટ",
    ur:"جعلی تعلیمی بورڈ ویب سائٹ",
    kn:"ನಕಲಿ ಶಿಕ್ಷಣ ಮಂಡಳಿ ವೆಬ್‌ಸೈಟ್",
    or:"ଭୁଆ ଶିକ୍ଷା ବୋର୍ଡ୍ ୱେବସାଇଟ୍",
    ml:"വ്യാജ വിദ്യാഭ്യാസ ബോർഡ് വെബ്സൈറ്റ്",
    pa:"ਨਕਲੀ ਸਿੱਖਿਆ ਬੋਰਡ ਵੈੱਬਸਾਈਟ",
    as:"ভুৱা শিক্ষা বোৰ্ড ৱেবছাইট",
    sa:"कूटशिक्षामण्डलजालस्थलम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Illegal Private University Operation",
    hi:"अवैध निजी विश्वविद्यालय संचालन",
    bn:"অবৈধ বেসরকারি বিশ্ববিদ্যালয় পরিচালনা",
    te:"అక్రమ ప్రైవేట్ విశ్వవిద్యాలయం నిర్వహణ",
    mr:"बेकायदेशीर खाजगी विद्यापीठ संचालन",
    ta:"சட்டவிரோத தனியார் பல்கலை",
    gu:"અવૈધ ખાનગી યુનિવર્સિટી સંચાલન",
    ur:"غیر قانونی نجی یونیورسٹی آپریشن",
    kn:"ಅಕ್ರಮ ಖಾಸಗಿ ವಿಶ್ವವಿದ್ಯಾಲಯ ಕಾರ್ಯಾಚರಣೆ",
    or:"ଅବୈଧ ବେସରକାରୀ ବିଶ୍ୱବିଦ୍ୟାଳୟ ପରିଚାଳନା",
    ml:"നിയമവിരുദ്ധ സ്വകാര്യ സർവകലാശാല പ്രവർത്തനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਨਿੱਜੀ ਯੂਨੀਵਰਸਿਟੀ ਚਲਾਉਣਾ",
    as:"অবৈধ ব্যক্তিগত বিশ্ববিদ্যালয় পৰিচালনা",
    sa:"अवैधनिजीविश्वविद्यालयसञ्चालनम्"
  },
  sec:"UGC Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Consumer Complaint Portal",
    hi:"फर्जी उपभोक्ता शिकायत पोर्टल",
    bn:"ভুয়া ভোক্তা অভিযোগ পোর্টাল",
    te:"నకిలీ వినియోగదారు ఫిర్యాదు పోర్టల్",
    mr:"बनावट ग्राहक तक्रार पोर्टल",
    ta:"போலி நுகர்வோர் புகார் தளம்",
    gu:"નકલી ગ્રાહક ફરિયાદ પોર્ટલ",
    ur:"جعلی صارف شکایت پورٹل",
    kn:"ನಕಲಿ ಗ್ರಾಹಕ ದೂರು ಪೋರ್ಟಲ್",
    or:"ଭୁଆ ଉପଭୋକ୍ତା ଅଭିଯୋଗ ପୋର୍ଟାଲ୍",
    ml:"വ്യാജ ഉപഭോക്തൃ പരാതി പോർട്ടൽ",
    pa:"ਨਕਲੀ ਉਪਭੋਗਤਾ ਸ਼ਿਕਾਇਤ ਪੋਰਟਲ",
    as:"ভুৱা গ্ৰাহক অভিযোগ পোৰ্টেল",
    sa:"कूटउपभोक्तृशिकायतद्वारम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Misleading Online Discount",
    hi:"भ्रामक ऑनलाइन छूट",
    bn:"ভ্রান্তিকর অনলাইন ছাড়",
    te:"తప్పుదారి పట్టించే ఆన్‌లైన్ డిస్కౌంట్",
    mr:"भ्रामक ऑनलाइन सवलत",
    ta:"தவறான ஆன்லைன் தள்ளுபடி",
    gu:"ભ્રામક ઓનલાઈન ડિસ્કાઉન્ટ",
    ur:"گمراہ کن آن لائن رعایت",
    kn:"ತಪ್ಪು ದಾರಿ ತೋರಿಸುವ ಆನ್‌ಲೈನ್ ರಿಯಾಯಿತಿ",
    or:"ଭ୍ରମଜନକ ଅନଲାଇନ୍ ଛୁଟ",
    ml:"വഞ്ചനാപരമായ ഓൺലൈൻ ഇളവ്",
    pa:"ਗੁਮਰਾਹ ਕਰਨ ਵਾਲੀ ਆਨਲਾਈਨ ਛੂਟ",
    as:"ভ্ৰান্তিকৰ অনলাইন ৰেহাই",
    sa:"भ्रमजनकसञ्जालछूटः"
  },
  sec:"Consumer Protection Act",
  punishment:{
    en:"Fine",hi:"जुर्माना",bn:"জরিমানা",te:"జరిమానా",
    mr:"दंड",ta:"அபராதம்",gu:"દંડ",
    ur:"جرمانہ",kn:"ದಂಡ",or:"ଜରିମାନା",
    ml:"പിഴ",pa:"ਜੁਰਮਾਨਾ",as:"জৰিমনা",sa:"दण्डः"
  },
  lvl:"low"
},

{
  name:{
    en:"Fake Product Comparison Website",
    hi:"फर्जी उत्पाद तुलना वेबसाइट",
    bn:"ভুয়া পণ্য তুলনা ওয়েবসাইট",
    te:"నకిలీ ఉత్పత్తి పోలిక వెబ్‌సైట్",
    mr:"बनावट उत्पादन तुलना संकेतस्थळ",
    ta:"போலி பொருள் ஒப்பீட்டு இணையதளம்",
    gu:"નકલી ઉત્પાદન તુલના વેબસાઇટ",
    ur:"جعلی مصنوعات موازنہ ویب سائٹ",
    kn:"ನಕಲಿ ಉತ್ಪನ್ನ ಹೋಲಿಕೆ ವೆಬ್‌ಸೈಟ್",
    or:"ଭୁଆ ପ୍ରଡକ୍ଟ ତୁଳନା ୱେବସାଇଟ୍",
    ml:"വ്യാജ ഉൽപ്പന്ന താരതമ്യ വെബ്സൈറ്റ്",
    pa:"ਨਕਲੀ ਉਤਪਾਦ ਤੁਲਨਾ ਵੈੱਬਸਾਈਟ",
    as:"ভুৱা পণ্য তুলনা ৱেবছাইট",
    sa:"कूटउत्पादतुलनाजालस्थलम्"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized Subscription Auto-Debit",
    hi:"अनधिकृत सब्सक्रिप्शन ऑटो डेबिट",
    bn:"অননুমোদিত সাবস্ক্রিপশন অটো ডেবিট",
    te:"అనుమతి లేని సబ్‌స్క్రిప్షన్ ఆటో డెబిట్",
    mr:"अनधिकृत सदस्यता ऑटो डेबिट",
    ta:"அனுமதி இல்லா தானியங்கி கட்டணம்",
    gu:"અનધિકૃત સબ્સ્ક્રિપ્શન ઓટો ડેબિટ",
    ur:"غیر مجاز سبسکرپشن آٹو ڈیبٹ",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಚಂದಾದಾರಿಕೆ ಆಟೋ ಡೆಬಿಟ್",
    or:"ଅନନୁମୋଦିତ ସଦସ୍ୟତା ଅଟୋ ଡେବିଟ୍",
    ml:"അനുമതിയില്ലാത്ത സബ്സ്ക്രിപ്ഷൻ ഓട്ടോ ഡെബിറ്റ്",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਆਟੋ ਡੈਬਿਟ",
    as:"অনুমতি নথকা ছাবস্ক্ৰিপচন অটো ডেবিট",
    sa:"अनधिकृतसदस्यतास्वयंकटौती"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Hidden Charges Fraud",
    hi:"छिपे हुए शुल्क धोखाधड़ी",
    bn:"গোপন চার্জ প্রতারণা",
    te:"దాచిన ఛార్జీల మోసం",
    mr:"लपवलेले शुल्क फसवणूक",
    ta:"மறைமுக கட்டண மோசடி",
    gu:"છુપાયેલા ચાર્જ છેતરપિંડી",
    ur:"چھپے ہوئے چارجز فراڈ",
    kn:"ಮರೆಮಾಡಿದ ಶುಲ್ಕ ವಂಚನೆ",
    or:"ଲୁଚିଥିବା ଶୁଳ୍କ ଠକେଇ",
    ml:"മറഞ്ഞ ചാർജ് വഞ്ചന",
    pa:"ਛੁਪੇ ਹੋਏ ਚਾਰਜ ਧੋਖਾਧੜੀ",
    as:"গোপন মাচুল প্ৰতারণা",
    sa:"गूढशुल्कवञ्चना"
  },
  sec:"Consumer Act",
  punishment:{
    en:"Fine / jail",hi:"जुर्माना / कारावास",bn:"জরিমানা / কারাদণ্ড",
    te:"జరిమానా / కారాగారం",mr:"दंड / कारावास",
    ta:"அபராதம் / சிறை",gu:"દંડ / કેદ",
    ur:"جرمانہ / قید",kn:"ದಂಡ / ಕಾರಾಗೃಹ",
    or:"ଜରିମାନା / କାରାଦଣ୍ଡ",ml:"പിഴ / തടവ്",
    pa:"ਜੁਰਮਾਨਾ / ਕੈਦ",as:"জৰিমনা / কাৰাদণ্ড",sa:"दण्डः / कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Research Publication",
    hi:"फर्जी शोध प्रकाशन",
    bn:"ভুয়া গবেষণা প্রকাশনা",
    te:"నకిలీ పరిశోధన ప్రచురణ",
    mr:"बनावट संशोधन प्रकाशन",
    ta:"போலி ஆய்வு வெளியீடு",
    gu:"નકલી સંશોધન પ્રકાશન",
    ur:"جعلی تحقیقی اشاعت",
    kn:"ನಕಲಿ ಸಂಶೋಧನಾ ಪ್ರಕಟಣೆ",
    or:"ଭୁଆ ଗବେଷଣା ପ୍ରକାଶନ",
    ml:"വ്യാജ ഗവേഷണ പ്രസിദ്ധീകരണം",
    pa:"ਨਕਲੀ ਖੋਜ ਪ੍ਰਕਾਸ਼ਨ",
    as:"ভুৱা গৱেষণা প্ৰকাশনা",
    sa:"कूटअनुसन्धानप्रकाशनम्"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Plagiarism for Grants",
    hi:"अनुदान हेतु साहित्यिक चोरी",
    bn:"অনুদানের জন্য সাহিত্য চুরি",
    te:"గ్రాంట్ల కోసం నకలెత్తడం",
    mr:"अनुदानासाठी साहित्य चोरी",
    ta:"மூலநகல் திருட்டு நிதி பெறுதல்",
    gu:"ગ્રાન્ટ માટે નકલચોરી",
    ur:"گرانٹ کے لیے سرقہ",
    kn:"ಗ್ರಾಂಟ್‌ಗಾಗಿ ಪ್ಲಾಗಿಯರಿಸಂ",
    or:"ଅନୁଦାନ ପାଇଁ ପ୍ଲାଜିଆରିଜମ୍",
    ml:"ഗ്രാന്റിനായി മോഷണ രചന",
    pa:"ਗ੍ਰਾਂਟ ਲਈ ਨਕਲ",
    as:"অনুদানৰ বাবে সাহিত্য চুৰি",
    sa:"अनुदानार्थसाहित्यचौर्यम्"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized Human Testing",
    hi:"अनधिकृत मानव परीक्षण",
    bn:"অননুমোদিত মানব পরীক্ষা",
    te:"అనుమతి లేని మానవ పరీక్ష",
    mr:"अनधिकृत मानवी चाचणी",
    ta:"அனுமதி இல்லா மனித சோதனை",
    gu:"અનધિકૃત માનવ પરીક્ષણ",
    ur:"غیر مجاز انسانی تجربہ",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಮಾನವ ಪರೀಕ್ಷೆ",
    or:"ଅନନୁମୋଦିତ ମାନବ ପରୀକ୍ଷଣ",
    ml:"അനുമതിയില്ലാത്ത മനുഷ്യ പരീക്ഷണം",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਮਨੁੱਖੀ ਟੈਸਟ",
    as:"অনুমতি নথকা মানৱ পৰীক্ষা",
    sa:"अनधिकृतमानवपरीक्षणम्"
  },
  sec:"Drugs Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Scientific Equipment Sale",
    hi:"फर्जी वैज्ञानिक उपकरण बिक्री",
    bn:"ভুয়া বৈজ্ঞানিক সরঞ্জাম বিক্রি",
    te:"నకిలీ శాస్త్రీయ పరికరాల అమ్మకం",
    mr:"बनावट वैज्ञानिक उपकरण विक्री",
    ta:"போலி அறிவியல் உபகரணம் விற்பனை",
    gu:"નકલી વૈજ્ઞાનિક સાધન વેચાણ",
    ur:"جعلی سائنسی آلات فروخت",
    kn:"ನಕಲಿ ವೈಜ್ಞಾನಿಕ ಉಪಕರಣ ಮಾರಾಟ",
    or:"ଭୁଆ ବୈଜ୍ଞାନିକ ସାମଗ୍ରୀ ବିକ୍ରୟ",
    ml:"വ്യാജ ശാസ്ത്രീയ ഉപകരണ വിൽപ്പന",
    pa:"ਨਕਲੀ ਵਿਗਿਆਨਕ ਉਪਕਰਨ ਵਿਕਰੀ",
    as:"ভুৱা বৈজ্ঞানিক সঁজুলি বিক্ৰী",
    sa:"कूटवैज्ञानिकोपकरणविक्रयः"
  },
  sec:"IPC 420",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Research Data Fabrication",
    hi:"शोध डेटा गढ़ना",
    bn:"গবেষণা তথ্য জালিয়াতি",
    te:"పరిశోధన డేటా కల్పన",
    mr:"संशोधन डेटा बनावट",
    ta:"ஆய்வு தரவு கற்பனை",
    gu:"સંશોધન ડેટા બનાવટ",
    ur:"تحقیقی ڈیٹا گھڑنا",
    kn:"ಸಂಶೋಧನಾ ಡೇಟಾ ಕೃತಕ ನಿರ್ಮಾಣ",
    or:"ଗବେଷଣା ତଥ୍ୟ ଗଢ଼ନ",
    ml:"ഗവേഷണ ഡാറ്റ കൃത്രിമം",
    pa:"ਖੋਜ ਡਾਟਾ ਘੜਨਾ",
    as:"গৱেষণা তথ্য গঢ়ন",
    sa:"अनुसन्धानदत्तांशकूटनिर्माणम्"
  },
  sec:"IPC",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Illegal Census Enumerator Appointment",
    hi:"अवैध जनगणना गणक नियुक्ति",
    bn:"অবৈধ জনগণনা গণনাকারী নিয়োগ",
    te:"అక్రమ జనగణన లెక్కింపుదారు నియామకం",
    mr:"बेकायदेशीर जनगणना गणक नियुक्ती",
    ta:"சட்டவிரோத கணக்கெடுப்பு நியமனம்",
    gu:"અવૈધ જનગણના ગણતરી નિયુક્તિ",
    ur:"غیر قانونی مردم شماری تقرری",
    kn:"ಅಕ್ರಮ ಜನಗಣತಿ ಗಣಕ ನೇಮಕ",
    or:"ଅବୈଧ ଜନଗଣନା ଗଣକ ନିଯୁକ୍ତି",
    ml:"നിയമവിരുദ്ധ സെൻസസ് എൻ്യൂമറേറ്റർ നിയമനം",
    pa:"ਗੈਰਕਾਨੂੰਨੀ ਜਨਗਣਨਾ ਨਿਯੁਕਤੀ",
    as:"অবৈধ জনগণনা নিযুক্তি",
    sa:"अवैधजनगणनागणकनियुक्तिः"
  },
  sec:"Census Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Fake Government Survey App",
    hi:"फर्जी सरकारी सर्वे ऐप",
    bn:"ভুয়া সরকারি জরিপ অ্যাপ",
    te:"నకిలీ ప్రభుత్వ సర్వే యాప్",
    mr:"बनावट सरकारी सर्वे अ‍ॅप",
    ta:"போலி அரசு சர்வே ஆப்",
    gu:"નકલી સરકારી સર્વે એપ",
    ur:"جعلی سرکاری سروے ایپ",
    kn:"ನಕಲಿ ಸರ್ಕಾರಿ ಸಮೀಕ್ಷಾ ಆಪ್",
    or:"ଭୁଆ ସରକାରୀ ସର୍ଭେ ଆପ୍",
    ml:"വ്യാജ സർക്കാർ സർവേ ആപ്പ്",
    pa:"ਨਕਲੀ ਸਰਕਾਰੀ ਸਰਵੇ ਐਪ",
    as:"ভুৱা চৰকাৰী সমীক্ষা এপ",
    sa:"कूटसरकारीसर्वेअनुप्रयोगः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},

{
  name:{
    en:"Public Data Monetization Without Approval",
    hi:"अनुमति बिना सार्वजनिक डेटा का व्यावसायीकरण",
    bn:"অনুমতি ছাড়া জনসাধারণের ডেটা বাণিজ্যিকরণ",
    te:"అనుమతి లేకుండా ప్రజా డేటా వాణిజ్యీకరణ",
    mr:"परवानगीशिवाय सार्वजनिक डेटा व्यापारीकरण",
    ta:"பொது தரவு அனுமதி இல்லா வணிகம்",
    gu:"મંજूरी વિના જાહેર ડેટા વાણિજ્યીકરણ",
    ur:"بغیر اجازت عوامی ڈیٹا سے منافع",
    kn:"ಅನುಮತಿ ಇಲ್ಲದೆ ಸಾರ್ವಜನಿಕ ಡೇಟಾ ವ್ಯಾಪಾರ",
    or:"ଅନୁମତି ବିନା ସାର୍ବଜନୀନ ତଥ୍ୟ ବ୍ୟବସାୟ",
    ml:"അനുമതിയില്ലാതെ പൊതു ഡാറ്റ വ്യാപാരം",
    pa:"ਬਿਨਾਂ ਮਨਜ਼ੂਰੀ ਜਨਤਕ ਡਾਟਾ ਵਪਾਰ",
    as:"অনুমতি নথকা ৰাজহুৱা তথ্য ব্যৱসায়",
    sa:"अननुमतसार्वजनिकदत्तांशव्यापारः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Unauthorized Smart City Data Use",
    hi:"अनधिकृत स्मार्ट सिटी डेटा उपयोग",
    bn:"অননুমোদিত স্মার্ট সিটি ডেটা ব্যবহার",
    te:"అనుమతి లేని స్మార్ట్ సిటీ డేటా వినియోగం",
    mr:"अनधिकृत स्मार्ट सिटी डेटा वापर",
    ta:"ஸ்மார்ட் சிட்டி தரவு தவறான பயன்பாடு",
    gu:"અનધિકૃત સ્માર્ટ સિટી ડેટા ઉપયોગ",
    ur:"غیر مجاز اسمارٹ سٹی ڈیٹا استعمال",
    kn:"ಅನುಮತಿ ಇಲ್ಲದ ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಡೇಟಾ ಬಳಕೆ",
    or:"ଅନନୁମୋଦିତ ସ୍ମାର୍ଟ ସିଟି ତଥ୍ୟ ବ୍ୟବହାର",
    ml:"അനുമതിയില്ലാത്ത സ്മാർട്ട് സിറ്റി ഡാറ്റ ഉപയോഗം",
    pa:"ਬਿਨਾਂ ਇਜਾਜ਼ਤ ਸਮਾਰਟ ਸਿਟੀ ਡਾਟਾ ਵਰਤੋਂ",
    as:"অনুমতি নথকা স্মাৰ্ট চিটি তথ্য ব্যৱহাৰ",
    sa:"अनधिकृतस्मार्टनगरदत्तांशप्रयोगः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"medium"
},

{
  name:{
    en:"Fake Government Mobile App",
    hi:"फर्जी सरकारी मोबाइल ऐप",
    bn:"ভুয়া সরকারি মোবাইল অ্যাপ",
    te:"నకిలీ ప్రభుత్వ మొబైల్ యాప్",
    mr:"बनावट सरकारी मोबाईल अ‍ॅप",
    ta:"போலி அரசு மொபைல் ஆப்",
    gu:"નકલી સરકારી મોબાઇલ એપ",
    ur:"جعلی سرکاری موبائل ایپ",
    kn:"ನಕಲಿ ಸರ್ಕಾರಿ ಮೊಬೈಲ್ ಆಪ್",
    or:"ଭୁଆ ସରକାରୀ ମୋବାଇଲ୍ ଆପ୍",
    ml:"വ്യാജ സർക്കാർ മൊബൈൽ ആപ്പ്",
    pa:"ਨਕਲੀ ਸਰਕਾਰੀ ਮੋਬਾਈਲ ਐਪ",
    as:"ভুৱা চৰকাৰী মোবাইল এপ",
    sa:"कूटसरकारीचलअनुप्रयोगः"
  },
  sec:"IT Act",
  punishment:{
    en:"Imprisonment",hi:"कारावास",bn:"কারাদণ্ড",te:"కారాగారం",
    mr:"कारावास",ta:"சிறை",gu:"કારાવાસ",
    ur:"قید",kn:"ಕಾರಾಗೃಹ",or:"କାରାଦଣ୍ଡ",
    ml:"തടവ്",pa:"ਕੈਦ",as:"কাৰাদণ্ড",sa:"कारावासः"
  },
  lvl:"high"
},
];

const LANGUAGES = {
  en: "English",
  hi: "हिंदी (Hindi)",
  bn: "বাংলা (Bengali)",
  te: "తెలుగు (Telugu)",
  mr: "मराठी (Marathi)",
  ta: "தமிழ் (Tamil)",
  gu: "ગુજરાતી (Gujarati)",
  ur: "اردو (Urdu)",
  kn: "ಕನ್ನಡ (Kannada)",
  or: "ଓଡ଼ିଆ (Odia)",
  ml: "മലയാളം (Malayalam)",
  pa: "ਪੰਜਾਬੀ (Punjabi)",
  as: "অসমীয়া (Assamese)",
  sa: "संस्कृत (Sanskrit)",
  
};



/* 41–100 (Generic legally valid offences for awareness) */

const grid=document.getElementById("grid");

function loadCrimes(){
 grid.innerHTML="";
 crimes.forEach((c,i)=>{
  grid.innerHTML+=`
   <div class="card" onclick="openModal(${i})">
    <span class="badge ${c.lvl}">${c.lvl.toUpperCase()}</span>
    <h3>${tamil?c.ta:c.en}</h3>
    <span>${c.sec}</span>
    <p>${tamil?c.penTa:c.penEn}</p>
   </div>`;
 });
}
loadCrimes();

function toggleLang(){
 tamil=!tamil;
 title.innerText=tamil?"⚖ சட்ட விழிப்புணர்வு தளம்":"⚖ Crime Awareness Portal";
 subTitle.innerText=tamil?"குற்றங்கள் மற்றும் தண்டனைகள் (100)":"Crimes & Punishments (100)";
 search.placeholder=tamil?"குற்றத்தை தேடுங்கள்...":"Search crime / IPC...";
 footer.innerText=tamil?"© 2026 சட்ட விழிப்புணர்வு அமைப்பு":"© 2026 Crime Awareness System";
 secTxt.innerText=tamil?"பிரிவு:":"Section:";
 punTxt.innerText=tamil?"தண்டனை:":"Punishment:";
 loadCrimes();
}

function openModal(i){
 modal.style.display="block";
 mName.innerText=tamil?crimes[i].ta:crimes[i].en;
 mSection.innerText=crimes[i].sec;
 mPunish.innerText=tamil?crimes[i].penTa:crimes[i].penEn;
}
function closeModal(){modal.style.display="none"}

search.addEventListener("keyup",()=>{
 let v=search.value.toLowerCase();
 document.querySelectorAll(".card").forEach(c=>{
  c.style.display=c.innerText.toLowerCase().includes(v)?"block":"none";
 });
});
/* =====================
   GLOBAL STATE
===================== */
let originalDashboardHTML = "";

let currentLang = "en";
let showAll = false;
window.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid");
  originalDashboardHTML = grid.innerHTML;
});

/* =====================
   LANGUAGE TOGGLE
===================== */
function toggleLang() {
  let menu = document.getElementById("langMenu");

  if (menu) {
    menu.remove();
    return;
  }

  menu = document.createElement("div");
  menu.id = "langMenu";
  menu.style.position = "absolute";
  menu.style.top = "70px";
  menu.style.right = "40px";
  menu.style.background = "#fff";
  menu.style.borderRadius = "12px";
  menu.style.boxShadow = "0 10px 30px rgba(0,0,0,.2)";
  menu.style.padding = "12px";
  menu.style.maxHeight = "300px";
  menu.style.overflowY = "auto";
  menu.style.zIndex = "2000";

  Object.keys(LANGUAGES).forEach(function (code) {
  const name = LANGUAGES[code];

  const btn = document.createElement("button");
  btn.innerText = name;

  btn.style.display = "block";
  btn.style.width = "100%";
  btn.style.border = "none";
  btn.style.background = code === currentLang ? "#22c55e" : "#f1f5f9";
  btn.style.padding = "8px";
  btn.style.marginBottom = "6px";
  btn.style.borderRadius = "8px";
  btn.style.cursor = "pointer";

  btn.onclick = function () {
    currentLang = code;

    // 🔥 Navbar button text update
    const langBtn = document.querySelector('button[onclick="toggleLang()"]');
    langBtn.innerText = LANGUAGES[code];

    menu.remove();
    refreshView();
  };

  menu.appendChild(btn);
});

  document.body.appendChild(menu);
}

/* =====================
   SHOW / HIDE ALL IPC
===================== */
function toggleAllIPC() {
  const btn = document.getElementById("toggleBtn");
  const grid = document.getElementById("grid");

  showAll = !showAll;

  if (showAll) {
    btn.classList.add("active");
    btn.innerText = "Hide All IPC";
    renderAllIPC();
  } else {
    btn.classList.remove("active");
    btn.innerText = "Show All IPC";
    renderCrimes();
  }
}

/* =====================
   RENDER ALL IPC
===================== */
function renderAllIPC() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  DATASET.ipc.forEach(law => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <span>${law.section}</span>
      <p>${law.desc[currentLang] || law.desc.en}</p>
      <p><b>Punishment:</b> ${law.punishment[currentLang] || law.punishment.en}</p>
    `;

    grid.appendChild(card);
  });
}
function renderCrimes() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  crimes.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";

    // crime name
    let crimeName = c.name
      ? (c.name[currentLang] || c.name.en)
      : (c[currentLang] || c.en);

    // punishment
    let punishment = c.punishment
      ? (c.punishment[currentLang] || c.punishment.en)
      : (c["pen" + currentLang.charAt(0).toUpperCase() + currentLang.slice(1)] || c.penEn);

    card.innerHTML = `
      <span class="badge ${c.lvl}">${c.lvl.toUpperCase()}</span>
      <h3>${crimeName}</h3>
      <span>${c.sec}</span>
      <p><b>Punishment:</b></p>
      <p>${punishment}</p>
    `;

    grid.appendChild(card);
  });
}

function refreshView() {
  if (showAll) {
    renderAllIPC();
  } else {
    renderCrimes();
  }
}


window.addEventListener("DOMContentLoaded", () => {
  renderCrimes();
});
