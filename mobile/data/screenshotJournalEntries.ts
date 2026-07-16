import { AppLanguage } from '../i18n/types';

export type ScreenshotEntry = {
  title: string;
  content: string;
};

/**
 * Copy-paste journal entries for App Store screenshot prep.
 *
 * Workflow per locale:
 * 1. Set app language (onboarding flag or Profile → Language)
 * 2. Create each entry below, then tap Analyze
 * 3. Open Dashboard — patterns use only insights tagged with that locale
 *
 * Tip: hide or delete old English entries on your demo account if you want
 * a completely clean journal list for screenshots.
 */
export const SCREENSHOT_JOURNAL_ENTRIES: Record<AppLanguage, ScreenshotEntry[]> = {
  en: [
    {
      title: 'A calm morning walk',
      content:
        'Woke up earlier than usual and took a slow walk before work. The air felt fresh and I noticed small things I usually rush past — birds, light on the trees, a quiet street. I felt hopeful about the day instead of dreading my inbox. I want to keep this small ritual; it cost almost nothing but changed my mood completely.',
    },
    {
      title: 'Work stress, but coping',
      content:
        'Today was demanding. A deadline moved up and I felt frustrated and tense by afternoon. Instead of spiralling, I stepped away for ten minutes, drank water, and wrote down what I could control. I finished the most important task and let the rest wait. I am tired, but proud I did not let anxiety run the whole day.',
    },
    {
      title: 'Sleep routine reset',
      content:
        'I have been going to bed too late and waking up drained. Tonight I put my phone away at ten, read for twenty minutes, and actually felt sleepy. My mind was still busy, but softer. I am anxious about tomorrow, yet I can see how rest helps me think clearly. One good night will not fix everything, but it is a start.',
    },
  ],
  es: [
    {
      title: 'Un paseo tranquilo por la mañana',
      content:
        'Me desperté más temprano de lo habitual y salí a caminar despacio antes del trabajo. El aire se sentía fresco y noté pequeñas cosas que normalmente paso por alto: pájaros, la luz en los árboles, una calle silenciosa. Me sentí esperanzado con el día en lugar de temer mi bandeja de entrada. Quiero mantener este pequeño ritual; casi no costó nada pero cambió por completo mi estado de ánimo.',
    },
    {
      title: 'Estrés laboral, pero afrontándolo',
      content:
        'Hoy fue exigente. Adelantaron una fecha límite y por la tarde me sentí frustrado y tenso. En lugar de hundirme, me alejé diez minutos, bebí agua y escribí lo que podía controlar. Terminé la tarea más importante y dejé el resto para después. Estoy cansado, pero orgulloso de no haber dejado que la ansiedad dominara todo el día.',
    },
    {
      title: 'Reinicio de la rutina de sueño',
      content:
        'He estado acostándome demasiado tarde y despertándome agotado. Esta noche dejé el móvil a las diez, leí veinte minutos y realmente me dio sueño. Mi mente seguía activa, pero más tranquila. Estoy ansioso por mañana, pero veo cómo el descanso me ayuda a pensar con claridad. Una buena noche no lo arregla todo, pero es un comienzo.',
    },
  ],
  fr: [
    {
      title: 'Une promenade calme le matin',
      content:
        "Je me suis réveillé plus tôt que d'habitude et j'ai fait une promenade lente avant le travail. L'air était frais et j'ai remarqué de petites choses que je passe d'habitude — des oiseaux, la lumière sur les arbres, une rue silencieuse. Je me suis senti plein d'espoir pour la journée au lieu de craindre ma boîte mail. Je veux garder ce petit rituel ; il n'a presque rien coûté mais a complètement changé mon humeur.",
    },
    {
      title: 'Stress au travail, mais j\'avance',
      content:
        "Aujourd'hui a été exigeant. Une échéance a été avancée et l'après-midi je me suis senti frustré et tendu. Au lieu de ruminer, je me suis éloigné dix minutes, j'ai bu de l'eau et j'ai noté ce que je pouvais contrôler. J'ai terminé la tâche la plus importante et laissé le reste pour plus tard. Je suis fatigué, mais fier de ne pas avoir laissé l'anxiété diriger toute la journée.",
    },
    {
      title: 'Reprendre une routine de sommeil',
      content:
        "Je me couche trop tard et je me réveille épuisé. Ce soir j'ai posé mon téléphone à vingt-deux heures, lu vingt minutes et j'ai vraiment eu sommeil. Mon esprit était encore actif, mais plus doux. Je suis anxieux pour demain, mais je vois comment le repos m'aide à penser clairement. Une bonne nuit ne règle pas tout, mais c'est un début.",
    },
  ],
  de: [
    {
      title: 'Ein ruhiger Morgenspaziergang',
      content:
        'Ich bin früher als sonst aufgewacht und bin vor der Arbeit langsam spazieren gegangen. Die Luft fühlte sich frisch an und ich habe kleine Dinge bemerkt, die ich normalerweise übersehe — Vögel, Licht auf den Bäumen, eine ruhige Straße. Ich fühlte mich hoffnungsvoll für den Tag, statt mein Postfach zu fürchten. Dieses kleine Ritual will ich behalten; es hat fast nichts gekostet, aber meine Stimmung komplett verändert.',
    },
    {
      title: 'Arbeitsstress, aber ich komme zurecht',
      content:
        'Heute war anstrengend. Eine Frist wurde vorgezogen und am Nachmittag fühlte ich mich frustriert und angespannt. Statt zu kreiseln, bin ich zehn Minuten weggegangen, habe Wasser getrunken und aufgeschrieben, was ich kontrollieren kann. Die wichtigste Aufgabe habe ich erledigt und den Rest warten lassen. Ich bin müde, aber stolz, dass die Angst nicht den ganzen Tag bestimmt hat.',
    },
    {
      title: 'Schlafroutine neu starten',
      content:
        'Ich gehe zu spät ins Bett und wache erschöpft auf. Heute Abend habe ich um zehn das Handy weggelegt, zwanzig Minuten gelesen und war wirklich müde. Mein Kopf war noch aktiv, aber weicher. Ich bin ängstlich wegen morgen, sehe aber, wie Erholung mir hilft, klar zu denken. Eine gute Nacht löst nicht alles, aber es ist ein Anfang.',
    },
  ],
  pt: [
    {
      title: 'Uma caminhada calma de manhã',
      content:
        'Acordei mais cedo do que o normal e fiz uma caminhada lenta antes do trabalho. O ar estava fresco e percebi pequenas coisas que costumo ignorar — pássaros, luz nas árvores, uma rua silenciosa. Senti esperança no dia em vez de medo da caixa de entrada. Quero manter esse pequeno ritual; quase não custou nada, mas mudou completamente meu humor.',
    },
    {
      title: 'Estresse no trabalho, mas lidando',
      content:
        'Hoje foi exigente. Um prazo foi antecipado e à tarde me senti frustrado e tenso. Em vez de entrar em espiral, me afastei por dez minutos, bebi água e escrevi o que podia controlar. Terminei a tarefa mais importante e deixei o resto para depois. Estou cansado, mas orgulhoso de não ter deixado a ansiedade dominar o dia inteiro.',
    },
    {
      title: 'Reiniciar a rotina de sono',
      content:
        'Tenho ido dormir tarde e acordado exausto. Hoje à noite guardei o celular às dez, li por vinte minutos e realmente senti sono. Minha mente ainda estava ativa, mas mais suave. Estou ansioso com amanhã, mas vejo como o descanso me ajuda a pensar com clareza. Uma boa noite não resolve tudo, mas é um começo.',
    },
  ],
  it: [
    {
      title: 'Una passeggiata tranquilla al mattino',
      content:
        'Mi sono svegliato prima del solito e ho fatto una passeggiata lenta prima del lavoro. L\'aria era fresca e ho notato piccole cose che di solito ignoro — uccelli, luce sugli alberi, una strada silenziosa. Mi sono sentito pieno di speranza per la giornata invece di temere la posta in arrivo. Voglio mantenere questo piccolo rituale; è costato quasi nulla ma ha cambiato completamente il mio umore.',
    },
    {
      title: 'Stress al lavoro, ma sto gestendo',
      content:
        'Oggi è stata impegnativa. Una scadenza è stata anticipata e nel pomeriggio mi sono sentito frustrato e teso. Invece di rimuginare, mi sono allontanato per dieci minuti, ho bevuto acqua e ho scritto ciò che potevo controllare. Ho finito il compito più importante e ho lasciato il resto per dopo. Sono stanco, ma orgoglioso di non aver lasciato che l\'ansia dominasse tutta la giornata.',
    },
    {
      title: 'Riprendere la routine del sonno',
      content:
        'Vado a letto troppo tardi e mi sveglio esausto. Stasera ho messo via il telefono alle dieci, ho letto per venti minuti e ho davvero avuto sonno. La mente era ancora attiva, ma più morbida. Sono ansioso per domani, ma vedo come il riposo mi aiuti a pensare con chiarezza. Una buona notte non risolve tutto, ma è un inizio.',
    },
  ],
  nl: [
    {
      title: 'Een rustige ochtendwandeling',
      content:
        'Ik werd eerder wakker dan normaal en maakte een rustige wandeling voor het werk. De lucht voelde fris en ik merkte kleine dingen op die ik meestal mis — vogels, licht op de bomen, een stille straat. Ik voelde me hoopvol voor de dag in plaats van bang voor mijn inbox. Dit kleine ritueel wil ik houden; het kostte bijna niets maar veranderde mijn humeur volledig.',
    },
    {
      title: 'Werkstress, maar ik houd het vol',
      content:
        'Vandaag was zwaar. Een deadline werd vervroegd en in de middag voelde ik me gefrustreerd en gespannen. In plaats van te blijven malen, stapte ik tien minuten weg, dronk water en schreef op wat ik kon controleren. Ik maakte de belangrijkste taak af en liet de rest wachten. Ik ben moe, maar trots dat angst niet de hele dag bepaalde.',
    },
    {
      title: 'Slaaproutine opnieuw beginnen',
      content:
        'Ik ga te laat naar bed en word uitgeput wakker. Vanavond legde ik mijn telefoon om tien uur weg, las twintig minuten en werd echt slaperig. Mijn hoofd was nog actief, maar zachter. Ik ben angstig voor morgen, maar zie hoe rust me helpt helder te denken. Eén goede nacht lost niet alles op, maar het is een begin.',
    },
  ],
  ru: [
    {
      title: 'Спокойная утренняя прогулка',
      content:
        'Я проснулся раньше обычного и неспешно прогулялся перед работой. Воздух был свежим, и я заметил мелочи, которые обычно пропускаю — птиц, свет на деревьях, тихую улицу. Я почувствовал надежду на день, а не страх перед почтой. Хочу сохранить этот небольшой ритуал; он почти ничего не стоил, но полностью изменил моё настроение.',
    },
    {
      title: 'Стресс на работе, но я справляюсь',
      content:
        'Сегодня был тяжёлый день. Срок сдвинули, и к вечеру я чувствовал раздражение и напряжение. Вместо того чтобы зациклиться, я отошёл на десять минут, выпил воды и записал, что могу контролировать. Я закончил самую важную задачу и оставил остальное на потом. Я устал, но горжусь, что не позволил тревоге управлять всем днём.',
    },
    {
      title: 'Перезапуск режима сна',
      content:
        'Я ложусь слишком поздно и просыпаюсь разбитым. Сегодня вечером убрал телефон в десять, читал двадцать минут и действительно захотел спать. Мысли ещё бегали, но мягче. Я тревожусь о завтрашнем дне, но вижу, как отдых помогает думать яснее. Одна хорошая ночь не решит всё, но это начало.',
    },
  ],
  zh: [
    {
      title: '清晨的安静散步',
      content:
        '今天比平时醒得更早，上班前慢慢散了一会儿步。空气很清新，我注意到了平时会忽略的小事——鸟叫、树上的光、安静的街道。我对这一天感到充满希望，而不是害怕收件箱。我想保持这个小习惯；它几乎不花时间，却完全改变了我的心情。',
    },
    {
      title: '工作压力，但我在应对',
      content:
        '今天很有挑战。截止日期提前了，下午我感到沮丧和紧张。我没有一直胡思乱想，而是离开十分钟，喝了水，写下我能控制的事情。我完成了最重要的任务，把其他的留到以后。我很累，但庆幸没有让焦虑掌控一整天。',
    },
    {
      title: '重新建立睡眠习惯',
      content:
        '我最近睡得太晚，醒来总是很疲惫。今晚十点放下手机，读了二十分钟，真的有了睡意。脑子还在转，但温和了许多。我对明天有些焦虑，但也看到休息能让我更清晰地思考。一个好夜晚不能解决一切，但这是一个开始。',
    },
  ],
  hi: [
    {
      title: 'शांत सुबह की सैर',
      content:
        'मैं हमेशा से पहले जाग गया और काम से पहले धीरे-धीरे टहलने निकला। हवा ताज़ी लग रही थी और मैंने छोटी-छोटी चीज़ें देखीं जिन्हें मैं आमतौर पर अनदेखा कर देता हूँ — पक्षी, पेड़ों पर रोशनी, शांत गली। मुझे दिन के लिए उम्मीद महसूस हुई, इनबॉक्स से डर नहीं। मैं यह छोटा सा अभ्यास जारी रखना चाहता हूँ; इसकी लागत लगभग कुछ नहीं थी लेकिन मेरा मूड पूरी तरह बदल गया।',
    },
    {
      title: 'काम का तनाव, पर संभाल रहा हूँ',
      content:
        'आज का दिन मुश्किल था। डेडलाइन पहले कर दी गई और दोपहर तक मैं निराश और तनावग्रस्त महसूस कर रहा था। घूमने के बजाय मैं दस मिनट दूर गया, पानी पिया और लिखा कि मैं क्या नियंत्रित कर सकता हूँ। मैंने सबसे ज़रूरी काम पूरा किया और बाकी बाद के लिए छोड़ दिया। मैं थका हूँ, लेकिन गर्व है कि चिंता ने पूरा दिन नहीं चलाया।',
    },
    {
      title: 'नींद की दिनचर्या फिर से',
      content:
        'मैं बहुत देर से सो रहा हूँ और थककर उठता हूँ। आज रात दस बजे फोन रख दिया, बीस मिनट पढ़ा और सच में नींद आई। दिमाग अभी भी सक्रिय था, लेकिन नरम। कल को लेकर चिंता है, फिर भी देख रहा हूँ कि आराम साफ़ सोचने में मदद करता है। एक अच्छी रात सब ठीक नहीं करती, लेकिन यह शुरुआत है।',
    },
  ],
  ro: [
    {
      title: 'O plimbare liniștită dimineața',
      content:
        'M-am trezit mai devreme decât de obicei și am făcut o plimbare lentă înainte de muncă. Aerul era proaspăt și am observat lucruri mici pe care de obicei le trec cu vederea — păsări, lumină în copaci, o stradă liniștită. M-am simțit plin de speranță pentru ziua aceea, nu temător de inbox. Vreau să păstrez acest mic ritual; a costat aproape nimic, dar mi-a schimbat complet starea.',
    },
    {
      title: 'Stres la muncă, dar mă descurc',
      content:
        'Astăzi a fost solicitant. Un termen a fost mutat mai devreme și după-amiaza m-am simțit frustrat și tensionat. În loc să mă tot gândesc, m-am îndepărtat zece minute, am băut apă și am scris ce pot controla. Am terminat sarcina cea mai importantă și am lăsat restul pentru mai târziu. Sunt obosit, dar mândru că nu am lăsat anxietatea să conducă toată ziua.',
    },
    {
      title: 'Reluarea rutinei de somn',
      content:
        'Mă culc prea târziu și mă trezesc epuizat. Diseară am lăsat telefonul la zece, am citit douăzeci de minute și chiar mi-a fost somn. Mintea era încă activă, dar mai blândă. Sunt anxios pentru mâine, dar văd cum odihna mă ajută să gândesc clar. O noapte bună nu rezolvă totul, dar e un început.',
    },
  ],
  az: [
    {
      title: 'Sakit səhər gəzintisi',
      content:
        'Adətən olduğundan daha tez oyandım və işə qədər yavaş-yavaş gəzdim. Hava təzə idi və adətən görmədiyim kiçik şeyləri fərq etdim — quşlar, ağaclardakı işıq, sakit küçə. Günə ümidlə baxdım, poçt qutusundan qorxmadım. Bu kiçik ritualı saxlamaq istəyirəm; demək olar ki, heç nəyə başa gəlmədi, amma əhvalımı tamamilə dəyişdi.',
    },
    {
      title: 'İş stressi, amma idarə edirəm',
      content:
        'Bu gün çətin keçdi. Son tarix irəli çəkildi və günortadan sonra özümü əsəbi və gərgin hiss etdim. Fikirləşmək əvəzinə on dəqiqə uzaqlaşdım, su içdim və nəyi idarə edə biləcəyimi yazdım. Ən vacib işi bitirdim, qalanını sonraya saxladım. Yorğunam, amma narahatlığın bütün günü idarə etməsinə imkan vermədiyimə görə fəxr edirəm.',
    },
    {
      title: 'Yuxu rejimini yenidən başlamaq',
      content:
        'Çox gec yatıram və yorğun oyanıram. Bu axşam saat onda telefonu qoydum, iyirmi dəqiqə oxudum və həqiqətən yuxum gəldi. Ağlım hələ də aktiv idi, amma daha yumşaq. Sabaha görə narahatam, amma görürəm ki, istirahət aydın düşünməyə kömək edir. Bir yaxşı gecə hər şeyi həll etmir, amma başlanğıcdır.',
    },
  ],
};
