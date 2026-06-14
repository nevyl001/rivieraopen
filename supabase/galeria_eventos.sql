-- Galería de fotos por evento (Cloudinary + Supabase)
CREATE TABLE IF NOT EXISTS galeria_eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_nombre TEXT NOT NULL,
  evento_fecha DATE,
  evento_lugar TEXT,
  portada_url TEXT,
  fotos JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permitir lectura pública (anon) para el sitio web
ALTER TABLE galeria_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública galería"
  ON galeria_eventos
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Ejemplo: usa URLs de entrega (res.cloudinary.com), NO el enlace del panel de Cloudinary.
-- UPDATE galeria_eventos SET
--   portada_url = 'https://res.cloudinary.com/dkqiutbvn/image/upload/v1781467764/tercer_ybbyuk.png',
--   fotos = '["https://res.cloudinary.com/dkqiutbvn/image/upload/v1781467764/tercer_ybbyuk.png"]'::jsonb
-- WHERE id = 'TU-UUID-AQUI';
