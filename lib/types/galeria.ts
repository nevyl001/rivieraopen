export interface GaleriaEvento {
  id: string;
  evento_nombre: string;
  evento_fecha: string | null;
  evento_lugar: string | null;
  portada_url: string | null;
  fotos: string[];
  created_at: string;
}
