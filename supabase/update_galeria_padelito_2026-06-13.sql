-- Actualiza galería Rush Series Padelito Warehouse (13 jun 2026)
-- 21 fotos desde Cloudinary (carpeta samples/Rush Series Padelito Warehouse)
-- Portada: 14_vms8mc.png
-- Ejecutar en Supabase → SQL Editor → Run

UPDATE galeria_eventos
SET
  portada_url = 'https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546958/14_vms8mc.png',
  fotos = '[
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546958/14_vms8mc.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546956/1_p1xuab.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546957/2_egg9uo.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546956/3_ko0esx.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546957/4_aqtiph.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546957/5_ljlba5.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546957/6_eda25r.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546957/7_nrwfvf.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546957/8_seecha.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546958/9_tqx1y7.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546958/10_ixkbhe.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546958/11_w5ervu.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546958/12_zfliw1.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546958/13_qcbkga.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546959/15_adzalu.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546959/16_lkzee1.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546959/17_cpiau3.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546959/18_vuycot.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781546960/19_swi6dj.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489103/ChatGPT_Image_14_jun_2026_03_24_51_p.m._zbdu4y.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489101/ChatGPT_Image_14_jun_2026_03_25_57_p.m._bs3xtl.png"
  ]'::jsonb
WHERE id = 'f00f2703-8bb6-494e-a59d-1ac85d5d9094';
