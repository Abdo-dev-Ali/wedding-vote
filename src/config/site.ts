
export const siteConfig = {
  name: "تصويت الفرح",
  title: "مين هيكسب؟ عوض ولا S ❤️",
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
    groom: { name: "عوض", label: "❤️" }, // label = الكلمة اللي جنب الاسم (بند 12)
    bride: { name: "S", label: "❤️" },
  },  
};