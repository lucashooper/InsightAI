import { AppLanguage, TranslationTree } from '../types';

export const onboardingTranslations: Partial<Record<AppLanguage, TranslationTree>> = {
  "zh": {
    "onboarding": {
      "welcome": "欢迎来到Insight",
      "getStarted": "开始使用",
      "alreadyHaveAccount": "已经有帐户？",
      "signIn": "登入",
      "reflectGrow": "反思。成长。",
      "valuableInsights": "获得有价值的见解",
      "reflectionToSteps": "将反思转化为下一步。",
      "weekAtGlance": "一目了然地查看您的一周",
      "skip": "跳过",
      "skipForNow": "暂时跳过",
      "valueProp": {
        "title": "Insight 将想法变得清晰",
        "mentalNoise": "精神噪音",
        "understanding": "理解",
        "captureFeelings": "捕捉您的感受",
        "understandPatterns": "随着时间的推移了解模式",
        "gainClarity": "获得清晰——不混乱"
      },
      "patterns": {
        "eyebrow": "由人工智能提供支持",
        "title": "长期追踪\n你的模式",
        "subtitle": "Insight 找出阻碍您前进的因素，并指出您需要优先处理的事项。",
        "adjustSleep": "调整睡眠时间表",
        "selfCompassion": "多练习自我关怀",
        "reduceScreenTime": "减少睡前看屏幕的时间",
        "manageStress": "主动管理压力",
        "setBoundaries": "设定更清晰的界限",
        "challengeSelfTalk": "挑战消极的自言自语",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "庆祝成长",
        "title": "也要庆祝你的\n成就",
        "subtitle": "Insight 还可以发现进展顺利的事情，以便您可以发挥自己的优势。",
        "gym": "坚持去健身房",
        "reading": "这周每天都读书",
        "openingUp": "对人更加开放",
        "calm": "压力下保持冷静",
        "morningRoutine": "维持早晨的例行公事",
        "perseverance": "度过困难时刻"
      },
      "research": {
        "title": "以心理学\n为基础",
        "body": "研究表明，反思性日记可以提高情绪意识和长期幸福感。",
        "citation": "Advances in Psychiatric Treatment, 2005",
        "learnMore": "了解更多"
      },
      "auth": {
        "createAccount": "创建一个帐户",
        "createYourAccount": "创建您的帐户",
        "subtitle": "选择一个选项开始",
        "postPurchaseSubtitle": "保存您的条目并跨设备访问它们",
        "apple": "使用 Apple 继续",
        "google": "使用 Google 继续",
        "email": "继续使用电子邮件",
        "signInPrompt": "已经有帐户？",
        "appleFailed": "Apple 登录失败",
        "googleFailed": "Google 登录失败",
        "genericError": "发生错误"
      },
      "vibe": {
        "title": "选择你的氛围",
        "dark": "深色",
        "light": "浅色",
        "sunset": "日落",
        "vibrant": "充满活力",
        "ocean": "海洋",
        "midnight": "午夜"
      },
      "questions": {
        "name": {
          "title": "你叫什么名字？",
          "subtitle": "我们将用它来个性化您的体验。",
          "placeholder": "输入你的名字"
        },
        "referral": {
          "title": "您从哪里听说我们的？",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "朋友",
          "other": "其他"
        },
        "goal": {
          "title": "你现在的主要目标是什么？",
          "mood": "改善情绪",
          "stress": "减轻压力",
          "habits": "养成习惯",
          "clarity": "获得清晰度"
        },
        "research": {
          "title": "以心理学为基础",
          "subtitle": "研究表明，反思性日记可以提高情绪意识和长期幸福感。",
          "badge": "Cambridge University",
          "screenTitle": "Insight 以心理学为基础",
          "body": "写日记与更好的情绪意识和心理健康有关。"
        },
        "frequency": {
          "title": "你想多久反思一次？",
          "daily": "日常的",
          "weekly": "每周",
          "asNeeded": "根据需要"
        },
        "experience": {
          "title": "你写日记多久了？",
          "new": "我是写日记的新手",
          "underSixMonths": "< 6 个月",
          "sixToTwentyFourMonths": "6-24 个月",
          "twoPlusYears": "2年以上"
        },
        "wellbeing": {
          "title": "您如何评价您的日常健康状况？",
          "subtitle": "从 1 到 10 的范围内，您通常有什么感觉？",
          "typicalDay": "典型的一天"
        },
        "stressResponse": {
          "title": "当你面临压力时，你会做什么？",
          "ruminate": "反刍或螺旋",
          "selfBlame": "怪我自己",
          "fixate": "专注于让它完美",
          "stepBack": "暂停并重新组合"
        },
        "selfTalk": {
          "title": "你会如何形容你内心的声音？",
          "critical": "经常严厉或评判",
          "mixed": "取决于当天",
          "supportive": "大部分是支持的"
        },
        "coping": {
          "title": "当情绪难以承受时，什么对你最有帮助？",
          "social": "谈论它",
          "physical": "移动我的身体",
          "expressive": "日记或创意工作",
          "solitude": "独处充电的时间"
        },
        "change": {
          "title": "您通常如何应对重大变化？",
          "resistant": "先抵抗，后适应",
          "anxious": "感到焦虑但坚持下去",
          "embrace": "迎接挑战",
          "support": "需要很多支持"
        },
        "motivation": {
          "title": "当事情变得困难时，是什么驱使你继续前进？",
          "fear": "害怕失败或让别人失望",
          "external": "外部奖励或认可",
          "values": "内部价值观和宗旨",
          "passion": "热爱我所做的事"
        },
        "relationships": {
          "title": "在亲密关系中，你会出现什么模式？",
          "anxious": "我需要很多的安慰",
          "avoidant": "当事情变得激烈时我会抽身离开",
          "fearful": "我在推开和紧握之间交替",
          "secure": "我感到安全和舒适"
        },
        "conflict": {
          "title": "当存在紧张或冲突时，你通常...",
          "avoid": "不惜一切代价避免它",
          "accommodate": "尝试平滑它或者请",
          "compete": "争取胜利或证明我的观点",
          "collaborate": "冷静而直接地解决问题"
        },
        "rest": {
          "title": "对你来说，休息是什么样的？",
          "guilt": "我很难休息——我感到内疚",
          "solitude": "我需要完全的孤独",
          "social": "我通过社交联系充电",
          "active": "我通过做平静的活动来休息"
        },
        "identitySource": {
          "title": "您最能从哪里获得认同感？",
          "achievement": "我的成就和成功",
          "relationships": "我的人际关系和联系",
          "values": "我的价值观和信仰",
          "expression": "我的创造力或自我表达"
        },
        "failure": {
          "title": "当你失败或犯错时，你的第一反应是什么？",
          "shame": "我觉得我还不够好",
          "defensive": "我变得防御性或归咎于外部因素",
          "analytical": "我分析一下哪里出了问题",
          "growth": "我认为这是一个学习机会"
        },
        "awareness": {
          "title": "您对自己此刻的情绪有多了解？",
          "low": "我常常直到后来才注意到",
          "moderate": "我感觉到它们，但总是无法说出它们的名字",
          "high": "我可以识别大多数情绪的发生",
          "veryHigh": "我非常适应微妙的转变"
        },
        "decisions": {
          "title": "在做出重要决定时，您倾向于...",
          "overthink": "想太多并陷入分析瘫痪",
          "intuitive": "跟随我的直觉",
          "external": "多向别人寻求建议",
          "systematic": "系统地权衡利弊"
        },
        "gender": {
          "title": "你如何识别？",
          "subtitle": "我们仅用它来个性化见解。",
          "woman": "女士",
          "man": "男人",
          "nonBinary": "非二元",
          "preferNot": "宁愿不说"
        },
        "apaStudy": "📘 表达性写作促进情感处理 — APA Psychology Review",
        "insightsWith": "深入了解"
      },
      "quizIntro": {
        "title": "帮助我们了解您的习惯",
        "description": "可选问题来个性化您的体验",
        "questions": "问题",
        "minutes": "分钟",
        "private": "私人的",
        "accurateInsights": "更准确的见解",
        "recommendations": "个性化推荐",
        "patternTracking": "更好的模式跟踪"
      },
      "analyzing": {
        "emotionalPatterns": "分析情绪模式",
        "responses": "处理您的回复",
        "stressMarkers": "识别压力标记",
        "personalPlan": "制定您的个人计划",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "你的主要模式",
        "perfectionism": "完美主义",
        "anxiety": "焦虑",
        "selfCompassion": "缺乏自我同情心",
        "boundaries": "缺乏界限",
        "selfEsteem": "自卑",
        "descriptions": {
          "perfectionism": "完美主义会让你紧张、陷入困境。它促使你去追求确定性，而不是感觉已经完蛋了。",
          "anxiety": "焦虑常常来自于过于频繁地寻找危险的头脑。即使您是安全的，它也会让您感到紧张。",
          "selfCompassion": "低自我同情心意味着对自己比对所爱的人更严厉。这让增长感觉比需要的更加沉重。",
          "boundaries": "薄弱的界限可能来自于害怕冲突或让别人失望。随着时间的推移，这会让你精疲力竭，远离自己的需求。",
          "selfEsteem": "低自尊会让你的注意力集中在感觉缺乏的事情上。这使得扭曲的自我形象一直存在。"
        },
        "evolution": "我们将跟踪事态的发展并帮助您解决这个问题。"
      },
      "summary": {
        "title": "一切就绪！",
        "mood": "我们将通过引导性反思和见解来帮助您改善情绪。",
        "stress": "我们将通过指导性反思和见解来帮助您减轻压力。",
        "habits": "我们将通过引导性反思和见解帮助您养成习惯。",
        "clarity": "我们将通过指导性反思和见解帮助您获得清晰的思路。",
        "default": "您的个人反思空间已准备好。让我们开始你的旅程吧。"
      },
      "showcase": {
        "label": "尝试一下",
        "title": "自由写作。\n弄清楚。",
        "entry": "您的参赛作品",
        "placeholder": "开始写你的感受...",
        "pickPrompt": "或者选择一个提示",
        "prompts": {
          "overwhelmed": "最近感觉工作压力很大...",
          "outside": "今天我发现外出后我更快乐",
          "procrastinating": "我总是拖延事情，但我不知道为什么",
          "grateful": "今天发生的一件事让我非常感激"
        },
        "thinking": "Insight 正在思考...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "听起来你现在背负着很多东西。认识到这种感觉是第一步 - Insight 可以帮助您跟踪这些模式并找到让您放松的东西。 💜",
          "positive": "这是一个美丽的观察。注意到什么能提升你的情绪是很强大的——Insight 将帮助你随着时间的推移建立这些积极的模式。 ✨",
          "procrastination": "拖延症的根源往往比我们想象的更深。日记可以揭示其背后隐藏的情绪 - Insight 将帮助您理解并克服这些障碍。 🔑",
          "sadness": "感谢您分享这一点。表达困难的感受是勇敢和治愈的。 Insight 在这里倾听并帮助您度过这些时刻。 💙",
          "default": "谢谢您的分享。每一篇文章都是朝着更深层次的自我理解迈出的一步。 Insight 将帮助您发现模式、跟踪您的成长并随着时间的推移获得清晰的思路。 💜"
        }
      },
      "privacy": {
        "title": "您的笔记是完全私密的",
        "subtitle": "我们使用端到端加密来保证您日记条目的安全。只有您可以阅读它们。",
        "encryption": "AES-256加密",
        "passwordKey": "您的密码是关键",
        "cannotRead": "我们无法读取您的条目"
      },
      "notifications": {
        "title": "打开通知",
        "subtitle": "及时了解最新动态，充分利用 Insight。",
        "allow": "允许通知",
        "skip": "暂时跳过 →",
        "permissionTitle": "记得通过通知反映",
        "permissionRequest": "Insight AI 想发给您",
        "permissionType": "通知",
        "dontAllow": "不允许"
      },
      "rateUs": {
        "title": "给我们评分 5 星",
        "subtitle": "帮助我们传播正念生活和个人成长的信息",
        "testimonials": {
          "first": "Insight 彻底改变了我对情绪的理解。人工智能的见解非常准确且很有帮助。",
          "second": "这个应用程序帮助我识别了我以前从未注意到的模式。这就像我的口袋里有一个治疗师。",
          "third": "日常反思和见解已成为我日常自我保健的重要组成部分。"
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "借助 Insight\n了解自己",
          "growth": "追踪你的成长\n与进步",
          "reflect": "深度反思\n生活更美好",
          "mira": "与 Mira 对话",
          "findWhatWorks": "找到适合你的方法"
        },
        "trial": "3 天试用",
        "weekly": "每周",
        "monthly": "每月",
        "yearly": "每年",
        "save": "节省 73%",
        "perDay": "{{price}}/天",
        "perWeek": "每周 {{price}}",
        "perMonth": "每月 {{price}}",
        "perYear": "每年 {{price}}",
        "whatYouGet": "你得到什么：",
        "benefits": {
          "unlimited": "无限量 AI 日记洞察",
          "patterns": "深度模式和触发检测",
          "summaries": "个性化每周总结",
          "playbook": "增长手册和行动计划"
        },
        "testimonials": {
          "first": "Insight 彻底改变了我对情绪的理解。人工智能的见解非常准确且很有帮助。",
          "second": "日记提示很周到，模式跟踪帮助我看到自己随着时间的推移的成长。",
          "third": "我用过的最好的心理健康应用程序。人工智能感觉就像是在和一位真正理解我的治疗师交谈。",
          "fourth": "我喜欢它将我的日常习惯与我的情绪模式联系起来。每周都有令人大开眼界的见解。",
          "fifth": "带有个性化策略的剧本功能改变了我的焦虑。"
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "没有承诺，随时取消。",
        "startJourney": "今天开始我的旅程",
        "restorePurchase": "恢复购买",
        "terms": "条款及条件",
        "privacyPolicy": "隐私政策",
        "alerts": {
          "otherAccountTitle": "在另一个帐户上找到订阅",
          "otherAccountBody": "此订阅属于该设备上的另一个帐户。请登录该帐户以使用 Pro 功能。",
          "otherAccountPurchaseBody": "专业版订阅在此设备上的另一个帐户上处于活动状态。请登录该帐户以使用专业版功能，或为此帐户购买新的订阅。",
          "purchaseSuccessTitle": "购买成功！ 🎉",
          "purchaseSuccessBody": "您现在可以访问无限的 AI 见解和所有 Pro 功能。",
          "inactiveTitle": "订阅未激活",
          "inactiveBody": "无法确认您的购买。如果这种情况持续存在，请联系支持人员。",
          "comingSoonTitle": "订阅即将推出",
          "comingSoonBody": "移动订阅正在设置中。您可以继续使用该应用程序并稍后在网上订阅：myinsightai.app",
          "continueToApp": "继续应用程序",
          "alreadySubscribedTitle": "已订阅",
          "alreadySubscribedBody": "您已经拥有有效的专业版订阅。享受您的高级功能！",
          "existsTitle": "订阅已存在",
          "existsBody": "之前曾使用其他帐户在此设备上购买过订阅。要使用专业版功能，请登录最初购买订阅的帐户。\n\n如果您认为这是一个错误，请尝试恢复购买或联系支持人员。",
          "tryRestore": "尝试恢复",
          "purchaseFailed": "购买失败",
          "purchaseError": "错误：{{message}}\n\n代码：{{code}}\n\n请检查：\n1. 沙箱账户登录（设置 > App Store）\n2、产品配置为App Store Connect\n3. 稍后重试",
          "noPurchasesTitle": "没有找到购买的商品",
          "noPurchasesBody": "未找到此 Apple ID 的有效订阅。",
          "restoreFailed": "恢复失败",
          "restoreError": "无法恢复购买：{{message}}",
          "unknown": "未知",
          "ok": "好的"
        }
      },
      "postPurchase": {
        "title": "欢迎来到Insight",
        "subtitle": "Pro 已全部设置完毕",
        "analysis": "AI 驱动的日记分析",
        "privateEntries": "私有和加密条目",
        "growth": "随着时间的推移跟踪您的成长",
        "accountInfo": "创建一个帐户来保存您的条目并跨设备访问它们。"
      },
      "analysisComplete": {
        "namedTitle": "{{name}}，您的个人计划已准备好",
        "title": "你已经准备好了",
        "reassurance": "您的空间已经准备好了。"
      },
      "aiConsent": {
        "title": "启用人工智能分析吗？",
        "subtitle": "使用人工智能技术从日记条目中获取个性化见解",
        "dataTitle": "发送什么数据",
        "dataBody": "当您点击日记条目上的“分析”时，我们会将文本内容发送到我们的人工智能服务进行分析。",
        "entryText": "您的日记条目文本",
        "noIdentifiers": "没有个人标识符（姓名、电子邮件等）",
        "analyzeOnly": "仅当您点击“分析”按钮时",
        "recipientTitle": "谁接收您的数据",
        "recipientIntro": "我们使用",
        "providerName": "Groq",
        "recipientCompany": "（一家人工智能基础设施公司）运行的",
        "modelName": "Llama 3",
        "recipientModelTail": "语言模型来分析您的日记条目。",
        "recipientPrivacy": "Groq 根据其隐私政策处理您的数据，并且不会使用您的数据来训练 AI 模型。",
        "protectionTitle": "您的数据如何受到保护",
        "encrypted": "所有数据在传输过程中均进行加密 (HTTPS/TLS)",
        "secureStorage": "您的条目安全地存储在您的私人数据库中",
        "revoke": "您可以随时在“设置”中撤销同意",
        "optional": "人工智能功能是可选的——没有它们你也可以写日记",
        "notice": "接受即表示您同意在点击“分析”时将您的日记条目文本发送到 Groq 进行 AI 分析。有关完整详细信息，请参阅我们的隐私政策。",
        "decline": "拒绝",
        "accept": "接受并继续"
      }
    }
  },
  "hi": {
    "onboarding": {
      "welcome": "Insight में आपका स्वागत है",
      "getStarted": "शुरू हो जाओ",
      "alreadyHaveAccount": "क्या आपके पास पहले से एक खाता मौजूद है?",
      "signIn": "दाखिल करना",
      "reflectGrow": "चिंतन करें। आगे बढ़ें।",
      "valuableInsights": "बहुमूल्य अंतर्दृष्टि प्राप्त करें",
      "reflectionToSteps": "प्रतिबिंब को अगले चरणों में बदलें.",
      "weekAtGlance": "एक नज़र में अपना सप्ताह देखें",
      "skip": "छोडना",
      "skipForNow": "अभी के लिए छोड़ दे",
      "valueProp": {
        "title": "Insight विचारों को स्पष्टता में बदल देता है",
        "mentalNoise": "मानसिक शोर",
        "understanding": "समझ",
        "captureFeelings": "आप कैसा महसूस करते हैं उसे कैद करें",
        "understandPatterns": "समय के साथ पैटर्न को समझें",
        "gainClarity": "स्पष्टता प्राप्त करें - अव्यवस्था नहीं"
      },
      "patterns": {
        "eyebrow": "एआई द्वारा संचालित",
        "title": "अपने पैटर्न ट्रैक करें\nसमय के साथ",
        "subtitle": "Insight यह पहचानता है कि कौन सी चीज़ आपको रोक रही है और काम करने के लिए आपकी सर्वोच्च प्राथमिकताओं को सामने लाती है।",
        "adjustSleep": "नींद का शेड्यूल समायोजित करें",
        "selfCompassion": "आत्म-करुणा का अधिक अभ्यास करें",
        "reduceScreenTime": "सोने से पहले स्क्रीन का समय कम करें",
        "manageStress": "तनाव को सक्रिय रूप से प्रबंधित करें",
        "setBoundaries": "स्पष्ट सीमाएँ निर्धारित करें",
        "challengeSelfTalk": "नकारात्मक आत्म-चर्चा को चुनौती दें",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "विकास का जश्न मनाएं",
        "title": "अपनी उपलब्धियों का भी\nजश्न मनाएँ",
        "subtitle": "Insight यह भी पता लगाता है कि क्या अच्छा चल रहा है ताकि आप अपनी ताकत पर निर्माण कर सकें।",
        "gym": "लगातार जिम जाना",
        "reading": "इस सप्ताह हर दिन पढ़ना",
        "openingUp": "लोगों के लिए और अधिक खुलना",
        "calm": "दबाव में शांत रहना",
        "morningRoutine": "सुबह की दिनचर्या बनाए रखना",
        "perseverance": "कठिन क्षणों से जूझना"
      },
      "research": {
        "title": "मनोविज्ञान पर\nआधारित",
        "body": "शोध से पता चलता है कि चिंतनशील जर्नलिंग भावनात्मक जागरूकता और दीर्घकालिक कल्याण में सुधार करती है।",
        "citation": "Advances in Psychiatric Treatment, 2005",
        "learnMore": "और अधिक जानें"
      },
      "auth": {
        "createAccount": "खाता बनाएं",
        "createYourAccount": "अपना खाता बनाएं",
        "subtitle": "आरंभ करने के लिए एक विकल्प चुनें",
        "postPurchaseSubtitle": "अपनी प्रविष्टियाँ सहेजें और उन्हें सभी डिवाइसों पर एक्सेस करें",
        "apple": "Apple के साथ जारी रखें",
        "google": "Google के साथ जारी रखें",
        "email": "ईमेल जारी रखें",
        "signInPrompt": "क्या आपके पास पहले से एक खाता मौजूद है?",
        "appleFailed": "Apple साइन-इन विफल",
        "googleFailed": "Google साइन-इन विफल",
        "genericError": "एक त्रुटि पाई गई"
      },
      "vibe": {
        "title": "अपना वाइब चुनें",
        "dark": "गहरा",
        "light": "हल्का",
        "sunset": "सूर्यास्त",
        "vibrant": "जीवंत",
        "ocean": "महासागर",
        "midnight": "मध्यरात्रि"
      },
      "questions": {
        "name": {
          "title": "आपका क्या नाम है?",
          "subtitle": "हम इसका उपयोग आपके अनुभव को निजीकृत करने के लिए करेंगे।",
          "placeholder": "अपना नाम दर्ज करें"
        },
        "referral": {
          "title": "आपने हमारे बारे में कहां सुना?",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "दोस्त",
          "other": "अन्य"
        },
        "goal": {
          "title": "अभी आपका मुख्य लक्ष्य क्या है?",
          "mood": "मूड में सुधार",
          "stress": "तनाव को कम करें",
          "habits": "आदतें बनाएँ",
          "clarity": "स्पष्टता प्राप्त करें"
        },
        "research": {
          "title": "मनोविज्ञान पर आधारित",
          "subtitle": "शोध से पता चलता है कि चिंतनशील जर्नलिंग भावनात्मक जागरूकता और दीर्घकालिक कल्याण में सुधार करती है।",
          "badge": "Cambridge University",
          "screenTitle": "Insight मनोविज्ञान पर आधारित है",
          "body": "जर्नलिंग बेहतर भावनात्मक जागरूकता और मानसिक भलाई से जुड़ी हुई है।"
        },
        "frequency": {
          "title": "आप कितनी बार प्रतिबिंबित करना चाहते हैं?",
          "daily": "दैनिक",
          "weekly": "साप्ताहिक",
          "asNeeded": "जरुरत के अनुसार"
        },
        "experience": {
          "title": "आप कब से पत्रकारिता कर रहे हैं?",
          "new": "मैं जर्नलिंग में नया हूं",
          "underSixMonths": "<6 महीने",
          "sixToTwentyFourMonths": "6-24 महीने",
          "twoPlusYears": "2+ वर्ष"
        },
        "wellbeing": {
          "title": "आप अपनी दैनिक भलाई का मूल्यांकन कैसे करेंगे?",
          "subtitle": "1-10 के पैमाने पर, आप आमतौर पर कहाँ महसूस करते हैं?",
          "typicalDay": "खासियत दिन"
        },
        "stressResponse": {
          "title": "जब आप दबाव में होते हैं तो आप क्या करते हैं?",
          "ruminate": "जुगाली करना या सर्पिल करना",
          "selfBlame": "स्वत: जिम्मेदार",
          "fixate": "इसे पूर्ण बनाने पर ध्यान केंद्रित करें",
          "stepBack": "रोकें और पुनः समूहित करें"
        },
        "selfTalk": {
          "title": "आप अपनी आंतरिक आवाज़ का वर्णन कैसे करेंगे?",
          "critical": "अक्सर कठोर या आलोचना करने वाला",
          "mixed": "दिन पर निर्भर है",
          "supportive": "अधिकतर सहायक"
        },
        "coping": {
          "title": "जब भावनाएँ प्रबल हो जाती हैं, तो कौन सी चीज़ आपकी सबसे अधिक मदद करती है?",
          "social": "इसके माध्यम से बात कर रहे हैं",
          "physical": "मेरे शरीर को हिलाना",
          "expressive": "जर्नलिंग या रचनात्मक कार्य",
          "solitude": "रिचार्ज करने के लिए अकेले समय"
        },
        "change": {
          "title": "आप आम तौर पर बड़े बदलावों पर कैसे प्रतिक्रिया देते हैं?",
          "resistant": "पहले विरोध करें, फिर अनुकूलन करें",
          "anxious": "चिंतित महसूस करें लेकिन आगे बढ़ें",
          "embrace": "चुनौती को स्वीकार करें",
          "support": "बहुत सारे समर्थन की जरूरत है"
        },
        "motivation": {
          "title": "जब चीज़ें कठिन हो जाती हैं तो आपको आगे बढ़ते रहने के लिए क्या प्रेरित करता है?",
          "fear": "असफलता या दूसरों को नीचा दिखाने का डर",
          "external": "बाहरी पुरस्कार या मान्यता",
          "values": "आंतरिक मूल्य और उद्देश्य",
          "passion": "मैं जो करता हूं उससे प्यार करता हूं"
        },
        "relationships": {
          "title": "करीबी रिश्तों में, आपके लिए क्या पैटर्न दिखता है?",
          "anxious": "मुझे बहुत आश्वासन की जरूरत है",
          "avoidant": "जब चीजें तीव्र हो जाती हैं तो मैं दूर हो जाता हूं",
          "fearful": "मैं बारी-बारी से धक्का देकर दूर चला जाता हूं और चिपक जाता हूं",
          "secure": "मैं सुरक्षित और आरामदायक महसूस करता हूं"
        },
        "conflict": {
          "title": "जब कोई तनाव या संघर्ष होता है, तो आप आमतौर पर...",
          "avoid": "इससे किसी भी कीमत पर बचो",
          "accommodate": "इसे सुचारू करने का प्रयास करें या कृपया",
          "compete": "जीतने या अपनी बात साबित करने के लिए प्रयास करें",
          "collaborate": "इसे शांति से और सीधे तौर पर संबोधित करें"
        },
        "rest": {
          "title": "आपके लिए आराम कैसा दिखता है?",
          "guilt": "मैं आराम करने के लिए संघर्ष करता हूँ—मैं दोषी महसूस करता हूँ",
          "solitude": "मुझे पूर्ण एकांत चाहिए",
          "social": "मैं सामाजिक संपर्क के माध्यम से रिचार्ज करता हूं",
          "active": "मैं शांत करने वाली गतिविधियाँ करके आराम करता हूँ"
        },
        "identitySource": {
          "title": "आप अपनी पहचान की भावना सबसे अधिक कहाँ से प्राप्त करते हैं?",
          "achievement": "मेरी उपलब्धियाँ और सफलता",
          "relationships": "मेरे रिश्ते और संबंध",
          "values": "मेरे मूल्य और विश्वास",
          "expression": "मेरी रचनात्मकता या आत्म-अभिव्यक्ति"
        },
        "failure": {
          "title": "जब आप असफल होते हैं या कोई गलती करते हैं, तो आपकी पहली प्रतिक्रिया क्या होती है?",
          "shame": "मुझे ऐसा लगता है कि मैं उतना अच्छा नहीं हूं",
          "defensive": "मैं रक्षात्मक हो जाता हूं या बाहरी कारकों को दोष देता हूं",
          "analytical": "मैं विश्लेषण करता हूं कि क्या गलत हुआ",
          "growth": "मैं इसे सीखने के अवसर के रूप में देखता हूं"
        },
        "awareness": {
          "title": "आप इस समय अपनी भावनाओं के प्रति कितने जागरूक हैं?",
          "low": "मैं अक्सर बाद तक ध्यान नहीं देता",
          "moderate": "मैं उन्हें महसूस करता हूं लेकिन हमेशा उनका नाम नहीं बता सकता",
          "high": "मैं अधिकांश भावनाओं को उनके घटित होते ही पहचान सकता हूँ",
          "veryHigh": "मैं सूक्ष्म बदलावों के प्रति बहुत अभ्यस्त हूं"
        },
        "decisions": {
          "title": "महत्वपूर्ण निर्णय लेते समय, आप...",
          "overthink": "जरूरत से ज्यादा सोचें और विश्लेषण पक्षाघात में फंस जाएं",
          "intuitive": "मेरी सहज प्रवृत्ति के साथ जाओ",
          "external": "दूसरों से खूब सलाह लें",
          "systematic": "नफा-नुकसान को व्यवस्थित ढंग से तौलें"
        },
        "gender": {
          "title": "आप कैसे पहचानते हैं?",
          "subtitle": "हम इसका उपयोग केवल अंतर्दृष्टि को वैयक्तिकृत करने के लिए करते हैं।",
          "woman": "महिला",
          "man": "आदमी",
          "nonBinary": "गैर-बाइनरी",
          "preferNot": "नहीं कहना पसंद करते हैं"
        },
        "apaStudy": "📘 अभिव्यंजक लेखन भावनात्मक प्रसंस्करण को बढ़ावा देता है - APA Psychology Review",
        "insightsWith": "के साथ जानकारी प्राप्त करें"
      },
      "quizIntro": {
        "title": "अपनी आदतों को समझने में हमारी सहायता करें",
        "description": "आपके अनुभव को निजीकृत करने के लिए वैकल्पिक प्रश्न",
        "questions": "प्रश्न",
        "minutes": "मिनट",
        "private": "निजी",
        "accurateInsights": "अधिक सटीक अंतर्दृष्टि",
        "recommendations": "वैयक्तिकृत सिफ़ारिशें",
        "patternTracking": "बेहतर पैटर्न ट्रैकिंग"
      },
      "analyzing": {
        "emotionalPatterns": "भावनात्मक पैटर्न का विश्लेषण",
        "responses": "आपकी प्रतिक्रियाएँ संसाधित की जा रही हैं",
        "stressMarkers": "तनाव मार्करों की पहचान करना",
        "personalPlan": "अपनी व्यक्तिगत योजना बनाना",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "आपका प्राथमिक पैटर्न",
        "perfectionism": "परिपूर्णतावाद",
        "anxiety": "चिंता",
        "selfCompassion": "आत्म-करुणा का अभाव",
        "boundaries": "सीमाओं का अभाव",
        "selfEsteem": "कम आत्म सम्मान",
        "descriptions": {
          "perfectionism": "पूर्णतावाद आपको तनावग्रस्त और अटका हुआ रख सकता है। यह आपको समाप्त महसूस करने के बजाय निश्चितता का पीछा करने के लिए प्रेरित करता है।",
          "anxiety": "चिंता अक्सर उस दिमाग से आती है जो अक्सर खतरे को भांप लेता है। जब आप सुरक्षित हों तब भी यह आपको तनावग्रस्त कर सकता है।",
          "selfCompassion": "कम आत्म-करुणा का मतलब है कि आप जिस व्यक्ति से प्यार करते हैं उसकी तुलना में अपने आप पर अधिक सख्त होना। इससे विकास आवश्यकता से अधिक भारी महसूस होता है।",
          "boundaries": "कमज़ोर सीमाएँ संघर्ष के डर या लोगों को निराश करने से आ सकती हैं। समय के साथ, यह आपको थका देता है और आपकी अपनी जरूरतों से दूर हो जाता है।",
          "selfEsteem": "कम आत्मसम्मान आपके दिमाग को उस चीज़ पर केंद्रित कर सकता है जिसमें कमी महसूस होती है। इससे एक विकृत आत्म-छवि बनी रहती है।"
        },
        "evolution": "हम ट्रैक करेंगे कि यह कैसे विकसित होता है और इस पर काम करने में आपकी मदद करेंगे।"
      },
      "summary": {
        "title": "तुम सब सेट हो!",
        "mood": "हम निर्देशित चिंतन और अंतर्दृष्टि के साथ आपके मूड को बेहतर बनाने में आपकी सहायता करेंगे।",
        "stress": "हम निर्देशित चिंतन और अंतर्दृष्टि से तनाव कम करने में आपकी सहायता करेंगे।",
        "habits": "हम आपको निर्देशित चिंतन और अंतर्दृष्टि के साथ आदतें बनाने में मदद करेंगे।",
        "clarity": "हम आपको निर्देशित चिंतन और अंतर्दृष्टि के साथ स्पष्टता प्राप्त करने में मदद करेंगे।",
        "default": "चिंतन के लिए आपका व्यक्तिगत स्थान तैयार है। आइए अपनी यात्रा शुरू करें."
      },
      "showcase": {
        "label": "कोशिश करके देखो",
        "title": "खुलकर लिखें.\nस्पष्टता प्राप्त करें.",
        "entry": "आपकी प्रविष्टि",
        "placeholder": "आप कैसा महसूस करते हैं, लिखना शुरू करें...",
        "pickPrompt": "या कोई संकेत चुनें",
        "prompts": {
          "overwhelmed": "मैं हाल ही में काम से अभिभूत महसूस कर रहा हूं...",
          "outside": "आज मैंने देखा कि बाहर जाने के बाद मैं अधिक खुश था",
          "procrastinating": "मैं चीजों को टालता रहता हूं और मुझे यकीन नहीं है कि क्यों",
          "grateful": "आज कुछ ऐसा हुआ जिसने मुझे सचमुच आभारी बना दिया"
        },
        "thinking": "Insight सोच रहा है...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "ऐसा लगता है जैसे आप अभी बहुत कुछ लेकर चल रहे हैं। उस भावना को पहचानना पहला कदम है - Insight आपको इन पैटर्न को ट्रैक करने और यह पता लगाने में मदद कर सकता है कि आपको क्या राहत मिलती है। 💜",
          "positive": "यह एक सुंदर अवलोकन है. आपके मूड को बेहतर बनाने वाली चीज़ों पर ध्यान देना शक्तिशाली है - Insight आपको समय के साथ इन सकारात्मक पैटर्न को बनाने में मदद करेगा। ✨",
          "procrastination": "टालमटोल की जड़ें अक्सर जितना हम सोचते हैं उससे अधिक गहरी होती हैं। जर्नलिंग इसके पीछे छिपी भावनाओं को उजागर कर सकती है - Insight आपको उन अवरोधों को समझने और दूर करने में मदद करेगा। 🔑",
          "sadness": "इसे साझा करने के लिए धन्यवाद। कठिन भावनाओं को व्यक्त करना साहसपूर्ण और उपचारात्मक है। Insight इन क्षणों को सुनने और आपकी मदद करने के लिए यहां है। 💙",
          "default": "जानकारी के लिए धन्यवाद। प्रत्येक प्रविष्टि गहरी आत्म-समझ की ओर एक कदम है। Insight आपको पैटर्न को उजागर करने, आपके विकास को ट्रैक करने और समय के साथ स्पष्टता हासिल करने में मदद करेगा। 💜"
        }
      },
      "privacy": {
        "title": "आपके नोट्स पूर्णतः निजी हैं",
        "subtitle": "हम आपकी जर्नल प्रविष्टियों को सुरक्षित रखने के लिए एंड-टू-एंड एन्क्रिप्शन का उपयोग करते हैं। इन्हें केवल आप ही पढ़ सकते हैं.",
        "encryption": "AES-256 एन्क्रिप्शन",
        "passwordKey": "आपका पासवर्ड कुंजी है",
        "cannotRead": "हम आपकी प्रविष्टियाँ नहीं पढ़ सकते"
      },
      "notifications": {
        "title": "सूचनाओं पर मुड़ें",
        "subtitle": "क्या हो रहा है इसके बारे में अपडेट रहकर Insight का अधिकतम लाभ उठाएं।",
        "allow": "सूचनाओं की अनुमति दें",
        "skip": "अभी के लिए छोड़ें →",
        "permissionTitle": "सूचनाओं के साथ प्रतिबिंबित करना याद रखें",
        "permissionRequest": "Insight AI आपको भेजना चाहता हूँ",
        "permissionType": "सूचनाएं",
        "dontAllow": "अनुमति न दें"
      },
      "rateUs": {
        "title": "हमें 5 स्टार रेटिंग दें",
        "subtitle": "सचेत जीवन और व्यक्तिगत विकास का संदेश फैलाने में हमारी मदद करें",
        "testimonials": {
          "first": "Insight ने मेरी भावनाओं को समझने के तरीके को पूरी तरह से बदल दिया है। एआई अंतर्दृष्टि अविश्वसनीय रूप से सटीक और सहायक हैं।",
          "second": "इस ऐप ने मुझे उन पैटर्न को पहचानने में मदद की जिन पर मैंने पहले कभी ध्यान नहीं दिया था। यह मेरी जेब में एक चिकित्सक होने जैसा है।",
          "third": "दैनिक चिंतन और अंतर्दृष्टि मेरी आत्म-देखभाल दिनचर्या का एक अनिवार्य हिस्सा बन गए हैं।"
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "Insight के साथ\nखुद को समझें",
          "growth": "अपनी प्रगति और\nविकास को ट्रैक करें",
          "reflect": "गहराई से चिंतन करें,\nबेहतर जीवन जिएँ",
          "mira": "Mira से बात करें",
          "findWhatWorks": "जो काम करता है उसे खोजें"
        },
        "trial": "3 दिवसीय परीक्षण",
        "weekly": "साप्ताहिक",
        "monthly": "महीने के",
        "yearly": "सालाना",
        "save": "73% बचाएं",
        "perDay": "{{price}}/दिन",
        "perWeek": "{{price}} प्रति सप्ताह",
        "perMonth": "{{price}} प्रति माह",
        "perYear": "{{price}} प्रति वर्ष",
        "whatYouGet": "आपको क्या मिलता है:",
        "benefits": {
          "unlimited": "असीमित एआई-संचालित जर्नल अंतर्दृष्टि",
          "patterns": "गहरे पैटर्न और ट्रिगर का पता लगाना",
          "summaries": "वैयक्तिकृत साप्ताहिक सारांश",
          "playbook": "विकास प्लेबुक और कार्य योजनाएँ"
        },
        "testimonials": {
          "first": "Insight ने मेरी भावनाओं को समझने के तरीके को पूरी तरह से बदल दिया है। एआई अंतर्दृष्टि अविश्वसनीय रूप से सटीक और सहायक हैं।",
          "second": "जर्नलिंग संकेत विचारशील हैं और पैटर्न ट्रैकिंग मुझे समय के साथ अपने विकास को देखने में मदद करती है।",
          "third": "मेरे द्वारा उपयोग किया गया सर्वश्रेष्ठ मानसिक स्वास्थ्य ऐप। एआई को ऐसा महसूस होता है जैसे मैं किसी थेरेपिस्ट से बात कर रहा हूं जो वास्तव में मुझसे मिलता है।",
          "fourth": "मुझे यह पसंद है कि यह कैसे मेरी दैनिक आदतों को मेरे मूड पैटर्न से जोड़ता है। हर सप्ताह आंखें खोल देने वाली अंतर्दृष्टि।",
          "fifth": "वैयक्तिकृत रणनीतियों के साथ प्लेबुक सुविधा मेरी चिंता के लिए गेम-चेंजर रही है।"
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "कोई प्रतिबद्धता नहीं, कभी भी रद्द करें।",
        "startJourney": "आज ही मेरी यात्रा प्रारंभ करें",
        "restorePurchase": "पुनःस्थापन क्रय",
        "terms": "नियम एवं शर्तें",
        "privacyPolicy": "गोपनीयता नीति",
        "alerts": {
          "otherAccountTitle": "किसी अन्य खाते पर सदस्यता मिली",
          "otherAccountBody": "यह सदस्यता इस डिवाइस पर किसी भिन्न खाते से संबंधित है. प्रो सुविधाओं का उपयोग करने के लिए कृपया उस खाते में लॉग इन करें।",
          "otherAccountPurchaseBody": "इस डिवाइस पर एक अलग खाते पर एक प्रो सदस्यता सक्रिय है। प्रो सुविधाओं का उपयोग करने के लिए कृपया उस खाते में लॉग इन करें, या इस खाते के लिए एक नई सदस्यता खरीदें।",
          "purchaseSuccessTitle": "खरीदारी सफल! 🎉",
          "purchaseSuccessBody": "अब आपके पास असीमित एआई अंतर्दृष्टि और सभी प्रो सुविधाओं तक पहुंच है।",
          "inactiveTitle": "सदस्यता सक्रिय नहीं है",
          "inactiveBody": "आपकी खरीदारी की पुष्टि नहीं की जा सकी. यदि यह जारी रहता है तो कृपया सहायता से संपर्क करें।",
          "comingSoonTitle": "सदस्यताएँ जल्द ही आ रही हैं",
          "comingSoonBody": "मोबाइल सदस्यताएँ स्थापित की जा रही हैं. आप ऐप का उपयोग जारी रख सकते हैं और बाद में वेब पर myinsightai.app पर सदस्यता ले सकते हैं",
          "continueToApp": "ऐप जारी रखें",
          "alreadySubscribedTitle": "पहले से सदस्यता ले रखी",
          "alreadySubscribedBody": "आपके पास पहले से ही एक सक्रिय प्रो सदस्यता है। अपनी प्रीमियम सुविधाओं का आनंद लें!",
          "existsTitle": "सदस्यता पहले से मौजूद है",
          "existsBody": "इस डिवाइस पर पहले किसी भिन्न खाते से सदस्यता खरीदी गई थी. प्रो सुविधाओं का उपयोग करने के लिए, कृपया उस खाते में लॉग इन करें जिसने मूल रूप से सदस्यता खरीदी थी।\n\nयदि आपको लगता है कि यह एक त्रुटि है, तो खरीदारी बहाल करने का प्रयास करें या सहायता से संपर्क करें।",
          "tryRestore": "पुनर्स्थापित करने का प्रयास करें",
          "purchaseFailed": "खरीदारी विफल",
          "purchaseError": "त्रुटि: {{message}}\n\nकोड: {{code}}\n\nकृपया जांचें:\n1. सैंडबॉक्स खाता साइन इन है (सेटिंग्स > App Store)\n2. उत्पाद App Store Connect में कॉन्फ़िगर किए गए हैं\n3. कुछ क्षणों में पुनः प्रयास करें",
          "noPurchasesTitle": "कोई खरीदारी नहीं मिली",
          "noPurchasesBody": "इस Apple ID के लिए कोई सक्रिय सदस्यता नहीं मिली।",
          "restoreFailed": "पुनर्स्थापना विफल",
          "restoreError": "खरीदारी बहाल नहीं की जा सकी: {{message}}",
          "unknown": "अज्ञात",
          "ok": "ठीक है"
        }
      },
      "postPurchase": {
        "title": "Insight में आपका स्वागत है",
        "subtitle": "आप प्रो के साथ पूरी तरह तैयार हैं",
        "analysis": "एआई-संचालित जर्नल विश्लेषण",
        "privateEntries": "निजी एवं एन्क्रिप्टेड प्रविष्टियाँ",
        "growth": "समय के साथ अपने विकास को ट्रैक करें",
        "accountInfo": "अपनी प्रविष्टियाँ सहेजने और उन्हें सभी डिवाइसों तक पहुँचने के लिए एक खाता बनाएँ।"
      },
      "analysisComplete": {
        "namedTitle": "{{name}}, आपकी व्यक्तिगत योजना तैयार है",
        "title": "तुम सब सेट हो",
        "reassurance": "आपकी जगह तैयार है."
      },
      "aiConsent": {
        "title": "AI विश्लेषण सक्षम करें?",
        "subtitle": "एआई तकनीक का उपयोग करके अपनी जर्नल प्रविष्टियों से व्यक्तिगत जानकारी प्राप्त करें",
        "dataTitle": "कौन सा डेटा भेजा गया है",
        "dataBody": "जब आप किसी जर्नल प्रविष्टि पर \"विश्लेषण करें\" पर टैप करते हैं, तो हम पाठ सामग्री को विश्लेषण के लिए हमारी एआई सेवा को भेजते हैं।",
        "entryText": "आपका जर्नल प्रविष्टि पाठ",
        "noIdentifiers": "कोई व्यक्तिगत पहचानकर्ता नहीं (नाम, ईमेल, आदि)",
        "analyzeOnly": "केवल तभी जब आप \"विश्लेषण करें\" बटन पर टैप करें",
        "recipientTitle": "आपका डेटा कौन प्राप्त करता है",
        "recipientIntro": "हम ",
        "providerName": "Groq",
        "recipientCompany": " (एक एआई इन्फ्रास्ट्रक्चर कंपनी) द्वारा संचालित ",
        "modelName": "Llama 3",
        "recipientModelTail": " भाषा मॉडल का उपयोग आपकी डायरी प्रविष्टियों का विश्लेषण करने के लिए करते हैं।",
        "recipientPrivacy": "Groq आपके डेटा को उनकी गोपनीयता नीति के अनुसार संसाधित करता है और AI मॉडल को प्रशिक्षित करने के लिए आपके डेटा का उपयोग नहीं करता है।",
        "protectionTitle": "आपका डेटा कैसे सुरक्षित है",
        "encrypted": "ट्रांज़िट में सभी डेटा एन्क्रिप्ट किया गया है (HTTPS/TLS)",
        "secureStorage": "आपकी प्रविष्टियाँ आपके निजी डेटाबेस में सुरक्षित रूप से संग्रहीत हैं",
        "revoke": "आप सेटिंग्स में किसी भी समय सहमति रद्द कर सकते हैं",
        "optional": "एआई सुविधाएँ वैकल्पिक हैं - आप उनके बिना जर्नल कर सकते हैं",
        "notice": "स्वीकार करते हुए, आप \"विश्लेषण\" पर टैप करने पर AI विश्लेषण के लिए अपना जर्नल प्रविष्टि पाठ Groq पर भेजने की सहमति देते हैं। संपूर्ण विवरण के लिए हमारी गोपनीयता नीति देखें।",
        "decline": "अस्वीकार करें",
        "accept": "स्वीकार करें और जारी रखें"
      }
    }
  },
  "fr": {
    "onboarding": {
      "welcome": "Bienvenue à Insight",
      "getStarted": "Commencer",
      "alreadyHaveAccount": "Vous avez déjà un compte ?",
      "signIn": "Se connecter",
      "reflectGrow": "Réfléchir. Grandir.",
      "valuableInsights": "Obtenez des informations précieuses",
      "reflectionToSteps": "Transformez la réflexion en étapes suivantes.",
      "weekAtGlance": "Vérifiez votre semaine en un coup d'œil",
      "skip": "Sauter",
      "skipForNow": "Passer pour l'instant",
      "valueProp": {
        "title": "Insight transforme les pensées en clarté",
        "mentalNoise": "Bruit mental",
        "understanding": "Compréhension",
        "captureFeelings": "Capturez ce que vous ressentez",
        "understandPatterns": "Comprendre les tendances au fil du temps",
        "gainClarity": "Gagnez en clarté, sans encombrement"
      },
      "patterns": {
        "eyebrow": "Propulsé par l'IA",
        "title": "Suivez vos modèles\nau fil du temps",
        "subtitle": "Insight identifie ce qui vous retient et présente vos principales priorités sur lesquelles travailler.",
        "adjustSleep": "Ajuster l'horaire de sommeil",
        "selfCompassion": "Pratiquez davantage l’auto-compassion",
        "reduceScreenTime": "Réduire le temps passé devant un écran avant de se coucher",
        "manageStress": "Gérer le stress de manière proactive",
        "setBoundaries": "Fixez des limites plus claires",
        "challengeSelfTalk": "Remettez en question le discours intérieur négatif",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "Célébrez la croissance",
        "title": "Célébrez aussi\nvos réussites",
        "subtitle": "Insight repère également ce qui se passe bien afin que vous puissiez tirer parti de vos points forts.",
        "gym": "Aller régulièrement à la salle de sport",
        "reading": "Lire tous les jours cette semaine",
        "openingUp": "S'ouvrir davantage aux gens",
        "calm": "Rester calme sous pression",
        "morningRoutine": "Maintenir une routine matinale",
        "perseverance": "Traverser des moments difficiles"
      },
      "research": {
        "title": "Fondé sur\nla psychologie",
        "body": "La recherche montre que la tenue d’un journal réflexif améliore la conscience émotionnelle et le bien-être à long terme.",
        "citation": "Advances in Psychiatric Treatment, 2005",
        "learnMore": "Apprendre encore plus"
      },
      "auth": {
        "createAccount": "Créer un compte",
        "createYourAccount": "Créez votre compte",
        "subtitle": "Sélectionnez une option pour commencer",
        "postPurchaseSubtitle": "Enregistrez vos entrées et accédez-y sur tous les appareils",
        "apple": "Continuer avec Apple",
        "google": "Continuer avec Google",
        "email": "Continuer avec l'e-mail",
        "signInPrompt": "Vous avez déjà un compte ?",
        "appleFailed": "Échec de la connexion à Apple",
        "googleFailed": "Échec de la connexion à Google",
        "genericError": "Une erreur s'est produite"
      },
      "vibe": {
        "title": "Choisissez votre ambiance",
        "dark": "Sombre",
        "light": "Clair",
        "sunset": "Coucher de soleil",
        "vibrant": "Vibrant",
        "ocean": "Océan",
        "midnight": "Minuit"
      },
      "questions": {
        "name": {
          "title": "Quel est ton nom?",
          "subtitle": "Nous l'utiliserons pour personnaliser votre expérience.",
          "placeholder": "Entrez votre nom"
        },
        "referral": {
          "title": "Où avez-vous entendu parler de nous ?",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "Ami",
          "other": "Autre"
        },
        "goal": {
          "title": "Quel est votre objectif principal en ce moment ?",
          "mood": "Améliorer l'humeur",
          "stress": "Réduire le stress",
          "habits": "Construire des habitudes",
          "clarity": "Gagner en clarté"
        },
        "research": {
          "title": "Fondé sur la psychologie",
          "subtitle": "La recherche montre que la tenue d’un journal réflexif améliore la conscience émotionnelle et le bien-être à long terme.",
          "badge": "Cambridge University",
          "screenTitle": "Insight est fondé sur la psychologie",
          "body": "La tenue d'un journal est liée à une meilleure conscience émotionnelle et à un meilleur bien-être mental."
        },
        "frequency": {
          "title": "À quelle fréquence souhaitez-vous réfléchir ?",
          "daily": "Tous les jours",
          "weekly": "Hebdomadaire",
          "asNeeded": "Au besoin"
        },
        "experience": {
          "title": "Depuis combien de temps tenez-vous un journal ?",
          "new": "Je suis nouveau dans la journalisation",
          "underSixMonths": "< 6 mois",
          "sixToTwentyFourMonths": "6 à 24 mois",
          "twoPlusYears": "2+ ans"
        },
        "wellbeing": {
          "title": "Comment évaluez-vous votre bien-être au quotidien ?",
          "subtitle": "Sur une échelle de 1 à 10, où vous sentez-vous généralement ?",
          "typicalDay": "JOURNÉE TYPIQUE"
        },
        "stressResponse": {
          "title": "Lorsque vous êtes sous pression, qu’avez-vous tendance à faire ?",
          "ruminate": "Ruminer ou spirale",
          "selfBlame": "Me blâmer",
          "fixate": "Fixez-vous à le rendre parfait",
          "stepBack": "Pause et regroupement"
        },
        "selfTalk": {
          "title": "Comment décririez-vous votre voix intérieure ?",
          "critical": "Souvent dur ou jugeant",
          "mixed": "Cela dépend du jour",
          "supportive": "Surtout solidaire"
        },
        "coping": {
          "title": "Lorsque les émotions vous envahissent, qu’est-ce qui vous aide le plus ?",
          "social": "En parler",
          "physical": "Bouger mon corps",
          "expressive": "Journalisation ou travail créatif",
          "solitude": "Du temps seul pour se ressourcer"
        },
        "change": {
          "title": "Comment réagissez-vous généralement aux grands changements ?",
          "resistant": "Résistez d'abord, puis adaptez-vous",
          "anxious": "Sentez-vous anxieux mais continuez",
          "embrace": "Relevez le défi",
          "support": "Besoin de beaucoup de soutien"
        },
        "motivation": {
          "title": "Qu’est-ce qui vous pousse à continuer quand les choses deviennent difficiles ?",
          "fear": "Peur de l'échec ou de laisser tomber les autres",
          "external": "Récompenses ou reconnaissance externes",
          "values": "Valeurs internes et objectif",
          "passion": "L'amour pour ce que je fais"
        },
        "relationships": {
          "title": "Dans vos relations étroites, quel modèle vous apparaît ?",
          "anxious": "J'ai beaucoup besoin d'être rassuré",
          "avoidant": "Je m'éloigne quand les choses deviennent intenses",
          "fearful": "J'alterne entre repousser et m'accrocher",
          "secure": "Je me sens en sécurité et à l'aise"
        },
        "conflict": {
          "title": "Lorsqu'il y a des tensions ou des conflits, vous avez généralement...",
          "avoid": "Evitez-le à tout prix",
          "accommodate": "Essayez de le lisser ou s'il vous plaît",
          "compete": "Poussez pour gagner ou prouver mon point de vue",
          "collaborate": "Abordez-le calmement et directement"
        },
        "rest": {
          "title": "À quoi ressemble le repos pour vous ?",
          "guilt": "J'ai du mal à me reposer, je me sens coupable",
          "solitude": "J'ai besoin d'une solitude totale",
          "social": "Je recharge grâce à la connexion sociale",
          "active": "Je me repose en faisant des activités apaisantes"
        },
        "identitySource": {
          "title": "D’où tirez-vous le plus votre sentiment d’identité ?",
          "achievement": "Mes réalisations et succès",
          "relationships": "Mes relations et connexions",
          "values": "Mes valeurs et convictions",
          "expression": "Ma créativité ou mon expression personnelle"
        },
        "failure": {
          "title": "Lorsque vous échouez ou faites une erreur, quelle est votre première réaction ?",
          "shame": "J'ai l'impression de ne pas être assez bien",
          "defensive": "Je suis sur la défensive ou je blâme des facteurs externes",
          "analytical": "J'analyse ce qui n'a pas fonctionné",
          "growth": "Je le vois comme une opportunité d'apprentissage"
        },
        "awareness": {
          "title": "Dans quelle mesure êtes-vous conscient de vos émotions du moment ?",
          "low": "Souvent, je ne le remarque que plus tard",
          "moderate": "Je les ressens mais je ne peux pas toujours les nommer",
          "high": "Je peux identifier la plupart des émotions au fur et à mesure qu'elles se produisent",
          "veryHigh": "Je suis très sensible aux changements subtils"
        },
        "decisions": {
          "title": "Lorsque vous prenez des décisions importantes, vous avez tendance à...",
          "overthink": "Réfléchissez trop et restez coincé dans la paralysie de l’analyse",
          "intuitive": "Suis mon instinct",
          "external": "Rechercher beaucoup de conseils auprès des autres",
          "systematic": "Pesez systématiquement le pour et le contre"
        },
        "gender": {
          "title": "Comment s’identifier ?",
          "subtitle": "Nous l'utilisons uniquement pour personnaliser les informations.",
          "woman": "Femme",
          "man": "Homme",
          "nonBinary": "Non binaire",
          "preferNot": "Je préfère ne pas dire"
        },
        "apaStudy": "📘 L'écriture expressive stimule le traitement émotionnel — APA Psychology Review",
        "insightsWith": "OBTENEZ DES APERÇUS AVEC"
      },
      "quizIntro": {
        "title": "Aidez-nous à comprendre vos habitudes",
        "description": "Questions facultatives pour personnaliser votre expérience",
        "questions": "des questions",
        "minutes": "minutes",
        "private": "privé",
        "accurateInsights": "Des informations plus précises",
        "recommendations": "Recommandations personnalisées",
        "patternTracking": "Meilleur suivi des modèles"
      },
      "analyzing": {
        "emotionalPatterns": "Analyser les schémas émotionnels",
        "responses": "Traitement de vos réponses",
        "stressMarkers": "Identifier les marqueurs de stress",
        "personalPlan": "Construire votre projet personnel",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "Votre modèle principal",
        "perfectionism": "Perfectionnisme",
        "anxiety": "Anxiété",
        "selfCompassion": "Manque d'auto-compassion",
        "boundaries": "Manque de frontières",
        "selfEsteem": "Faible estime de soi",
        "descriptions": {
          "perfectionism": "Le perfectionnisme peut vous maintenir tendu et coincé. Cela vous pousse à rechercher la certitude au lieu de vous sentir fini.",
          "anxiety": "L’anxiété vient souvent d’un esprit qui recherche trop souvent le danger. Cela peut vous laisser tendu même lorsque vous êtes en sécurité.",
          "selfCompassion": "Une faible compassion envers soi-même signifie être plus dur avec vous-même que vous ne le seriez avec quelqu'un que vous aimez. Cela rend la croissance plus lourde que nécessaire.",
          "boundaries": "Les limites faibles peuvent provenir de la peur d’un conflit ou de la déception des gens. Au fil du temps, cela vous épuise et vous éloigne de vos propres besoins.",
          "selfEsteem": "Une faible estime de soi peut amener votre esprit à se concentrer sur ce qui vous semble manquer. Cela maintient en place une image de soi déformée."
        },
        "evolution": "Nous suivrons son évolution et vous aiderons à y parvenir."
      },
      "summary": {
        "title": "Vous êtes prêt !",
        "mood": "Nous vous aiderons à améliorer votre humeur grâce à des réflexions et des idées guidées.",
        "stress": "Nous vous aiderons à réduire le stress grâce à des réflexions et des idées guidées.",
        "habits": "Nous vous aiderons à développer des habitudes grâce à des réflexions et des idées guidées.",
        "clarity": "Nous vous aiderons à gagner en clarté grâce à des réflexions et des idées guidées.",
        "default": "Votre espace personnel de réflexion est prêt. Commençons votre voyage."
      },
      "showcase": {
        "label": "ESSAYEZ-LE",
        "title": "Écrivez librement.\nObtenez de la clarté.",
        "entry": "Votre entrée",
        "placeholder": "Commencez à écrire ce que vous ressentez...",
        "pickPrompt": "Ou choisissez une invite",
        "prompts": {
          "overwhelmed": "Je me sens dépassé par le travail ces derniers temps...",
          "outside": "Aujourd'hui, j'ai remarqué que j'étais plus heureux après être sorti",
          "procrastinating": "Je continue de remettre les choses à plus tard et je ne sais pas pourquoi",
          "grateful": "Il s'est passé quelque chose aujourd'hui qui m'a rendu vraiment reconnaissant"
        },
        "thinking": "Insight pense...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "On dirait que vous en transportez beaucoup en ce moment. Reconnaître ce sentiment est la première étape – Insight peut vous aider à suivre ces schémas et à trouver ce qui vous soulage. 💜",
          "positive": "C'est une belle observation. Remarquer ce qui vous remonte le moral est puissant – Insight vous aidera à développer ces modèles positifs au fil du temps. ✨",
          "procrastination": "La procrastination a souvent des racines plus profondes qu’on ne le pense. La tenue d'un journal peut révéler les émotions cachées derrière cela - Insight vous aidera à comprendre et à surmonter ces blocages. 🔑",
          "sadness": "Merci d'avoir partagé cela. Exprimer des sentiments difficiles est courageux et guérisseur. Insight est là pour vous écouter et vous aider à traverser ces moments. 💙",
          "default": "Merci pour le partage. Chaque entrée est une étape vers une compréhension de soi plus profonde. Insight vous aidera à découvrir des modèles, à suivre votre croissance et à gagner en clarté au fil du temps. 💜"
        }
      },
      "privacy": {
        "title": "Vos notes sont entièrement privées",
        "subtitle": "Nous utilisons un cryptage de bout en bout pour assurer la sécurité de vos entrées de journal. Vous seul pouvez les lire.",
        "encryption": "Cryptage AES-256",
        "passwordKey": "Votre mot de passe est la clé",
        "cannotRead": "Nous ne pouvons pas lire vos entrées"
      },
      "notifications": {
        "title": "Activer les notifications",
        "subtitle": "Tirez le meilleur parti de Insight en restant au courant de ce qui se passe.",
        "allow": "Autoriser les notifications",
        "skip": "Passer pour l'instant →",
        "permissionTitle": "N'oubliez pas de réfléchir avec les notifications",
        "permissionRequest": "Insight AI souhaite vous envoyer",
        "permissionType": "Notifications",
        "dontAllow": "Ne pas autoriser"
      },
      "rateUs": {
        "title": "Donnez-nous 5 étoiles",
        "subtitle": "Aidez-nous à diffuser le message de vie consciente et de croissance personnelle",
        "testimonials": {
          "first": "Insight a complètement changé la façon dont je comprends mes émotions. Les informations de l’IA sont incroyablement précises et utiles.",
          "second": "Cette application m'a aidé à identifier des modèles que je n'avais jamais remarqués auparavant. C'est comme avoir un thérapeute dans ma poche.",
          "third": "Les réflexions et idées quotidiennes sont devenues une partie essentielle de ma routine de soins personnels."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "Mieux vous comprendre\navec Insight",
          "growth": "Suivez votre évolution\net vos progrès",
          "reflect": "Réfléchissez davantage,\nvivez mieux",
          "mira": "Parlez à Mira",
          "findWhatWorks": "Trouvez ce qui fonctionne"
        },
        "trial": "Essai de 3 jours",
        "weekly": "Hebdomadaire",
        "monthly": "Mensuel",
        "yearly": "Annuel",
        "save": "Économisez 73 %",
        "perDay": "{{price}} / jour",
        "perWeek": "{{price}} par semaine",
        "perMonth": "{{price}} par mois",
        "perYear": "{{price}} par an",
        "whatYouGet": "Ce que vous obtenez :",
        "benefits": {
          "unlimited": "Analyses de journal illimitées grâce à l’IA",
          "patterns": "Détection de modèles profonds et de déclencheurs",
          "summaries": "Résumés hebdomadaires personnalisés",
          "playbook": "Manuel de croissance et plans d'action"
        },
        "testimonials": {
          "first": "Insight a complètement changé la façon dont je comprends mes émotions. Les informations de l’IA sont incroyablement précises et utiles.",
          "second": "Les invites de journalisation sont réfléchies et le suivi des modèles m'aide à suivre ma croissance au fil du temps.",
          "third": "Meilleure application de santé mentale que j'ai utilisée. L'IA, c'est comme parler à un thérapeute qui me comprend vraiment.",
          "fourth": "J'aime la façon dont cela relie mes habitudes quotidiennes à mes humeurs. Des informations révélatrices chaque semaine.",
          "fifth": "La fonctionnalité de playbook avec des stratégies personnalisées a changé la donne pour mon anxiété."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "Aucun engagement, annulez à tout moment.",
        "startJourney": "Commencez mon voyage aujourd'hui",
        "restorePurchase": "Restaurer l'achat",
        "terms": "Conditions générales",
        "privacyPolicy": "politique de confidentialité",
        "alerts": {
          "otherAccountTitle": "Abonnement trouvé sur un autre compte",
          "otherAccountBody": "Cet abonnement appartient à un autre compte sur cet appareil. Veuillez vous connecter à ce compte pour utiliser les fonctionnalités Pro.",
          "otherAccountPurchaseBody": "Un abonnement Pro est actif sur un autre compte sur cet appareil. Veuillez vous connecter à ce compte pour utiliser les fonctionnalités Pro ou acheter un nouvel abonnement pour ce compte.",
          "purchaseSuccessTitle": "Achat réussi ! 🎉",
          "purchaseSuccessBody": "Vous avez désormais accès à des informations illimitées sur l'IA et à toutes les fonctionnalités Pro.",
          "inactiveTitle": "Abonnement non actif",
          "inactiveBody": "Votre achat n'a pas pu être confirmé. Veuillez contacter le support si cela persiste.",
          "comingSoonTitle": "Abonnements à venir",
          "comingSoonBody": "Des abonnements mobiles sont en cours de mise en place. Vous pouvez continuer à utiliser l'application et vous abonner plus tard sur le Web à myinsightai.app",
          "continueToApp": "Continuer vers l'application",
          "alreadySubscribedTitle": "Déjà abonné",
          "alreadySubscribedBody": "Vous disposez déjà d'un abonnement Pro actif. Profitez de vos fonctionnalités premium !",
          "existsTitle": "L'abonnement existe déjà",
          "existsBody": "Un abonnement a déjà été acheté sur cet appareil avec un autre compte. Pour utiliser les fonctionnalités Pro, veuillez vous connecter au compte qui a initialement acheté l'abonnement.\n\nSi vous pensez qu'il s'agit d'une erreur, essayez de restaurer vos achats ou contactez l'assistance.",
          "tryRestore": "Essayez de restaurer",
          "purchaseFailed": "Échec de l'achat",
          "purchaseError": "Erreur : {{message}}\n\nCode : {{code}}\n\nVeuillez vérifier :\n1. Le compte Sandbox est connecté (Paramètres > App Store)\n2. Les produits sont configurés dans App Store Connect\n3. Réessayez dans quelques instants",
          "noPurchasesTitle": "Aucun achat trouvé",
          "noPurchasesBody": "Aucun abonnement actif n'a été trouvé pour ce Apple ID.",
          "restoreFailed": "La restauration a échoué",
          "restoreError": "Impossible de restaurer les achats : {{message}}",
          "unknown": "inconnu",
          "ok": "D'ACCORD"
        }
      },
      "postPurchase": {
        "title": "Bienvenue à Insight",
        "subtitle": "Vous êtes prêt avec Pro",
        "analysis": "Analyse du journal optimisée par l’IA",
        "privateEntries": "Entrées privées et cryptées",
        "growth": "Suivez votre croissance au fil du temps",
        "accountInfo": "Créez un compte pour enregistrer vos entrées et y accéder sur tous les appareils."
      },
      "analysisComplete": {
        "namedTitle": "{{name}}, votre forfait personnel est prêt",
        "title": "Vous êtes prêt",
        "reassurance": "Votre espace est prêt."
      },
      "aiConsent": {
        "title": "Activer l'analyse IA ?",
        "subtitle": "Obtenez des informations personnalisées sur vos entrées de journal grâce à la technologie d'IA",
        "dataTitle": "Quelles données sont envoyées",
        "dataBody": "Lorsque vous appuyez sur « Analyser » sur une entrée de journal, nous envoyons le contenu du texte à notre service d'IA pour analyse.",
        "entryText": "Le texte de votre entrée de journal",
        "noIdentifiers": "Aucun identifiant personnel (nom, email, etc.)",
        "analyzeOnly": "Uniquement lorsque vous appuyez sur le bouton \"Analyser\"",
        "recipientTitle": "Qui reçoit vos données",
        "recipientIntro": "Nous utilisons ",
        "providerName": "Groq",
        "recipientCompany": " (une entreprise d’infrastructure d’IA) qui exécute le modèle de langage ",
        "modelName": "Llama 3",
        "recipientModelTail": " pour analyser vos entrées de journal.",
        "recipientPrivacy": "Groq traite vos données conformément à sa politique de confidentialité et n'utilise pas vos données pour former des modèles d'IA.",
        "protectionTitle": "Comment vos données sont protégées",
        "encrypted": "Toutes les données sont cryptées en transit (HTTPS/TLS)",
        "secureStorage": "Vos entrées sont stockées en toute sécurité dans votre base de données privée",
        "revoke": "Vous pouvez révoquer le consentement à tout moment dans les paramètres",
        "optional": "Les fonctionnalités d'IA sont facultatives : vous pouvez journaliser sans elles",
        "notice": "En acceptant, vous consentez à envoyer le texte de votre entrée de journal à Groq pour analyse IA lorsque vous appuyez sur « Analyser ». Consultez notre politique de confidentialité pour plus de détails.",
        "decline": "Refuser",
        "accept": "Accepter et continuer"
      }
    }
  },
  "de": {
    "onboarding": {
      "welcome": "Willkommen bei Insight",
      "getStarted": "Legen Sie los",
      "alreadyHaveAccount": "Sie haben bereits ein Konto?",
      "signIn": "Anmelden",
      "reflectGrow": "Nachdenken. Wachsen.",
      "valuableInsights": "Erhalten Sie wertvolle Erkenntnisse",
      "reflectionToSteps": "Verwandeln Sie die Reflexion in die nächsten Schritte.",
      "weekAtGlance": "Überprüfen Sie Ihre Woche auf einen Blick",
      "skip": "Überspringen",
      "skipForNow": "Überspringen Sie es vorerst",
      "valueProp": {
        "title": "Insight verwandelt Gedanken in Klarheit",
        "mentalNoise": "Geistiger Lärm",
        "understanding": "Verständnis",
        "captureFeelings": "Erfassen Sie, wie Sie sich fühlen",
        "understandPatterns": "Verstehen Sie Muster im Laufe der Zeit",
        "gainClarity": "Gewinnen Sie Klarheit – nicht Unordnung"
      },
      "patterns": {
        "eyebrow": "Angetrieben durch KI",
        "title": "Verfolgen Sie Ihre Muster\nim Laufe der Zeit",
        "subtitle": "Insight identifiziert, was Sie zurückhält, und zeigt Ihre wichtigsten Prioritäten auf, an denen Sie arbeiten müssen.",
        "adjustSleep": "Passen Sie den Schlafplan an",
        "selfCompassion": "Übe mehr Selbstmitgefühl",
        "reduceScreenTime": "Reduzieren Sie die Bildschirmzeit vor dem Schlafengehen",
        "manageStress": "Bewältigen Sie Stress proaktiv",
        "setBoundaries": "Setzen Sie klarere Grenzen",
        "challengeSelfTalk": "Fordern Sie negative Selbstgespräche heraus",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "Feiern Sie Wachstum",
        "title": "Feiern Sie auch\nIhre Erfolge",
        "subtitle": "Insight erkennt auch, was gut läuft, sodass Sie Ihre Stärken ausbauen können.",
        "gym": "Regelmäßig ins Fitnessstudio gehen",
        "reading": "Ich lese diese Woche jeden Tag",
        "openingUp": "Sich den Menschen mehr öffnen",
        "calm": "Unter Druck ruhig bleiben",
        "morningRoutine": "Aufrechterhaltung einer Morgenroutine",
        "perseverance": "Schwierige Momente meistern"
      },
      "research": {
        "title": "Psychologisch\nfundiert",
        "body": "Untersuchungen zeigen, dass reflektierendes Journaling das emotionale Bewusstsein und das langfristige Wohlbefinden verbessert.",
        "citation": "Advances in Psychiatric Treatment, 2005",
        "learnMore": "Erfahren Sie mehr"
      },
      "auth": {
        "createAccount": "Ein Konto erstellen",
        "createYourAccount": "Erstellen Sie Ihr Konto",
        "subtitle": "Wählen Sie eine Option aus, um zu beginnen",
        "postPurchaseSubtitle": "Speichern Sie Ihre Eingaben und greifen Sie geräteübergreifend darauf zu",
        "apple": "Fahren Sie mit Apple fort",
        "google": "Fahren Sie mit Google fort",
        "email": "Weiter mit E-Mail",
        "signInPrompt": "Sie haben bereits ein Konto?",
        "appleFailed": "Apple Anmeldung fehlgeschlagen",
        "googleFailed": "Google Anmeldung fehlgeschlagen",
        "genericError": "Es ist ein Fehler aufgetreten"
      },
      "vibe": {
        "title": "Wählen Sie Ihre Stimmung",
        "dark": "Dunkel",
        "light": "Hell",
        "sunset": "Sonnenuntergang",
        "vibrant": "Lebendig",
        "ocean": "Ozean",
        "midnight": "Mitternacht"
      },
      "questions": {
        "name": {
          "title": "Wie heißt du?",
          "subtitle": "Wir nutzen dies, um Ihr Erlebnis zu personalisieren.",
          "placeholder": "Geben Sie Ihren Namen ein"
        },
        "referral": {
          "title": "Wo haben Sie von uns erfahren?",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "Freund",
          "other": "Andere"
        },
        "goal": {
          "title": "Was ist derzeit Ihr Hauptziel?",
          "mood": "Stimmung verbessern",
          "stress": "Stress reduzieren",
          "habits": "Bauen Sie Gewohnheiten auf",
          "clarity": "Gewinnen Sie Klarheit"
        },
        "research": {
          "title": "Auf der Grundlage der Psychologie",
          "subtitle": "Untersuchungen zeigen, dass reflektierendes Journaling das emotionale Bewusstsein und das langfristige Wohlbefinden verbessert.",
          "badge": "Cambridge University",
          "screenTitle": "Insight basiert auf Psychologie",
          "body": "Journaling ist mit einem besseren emotionalen Bewusstsein und geistigem Wohlbefinden verbunden."
        },
        "frequency": {
          "title": "Wie oft möchten Sie reflektieren?",
          "daily": "Täglich",
          "weekly": "Wöchentlich",
          "asNeeded": "Nach Bedarf"
        },
        "experience": {
          "title": "Wie lange führen Sie schon Tagebuch?",
          "new": "Ich bin neu im Journaling",
          "underSixMonths": "< 6 Monate",
          "sixToTwentyFourMonths": "6–24 Monate",
          "twoPlusYears": "2+ Jahre"
        },
        "wellbeing": {
          "title": "Wie würden Sie Ihr tägliches Wohlbefinden einschätzen?",
          "subtitle": "Wo fühlen Sie sich auf einer Skala von 1 bis 10 normalerweise?",
          "typicalDay": "TYPISCHER TAG"
        },
        "stressResponse": {
          "title": "Was tun Sie, wenn Sie unter Druck stehen?",
          "ruminate": "Wiederkäuer oder Spirale",
          "selfBlame": "Gib mir selbst die Schuld",
          "fixate": "Konzentrieren Sie sich darauf, es perfekt zu machen",
          "stepBack": "Innehalten und neu gruppieren"
        },
        "selfTalk": {
          "title": "Wie würden Sie Ihre innere Stimme beschreiben?",
          "critical": "Oft hart oder verurteilend",
          "mixed": "Kommt auf den Tag an",
          "supportive": "Meistens unterstützend"
        },
        "coping": {
          "title": "Was hilft Ihnen am meisten, wenn sich die Emotionen überwältigend anfühlen?",
          "social": "Es durchsprechen",
          "physical": "Ich bewege meinen Körper",
          "expressive": "Journaling oder kreative Arbeit",
          "solitude": "Zeit allein zum Aufladen"
        },
        "change": {
          "title": "Wie reagieren Sie normalerweise auf große Veränderungen?",
          "resistant": "Zuerst widerstehen, dann anpassen",
          "anxious": "Fühlen Sie sich ängstlich, aber setzen Sie sich durch",
          "embrace": "Nehmen Sie die Herausforderung an",
          "support": "Brauche viel Unterstützung"
        },
        "motivation": {
          "title": "Was treibt Sie an, weiterzumachen, wenn es schwierig wird?",
          "fear": "Angst zu versagen oder andere im Stich zu lassen",
          "external": "Externe Belohnungen oder Anerkennung",
          "values": "Interne Werte und Zweck",
          "passion": "Liebe für das, was ich tue"
        },
        "relationships": {
          "title": "Welches Muster zeigt sich bei engen Beziehungen für Sie?",
          "anxious": "Ich brauche viel Bestätigung",
          "avoidant": "Ich ziehe mich zurück, wenn es intensiv wird",
          "fearful": "Ich wechsle zwischen Wegstoßen und Festhalten",
          "secure": "Ich fühle mich sicher und wohl"
        },
        "conflict": {
          "title": "Wenn es Spannungen oder Konflikte gibt,...",
          "avoid": "Vermeiden Sie es um jeden Preis",
          "accommodate": "Versuchen Sie es zu glätten oder bitte",
          "compete": "Drängen, um zu gewinnen oder meinen Standpunkt zu beweisen",
          "collaborate": "Sprechen Sie es ruhig und direkt an"
        },
        "rest": {
          "title": "Wie sieht Ruhe für Sie aus?",
          "guilt": "Es fällt mir schwer, zur Ruhe zu kommen – ich fühle mich schuldig",
          "solitude": "Ich brauche völlige Einsamkeit",
          "social": "Ich tanke neue Energie durch soziale Kontakte",
          "active": "Ich ruhe mich aus, indem ich beruhigende Aktivitäten mache"
        },
        "identitySource": {
          "title": "Woher beziehen Sie Ihr Identitätsgefühl am meisten?",
          "achievement": "Meine Leistungen und Erfolge",
          "relationships": "Meine Beziehungen und Verbindungen",
          "values": "Meine Werte und Überzeugungen",
          "expression": "Meine Kreativität oder Selbstdarstellung"
        },
        "failure": {
          "title": "Was ist Ihre erste Reaktion, wenn Sie scheitern oder einen Fehler machen?",
          "shame": "Ich habe das Gefühl, dass ich nicht gut genug bin",
          "defensive": "Ich werde defensiv oder beschuldige externe Faktoren",
          "analytical": "Ich analysiere, was schief gelaufen ist",
          "growth": "Ich sehe es als eine Chance zum Lernen"
        },
        "awareness": {
          "title": "Wie bewusst sind Sie sich Ihrer Emotionen im Moment?",
          "low": "Oft merke ich es erst später",
          "moderate": "Ich fühle sie, kann sie aber nicht immer benennen",
          "high": "Ich kann die meisten Emotionen erkennen, wenn sie auftreten",
          "veryHigh": "Ich bin sehr auf subtile Veränderungen eingestellt"
        },
        "decisions": {
          "title": "Wenn Sie wichtige Entscheidungen treffen, neigen Sie dazu...",
          "overthink": "Wenn Sie zu viel nachdenken, bleiben Sie in der Analyse-Lähmung stecken",
          "intuitive": "Vertraue meinem Bauchgefühl",
          "external": "Holen Sie sich viele Ratschläge von anderen",
          "systematic": "Wägen Sie Vor- und Nachteile systematisch ab"
        },
        "gender": {
          "title": "Wie identifizieren Sie sich?",
          "subtitle": "Wir verwenden dies ausschließlich zur Personalisierung von Erkenntnissen.",
          "woman": "Frau",
          "man": "Mann",
          "nonBinary": "Nicht-binär",
          "preferNot": "Sag es lieber nicht"
        },
        "apaStudy": "📘 Ausdrucksstarkes Schreiben steigert die emotionale Verarbeitung – APA Psychology Review",
        "insightsWith": "ERHALTEN SIE EINBLICKE MIT"
      },
      "quizIntro": {
        "title": "Helfen Sie uns, Ihre Gewohnheiten zu verstehen",
        "description": "Optionale Fragen zur Personalisierung Ihrer Erfahrung",
        "questions": "Fragen",
        "minutes": "Minuten",
        "private": "Privat",
        "accurateInsights": "Genauere Erkenntnisse",
        "recommendations": "Personalisierte Empfehlungen",
        "patternTracking": "Bessere Musterverfolgung"
      },
      "analyzing": {
        "emotionalPatterns": "Emotionale Muster analysieren",
        "responses": "Bearbeitung Ihrer Antworten",
        "stressMarkers": "Stressmarker identifizieren",
        "personalPlan": "Erstellen Sie Ihren persönlichen Plan",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "Ihr primäres Muster",
        "perfectionism": "Perfektionismus",
        "anxiety": "Angst",
        "selfCompassion": "Mangel an Selbstmitgefühl",
        "boundaries": "Mangel an Grenzen",
        "selfEsteem": "Geringes Selbstwertgefühl",
        "descriptions": {
          "perfectionism": "Perfektionismus kann Sie angespannt und festgefahren halten. Es treibt Sie dazu, der Gewissheit nachzujagen, anstatt sich fertig zu fühlen.",
          "anxiety": "Angst kommt oft von einem Geist, der zu oft nach Gefahren Ausschau hält. Es kann Sie angespannt machen, selbst wenn Sie in Sicherheit sind.",
          "selfCompassion": "Geringes Selbstmitgefühl bedeutet, härter zu sich selbst zu sein, als zu jemandem, den man liebt. Dadurch fühlt sich das Wachstum schwerer an, als es sein müsste.",
          "boundaries": "Schwache Grenzen können aus Angst vor Konflikten oder der Enttäuschung von Menschen entstehen. Das führt mit der Zeit dazu, dass Sie erschöpft sind und von Ihren eigenen Bedürfnissen abgelenkt werden.",
          "selfEsteem": "Ein geringes Selbstwertgefühl kann dazu führen, dass Sie sich auf das konzentrieren, was Ihnen fehlt. Das hält ein verzerrtes Selbstbild aufrecht."
        },
        "evolution": "Wir werden verfolgen, wie sich dies entwickelt, und Ihnen bei der Bewältigung helfen."
      },
      "summary": {
        "title": "Sie sind bereit!",
        "mood": "Wir helfen Ihnen, Ihre Stimmung mit angeleiteten Reflexionen und Erkenntnissen zu verbessern.",
        "stress": "Mit angeleiteten Reflexionen und Erkenntnissen helfen wir Ihnen, Stress abzubauen.",
        "habits": "Wir helfen Ihnen, Gewohnheiten mit angeleiteten Überlegungen und Erkenntnissen aufzubauen.",
        "clarity": "Mit angeleiteten Reflexionen und Einsichten helfen wir Ihnen, Klarheit zu gewinnen.",
        "default": "Ihr persönlicher Raum zum Nachdenken ist fertig. Lass uns deine Reise beginnen."
      },
      "showcase": {
        "label": "PROBIEREN SIE ES AUS",
        "title": "Schreiben Sie frei.\nVerschaffen Sie sich Klarheit.",
        "entry": "Ihr Eintrag",
        "placeholder": "Fangen Sie an zu schreiben, wie Sie sich fühlen...",
        "pickPrompt": "Oder wählen Sie eine Eingabeaufforderung",
        "prompts": {
          "overwhelmed": "Ich fühle mich in letzter Zeit mit der Arbeit überfordert...",
          "outside": "Heute habe ich gemerkt, dass ich glücklicher war, nachdem ich nach draußen gegangen war",
          "procrastinating": "Ich schiebe Dinge ständig auf und weiß nicht, warum",
          "grateful": "Heute ist etwas passiert, das mich wirklich dankbar gemacht hat"
        },
        "thinking": "Insight denkt...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "Es hört sich so an, als ob du im Moment viel mit dir herumträgst. Das Erkennen dieses Gefühls ist der erste Schritt – Insight kann Ihnen dabei helfen, diese Muster aufzuspüren und herauszufinden, was Ihnen Erleichterung bringt. 💜",
          "positive": "Das ist eine schöne Beobachtung. Zu bemerken, was Ihre Stimmung hebt, ist kraftvoll – Insight wird Ihnen dabei helfen, mit der Zeit auf diesen positiven Mustern aufzubauen. ✨",
          "procrastination": "Aufschub hat oft tiefere Wurzeln als wir denken. Journaling kann die verborgenen Emotionen dahinter offenbaren – Insight hilft Ihnen, diese Blockaden zu verstehen und zu überwinden. 🔑",
          "sadness": "Vielen Dank, dass Sie das geteilt haben. Schwierige Gefühle auszudrücken ist mutig und heilsam. Insight ist hier, um Ihnen zuzuhören und Ihnen zu helfen, durch diese Momente zu navigieren. 💙",
          "default": "Vielen Dank fürs Teilen. Jeder Eintrag ist ein Schritt zu einem tieferen Selbstverständnis. Insight hilft Ihnen dabei, Muster aufzudecken, Ihr Wachstum zu verfolgen und mit der Zeit Klarheit zu gewinnen. 💜"
        }
      },
      "privacy": {
        "title": "Ihre Notizen sind vollständig privat",
        "subtitle": "Um Ihre Journaleinträge zu schützen, verwenden wir eine Ende-zu-Ende-Verschlüsselung. Nur Sie können sie lesen.",
        "encryption": "AES-256-Verschlüsselung",
        "passwordKey": "Ihr Passwort ist der Schlüssel",
        "cannotRead": "Wir können Ihre Einträge nicht lesen"
      },
      "notifications": {
        "title": "Aktivieren Sie Benachrichtigungen",
        "subtitle": "Holen Sie das Beste aus Insight heraus, indem Sie über das Geschehen auf dem Laufenden bleiben.",
        "allow": "Benachrichtigungen zulassen",
        "skip": "Vorerst überspringen →",
        "permissionTitle": "Denken Sie daran, bei Benachrichtigungen nachzudenken",
        "permissionRequest": "Insight AI möchte Ihnen senden",
        "permissionType": "Benachrichtigungen",
        "dontAllow": "Nicht zulassen"
      },
      "rateUs": {
        "title": "Bewerten Sie uns mit 5 Sternen",
        "subtitle": "Helfen Sie uns, die Botschaft eines achtsamen Lebens und persönlichen Wachstums zu verbreiten",
        "testimonials": {
          "first": "Insight hat die Art und Weise, wie ich meine Gefühle verstehe, völlig verändert. Die KI-Erkenntnisse sind unglaublich genau und hilfreich.",
          "second": "Diese App hat mir geholfen, Muster zu erkennen, die mir vorher nie aufgefallen waren. Es ist, als hätte ich einen Therapeuten in der Tasche.",
          "third": "Die täglichen Reflexionen und Erkenntnisse sind zu einem wesentlichen Bestandteil meiner Selbstfürsorgeroutine geworden."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "Verstehen Sie sich\nmit Insight besser",
          "growth": "Verfolgen Sie Wachstum\nund Fortschritte",
          "reflect": "Reflektieren Sie tiefer,\nleben Sie besser",
          "mira": "Sprich mit Mira",
          "findWhatWorks": "Finde, was funktioniert"
        },
        "trial": "3-Tage-Testversion",
        "weekly": "Wöchentlich",
        "monthly": "Monatlich",
        "yearly": "Jährlich",
        "save": "Sparen Sie 73 %",
        "perDay": "{{price}} / Tag",
        "perWeek": "{{price}} pro Woche",
        "perMonth": "{{price}} pro Monat",
        "perYear": "{{price}} pro Jahr",
        "whatYouGet": "Was Sie bekommen:",
        "benefits": {
          "unlimited": "Unbegrenzte KI-gestützte Journaleinblicke",
          "patterns": "Tiefgreifende Muster- und Triggererkennung",
          "summaries": "Personalisierte wöchentliche Zusammenfassungen",
          "playbook": "Wachstums-Playbook und Aktionspläne"
        },
        "testimonials": {
          "first": "Insight hat die Art und Weise, wie ich meine Gefühle verstehe, völlig verändert. Die KI-Erkenntnisse sind unglaublich genau und hilfreich.",
          "second": "Die Aufforderungen zum Journaling sind durchdacht und die Musterverfolgung hilft mir, mein Wachstum im Laufe der Zeit zu erkennen.",
          "third": "Beste App für psychische Gesundheit, die ich je verwendet habe. Die KI hat das Gefühl, mit einem Therapeuten zu sprechen, der mich wirklich versteht.",
          "fourth": "Ich liebe es, wie es meine täglichen Gewohnheiten mit meinen Stimmungsmustern verbindet. Jede Woche aufschlussreiche Einblicke.",
          "fifth": "Die Playbook-Funktion mit personalisierten Strategien hat meine Ängste grundlegend verändert."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "Keine Verpflichtung, jederzeit kündbar.",
        "startJourney": "Beginnen Sie noch heute meine Reise",
        "restorePurchase": "Kauf wiederherstellen",
        "terms": "Allgemeine Geschäftsbedingungen",
        "privacyPolicy": "Datenschutzrichtlinie",
        "alerts": {
          "otherAccountTitle": "Abonnement auf einem anderen Konto gefunden",
          "otherAccountBody": "Dieses Abonnement gehört zu einem anderen Konto auf diesem Gerät. Bitte melden Sie sich bei diesem Konto an, um Pro-Funktionen zu nutzen.",
          "otherAccountPurchaseBody": "Auf diesem Gerät ist ein Pro-Abonnement für ein anderes Konto aktiv. Bitte melden Sie sich bei diesem Konto an, um Pro-Funktionen zu nutzen, oder erwerben Sie ein neues Abonnement für dieses Konto.",
          "purchaseSuccessTitle": "Kauf erfolgreich! 🎉",
          "purchaseSuccessBody": "Sie haben jetzt Zugriff auf unbegrenzte KI-Einblicke und alle Pro-Funktionen.",
          "inactiveTitle": "Abonnement nicht aktiv",
          "inactiveBody": "Ihr Kauf konnte nicht bestätigt werden. Bitte wenden Sie sich an den Support, wenn das Problem weiterhin besteht.",
          "comingSoonTitle": "Abonnements folgen in Kürze",
          "comingSoonBody": "Mobile Abos werden eingerichtet. Sie können die App weiterhin nutzen und später im Internet unter myinsightai.app abonnieren",
          "continueToApp": "Weiter zur App",
          "alreadySubscribedTitle": "Bereits abonniert",
          "alreadySubscribedBody": "Sie haben bereits ein aktives Pro-Abonnement. Genießen Sie Ihre Premium-Funktionen!",
          "existsTitle": "Das Abonnement existiert bereits",
          "existsBody": "Auf diesem Gerät wurde zuvor ein Abonnement mit einem anderen Konto erworben. Um die Pro-Funktionen zu nutzen, melden Sie sich bitte bei dem Konto an, mit dem Sie das Abonnement ursprünglich erworben haben.\n\nWenn Sie glauben, dass es sich hierbei um einen Fehler handelt, versuchen Sie, Ihre Einkäufe wiederherzustellen, oder wenden Sie sich an den Support.",
          "tryRestore": "Versuchen Sie es mit Wiederherstellen",
          "purchaseFailed": "Der Kauf ist fehlgeschlagen",
          "purchaseError": "Fehler: {{message}}\n\nCode: {{code}}\n\nBitte überprüfen Sie:\n1. Sandbox-Konto ist angemeldet (Einstellungen > App Store)\n2. Produkte werden in App Store Connect konfiguriert\n3. Versuchen Sie es in ein paar Augenblicken noch einmal",
          "noPurchasesTitle": "Keine Käufe gefunden",
          "noPurchasesBody": "Für diesen Apple ID wurden keine aktiven Abonnements gefunden.",
          "restoreFailed": "Wiederherstellung fehlgeschlagen",
          "restoreError": "Käufe konnten nicht wiederhergestellt werden: {{message}}",
          "unknown": "unbekannt",
          "ok": "OK"
        }
      },
      "postPurchase": {
        "title": "Willkommen bei Insight",
        "subtitle": "Mit Pro sind Sie startklar",
        "analysis": "KI-gestützte Journalanalyse",
        "privateEntries": "Private und verschlüsselte Einträge",
        "growth": "Verfolgen Sie Ihr Wachstum im Laufe der Zeit",
        "accountInfo": "Erstellen Sie ein Konto, um Ihre Eingaben zu speichern und geräteübergreifend darauf zuzugreifen."
      },
      "analysisComplete": {
        "namedTitle": "{{name}}, Ihr persönlicher Plan ist fertig",
        "title": "Sie sind bereit",
        "reassurance": "Ihr Raum ist fertig."
      },
      "aiConsent": {
        "title": "KI-Analyse aktivieren?",
        "subtitle": "Erhalten Sie mithilfe der KI-Technologie personalisierte Erkenntnisse aus Ihren Tagebucheinträgen",
        "dataTitle": "Welche Daten werden gesendet",
        "dataBody": "Wenn Sie bei einem Tagebucheintrag auf „Analysieren“ tippen, senden wir den Textinhalt zur Analyse an unseren KI-Dienst.",
        "entryText": "Ihr Tagebucheintragstext",
        "noIdentifiers": "Keine persönlichen Identifikatoren (Name, E-Mail usw.)",
        "analyzeOnly": "Nur wenn Sie auf die Schaltfläche „Analysieren“ tippen",
        "recipientTitle": "Wer erhält Ihre Daten?",
        "recipientIntro": "Wir verwenden ",
        "providerName": "Groq",
        "recipientCompany": " (ein KI-Infrastrukturunternehmen), das das Sprachmodell ",
        "modelName": "Llama 3",
        "recipientModelTail": " zur Analyse Ihrer Tagebucheinträge ausführt.",
        "recipientPrivacy": "Groq verarbeitet Ihre Daten gemäß seiner Datenschutzrichtlinie und verwendet Ihre Daten nicht zum Trainieren von KI-Modellen.",
        "protectionTitle": "Wie Ihre Daten geschützt sind",
        "encrypted": "Alle Daten werden während der Übertragung verschlüsselt (HTTPS/TLS)",
        "secureStorage": "Ihre Eingaben werden sicher in Ihrer privaten Datenbank gespeichert",
        "revoke": "Sie können Ihre Einwilligung jederzeit in den Einstellungen widerrufen",
        "optional": "KI-Funktionen sind optional – Sie können ohne sie ein Tagebuch führen",
        "notice": "Durch das Akzeptieren erklären Sie sich damit einverstanden, dass Ihr Journaleintragstext zur KI-Analyse an Groq gesendet wird, wenn Sie auf „Analysieren“ tippen. Ausführliche Informationen finden Sie in unserer Datenschutzrichtlinie.",
        "decline": "Ablehnen",
        "accept": "Akzeptieren und fortfahren"
      }
    }
  },
  "ru": {
    "onboarding": {
      "welcome": "Добро пожаловать в Insight",
      "getStarted": "Начать",
      "alreadyHaveAccount": "У вас уже есть аккаунт?",
      "signIn": "Войти",
      "reflectGrow": "Размышляйте. Развивайтесь.",
      "valuableInsights": "Получите ценную информацию",
      "reflectionToSteps": "Превратите размышления в следующие шаги.",
      "weekAtGlance": "Проверьте свою неделю с первого взгляда",
      "skip": "Пропускать",
      "skipForNow": "Пропустить сейчас",
      "valueProp": {
        "title": "Insight превращает мысли в ясность",
        "mentalNoise": "Ментальный шум",
        "understanding": "Понимание",
        "captureFeelings": "Запечатлейте, как вы себя чувствуете",
        "understandPatterns": "Понимание закономерностей с течением времени",
        "gainClarity": "Получите ясность, а не беспорядок"
      },
      "patterns": {
        "eyebrow": "Работает на базе ИИ",
        "title": "Отслеживайте свои шаблоны\nсо временем",
        "subtitle": "Insight определяет, что вас сдерживает, и выявляет ваши главные приоритеты, над которыми нужно работать.",
        "adjustSleep": "Настройте график сна",
        "selfCompassion": "Больше практикуйте сострадание к себе",
        "reduceScreenTime": "Сократите время перед экраном перед сном",
        "manageStress": "Управляйте стрессом активно",
        "setBoundaries": "Установите более четкие границы",
        "challengeSelfTalk": "Бросьте вызов негативному внутреннему разговору",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "Празднуйте рост",
        "title": "Отмечайте и\nсвои успехи",
        "subtitle": "Insight также определяет, что происходит хорошо, чтобы вы могли развивать свои сильные стороны.",
        "gym": "Постоянное посещение спортзала",
        "reading": "Читаем каждый день на этой неделе",
        "openingUp": "Больше открываться людям",
        "calm": "Сохранять спокойствие под давлением",
        "morningRoutine": "Соблюдение утреннего распорядка",
        "perseverance": "Переживая трудные моменты"
      },
      "research": {
        "title": "Основано на\nпсихологии",
        "body": "Исследования показывают, что рефлексивное ведение дневника улучшает эмоциональное осознание и долгосрочное благополучие.",
        "citation": "Advances in Psychiatric Treatment, 2005 г.",
        "learnMore": "Узнать больше"
      },
      "auth": {
        "createAccount": "Завести аккаунт",
        "createYourAccount": "Создайте свою учетную запись",
        "subtitle": "Выберите вариант, чтобы начать",
        "postPurchaseSubtitle": "Сохраняйте свои записи и получайте к ним доступ на разных устройствах.",
        "apple": "Продолжить с Apple",
        "google": "Продолжить с Google",
        "email": "Продолжить по электронной почте",
        "signInPrompt": "У вас уже есть аккаунт?",
        "appleFailed": "Apple Не удалось войти в систему",
        "googleFailed": "Google Не удалось войти в систему",
        "genericError": "Произошла ошибка"
      },
      "vibe": {
        "title": "Выберите свою атмосферу",
        "dark": "Тёмная",
        "light": "Светлая",
        "sunset": "Закат",
        "vibrant": "Яркий",
        "ocean": "Океан",
        "midnight": "Полночь"
      },
      "questions": {
        "name": {
          "title": "Как вас зовут?",
          "subtitle": "Мы будем использовать это, чтобы персонализировать ваш опыт.",
          "placeholder": "Введите свое имя"
        },
        "referral": {
          "title": "Откуда вы узнали о нас?",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "Друг",
          "other": "Другой"
        },
        "goal": {
          "title": "Какова ваша главная цель сейчас?",
          "mood": "Улучшить настроение",
          "stress": "Уменьшите стресс",
          "habits": "Формируйте привычки",
          "clarity": "Получите ясность"
        },
        "research": {
          "title": "Основано на психологии",
          "subtitle": "Исследования показывают, что рефлексивное ведение дневника улучшает эмоциональное осознание и долгосрочное благополучие.",
          "badge": "Cambridge University",
          "screenTitle": "Insight основан на психологии.",
          "body": "Ведение дневника связано с улучшением эмоциональной осведомленности и психического благополучия."
        },
        "frequency": {
          "title": "Как часто вы хотите размышлять?",
          "daily": "Ежедневно",
          "weekly": "Еженедельно",
          "asNeeded": "По мере необходимости"
        },
        "experience": {
          "title": "Как долго вы ведете дневник?",
          "new": "Я новичок в ведении дневника",
          "underSixMonths": "< 6 месяцев",
          "sixToTwentyFourMonths": "6–24 месяца",
          "twoPlusYears": "2+ года"
        },
        "wellbeing": {
          "title": "Как бы вы оценили свое ежедневное самочувствие?",
          "subtitle": "По шкале от 1 до 10, что вы обычно чувствуете?",
          "typicalDay": "ТИПИЧНЫЙ ДЕНЬ"
        },
        "stressResponse": {
          "title": "Что вы обычно делаете, когда находитесь под давлением?",
          "ruminate": "Жвачное или спиральное",
          "selfBlame": "Виню себя",
          "fixate": "Сосредоточьтесь на том, чтобы сделать это идеально",
          "stepBack": "Пауза и перегруппировка"
        },
        "selfTalk": {
          "title": "Как бы вы описали свой внутренний голос?",
          "critical": "Часто резкий или осуждающий",
          "mixed": "Зависит от дня",
          "supportive": "В основном поддерживающий"
        },
        "coping": {
          "title": "Когда эмоции переполняют вас, что вам помогает больше всего?",
          "social": "Говоря это через",
          "physical": "Перемещение моего тела",
          "expressive": "Ведение дневника или творческая работа",
          "solitude": "Время в одиночестве, чтобы перезарядиться"
        },
        "change": {
          "title": "Как вы обычно реагируете на большие перемены?",
          "resistant": "Сначала сопротивляйтесь, затем адаптируйтесь",
          "anxious": "Чувствую тревогу, но пробиваюсь",
          "embrace": "Примите вызов",
          "support": "Нужна большая поддержка"
        },
        "motivation": {
          "title": "Что заставляет вас продолжать идти вперед, когда дела идут плохо?",
          "fear": "Страх неудачи или подвести других",
          "external": "Внешние награды или признание",
          "values": "Внутренние ценности и цель",
          "passion": "Любовь к тому, что я делаю"
        },
        "relationships": {
          "title": "Какая закономерность проявляется в близких отношениях?",
          "anxious": "мне нужно много уверенности",
          "avoidant": "Я отстраняюсь, когда ситуация становится напряженной",
          "fearful": "Я чередую то отталкивание, то цепляние",
          "secure": "Я чувствую себя в безопасности и комфортно"
        },
        "conflict": {
          "title": "Когда возникает напряжение или конфликт, вы обычно...",
          "avoid": "Избегайте этого любой ценой",
          "accommodate": "Попробуй сгладить это или пожалуйста.",
          "compete": "Нажмите, чтобы выиграть или доказать свою точку зрения",
          "collaborate": "Скажите об этом спокойно и прямо"
        },
        "rest": {
          "title": "Как для вас выглядит отдых?",
          "guilt": "Я изо всех сил пытаюсь отдохнуть — я чувствую себя виноватым",
          "solitude": "мне нужно полное одиночество",
          "social": "Я заряжаюсь через социальные связи",
          "active": "Я отдыхаю, занимаясь успокаивающими делами"
        },
        "identitySource": {
          "title": "Где вы больше всего черпаете свое чувство идентичности?",
          "achievement": "Мои достижения и успехи",
          "relationships": "Мои отношения и связи",
          "values": "Мои ценности и убеждения",
          "expression": "Мое творчество или самовыражение"
        },
        "failure": {
          "title": "Когда вы терпите неудачу или совершаете ошибку, какова ваша первая реакция?",
          "shame": "Я чувствую, что я недостаточно хорош",
          "defensive": "Я занимаю оборонительную позицию или виню внешние факторы",
          "analytical": "Я анализирую, что пошло не так",
          "growth": "Я рассматриваю это как возможность обучения"
        },
        "awareness": {
          "title": "Насколько вы осознаете свои эмоции в данный момент?",
          "low": "Я часто не замечаю это позже",
          "moderate": "Я чувствую их, но не всегда могу назвать их",
          "high": "Я могу распознать большинство эмоций по мере их возникновения",
          "veryHigh": "Я очень настроен на тонкие изменения"
        },
        "decisions": {
          "title": "Принимая важные решения, вы склонны...",
          "overthink": "Думайте слишком много и застревайте в аналитическом параличе",
          "intuitive": "Следуй моему инстинкту",
          "external": "Просите много советов от других",
          "systematic": "Систематически взвешивайте «за» и «против»"
        },
        "gender": {
          "title": "Как вы идентифицируете?",
          "subtitle": "Мы используем это только для персонализации информации.",
          "woman": "Женщина",
          "man": "Мужчина",
          "nonBinary": "Недвоичный",
          "preferNot": "Предпочитаю не говорить"
        },
        "apaStudy": "📘 Выразительное письмо усиливает эмоциональную обработку — APA Psychology Review",
        "insightsWith": "ПОЛУЧИТЕ ИНФОРМАЦИЮ С"
      },
      "quizIntro": {
        "title": "Помогите нам понять ваши привычки",
        "description": "Дополнительные вопросы, чтобы персонализировать ваш опыт",
        "questions": "вопросы",
        "minutes": "минуты",
        "private": "частный",
        "accurateInsights": "Более точная информация",
        "recommendations": "Персонализированные рекомендации",
        "patternTracking": "Лучшее отслеживание шаблонов"
      },
      "analyzing": {
        "emotionalPatterns": "Анализ эмоциональных моделей",
        "responses": "Обработка ваших ответов",
        "stressMarkers": "Определение маркеров стресса",
        "personalPlan": "Построение вашего личного плана",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "Ваш основной шаблон",
        "perfectionism": "Перфекционизм",
        "anxiety": "Беспокойство",
        "selfCompassion": "Отсутствие сострадания к себе",
        "boundaries": "Отсутствие границ",
        "selfEsteem": "Низкая самооценка",
        "descriptions": {
          "perfectionism": "Перфекционизм может держать вас в напряжении и застревании. Это подталкивает вас гоняться за уверенностью, вместо того, чтобы чувствовать себя законченным.",
          "anxiety": "Тревога часто возникает из-за того, что разум слишком часто ищет опасность. Это может вызвать у вас напряжение, даже если вы в безопасности.",
          "selfCompassion": "Низкое самосострадание означает, что вы относитесь к себе строже, чем к тому, кого любите. Из-за этого рост кажется более тяжелым, чем он должен быть.",
          "boundaries": "Слабые границы могут возникнуть из-за страха конфликта или разочарования людей. Со временем вы истощаетесь и отвлекаетесь от своих собственных потребностей.",
          "selfEsteem": "Низкая самооценка может привести к тому, что ваш разум зациклится на том, чего вам не хватает. Это сохраняет искаженное представление о себе."
        },
        "evolution": "Мы будем отслеживать, как это будет развиваться, и поможем вам справиться с этим."
      },
      "summary": {
        "title": "Все готово!",
        "mood": "Мы поможем вам улучшить настроение с помощью управляемых размышлений и идей.",
        "stress": "Мы поможем вам снизить стресс с помощью управляемых размышлений и идей.",
        "habits": "Мы поможем вам сформировать привычки с помощью управляемых размышлений и идей.",
        "clarity": "Мы поможем вам обрести ясность с помощью управляемых размышлений и идей.",
        "default": "Ваше личное пространство для размышлений готово. Давайте начнем ваше путешествие."
      },
      "showcase": {
        "label": "ПОПРОБУЙТЕ ЭТО",
        "title": "Пишите свободно.\nПолучите ясность.",
        "entry": "Ваша запись",
        "placeholder": "Начни писать, что ты чувствуешь...",
        "pickPrompt": "Или выберите подсказку",
        "prompts": {
          "overwhelmed": "В последнее время я чувствую себя уставшим от работы...",
          "outside": "Сегодня я заметил, что стал счастливее после выхода на улицу",
          "procrastinating": "Я продолжаю откладывать дела и не понимаю, почему",
          "grateful": "Сегодня произошло что-то, что заставило меня быть очень благодарным"
        },
        "thinking": "Insight думает...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "Похоже, ты сейчас несешь много. Признание этого чувства — первый шаг. Insight может помочь вам отследить эти закономерности и найти то, что приносит вам облегчение. 💜",
          "positive": "Это прекрасное наблюдение. Замечать то, что поднимает ваше настроение, очень важно — Insight поможет вам со временем развить эти положительные закономерности. ✨",
          "procrastination": "Прокрастинация часто имеет более глубокие корни, чем мы думаем. Ведение дневника может выявить скрытые за ним эмоции — Insight поможет вам понять и преодолеть эти блоки. 🔑",
          "sadness": "Спасибо, что поделились этим. Выражать трудные чувства смело и исцеляюще. Insight здесь, чтобы выслушать и помочь вам пережить эти моменты. 💙",
          "default": "Спасибо, что поделились. Каждая запись – это шаг к более глубокому пониманию себя. Insight поможет вам выявить закономерности, отслеживать свой рост и со временем обрести ясность. 💜"
        }
      },
      "privacy": {
        "title": "Ваши заметки полностью конфиденциальны",
        "subtitle": "Мы используем сквозное шифрование для обеспечения безопасности ваших записей в журнале. Только вы можете их прочитать.",
        "encryption": "Шифрование AES-256",
        "passwordKey": "Ваш пароль является ключом",
        "cannotRead": "Мы не можем прочитать ваши записи"
      },
      "notifications": {
        "title": "Включить уведомления",
        "subtitle": "Получите максимальную отдачу от Insight, оставаясь в курсе происходящего.",
        "allow": "Разрешить уведомления",
        "skip": "Пропустить пока →",
        "permissionTitle": "Не забудьте отразить это с помощью уведомлений",
        "permissionRequest": "Insight AI хотел бы отправить вам",
        "permissionType": "Уведомления",
        "dontAllow": "Не разрешать"
      },
      "rateUs": {
        "title": "Оцените нас 5 звезд",
        "subtitle": "Помогите нам распространить идею осознанной жизни и личностного роста.",
        "testimonials": {
          "first": "Insight полностью изменил мое понимание своих эмоций. Данные искусственного интеллекта невероятно точны и полезны.",
          "second": "Это приложение помогло мне выявить закономерности, которые я раньше не замечал. Это как будто у меня в кармане терапевт.",
          "third": "Ежедневные размышления и идеи стали неотъемлемой частью моего ухода за собой."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "Лучше поймите себя\nс Insight",
          "growth": "Отслеживайте рост\nи прогресс",
          "reflect": "Размышляйте глубже,\nживите лучше",
          "mira": "Поговорите с Mira",
          "findWhatWorks": "Найдите то, что работает"
        },
        "trial": "3-дневная пробная версия",
        "weekly": "Еженедельно",
        "monthly": "Ежемесячно",
        "yearly": "Ежегодно",
        "save": "Сэкономьте 73%",
        "perDay": "{{price}} / день",
        "perWeek": "{{price}} в неделю",
        "perMonth": "{{price}} в месяц",
        "perYear": "{{price}} в год",
        "whatYouGet": "Что вы получаете:",
        "benefits": {
          "unlimited": "Неограниченные аналитические данные журналов на основе искусственного интеллекта",
          "patterns": "Обнаружение глубоких закономерностей и триггеров",
          "summaries": "Персонализированные еженедельные сводки",
          "playbook": "Руководство по развитию и планы действий"
        },
        "testimonials": {
          "first": "Insight полностью изменил мое понимание своих эмоций. Данные искусственного интеллекта невероятно точны и полезны.",
          "second": "Подсказки для ведения журнала продуманы, а отслеживание закономерностей помогает мне увидеть мой рост с течением времени.",
          "third": "Лучшее приложение для психического здоровья, которое я когда-либо использовал. ИИ чувствует себя так, будто разговаривает с терапевтом, который меня действительно понимает.",
          "fourth": "Мне нравится, как это связывает мои повседневные привычки с моим настроением. Потрясающие идеи каждую неделю.",
          "fifth": "Функция сборника игр с персонализированными стратегиями изменила правила игры в отношении моего беспокойства."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "Никаких обязательств, отмените в любое время.",
        "startJourney": "Начни мое путешествие сегодня",
        "restorePurchase": "Восстановить покупку",
        "terms": "Условия использования",
        "privacyPolicy": "политика конфиденциальности",
        "alerts": {
          "otherAccountTitle": "Подписка найдена в другом аккаунте",
          "otherAccountBody": "Эта подписка принадлежит другой учетной записи на этом устройстве. Пожалуйста, войдите в эту учетную запись, чтобы использовать функции Pro.",
          "otherAccountPurchaseBody": "Подписка Pro активна в другой учетной записи на этом устройстве. Пожалуйста, войдите в эту учетную запись, чтобы использовать функции Pro, или приобретите новую подписку для этой учетной записи.",
          "purchaseSuccessTitle": "Покупка успешна! 🎉",
          "purchaseSuccessBody": "Теперь у вас есть доступ к неограниченной информации об искусственном интеллекте и всем функциям Pro.",
          "inactiveTitle": "Подписка не активна",
          "inactiveBody": "Ваша покупка не может быть подтверждена. Пожалуйста, свяжитесь со службой поддержки, если проблема сохранится.",
          "comingSoonTitle": "Подписки скоро появятся",
          "comingSoonBody": "Устанавливаются мобильные подписки. Вы можете продолжить использование приложения и оформить подписку позже в Интернете по адресу myinsightai.app.",
          "continueToApp": "Перейти к приложению",
          "alreadySubscribedTitle": "Уже подписан",
          "alreadySubscribedBody": "У вас уже есть активная подписка Pro. Наслаждайтесь премиум-функциями!",
          "existsTitle": "Подписка уже существует",
          "existsBody": "На этом устройстве ранее была приобретена подписка под другой учетной записью. Чтобы использовать функции Pro, войдите в учетную запись, из которой изначально была приобретена подписка.\n\nЕсли вы считаете, что это ошибка, попробуйте восстановить покупки или обратитесь в службу поддержки.",
          "tryRestore": "Попробуйте восстановить",
          "purchaseFailed": "Покупка не удалась",
          "purchaseError": "Ошибка: {{message}}\n\nКод: {{code}}\n\nПожалуйста, проверьте:\n1. Выполнен вход в учетную запись песочницы (Настройки > App Store).\n2. Продукты настраиваются в App Store Connect.\n3. Повторите попытку через несколько минут.",
          "noPurchasesTitle": "Покупки не найдены",
          "noPurchasesBody": "Для этого Apple ID не обнаружено активных подписок.",
          "restoreFailed": "Восстановление не удалось",
          "restoreError": "Не удалось восстановить покупки: {{message}}.",
          "unknown": "неизвестный",
          "ok": "ХОРОШО"
        }
      },
      "postPurchase": {
        "title": "Добро пожаловать в Insight",
        "subtitle": "У вас все готово с Pro",
        "analysis": "Анализ журналов с помощью искусственного интеллекта",
        "privateEntries": "Частные и зашифрованные записи",
        "growth": "Отслеживайте свой рост с течением времени",
        "accountInfo": "Создайте учетную запись, чтобы сохранять свои записи и получать к ним доступ на разных устройствах."
      },
      "analysisComplete": {
        "namedTitle": "{{name}}, ваш личный план готов",
        "title": "Все готово",
        "reassurance": "Ваше пространство готово."
      },
      "aiConsent": {
        "title": "Включить анализ ИИ?",
        "subtitle": "Получайте персонализированную информацию из своих записей в журнале с помощью технологии искусственного интеллекта.",
        "dataTitle": "Какие данные отправляются",
        "dataBody": "Когда вы нажимаете «Анализ» в записи журнала, мы отправляем текстовое содержимое в нашу службу искусственного интеллекта для анализа.",
        "entryText": "Текст вашей записи в журнале",
        "noIdentifiers": "Никаких личных идентификаторов (имя, адрес электронной почты и т. д.)",
        "analyzeOnly": "Только когда вы нажмете кнопку «Анализ»",
        "recipientTitle": "Кто получает ваши данные",
        "recipientIntro": "Мы используем ",
        "providerName": "Groq",
        "recipientCompany": " (компанию, предоставляющую инфраструктуру ИИ), которая запускает языковую модель ",
        "modelName": "Llama 3",
        "recipientModelTail": " для анализа ваших записей в дневнике.",
        "recipientPrivacy": "Groq обрабатывает ваши данные в соответствии со своей политикой конфиденциальности и не использует ваши данные для обучения моделей ИИ.",
        "protectionTitle": "Как ваши данные защищены",
        "encrypted": "Все данные при передаче шифруются (HTTPS/TLS)",
        "secureStorage": "Ваши записи надежно хранятся в вашей частной базе данных.",
        "revoke": "Вы можете отозвать согласие в любое время в настройках.",
        "optional": "Функции искусственного интеллекта не являются обязательными — вы можете вести журнал без них.",
        "notice": "Принимая, вы соглашаетесь отправить текст записи вашего журнала на Groq для анализа ИИ, когда вы нажмете «Анализ». Подробную информацию см. в нашей Политике конфиденциальности.",
        "decline": "Отклонить",
        "accept": "Принять и продолжить"
      }
    }
  },
  "pt": {
    "onboarding": {
      "welcome": "Bem-vindo ao Insight",
      "getStarted": "Comece",
      "alreadyHaveAccount": "Já tem uma conta?",
      "signIn": "Entrar",
      "reflectGrow": "Reflita. Cresça.",
      "valuableInsights": "Obtenha informações valiosas",
      "reflectionToSteps": "Transforme a reflexão em próximos passos.",
      "weekAtGlance": "Verifique rapidamente sua semana",
      "skip": "Pular",
      "skipForNow": "Pular por enquanto",
      "valueProp": {
        "title": "Insight transforma pensamentos em clareza",
        "mentalNoise": "Ruído mental",
        "understanding": "Entendimento",
        "captureFeelings": "Capture como você se sente",
        "understandPatterns": "Entenda os padrões ao longo do tempo",
        "gainClarity": "Obtenha clareza - não desordem"
      },
      "patterns": {
        "eyebrow": "Alimentado por IA",
        "title": "Acompanhe seus padrões\ncom o tempo",
        "subtitle": "Insight identifica o que está impedindo você e revela suas principais prioridades para trabalhar.",
        "adjustSleep": "Ajuste o horário de sono",
        "selfCompassion": "Pratique mais a autocompaixão",
        "reduceScreenTime": "Reduza o tempo de tela antes de dormir",
        "manageStress": "Gerencie o estresse de forma proativa",
        "setBoundaries": "Estabeleça limites mais claros",
        "challengeSelfTalk": "Desafie o diálogo interno negativo",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "Comemore o crescimento",
        "title": "Comemore também\nsuas conquistas",
        "subtitle": "Insight também identifica o que está indo bem para que você possa desenvolver seus pontos fortes.",
        "gym": "Ir à academia de forma consistente",
        "reading": "Lendo todos os dias desta semana",
        "openingUp": "Abrindo mais para as pessoas",
        "calm": "Manter a calma sob pressão",
        "morningRoutine": "Manter uma rotina matinal",
        "perseverance": "Superando momentos difíceis"
      },
      "research": {
        "title": "Embasado na\npsicologia",
        "body": "A pesquisa mostra que o diário reflexivo melhora a consciência emocional e o bem-estar a longo prazo.",
        "citation": "Advances in Psychiatric Treatment, 2005",
        "learnMore": "Saber mais"
      },
      "auth": {
        "createAccount": "Crie uma conta",
        "createYourAccount": "Crie sua conta",
        "subtitle": "Selecione uma opção para começar",
        "postPurchaseSubtitle": "Salve suas entradas e acesse-as em vários dispositivos",
        "apple": "Continuar com Apple",
        "google": "Continuar com Google",
        "email": "Continuar com e-mail",
        "signInPrompt": "Já tem uma conta?",
        "appleFailed": "Falha no login Apple",
        "googleFailed": "Falha no login Google",
        "genericError": "Ocorreu um erro"
      },
      "vibe": {
        "title": "Escolha sua vibração",
        "dark": "Escuro",
        "light": "Claro",
        "sunset": "Pôr do sol",
        "vibrant": "Vibrante",
        "ocean": "Oceano",
        "midnight": "Meia-noite"
      },
      "questions": {
        "name": {
          "title": "Qual o seu nome?",
          "subtitle": "Usaremos isso para personalizar sua experiência.",
          "placeholder": "Digite seu nome"
        },
        "referral": {
          "title": "Onde você ouviu falar de nós?",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "Amigo",
          "other": "Outro"
        },
        "goal": {
          "title": "Qual é o seu principal objetivo neste momento?",
          "mood": "Melhorar o humor",
          "stress": "Reduza o estresse",
          "habits": "Construir hábitos",
          "clarity": "Ganhe clareza"
        },
        "research": {
          "title": "Fundamentado em psicologia",
          "subtitle": "A pesquisa mostra que o diário reflexivo melhora a consciência emocional e o bem-estar a longo prazo.",
          "badge": "Cambridge University",
          "screenTitle": "Insight é baseado em psicologia",
          "body": "O registro no diário está ligado a uma melhor consciência emocional e bem-estar mental."
        },
        "frequency": {
          "title": "Com que frequência você deseja refletir?",
          "daily": "Diário",
          "weekly": "Semanalmente",
          "asNeeded": "Conforme necessário"
        },
        "experience": {
          "title": "Há quanto tempo você está registrando no diário?",
          "new": "Eu sou novo no diário",
          "underSixMonths": "<6 meses",
          "sixToTwentyFourMonths": "6–24 meses",
          "twoPlusYears": "2+ anos"
        },
        "wellbeing": {
          "title": "Como você avaliaria seu bem-estar diário?",
          "subtitle": "Em uma escala de 1 a 10, onde você normalmente se sente?",
          "typicalDay": "DIA TÍPICO"
        },
        "stressResponse": {
          "title": "Quando você está sob pressão, o que você costuma fazer?",
          "ruminate": "Ruminar ou espiralar",
          "selfBlame": "Me culpo",
          "fixate": "Fixe-se em torná-lo perfeito",
          "stepBack": "Pausar e reagrupar"
        },
        "selfTalk": {
          "title": "Como você descreveria sua voz interior?",
          "critical": "Muitas vezes duro ou julgador",
          "mixed": "Depende do dia",
          "supportive": "Principalmente de apoio"
        },
        "coping": {
          "title": "Quando as emoções parecem opressoras, o que mais ajuda você?",
          "social": "Conversando sobre isso",
          "physical": "Movendo meu corpo",
          "expressive": "Registro no diário ou trabalho criativo",
          "solitude": "Tempo sozinho para recarregar"
        },
        "change": {
          "title": "Como você normalmente responde a grandes mudanças?",
          "resistant": "Resista primeiro, depois adapte-se",
          "anxious": "Sinta-se ansioso, mas siga em frente",
          "embrace": "Abrace o desafio",
          "support": "Precisa de muito apoio"
        },
        "motivation": {
          "title": "O que o leva a continuar quando as coisas ficam difíceis?",
          "fear": "Medo de falhar ou de decepcionar os outros",
          "external": "Recompensas ou reconhecimento externo",
          "values": "Valores internos e propósito",
          "passion": "Amor pelo que faço"
        },
        "relationships": {
          "title": "Em relacionamentos íntimos, que padrão aparece para você?",
          "anxious": "Eu preciso de muita garantia",
          "avoidant": "Eu me afasto quando as coisas ficam intensas",
          "fearful": "Eu alterno entre afastar e agarrar",
          "secure": "Me sinto seguro e confortável"
        },
        "conflict": {
          "title": "Quando há tensão ou conflito, você geralmente...",
          "avoid": "Evite a todo custo",
          "accommodate": "Tente suavizar ou por favor",
          "compete": "Empurre para vencer ou provar meu ponto de vista",
          "collaborate": "Aborde isso com calma e diretamente"
        },
        "rest": {
          "title": "Como é o descanso para você?",
          "guilt": "Eu luto para descansar - me sinto culpado",
          "solitude": "Eu preciso de solidão total",
          "social": "Eu recarrego através da conexão social",
          "active": "Eu descanso fazendo atividades calmantes"
        },
        "identitySource": {
          "title": "De onde você mais deriva seu senso de identidade?",
          "achievement": "Minhas conquistas e sucesso",
          "relationships": "Meus relacionamentos e conexões",
          "values": "Meus valores e crenças",
          "expression": "Minha criatividade ou autoexpressão"
        },
        "failure": {
          "title": "Quando você falha ou comete um erro, qual é a sua primeira reação?",
          "shame": "Eu sinto que não sou bom o suficiente",
          "defensive": "Fico na defensiva ou culpo fatores externos",
          "analytical": "Eu analiso o que deu errado",
          "growth": "Eu vejo isso como uma oportunidade de aprendizado"
        },
        "awareness": {
          "title": "Quão consciente você está de suas emoções no momento?",
          "low": "Muitas vezes só percebo mais tarde",
          "moderate": "Eu os sinto, mas nem sempre consigo nomeá-los",
          "high": "Consigo identificar a maioria das emoções à medida que elas acontecem",
          "veryHigh": "Estou muito sintonizado com mudanças sutis"
        },
        "decisions": {
          "title": "Ao tomar decisões importantes, você tende a...",
          "overthink": "Pense demais e fique preso na paralisia da análise",
          "intuitive": "Vá com meu instinto",
          "external": "Busque muitos conselhos de outras pessoas",
          "systematic": "Pesar prós/contras sistematicamente"
        },
        "gender": {
          "title": "Como você se identifica?",
          "subtitle": "Usamos isso apenas para personalizar insights.",
          "woman": "Mulher",
          "man": "Homem",
          "nonBinary": "Não binário",
          "preferNot": "Prefiro não dizer"
        },
        "apaStudy": "📘 A escrita expressiva aumenta o processamento emocional — APA Psychology Review",
        "insightsWith": "OBTENHA INSIGHTS COM"
      },
      "quizIntro": {
        "title": "Ajude-nos a entender seus hábitos",
        "description": "Perguntas opcionais para personalizar sua experiência",
        "questions": "questões",
        "minutes": "minutos",
        "private": "privado",
        "accurateInsights": "Informações mais precisas",
        "recommendations": "Recomendações personalizadas",
        "patternTracking": "Melhor rastreamento de padrões"
      },
      "analyzing": {
        "emotionalPatterns": "Analisando padrões emocionais",
        "responses": "Processando suas respostas",
        "stressMarkers": "Identificando marcadores de estresse",
        "personalPlan": "Construindo seu plano pessoal",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "Seu padrão principal",
        "perfectionism": "Perfeccionismo",
        "anxiety": "Ansiedade",
        "selfCompassion": "Falta de autocompaixão",
        "boundaries": "Falta de limites",
        "selfEsteem": "Baixa auto-estima",
        "descriptions": {
          "perfectionism": "O perfeccionismo pode mantê-lo tenso e preso. Isso leva você a perseguir a certeza em vez de se sentir acabado.",
          "anxiety": "A ansiedade geralmente vem de uma mente que procura o perigo com muita frequência. Isso pode deixá-lo tenso mesmo quando você está seguro.",
          "selfCompassion": "Baixa autocompaixão significa ser mais duro consigo mesmo do que seria com alguém que você ama. Isso faz com que o crescimento pareça mais pesado do que o necessário.",
          "boundaries": "Limites fracos podem resultar do medo de conflitos ou da decepção de pessoas. Com o tempo, isso deixa você esgotado e afastado de suas próprias necessidades.",
          "selfEsteem": "A baixa auto-estima pode fazer com que sua mente se fixe no que parece estar faltando. Isso mantém uma autoimagem distorcida."
        },
        "evolution": "Acompanharemos como isso evolui e ajudaremos você a lidar com isso."
      },
      "summary": {
        "title": "Está tudo pronto!",
        "mood": "Ajudaremos você a melhorar seu humor com reflexões e insights guiados.",
        "stress": "Ajudaremos você a reduzir o estresse com reflexões e insights guiados.",
        "habits": "Ajudaremos você a construir hábitos com reflexões e insights guiados.",
        "clarity": "Ajudaremos você a obter clareza com reflexões e insights guiados.",
        "default": "Seu espaço pessoal de reflexão está pronto. Vamos começar sua jornada."
      },
      "showcase": {
        "label": "EXPERIMENTE",
        "title": "Escreva livremente.\nObtenha clareza.",
        "entry": "Sua entrada",
        "placeholder": "Comece a escrever como você se sente...",
        "pickPrompt": "Ou escolha uma solicitação",
        "prompts": {
          "overwhelmed": "Ultimamente tenho me sentido sobrecarregado de trabalho...",
          "outside": "Hoje percebi que fiquei mais feliz depois de sair",
          "procrastinating": "Eu continuo adiando as coisas e não sei por que",
          "grateful": "Algo aconteceu hoje que me deixou muito grato"
        },
        "thinking": "Insight está pensando...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "Parece que você está carregando muita coisa agora. Reconhecer esse sentimento é o primeiro passo – Insight pode ajudá-lo a rastrear esses padrões e encontrar o que lhe traz alívio. 💜",
          "positive": "Essa é uma bela observação. Perceber o que melhora seu humor é poderoso - Insight o ajudará a desenvolver esses padrões positivos ao longo do tempo. ✨",
          "procrastination": "A procrastinação muitas vezes tem raízes mais profundas do que pensamos. O registro no diário pode revelar as emoções ocultas por trás dele – Insight o ajudará a compreender e superar esses bloqueios. 🔑",
          "sadness": "Obrigado por compartilhar isso. Expressar sentimentos difíceis é corajoso e curativo. Insight está aqui para ouvir e ajudar você a navegar por esses momentos. 💙",
          "default": "Obrigado por compartilhar. Cada entrada é um passo em direção a uma autocompreensão mais profunda. Insight o ajudará a descobrir padrões, acompanhar seu crescimento e obter clareza ao longo do tempo. 💜"
        }
      },
      "privacy": {
        "title": "Suas anotações são totalmente privadas",
        "subtitle": "Usamos criptografia de ponta a ponta para manter suas entradas de diário seguras. Só você pode lê-las.",
        "encryption": "Criptografia AES-256",
        "passwordKey": "Sua senha é a chave",
        "cannotRead": "Não podemos ler suas entradas"
      },
      "notifications": {
        "title": "Ative as notificações",
        "subtitle": "Aproveite ao máximo o Insight mantendo-se atualizado com o que está acontecendo.",
        "allow": "Permitir notificações",
        "skip": "Pule por enquanto →",
        "permissionTitle": "Lembre-se de refletir com notificações",
        "permissionRequest": "Insight AI gostaria de lhe enviar",
        "permissionType": "Notificações",
        "dontAllow": "Não permita"
      },
      "rateUs": {
        "title": "Avalie-nos com 5 estrelas",
        "subtitle": "Ajude-nos a espalhar a mensagem de uma vida consciente e de crescimento pessoal",
        "testimonials": {
          "first": "Insight mudou completamente a forma como entendo minhas emoções. Os insights de IA são incrivelmente precisos e úteis.",
          "second": "Este aplicativo me ajudou a identificar padrões que nunca havia notado antes. É como ter um terapeuta no bolso.",
          "third": "As reflexões e insights diários tornaram-se uma parte essencial da minha rotina de autocuidado."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "Entenda-se melhor\ncom o Insight",
          "growth": "Acompanhe seu crescimento\ne progresso",
          "reflect": "Reflita mais,\nviva melhor",
          "mira": "Fale com a Mira",
          "findWhatWorks": "Encontre o que funciona"
        },
        "trial": "Teste de 3 dias",
        "weekly": "Semanalmente",
        "monthly": "Mensal",
        "yearly": "Anual",
        "save": "Economize 73%",
        "perDay": "{{price}}/dia",
        "perWeek": "{{price}} por semana",
        "perMonth": "{{price}} por mês",
        "perYear": "{{price}} por ano",
        "whatYouGet": "O que você ganha:",
        "benefits": {
          "unlimited": "Insights ilimitados de diários baseados em IA",
          "patterns": "Detecção profunda de padrões e gatilhos",
          "summaries": "Resumos semanais personalizados",
          "playbook": "Manual de crescimento e planos de ação"
        },
        "testimonials": {
          "first": "Insight mudou completamente a forma como entendo minhas emoções. Os insights de IA são incrivelmente precisos e úteis.",
          "second": "As instruções de registro no diário são atenciosas e o rastreamento de padrões me ajuda a ver meu crescimento ao longo do tempo.",
          "third": "Melhor aplicativo de saúde mental que usei. A IA tem vontade de conversar com um terapeuta que realmente me entende.",
          "fourth": "Adoro como isso conecta meus hábitos diários aos meus padrões de humor. Insights reveladores todas as semanas.",
          "fifth": "O recurso do manual com estratégias personalizadas mudou o jogo para minha ansiedade."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "Sem compromisso, cancele a qualquer momento.",
        "startJourney": "Comece minha jornada hoje",
        "restorePurchase": "Restaurar compra",
        "terms": "Termos e Condições",
        "privacyPolicy": "política de Privacidade",
        "alerts": {
          "otherAccountTitle": "Assinatura encontrada em outra conta",
          "otherAccountBody": "Esta assinatura pertence a uma conta diferente neste dispositivo. Faça login nessa conta para usar os recursos Pro.",
          "otherAccountPurchaseBody": "Uma assinatura Pro está ativa em uma conta diferente neste dispositivo. Faça login nessa conta para usar os recursos Pro ou adquira uma nova assinatura para esta conta.",
          "purchaseSuccessTitle": "Compra realizada com sucesso! 🎉",
          "purchaseSuccessBody": "Agora você tem acesso a insights de IA ilimitados e todos os recursos Pro.",
          "inactiveTitle": "Assinatura não ativa",
          "inactiveBody": "Não foi possível confirmar sua compra. Entre em contato com o suporte se isso persistir.",
          "comingSoonTitle": "Assinaturas em breve",
          "comingSoonBody": "Assinaturas móveis estão sendo configuradas. Você pode continuar usando o aplicativo e assinar mais tarde na web em myinsightai.app",
          "continueToApp": "Continuar para o aplicativo",
          "alreadySubscribedTitle": "Já inscrito",
          "alreadySubscribedBody": "Você já tem uma assinatura Pro ativa. Aproveite seus recursos premium!",
          "existsTitle": "A assinatura já existe",
          "existsBody": "Uma assinatura foi adquirida anteriormente neste dispositivo com uma conta diferente. Para usar os recursos Pro, faça login na conta que comprou originalmente a assinatura.\n\nSe você acredita que isso é um erro, tente restaurar as compras ou entre em contato com o suporte.",
          "tryRestore": "Tente restaurar",
          "purchaseFailed": "Falha na compra",
          "purchaseError": "Erro: {{message}}\n\nCódigo: {{code}}\n\nPor favor verifique:\n1. A conta Sandbox está conectada (Configurações > App Store)\n2. Os produtos são configurados em App Store Connect\n3. Tente novamente em alguns instantes",
          "noPurchasesTitle": "Nenhuma compra encontrada",
          "noPurchasesBody": "Nenhuma assinatura ativa foi encontrada para este Apple ID.",
          "restoreFailed": "Falha na restauração",
          "restoreError": "Não foi possível restaurar as compras: {{message}}",
          "unknown": "desconhecido",
          "ok": "OK"
        }
      },
      "postPurchase": {
        "title": "Bem-vindo ao Insight",
        "subtitle": "Está tudo pronto com o Pro",
        "analysis": "Análise de diário com tecnologia de IA",
        "privateEntries": "Entradas privadas e criptografadas",
        "growth": "Acompanhe seu crescimento ao longo do tempo",
        "accountInfo": "Crie uma conta para salvar suas entradas e acessá-las em vários dispositivos."
      },
      "analysisComplete": {
        "namedTitle": "{{name}}, seu plano pessoal está pronto",
        "title": "Você está pronto",
        "reassurance": "Seu espaço está pronto."
      },
      "aiConsent": {
        "title": "Ativar análise de IA?",
        "subtitle": "Obtenha insights personalizados das suas entradas de diário usando tecnologia de IA",
        "dataTitle": "Quais dados são enviados",
        "dataBody": "Quando você toca em \"Analisar\" em uma entrada de diário, enviamos o conteúdo do texto ao nosso serviço de IA para análise.",
        "entryText": "O texto do seu diário",
        "noIdentifiers": "Nenhum identificador pessoal (nome, e-mail, etc.)",
        "analyzeOnly": "Somente quando você toca no botão \"Analisar\"",
        "recipientTitle": "Quem recebe seus dados",
        "recipientIntro": "Usamos ",
        "providerName": "Groq",
        "recipientCompany": " (uma empresa de infraestrutura de IA), que executa o modelo de linguagem ",
        "modelName": "Llama 3",
        "recipientModelTail": " para analisar suas entradas de diário.",
        "recipientPrivacy": "Groq processa seus dados de acordo com sua política de privacidade e não usa seus dados para treinar modelos de IA.",
        "protectionTitle": "Como seus dados são protegidos",
        "encrypted": "Todos os dados são criptografados em trânsito (HTTPS/TLS)",
        "secureStorage": "Suas entradas são armazenadas com segurança em seu banco de dados privado",
        "revoke": "Você pode revogar o consentimento a qualquer momento nas Configurações",
        "optional": "Os recursos de IA são opcionais – você pode registrar no diário sem eles",
        "notice": "Ao aceitar, você concorda em enviar o texto do seu diário para Groq para análise de IA ao tocar em \"Analisar\". Consulte nossa Política de Privacidade para obter detalhes completos.",
        "decline": "Recusar",
        "accept": "Aceitar e continuar"
      }
    }
  },
  "it": {
    "onboarding": {
      "welcome": "Benvenuti in Insight",
      "getStarted": "Inizia",
      "alreadyHaveAccount": "Hai già un account?",
      "signIn": "Registrazione",
      "reflectGrow": "Rifletti. Cresci.",
      "valuableInsights": "Ottieni informazioni preziose",
      "reflectionToSteps": "Trasforma la riflessione nei passaggi successivi.",
      "weekAtGlance": "Controlla la tua settimana a colpo d'occhio",
      "skip": "Saltare",
      "skipForNow": "Salta per ora",
      "valueProp": {
        "title": "Insight trasforma i pensieri in chiarezza",
        "mentalNoise": "Rumore mentale",
        "understanding": "Comprensione",
        "captureFeelings": "Cattura come ti senti",
        "understandPatterns": "Comprendere i modelli nel tempo",
        "gainClarity": "Ottieni chiarezza, non confusione"
      },
      "patterns": {
        "eyebrow": "Alimentato dall'intelligenza artificiale",
        "title": "Tieni traccia dei tuoi schemi\nnel tempo",
        "subtitle": "Insight identifica cosa ti trattiene e fa emergere le tue principali priorità su cui lavorare.",
        "adjustSleep": "Regola il programma del sonno",
        "selfCompassion": "Pratica di più l’autocompassione",
        "reduceScreenTime": "Riduci il tempo trascorso davanti allo schermo prima di andare a letto",
        "manageStress": "Gestire lo stress in modo proattivo",
        "setBoundaries": "Stabilisci confini più chiari",
        "challengeSelfTalk": "Sfida il dialogo interiore negativo",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "Festeggia la crescita",
        "title": "Festeggia anche\ni tuoi successi",
        "subtitle": "Insight individua anche ciò che sta andando bene in modo che tu possa sfruttare i tuoi punti di forza.",
        "gym": "Andare in palestra con costanza",
        "reading": "Leggendo ogni giorno questa settimana",
        "openingUp": "Aprirsi di più alle persone",
        "calm": "Mantenere la calma sotto pressione",
        "morningRoutine": "Mantenere una routine mattutina",
        "perseverance": "Superare i momenti difficili"
      },
      "research": {
        "title": "Basato sulla\npsicologia",
        "body": "La ricerca mostra che il journaling riflessivo migliora la consapevolezza emotiva e il benessere a lungo termine.",
        "citation": "Advances in Psychiatric Treatment, 2005",
        "learnMore": "Saperne di più"
      },
      "auth": {
        "createAccount": "Creare un account",
        "createYourAccount": "Crea il tuo account",
        "subtitle": "Seleziona un'opzione per iniziare",
        "postPurchaseSubtitle": "Salva le tue voci e accedi ad esse su tutti i dispositivi",
        "apple": "Continuare con Apple",
        "google": "Continuare con Google",
        "email": "Continua con l'e-mail",
        "signInPrompt": "Hai già un account?",
        "appleFailed": "Apple Accesso non riuscito",
        "googleFailed": "Google Accesso non riuscito",
        "genericError": "Si è verificato un errore"
      },
      "vibe": {
        "title": "Scegli la tua atmosfera",
        "dark": "Scuro",
        "light": "Chiaro",
        "sunset": "Tramonto",
        "vibrant": "Vibrante",
        "ocean": "Oceano",
        "midnight": "Mezzanotte"
      },
      "questions": {
        "name": {
          "title": "Come ti chiami?",
          "subtitle": "Lo useremo per personalizzare la tua esperienza.",
          "placeholder": "Inserisci il tuo nome"
        },
        "referral": {
          "title": "Dove hai sentito parlare di noi?",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "Amico",
          "other": "Altro"
        },
        "goal": {
          "title": "Qual è il tuo obiettivo principale in questo momento?",
          "mood": "Migliora l'umore",
          "stress": "Ridurre lo stress",
          "habits": "Costruisci abitudini",
          "clarity": "Ottieni chiarezza"
        },
        "research": {
          "title": "Radicato nella psicologia",
          "subtitle": "La ricerca mostra che il journaling riflessivo migliora la consapevolezza emotiva e il benessere a lungo termine.",
          "badge": "Cambridge University",
          "screenTitle": "Insight ha radici psicologiche",
          "body": "Il journaling è collegato a una migliore consapevolezza emotiva e al benessere mentale."
        },
        "frequency": {
          "title": "Quanto spesso vuoi riflettere?",
          "daily": "Quotidiano",
          "weekly": "Settimanale",
          "asNeeded": "Secondo necessità"
        },
        "experience": {
          "title": "Da quanto tempo scrivi nel diario?",
          "new": "Sono nuovo nel journaling",
          "underSixMonths": "< 6 mesi",
          "sixToTwentyFourMonths": "6–24 mesi",
          "twoPlusYears": "2+ anni"
        },
        "wellbeing": {
          "title": "Come valuteresti il ​​tuo benessere quotidiano?",
          "subtitle": "Su una scala da 1 a 10, dove ti senti tipicamente?",
          "typicalDay": "GIORNATA TIPO"
        },
        "stressResponse": {
          "title": "Quando sei sotto pressione, cosa tendi a fare?",
          "ruminate": "Ruminare o spirale",
          "selfBlame": "Incolpare me stesso",
          "fixate": "Impegnati a renderlo perfetto",
          "stepBack": "Metti in pausa e riorganizzati"
        },
        "selfTalk": {
          "title": "Come descriveresti la tua voce interiore?",
          "critical": "Spesso duro o giudicante",
          "mixed": "Dipende dal giorno",
          "supportive": "Per lo più di supporto"
        },
        "coping": {
          "title": "Quando le emozioni sono travolgenti, cosa ti aiuta di più?",
          "social": "Ne stiamo parlando",
          "physical": "Muovere il mio corpo",
          "expressive": "Diario o lavoro creativo",
          "solitude": "Tempo da solo per ricaricarsi"
        },
        "change": {
          "title": "Come rispondi tipicamente ai grandi cambiamenti?",
          "resistant": "All'inizio resisti, poi adattati",
          "anxious": "Ti senti ansioso ma vai avanti",
          "embrace": "Accetta la sfida",
          "support": "Hai bisogno di molto supporto"
        },
        "motivation": {
          "title": "Cosa ti spinge ad andare avanti quando le cose si fanno difficili?",
          "fear": "Paura di fallire o di deludere gli altri",
          "external": "Premi o riconoscimenti esterni",
          "values": "Valori interni e scopo",
          "passion": "Amore per quello che faccio"
        },
        "relationships": {
          "title": "Nelle relazioni intime, quale modello si presenta per te?",
          "anxious": "Ho bisogno di molte rassicurazioni",
          "avoidant": "Mi allontano quando le cose si fanno intense",
          "fearful": "Alterno il respingere e l’aggrapparsi",
          "secure": "Mi sento sicuro e a mio agio"
        },
        "conflict": {
          "title": "Quando c'è tensione o conflitto, di solito...",
          "avoid": "Evitatelo a tutti i costi",
          "accommodate": "Prova a lisciarlo o per favore",
          "compete": "Spingi per vincere o dimostrare il mio punto",
          "collaborate": "Affrontalo con calma e direttamente"
        },
        "rest": {
          "title": "Che significato ha per te il riposo?",
          "guilt": "Faccio fatica a riposare, mi sento in colpa",
          "solitude": "Ho bisogno di solitudine totale",
          "social": "Mi ricarico attraverso la connessione social",
          "active": "Mi riposo facendo attività calmanti"
        },
        "identitySource": {
          "title": "Da dove trai maggiormente il tuo senso di identità?",
          "achievement": "I miei risultati e il mio successo",
          "relationships": "Le mie relazioni e connessioni",
          "values": "I miei valori e le mie convinzioni",
          "expression": "La mia creatività o espressione di sé"
        },
        "failure": {
          "title": "Quando fallisci o commetti un errore, qual è la tua prima reazione?",
          "shame": "Mi sento come se non fossi abbastanza bravo",
          "defensive": "Mi metto sulla difensiva o attribuisco la colpa a fattori esterni",
          "analytical": "Analizzo cosa è andato storto",
          "growth": "La vedo come un'opportunità di apprendimento"
        },
        "awareness": {
          "title": "Quanto sei consapevole delle tue emozioni in questo momento?",
          "low": "Spesso non me ne accorgo fino a tardi",
          "moderate": "Li sento ma non riesco sempre a nominarli",
          "high": "Posso identificare la maggior parte delle emozioni mentre accadono",
          "veryHigh": "Sono molto in sintonia con i cambiamenti sottili"
        },
        "decisions": {
          "title": "Quando prendi decisioni importanti, tendi a...",
          "overthink": "Pensare troppo e rimanere bloccati nella paralisi dell’analisi",
          "intuitive": "Segui il mio istinto",
          "external": "Chiedi molti consigli agli altri",
          "systematic": "Pesare sistematicamente i pro/contro"
        },
        "gender": {
          "title": "Come ti identifichi?",
          "subtitle": "Lo usiamo solo per personalizzare gli approfondimenti.",
          "woman": "Donna",
          "man": "Uomo",
          "nonBinary": "Non binario",
          "preferNot": "Preferisco non dirlo"
        },
        "apaStudy": "📘 La scrittura espressiva stimola l'elaborazione emotiva — APA Psychology Review",
        "insightsWith": "OTTIENI APPROFONDIMENTI CON"
      },
      "quizIntro": {
        "title": "Aiutaci a capire le tue abitudini",
        "description": "Domande facoltative per personalizzare la tua esperienza",
        "questions": "domande",
        "minutes": "minuti",
        "private": "privato",
        "accurateInsights": "Approfondimenti più accurati",
        "recommendations": "Raccomandazioni personalizzate",
        "patternTracking": "Migliore tracciamento dei modelli"
      },
      "analyzing": {
        "emotionalPatterns": "Analizzare i modelli emotivi",
        "responses": "Elaborazione delle tue risposte",
        "stressMarkers": "Individuazione dei marcatori di stress",
        "personalPlan": "Costruisci il tuo piano personale",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "Il tuo modello principale",
        "perfectionism": "Perfezionismo",
        "anxiety": "Ansia",
        "selfCompassion": "Mancanza di auto-compassione",
        "boundaries": "Mancanza di confini",
        "selfEsteem": "Bassa autostima",
        "descriptions": {
          "perfectionism": "Il perfezionismo può mantenerti teso e bloccato. Ti spinge a inseguire la certezza invece di sentirti finito.",
          "anxiety": "L’ansia spesso deriva da una mente che troppo spesso cerca il pericolo. Può lasciarti teso anche quando sei al sicuro.",
          "selfCompassion": "Una bassa autocompassione significa essere più duro con te stesso di quanto lo saresti con qualcuno che ami. Ciò fa sì che la crescita sembri più pesante del necessario.",
          "boundaries": "I confini deboli possono derivare dalla paura dei conflitti o dal deludere le persone. Nel tempo, questo ti lascia prosciugato e allontanato dai tuoi bisogni.",
          "selfEsteem": "Una bassa autostima può far sì che la tua mente si concentri su ciò che senti carente. Ciò mantiene in piedi un’immagine di sé distorta."
        },
        "evolution": "Monitoreremo l'evoluzione della situazione e ti aiuteremo a risolverla."
      },
      "summary": {
        "title": "Sei tutto pronto!",
        "mood": "Ti aiuteremo a migliorare il tuo umore con riflessioni e approfondimenti guidati.",
        "stress": "Ti aiuteremo a ridurre lo stress con riflessioni e approfondimenti guidati.",
        "habits": "Ti aiuteremo a costruire abitudini con riflessioni e approfondimenti guidati.",
        "clarity": "Ti aiuteremo a fare chiarezza con riflessioni e approfondimenti guidati.",
        "default": "Il tuo spazio personale per la riflessione è pronto. Iniziamo il tuo viaggio."
      },
      "showcase": {
        "label": "PROVALO",
        "title": "Scrivi liberamente.\nOttieni chiarezza.",
        "entry": "La tua voce",
        "placeholder": "Inizia a scrivere come ti senti...",
        "pickPrompt": "Oppure scegli un suggerimento",
        "prompts": {
          "overwhelmed": "Ultimamente mi sento sopraffatto dal lavoro...",
          "outside": "Oggi ho notato che ero più felice dopo essere uscito",
          "procrastinating": "Continuo a rimandare le cose e non so perché",
          "grateful": "Oggi è successo qualcosa che mi ha reso davvero grato"
        },
        "thinking": "Insight sta pensando...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "Sembra che tu stia trasportando molto in questo momento. Riconoscere quella sensazione è il primo passo: Insight può aiutarti a tenere traccia di questi schemi e trovare cosa ti dà sollievo. 💜",
          "positive": "È una bellissima osservazione. Notare ciò che solleva il tuo umore è potente: Insight ti aiuterà a sviluppare questi modelli positivi nel tempo. ✨",
          "procrastination": "La procrastinazione ha spesso radici più profonde di quanto pensiamo. L'inserimento nel diario può rivelare le emozioni nascoste dietro di esso: Insight ti aiuterà a comprendere e superare questi blocchi. 🔑",
          "sadness": "Grazie per averlo condiviso. Esprimere sentimenti difficili è coraggioso e curativo. Insight è qui per ascoltarti e aiutarti a superare questi momenti. 💙",
          "default": "Grazie per la condivisione. Ogni voce è un passo verso una più profonda comprensione di sé. Insight ti aiuterà a scoprire modelli, monitorare la tua crescita e acquisire chiarezza nel tempo. 💜"
        }
      },
      "privacy": {
        "title": "Le tue note sono completamente private",
        "subtitle": "Utilizziamo la crittografia end-to-end per mantenere al sicuro le voci del tuo diario. Solo tu puoi leggerli.",
        "encryption": "Crittografia AES-256",
        "passwordKey": "La tua password è la chiave",
        "cannotRead": "Non possiamo leggere le tue voci"
      },
      "notifications": {
        "title": "Attiva le notifiche",
        "subtitle": "Ottieni il massimo da Insight rimanendo aggiornato su ciò che accade.",
        "allow": "Consenti notifiche",
        "skip": "Salta per ora →",
        "permissionTitle": "Ricordati di riflettere con le notifiche",
        "permissionRequest": "Insight AI vorrebbe inviarti",
        "permissionType": "Notifiche",
        "dontAllow": "Non consentire"
      },
      "rateUs": {
        "title": "Valutaci 5 stelle",
        "subtitle": "Aiutaci a diffondere il messaggio di una vita consapevole e di crescita personale",
        "testimonials": {
          "first": "Insight ha completamente cambiato il modo in cui comprendo le mie emozioni. Gli approfondimenti dell’intelligenza artificiale sono incredibilmente accurati e utili.",
          "second": "Questa app mi ha aiutato a identificare modelli che non avevo mai notato prima. È come avere un terapista in tasca.",
          "third": "Le riflessioni e gli approfondimenti quotidiani sono diventati una parte essenziale della mia routine di cura di me stessa."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "Comprenditi meglio\ncon Insight",
          "growth": "Segui la tua crescita\ne i tuoi progressi",
          "reflect": "Rifletti più a fondo,\nvivi meglio",
          "mira": "Parla con Mira",
          "findWhatWorks": "Trova ciò che funziona"
        },
        "trial": "prova di 3 giorni",
        "weekly": "Settimanale",
        "monthly": "Mensile",
        "yearly": "Annuale",
        "save": "Risparmia il 73%",
        "perDay": "{{price}} / giorno",
        "perWeek": "{{price}} a settimana",
        "perMonth": "{{price}} al mese",
        "perYear": "{{price}} all'anno",
        "whatYouGet": "Cosa ottieni:",
        "benefits": {
          "unlimited": "Approfondimenti illimitati del diario basati sull'intelligenza artificiale",
          "patterns": "Rilevamento profondo di pattern e trigger",
          "summaries": "Riepiloghi settimanali personalizzati",
          "playbook": "Playbook per la crescita e piani d’azione"
        },
        "testimonials": {
          "first": "Insight ha completamente cambiato il modo in cui comprendo le mie emozioni. Gli approfondimenti dell’intelligenza artificiale sono incredibilmente accurati e utili.",
          "second": "Le istruzioni per l'inserimento nel journal sono ponderate e il monitoraggio dei modelli mi aiuta a vedere la mia crescita nel tempo.",
          "third": "La migliore app per la salute mentale che abbia mai usato. L'intelligenza artificiale mi dà la sensazione di parlare con un terapista che mi capisce davvero.",
          "fourth": "Adoro il modo in cui collega le mie abitudini quotidiane ai miei schemi di umore. Approfondimenti illuminanti ogni settimana.",
          "fifth": "La funzionalità del playbook con strategie personalizzate ha cambiato le regole del gioco per la mia ansia."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "Nessun impegno, annulla in qualsiasi momento.",
        "startJourney": "Inizia il mio viaggio oggi",
        "restorePurchase": "Ripristina acquisto",
        "terms": "Termini e condizioni",
        "privacyPolicy": "politica sulla riservatezza",
        "alerts": {
          "otherAccountTitle": "Abbonamento trovato su un altro account",
          "otherAccountBody": "Questo abbonamento appartiene a un altro account su questo dispositivo. Accedi a quell'account per utilizzare le funzionalità Pro.",
          "otherAccountPurchaseBody": "Un abbonamento Pro è attivo su un altro account su questo dispositivo. Accedi a quell'account per utilizzare le funzionalità Pro o acquista un nuovo abbonamento per questo account.",
          "purchaseSuccessTitle": "Acquisto riuscito! 🎉",
          "purchaseSuccessBody": "Ora hai accesso a informazioni illimitate sull'intelligenza artificiale e a tutte le funzionalità Pro.",
          "inactiveTitle": "Abbonamento non attivo",
          "inactiveBody": "Impossibile confermare l'acquisto. Contatta l'assistenza se il problema persiste.",
          "comingSoonTitle": "Abbonamenti in arrivo",
          "comingSoonBody": "Sono in fase di definizione gli abbonamenti mobile. Puoi continuare a utilizzare l'app e iscriverti successivamente sul Web all'indirizzo myinsightai.app",
          "continueToApp": "Continua all'app",
          "alreadySubscribedTitle": "Già iscritto",
          "alreadySubscribedBody": "Hai già un abbonamento Pro attivo. Goditi le tue funzionalità premium!",
          "existsTitle": "L'abbonamento esiste già",
          "existsBody": "È stato precedentemente acquistato un abbonamento su questo dispositivo con un account diverso. Per utilizzare le funzionalità Pro, accedi all'account con cui hai originariamente acquistato l'abbonamento.\n\nSe ritieni che si tratti di un errore, prova a ripristinare gli acquisti o contatta l'assistenza.",
          "tryRestore": "Prova Ripristina",
          "purchaseFailed": "Acquisto non riuscito",
          "purchaseError": "Errore: {{message}}\n\nCodice: {{code}}\n\nSi prega di verificare:\n1. L'account Sandbox è connesso (Impostazioni > App Store)\n2. I prodotti sono configurati in App Store Connect\n3. Riprova tra qualche istante",
          "noPurchasesTitle": "Nessun acquisto trovato",
          "noPurchasesBody": "Non è stato trovato alcun abbonamento attivo per questo Apple ID.",
          "restoreFailed": "Ripristino non riuscito",
          "restoreError": "Impossibile ripristinare gli acquisti: {{message}}",
          "unknown": "sconosciuto",
          "ok": "OK"
        }
      },
      "postPurchase": {
        "title": "Benvenuti in Insight",
        "subtitle": "È tutto pronto con Pro",
        "analysis": "Analisi del diario basata sull’intelligenza artificiale",
        "privateEntries": "Voci private e crittografate",
        "growth": "Tieni traccia della tua crescita nel tempo",
        "accountInfo": "Crea un account per salvare le tue voci e accedervi su tutti i dispositivi."
      },
      "analysisComplete": {
        "namedTitle": "{{name}}, il tuo piano personale è pronto",
        "title": "È tutto a posto",
        "reassurance": "Il tuo spazio è pronto."
      },
      "aiConsent": {
        "title": "Abilitare l'analisi AI?",
        "subtitle": "Ottieni approfondimenti personalizzati dalle voci del tuo diario utilizzando la tecnologia AI",
        "dataTitle": "Quali dati vengono inviati",
        "dataBody": "Quando tocchi \"Analizza\" su una voce del diario, inviamo il contenuto del testo al nostro servizio AI per l'analisi.",
        "entryText": "Il testo della tua registrazione nel diario",
        "noIdentifiers": "Nessun identificatore personale (nome, email, ecc.)",
        "analyzeOnly": "Solo quando tocchi il pulsante \"Analizza\".",
        "recipientTitle": "Chi riceve i tuoi dati",
        "recipientIntro": "Utilizziamo ",
        "providerName": "Groq",
        "recipientCompany": " (un’azienda di infrastruttura AI) che esegue il modello linguistico ",
        "modelName": "Llama 3",
        "recipientModelTail": " per analizzare le voci del tuo diario.",
        "recipientPrivacy": "Groq elabora i tuoi dati in base alla loro politica sulla privacy e non li utilizza per addestrare modelli IA.",
        "protectionTitle": "Come vengono protetti i tuoi dati",
        "encrypted": "Tutti i dati sono crittografati durante il transito (HTTPS/TLS)",
        "secureStorage": "Le tue voci sono archiviate in modo sicuro nel tuo database privato",
        "revoke": "Puoi revocare il consenso in qualsiasi momento nelle Impostazioni",
        "optional": "Le funzionalità AI sono opzionali: puoi tenere un diario senza di esse",
        "notice": "Accettando, acconsenti a inviare il testo della voce del diario a Groq per l'analisi AI quando tocchi \"Analizza\". Consulta la nostra Informativa sulla privacy per i dettagli completi.",
        "decline": "Rifiuta",
        "accept": "Accetta e continua"
      }
    }
  },
  "ro": {
    "onboarding": {
      "welcome": "Bun venit la Insight",
      "getStarted": "Începeți",
      "alreadyHaveAccount": "Aveți deja un cont?",
      "signIn": "Conectare",
      "reflectGrow": "Reflectează. Evoluează.",
      "valuableInsights": "Obțineți informații valoroase",
      "reflectionToSteps": "Transformă reflecția în următorii pași.",
      "weekAtGlance": "Verifica-ți săptămâna dintr-o privire",
      "skip": "Sari peste",
      "skipForNow": "Sari peste moment",
      "valueProp": {
        "title": "Insight transformă gândurile în claritate",
        "mentalNoise": "Zgomot mental",
        "understanding": "Înţelegere",
        "captureFeelings": "Surprindeți cum vă simțiți",
        "understandPatterns": "Înțelegeți tiparele în timp",
        "gainClarity": "Obțineți claritate - nu dezordine"
      },
      "patterns": {
        "eyebrow": "Alimentat de AI",
        "title": "Urmăriți-vă modelele\nde-a lungul timpului",
        "subtitle": "Insight identifică ceea ce te ține pe spate și evidențiază prioritățile tale principale la care să lucrezi.",
        "adjustSleep": "Ajustați programul de somn",
        "selfCompassion": "Exersează mai mult autocompasiunea",
        "reduceScreenTime": "Reduceți timpul petrecut înainte de culcare",
        "manageStress": "Gestionați stresul în mod proactiv",
        "setBoundaries": "Stabiliți limite mai clare",
        "challengeSelfTalk": "Provocați vorbirea de sine negativă",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "Sărbătorește creșterea",
        "title": "Sărbătorește și\ntoate reușitele",
        "subtitle": "Insight observă, de asemenea, ceea ce merge bine, astfel încât să vă puteți dezvolta punctele forte.",
        "gym": "Mergând constant la sală",
        "reading": "Citind în fiecare zi în această săptămână",
        "openingUp": "Deschiderea către oameni mai mult",
        "calm": "Rămâi calm sub presiune",
        "morningRoutine": "Menținerea unei rutine de dimineață",
        "perseverance": "Trecând prin momente dificile"
      },
      "research": {
        "title": "Bazat pe\npsihologie",
        "body": "Cercetările arată că jurnalul reflectiv îmbunătățește conștientizarea emoțională și bunăstarea pe termen lung.",
        "citation": "Advances in Psychiatric Treatment, 2005",
        "learnMore": "Află mai multe"
      },
      "auth": {
        "createAccount": "Creați un cont",
        "createYourAccount": "Creați-vă contul",
        "subtitle": "Selectați o opțiune pentru a începe",
        "postPurchaseSubtitle": "Salvați-vă intrările și accesați-le pe toate dispozitivele",
        "apple": "Continuați cu Apple",
        "google": "Continuați cu Google",
        "email": "Continuați cu e-mailul",
        "signInPrompt": "Aveți deja un cont?",
        "appleFailed": "Apple Conectarea a eșuat",
        "googleFailed": "Google Conectarea a eșuat",
        "genericError": "A apărut o eroare"
      },
      "vibe": {
        "title": "Alege-ți vibrația",
        "dark": "Întunecat",
        "light": "Luminos",
        "sunset": "Apus de soare",
        "vibrant": "Vibrant",
        "ocean": "Ocean",
        "midnight": "Miezul nopţii"
      },
      "questions": {
        "name": {
          "title": "Cum te numești?",
          "subtitle": "Vom folosi acest lucru pentru a vă personaliza experiența.",
          "placeholder": "Introduceți numele dvs"
        },
        "referral": {
          "title": "Unde ai auzit de noi?",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "Prietene",
          "other": "Alte"
        },
        "goal": {
          "title": "Care este scopul tău principal acum?",
          "mood": "Îmbunătățiți starea de spirit",
          "stress": "Reduce Stresul",
          "habits": "Construiește obiceiuri",
          "clarity": "Obțineți claritate"
        },
        "research": {
          "title": "Întemeiat pe psihologie",
          "subtitle": "Cercetările arată că jurnalul reflectiv îmbunătățește conștientizarea emoțională și bunăstarea pe termen lung.",
          "badge": "Cambridge University",
          "screenTitle": "Insight se bazează pe psihologie",
          "body": "Jurnalul este legat de o mai bună conștientizare emoțională și de bunăstare mentală."
        },
        "frequency": {
          "title": "Cât de des vrei să reflectezi?",
          "daily": "Zilnic",
          "weekly": "Săptămânal",
          "asNeeded": "După cum este nevoie"
        },
        "experience": {
          "title": "De cât timp faci jurnal?",
          "new": "Sunt nou în jurnal",
          "underSixMonths": "< 6 luni",
          "sixToTwentyFourMonths": "6-24 luni",
          "twoPlusYears": "2+ ani"
        },
        "wellbeing": {
          "title": "Cum ți-ai evalua bunăstarea zilnică?",
          "subtitle": "Pe o scară de la 1 la 10, unde vă simțiți de obicei?",
          "typicalDay": "ZI TIPICĂ"
        },
        "stressResponse": {
          "title": "Când ești sub presiune, ce ai tendința de a face?",
          "ruminate": "Rumegă sau spirală",
          "selfBlame": "Da vina pe mine",
          "fixate": "Fixează-te să o faci perfect",
          "stepBack": "Întrerupeți și regrupați"
        },
        "selfTalk": {
          "title": "Cum ai descrie vocea ta interioară?",
          "critical": "Adesea dur sau judecător",
          "mixed": "Depinde de zi",
          "supportive": "În mare parte de susținere"
        },
        "coping": {
          "title": "Când emoțiile sunt copleșitoare, ce te ajută cel mai mult?",
          "social": "Vorbind",
          "physical": "Mișcându-mi corpul",
          "expressive": "Jurnal sau muncă creativă",
          "solitude": "Timp singur pentru reîncărcare"
        },
        "change": {
          "title": "Cum reacționați de obicei la schimbările mari?",
          "resistant": "Rezistă la început, apoi adaptează-te",
          "anxious": "Simțiți-vă anxioasă, dar treceți",
          "embrace": "Acceptați provocarea",
          "support": "Am nevoie de mult sprijin"
        },
        "motivation": {
          "title": "Ce te determină să continui atunci când lucrurile se îngreunează?",
          "fear": "Frica de eșec sau de a dezamăgi pe alții",
          "external": "Recompense externe sau recunoaștere",
          "values": "Valori interne și scop",
          "passion": "Dragoste pentru ceea ce fac"
        },
        "relationships": {
          "title": "În relațiile apropiate, ce tipar apare pentru tine?",
          "anxious": "Am nevoie de multă liniște",
          "avoidant": "Mă retrag când lucrurile devin intense",
          "fearful": "Alternez între a împinge și a mă agăța",
          "secure": "Mă simt în siguranță și confortabil"
        },
        "conflict": {
          "title": "Când există tensiune sau conflict, de obicei...",
          "avoid": "Evitați-l cu orice preț",
          "accommodate": "Încercați să o neteziți sau vă rog",
          "compete": "Împingeți pentru a câștiga sau dovedi punctul meu de vedere",
          "collaborate": "Abordați-o calm și direct"
        },
        "rest": {
          "title": "Cum arată odihna pentru tine?",
          "guilt": "Mă lupt să mă odihnesc — mă simt vinovat",
          "solitude": "Am nevoie de singurătate totală",
          "social": "Mă reîncarc prin conexiune socială",
          "active": "Mă odihnesc făcând activități calmante"
        },
        "identitySource": {
          "title": "De unde îți derivi cel mai mult simțul identității?",
          "achievement": "Realizările și succesul meu",
          "relationships": "Relațiile și conexiunile mele",
          "values": "Valorile și credințele mele",
          "expression": "Creativitatea sau autoexprimarea mea"
        },
        "failure": {
          "title": "Când eșuezi sau faci o greșeală, care este prima ta reacție?",
          "shame": "Simt că nu sunt suficient de bun",
          "defensive": "Sunt defensiv sau dau vina pe factorii externi",
          "analytical": "Analizez ce a mers prost",
          "growth": "O văd ca pe o oportunitate de învățare"
        },
        "awareness": {
          "title": "Cât de conștient ești de emoțiile tale în acest moment?",
          "low": "De multe ori nu observ decât mai târziu",
          "moderate": "Le simt, dar nu le pot numi întotdeauna",
          "high": "Pot identifica majoritatea emoțiilor pe măsură ce se întâmplă",
          "veryHigh": "Sunt foarte adaptat la schimbările subtile"
        },
        "decisions": {
          "title": "Când iei decizii importante, ai tendința să...",
          "overthink": "Gândește-te prea mult și rămâne blocat în paralizia analizei",
          "intuitive": "Mergi cu instinctul meu",
          "external": "Căutați multe sfaturi de la alții",
          "systematic": "Cântăriți în mod sistematic argumentele pro/contra"
        },
        "gender": {
          "title": "Cum te identifici?",
          "subtitle": "Folosim acest lucru doar pentru a personaliza informații.",
          "woman": "Femeie",
          "man": "Om",
          "nonBinary": "Non-binar",
          "preferNot": "Prefer să nu spun"
        },
        "apaStudy": "📘 Scrisul expresiv stimulează procesarea emoțională — APA Psychology Review",
        "insightsWith": "OBȚINE PERSPECTIVE CU"
      },
      "quizIntro": {
        "title": "Ajutați-ne să vă înțelegem obiceiurile",
        "description": "Întrebări opționale pentru a vă personaliza experiența",
        "questions": "întrebări",
        "minutes": "minute",
        "private": "privat",
        "accurateInsights": "Informații mai precise",
        "recommendations": "Recomandări personalizate",
        "patternTracking": "Urmărire mai bună a modelelor"
      },
      "analyzing": {
        "emotionalPatterns": "Analizarea tiparelor emoționale",
        "responses": "Procesarea răspunsurilor dvs",
        "stressMarkers": "Identificarea markerilor de stres",
        "personalPlan": "Construiește-ți planul personal",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "Modelul dvs. principal",
        "perfectionism": "Perfecţionism",
        "anxiety": "Anxietate",
        "selfCompassion": "Lipsa de autocompasiune",
        "boundaries": "Lipsa limitelor",
        "selfEsteem": "Stimă de sine scazută",
        "descriptions": {
          "perfectionism": "Perfecționismul te poate menține încordat și blocat. Te împinge să urmărești certitudinea în loc să te simți terminat.",
          "anxiety": "Anxietatea vine adesea dintr-o minte care caută prea des pericole. Te poate lăsa tensionat chiar și atunci când ești în siguranță.",
          "selfCompassion": "O autocompasiune scăzută înseamnă să fii mai dur cu tine decât ai fi cu cineva pe care-l iubești. Asta face ca creșterea să se simtă mai grea decât trebuie.",
          "boundaries": "Granițele slabe pot veni din teama de conflict sau dezamăgirea oamenilor. În timp, asta te lasă epuizat și îndepărtat de propriile nevoi.",
          "selfEsteem": "Stima de sine scazuta iti poate face mintea sa se fixeze pe ceea ce simte lipsa. Asta păstrează o imagine de sine distorsionată."
        },
        "evolution": "Vom urmări cum evoluează acest lucru și vă vom ajuta să treceți peste el."
      },
      "summary": {
        "title": "Ești gata!",
        "mood": "Vă vom ajuta să vă îmbunătățiți starea de spirit cu reflecții ghidate și perspective.",
        "stress": "Vă vom ajuta să reduceți stresul cu reflecții ghidate și perspective.",
        "habits": "Vă vom ajuta să vă construiți obiceiuri cu reflecții ghidate și perspective.",
        "clarity": "Vă vom ajuta să obțineți claritate cu reflecții ghidate și perspective.",
        "default": "Spațiul tău personal de reflecție este gata. Să-ți începem călătoria."
      },
      "showcase": {
        "label": "ÎNCERCAȚI",
        "title": "Scrie liber.\nObțineți claritate.",
        "entry": "Intrarea dvs",
        "placeholder": "Începe să scrii cum te simți...",
        "pickPrompt": "Sau alegeți o solicitare",
        "prompts": {
          "overwhelmed": "M-am simțit copleșit de muncă în ultima vreme...",
          "outside": "Astăzi am observat că sunt mai fericit după ce am ieșit afară",
          "procrastinating": "Continui să amân lucrurile și nu știu sigur de ce",
          "grateful": "Azi s-a întâmplat ceva care m-a făcut cu adevărat recunoscător"
        },
        "thinking": "Insight se gândește...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "Se pare că porți multe acum. Recunoașterea acestui sentiment este primul pas — Insight vă poate ajuta să urmăriți aceste tipare și să găsiți ceea ce vă aduce ușurare. 💜",
          "positive": "E o observație frumoasă. Observați ceea ce vă ridică starea de spirit este puternic – Insight vă va ajuta să construiți pe aceste modele pozitive în timp. ✨",
          "procrastination": "Amânarea are adesea rădăcini mai adânci decât credem. Jurnalul poate dezvălui emoțiile ascunse din spatele ei — Insight vă va ajuta să înțelegeți și să depășiți aceste blocaje. 🔑",
          "sadness": "Vă mulțumesc că ați împărtășit asta. Exprimarea sentimentelor dificile este curajos și vindecător. Insight este aici pentru a vă asculta și pentru a vă ajuta să navigați prin aceste momente. 💙",
          "default": "Vă mulțumim pentru împărtășire. Fiecare intrare este un pas către o mai profundă înțelegere de sine. Insight vă va ajuta să descoperiți modele, să vă urmăriți creșterea și să obțineți claritate în timp. 💜"
        }
      },
      "privacy": {
        "title": "Notele dvs. sunt complet private",
        "subtitle": "Folosim criptare end-to-end pentru a păstra în siguranță înregistrările din jurnal. Numai tu le poți citi.",
        "encryption": "Criptare AES-256",
        "passwordKey": "Parola dvs. este cheia",
        "cannotRead": "Nu putem citi intrările dvs"
      },
      "notifications": {
        "title": "Activați notificările",
        "subtitle": "Profitați la maximum de Insight rămânând la curent cu ceea ce se întâmplă.",
        "allow": "Permite notificări",
        "skip": "Sari peste moment →",
        "permissionTitle": "Nu uitați să reflectați cu notificări",
        "permissionRequest": "Insight AI ar dori să vă trimită",
        "permissionType": "Notificări",
        "dontAllow": "Nu permite"
      },
      "rateUs": {
        "title": "Evaluează-ne cu 5 stele",
        "subtitle": "Ajută-ne să răspândim mesajul vieții conștiente și al creșterii personale",
        "testimonials": {
          "first": "Insight a schimbat complet modul în care îmi înțeleg emoțiile. Perspectivele AI sunt incredibil de precise și utile.",
          "second": "Această aplicație m-a ajutat să identific modele pe care nu le-am observat niciodată înainte. E ca și cum aș avea un terapeut în buzunar.",
          "third": "Reflecțiile și intuițiile zilnice au devenit o parte esențială a rutinei mele de îngrijire personală."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "Înțelege-te mai bine\ncu Insight",
          "growth": "Urmărește-ți evoluția\nși progresul",
          "reflect": "Reflectează mai profund,\ntrăiește mai bine",
          "mira": "Vorbește cu Mira",
          "findWhatWorks": "Găsește ce funcționează"
        },
        "trial": "Proba de 3 zile",
        "weekly": "Săptămânal",
        "monthly": "Lunar",
        "yearly": "Anual",
        "save": "Economisiți 73%",
        "perDay": "{{price}} / zi",
        "perWeek": "{{price}} pe săptămână",
        "perMonth": "{{price}} pe lună",
        "perYear": "{{price}} pe an",
        "whatYouGet": "Ce primesti:",
        "benefits": {
          "unlimited": "Informații nelimitate din jurnal bazate pe inteligență artificială",
          "patterns": "Detecție profundă și declanșare",
          "summaries": "Rezumate săptămânale personalizate",
          "playbook": "Manual de creștere și planuri de acțiune"
        },
        "testimonials": {
          "first": "Insight a schimbat complet modul în care îmi înțeleg emoțiile. Perspectivele AI sunt incredibil de precise și utile.",
          "second": "Solicitările de jurnal sunt atent, iar urmărirea modelelor mă ajută să-mi văd creșterea în timp.",
          "third": "Cea mai bună aplicație de sănătate mintală pe care am folosit-o. AI-ul simte că vorbesc cu un terapeut care mă înțelege cu adevărat.",
          "fourth": "Îmi place cum leagă obiceiurile mele zilnice de tiparele mele de dispoziție. Perspective revelatoare în fiecare săptămână.",
          "fifth": "Funcția de joc cu strategii personalizate a schimbat jocul pentru anxietatea mea."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "Fără angajament, anulați oricând.",
        "startJourney": "Începe-mi călătoria astăzi",
        "restorePurchase": "Restabiliți achiziția",
        "terms": "Termeni și condiții",
        "privacyPolicy": "Politica de confidențialitate",
        "alerts": {
          "otherAccountTitle": "Abonament găsit pe alt cont",
          "otherAccountBody": "Acest abonament aparține unui alt cont pe acest dispozitiv. Vă rugăm să vă conectați la acel cont pentru a utiliza funcțiile Pro.",
          "otherAccountPurchaseBody": "Un abonament Pro este activ pe alt cont pe acest dispozitiv. Conectați-vă la acel cont pentru a utiliza funcțiile Pro sau cumpărați un nou abonament pentru acest cont.",
          "purchaseSuccessTitle": "Achiziție reușită! 🎉",
          "purchaseSuccessBody": "Acum aveți acces la informații AI nelimitate și la toate funcțiile Pro.",
          "inactiveTitle": "Abonamentul nu este activ",
          "inactiveBody": "Achiziția dvs. nu a putut fi confirmată. Vă rugăm să contactați asistența dacă acest lucru persistă.",
          "comingSoonTitle": "Abonamente în curând",
          "comingSoonBody": "Se creează abonamente mobile. Puteți continua să utilizați aplicația și să vă abonați mai târziu pe web la myinsightai.app",
          "continueToApp": "Continuați la aplicație",
          "alreadySubscribedTitle": "Deja abonat",
          "alreadySubscribedBody": "Aveți deja un abonament Pro activ. Bucurați-vă de funcțiile premium!",
          "existsTitle": "Abonamentul există deja",
          "existsBody": "Un abonament a fost achiziționat anterior pe acest dispozitiv cu un alt cont. Pentru a utiliza funcțiile Pro, vă rugăm să vă conectați la contul care a achiziționat inițial abonamentul.\n\nDacă credeți că aceasta este o eroare, încercați să restabiliți achizițiile sau contactați asistența.",
          "tryRestore": "Încercați Restaurare",
          "purchaseFailed": "Achiziție eșuată",
          "purchaseError": "Eroare: {{message}}\n\nCod: {{code}}\n\nVă rugăm să verificați:\n1. Contul Sandbox este conectat (Setări > App Store)\n2. Produsele sunt configurate în App Store Connect\n3. Încercați din nou peste câteva momente",
          "noPurchasesTitle": "Nu au fost găsite achiziții",
          "noPurchasesBody": "Nu au fost găsite abonamente active pentru acest Apple ID.",
          "restoreFailed": "Restaurarea a eșuat",
          "restoreError": "Nu s-au putut restabili achizițiile: {{message}}",
          "unknown": "necunoscut",
          "ok": "Bine"
        }
      },
      "postPurchase": {
        "title": "Bun venit la Insight",
        "subtitle": "Ești gata cu Pro",
        "analysis": "Analiza jurnalului bazată pe inteligență artificială",
        "privateEntries": "Intrări private și criptate",
        "growth": "Urmăriți-vă creșterea în timp",
        "accountInfo": "Creați un cont pentru a vă salva intrările și pentru a le accesa pe toate dispozitivele."
      },
      "analysisComplete": {
        "namedTitle": "{{name}}, planul dvs. personal este gata",
        "title": "Ești gata",
        "reassurance": "Spațiul tău este gata."
      },
      "aiConsent": {
        "title": "Activați analiza AI?",
        "subtitle": "Obțineți informații personalizate din înregistrările din jurnal folosind tehnologia AI",
        "dataTitle": "Ce date sunt trimise",
        "dataBody": "Când atingeți „Analizați” pe o intrare de jurnal, trimitem conținutul text către serviciul nostru AI pentru analiză.",
        "entryText": "Textul înregistrării în jurnal",
        "noIdentifiers": "Nu există elemente de identificare personale (nume, e-mail etc.)",
        "analyzeOnly": "Doar când atingeți butonul „Analizați”.",
        "recipientTitle": "Cine primește datele dvs",
        "recipientIntro": "Folosim ",
        "providerName": "Groq",
        "recipientCompany": " (o companie de infrastructură AI) care rulează modelul lingvistic ",
        "modelName": "Llama 3",
        "recipientModelTail": " pentru a analiza înregistrările din jurnal.",
        "recipientPrivacy": "Groq vă prelucrează datele conform politicii de confidențialitate și nu vă folosește datele pentru a antrena modele AI.",
        "protectionTitle": "Cum sunt protejate datele dvs",
        "encrypted": "Toate datele sunt criptate în tranzit (HTTPS/TLS)",
        "secureStorage": "Intrările dvs. sunt stocate în siguranță în baza de date privată",
        "revoke": "Puteți revoca oricând consimțământul din Setări",
        "optional": "Funcțiile AI sunt opționale — poți ține un jurnal fără ele",
        "notice": "Acceptând, sunteți de acord să trimiteți textul înregistrării din jurnal către Groq pentru analiză AI atunci când atingeți „Analizează”. Consultați Politica noastră de confidențialitate pentru detalii complete.",
        "decline": "Refuză",
        "accept": "Acceptați și continuați"
      }
    }
  },
  "az": {
    "onboarding": {
      "welcome": "Insight-ə xoş gəlmisiniz",
      "getStarted": "Başlayın",
      "alreadyHaveAccount": "Artıq hesabınız var?",
      "signIn": "Daxil ol",
      "reflectGrow": "Düşün. İnkişaf et.",
      "valuableInsights": "Dəyərli fikirlər əldə edin",
      "reflectionToSteps": "Düşüncəni növbəti addımlara çevirin.",
      "weekAtGlance": "Həftənizi bir baxışda yoxlayın",
      "skip": "Keç",
      "skipForNow": "Hələlik keçin",
      "valueProp": {
        "title": "Insight düşüncələri aydınlığa çevirir",
        "mentalNoise": "Zehni səs-küy",
        "understanding": "Anlamaq",
        "captureFeelings": "Nə hiss etdiyinizi çəkin",
        "understandPatterns": "Zamanla nümunələri anlayın",
        "gainClarity": "Aydınlıq əldə edin - qarışıqlıq deyil"
      },
      "patterns": {
        "eyebrow": "AI ilə təchiz edilmişdir",
        "title": "Nümunələrinizi izləyin\nzamanla",
        "subtitle": "Insight sizə nəyin mane olduğunu müəyyənləşdirir və üzərində işləmək üçün əsas prioritetlərinizi ortaya qoyur.",
        "adjustSleep": "Yuxu cədvəlini tənzimləyin",
        "selfCompassion": "Özünüzə şəfqət göstərməyi daha çox məşq edin",
        "reduceScreenTime": "Yatmadan əvvəl ekranda qalma vaxtını azaldın",
        "manageStress": "Stressi proaktiv şəkildə idarə edin",
        "setBoundaries": "Daha aydın sərhədlər təyin edin",
        "challengeSelfTalk": "Mənfi öz-özünə danışmağa meydan oxuyun",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "Böyüməyi qeyd edin",
        "title": "Uğurlarınızı da\nqeyd edin",
        "subtitle": "Insight həmçinin nəyin yaxşı getdiyini görür ki, siz öz güclü tərəflərinizi inkişaf etdirə biləsiniz.",
        "gym": "Davamlı olaraq idman zalına getmək",
        "reading": "Bu həftə hər gün oxuyun",
        "openingUp": "İnsanlara daha çox açılır",
        "calm": "Təzyiq altında sakit qalmaq",
        "morningRoutine": "Səhər rejiminə riayət etmək",
        "perseverance": "Çətin anlardan keçmək"
      },
      "research": {
        "title": "Psixologiyaya\nəsaslanır",
        "body": "Tədqiqatlar göstərir ki, əks etdirən jurnallar emosional şüur ​​və uzunmüddətli rifahı yaxşılaşdırır.",
        "citation": "Advances in Psychiatric Treatment, 2005",
        "learnMore": "Ətraflı məlumat əldə edin"
      },
      "auth": {
        "createAccount": "Hesab yaradın",
        "createYourAccount": "Hesabınızı yaradın",
        "subtitle": "Başlamaq üçün seçim seçin",
        "postPurchaseSubtitle": "Daxiletmələrinizi yadda saxlayın və cihazlar arasında onlara daxil olun",
        "apple": "Apple ilə davam edin",
        "google": "Google ilə davam edin",
        "email": "E-poçtla davam edin",
        "signInPrompt": "Artıq hesabınız var?",
        "appleFailed": "Apple Giriş uğursuz oldu",
        "googleFailed": "Google Giriş uğursuz oldu",
        "genericError": "Xəta baş verdi"
      },
      "vibe": {
        "title": "Vibenizi seçin",
        "dark": "Qaranlıq",
        "light": "İşıqlı",
        "sunset": "Gün batımı",
        "vibrant": "Canlı",
        "ocean": "Okean",
        "midnight": "Gecə yarısı"
      },
      "questions": {
        "name": {
          "title": "sənin adın nədir?",
          "subtitle": "Təcrübənizi fərdiləşdirmək üçün bundan istifadə edəcəyik.",
          "placeholder": "Adınızı daxil edin"
        },
        "referral": {
          "title": "Haqqımızda haradan eşitmisən?",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "dost",
          "other": "Digər"
        },
        "goal": {
          "title": "Hazırda əsas məqsədiniz nədir?",
          "mood": "Əhval-ruhiyyəni yaxşılaşdırın",
          "stress": "Stressi azaldın",
          "habits": "Vərdişlər qurmaq",
          "clarity": "Aydınlıq əldə edin"
        },
        "research": {
          "title": "Psixologiyaya əsaslanır",
          "subtitle": "Tədqiqatlar göstərir ki, əks etdirən jurnallar emosional şüur ​​və uzunmüddətli rifahı yaxşılaşdırır.",
          "badge": "Cambridge University",
          "screenTitle": "Insight psixologiyaya əsaslanır",
          "body": "Jurnal daha yaxşı emosional şüur ​​və zehni rifahla əlaqələndirilir."
        },
        "frequency": {
          "title": "Nə qədər tez-tez əks etdirmək istəyirsiniz?",
          "daily": "Gündəlik",
          "weekly": "Həftəlik",
          "asNeeded": "Lazım olduğu kimi"
        },
        "experience": {
          "title": "Neçə vaxtdır gündəlik yazırsan?",
          "new": "Mən jurnal yazmaqda yeniyəm",
          "underSixMonths": "< 6 ay",
          "sixToTwentyFourMonths": "6-24 ay",
          "twoPlusYears": "2+ il"
        },
        "wellbeing": {
          "title": "Gündəlik rifahınızı necə qiymətləndirərdiniz?",
          "subtitle": "1-10 miqyasında, adətən özünüzü harada hiss edirsiniz?",
          "typicalDay": "TİPİK GÜN"
        },
        "stressResponse": {
          "title": "Təzyiq altında olduğunuz zaman nə etməyə meyl edirsiniz?",
          "ruminate": "Ruminasiya və ya spiral",
          "selfBlame": "Özümü günahlandır",
          "fixate": "Mükəmməl olmaq üçün qərar verin",
          "stepBack": "Fasilə və yenidən qruplaşdırın"
        },
        "selfTalk": {
          "title": "Daxili səsinizi necə təsvir edərdiniz?",
          "critical": "Tez-tez sərt və ya mühakimə",
          "mixed": "Gündən asılıdır",
          "supportive": "Əsasən dəstəkləyən"
        },
        "coping": {
          "title": "Emosiyalar həddən artıq ağırlaşdıqda, sizə ən çox nə kömək edir?",
          "social": "Danışmaq",
          "physical": "Bədənimi hərəkət etdirərək",
          "expressive": "Jurnal və ya yaradıcı iş",
          "solitude": "Doldurmaq üçün tək vaxt"
        },
        "change": {
          "title": "Böyük dəyişikliklərə adətən necə cavab verirsiniz?",
          "resistant": "Əvvəlcə müqavimət göstərin, sonra uyğunlaşın",
          "anxious": "Narahat olun, amma itələyin",
          "embrace": "Problemi qəbul edin",
          "support": "Çoxlu dəstəyə ehtiyac var"
        },
        "motivation": {
          "title": "İşlər çətinləşəndə ​​sizi davam etdirməyə nə vadar edir?",
          "fear": "Uğursuzluq və ya başqalarını ruhdan salmaq qorxusu",
          "external": "Xarici mükafatlar və ya tanınma",
          "values": "Daxili dəyərlər və məqsəd",
          "passion": "Etdiyime sevgi"
        },
        "relationships": {
          "title": "Yaxın münasibətlərdə sizin üçün hansı nümunə görünür?",
          "anxious": "Çox arxayınlığa ehtiyacım var",
          "avoidant": "İşlər gərginləşəndə ​​kənara çəkilirəm",
          "fearful": "Mən itələmək və yapışmaq arasında dəyişirəm",
          "secure": "Özümü təhlükəsiz və rahat hiss edirəm"
        },
        "conflict": {
          "title": "Gərginlik və ya münaqişə olduqda, adətən...",
          "avoid": "Nəyin bahasına olursa olsun bundan çəkinin",
          "accommodate": "Onu hamarlaşdırmağa çalışın və ya xahiş edirəm",
          "compete": "Qazanmaq və ya fikrimi sübut etmək üçün itələyin",
          "collaborate": "Buna sakit və birbaşa müraciət edin"
        },
        "rest": {
          "title": "İstirahət sizin üçün necə görünür?",
          "guilt": "İstirahət etmək üçün mübarizə aparıram - özümü günahkar hiss edirəm",
          "solitude": "Mənə tam təklik lazımdır",
          "social": "Mən sosial əlaqə vasitəsilə dolduruluram",
          "active": "Sakitləşdirici fəaliyyətlər edərək dincəlirəm"
        },
        "identitySource": {
          "title": "Şəxsiyyət hissini ən çox haradan əldə edirsiniz?",
          "achievement": "Uğurlarım və nailiyyətlərim",
          "relationships": "Mənim əlaqələrim və əlaqələrim",
          "values": "Mənim dəyərlərim və inanclarım",
          "expression": "Mənim yaradıcılığım və ya özünü ifadə etmə qabiliyyətim"
        },
        "failure": {
          "title": "Uğursuz və ya səhv etdiyiniz zaman ilk reaksiyanız nə olur?",
          "shame": "Mənə elə gəlir ki, kifayət qədər yaxşı deyiləm",
          "defensive": "Mən müdafiəyə qalxıram və ya xarici amilləri günahlandırıram",
          "analytical": "Nəyin səhv olduğunu təhlil edirəm",
          "growth": "Mən bunu öyrənmə fürsəti kimi görürəm"
        },
        "awareness": {
          "title": "Hazırda hisslərinizi nə dərəcədə bilirsiniz?",
          "low": "Çox vaxt sonradan fərqinə varmıram",
          "moderate": "Mən onları hiss edirəm, amma həmişə adlarını çəkə bilmirəm",
          "high": "Mən hisslərin çoxunu baş verən kimi tanıya bilirəm",
          "veryHigh": "Mən incə dəyişikliklərə çox uyğunlaşıram"
        },
        "decisions": {
          "title": "Vacib qərarlar qəbul edərkən siz...",
          "overthink": "Həddindən artıq düşünmək və analiz iflicində ilişib qalmaq",
          "intuitive": "Mənim bağırsaq instinkti ilə get",
          "external": "Başqalarından çoxlu məsləhət alın",
          "systematic": "Müsbət / mənfi cəhətləri sistematik olaraq çəkin"
        },
        "gender": {
          "title": "Siz necə müəyyənləşdirirsiniz?",
          "subtitle": "Biz bundan yalnız anlayışları fərdiləşdirmək üçün istifadə edirik.",
          "woman": "qadın",
          "man": "Adam",
          "nonBinary": "Qeyri-ikili",
          "preferNot": "deməməyə üstünlük verin"
        },
        "apaStudy": "📘 Ekspressiv yazı emosional emal prosesini gücləndirir — APA Psychology Review",
        "insightsWith": "İSTİFADƏ EDİN"
      },
      "quizIntro": {
        "title": "Vərdişlərinizi anlamağa kömək edin",
        "description": "Təcrübənizi fərdiləşdirmək üçün əlavə suallar",
        "questions": "suallar",
        "minutes": "dəqiqə",
        "private": "özəl",
        "accurateInsights": "Daha dəqiq fikirlər",
        "recommendations": "Fərdi tövsiyələr",
        "patternTracking": "Daha yaxşı nümunə izləmə"
      },
      "analyzing": {
        "emotionalPatterns": "Emosional nümunələrin təhlili",
        "responses": "Cavablarınız işlənir",
        "stressMarkers": "Stress markerlərinin müəyyən edilməsi",
        "personalPlan": "Şəxsi planınızı qurmaq",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "Əsas nümunəniz",
        "perfectionism": "Perfektsionizm",
        "anxiety": "Narahatlıq",
        "selfCompassion": "Özünə mərhəmətin olmaması",
        "boundaries": "Sərhədlərin olmaması",
        "selfEsteem": "Aşağı özünə hörmət",
        "descriptions": {
          "perfectionism": "Mükəmməllik sizi gərgin və ilişib saxlaya bilər. Bu, sizi bitmiş hiss etmək əvəzinə əminliyin arxasınca getməyə sövq edir.",
          "anxiety": "Narahatlıq çox vaxt təhlükəni tez-tez axtaran bir ağıldan gəlir. Təhlükəsiz olduğunuz zaman belə sizi gərgin edə bilər.",
          "selfCompassion": "Özünə mərhəmətin aşağı olması, sevdiyin birinə qarşı olduğun qədər özünə qarşı sərt olmaq deməkdir. Bu, böyümənin lazım olduğundan daha ağır olduğunu hiss edir.",
          "boundaries": "Zəif sərhədlər münaqişədən qorxmaqdan və ya insanları məyus etməkdən yarana bilər. Vaxt keçdikcə bu, sizi boşaldıb öz ehtiyaclarınızdan uzaqlaşdırır.",
          "selfEsteem": "Özünə hörmətin aşağı olması zehnini əskik hiss edən şeylərə yönəldə bilər. Bu, təhrif olunmuş mənlik imicini yerində saxlayır."
        },
        "evolution": "Biz bunun necə inkişaf etdiyini izləyəcəyik və bununla işləməyinizə kömək edəcəyik."
      },
      "summary": {
        "title": "Hər şey hazırsınız!",
        "mood": "Rəhbərləşdirilmiş düşüncələr və fikirlərlə əhvalınızı yaxşılaşdırmağa kömək edəcəyik.",
        "stress": "Rəhbərləşdirilmiş düşüncələr və anlayışlarla stressi azaltmağa kömək edəcəyik.",
        "habits": "Biz sizə istiqamətləndirilmiş düşüncələr və anlayışlarla vərdişlər yaratmağa kömək edəcəyik.",
        "clarity": "Rəhbərləşdirilmiş düşüncələr və anlayışlarla aydınlıq əldə etməyə kömək edəcəyik.",
        "default": "Düşünmək üçün şəxsi məkanınız hazırdır. Səyahətinizə başlayaq."
      },
      "showcase": {
        "label": "SINAYIN",
        "title": "Sərbəst yazın.\nAydınlıq əldə edin.",
        "entry": "Girişiniz",
        "placeholder": "Hisslərinizi yazmağa başlayın...",
        "pickPrompt": "Və ya sorğu seçin",
        "prompts": {
          "overwhelmed": "Son vaxtlar özümü işdən yorğun hiss edirəm...",
          "outside": "Bu gün bayıra çıxandan sonra daha xoşbəxt olduğumu gördüm",
          "procrastinating": "Mən hər şeyi təxirə salmağa davam edirəm və səbəbini bilmirəm",
          "grateful": "Bu gün məni həqiqətən minnətdar edən bir şey oldu"
        },
        "thinking": "Insight düşünür...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "Deyəsən, indi çox şey daşıyırsan. Bu hissi tanımaq ilk addımdır — Insight bu nümunələri izləməyə və sizə rahatlıq gətirənləri tapmağa kömək edə bilər. 💜",
          "positive": "Bu gözəl müşahidədir. Əhval-ruhiyyənizi nəyin qaldırdığını fərq etmək güclüdür — Insight zamanla bu müsbət nümunələr üzərində qurmağınıza kömək edəcək. ✨",
          "procrastination": "Süründürməçilik çox vaxt düşündüyümüzdən daha dərin köklərə malikdir. Jurnallar onun arxasında gizlənmiş emosiyaları aşkar edə bilər — Insight sizə bu blokları anlamağa və aradan qaldırmağa kömək edəcək. 🔑",
          "sadness": "Bunu paylaşdığınız üçün təşəkkür edirik. Çətin hissləri ifadə etmək cəsarətli və şəfalıdır. Insight bu anları dinləmək və sizə kömək etmək üçün buradadır. 💙",
          "default": "Paylaşdığınız üçün təşəkkür edirik. Hər giriş daha dərin özünü dərk etməyə doğru bir addımdır. Insight sizə nümunələri aşkar etməyə, böyümənizi izləməyə və zamanla aydınlıq əldə etməyə kömək edəcək. 💜"
        }
      },
      "privacy": {
        "title": "Qeydləriniz tam məxfidir",
        "subtitle": "Jurnal qeydlərinizi təhlükəsiz saxlamaq üçün başdan sona şifrələmədən istifadə edirik. Onları yalnız siz oxuya bilərsiniz.",
        "encryption": "AES-256 şifrələmə",
        "passwordKey": "Parolunuz açardır",
        "cannotRead": "Yazılarınızı oxuya bilmirik"
      },
      "notifications": {
        "title": "Bildirişləri yandırın",
        "subtitle": "Baş verənlərdən xəbərdar olmaqla Insight-dən maksimum yararlanın.",
        "allow": "Bildirişlərə icazə verin",
        "skip": "Hələlik keçin →",
        "permissionTitle": "Bildirişlərlə əks etdirməyi unutmayın",
        "permissionRequest": "Insight AI sizə göndərmək istəyir",
        "permissionType": "Bildirişlər",
        "dontAllow": "İcazə verməyin"
      },
      "rateUs": {
        "title": "Bizi 5 Ulduzla qiymətləndirin",
        "subtitle": "Bizə şüurlu həyat və şəxsi inkişaf mesajını yaymağa kömək edin",
        "testimonials": {
          "first": "Insight mənim duyğularımı başa düşməyimi tamamilə dəyişdi. AI anlayışları inanılmaz dərəcədə dəqiq və faydalıdır.",
          "second": "Bu proqramlar əvvəllər heç görmədiyim nümunələri müəyyən etməyə kömək etdi. Sanki cibimdə terapevt var.",
          "third": "Gündəlik düşüncələr və fikirlər mənim özümə qulluq rutinimin vacib hissəsinə çevrildi."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "Insight ilə\nözünüzü daha yaxşı anlayın",
          "growth": "İnkişafınızı və\ntərəqqinizi izləyin",
          "reflect": "Daha dərindən düşünün,\ndaha yaxşı yaşayın",
          "mira": "Mira ilə danışın",
          "findWhatWorks": "Nəyin işlədiyini tapın"
        },
        "trial": "3 günlük sınaq",
        "weekly": "Həftəlik",
        "monthly": "Aylıq",
        "yearly": "İllik",
        "save": "73% qənaət edin",
        "perDay": "{{price}} / gün",
        "perWeek": "{{price}} həftədə",
        "perMonth": "Ayda {{price}}",
        "perYear": "İllik {{price}}",
        "whatYouGet": "Nə əldə edirsiniz:",
        "benefits": {
          "unlimited": "Limitsiz süni intellektlə işləyən jurnal anlayışları",
          "patterns": "Dərin nümunə və tətik aşkarlanması",
          "summaries": "Fərdiləşdirilmiş həftəlik xülasələr",
          "playbook": "Böyümə kitabı və fəaliyyət planları"
        },
        "testimonials": {
          "first": "Insight mənim duyğularımı başa düşməyimi tamamilə dəyişdi. AI anlayışları inanılmaz dərəcədə dəqiq və faydalıdır.",
          "second": "Jurnal yazmaq istəkləri düşünülmüşdür və nümunə izləmə mənə zamanla böyüməmi görməyə kömək edir.",
          "third": "İstifadə etdiyim ən yaxşı psixi sağlamlıq proqramı. Süni intellekt məni həqiqətən qəbul edən bir terapevtlə danışmaq kimi hiss edir.",
          "fourth": "Bunun gündəlik vərdişlərimi əhvalımla necə əlaqələndirdiyini sevirəm. Hər həftə göz açan fikirlər.",
          "fifth": "Fərdiləşdirilmiş strategiyaları olan oyun kitabı xüsusiyyəti mənim narahatlığım üçün oyun dəyişdirici oldu."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "Öhdəlik yoxdur, istənilən vaxt ləğv edin.",
        "startJourney": "Bu gün səyahətimə başlayın",
        "restorePurchase": "Satınalmanı bərpa edin",
        "terms": "Qaydalar və Şərtlər",
        "privacyPolicy": "Məxfilik Siyasəti",
        "alerts": {
          "otherAccountTitle": "Abunəlik Başqa Hesabda Tapıldı",
          "otherAccountBody": "Bu abunəlik bu cihazda fərqli hesaba məxsusdur. Pro xüsusiyyətlərindən istifadə etmək üçün həmin hesaba daxil olun.",
          "otherAccountPurchaseBody": "Pro abunəliyi bu cihazdakı fərqli hesabda aktivdir. Pro funksiyalarından istifadə etmək üçün həmin hesaba daxil olun və ya bu hesab üçün yeni abunə alın.",
          "purchaseSuccessTitle": "Satınalma Uğurlu! 🎉",
          "purchaseSuccessBody": "İndi limitsiz AI anlayışlarına və bütün Pro xüsusiyyətlərinə çıxışınız var.",
          "inactiveTitle": "Abunəlik aktiv deyil",
          "inactiveBody": "Satınalmanızı təsdiqləmək mümkün olmadı. Bu davam edərsə, dəstək xidməti ilə əlaqə saxlayın.",
          "comingSoonTitle": "Abunəliklər Tezliklə",
          "comingSoonBody": "Mobil abunəliklər qurulur. Siz proqramdan istifadə etməyə davam edə və sonra internetdə myinsightai.app ünvanında abunə ola bilərsiniz",
          "continueToApp": "Tətbiqə davam edin",
          "alreadySubscribedTitle": "Artıq Abunə Olunmuşdur",
          "alreadySubscribedBody": "Artıq aktiv Pro abunəliyiniz var. Premium xüsusiyyətlərinizdən həzz alın!",
          "existsTitle": "Abunəlik Artıq Mövcuddur",
          "existsBody": "Abunəlik əvvəllər bu cihazda fərqli hesabla alınıb. Pro xüsusiyyətlərindən istifadə etmək üçün, lütfən, abunəni ilkin satın almış hesaba daxil olun.\n\nBunun xəta olduğuna inanırsınızsa, satınalmaları bərpa etməyə çalışın və ya dəstək xidməti ilə əlaqə saxlayın.",
          "tryRestore": "Bərpa etməyə cəhd edin",
          "purchaseFailed": "Alış alınmadı",
          "purchaseError": "Səhv: {{message}}\n\nKod: {{code}}\n\nZəhmət olmasa yoxlayın:\n1. Sandbox hesabı daxil edilib (Parametrlər > App Store)\n2. Məhsullar App Store Connect-də konfiqurasiya edilmişdir\n3. Bir neçə dəqiqədən sonra yenidən cəhd edin",
          "noPurchasesTitle": "Satınalmalar tapılmadı",
          "noPurchasesBody": "Bu Apple ID üçün aktiv abunə tapılmadı.",
          "restoreFailed": "Bərpa edilmədi",
          "restoreError": "Satınalmaları bərpa etmək mümkün olmadı: {{message}}",
          "unknown": "naməlum",
          "ok": "OK"
        }
      },
      "postPurchase": {
        "title": "Insight-ə xoş gəlmisiniz",
        "subtitle": "Pro ilə hər şey hazırsınız",
        "analysis": "AI ilə işləyən jurnal təhlili",
        "privateEntries": "Şəxsi və şifrəli girişlər",
        "growth": "Zamanla böyümənizi izləyin",
        "accountInfo": "Daxiletmələrinizi saxlamaq və cihazlarda onlara daxil olmaq üçün hesab yaradın."
      },
      "analysisComplete": {
        "namedTitle": "{{name}}, şəxsi planınız hazırdır",
        "title": "Hazırsınız",
        "reassurance": "Məkanınız hazırdır."
      },
      "aiConsent": {
        "title": "AI təhlili aktiv edilsin?",
        "subtitle": "AI texnologiyasından istifadə edərək jurnal qeydlərinizdən fərdiləşdirilmiş məlumatlar əldə edin",
        "dataTitle": "Hansı məlumatlar göndərilir",
        "dataBody": "Jurnal girişində \"Təhlil et\" üzərinə kliklədiyiniz zaman mətn məzmununu təhlil üçün AI xidmətimizə göndəririk.",
        "entryText": "Jurnal giriş mətniniz",
        "noIdentifiers": "Şəxsi identifikator yoxdur (ad, e-poçt və s.)",
        "analyzeOnly": "Yalnız \"Təhlil et\" düyməsini kliklədikdə",
        "recipientTitle": "Məlumatlarınızı kim alır",
        "recipientIntro": "Biz ",
        "providerName": "Groq",
        "recipientCompany": " (AI infrastruktur şirkəti) tərəfindən idarə olunan ",
        "modelName": "Llama 3",
        "recipientModelTail": " dil modelindən jurnal qeydlərinizi təhlil etmək üçün istifadə edirik.",
        "recipientPrivacy": "Groq məlumatlarınızı məxfilik siyasətinə uyğun olaraq emal edir və AI modellərini öyrətmək üçün məlumatlarınızdan istifadə etmir.",
        "protectionTitle": "Məlumatlarınız necə qorunur",
        "encrypted": "Bütün məlumatlar tranzit zamanı şifrələnir (HTTPS/TLS)",
        "secureStorage": "Girişləriniz şəxsi məlumat bazanızda təhlükəsiz şəkildə saxlanılır",
        "revoke": "İstənilən vaxt Ayarlarda razılığı ləğv edə bilərsiniz",
        "optional": "Süni intellekt xüsusiyyətləri isteğe bağlıdır - onlar olmadan jurnal yaza bilərsiniz",
        "notice": "Qəbul etməklə, \"Təhlil et\" seçiminə toxunduğunuz zaman jurnal giriş mətninizi AI təhlili üçün Groq-ə göndərməyə razılaşırsınız. Tam təfərrüatlar üçün Məxfilik Siyasətimizə baxın.",
        "decline": "İmtina et",
        "accept": "Qəbul et və Davam et"
      }
    }
  },
  "nl": {
    "onboarding": {
      "welcome": "Welkom bij Insight",
      "getStarted": "Aan de slag",
      "alreadyHaveAccount": "Heeft u al een account?",
      "signIn": "Inloggen",
      "reflectGrow": "Reflecteer. Groei.",
      "valuableInsights": "Krijg waardevolle inzichten",
      "reflectionToSteps": "Zet reflectie om in volgende stappen.",
      "weekAtGlance": "Bekijk uw week in één oogopslag",
      "skip": "Overslaan",
      "skipForNow": "Overslaan voor nu",
      "valueProp": {
        "title": "Insight zet gedachten om in helderheid",
        "mentalNoise": "Geestelijk lawaai",
        "understanding": "Begrip",
        "captureFeelings": "Leg vast hoe je je voelt",
        "understandPatterns": "Begrijp patronen in de loop van de tijd",
        "gainClarity": "Zorg voor duidelijkheid, geen rommel"
      },
      "patterns": {
        "eyebrow": "Aangedreven door AI",
        "title": "Volg uw patronen\nna verloop van tijd",
        "subtitle": "Insight identificeert wat u tegenhoudt en brengt uw topprioriteiten aan het licht om aan te werken.",
        "adjustSleep": "Pas het slaapschema aan",
        "selfCompassion": "Oefen meer met zelfcompassie",
        "reduceScreenTime": "Verminder de schermtijd voor het slapengaan",
        "manageStress": "Beheer stress proactief",
        "setBoundaries": "Stel duidelijkere grenzen",
        "challengeSelfTalk": "Daag negatieve zelfpraat uit",
        "frequency": "x{{count}}"
      },
      "wins": {
        "eyebrow": "Vier de groei",
        "title": "Vier ook\nje successen",
        "subtitle": "Insight signaleert ook wat goed gaat, zodat u kunt voortbouwen op uw sterke punten.",
        "gym": "Regelmatig naar de sportschool gaan",
        "reading": "Deze week elke dag lezen",
        "openingUp": "Meer openstaan ​​voor mensen",
        "calm": "Kalm blijven onder druk",
        "morningRoutine": "Het handhaven van een ochtendroutine",
        "perseverance": "Moeilijke momenten doorstaan"
      },
      "research": {
        "title": "Gebaseerd op\npsychologie",
        "body": "Onderzoek toont aan dat reflectief dagboekschrijven het emotionele bewustzijn en het welzijn op de lange termijn verbetert.",
        "citation": "Advances in Psychiatric Treatment, 2005",
        "learnMore": "Meer informatie"
      },
      "auth": {
        "createAccount": "Maak een account aan",
        "createYourAccount": "Maak uw account aan",
        "subtitle": "Selecteer een optie om aan de slag te gaan",
        "postPurchaseSubtitle": "Sla uw gegevens op en open ze op verschillende apparaten",
        "apple": "Ga verder met Apple",
        "google": "Ga verder met Google",
        "email": "Ga verder met e-mail",
        "signInPrompt": "Heeft u al een account?",
        "appleFailed": "Apple Aanmelden mislukt",
        "googleFailed": "Google Aanmelden mislukt",
        "genericError": "Er is een fout opgetreden"
      },
      "vibe": {
        "title": "Kies jouw sfeer",
        "dark": "Donker",
        "light": "Licht",
        "sunset": "Zonsondergang",
        "vibrant": "Levendig",
        "ocean": "Oceaan",
        "midnight": "Middernacht"
      },
      "questions": {
        "name": {
          "title": "Hoe heet je?",
          "subtitle": "We gebruiken dit om uw ervaring te personaliseren.",
          "placeholder": "Voer uw naam in"
        },
        "referral": {
          "title": "Waar heb je over ons gehoord?",
          "instagram": "Instagram",
          "facebook": "Facebook",
          "tiktok": "TikTok",
          "youtube": "YouTube",
          "google": "Google",
          "friend": "Vriend",
          "other": "Ander"
        },
        "goal": {
          "title": "Wat is op dit moment je belangrijkste doel?",
          "mood": "Verbeter de stemming",
          "stress": "Verminder stress",
          "habits": "Gewoonten opbouwen",
          "clarity": "Krijg duidelijkheid"
        },
        "research": {
          "title": "Geworteld in de psychologie",
          "subtitle": "Onderzoek toont aan dat reflectief dagboekschrijven het emotionele bewustzijn en het welzijn op de lange termijn verbetert.",
          "badge": "Cambridge University",
          "screenTitle": "Insight is geworteld in de psychologie",
          "body": "Een dagboek bijhouden is gekoppeld aan een beter emotioneel bewustzijn en mentaal welzijn."
        },
        "frequency": {
          "title": "Hoe vaak wil je reflecteren?",
          "daily": "Dagelijks",
          "weekly": "Wekelijks",
          "asNeeded": "Zoals nodig"
        },
        "experience": {
          "title": "Hoe lang heb je een dagboek bijgehouden?",
          "new": "Ik ben nieuw met dagboekschrijven",
          "underSixMonths": "< 6 maanden",
          "sixToTwentyFourMonths": "6–24 maanden",
          "twoPlusYears": "2+ jaar"
        },
        "wellbeing": {
          "title": "Hoe zou u uw dagelijks welzijn beoordelen?",
          "subtitle": "Op een schaal van 1 tot 10, waar voelt u zich doorgaans?",
          "typicalDay": "TYPISCHE DAG"
        },
        "stressResponse": {
          "title": "Wat doe jij meestal als je onder druk staat?",
          "ruminate": "Herkauwend of spiraalvormig",
          "selfBlame": "Geef mezelf de schuld",
          "fixate": "Fixeer op het perfect krijgen ervan",
          "stepBack": "Pauzeer en hergroepeer"
        },
        "selfTalk": {
          "title": "Hoe zou je jouw innerlijke stem omschrijven?",
          "critical": "Vaak hard of veroordelend",
          "mixed": "Afhankelijk van de dag",
          "supportive": "Meestal ondersteunend"
        },
        "coping": {
          "title": "Als emoties overweldigend lijken, wat helpt je dan het meest?",
          "social": "Het doorpraten",
          "physical": "Mijn lichaam bewegen",
          "expressive": "Journaling of creatief werk",
          "solitude": "Tijd alleen om op te laden"
        },
        "change": {
          "title": "Hoe reageert u doorgaans op grote veranderingen?",
          "resistant": "Eerst weerstand bieden en dan aanpassen",
          "anxious": "Voel je angstig, maar zet door",
          "embrace": "Omarm de uitdaging",
          "support": "Veel steun nodig"
        },
        "motivation": {
          "title": "Wat drijft jou om door te gaan als het moeilijk wordt?",
          "fear": "Angst om te falen of anderen in de steek te laten",
          "external": "Externe beloningen of erkenning",
          "values": "Interne waarden en doel",
          "passion": "Liefde voor wat ik doe"
        },
        "relationships": {
          "title": "Welk patroon komt bij jou naar voren in hechte relaties?",
          "anxious": "Ik heb veel geruststelling nodig",
          "avoidant": "Ik trek me terug als de dingen intens worden",
          "fearful": "Ik wissel af tussen wegduwen en vasthouden",
          "secure": "Ik voel mij veilig en comfortabel"
        },
        "conflict": {
          "title": "Als er spanning of conflict is, ga je meestal...",
          "avoid": "Vermijd het ten koste van alles",
          "accommodate": "Probeer het glad te strijken, of alsjeblieft",
          "compete": "Push om te winnen of om mijn punt te bewijzen",
          "collaborate": "Pak het rustig en direct aan"
        },
        "rest": {
          "title": "Hoe ziet rust er voor jou uit?",
          "guilt": "Ik heb moeite om te rusten – ik voel me schuldig",
          "solitude": "Ik heb totale eenzaamheid nodig",
          "social": "Ik laad op via sociale verbinding",
          "active": "Ik rust uit door kalmerende activiteiten te doen"
        },
        "identitySource": {
          "title": "Waar ontleen jij het meest jouw identiteitsgevoel aan?",
          "achievement": "Mijn prestaties en succes",
          "relationships": "Mijn relaties en connecties",
          "values": "Mijn waarden en overtuigingen",
          "expression": "Mijn creativiteit of zelfexpressie"
        },
        "failure": {
          "title": "Als je faalt of een fout maakt, wat is dan je eerste reactie?",
          "shame": "Ik heb het gevoel dat ik niet goed genoeg ben",
          "defensive": "Ik word defensief of geef externe factoren de schuld",
          "analytical": "Ik analyseer wat er mis is gegaan",
          "growth": "Ik zie het als een leermogelijkheid"
        },
        "awareness": {
          "title": "Hoe bewust ben jij je van je emoties op dit moment?",
          "low": "Vaak merk ik het pas later",
          "moderate": "Ik voel ze, maar kan ze niet altijd benoemen",
          "high": "Ik kan de meeste emoties identificeren zodra ze zich voordoen",
          "veryHigh": "Ik ben erg afgestemd op subtiele verschuivingen"
        },
        "decisions": {
          "title": "Bij het nemen van belangrijke beslissingen heb je de neiging om...",
          "overthink": "Overdenk en blijf steken in analyseverlamming",
          "intuitive": "Ga op mijn gevoel af",
          "external": "Vraag veel advies aan anderen",
          "systematic": "Weeg de voor- en nadelen systematisch af"
        },
        "gender": {
          "title": "Hoe identificeer je je?",
          "subtitle": "Wij gebruiken dit alleen om inzichten te personaliseren.",
          "woman": "Vrouw",
          "man": "Man",
          "nonBinary": "Niet-binair",
          "preferNot": "Zeg het liever niet"
        },
        "apaStudy": "📘 Expressief schrijven stimuleert de emotionele verwerking — APA Psychology Review",
        "insightsWith": "KRIJG INZICHTEN MET"
      },
      "quizIntro": {
        "title": "Help ons uw gewoonten te begrijpen",
        "description": "Optionele vragen om uw ervaring te personaliseren",
        "questions": "vragen",
        "minutes": "notulen",
        "private": "privé",
        "accurateInsights": "Nauwkeurigere inzichten",
        "recommendations": "Gepersonaliseerde aanbevelingen",
        "patternTracking": "Betere patroonregistratie"
      },
      "analyzing": {
        "emotionalPatterns": "Analyseren van emotionele patronen",
        "responses": "Het verwerken van uw antwoorden",
        "stressMarkers": "Stressmarkers identificeren",
        "personalPlan": "Het samenstellen van uw persoonlijke plan",
        "status": "{{label}}..."
      },
      "personality": {
        "primaryPattern": "Je primaire patroon",
        "perfectionism": "Perfectionisme",
        "anxiety": "Spanning",
        "selfCompassion": "Gebrek aan zelfcompassie",
        "boundaries": "Gebrek aan grenzen",
        "selfEsteem": "Laag zelfbeeld",
        "descriptions": {
          "perfectionism": "Perfectionisme kan ervoor zorgen dat je gespannen en vastloopt. Het dwingt je om zekerheid na te jagen in plaats van je klaar te voelen.",
          "anxiety": "Angst komt vaak voort uit een geest die te vaak op gevaar let. Het kan je gespannen achterlaten, zelfs als je veilig bent.",
          "selfCompassion": "Weinig zelfcompassie betekent dat je harder voor jezelf bent dan voor iemand van wie je houdt. Daardoor voelt de groei zwaarder dan nodig is.",
          "boundaries": "Zwakke grenzen kunnen voortkomen uit angst voor conflicten of het teleurstellen van mensen. Na verloop van tijd raakt u uitgeput en wordt u weggetrokken van uw eigen behoeften.",
          "selfEsteem": "Een laag zelfbeeld kan ervoor zorgen dat je geest zich fixeert op wat je voelt ontbreken. Dat houdt een vertekend zelfbeeld in stand."
        },
        "evolution": "Wij volgen hoe dit evolueert en helpen u er doorheen te werken."
      },
      "summary": {
        "title": "Je bent helemaal klaar!",
        "mood": "Wij helpen u uw humeur te verbeteren met begeleide reflecties en inzichten.",
        "stress": "Wij helpen u stress te verminderen met begeleide reflecties en inzichten.",
        "habits": "Wij helpen u gewoontes op te bouwen met begeleide reflecties en inzichten.",
        "clarity": "Wij helpen u duidelijkheid te krijgen met begeleide reflecties en inzichten.",
        "default": "Je persoonlijke ruimte voor reflectie is klaar. Laten we uw reis beginnen."
      },
      "showcase": {
        "label": "PROBEER HET UIT",
        "title": "Schrijf vrijuit.\nZorg voor duidelijkheid.",
        "entry": "Jouw inzending",
        "placeholder": "Begin met schrijven hoe je je voelt...",
        "pickPrompt": "Of kies een prompt",
        "prompts": {
          "overwhelmed": "Ik voel me de laatste tijd overweldigd door werk...",
          "outside": "Vandaag merkte ik dat ik gelukkiger was nadat ik naar buiten was gegaan",
          "procrastinating": "Ik stel dingen steeds uit en ik weet niet zeker waarom",
          "grateful": "Er gebeurde vandaag iets waar ik heel dankbaar voor was"
        },
        "thinking": "Insight denkt...",
        "aiLabel": "Insight AI",
        "responses": {
          "overwhelmed": "Het klinkt alsof je momenteel veel meedraagt. Het herkennen van dat gevoel is de eerste stap. Insight kan u helpen deze patronen op te sporen en te ontdekken wat u verlichting geeft. 💜",
          "positive": "Dat is een mooie observatie. Het is krachtig om op te merken wat uw humeur verbetert: Insight helpt u in de loop van de tijd op deze positieve patronen voort te bouwen. ✨",
          "procrastination": "Uitstelgedrag heeft vaak diepere wortels dan we denken. Door een dagboek bij te houden kunnen de verborgen emoties erachter worden onthuld. Insight helpt u deze blokkades te begrijpen en te overwinnen. 🔑",
          "sadness": "Bedankt dat je dat deelt. Het uiten van moeilijke gevoelens is moedig en helend. Insight is hier om te luisteren en u te helpen bij het navigeren door deze momenten. 💙",
          "default": "Bedankt voor het delen. Elke inzending is een stap naar een dieper zelfinzicht. Insight helpt u patronen te ontdekken, uw groei te volgen en in de loop van de tijd duidelijkheid te krijgen. 💜"
        }
      },
      "privacy": {
        "title": "Uw aantekeningen zijn volledig privé",
        "subtitle": "We gebruiken end-to-endversleuteling om je dagboeknotities veilig te houden. Alleen jij kunt ze lezen.",
        "encryption": "AES-256-codering",
        "passwordKey": "Uw wachtwoord is de sleutel",
        "cannotRead": "We kunnen uw invoer niet lezen"
      },
      "notifications": {
        "title": "Schakel meldingen in",
        "subtitle": "Haal het meeste uit Insight door op de hoogte te blijven van wat er gebeurt.",
        "allow": "Meldingen toestaan",
        "skip": "Voor nu overslaan →",
        "permissionTitle": "Vergeet niet om te reflecteren met meldingen",
        "permissionRequest": "Insight AI wil u graag sturen",
        "permissionType": "Meldingen",
        "dontAllow": "Niet toestaan"
      },
      "rateUs": {
        "title": "Beoordeel ons met 5 sterren",
        "subtitle": "Help ons de boodschap van bewust leven en persoonlijke groei te verspreiden",
        "testimonials": {
          "first": "Insight heeft de manier waarop ik mijn emoties begrijp volledig veranderd. De AI-inzichten zijn ongelooflijk nauwkeurig en nuttig.",
          "second": "Deze app hielp me patronen te identificeren die ik nog nooit eerder had opgemerkt. Het is alsof ik een therapeut in mijn zak heb.",
          "third": "De dagelijkse reflecties en inzichten zijn een essentieel onderdeel geworden van mijn zelfzorgroutine."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah L."
        }
      },
      "paywall": {
        "headings": {
          "understand": "Begrijp jezelf beter\nmet Insight",
          "growth": "Volg je groei\nen vooruitgang",
          "reflect": "Reflecteer dieper,\nleef beter",
          "mira": "Praat met Mira",
          "findWhatWorks": "Vind wat werkt"
        },
        "trial": "3 dagen op proef",
        "weekly": "Wekelijks",
        "monthly": "Maandelijks",
        "yearly": "Jaarlijks",
        "save": "Bespaar 73%",
        "perDay": "{{price}} / dag",
        "perWeek": "{{price}} per week",
        "perMonth": "{{price}} per maand",
        "perYear": "{{price}} per jaar",
        "whatYouGet": "Wat je krijgt:",
        "benefits": {
          "unlimited": "Onbeperkte AI-inzichten uit je dagboek",
          "patterns": "Diepe patroon- en triggerdetectie",
          "summaries": "Gepersonaliseerde wekelijkse samenvattingen",
          "playbook": "Groeidraaiboek en actieplannen"
        },
        "testimonials": {
          "first": "Insight heeft de manier waarop ik mijn emoties begrijp volledig veranderd. De AI-inzichten zijn ongelooflijk nauwkeurig en nuttig.",
          "second": "De dagboekaanwijzingen zijn attent en het volgen van patronen helpt me mijn groei in de loop van de tijd te zien.",
          "third": "Beste app voor geestelijke gezondheidszorg die ik heb gebruikt. De AI voelt alsof je met een therapeut praat die mij echt begrijpt.",
          "fourth": "Ik vind het geweldig hoe het mijn dagelijkse gewoonten verbindt met mijn stemmingspatronen. Elke week verrassende inzichten.",
          "fifth": "De playbook-functie met gepersonaliseerde strategieën is een game-changer voor mijn angst geweest."
        },
        "authors": {
          "first": "Jessica M.",
          "second": "Michael R.",
          "third": "Sarah K.",
          "fourth": "David L.",
          "fifth": "Emma T."
        },
        "noCommitment": "Geen verplichting, op elk moment opzeggen.",
        "startJourney": "Begin vandaag nog met mijn reis",
        "restorePurchase": "Aankoop herstellen",
        "terms": "Algemene voorwaarden",
        "privacyPolicy": "Privacybeleid",
        "alerts": {
          "otherAccountTitle": "Abonnement gevonden op een ander account",
          "otherAccountBody": "Dit abonnement hoort bij een ander account op dit apparaat. Meld u aan bij dat account om de Pro-functies te gebruiken.",
          "otherAccountPurchaseBody": "Er is een Pro-abonnement actief op een ander account op dit apparaat. Meld u aan bij dat account om de Pro-functies te gebruiken, of koop een nieuw abonnement voor dit account.",
          "purchaseSuccessTitle": "Aankoop succesvol! 🎉",
          "purchaseSuccessBody": "Je hebt nu toegang tot onbeperkte AI-inzichten en alle Pro-functies.",
          "inactiveTitle": "Abonnement niet actief",
          "inactiveBody": "Uw aankoop kon niet worden bevestigd. Neem contact op met de ondersteuning als dit aanhoudt.",
          "comingSoonTitle": "Abonnementen binnenkort beschikbaar",
          "comingSoonBody": "Er worden mobiele abonnementen opgezet. U kunt de app blijven gebruiken en u later online abonneren op myinsightai.app",
          "continueToApp": "Ga verder naar App",
          "alreadySubscribedTitle": "Al geabonneerd",
          "alreadySubscribedBody": "Je hebt al een actief Pro-abonnement. Geniet van uw premiumfuncties!",
          "existsTitle": "Abonnement bestaat al",
          "existsBody": "Er is eerder op dit apparaat een abonnement aangeschaft met een ander account. Om Pro-functies te gebruiken, logt u in op het account waarmee u het abonnement oorspronkelijk heeft aangeschaft.\n\nAls u denkt dat dit een fout is, probeer dan uw aankopen te herstellen of neem contact op met de ondersteuning.",
          "tryRestore": "Probeer Herstellen",
          "purchaseFailed": "Aankoop mislukt",
          "purchaseError": "Fout: {{message}}\n\nCodering: {{code}}\n\nControleer:\n1. Sandbox-account is aangemeld (Instellingen > App Store)\n2. Producten worden geconfigureerd in App Store Connect\n3. Probeer het over enkele ogenblikken opnieuw",
          "noPurchasesTitle": "Geen aankopen gevonden",
          "noPurchasesBody": "Er zijn geen actieve abonnementen gevonden voor deze Apple ID.",
          "restoreFailed": "Herstellen mislukt",
          "restoreError": "Kon aankopen niet herstellen: {{message}}",
          "unknown": "onbekend",
          "ok": "OK"
        }
      },
      "postPurchase": {
        "title": "Welkom bij Insight",
        "subtitle": "Je bent helemaal klaar met Pro",
        "analysis": "AI-analyse van je dagboek",
        "privateEntries": "Privé en gecodeerde vermeldingen",
        "growth": "Volg uw groei in de loop van de tijd",
        "accountInfo": "Maak een account aan om uw invoer op te slaan en er op verschillende apparaten toegang toe te hebben."
      },
      "analysisComplete": {
        "namedTitle": "{{name}}, jouw persoonlijke plan is klaar",
        "title": "Je bent er helemaal klaar voor",
        "reassurance": "Je ruimte is klaar."
      },
      "aiConsent": {
        "title": "AI-analyse inschakelen?",
        "subtitle": "Krijg gepersonaliseerde inzichten uit je dagboeknotities met behulp van AI-technologie",
        "dataTitle": "Welke gegevens worden verzonden",
        "dataBody": "Wanneer je bij een dagboeknotitie op 'Analyseren' tikt, sturen we de tekst naar onze AI-service voor analyse.",
        "entryText": "De tekst van je dagboeknotitie",
        "noIdentifiers": "Geen persoonlijke identificatiegegevens (naam, e-mailadres, enz.)",
        "analyzeOnly": "Alleen als u op de knop ‘Analyseren’ tikt",
        "recipientTitle": "Wie ontvangt uw gegevens",
        "recipientIntro": "We gebruiken ",
        "providerName": "Groq",
        "recipientCompany": " (een AI-infrastructuurbedrijf), dat het taalmodel ",
        "modelName": "Llama 3",
        "recipientModelTail": " uitvoert om je dagboeknotities te analyseren.",
        "recipientPrivacy": "Groq verwerkt uw gegevens volgens hun privacybeleid en gebruikt uw gegevens niet om AI-modellen te trainen.",
        "protectionTitle": "Hoe uw gegevens worden beschermd",
        "encrypted": "Alle gegevens worden tijdens de overdracht gecodeerd (HTTPS/TLS)",
        "secureStorage": "Uw gegevens worden veilig opgeslagen in uw privédatabase",
        "revoke": "U kunt uw toestemming op elk gewenst moment intrekken via Instellingen",
        "optional": "AI-functies zijn optioneel: u kunt ook zonder hen een dagboek bijhouden",
        "notice": "Door te accepteren stem je ermee in dat de tekst van je dagboeknotitie naar Groq wordt verzonden voor AI-analyse wanneer je op 'Analyseren' tikt. Bekijk ons privacybeleid voor alle details.",
        "decline": "Afwijzen",
        "accept": "Accepteren en doorgaan"
      }
    }
  }
};
