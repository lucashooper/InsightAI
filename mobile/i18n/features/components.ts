import { AppLanguage, TranslationTree } from '../types';

export const componentTranslations: Partial<Record<AppLanguage, TranslationTree>> = {
  en: {
    components: {
      common: { back: 'Go back' },
      playbook: {
        quickAccessTitle: 'Quick Access Playbook',
        pinEntry: 'Pin an entry for easy access',
        viewFull: 'View full entry',
      },
      routine: {
        noTasks: 'No tasks added yet',
        complete: '{{completed}}/{{total}} complete',
      },
      premium: {
        title: 'Unlock AI-Powered Insights',
        subtitle: 'Get daily AI analysis and personalized growth recommendations to track your emotional journey',
        dailyTitle: 'Daily AI Analyses',
        dailyDescription: 'Analyze up to 2 journal entries per day with deep AI insights',
        patternsTitle: 'Deep Pattern Detection',
        patternsDescription: 'Discover hidden emotional patterns and recurring themes in your thoughts',
        growthTitle: 'Personalized Growth Plans',
        growthDescription: 'Receive tailored recommendations to help you grow and improve',
        weeklyTitle: 'Weekly Progress Summaries',
        weeklyDescription: 'Get comprehensive weekly insights tracking your emotional journey',
        triggersTitle: 'Trigger Analysis',
        triggersDescription: 'Identify what triggers your emotions and learn how to manage them',
        upgrade: 'Upgrade to Pro',
        maybeLater: 'Maybe Later',
      },
      lock: {
        biometricFailed: 'Biometric authentication failed',
        incorrectPin: 'Incorrect PIN',
        welcome: 'Welcome back',
        enterPin: 'Enter your PIN to unlock',
        useFaceId: 'Tap to use Face ID',
        forgotTitle: 'Forgot PIN?',
        forgotMessage: "We'll send a security email to your account and reset the PIN on this device.",
        cancel: 'Cancel',
        sendEmail: 'Send Email',
        resetTitle: 'PIN Reset',
        resetMessage: 'Your PIN has been reset on this device. We also sent an email to your account for security.',
        errorTitle: 'Error',
        errorMessage: 'Could not send reset email. Please try again later.',
      },
      intro: {
        title: 'Welcome to Insight!',
        subtitle: "Here's a quick overview of your new space for reflection and growth",
        journalTitle: 'Journal Your Thoughts',
        journalDescription: 'Tap the + button to create entries and track your emotions',
        progressTitle: 'Track Your Progress',
        progressDescription: 'View insights and patterns in your emotional journey',
        habitsTitle: 'Build Healthy Habits',
        habitsDescription: 'Access meditation, gratitude, and wellness tools',
        getStarted: 'Get Started',
      },
      dailyMood: {
        greeting: 'Hey, {{name}}. How are you this {{timeOfDay}}?',
        greetingAnonymous: 'Hey there. How are you this {{timeOfDay}}?',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        moods: {
          1: 'Struggling', 2: 'Not great', 3: 'Meh', 4: 'Alright', 5: 'Okay',
          6: 'Good', 7: 'Great', 8: 'Really good', 9: 'Amazing', 10: 'Incredible',
        },
        writeAboutIt: 'Want to write about it?',
        maybeLater: 'Maybe later',
      },
      auth: {
        signIn: 'Sign In',
        apple: 'Sign in with Apple',
        google: 'Sign in with Google',
        email: 'Continue with email',
        termsPrefix: 'By continuing you agree to our',
        termsOfService: 'Terms of Service',
        and: 'and',
        privacyPolicy: 'Privacy Policy',
      },
    },
  },
  es: {
    components: {
      common: { back: 'Volver' },
      playbook: { quickAccessTitle: 'Manual de acceso rápido', pinEntry: 'Fija una entrada para acceder fácilmente', viewFull: 'Ver entrada completa' },
      routine: { noTasks: 'Aún no se han añadido tareas', complete: '{{completed}}/{{total}} completadas' },
      premium: {
        title: 'Desbloquea información con IA', subtitle: 'Recibe análisis diarios con IA y recomendaciones de crecimiento personalizadas para seguir tu recorrido emocional',
        dailyTitle: 'Análisis diarios con IA', dailyDescription: 'Analiza hasta 2 entradas de diario al día con información detallada de la IA',
        patternsTitle: 'Detección profunda de patrones', patternsDescription: 'Descubre patrones emocionales ocultos y temas recurrentes en tus pensamientos',
        growthTitle: 'Planes de crecimiento personalizados', growthDescription: 'Recibe recomendaciones adaptadas para ayudarte a crecer y mejorar',
        weeklyTitle: 'Resúmenes semanales de progreso', weeklyDescription: 'Recibe información semanal completa para seguir tu recorrido emocional',
        triggersTitle: 'Análisis de desencadenantes', triggersDescription: 'Identifica qué desencadena tus emociones y aprende a gestionarlas',
        upgrade: 'Mejorar a Pro', maybeLater: 'Quizá más tarde',
      },
      lock: {
        biometricFailed: 'La autenticación biométrica ha fallado', incorrectPin: 'PIN incorrecto', welcome: 'Te damos la bienvenida de nuevo',
        enterPin: 'Introduce tu PIN para desbloquear', useFaceId: 'Toca para usar Face ID', forgotTitle: '¿Olvidaste el PIN?',
        forgotMessage: 'Enviaremos un correo de seguridad a tu cuenta y restableceremos el PIN en este dispositivo.', cancel: 'Cancelar', sendEmail: 'Enviar correo',
        resetTitle: 'PIN restablecido', resetMessage: 'Tu PIN se ha restablecido en este dispositivo. También enviamos un correo a tu cuenta por seguridad.',
        errorTitle: 'Error', errorMessage: 'No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo más tarde.',
      },
      intro: {
        title: '¡Te damos la bienvenida a Insight!', subtitle: 'Aquí tienes un breve resumen de tu nuevo espacio para reflexionar y crecer',
        journalTitle: 'Escribe tus pensamientos', journalDescription: 'Toca el botón + para crear entradas y registrar tus emociones',
        progressTitle: 'Sigue tu progreso', progressDescription: 'Consulta información y patrones de tu recorrido emocional',
        habitsTitle: 'Crea hábitos saludables', habitsDescription: 'Accede a herramientas de meditación, gratitud y bienestar', getStarted: 'Comenzar',
      },
      dailyMood: {
        greeting: 'Hola, {{name}}. ¿Cómo estás esta {{timeOfDay}}?', greetingAnonymous: 'Hola. ¿Cómo estás esta {{timeOfDay}}?', morning: 'mañana', afternoon: 'tarde', evening: 'noche',
        moods: { 1: 'Con dificultades', 2: 'No muy bien', 3: 'Regular', 4: 'Más o menos', 5: 'Bien', 6: 'Bastante bien', 7: 'Muy bien', 8: 'Realmente bien', 9: 'Genial', 10: 'Increíble' },
        writeAboutIt: '¿Quieres escribir sobre ello?', maybeLater: 'Quizá más tarde',
      },
      auth: { signIn: 'Iniciar sesión', apple: 'Iniciar sesión con Apple', google: 'Iniciar sesión con Google', email: 'Continuar con correo electrónico', termsPrefix: 'Al continuar, aceptas nuestros', termsOfService: 'Términos de servicio', and: 'y la', privacyPolicy: 'Política de privacidad' },
    },
  },
  zh: {
    components: {
      common: { back: '返回' },
      playbook: { quickAccessTitle: '快速访问手册', pinEntry: '固定一个条目以便快速访问', viewFull: '查看完整条目' },
      routine: { noTasks: '尚未添加任务', complete: '已完成 {{completed}}/{{total}}' },
      premium: {
        title: '解锁 AI 深度洞察', subtitle: '获取每日 AI 分析和个性化成长建议，追踪你的情绪历程',
        dailyTitle: '每日 AI 分析', dailyDescription: '每天可深度分析最多 2 篇日记',
        patternsTitle: '深度模式识别', patternsDescription: '发现思绪中隐藏的情绪模式和反复出现的主题',
        growthTitle: '个性化成长计划', growthDescription: '获取量身定制的建议，帮助你成长和进步',
        weeklyTitle: '每周进展总结', weeklyDescription: '通过全面的每周洞察追踪你的情绪历程',
        triggersTitle: '诱因分析', triggersDescription: '识别情绪诱因，并学习如何管理它们',
        upgrade: '升级至专业版', maybeLater: '以后再说',
      },
      lock: {
        biometricFailed: '生物识别验证失败', incorrectPin: 'PIN 码不正确', welcome: '欢迎回来', enterPin: '输入 PIN 码以解锁',
        useFaceId: '轻触以使用面容 ID', forgotTitle: '忘记 PIN 码？', forgotMessage: '我们会向你的账户发送安全邮件，并重置此设备上的 PIN 码。',
        cancel: '取消', sendEmail: '发送邮件', resetTitle: 'PIN 码已重置', resetMessage: '此设备上的 PIN 码已重置。为确保安全，我们也向你的账户发送了邮件。',
        errorTitle: '错误', errorMessage: '无法发送重置邮件，请稍后重试。',
      },
      intro: {
        title: '欢迎使用 Insight！', subtitle: '快速了解这个用于反思和成长的新空间',
        journalTitle: '记录你的想法', journalDescription: '轻触 + 按钮创建日记并追踪情绪',
        progressTitle: '追踪你的进展', progressDescription: '查看情绪历程中的洞察和模式',
        habitsTitle: '培养健康习惯', habitsDescription: '使用冥想、感恩和健康工具', getStarted: '开始使用',
      },
      dailyMood: {
        greeting: '嗨，{{name}}。今天{{timeOfDay}}感觉怎么样？', greetingAnonymous: '嗨，今天{{timeOfDay}}感觉怎么样？', morning: '早上', afternoon: '下午', evening: '晚上',
        moods: { 1: '很煎熬', 2: '不太好', 3: '一般', 4: '还行', 5: '尚可', 6: '不错', 7: '很好', 8: '非常好', 9: '太棒了', 10: '好极了' },
        writeAboutIt: '想写下来吗？', maybeLater: '以后再说',
      },
      auth: { signIn: '登录', apple: '使用 Apple 登录', google: '使用 Google 登录', email: '使用电子邮件继续', termsPrefix: '继续即表示你同意我们的', termsOfService: '服务条款', and: '和', privacyPolicy: '隐私政策' },
    },
  },
  hi: {
    components: {
      common: { back: 'वापस जाएँ' },
      playbook: { quickAccessTitle: 'त्वरित पहुँच प्लेबुक', pinEntry: 'आसान पहुँच के लिए कोई प्रविष्टि पिन करें', viewFull: 'पूरी प्रविष्टि देखें' },
      routine: { noTasks: 'अभी तक कोई कार्य नहीं जोड़ा गया', complete: '{{completed}}/{{total}} पूरे' },
      premium: {
        title: 'AI-संचालित अंतर्दृष्टि अनलॉक करें', subtitle: 'अपनी भावनात्मक यात्रा पर नज़र रखने के लिए दैनिक AI विश्लेषण और व्यक्तिगत विकास सुझाव पाएँ',
        dailyTitle: 'दैनिक AI विश्लेषण', dailyDescription: 'गहन AI अंतर्दृष्टि के साथ प्रतिदिन अधिकतम 2 जर्नल प्रविष्टियों का विश्लेषण करें',
        patternsTitle: 'गहन पैटर्न पहचान', patternsDescription: 'अपने विचारों में छिपे भावनात्मक पैटर्न और बार-बार आने वाले विषय खोजें',
        growthTitle: 'व्यक्तिगत विकास योजनाएँ', growthDescription: 'आगे बढ़ने और बेहतर होने में मदद के लिए अनुकूल सुझाव पाएँ',
        weeklyTitle: 'साप्ताहिक प्रगति सारांश', weeklyDescription: 'अपनी भावनात्मक यात्रा पर नज़र रखने वाली विस्तृत साप्ताहिक अंतर्दृष्टि पाएँ',
        triggersTitle: 'ट्रिगर विश्लेषण', triggersDescription: 'जानें कि आपकी भावनाओं को क्या ट्रिगर करता है और उन्हें संभालना सीखें',
        upgrade: 'Pro में अपग्रेड करें', maybeLater: 'शायद बाद में',
      },
      lock: {
        biometricFailed: 'बायोमेट्रिक प्रमाणीकरण विफल रहा', incorrectPin: 'गलत PIN', welcome: 'वापसी पर स्वागत है', enterPin: 'अनलॉक करने के लिए अपना PIN डालें',
        useFaceId: 'Face ID इस्तेमाल करने के लिए टैप करें', forgotTitle: 'PIN भूल गए?', forgotMessage: 'हम आपके खाते पर एक सुरक्षा ईमेल भेजेंगे और इस डिवाइस का PIN रीसेट करेंगे।',
        cancel: 'रद्द करें', sendEmail: 'ईमेल भेजें', resetTitle: 'PIN रीसेट हुआ', resetMessage: 'इस डिवाइस पर आपका PIN रीसेट कर दिया गया है। सुरक्षा के लिए हमने आपके खाते पर एक ईमेल भी भेजा है।',
        errorTitle: 'त्रुटि', errorMessage: 'रीसेट ईमेल नहीं भेजा जा सका। कृपया बाद में फिर कोशिश करें।',
      },
      intro: {
        title: 'Insight में आपका स्वागत है!', subtitle: 'मनन और विकास के लिए अपनी नई जगह का एक संक्षिप्त परिचय',
        journalTitle: 'अपने विचार लिखें', journalDescription: 'प्रविष्टियाँ बनाने और भावनाओं पर नज़र रखने के लिए + बटन टैप करें',
        progressTitle: 'अपनी प्रगति देखें', progressDescription: 'अपनी भावनात्मक यात्रा की अंतर्दृष्टियाँ और पैटर्न देखें',
        habitsTitle: 'स्वस्थ आदतें बनाएँ', habitsDescription: 'ध्यान, कृतज्ञता और स्वास्थ्य टूल इस्तेमाल करें', getStarted: 'शुरू करें',
      },
      dailyMood: {
        greeting: 'नमस्ते, {{name}}। आज {{timeOfDay}} आप कैसा महसूस कर रहे हैं?', greetingAnonymous: 'नमस्ते। आज {{timeOfDay}} आप कैसा महसूस कर रहे हैं?', morning: 'सुबह', afternoon: 'दोपहर', evening: 'शाम',
        moods: { 1: 'बहुत कठिन', 2: 'अच्छा नहीं', 3: 'ठीक-ठाक', 4: 'चल रहा है', 5: 'ठीक', 6: 'अच्छा', 7: 'बहुत अच्छा', 8: 'काफ़ी अच्छा', 9: 'शानदार', 10: 'अविश्वसनीय' },
        writeAboutIt: 'क्या आप इसके बारे में लिखना चाहेंगे?', maybeLater: 'शायद बाद में',
      },
      auth: { signIn: 'साइन इन करें', apple: 'Apple से साइन इन करें', google: 'Google से साइन इन करें', email: 'ईमेल से जारी रखें', termsPrefix: 'जारी रखकर आप हमारी', termsOfService: 'सेवा की शर्तों', and: 'और', privacyPolicy: 'गोपनीयता नीति से सहमत होते हैं' },
    },
  },
  fr: {
    components: {
      common: { back: 'Retour' },
      playbook: { quickAccessTitle: "Guide d'accès rapide", pinEntry: 'Épinglez une entrée pour y accéder facilement', viewFull: "Voir l'entrée complète" },
      routine: { noTasks: "Aucune tâche ajoutée pour l'instant", complete: '{{completed}}/{{total}} terminées' },
      premium: {
        title: 'Débloquez des analyses alimentées par l’IA', subtitle: 'Recevez chaque jour une analyse par IA et des recommandations personnalisées pour suivre votre parcours émotionnel',
        dailyTitle: 'Analyses quotidiennes par IA', dailyDescription: 'Analysez jusqu’à 2 entrées de journal par jour grâce à des analyses approfondies par IA',
        patternsTitle: 'Détection approfondie des schémas', patternsDescription: 'Découvrez les schémas émotionnels cachés et les thèmes récurrents de vos pensées',
        growthTitle: 'Plans de progression personnalisés', growthDescription: 'Recevez des recommandations adaptées pour vous aider à progresser',
        weeklyTitle: 'Bilans hebdomadaires de progression', weeklyDescription: 'Recevez des analyses hebdomadaires complètes pour suivre votre parcours émotionnel',
        triggersTitle: 'Analyse des déclencheurs', triggersDescription: 'Identifiez ce qui déclenche vos émotions et apprenez à les gérer',
        upgrade: 'Passer à Pro', maybeLater: 'Peut-être plus tard',
      },
      lock: {
        biometricFailed: 'Échec de l’authentification biométrique', incorrectPin: 'Code PIN incorrect', welcome: 'Bon retour parmi nous', enterPin: 'Saisissez votre code PIN pour déverrouiller',
        useFaceId: 'Touchez pour utiliser Face ID', forgotTitle: 'Code PIN oublié ?', forgotMessage: 'Nous enverrons un e-mail de sécurité à votre compte et réinitialiserons le code PIN sur cet appareil.',
        cancel: 'Annuler', sendEmail: 'Envoyer l’e-mail', resetTitle: 'Code PIN réinitialisé', resetMessage: 'Votre code PIN a été réinitialisé sur cet appareil. Nous avons également envoyé un e-mail à votre compte par mesure de sécurité.',
        errorTitle: 'Erreur', errorMessage: 'Impossible d’envoyer l’e-mail de réinitialisation. Veuillez réessayer plus tard.',
      },
      intro: {
        title: 'Bienvenue dans Insight !', subtitle: 'Voici un aperçu de votre nouvel espace de réflexion et de progression',
        journalTitle: 'Notez vos pensées', journalDescription: 'Touchez le bouton + pour créer des entrées et suivre vos émotions',
        progressTitle: 'Suivez vos progrès', progressDescription: 'Consultez les analyses et les schémas de votre parcours émotionnel',
        habitsTitle: 'Adoptez des habitudes saines', habitsDescription: 'Accédez à des outils de méditation, de gratitude et de bien-être', getStarted: 'Commencer',
      },
      dailyMood: {
        greeting: 'Bonjour, {{name}}. Comment allez-vous {{timeOfDay}} ?', greetingAnonymous: 'Bonjour. Comment allez-vous {{timeOfDay}} ?', morning: 'ce matin', afternoon: 'cet après-midi', evening: 'ce soir',
        moods: { 1: 'En difficulté', 2: 'Pas très bien', 3: 'Bof', 4: 'Ça va', 5: 'Bien', 6: 'Plutôt bien', 7: 'Très bien', 8: 'Vraiment bien', 9: 'Formidable', 10: 'Incroyable' },
        writeAboutIt: 'Voulez-vous en parler par écrit ?', maybeLater: 'Peut-être plus tard',
      },
      auth: { signIn: 'Se connecter', apple: 'Se connecter avec Apple', google: 'Se connecter avec Google', email: 'Continuer avec l’e-mail', termsPrefix: 'En continuant, vous acceptez nos', termsOfService: 'Conditions d’utilisation', and: 'et notre', privacyPolicy: 'Politique de confidentialité' },
    },
  },
  de: {
    components: {
      common: { back: 'Zurück' },
      playbook: { quickAccessTitle: 'Schnellzugriff auf das Playbook', pinEntry: 'Eintrag für schnellen Zugriff anheften', viewFull: 'Vollständigen Eintrag anzeigen' },
      routine: { noTasks: 'Noch keine Aufgaben hinzugefügt', complete: '{{completed}}/{{total}} erledigt' },
      premium: {
        title: 'KI-gestützte Erkenntnisse freischalten', subtitle: 'Erhalte tägliche KI-Analysen und personalisierte Wachstumsempfehlungen, um deine emotionale Entwicklung zu verfolgen',
        dailyTitle: 'Tägliche KI-Analysen', dailyDescription: 'Analysiere täglich bis zu 2 Tagebucheinträge mit tiefgehenden KI-Erkenntnissen',
        patternsTitle: 'Tiefgehende Mustererkennung', patternsDescription: 'Entdecke verborgene emotionale Muster und wiederkehrende Themen in deinen Gedanken',
        growthTitle: 'Personalisierte Wachstumspläne', growthDescription: 'Erhalte individuelle Empfehlungen, die dich beim Wachsen und Verbessern unterstützen',
        weeklyTitle: 'Wöchentliche Fortschrittsberichte', weeklyDescription: 'Erhalte umfassende wöchentliche Erkenntnisse zu deiner emotionalen Entwicklung',
        triggersTitle: 'Trigger-Analyse', triggersDescription: 'Erkenne, was deine Emotionen auslöst, und lerne, damit umzugehen',
        upgrade: 'Auf Pro upgraden', maybeLater: 'Vielleicht später',
      },
      lock: {
        biometricFailed: 'Biometrische Authentifizierung fehlgeschlagen', incorrectPin: 'Falsche PIN', welcome: 'Willkommen zurück', enterPin: 'PIN zum Entsperren eingeben',
        useFaceId: 'Tippen, um Face ID zu verwenden', forgotTitle: 'PIN vergessen?', forgotMessage: 'Wir senden eine Sicherheits-E-Mail an dein Konto und setzen die PIN auf diesem Gerät zurück.',
        cancel: 'Abbrechen', sendEmail: 'E-Mail senden', resetTitle: 'PIN zurückgesetzt', resetMessage: 'Deine PIN wurde auf diesem Gerät zurückgesetzt. Aus Sicherheitsgründen haben wir auch eine E-Mail an dein Konto gesendet.',
        errorTitle: 'Fehler', errorMessage: 'Die E-Mail zum Zurücksetzen konnte nicht gesendet werden. Bitte versuche es später erneut.',
      },
      intro: {
        title: 'Willkommen bei Insight!', subtitle: 'Hier ist ein kurzer Überblick über deinen neuen Raum für Reflexion und Wachstum',
        journalTitle: 'Halte deine Gedanken fest', journalDescription: 'Tippe auf +, um Einträge zu erstellen und deine Emotionen zu verfolgen',
        progressTitle: 'Verfolge deinen Fortschritt', progressDescription: 'Sieh dir Erkenntnisse und Muster deiner emotionalen Entwicklung an',
        habitsTitle: 'Baue gesunde Gewohnheiten auf', habitsDescription: 'Nutze Tools für Meditation, Dankbarkeit und Wohlbefinden', getStarted: 'Loslegen',
      },
      dailyMood: {
        greeting: 'Hallo, {{name}}. Wie geht es dir an diesem {{timeOfDay}}?', greetingAnonymous: 'Hallo. Wie geht es dir an diesem {{timeOfDay}}?', morning: 'Morgen', afternoon: 'Nachmittag', evening: 'Abend',
        moods: { 1: 'Schwierig', 2: 'Nicht so gut', 3: 'Geht so', 4: 'Ganz okay', 5: 'Okay', 6: 'Gut', 7: 'Sehr gut', 8: 'Richtig gut', 9: 'Großartig', 10: 'Unglaublich' },
        writeAboutIt: 'Möchtest du darüber schreiben?', maybeLater: 'Vielleicht später',
      },
      auth: { signIn: 'Anmelden', apple: 'Mit Apple anmelden', google: 'Mit Google anmelden', email: 'Mit E-Mail fortfahren', termsPrefix: 'Wenn du fortfährst, stimmst du unseren', termsOfService: 'Nutzungsbedingungen', and: 'und unserer', privacyPolicy: 'Datenschutzrichtlinie zu' },
    },
  },
  ru: {
    components: {
      common: { back: 'Назад' },
      playbook: { quickAccessTitle: 'Быстрый доступ к руководству', pinEntry: 'Закрепите запись для быстрого доступа', viewFull: 'Открыть запись полностью' },
      routine: { noTasks: 'Задачи пока не добавлены', complete: 'Выполнено: {{completed}}/{{total}}' },
      premium: {
        title: 'Откройте аналитику на основе ИИ', subtitle: 'Получайте ежедневный ИИ-анализ и персональные рекомендации для отслеживания эмоционального состояния',
        dailyTitle: 'Ежедневный ИИ-анализ', dailyDescription: 'Глубокий ИИ-анализ до 2 записей в дневнике каждый день',
        patternsTitle: 'Глубокое выявление закономерностей', patternsDescription: 'Находите скрытые эмоциональные закономерности и повторяющиеся темы в своих мыслях',
        growthTitle: 'Персональные планы развития', growthDescription: 'Получайте индивидуальные рекомендации для роста и улучшений',
        weeklyTitle: 'Еженедельные итоги прогресса', weeklyDescription: 'Получайте подробную еженедельную аналитику своего эмоционального пути',
        triggersTitle: 'Анализ триггеров', triggersDescription: 'Определяйте, что вызывает ваши эмоции, и учитесь ими управлять',
        upgrade: 'Перейти на Pro', maybeLater: 'Может быть, позже',
      },
      lock: {
        biometricFailed: 'Не удалось пройти биометрическую аутентификацию', incorrectPin: 'Неверный PIN-код', welcome: 'С возвращением', enterPin: 'Введите PIN-код для разблокировки',
        useFaceId: 'Нажмите, чтобы использовать Face ID', forgotTitle: 'Забыли PIN-код?', forgotMessage: 'Мы отправим письмо безопасности на вашу электронную почту и сбросим PIN-код на этом устройстве.',
        cancel: 'Отмена', sendEmail: 'Отправить письмо', resetTitle: 'PIN-код сброшен', resetMessage: 'Ваш PIN-код на этом устройстве сброшен. В целях безопасности мы также отправили письмо на вашу электронную почту.',
        errorTitle: 'Ошибка', errorMessage: 'Не удалось отправить письмо для сброса. Повторите попытку позже.',
      },
      intro: {
        title: 'Добро пожаловать в Insight!', subtitle: 'Краткий обзор вашего нового пространства для размышлений и развития',
        journalTitle: 'Записывайте свои мысли', journalDescription: 'Нажмите +, чтобы создавать записи и отслеживать эмоции',
        progressTitle: 'Следите за прогрессом', progressDescription: 'Просматривайте аналитику и закономерности своего эмоционального пути',
        habitsTitle: 'Формируйте полезные привычки', habitsDescription: 'Используйте инструменты для медитации, благодарности и благополучия', getStarted: 'Начать',
      },
      dailyMood: {
        greeting: 'Привет, {{name}}. Как вы чувствуете себя сегодня {{timeOfDay}}?', greetingAnonymous: 'Здравствуйте. Как вы чувствуете себя сегодня {{timeOfDay}}?', morning: 'утром', afternoon: 'днём', evening: 'вечером',
        moods: { 1: 'Очень тяжело', 2: 'Не очень', 3: 'Так себе', 4: 'Нормально', 5: 'В порядке', 6: 'Хорошо', 7: 'Очень хорошо', 8: 'Действительно хорошо', 9: 'Отлично', 10: 'Невероятно' },
        writeAboutIt: 'Хотите написать об этом?', maybeLater: 'Может быть, позже',
      },
      auth: { signIn: 'Войти', apple: 'Войти через Apple', google: 'Войти через Google', email: 'Продолжить с электронной почтой', termsPrefix: 'Продолжая, вы принимаете наши', termsOfService: 'Условия использования', and: 'и', privacyPolicy: 'Политику конфиденциальности' },
    },
  },
  pt: {
    components: {
      common: { back: 'Voltar' },
      playbook: { quickAccessTitle: 'Manual de acesso rápido', pinEntry: 'Fixe uma entrada para acessá-la facilmente', viewFull: 'Ver entrada completa' },
      routine: { noTasks: 'Nenhuma tarefa adicionada ainda', complete: '{{completed}}/{{total}} concluídas' },
      premium: {
        title: 'Desbloqueie insights com IA', subtitle: 'Receba análises diárias com IA e recomendações personalizadas de crescimento para acompanhar sua jornada emocional',
        dailyTitle: 'Análises diárias com IA', dailyDescription: 'Analise até 2 entradas do diário por dia com insights aprofundados de IA',
        patternsTitle: 'Detecção profunda de padrões', patternsDescription: 'Descubra padrões emocionais ocultos e temas recorrentes em seus pensamentos',
        growthTitle: 'Planos de crescimento personalizados', growthDescription: 'Receba recomendações sob medida para ajudar você a crescer e melhorar',
        weeklyTitle: 'Resumos semanais de progresso', weeklyDescription: 'Receba insights semanais completos para acompanhar sua jornada emocional',
        triggersTitle: 'Análise de gatilhos', triggersDescription: 'Identifique o que desperta suas emoções e aprenda a gerenciá-las',
        upgrade: 'Assinar o Pro', maybeLater: 'Talvez mais tarde',
      },
      lock: {
        biometricFailed: 'Falha na autenticação biométrica', incorrectPin: 'PIN incorreto', welcome: 'Boas-vindas de volta', enterPin: 'Digite seu PIN para desbloquear',
        useFaceId: 'Toque para usar o Face ID', forgotTitle: 'Esqueceu o PIN?', forgotMessage: 'Enviaremos um e-mail de segurança para sua conta e redefiniremos o PIN neste dispositivo.',
        cancel: 'Cancelar', sendEmail: 'Enviar e-mail', resetTitle: 'PIN redefinido', resetMessage: 'Seu PIN foi redefinido neste dispositivo. Também enviamos um e-mail para sua conta por segurança.',
        errorTitle: 'Erro', errorMessage: 'Não foi possível enviar o e-mail de redefinição. Tente novamente mais tarde.',
      },
      intro: {
        title: 'Boas-vindas ao Insight!', subtitle: 'Veja uma breve visão geral do seu novo espaço de reflexão e crescimento',
        journalTitle: 'Registre seus pensamentos', journalDescription: 'Toque no botão + para criar entradas e acompanhar suas emoções',
        progressTitle: 'Acompanhe seu progresso', progressDescription: 'Veja insights e padrões da sua jornada emocional',
        habitsTitle: 'Crie hábitos saudáveis', habitsDescription: 'Acesse ferramentas de meditação, gratidão e bem-estar', getStarted: 'Começar',
      },
      dailyMood: {
        greeting: 'Olá, {{name}}. Como você está nesta {{timeOfDay}}?', greetingAnonymous: 'Olá. Como você está nesta {{timeOfDay}}?', morning: 'manhã', afternoon: 'tarde', evening: 'noite',
        moods: { 1: 'Com dificuldades', 2: 'Não muito bem', 3: 'Mais ou menos', 4: 'Razoável', 5: 'Bem', 6: 'Legal', 7: 'Muito bem', 8: 'Realmente bem', 9: 'Incrível', 10: 'Sensacional' },
        writeAboutIt: 'Quer escrever sobre isso?', maybeLater: 'Talvez mais tarde',
      },
      auth: { signIn: 'Entrar', apple: 'Entrar com a Apple', google: 'Entrar com o Google', email: 'Continuar com e-mail', termsPrefix: 'Ao continuar, você concorda com nossos', termsOfService: 'Termos de Serviço', and: 'e com a', privacyPolicy: 'Política de Privacidade' },
    },
  },
  it: {
    components: {
      common: { back: 'Indietro' },
      playbook: { quickAccessTitle: 'Manuale ad accesso rapido', pinEntry: 'Fissa una voce per accedervi facilmente', viewFull: 'Visualizza voce completa' },
      routine: { noTasks: 'Nessuna attività aggiunta', complete: '{{completed}}/{{total}} completate' },
      premium: {
        title: 'Sblocca gli insight basati sull’IA', subtitle: 'Ricevi analisi IA quotidiane e consigli di crescita personalizzati per seguire il tuo percorso emotivo',
        dailyTitle: 'Analisi IA quotidiane', dailyDescription: 'Analizza fino a 2 voci del diario al giorno con insight IA approfonditi',
        patternsTitle: 'Rilevamento approfondito degli schemi', patternsDescription: 'Scopri schemi emotivi nascosti e temi ricorrenti nei tuoi pensieri',
        growthTitle: 'Piani di crescita personalizzati', growthDescription: 'Ricevi consigli su misura per aiutarti a crescere e migliorare',
        weeklyTitle: 'Riepiloghi settimanali dei progressi', weeklyDescription: 'Ricevi insight settimanali completi per seguire il tuo percorso emotivo',
        triggersTitle: 'Analisi dei fattori scatenanti', triggersDescription: 'Identifica cosa scatena le tue emozioni e impara a gestirle',
        upgrade: 'Passa a Pro', maybeLater: 'Magari più tardi',
      },
      lock: {
        biometricFailed: 'Autenticazione biometrica non riuscita', incorrectPin: 'PIN errato', welcome: 'Bentornato', enterPin: 'Inserisci il PIN per sbloccare',
        useFaceId: 'Tocca per usare Face ID', forgotTitle: 'PIN dimenticato?', forgotMessage: 'Invieremo un’e-mail di sicurezza al tuo account e reimposteremo il PIN su questo dispositivo.',
        cancel: 'Annulla', sendEmail: 'Invia e-mail', resetTitle: 'PIN reimpostato', resetMessage: 'Il PIN è stato reimpostato su questo dispositivo. Per sicurezza, abbiamo anche inviato un’e-mail al tuo account.',
        errorTitle: 'Errore', errorMessage: 'Impossibile inviare l’e-mail di reimpostazione. Riprova più tardi.',
      },
      intro: {
        title: 'Benvenuto in Insight!', subtitle: 'Ecco una breve panoramica del tuo nuovo spazio di riflessione e crescita',
        journalTitle: 'Scrivi i tuoi pensieri', journalDescription: 'Tocca il pulsante + per creare voci e tenere traccia delle tue emozioni',
        progressTitle: 'Segui i tuoi progressi', progressDescription: 'Visualizza insight e schemi del tuo percorso emotivo',
        habitsTitle: 'Crea abitudini sane', habitsDescription: 'Accedi a strumenti per meditazione, gratitudine e benessere', getStarted: 'Inizia',
      },
      dailyMood: {
        greeting: 'Ciao, {{name}}. Come stai {{timeOfDay}}?', greetingAnonymous: 'Ciao. Come stai {{timeOfDay}}?', morning: 'stamattina', afternoon: 'questo pomeriggio', evening: 'stasera',
        moods: { 1: 'In difficoltà', 2: 'Non molto bene', 3: 'Così così', 4: 'Abbastanza bene', 5: 'Bene', 6: 'Piuttosto bene', 7: 'Molto bene', 8: 'Davvero bene', 9: 'Alla grande', 10: 'Incredibile' },
        writeAboutIt: 'Vuoi scriverne?', maybeLater: 'Magari più tardi',
      },
      auth: { signIn: 'Accedi', apple: 'Accedi con Apple', google: 'Accedi con Google', email: 'Continua con e-mail', termsPrefix: 'Continuando, accetti i nostri', termsOfService: 'Termini di servizio', and: 'e la nostra', privacyPolicy: 'Informativa sulla privacy' },
    },
  },
  ro: {
    components: {
      common: { back: 'Înapoi' },
      playbook: { quickAccessTitle: 'Ghid cu acces rapid', pinEntry: 'Fixează o înregistrare pentru acces ușor', viewFull: 'Vezi înregistrarea completă' },
      routine: { noTasks: 'Nu au fost adăugate încă sarcini', complete: '{{completed}}/{{total}} finalizate' },
      premium: {
        title: 'Deblochează perspective bazate pe IA', subtitle: 'Primește zilnic analize IA și recomandări personalizate de dezvoltare pentru a-ți urmări parcursul emoțional',
        dailyTitle: 'Analize IA zilnice', dailyDescription: 'Analizează până la 2 înregistrări de jurnal pe zi cu perspective IA aprofundate',
        patternsTitle: 'Detectarea aprofundată a tiparelor', patternsDescription: 'Descoperă tipare emoționale ascunse și teme recurente în gândurile tale',
        growthTitle: 'Planuri de dezvoltare personalizate', growthDescription: 'Primește recomandări adaptate care să te ajute să crești și să evoluezi',
        weeklyTitle: 'Rezumate săptămânale ale progresului', weeklyDescription: 'Primește perspective săptămânale complete care îți urmăresc parcursul emoțional',
        triggersTitle: 'Analiza factorilor declanșatori', triggersDescription: 'Identifică ce îți declanșează emoțiile și învață să le gestionezi',
        upgrade: 'Treci la Pro', maybeLater: 'Poate mai târziu',
      },
      lock: {
        biometricFailed: 'Autentificarea biometrică a eșuat', incorrectPin: 'PIN incorect', welcome: 'Bine ai revenit', enterPin: 'Introdu PIN-ul pentru deblocare',
        useFaceId: 'Atinge pentru a folosi Face ID', forgotTitle: 'Ai uitat PIN-ul?', forgotMessage: 'Vom trimite un e-mail de securitate în contul tău și vom reseta PIN-ul pe acest dispozitiv.',
        cancel: 'Anulează', sendEmail: 'Trimite e-mail', resetTitle: 'PIN resetat', resetMessage: 'PIN-ul a fost resetat pe acest dispozitiv. Am trimis și un e-mail în contul tău, din motive de securitate.',
        errorTitle: 'Eroare', errorMessage: 'E-mailul de resetare nu a putut fi trimis. Încearcă din nou mai târziu.',
      },
      intro: {
        title: 'Bine ai venit în Insight!', subtitle: 'Iată o prezentare rapidă a noului tău spațiu pentru reflecție și dezvoltare',
        journalTitle: 'Notează-ți gândurile', journalDescription: 'Atinge butonul + pentru a crea înregistrări și a-ți urmări emoțiile',
        progressTitle: 'Urmărește-ți progresul', progressDescription: 'Vezi perspectivele și tiparele din parcursul tău emoțional',
        habitsTitle: 'Construiește obiceiuri sănătoase', habitsDescription: 'Accesează instrumente pentru meditație, recunoștință și stare de bine', getStarted: 'Începe',
      },
      dailyMood: {
        greeting: 'Bună, {{name}}. Cum te simți în această {{timeOfDay}}?', greetingAnonymous: 'Bună. Cum te simți în această {{timeOfDay}}?', morning: 'dimineață', afternoon: 'după-amiază', evening: 'seară',
        moods: { 1: 'Îmi este greu', 2: 'Nu prea bine', 3: 'Așa și așa', 4: 'Acceptabil', 5: 'Bine', 6: 'Destul de bine', 7: 'Foarte bine', 8: 'Chiar bine', 9: 'Minunat', 10: 'Incredibil' },
        writeAboutIt: 'Vrei să scrii despre asta?', maybeLater: 'Poate mai târziu',
      },
      auth: { signIn: 'Conectare', apple: 'Conectează-te cu Apple', google: 'Conectează-te cu Google', email: 'Continuă cu e-mailul', termsPrefix: 'Continuând, ești de acord cu', termsOfService: 'Termenii și condițiile', and: 'și cu', privacyPolicy: 'Politica de confidențialitate' },
    },
  },
  az: {
    components: {
      common: { back: 'Geri qayıt' },
      playbook: { quickAccessTitle: 'Sürətli giriş bələdçisi', pinEntry: 'Asan giriş üçün qeydi bərkidin', viewFull: 'Tam qeydə bax' },
      routine: { noTasks: 'Hələ tapşırıq əlavə edilməyib', complete: '{{completed}}/{{total}} tamamlandı' },
      premium: {
        title: 'Süni intellekt əsaslı təhlilləri açın', subtitle: 'Emosional yolunuzu izləmək üçün gündəlik süni intellekt təhlili və fərdi inkişaf tövsiyələri alın',
        dailyTitle: 'Gündəlik süni intellekt təhlilləri', dailyDescription: 'Dərin süni intellekt təhlilləri ilə gündə 2-dək jurnal qeydini təhlil edin',
        patternsTitle: 'Dərin nümunə aşkarlanması', patternsDescription: 'Düşüncələrinizdəki gizli emosional nümunələri və təkrarlanan mövzuları kəşf edin',
        growthTitle: 'Fərdiləşdirilmiş inkişaf planları', growthDescription: 'İnkişaf etməyinizə kömək edən fərdi tövsiyələr alın',
        weeklyTitle: 'Həftəlik irəliləyiş xülasələri', weeklyDescription: 'Emosional yolunuzu izləyən ətraflı həftəlik təhlillər alın',
        triggersTitle: 'Tətikləyici amillərin təhlili', triggersDescription: 'Emosiyalarınızı nəyin tətiklədiyini müəyyən edin və onları idarə etməyi öyrənin',
        upgrade: 'Pro versiyasına keç', maybeLater: 'Bəlkə sonra',
      },
      lock: {
        biometricFailed: 'Biometrik doğrulama uğursuz oldu', incorrectPin: 'PIN yanlışdır', welcome: 'Yenidən xoş gəlmisiniz', enterPin: 'Kilidi açmaq üçün PIN-i daxil edin',
        useFaceId: 'Face ID istifadə etmək üçün toxunun', forgotTitle: 'PIN-i unutmusunuz?', forgotMessage: 'Hesabınıza təhlükəsizlik e-poçtu göndərəcək və bu cihazdakı PIN-i sıfırlayacağıq.',
        cancel: 'Ləğv et', sendEmail: 'E-poçt göndər', resetTitle: 'PIN sıfırlandı', resetMessage: 'Bu cihazdakı PIN-iniz sıfırlandı. Təhlükəsizlik üçün hesabınıza e-poçt da göndərdik.',
        errorTitle: 'Xəta', errorMessage: 'Sıfırlama e-poçtu göndərilə bilmədi. Sonra yenidən cəhd edin.',
      },
      intro: {
        title: 'Insight-a xoş gəlmisiniz!', subtitle: 'Düşüncə və inkişaf üçün yeni məkanınızın qısa icmalı',
        journalTitle: 'Düşüncələrinizi yazın', journalDescription: 'Qeydlər yaratmaq və emosiyalarınızı izləmək üçün + düyməsinə toxunun',
        progressTitle: 'İrəliləyişinizi izləyin', progressDescription: 'Emosional yolunuzdakı təhlillərə və nümunələrə baxın',
        habitsTitle: 'Sağlam vərdişlər yaradın', habitsDescription: 'Meditasiya, minnətdarlıq və sağlamlıq alətlərindən istifadə edin', getStarted: 'Başlayın',
      },
      dailyMood: {
        greeting: 'Salam, {{name}}. Bu {{timeOfDay}} özünüzü necə hiss edirsiniz?', greetingAnonymous: 'Salam. Bu {{timeOfDay}} özünüzü necə hiss edirsiniz?', morning: 'səhər', afternoon: 'günorta', evening: 'axşam',
        moods: { 1: 'Çox çətin', 2: 'Yaxşı deyil', 3: 'Belə-belə', 4: 'Normal', 5: 'Yaxşı', 6: 'Kifayət qədər yaxşı', 7: 'Çox yaxşı', 8: 'Həqiqətən yaxşı', 9: 'Əla', 10: 'Möhtəşəm' },
        writeAboutIt: 'Bu barədə yazmaq istəyirsiniz?', maybeLater: 'Bəlkə sonra',
      },
      auth: { signIn: 'Daxil olun', apple: 'Apple ilə daxil olun', google: 'Google ilə daxil olun', email: 'E-poçtla davam edin', termsPrefix: 'Davam etməklə', termsOfService: 'Xidmət Şərtlərimizlə', and: 'və', privacyPolicy: 'Məxfilik Siyasətimizlə razılaşırsınız' },
    },
  },
  nl: {
    components: {
      common: { back: 'Ga terug' },
      playbook: { quickAccessTitle: 'Playbook voor snelle toegang', pinEntry: 'Zet een item vast voor snelle toegang', viewFull: 'Volledig item bekijken' },
      routine: { noTasks: 'Nog geen taken toegevoegd', complete: '{{completed}}/{{total}} voltooid' },
      premium: {
        title: 'Ontgrendel AI-gestuurde inzichten', subtitle: 'Ontvang dagelijkse AI-analyses en persoonlijke groeiaanbevelingen om je emotionele ontwikkeling te volgen',
        dailyTitle: 'Dagelijkse AI-analyses', dailyDescription: 'Analyseer maximaal 2 dagboekitems per dag met diepgaande AI-inzichten',
        patternsTitle: 'Diepgaande patroonherkenning', patternsDescription: 'Ontdek verborgen emotionele patronen en terugkerende thema’s in je gedachten',
        growthTitle: 'Persoonlijke groeiplannen', growthDescription: 'Ontvang aanbevelingen op maat om je te helpen groeien en verbeteren',
        weeklyTitle: 'Wekelijkse voortgangsoverzichten', weeklyDescription: 'Ontvang uitgebreide wekelijkse inzichten in je emotionele ontwikkeling',
        triggersTitle: 'Triggeranalyse', triggersDescription: 'Ontdek wat je emoties triggert en leer ermee omgaan',
        upgrade: 'Upgraden naar Pro', maybeLater: 'Misschien later',
      },
      lock: {
        biometricFailed: 'Biometrische verificatie mislukt', incorrectPin: 'Onjuiste pincode', welcome: 'Welkom terug', enterPin: 'Voer je pincode in om te ontgrendelen',
        useFaceId: 'Tik om Face ID te gebruiken', forgotTitle: 'Pincode vergeten?', forgotMessage: 'We sturen een beveiligingsmail naar je account en stellen de pincode op dit apparaat opnieuw in.',
        cancel: 'Annuleren', sendEmail: 'E-mail versturen', resetTitle: 'Pincode opnieuw ingesteld', resetMessage: 'Je pincode is op dit apparaat opnieuw ingesteld. Voor de veiligheid hebben we ook een e-mail naar je account gestuurd.',
        errorTitle: 'Fout', errorMessage: 'De e-mail voor het opnieuw instellen kon niet worden verzonden. Probeer het later opnieuw.',
      },
      intro: {
        title: 'Welkom bij Insight!', subtitle: 'Hier is een kort overzicht van je nieuwe plek voor reflectie en groei',
        journalTitle: 'Schrijf je gedachten op', journalDescription: 'Tik op de knop + om items te maken en je emoties bij te houden',
        progressTitle: 'Volg je voortgang', progressDescription: 'Bekijk inzichten en patronen in je emotionele ontwikkeling',
        habitsTitle: 'Bouw gezonde gewoonten op', habitsDescription: 'Gebruik hulpmiddelen voor meditatie, dankbaarheid en welzijn', getStarted: 'Aan de slag',
      },
      dailyMood: {
        greeting: 'Hoi, {{name}}. Hoe voel je je deze {{timeOfDay}}?', greetingAnonymous: 'Hoi. Hoe voel je je deze {{timeOfDay}}?', morning: 'ochtend', afternoon: 'middag', evening: 'avond',
        moods: { 1: 'Moeilijk', 2: 'Niet geweldig', 3: 'Matig', 4: 'Redelijk', 5: 'Oké', 6: 'Goed', 7: 'Heel goed', 8: 'Echt goed', 9: 'Geweldig', 10: 'Ongelooflijk' },
        writeAboutIt: 'Wil je erover schrijven?', maybeLater: 'Misschien later',
      },
      auth: { signIn: 'Inloggen', apple: 'Inloggen met Apple', google: 'Inloggen met Google', email: 'Doorgaan met e-mail', termsPrefix: 'Door verder te gaan, ga je akkoord met onze', termsOfService: 'Servicevoorwaarden', and: 'en ons', privacyPolicy: 'Privacybeleid' },
    },
  },
};

function getNested(tree: TranslationTree, path: string): string | undefined {
  let current: string | TranslationTree = tree;
  for (const part of path.split('.')) {
    if (typeof current !== 'object' || current == null || !(part in current)) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function translateComponent(
  language: AppLanguage,
  key: string,
  params?: Record<string, string | number>,
): string | undefined {
  const primary = componentTranslations[language];
  const fallback = componentTranslations.en;
  let value = (primary && getNested(primary, key)) ?? (fallback && getNested(fallback, key));
  if (!value) return undefined;

  if (params) {
    Object.entries(params).forEach(([name, replacement]) => {
      value = value!.replace(new RegExp(`{{${name}}}`, 'g'), String(replacement));
    });
  }
  return value;
}
