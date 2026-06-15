-- Galería: Riviera Open Rush Series — Padelito Warehouse (sábado 13 jun 2026)
-- Ejecutar en Supabase → SQL Editor → Run

INSERT INTO galeria_eventos (
  evento_nombre,
  evento_fecha,
  evento_lugar,
  portada_url,
  fotos
) VALUES (
  'Riviera Open Rush Series - Padelito Warehouse',
  '2026-06-13',
  'Padelito Warehouse, Ciudad de México',
  'https://res.cloudinary.com/dkqiutbvn/image/upload/v1781493570/final_hwb3g3.png',
  '[
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781493570/final_hwb3g3.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781493570/tercer_nxssoh.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489107/ChatGPT_Image_14_jun_2026_03_27_00_p.m._etfwxt.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489105/ChatGPT_Image_14_jun_2026_03_28_47_p.m._sueeud.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489103/ChatGPT_Image_14_jun_2026_03_24_51_p.m._zbdu4y.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489101/ChatGPT_Image_14_jun_2026_03_25_57_p.m._bs3xtl.png"
  ]'::jsonb
);
