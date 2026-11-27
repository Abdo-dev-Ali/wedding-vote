
export const siteConfig = {
  name: "تصويت الفرح",
  title: "مين هيكسب؟ Awad 🤵🏻 ولا S 👰🏻",
  description: "شاركنا فرحتنا وصوّت لعوض أو S، والنتيجة بتتحدث قدامك على طول.",
  locale: "ar_EG",

  url: "https://wedding-vote-awad-s.vercel.app",
  indexable: false,

  image: {
    path: "/og-image.jpg",
    width: 1200,
    height: 630,
    alt: "عوض و S في صورة الفرح",
  },

  sides: {
    groom: { name: "Awad ", label: "🤵🏻" }, // label = الكلمة اللي جنب الاسم (بند 12)
    bride: {label: "👰🏻",  name: "S" },
  },  
    home: {
    tagline: "سجّل دخولك بحساب Google وصوّت",
    loginButton: "سجّل بـ Google",
    privacyNote: "بنأخد اسمك وإيميلك بس من Google",
    welcome: "أهلًا يا",
    logout: "تسجيل الخروج",
    authError: "حصلت مشكلة في تسجيل الدخول، جرّب تاني",
  },

    weddingId: "awad-s",

  summary: { participants: "عدد المشاركين" },

  vote: {
    heading: "اختار طرفك",
    phoneLabel: "رقم موبايلك",
    phoneHint: "11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015",
    messageLabel: "رسالة (اختيارية)",
    messagePlaceholder: "اكتب رسالة قصيرة...",
    messageMax: 150,
    submit: "صوّت",
    submitting: "جاري التصويت...",
    consent: {
      none: "رقمك هيظهر للعروسة أو للعريس (حسب اللي هتختاره) فقط، ومش هتقدر تعدّله بعد التصويت",
      bride: "رقمك هيظهر للعروسة فقط، ومش هتقدر تعدّله بعد التصويت",
      groom: "رقمك هيظهر للعريس فقط، ومش هتقدر تعدّله بعد التصويت",
    },
    errors: {
      chooseSide: "اختار طرف الأول",
      invalid_phone: "الرقم لازم يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015",
      message_too_long: "الرسالة أطول من 150 حرف",
      phone_taken: "الرقم ده مستخدم قبل كده، استخدم رقمك إنت",
      generic: "حصلت مشكلة، جرّب تاني",
    },
  },

  states: {
    voted: "تم تسجيل صوتك، شكرًا لك 🤍",
    removed: "إنت صوّت قبل كده",
    closed: "التصويت مقفول دلوقتي",
    roleBride: "حسابك حساب العروسة، ومش بتصوّت",
    roleGroom: "حسابك حساب العريس، ومش بتصوّت",
    error: "مقدرناش نجيب حالتك، حدّث الصفحة",
  },
    results: {
    pollSeconds: 10, // كل كام ثانية الأعداد تتحدث
    yourChoice: "اخترت",
  },
    dashboard: {
    title: { bride: "صفحتك ياعروسه", groom: "صفحتك ياعريس" },
    back: "الرئيسية",
    votersCount: "عدد المصوتين",
    chartTitle: "معدل التصويت بالساعة",
    chartEmpty: "لسه مفيش أصوات",
    listTitle: "المصوتين",
    listEmpty: "لسه محدش صوت",
    noMessage: "من غير رسالة",
    whatsapp: "واتساب",
    whatsappText: "شكرًا يا {name} إنك صوّت لنا ❤️",
    delete: "حذف",
    confirmDelete: "متأكد إنك عايز تحذف صوت {name}؟",
    confirmYes: "أيوه، احذف",
    confirmNo: "إلغاء",
    deleteError: "مقدرناش نحذف، جرّب تاني",
    refreshSeconds: 30, // تحديث القائمة تلقائيًا
  },
    milestoneCard: {
    defaultEmoji: "🎉",
    reached: {
      bride: "{name} وصلت لـ {count} صوت أولًا",
      groom: "{name} وصل لـ {count} صوت أولًا",
    },
  },
  
    leaderboard: {
    title: "مين جاب أكتر ناس",
    votes: "صوت",
  },
    share: {
    button: "شارك الموقع",
    qrShow: "عرض QR",
    qrHide: "إخفاء QR",
    qrHint: "خلّي صاحبك يصوّر الكود بكاميرا الموبايل",
    consent: "اسمك الأول هيظهر في ترتيب مين جاب أكتر ناس",
    text: "تعالى صوّت معانا في الفرح ❤️",
    copied: "اتنسخ الرابط ✓",
    error: "حصلت مشكلة، جرّب تاني",
  },
    specialMessage: {
    title: {
      bride: "رسالة من العروسة ❤️",
      groom: "رسالة من العريس ❤️",
    },
  },
    quiz: {
    start: "جولة أسئلة 🎯",
    hide: "إخفاء",
    title: "جولة الأسئلة",
    progress: "سؤال {current} من {total}",
    next: "السؤال التالي",
    finish: "خلصنا",
    done: "شكرًا إنك شاركت ❤️",
    error: "حصلت مشكلة، جرّب تاني",
  },
};