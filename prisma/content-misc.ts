/**
 * Remaining seed content: scam scenarios, alerts, tips, help topics, privacy guides,
 * government resources, SHGs and products. All fictional except the helplines and
 * the official .gov.in / .nic.in URLs, which must be re-verified before a demo.
 */

export type ScenarioSeed = {
  type: string; message: string; messageHi: string; isScam: boolean; explanation: string; explanationHi: string;
};

export const SCENARIOS: ScenarioSeed[] = [
  {
    type: "Fake KYC",
    message: "Your account will be BLOCKED today. Update KYC now: http://bnk-kyc.xyz",
    messageHi: "आपका अकाउंट आज ही ब्लॉक हो जाएगा। अभी केवाईसी अपडेट करें: http://bnk-kyc.xyz",
    isScam: true,
    explanation: "Banks update KYC in branch or inside the app. They never send a KYC form by link, and the address bnk-kyc.xyz is not a bank website.",
    explanationHi: "बैंक केवाईसी ब्रांच में या ऐप के अंदर अपडेट करते हैं। वे लिंक भेजकर केवाईसी फ़ॉर्म नहीं भेजते, और bnk-kyc.xyz बैंक की वेबसाइट नहीं है।",
  },
  {
    type: "Fake bank call",
    message: "I am the bank manager. Tell me the OTP just sent to you, otherwise a wrong transaction will go through.",
    messageHi: "मैं बैंक मैनेजर हूँ। मुझे अभी आया OTP बता दें, वरना एक ग़लत लेन-देन हो जाएगा।",
    isScam: true,
    explanation: "No bank ever asks for an OTP on a call. Hang up and call the number printed on your card or passbook.",
    explanationHi: "कोई बैंक कॉल पर OTP कभी नहीं माँगता। फ़ोन रखें और अपने कार्ड या पैसबुक पर छपे नंबर से खुद कॉल करें।",
  },
  {
    type: "QR scam",
    message: "Scan this QR and enter your UPI PIN to receive my payment. It is ₹2,000.",
    messageHi: "मेरा भुगतान पाने के लिए यह क्यूआर स्कैन करें और अपना यूपीआई पिन डालें। रकम ₹2,000 है।",
    isScam: true,
    explanation: "You never need a PIN to receive money. Scanning this QR lets them take money from your account instead.",
    explanationHi: "पैसे पाने के लिए कभी पिन नहीं चाहिए। यह क्यूआर स्कैन करने पर पैसा आपके अकाउंट से जाएगा, आपको नहीं मिलेगा।",
  },
  {
    type: "Real bank SMS",
    message: "Rs 300 has been debited from A/c XX1234 on 04-Oct. If this was not you, call the number on your card.",
    messageHi: "04 अक्टूबर को A/c XX1234 से ₹300 कटे हैं। अगर यह आपने नहीं किया, तो अपने कार्ड पर छपे नंबर पर कॉल करें।",
    isScam: false,
    explanation: "This is information only: no link, no urgency, no request for a secret. Real bank messages look like this.",
    explanationHi: "यह सिर्फ़ जानकारी है: कोई लिंक नहीं, कोई जल्दबाज़ी नहीं, कोई गोपनीय जानकारी की माँग नहीं। असली बैंक संदेश ऐसे ही होते हैं।",
  },
  {
    type: "Fake job offer",
    message: "Earn Rs 5,000 daily from home! Pay Rs 500 registration fee on WhatsApp to confirm your job.",
    messageHi: "घर बैठे रोज़ ₹5,000 कमाएँ! नौकरी पक्की करने के लिए व्हाट्सएप पर ₹500 रजिस्ट्रेशन फ़ीस भेजें।",
    isScam: true,
    explanation: "No employer charges a fee to give you work. The first ₹500 is only the beginning of a bigger demand.",
    explanationHi: "कोई नियोक्ता नौकरी देने के लिए फ़ीस नहीं लेता। पहला ₹500 बड़ी माँग की शुरुआत भर है।",
  },
  {
    type: "Lottery",
    message: "Congratulations! You have won Rs 25 lakh. Send Rs 2,000 processing charges to claim your prize.",
    messageHi: "बधाई हो! आपने ₹25 लाख जीते हैं। इनाम पाने के लिए ₹2,000 प्रोसेसिंग चार्ज भेजें।",
    isScam: true,
    explanation: "You cannot win a lottery you never entered, and a genuine prize never needs money paid in advance.",
    explanationHi: "जिस लॉटरी में आपने भाग ही नहीं लिया, उसमें जीतना संभव नहीं। और असली इनाम के लिए पहले पैसे नहीं माँगे जाते।",
  },
  {
    type: "Fake customer support",
    message: "We noticed a problem with your payments. Download this app to fix it: http://support-help.top/app",
    messageHi: "आपके भुगतान में समस्या मिली है। इसे ठीक करने के लिए यह ऐप डाउनलोड करें: http://support-help.top/app",
    isScam: true,
    explanation: "Support staff never ask you to install remote-access apps from a link. No app can fix your bank safely this way.",
    explanationHi: "सपोर्ट कर्मचारी कभी लिंक से रिमोट-एक्सेस ऐप इंस्टॉल करने को नहीं कहते। इस तरह कोई ऐप आपके बैंक को सुरक्षित ठीक नहीं कर सकता।",
  },
  {
    type: "Real SHG notice",
    message: "SHG meeting on Saturday at 4 PM in the panchayat hall. Please bring your passbook.",
    messageHi: "शिक्षा समूह की बैठक शनिवार को शाम 4 बजे पंचायत भवन में है। कृपया अपनी पासबुक लाएँ।",
    isScam: false,
    explanation: "A known sender, a fixed time and place, no link, no money request and no urgency. This is a normal community message.",
    explanationHi: "जाना-पहचाना भेजने वाला, तय समय और जगह, कोई लिंक नहीं, कोई पैसे की माँग नहीं, कोई जल्दबाज़ी नहीं। यह सामान्य सामुदायिक संदेश है।",
  },
  {
    type: "KYC for new SIM",
    message: "Dear customer, as per government rule your SIM will be deactivated. Do KYC at this official-looking portal: http://jio-kyc-update.xyz",
    messageHi: "प्रिय ग्राहक, सरकारी नियम के अनुसार आपका सिम डिएक्टिवेट हो जाएगा। इस पोर्टल पर केवाईसी करें: http://jio-kyc-update.xyz",
    isScam: true,
    explanation: "SIM re-KYC is done in store or in the operator's own app. A link in an SMS is never official.",
    explanationHi: "सिम का केवाईसी स्टोर या ऑपरेटर के अपने ऐप में होता है। संदेश में आया लिंक कभी आधिकारिक नहीं होता।",
  },
  {
    type: "Refund help",
    message: "Your Rs 1,499 payment is held. Click here to release the refund: http://refund-desk.click",
    messageHi: "आपका ₹1,499 का भुगतान रुका हुआ है। रिफ़ंड जारी करने के लिए यहाँ क्लिक करें: http://refund-desk.click",
    isScam: true,
    explanation: "A real refund returns to your account on its own. Nobody needs you to click anything or pay to release it.",
    explanationHi: "असली रिफ़ंड अपने आप आपके अकाउंट में लौटता है। उसे जारी करने के लिए किसी को कुछ क्लिक या भुगतान नहीं करना होता।",
  },
];

export const ALERTS = [
  {
    title: "Fake electricity-bill SMS threatening disconnection",
    titleHi: "बिजली बिल का नकली संदेश जो कटौती की धमकी देता है",
    body: "Disconnection threats with a payment link are rising. Open your electricity provider's app or bill page yourself; never use a link from an SMS.",
    severity: "HIGH",
  },
  {
    title: "'Receive money' QR scams on marketplaces",
    titleHi: "मार्केटप्लेस पर 'पैसे पाने वाले' क्यूआर स्कैम",
    body: "Buyers are sending QR codes that ask you to enter your UPI PIN. You never need a PIN to receive money.",
    severity: "MEDIUM",
  },
  {
    title: "Fake 'free recharge' links forwarded on WhatsApp",
    titleHi: "व्हाट्सएप पर फैले नकली 'फ्री रिचार्ज' लिंक",
    body: "Free recharge links ask for your number and then for card details. Recharge only inside your own operator app.",
    severity: "MEDIUM",
  },
  {
    title: "Lottery and prize messages after a small online purchase",
    titleHi: "छोटी ऑनलाइन खरीद के बाद लॉटरी और इनाम के संदेश",
    body: "Scammers buy your details and then send prize messages that ask for processing charges. A prize you never entered is never real.",
    severity: "LOW",
  },
];

export const TIPS = [
  { text: "Never share your OTP, UPI PIN or password with anyone.", textHi: "अपना OTP, यूपीआई पिन या पासवर्ड किसी से कभी न बताएँ।" },
  { text: "You do not need a PIN to receive money.", textHi: "पैसे पाने के लिए कभी पिन की ज़रूरत नहीं होती।" },
  { text: "Banks never ask for your OTP on a call. Hang up and call the number on your card.", textHi: "बैंक कॉल पर OTP कभी नहीं माँगता। फ़ोन रखें और कार्ड पर छपे नंबर पर कॉल करें।" },
  { text: "Think before you tap: scams use fear and greed to rush you.", textHi: "टैप करने से पहले सोचें: ठगी डर और लालच से आपको जल्दी करने के लिए कहती है।" },
  { text: "Use a different password for each important account and turn on two-step login.", textHi: "हर ज़रूरी अकाउंट के लिए अलग पासवर्ड रखें और टू-स्टेप लॉगिन चालू करें।" },
  { text: "Read the address bar, not the words in the message, before you type anything.", textHi: "कुछ भी लिखने से पहले संदेश के शब्द नहीं, पता पट्टी पढ़ें।" },
  { text: "A price that is too good to be true is usually bait for a scam.", textHi: "बहुत अच्छा दाम आमतौर पर ठगी का लालच होता है।" },
  { text: "Tell one person you trust before you make an unusual payment.", textHi: "कोई असामान्य भुगतान करने से पहले किसी भरोसेमंद को बताएँ।" },
];

export const HELP_TOPICS = [
  {
    type: "CYBER_FRAUD",
    title: "Cyber fraud / money lost",
    titleHi: "साइबर ठगी / पैसे डूब गए",
    guidance: "If money was lost, act fast. Call the national cyber fraud helpline 1930, then tell your bank on the number printed on your card, then report on the official portal.",
    guidanceHi: "पैसे डूब गए हों तो जल्दी करें। पहले साइबर ठगी हेल्पलाइन 1930 पर कॉल करें, फिर कार्ड पर छपे नंबर से बैंक को बताएँ, फिर आधिकारिक पोर्टल पर रिपोर्ट करें।",
    steps: "Do not reply to the scammer or argue with them\nKeep the SMS, screenshot and your bank's transaction number\nCall 1930 and your bank at once\nReport on cybercrime.gov.in with details",
    officialUrl: "https://cybercrime.gov.in",
  },
  {
    type: "SUSPICIOUS_CALL",
    title: "Suspicious call",
    titleHi: "संदिग्ध कॉल",
    guidance: "Hang up. Do not share an OTP, PIN or password on a phone call. If the caller claims to be from a bank, call the number on your card yourself.",
    guidanceHi: "फ़ोन रख दें। कॉल पर OTP, पिन या पासवर्ड न बताएँ। अगर कॉलकर्ता बैंक से बताता है, तो कार्ड पर छपे नंबर से खुद कॉल करें।",
    steps: "End the call\nWrite down what was said and the number\nBlock the number\nReport the call on Sanchar Saathi if it continues",
    officialUrl: "https://sancharsaathi.gov.in",
  },
  {
    type: "SUSPICIOUS_MESSAGE",
    title: "Suspicious message or link",
    titleHi: "संदिग्ध संदेश या लिंक",
    guidance: "Do not tap the link. Use the Check Message tool in this app to see the warning signs, and open the app yourself instead.",
    guidanceHi: "लिंक न दबाएँ। इसी ऐप के 'संदिग्ध संदेश जाँचें' टूल से सावधानी के संकेत देखें, और ऐप खुद खोलें।",
    steps: "Do not tap the link or scan the QR\nCheck the sender's number against a known contact\nReport and block on WhatsApp\nTake a screenshot for your record",
    officialUrl: "https://cybercrime.gov.in",
  },
  {
    type: "ACCOUNT_HACKED",
    title: "My account was hacked",
    titleHi: "मेरा अकाउंट हैक हो गया",
    guidance: "Change the password from a device you trust, log out of all other devices and turn on two-step login. Warn your contacts not to trust messages from your account.",
    guidanceHi: "भरोसेमंद डिवाइस से पासवर्ड बदलें, बाकी सभी डिवाइस से लॉगआउट करें और टू-स्टेप लॉगिन चालू करें। अपने संपर्कों को बताएँ कि आपके अकाउंट से आए संदेश पर भरोसा न करें।",
    steps: "Change the email password first, then the app passwords\nLog out of all devices\nTell your contacts from another number\nReport on cybercrime.gov.in",
    officialUrl: "https://cybercrime.gov.in",
  },
  {
    type: "PAYMENT_FRAUD",
    title: "Payment fraud or a wrong transfer",
    titleHi: "भुगतान ठगी या ग़लत ट्रांसफ़र",
    guidance: "Inform your bank at once on the number printed on your card or passbook. Then call 1930 and report on the official portal. Speed matters most.",
    guidanceHi: "कार्ड या पैसबुक पर छपे नंबर से तुरंत बैंक को सूचित करें। फिर 1930 पर कॉल करें और आधिकारिक पोर्टल पर रिपोर्ट करें। जल्दी करना सबसे ज़रूरी है।",
    steps: "Note the transaction reference number from your bank app\nCall the bank immediately\nCall 1930\nFile a report on cybercrime.gov.in within 24 hours",
    officialUrl: "https://cybercrime.gov.in",
  },
  {
    type: "LOST_PHONE",
    title: "Lost or stolen phone",
    titleHi: "फ़ोन खो गया या चोरी हुआ",
    guidance: "Use another phone or computer to change your email password first, then block the SIM and report the phone on the official portal.",
    guidanceHi: "दूसरे फ़ोन या कंप्यूटर से पहले अपने ईमेल का पासवर्ड बदलें, फिर सिम ब्लॉक करें और आधिकारिक पोर्टल पर फ़ोन की रिपोर्ट करें।",
    steps: "Change your email password on another device\nAsk your mobile operator to block the SIM\nReport the lost phone on Sanchar Saathi\nChange your UPI PIN and banking passwords",
    officialUrl: "https://sancharsaathi.gov.in",
  },
  {
    type: "HARASSMENT",
    title: "Harassment or online abuse",
    titleHi: "उत्पीड़न या ऑनलाइन अभद्रता",
    guidance: "You do not have to be in immediate danger to ask for help. Block, screenshot and report. If you feel unsafe, call 112 or the women's helpline 181.",
    guidanceHi: "तुरंत ख़तरा न हो, तब भी मदद माँगना सही है। ब्लॉक करें, स्क्रीनशॉट लें और रिपोर्ट करें। अगर असुरक्षा लगे, तो 112 या महिला हेल्पलाइन 181 पर कॉल करें।",
    steps: "Block the account and save screenshots\nReport the account on the app where it happened\nWrite down dates and times\nCall 112 or 181 if you feel unsafe",
    officialUrl: "https://cybercrime.gov.in",
  },
  {
    type: "GENERAL",
    title: "Something else / need general guidance",
    titleHi: "कुछ और / सामान्य जानकारी",
    guidance: "Not sure what to do? Start with the three rules: pause, never share secrets, and tell someone you trust. You can also read the privacy and emergency guides in this app.",
    guidanceHi: "समझ नहीं आ रहा? तीन नियमों से शुरू करें: रुकें, कोई गोपनीय बात न बताएँ, किसी भरोसेमंद को बताएँ। इसी ऐप में निजता और आपातकाल गाइड भी पढ़ सकती हैं।",
    steps: "Do not act in the first ten minutes\nNote what happened: time, number, amount\nAsk someone you trust\nUse the official helplines if it is urgent",
    officialUrl: "https://www.india.gov.in",
  },
];

export const PRIVACY_GUIDES = [
  {
    topic: "location",
    title: "Location sharing",
    body: "Photos and status posts can reveal where you live or where you are at this moment. Many apps ask for location access because it helps maps, but a photo or a story does not need your exact location.",
    bodyHi: "फ़ोटो और स्टेट्स पोस्ट से पता चल सकता है कि आप कहाँ रहती हैं या अभी कहाँ हैं। कई ऐप नक़्शे के लिए लोकेशन माँगते हैं, पर फ़ोटो या स्टोरी के लिए सही-सही लोकेशन ज़रूरी नहीं।",
    steps: "Turn off location access for your camera and gallery\nDo not put your house number on a photo\nRemove the location tag before posting\nChoose 'Only while using the app' wherever it is offered",
    stepsHi: "कैमरा और गैलरी का लोकेशन बंद करें\nफ़ोटो पर घर का नंबर न लिखें\nपोस्ट से पहले लोकेशन टैग हटाएँ\nजहाँ मिले वहाँ 'सिर्फ़ ऐप इस्तेमाल करते समय' चुनें",
  },
  {
    topic: "camera",
    title: "Camera and microphone access",
    body: "A shopping app that can use your camera is a normal app that can also record in the background if permission is careless. Review which apps have camera and microphone access and remove the ones you do not use.",
    bodyHi: "कैमरा इस्तेमाल करने वाला शॉपिंग ऐप सामान्य है, पर अनुमति ग़लत हो तो वह पृष्ठभूमि में भी रिकॉर्ड कर सकता है। जाँचें कि किन ऐप्स को कैमरा और माइक्रोफ़ोन इजाज़त है, और जो आप इस्तेमाल नहीं करतीं वह हटा दें।",
    steps: "Open phone Settings > Apps\nCheck Camera and Microphone permissions\nRemove permission from apps you rarely use\nKeep it only for the camera and messaging apps",
    stepsHi: "फ़ोन सेटिंग > ऐप्स खोलें\nकैमरा और माइक्रोफ़ोन की अनुमति जाँचें\nजिन ऐप्स को आप कम चलाती हैं उनकी अनुमति हटाएँ\nयह इजाज़त सिर्फ़ कैमरा और मैसेज ऐप्स में रखें",
  },
  {
    topic: "contacts",
    title: "Contacts and your phone number",
    body: "Once a scammer has your number they can message you, call you and even show your name to others. Do not give your number for a free prize. On WhatsApp, keep your photo set to your contacts only.",
    bodyHi: "एक बार नंबर मिल जाने पर कोई आपको संदेश और कॉल कर सकता है, और आपका नाम भी दूसरों को दिखा सकता है। मुफ़्त इनाम के लिए नंबर न दें। व्हाट्सएप पर फ़ोटो 'मेरे संपर्क' पर ही रखें।",
    steps: "Set your WhatsApp photo to My contacts\nDo not enter your number on unknown reward pages\nDo not add unknown people to groups\nBlock unknown numbers after they call you twice",
    stepsHi: "व्हाट्सएप फ़ोटो 'मेरे संपर्क' पर रखें\nअजाने रिवॉर्ड पेज पर नंबर न डालें\nअजाने लोगों को ग्रुप में न जोड़ें\nदो बार कॉल करने पर अजाने नंबर ब्लॉक करें",
  },
  {
    topic: "app_permissions",
    title: "App permissions",
    body: "Permission is not the same as need. A torch app does not need your contacts. Every month, open the app list and remove permissions from apps you have stopped using.",
    bodyHi: "अनुमति और ज़रूरत एक बात नहीं होती। टॉर्च ऐप को आपके संपर्कों की ज़रूरत नहीं। हर महीने ऐप की सूची खोलकर बंद किए हुए ऐप्स की अनुमति हटाएँ।",
    steps: "Open Settings > Apps and see which apps have contacts or storage access\nRemove storage access from apps you do not use\nDo not allow notifications from unknown apps\nRe-check after every phone update",
    stepsHi: "सेटिंग > ऐप्स खोलें और देखें कि किसे संपर्क या स्टोरेज एक्सेस है\nन इस्तेमाल होने वाले ऐप्स से स्टोरेज एक्सेस हटाएँ\nअजाने ऐप्स को नोटिफ़िकेशन न दें\nफ़ोन अपडेट के बाद दोबारा जाँचें",
  },
  {
    topic: "account_security",
    title: "Account security",
    body: "Your email is the master key: whoever controls it can reset every other password. Use a long, different password, turn on two-step login, and never share an OTP that says 'for your safety'.",
    bodyHi: "आपका ईमेल मास्टर चाबी है: जो इसे चलाता है, वह बाकी सब पासवर्ड रीसेट कर सकता है। लंबा और अलग पासवर्ड रखें, टू-स्टेप लॉगिन चालू करें, और 'सुरक्षा के लिए' भेजा गया OTP किसी को न बताएँ।",
    steps: "Set a long password for your email\nTurn on two-step login for email and WhatsApp\nSave your passwords in a password manager or a written note in a safe place\nChange any password you have used on more than one account",
    stepsHi: "अपने ईमेल का लंबा पासवर्ड रखें\nईमेल और व्हाट्सएप में टू-स्टेप लॉगिन चालू करें\nपासवर्ड पासवर्ड मैनेजर या सुरक्षित जगह लिखे कागज़ पर रखें\nजो पासवर्ड एक से ज़्यादा अकाउंट में है, उसे बदलें",
  },
  {
    topic: "wifi",
    title: "Public Wi-Fi and charging",
    body: "Free Wi-Fi at a shop or railway station can be watched. Avoid online banking on it. A shared charging cable or USB point can also be risky: charge on your own charger, and lock your phone while it charges.",
    bodyHi: "दुकान या रेलवे स्टेशन का फ्री वाई-फ़ाई देखा जा सकता है। उस पर ऑनलाइन बैंकिंग न करें। साझा चार्जिंग केबल या यूएसबी पॉइंट भी जोखिम भरा हो सकता है: अपना चार्जर इस्तेमाल करें और चार्ज करते समय फ़ोन लॉक रखें।",
    steps: "Use your mobile data for banking and payments\nTurn off auto-connect to unknown Wi-Fi\nCarry your own charger\nNever leave the phone unlocked while charging at a shop",
    stepsHi: "बैंकिंग और भुगतान के लिए अपना मोबाइल डेटा इस्तेमाल करें\nअजाना वाई-फ़ाई से ऑटो-कनेक्ट बंद करें\nअपना चार्जर साथ रखें\nदुकान पर चार्ज कराते समय फ़ोन अनलॉक न छोड़ें",
  },
];

export const GOV_RESOURCES = [
  {
    name: "National Cyber Crime Reporting Portal",
    description: "Official portal to report cyber fraud, online harassment and other online crimes.",
    eligibility: "Any citizen in India. A mobile number and details of the incident help.",
    category: "SCHEMES",
    officialUrl: "https://cybercrime.gov.in",
  },
  {
    name: "Cyber Crime Helpline 1930",
    description: "National helpline for financial cyber fraud. Answered 24x7; call quickly after money is lost.",
    eligibility: "Anyone who has lost money to an online fraud.",
    category: "SCHEMES",
    officialUrl: "https://cybercrime.gov.in",
  },
  {
    name: "Aajeevika (DAY-NRLM)",
    description: "Official portal for the National Rural Livelihoods Mission, which supports SHGs with training, credit and bank linkage.",
    eligibility: "SHGs formed under DAY-NRLM. Ask your State Rural Development Agency for the local contact.",
    category: "SHG",
    officialUrl: "https://aajeevika.gov.in",
  },
  {
    name: "DigiLocker",
    description: "Issued documents such as Aadhaar, PAN and driving licence can be fetched digitally instead of carrying photocopies.",
    eligibility: "Anyone with an Aadhaar-linked mobile number.",
    category: "DIGITAL",
    officialUrl: "https://www.digilocker.gov.in",
  },
  {
    name: "UMANG App",
    description: "Government app hosting many services, including PM-Kisan and scholarship applications.",
    eligibility: "Any Indian citizen; services differ by state.",
    category: "DIGITAL",
    officialUrl: "https://web.umang.gov.in",
  },
  {
    name: "Skill India Digital",
    description: "Free online courses with certificates, useful for computer and digital skills.",
    eligibility: "Open to all. Register with a mobile number.",
    category: "EMPLOYMENT",
    officialUrl: "https://www.skillindiadigital.gov.in",
  },
  {
    name: "National Commission for Women",
    description: "Information and complaint support for women facing harassment, violence or online abuse.",
    eligibility: "Any woman in India.",
    category: "WOMEN_WELFARE",
    officialUrl: "https://ncw.gov.in",
  },
  {
    name: "Sanchar Saathi",
    description: "Department of Telecom portal to block or report a lost mobile number and to report spam calls.",
    eligibility: "Any Indian mobile number.",
    category: "DIGITAL",
    officialUrl: "https://sancharsaathi.gov.in",
  },
  {
    name: "India.gov.in",
    description: "Single national portal for government schemes and services across states.",
    eligibility: "Open to all citizens.",
    category: "SCHEMES",
    officialUrl: "https://www.india.gov.in",
  },
];

export type ShgSeed = {
  name: string; village: string; description: string;
  meetings: { title: string; inDays: number; hour: number; mode: string; location: string; agenda: string }[];
  announcements: { title: string; body: string }[];
  resources: { title: string; url: string; kind: string }[];
};

export const SHGS: ShgSeed[] = [
  {
    name: "Lakshmi Mahila Mandal",
    village: "Rampur",
    description: "Fifteen-member group formed in 2021. Focus: digital literacy and a small handcraft business that sells online.",
    meetings: [
      { title: "Weekly digital learning meeting", inDays: 2, hour: 16, mode: "IN_PERSON", location: "Village community hall", agenda: "UPI safety lesson and practice on members' own phones" },
      { title: "Handcraft order review", inDays: 9, hour: 11, mode: "IN_PERSON", location: "Village community hall", agenda: "Confirm online orders, prices and payment records" },
    ],
    announcements: [
      { title: "Bring your own phone on Thursday", body: "We practise UPI on members' own phones, so please carry a charged phone." },
      { title: "Do not pay for any 'group fee'", body: "Our group never charges a fee to join or to learn. Anyone asking for money is not from our group." },
    ],
    resources: [
      { title: "Cyber crime reporting portal", url: "https://cybercrime.gov.in", kind: "link" },
      { title: "Aajeevika portal for SHG support", url: "https://aajeevika.gov.in", kind: "link" },
    ],
  },
  {
    name: "Sunrise Women SHG",
    village: "Bhilwara",
    description: "Twenty-two members. Focus: savings, digital payments and government scheme applications.",
    meetings: [
      { title: "Savings and passbook check", inDays: 1, hour: 10, mode: "IN_PERSON", location: "Bhilwara SHG training room", agenda: "Passbook entries and one rule for safe digital payments" },
      { title: "Online awareness session", inDays: 7, hour: 15, mode: "ONLINE", location: "", agenda: "Common scams and how to report them" },
    ],
    announcements: [
      { title: "Scheme applications must be done on the official portal", body: "Please do not pay anyone for a scheme. Apply only through india.gov.in or the department's own site." },
    ],
    resources: [
      { title: "India.gov.in schemes", url: "https://www.india.gov.in", kind: "link" },
      { title: "National Commission for Women", url: "https://ncw.gov.in", kind: "link" },
    ],
  },
  {
    name: "Navjeevan Sakhi Group",
    village: "Sonpur",
    description: "Twelve members, mostly first-time smartphone users. Focus: WhatsApp basics and message checking.",
    meetings: [
      { title: "WhatsApp practice session", inDays: 3, hour: 17, mode: "IN_PERSON", location: "Anganwadi centre", agenda: "Privacy settings, blocking a scammer, checking a message" },
    ],
    announcements: [
      { title: "Sakhi helpline inside the group", body: "If anyone feels unsafe online, tell the group leader. We will help you block, screenshot and report." },
    ],
    resources: [{ title: "Sanchar Saathi: block a spam call", url: "https://sancharsaathi.gov.in", kind: "link" }],
  },
  {
    name: "Gram Shakti SHG",
    village: "Kishanganj",
    description: "Eighteen members. Focus: digital business and online selling of farm produce.",
    meetings: [
      { title: "Product photo and pricing meeting", inDays: 4, hour: 12, mode: "IN_PERSON", location: "Gram Shakti office", agenda: "Photograph products in daylight, agree one price list" },
      { title: "Online payment training", inDays: 11, hour: 14, mode: "IN_PERSON", location: "Gram Shakti office", agenda: "Confirming a payment before delivering an order" },
    ],
    announcements: [
      { title: "One number and one price list for the whole group", body: "From this month the group uses one business number. This stops customers from being confused by fake contacts." },
    ],
    resources: [
      { title: "Skill India Digital: free courses", url: "https://www.skillindiadigital.gov.in", kind: "link" },
      { title: "DigiLocker for documents", url: "https://www.digilocker.gov.in", kind: "link" },
    ],
  },
];

export const ANNOUNCEMENTS = [
  {
    title: "Demo accounts for the evaluation",
    body: "Login as demo@saheli.demo (learner) or admin@saheli.demo (admin). Password for both: Demo@123.",
  },
  {
    title: "This is a college demo",
    body: "All names, groups, products and reports here are fictional. The helplines and government links are real, and the report form is saved only in this app.",
  },
];

export const PRODUCTS = [
  { name: "Handmade cotton bag", description: "Block-printed cotton bag made by the group. Washable, three colours.", priceInr: 250 },
  { name: "Terracotta diya set (4 pieces)", description: "Handmade clay lamps for festivals. Sold with a small carry box.", priceInr: 180 },
  { name: "Turmeric, 250 g", description: "Sun-dried village turmeric, packed the same week. No colour added.", priceInr: 120 },
  { name: "Stitched cloth mask (3 pieces)", description: "Soft cotton masks for everyday use, stitched by group members.", priceInr: 150 },
];

export const NOTIFICATIONS = [
  { title: "New safety alert published", titleHi: "नई सुरक्षा चेतावनी प्रकाशित", body: "Check the alerts section for the latest fraud warnings.", bodyHi: "नवीनतम ठगी चेतावनी के लिए चेतावनी अनुभाग देखें।" },
  { title: "New course available", titleHi: "नया कोर्स उपलब्ध", body: "A new learning course has been added for your group.", bodyHi: "आपके समूह के लिए एक नया लर्निंग कोर्स जोड़ा गया है।" },
];