-- Ürün kategori ağacı (kaynak: KasirgaBilgisayar_Kategori.pdf, 10.10.2026)
-- Faz 3'teki geçici "Notebook › Yedek Parça" dalı kaldırılır; kutu sistemi Bilgisayar › Dizüstü › Yedek Parça'dadır.

delete from public.urun_kategorileri where ust_id is not null and ust_id in (select id from public.urun_kategorileri where ad = 'Notebook' and ust_id is null);
delete from public.urun_kategorileri where ad = 'Notebook' and ust_id is null;

-- Her satır: tam yol (› ile ayrılmış). Üst kategoriler alt kategorilerden önce gelir.
do $$
declare
    yollar text[] := array[
        'Bilgisayar',
        'Bilgisayar›Masaüstü',
        'Bilgisayar›Masaüstü›Modeller',
        'Bilgisayar›Masaüstü›Donanım',
        'Bilgisayar›Masaüstü›Donanım›İşlemci CPU',
        'Bilgisayar›Masaüstü›Donanım›Ekran Kartı GPU',
        'Bilgisayar›Masaüstü›Donanım›RAM',
        'Bilgisayar›Masaüstü›Donanım›Güç Kaynağı PSU',
        'Bilgisayar›Masaüstü›Donanım›Anakart',
        'Bilgisayar›Masaüstü›Donanım›Kasa',
        'Bilgisayar›Masaüstü›Donanım›Ağ Bluetooth Kartı',
        'Bilgisayar›Dizüstü',
        'Bilgisayar›Dizüstü›Modeller',
        'Bilgisayar›Dizüstü›Donanım',
        'Bilgisayar›Dizüstü›Donanım›RAM',
        'Bilgisayar›Dizüstü›Donanım›İşlemci CPU',
        'Bilgisayar›Dizüstü›Donanım›Ekran Kartı GPU',
        'Bilgisayar›Dizüstü›Yedek Parça',
        'Bilgisayar›Dizüstü›Yedek Parça›Adaptör',
        'Bilgisayar›Dizüstü›Yedek Parça›Ağ Kartı',
        'Bilgisayar›Dizüstü›Yedek Parça›Anakart',
        'Bilgisayar›Dizüstü›Yedek Parça›Dahili Hoparlör',
        'Bilgisayar›Dizüstü›Yedek Parça›Dahili Kamera',
        'Bilgisayar›Dizüstü›Yedek Parça›Ekran',
        'Bilgisayar›Dizüstü›Yedek Parça›Flex Kablo',
        'Bilgisayar›Dizüstü›Yedek Parça›Bezel',
        'Bilgisayar›Dizüstü›Yedek Parça›Cover',
        'Bilgisayar›Dizüstü›Yedek Parça›Üst Kasa',
        'Bilgisayar›Dizüstü›Yedek Parça›Alt Kasa',
        'Bilgisayar›Dizüstü›Yedek Parça›Klavye',
        'Bilgisayar›Dizüstü›Yedek Parça›Menteşe',
        'Bilgisayar›Dizüstü›Yedek Parça›Parmak İzi Okuyucu',
        'Bilgisayar›Dizüstü›Yedek Parça›Ses Kartı',
        'Bilgisayar›Dizüstü›Yedek Parça›Soket',
        'Bilgisayar›Dizüstü›Yedek Parça›CPU Soğutucu',
        'Bilgisayar›Dizüstü›Yedek Parça›CPU Bakır Heatsink',
        'Bilgisayar›Dizüstü›Yedek Parça›Touchpad',
        'Bilgisayar›Çevre Birimleri',
        'Bilgisayar›Çevre Birimleri›Mouse',
        'Bilgisayar›Çevre Birimleri›Klavye',
        'Bilgisayar›Çevre Birimleri›Kulaklık & Mikrofon',
        'Bilgisayar›Çevre Birimleri›Kamera',
        'Bilgisayar›Çevre Birimleri›Kablo & Dönüştürücü',
        'Bilgisayar›Çevre Birimleri›Çoğaltıcı',
        'Bilgisayar›Çevre Birimleri›DVD - CD Okuyucu',
        'Bilgisayar›Çevre Birimleri›Monitör',
        'Bilgisayar›Çevre Birimleri›USB Disk',
        'Bilgisayar›Çevre Birimleri›Ağ Network Ürünleri',
        'Bilgisayar›Çevre Birimleri›Ağ Network Ürünleri›Kablo',
        'Bilgisayar›Çevre Birimleri›Ağ Network Ürünleri›Modem',
        'Bilgisayar›Çevre Birimleri›Ağ Network Ürünleri›Switch',
        'Bilgisayar›Çevre Birimleri›Ağ Network Ürünleri›Router',
        'Bilgisayar›Çevre Birimleri›Ağ Network Ürünleri›Access Point',
        'Bilgisayar›Çevre Birimleri›Ağ Network Ürünleri›Sinyal Güçlendirici',
        'Bilgisayar›Çevre Birimleri›Ağ Network Ürünleri›Network Kablosu',
        'Bilgisayar›Diskler',
        'Bilgisayar›Diskler›HDD Disk',
        'Bilgisayar›Diskler›HDD Disk›2.5"',
        'Bilgisayar›Diskler›HDD Disk›3.5"',
        'Bilgisayar›Diskler›SSD Disk',
        'Bilgisayar›Diskler›SSD Disk›M2',
        'Bilgisayar›Diskler›SSD Disk›NVME',
        'Bilgisayar›Diskler›Disk Kutuları',
        'Bilgisayar›Diskler›Disk Kutuları›2.5"',
        'Bilgisayar›Diskler›Disk Kutuları›3.5"'
    ];
    yol text;
    idler jsonb := '{}'::jsonb;
    yeni_id uuid;
    ust text;
begin
    foreach yol in array yollar loop
        ust := nullif(regexp_replace(yol, '›[^›]+$', ''), yol);
        insert into public.urun_kategorileri (ad, ust_id, kutu_sistemi)
        values (
            regexp_replace(yol, '^.*›', ''),
            (idler ->> ust)::uuid,
            yol = 'Bilgisayar›Dizüstü›Yedek Parça'
        )
        returning id into yeni_id;
        idler := idler || jsonb_build_object(yol, yeni_id);
    end loop;
end $$;
