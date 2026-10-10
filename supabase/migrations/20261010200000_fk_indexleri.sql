-- Index'i olmayan foreign key'ler (Supabase performance advisor: unindexed_foreign_keys).
-- Üst kayıt silinirken (personel, rehber kişisi, gönderici, auth kullanıcısı) alt tablonun
-- tamamen taranmasını önler.

create index kargolar_alici_rehber_idx            on public.kargolar (alici_rehber_id);
create index kargolar_gonderici_idx               on public.kargolar (gonderici_id);
create index servis_durum_gecmisi_kullanici_idx   on public.servis_durum_gecmisi (kullanici_id);
create index teknik_servis_personel_idx           on public.teknik_servis_kayitlari (teslim_alan_personel_id);
