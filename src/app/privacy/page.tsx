export const metadata = {
  title: "سياسة الخصوصية | تصويت الفرح",
};

export default function PrivacyPage() {
  return (
    <main
      dir="rtl"
      className="mx-auto max-w-2xl px-4 py-10 leading-relaxed"
    >
      <h1 className="mb-6 text-2xl font-bold">سياسة الخصوصية</h1>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">البيانات التي نجمعها</h2>
        <p>
          عند تسجيل الدخول بحساب جوجل، نحصل فقط على اسمك وبريدك الإلكتروني
          لتحديد هويتك داخل التطبيق وتسجيل تصويتك.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">كيف نستخدم البيانات</h2>
        <p>
          نستخدم هذه البيانات فقط لتشغيل تصويت الفرح ومنع التصويت أكثر من
          مرة. لا نبيع بياناتك ولا نشاركها مع أي جهة أخرى.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">حذف البيانات</h2>
        <p>
          يمكنك طلب حذف بياناتك في أي وقت عن طريق التواصل معنا على:
          abdelrahman.dev.ali@gmail.com
        </p>
      </section>

    </main>
  );
}