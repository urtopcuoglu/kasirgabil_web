-- Faz 5: İçerik ve Blog modülü
-- Site içerikleri (iletişim, banka hesapları, hakkımızda, anasayfa slider, yasal sayfalar), blog ve görsel deposu.
-- Vitrin bu tabloları anonim olarak okur; yalnızca panel kullanıcıları yazar.

-- ─────────────────────────────────────────────────────────────
-- site_icerikleri: anahtar → JSON içerik. Başlangıç verisi sitedeki mevcut metinlerdir.
-- ─────────────────────────────────────────────────────────────
create table public.site_icerikleri (
    anahtar         text primary key check (anahtar in (
                        'iletisim', 'banka_hesaplari', 'hakkimizda', 'anasayfa_slider',
                        'kvkk', 'gizlilik', 'iade', 'mesafeli')),
    deger           jsonb not null,
    guncelleyen_id  uuid default auth.uid() references auth.users (id) on delete set null,
    updated_at      timestamptz not null default now()
);

create index site_icerikleri_guncelleyen_idx on public.site_icerikleri (guncelleyen_id);

create trigger site_icerikleri_updated_at
    before update on public.site_icerikleri
    for each row execute function public.updated_at_guncelle();

insert into public.site_icerikleri (anahtar, deger) values
    ('iletisim', $icerik${"telefonlar": ["0 (312) 431 02 64", "0 (312) 312 60 11", "0 (505) 387 79 39"], "whatsapp": "905053877939", "eposta": "info@kasirgabilgisayar.com", "adres": "Cumhuriyet Mh. Bayındır-1 Sk. No:5/10\nKızılay - Çankaya / Ankara", "harita_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3059.7719635465!2d32.85353607565204!3d39.92411908547474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d34e55abbc6c7d%3A0xa2355776a7dcc283!2sKas%C4%B1rga%20Bilgisayar!5e0!3m2!1str!2str!4v1757352239708!5m2!1str!2str", "instagram": "https://www.instagram.com/kasirgabilgisayar", "linkedin": "https://www.linkedin.com/company/kasirgabilgisayar", "sahibinden": "https://kasirgabilgisayar.sahibinden.com/"}$icerik$::jsonb),
    ('banka_hesaplari', $icerik${"hesaplar": [{"logo": "/bank/enpara.png", "hesap_adi": "Barbaros ER", "sube": "", "hesap_no": "", "iban": "TR-98-0011-1000-0000-0085-3692-20"}, {"logo": "/bank/yapi-kredi.jpg", "hesap_adi": "Barbaros ER", "sube": "Kızılay Şubesi", "hesap_no": "", "iban": "TR43-0006-7010-0000-0087-136558"}, {"logo": "/bank/garanti.png", "hesap_adi": "Garanti Bankası", "sube": "Kızılay Şubesi 082", "hesap_no": "6290386", "iban": "TR37-0006-2000-0820-0006-2903-86"}, {"logo": "/bank/is-bankasi.png", "hesap_adi": "Barbaros ER", "sube": "Isparta Merkez Şubesi (3300)", "hesap_no": "0799263", "iban": "TR55-0006-4000-0013-3000-799263"}]}$icerik$::jsonb),
    ('hakkimizda', $icerik${"biz_kimiz": "<p>Kasırga Bilgisayar, 1999 yılında Ankara Adil Han İş Hanında, Babaros Er tarafından küçük bir dükkan içerisinde kuruldu. Uzun yıllar Adil Han İş hanında hizmet veren Kasırga Bilgisayar, kalitesi ve profesyonel hizmeti ile her zaman bir ileri giderek büyümüştür. Ankara'nın en köklü en eski ve en başarılı Bilgisayar hizmetleri veren bir yer olma konumundadır. Kasırga Bilgisayar deneyimi ve profesyonel ekibi ile siz değerli müşterilere hizmet vermeye ve büyümeye devam edecektir.</p>", "misyon": "1999 yılından beri Ankara'da edindiğimiz tecrübeyle, müşterilerimize en kaliteli ve profesyonel bilgisayar hizmetlerini sunmak. Her geçen gün büyüyen ve gelişen bir firma olarak, teknolojiyi yakından takip ederek kaliteden ödün vermeden güvenilir bir çözüm ortağı olmayı hedefliyoruz.", "vizyon": "Ankara'nın en köklü ve başarılı bilgisayar hizmeti veren firması olma konumumuzu koruyarak, profesyonel ekibimizle sürekli büyüyen bir müşteri kitlesine hitap etmek. Müşteri memnuniyetini daima ön planda tutarak sektördeki liderliğimizi sürdürmek ve yenilikçi çözümlerimizle geleceğin teknolojisine yön veren bir marka olmaktır.", "gorsel": "/about/kasirga-pc-dis-cekim.png"}$icerik$::jsonb),
    ('anasayfa_slider', $icerik${"slaytlar": [{"gorsel": "/slider_image/slider-1.jpg", "aciklama": "", "link": ""}, {"gorsel": "/slider_image/slider-2.jpg", "aciklama": "", "link": ""}, {"gorsel": "/slider_image/slider-3.jpg", "aciklama": "", "link": ""}]}$icerik$::jsonb),
    ('kvkk', $icerik${"baslik": "Kişisel Verilerin Korunması Aydınlatma Metni", "icerik": "<p>Son güncelleme: Mayıs 2025</p><blockquote><p>Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat kapsamında veri sorumlusu sıfatıyla Kasırga Bilgisayar tarafından hazırlanmıştır.</p></blockquote><h2>1. Veri Sorumlusu</h2><p>6698 sayılı KVKK uyarınca kişisel verileriniz; veri sorumlusu sıfatıyla <strong>Kasırga Bilgisayar</strong> (Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara) tarafından aşağıda açıklanan kapsamda işlenecektir.</p><h2>2. İşlenen Kişisel Veriler</h2><p>İşletmemiz tarafından işlenebilecek kişisel verileriniz şunlardır:</p><ul><li><strong>Kimlik verileri:</strong> Ad, soyad</li><li><strong>İletişim verileri:</strong> Telefon numarası, e-posta adresi, adres</li><li><strong>İşlem güvenliği verileri:</strong> IP adresi, tarayıcı ve cihaz bilgileri</li><li><strong>Hizmet talep verileri:</strong> Teknik servis, onarım, satın alma talep bilgileri</li></ul><h2>3. Kişisel Verilerin İşlenme Amaçları</h2><p>Kişisel verileriniz aşağıdaki amaçlar doğrultusunda işlenmektedir:</p><ul><li>Ürün ve hizmetlerin sunulması ile satış ve satış sonrası süreçlerin yürütülmesi</li><li>Teknik servis hizmetlerinin planlanması ve takibi</li><li>Müşteri ilişkileri yönetimi</li><li>İletişim faaliyetlerinin yürütülmesi</li><li>Yasal yükümlülüklerin yerine getirilmesi</li><li>Şikâyet ve talep yönetimi</li></ul><h2>4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2><p>Kişisel verileriniz; iletişim formları, telefon görüşmeleri, e-posta yazışmaları ve fiziksel başvuru yoluyla toplanmaktadır. Bu veriler; KVKK'nın 5. maddesi uyarınca <em>sözleşmenin kurulması veya ifası</em>, <em>meşru menfaat</em> ve <em>yasal yükümlülüklerin yerine getirilmesi</em> hukuki sebeplerine dayanılarak işlenmektedir.</p><h2>5. Kişisel Verilerin Aktarılması</h2><p>Kişisel verileriniz; yasal zorunluluklar, hizmet sunumu ve meşru menfaat gereklilikleri kapsamında; iş ortaklarımıza, yetkili kamu kurum ve kuruluşlarına ve hizmet aldığımız tedarikçilere aktarılabilir. Bu aktarımlar KVKK ve ilgili mevzuat çerçevesinde gerçekleştirilmektedir.</p><h2>6. KVKK Kapsamındaki Haklarınız</h2><p>KVKK'nın 11. maddesi uyarınca veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz:</p><ul><li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li><li>İşlenmişse buna ilişkin bilgi talep etme</li><li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li><li>Yurt içinde veya dışında aktarıldığı üçüncü kişileri bilme</li><li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li><li>KVKK'nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme</li><li>Düzeltme, silme veya yok etme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme</li><li>Münhasıran otomatik sistemlerle analiz edilmesi durumunda aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li><li>Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme</li></ul><h2>7. Başvuru Yolu</h2><p>Haklarınıza ilişkin taleplerinizi aşağıdaki kanallar üzerinden iletebilirsiniz:</p><p><strong>Kasırga Bilgisayar</strong></p><p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara</p><p>E-posta: info@kasirgabilgisayar.com</p><p>Tel: 0 (312) 312 60 11</p><p>Başvurunuzu yazılı olarak ıslak imzalı şekilde elden, iadeli taahhütlü mektupla veya e-posta yoluyla iletebilirsiniz. Talebiniz en geç 30 gün içinde sonuçlandırılacaktır.</p>"}$icerik$::jsonb),
    ('gizlilik', $icerik${"baslik": "Gizlilik Politikası", "icerik": "<p>Son güncelleme: Mayıs 2025</p><h2>1. Genel Bilgi</h2><p>Kasırga Bilgisayar olarak, müşterilerimizin kişisel verilerinin gizliliğine büyük önem vermekteyiz. Bu gizlilik politikası, web sitemizi ziyaret ettiğinizde veya hizmetlerimizden yararlandığınızda hangi bilgilerin toplandığını, bu bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.</p><h2>2. Toplanan Bilgiler</h2><p>Web sitemizi ziyaret ettiğinizde veya iletişim formumuzu kullandığınızda aşağıdaki bilgiler toplanabilir:</p><ul><li>Ad ve soyad</li><li>E-posta adresi</li><li>Telefon numarası</li><li>Teknik servis talebi bilgileri</li><li>IP adresi ve tarayıcı bilgileri (analitik amaçlı)</li></ul><h2>3. Bilgilerin Kullanım Amacı</h2><p>Toplanan kişisel bilgiler yalnızca aşağıdaki amaçlar için kullanılmaktadır:</p><ul><li>Teknik servis ve müşteri hizmetleri taleplerinin karşılanması</li><li>İletişim formunuza yanıt verilmesi</li><li>Kampanya ve duyurulardan haberdar edilmeniz (onayınız dahilinde)</li><li>Yasal yükümlülüklerin yerine getirilmesi</li></ul><h2>4. Üçüncü Taraflarla Paylaşım</h2><p>Kişisel verileriniz; açık rızanız olmaksızın, yasal zorunluluk bulunmadıkça veya hizmet sunumu için zorunlu olmadıkça üçüncü taraflarla paylaşılmaz. Hizmet sağlayıcılarımız yalnızca hizmetin ifası için gerekli bilgilere erişir ve bu bilgileri başka amaçlarla kullanamazlar.</p><h2>5. Çerezler (Cookies)</h2><p>Web sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanabilir. Tarayıcınızın ayarlarından çerezleri devre dışı bırakabilirsiniz; ancak bu durumda sitenin bazı özellikleri düzgün çalışmayabilir.</p><h2>6. Veri Güvenliği</h2><p>Kişisel verileriniz, yetkisiz erişim, değiştirme, ifşa veya imhaya karşı korumak için uygun teknik ve idari güvenlik önlemleri alınarak saklanmaktadır.</p><h2>7. Haklarınız</h2><p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p><ul><li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li><li>İşlenmişse buna ilişkin bilgi talep etme</li><li>Yanlış verilerin düzeltilmesini isteme</li><li>Verilerinizin silinmesini veya yok edilmesini talep etme</li><li>İşlemeye itiraz etme</li></ul><h2>8. İletişim</h2><p>Gizlilik politikamıza ilişkin sorularınız için bizimle iletişime geçebilirsiniz:</p><p><strong>Kasırga Bilgisayar</strong></p><p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara</p><p>E-posta: info@kasirgabilgisayar.com</p><p>Tel: 0 (312) 312 60 11</p>"}$icerik$::jsonb),
    ('iade', $icerik${"baslik": "İade ve Değişim Politikası", "icerik": "<p>Son güncelleme: Mayıs 2025</p><blockquote><p>Kasırga Bilgisayar, müşteri memnuniyetini ön planda tutmaktadır. İade ve değişim işlemleriniz için lütfen aşağıdaki koşulları inceleyiniz.</p></blockquote><h2>1. İade Hakkı ve Süresi</h2><p>Satın aldığınız ürünleri, teslim aldığınız tarihten itibaren <strong>14 (on dört) gün</strong> içinde hiçbir gerekçe göstermeksizin iade etme hakkına sahipsiniz. İade hakkının kullanımı için ürünün kullanılmamış, orijinal ambalajında ve eksiksiz olması gerekmektedir.</p><h2>2. İade Koşulları</h2><p>İade işlemi için aşağıdaki koşulların sağlanması gerekmektedir:</p><ul><li>Ürün, teslim tarihinden itibaren 14 gün içinde iade edilmeli</li><li>Ürün kullanılmamış ve orijinal ambalajında olmalı</li><li>Tüm aksesuarlar, kablolar ve belgeler eksiksiz olmalı</li><li>Fatura veya satış belgesi ile birlikte iade edilmeli</li><li>Ürün üzerinde herhangi bir hasar, çizik veya kirlilik bulunmamalı</li></ul><h2>3. İade Edilemeyen Ürünler</h2><p>Aşağıdaki ürünler iade kapsamı dışındadır:</p><ul><li>Ambalajı açılmış ve kurulmuş yazılım lisansları</li><li>Müşteri tarafından yapılandırılmış veya kurulmuş sistemler</li><li>Hijyen açısından iade edilmesi uygun olmayan ürünler</li><li>İfa edilmiş teknik servis ve onarım hizmetleri</li><li>Müşteri talebiyle özel olarak sipariş edilen ürünler</li></ul><h2>4. Değişim Koşulları</h2><p>Aldığınız ürünü farklı bir ürünle değiştirmek istiyorsanız, iade koşullarının sağlanması kaydıyla ürününüzü teslim alıp yeni ürününüzü gönderebilirsiniz. Değişim talebinde fiyat farkı söz konusu ise bu fark tarafınızdan karşılanır veya iade edilir.</p><h2>5. Ayıplı Ürünlerde İade ve Değişim</h2><p>Ayıplı (kusurlu/hasarlı) ürün teslim alındığında aşağıdaki haklardan birini kullanabilirsiniz:</p><ul><li><strong>Ücretsiz Onarım:</strong> Ürünün ücretsiz olarak onarılmasını talep etme</li><li><strong>Değişim:</strong> Ayıpsız benzeriyle değiştirilmesini talep etme</li><li><strong>Bedel İadesi:</strong> Tüm ödemenin geri alınmasını talep etme</li><li><strong>İndirim:</strong> Ayıp oranında bedel indirimi talep etme</li></ul><h2>6. İade Süreci</h2><ol><li><strong>İletişime Geçin:</strong> Telefon veya e-posta ile iade talebinizi bildirin.</li><li><strong>Onay Alın:</strong> Talebiniz incelenerek iade onayı verilir.</li><li><strong>Ürünü Gönderin:</strong> Ürünü orijinal ambalajı ve faturasıyla birlikte gönderin ya da elden teslim edin.</li><li><strong>İade Ödemesi:</strong> Ürün kontrol edildikten sonra ödemeniz en geç 14 gün içinde iade edilir.</li></ol><h2>7. Kargo Ücreti</h2><p>Cayma hakkı kapsamındaki iadelerde kargo ücreti ALICI tarafından karşılanır. Ayıplı veya yanlış ürün gönderimi durumlarında kargo ücreti SATICI tarafından karşılanır.</p><h2>8. İletişim</h2><p>İade ve değişim işlemleriniz için bizimle iletişime geçebilirsiniz:</p><p><strong>Kasırga Bilgisayar</strong></p><p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara</p><p>E-posta: info@kasirgabilgisayar.com</p><p>Tel: 0 (312) 312 60 11</p>"}$icerik$::jsonb),
    ('mesafeli', $icerik${"baslik": "Mesafeli Satış Sözleşmesi", "icerik": "<p>Son güncelleme: Mayıs 2025</p><blockquote><p>Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında düzenlenmiştir.</p></blockquote><h2>Madde 1 — Taraflar</h2><p><strong>SATICI</strong></p><p>Kasırga Bilgisayar</p><p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara</p><p>Tel: 0 (312) 312 60 11</p><p>E-posta: info@kasirgabilgisayar.com</p><p><strong>ALICI</strong></p><p>Sipariş veya hizmet talebinde bulunan kişi/kurum.</p><h2>Madde 2 — Konu ve Kapsam</h2><p>Bu sözleşme; Kasırga Bilgisayar tarafından sunulan bilgisayar, donanım, yazılım ve teknik servis hizmetlerinin uzaktan (telefon, e-posta veya internet üzerinden) sipariş edilmesi durumunda tarafların hak ve yükümlülüklerini düzenler.</p><h2>Madde 3 — Ürün/Hizmet Bilgileri</h2><p>Satışa sunulan ürün ve hizmetlere ait özellikler, fiyatlar ve koşullar sipariş anında ALICI'ya bildirilen bilgiler doğrultusundadır. SATICI, ürün özelliklerinde önceden bildirim yapmak kaydıyla değişiklik yapma hakkını saklı tutar.</p><h2>Madde 4 — Ödeme Koşulları</h2><p>Ödeme; havale/EFT, nakit veya anlaşmalı ödeme yöntemleriyle gerçekleştirilebilir. Ürün/hizmet bedeli, sipariş onayından önce ALICI'ya bildirilir. Ödeme gerçekleşmeden ürün teslimi veya hizmet ifası başlatılmaz.</p><h2>Madde 5 — Teslimat ve İfa Koşulları</h2><p>Ürünler, ödemenin tamamlanmasının ardından ALICI ile mutabık kalınan süre içinde kargo veya elden teslim edilir. Teknik servis hizmetlerinde, cihazın teslim alınmasından sonra onarım süresi için tahmini bilgi verilir. SATICI, stok veya teknik koşullar nedeniyle teslimat süresini gecikmeden önce ALICI'ya bildirir.</p><h2>Madde 6 — Cayma Hakkı</h2><p>ALICI, teslim aldığı tarihten itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılabilmesi için ürünün kullanılmamış, orijinal ambalajında ve faturasıyla birlikte iade edilmesi gerekir.</p><p>Cayma hakkı kullanılamayan durumlar:</p><ul><li>Ambalajı açılmış yazılım ve ses/görüntü kayıtları</li><li>Müşteri talebiyle özel olarak üretilen veya kişiselleştirilen ürünler</li><li>Kullanılmış veya orijinal ambalajı bozulmuş ürünler</li><li>İfa edilmiş teknik servis hizmetleri</li></ul><h2>Madde 7 — Garanti ve Ayıplı Mal</h2><p>Satılan ürünler yasal garanti süresince üretici/ithalatçı garantisi kapsamındadır. Ayıplı ürünlerde ALICI; onarım, değişim, bedel iadesi veya indirim talep edebilir. Garanti kapsamı ve koşulları, ürünle birlikte teslim edilen garanti belgesiyle belirlenir.</p><h2>Madde 8 — Uyuşmazlık Çözümü</h2><p>Bu sözleşmeden doğabilecek uyuşmazlıklarda Türk hukuku uygulanır. Tüketici olarak Tüketici Hakem Heyetlerine ve Tüketici Mahkemelerine başvurma hakkınız saklıdır. Ankara mahkemeleri ve icra daireleri ek yetki mercii olarak belirlenmiştir.</p><h2>Madde 9 — İletişim</h2><p><strong>Kasırga Bilgisayar</strong></p><p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara</p><p>E-posta: info@kasirgabilgisayar.com</p><p>Tel: 0 (312) 312 60 11</p>"}$icerik$::jsonb);

-- ─────────────────────────────────────────────────────────────
-- Blog
-- ─────────────────────────────────────────────────────────────
create table public.blog_kategorileri (
    id          uuid primary key default gen_random_uuid(),
    ad          text not null check (length(trim(ad)) > 0),
    slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    created_at  timestamptz not null default now()
);

create table public.blog_yazilari (
    id                uuid primary key default gen_random_uuid(),
    baslik            text not null check (length(trim(baslik)) > 0),
    slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    ozet              text,
    kapak_gorsel_url  text,
    icerik            text not null default '',  -- HTML (kaydederken ve gösterirken temizlenir)
    kategori_id       uuid references public.blog_kategorileri (id) on delete set null,
    durum             text not null default 'taslak' check (durum in ('taslak', 'yayinda')),
    yayin_tarihi      timestamptz,               -- ileri tarihliyse o ana kadar vitrinde görünmez
    seo_baslik        text,
    seo_aciklama      text,
    yazar_id          uuid default auth.uid() references auth.users (id) on delete set null,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

create index blog_yazilari_yayin_idx     on public.blog_yazilari (durum, yayin_tarihi desc);
create index blog_yazilari_kategori_idx  on public.blog_yazilari (kategori_id);
create index blog_yazilari_yazar_idx     on public.blog_yazilari (yazar_id);

create trigger blog_yazilari_updated_at
    before update on public.blog_yazilari
    for each row execute function public.updated_at_guncelle();

-- Yayına alınırken yayın tarihi boşsa o an yazılır.
create or replace function public.blog_yayin_tarihi()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.durum = 'yayinda' and new.yayin_tarihi is null then
        new.yayin_tarihi := now();
    end if;
    return new;
end;
$$;

create trigger blog_yazilari_yayin_tarihi
    before insert or update on public.blog_yazilari
    for each row execute function public.blog_yayin_tarihi();

-- ─────────────────────────────────────────────────────────────
-- RLS: vitrin (anon) okur; yalnızca yayındaki ve yayın tarihi gelmiş yazılar görünür.
-- ─────────────────────────────────────────────────────────────
alter table public.site_icerikleri   enable row level security;
alter table public.blog_kategorileri enable row level security;
alter table public.blog_yazilari     enable row level security;

create policy "herkes_okur" on public.site_icerikleri
    for select to anon, authenticated using (true);
create policy "panel_kullanicilari_yazar" on public.site_icerikleri
    for update to authenticated using (true) with check (true);

create policy "herkes_okur" on public.blog_kategorileri
    for select to anon, authenticated using (true);
create policy "panel_kullanicilari_yazar" on public.blog_kategorileri
    for all to authenticated using (true) with check (true);

create policy "yayindakiler_herkese_acik" on public.blog_yazilari
    for select to anon using (durum = 'yayinda' and yayin_tarihi <= now());
create policy "panel_kullanicilari_tam_erisim" on public.blog_yazilari
    for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- Görsel deposu: herkese açık okunur (public bucket), yalnızca panel kullanıcıları yükler/siler.
-- SVG kabul edilmez (içinde script taşıyabilir).
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site', 'site', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Silme/güncelleme için nesneyi okuma yetkisi de gerekir; anonim listeleme açılmaz (dosyalar public URL ile okunur).
create policy "site_gorselleri_panel_okur" on storage.objects
    for select to authenticated using (bucket_id = 'site');
create policy "site_gorselleri_panel_ekler" on storage.objects
    for insert to authenticated with check (bucket_id = 'site');
create policy "site_gorselleri_panel_gunceller" on storage.objects
    for update to authenticated using (bucket_id = 'site') with check (bucket_id = 'site');
create policy "site_gorselleri_panel_siler" on storage.objects
    for delete to authenticated using (bucket_id = 'site');
