import type { AppLanguage, TranslationTree } from '../types';

export const baseFeatureTranslations: Partial<Record<AppLanguage, TranslationTree>> = {
  zh: {
    common: { done: '完成', cancel: '取消', back: '返回', save: '保存', close: '关闭', continue: '继续', loading: '加载中…', error: '错误', retry: '重试' },
    language: { selectTitle: '选择语言', settingLabel: '语言', settingDescription: '应用文字和 AI 洞察' },
    tabs: { home: '首页', journal: '日记', dashboard: '分析', companion: '伙伴' },
  },
  hi: {
    common: { done: 'हो गया', cancel: 'रद्द करें', back: 'वापस', save: 'सहेजें', close: 'बंद करें', continue: 'जारी रखें', loading: 'लोड हो रहा है…', error: 'त्रुटि', retry: 'फिर कोशिश करें' },
    language: { selectTitle: 'भाषा चुनें', settingLabel: 'भाषा', settingDescription: 'ऐप टेक्स्ट और AI इनसाइट्स' },
    tabs: { home: 'होम', journal: 'जर्नल', dashboard: 'डैशबोर्ड', companion: 'साथी' },
  },
  fr: {
    common: { done: 'Terminé', cancel: 'Annuler', back: 'Retour', save: 'Enregistrer', close: 'Fermer', continue: 'Continuer', loading: 'Chargement…', error: 'Erreur', retry: 'Réessayer' },
    language: { selectTitle: 'Choisir la langue', settingLabel: 'Langue', settingDescription: "Texte de l'app et analyses IA" },
    tabs: { home: 'Accueil', journal: 'Journal', dashboard: 'Tableau de bord', companion: 'Compagnon' },
  },
  de: {
    common: { done: 'Fertig', cancel: 'Abbrechen', back: 'Zurück', save: 'Speichern', close: 'Schließen', continue: 'Weiter', loading: 'Wird geladen…', error: 'Fehler', retry: 'Erneut versuchen' },
    language: { selectTitle: 'Sprache auswählen', settingLabel: 'Sprache', settingDescription: 'App-Texte und KI-Einblicke' },
    tabs: { home: 'Start', journal: 'Tagebuch', dashboard: 'Übersicht', companion: 'Begleiter' },
  },
  ru: {
    common: { done: 'Готово', cancel: 'Отмена', back: 'Назад', save: 'Сохранить', close: 'Закрыть', continue: 'Продолжить', loading: 'Загрузка…', error: 'Ошибка', retry: 'Повторить' },
    language: { selectTitle: 'Выберите язык', settingLabel: 'Язык', settingDescription: 'Текст приложения и ИИ-инсайты' },
    tabs: { home: 'Главная', journal: 'Дневник', dashboard: 'Обзор', companion: 'Помощник' },
  },
  pt: {
    common: { done: 'Concluído', cancel: 'Cancelar', back: 'Voltar', save: 'Salvar', close: 'Fechar', continue: 'Continuar', loading: 'Carregando…', error: 'Erro', retry: 'Tentar novamente' },
    language: { selectTitle: 'Selecionar idioma', settingLabel: 'Idioma', settingDescription: 'Texto do app e insights de IA' },
    tabs: { home: 'Início', journal: 'Diário', dashboard: 'Painel', companion: 'Companheiro' },
  },
  it: {
    common: { done: 'Fatto', cancel: 'Annulla', back: 'Indietro', save: 'Salva', close: 'Chiudi', continue: 'Continua', loading: 'Caricamento…', error: 'Errore', retry: 'Riprova' },
    language: { selectTitle: 'Seleziona lingua', settingLabel: 'Lingua', settingDescription: "Testo dell'app e insight IA" },
    tabs: { home: 'Home', journal: 'Diario', dashboard: 'Dashboard', companion: 'Compagno' },
  },
  ro: {
    common: { done: 'Gata', cancel: 'Anulează', back: 'Înapoi', save: 'Salvează', close: 'Închide', continue: 'Continuă', loading: 'Se încarcă…', error: 'Eroare', retry: 'Încearcă din nou' },
    language: { selectTitle: 'Selectează limba', settingLabel: 'Limbă', settingDescription: 'Textul aplicației și informații AI' },
    tabs: { home: 'Acasă', journal: 'Jurnal', dashboard: 'Panou', companion: 'Companion' },
  },
  az: {
    common: { done: 'Hazır', cancel: 'Ləğv et', back: 'Geri', save: 'Yadda saxla', close: 'Bağla', continue: 'Davam et', loading: 'Yüklənir…', error: 'Xəta', retry: 'Yenidən cəhd et' },
    language: { selectTitle: 'Dil seçin', settingLabel: 'Dil', settingDescription: 'Tətbiq mətni və AI təhlilləri' },
    tabs: { home: 'Ana səhifə', journal: 'Gündəlik', dashboard: 'Panel', companion: 'Yoldaş' },
  },
  nl: {
    common: { done: 'Klaar', cancel: 'Annuleren', back: 'Terug', save: 'Opslaan', close: 'Sluiten', continue: 'Doorgaan', loading: 'Laden…', error: 'Fout', retry: 'Opnieuw proberen' },
    language: { selectTitle: 'Taal selecteren', settingLabel: 'Taal', settingDescription: 'App-tekst en AI-inzichten' },
    tabs: { home: 'Home', journal: 'Dagboek', dashboard: 'Dashboard', companion: 'Metgezel' },
  },
};
