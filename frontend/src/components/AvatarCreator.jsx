import React, { useState, useEffect, useContext } from 'react';
import { 
  Smile, User, Sparkles, Check, RefreshCw, Save, X, Plus, Trash2, 
  Eye, Heart, Volume2, ShieldCheck, ChevronRight, Palette, Layers,
  Scissors, Glasses, Shirt, Footprints, Watch, Award, Star, SlidersHorizontal
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import ModularAvatar, { DEFAULT_AVATAR_CONFIG, SKIN_TONES_CATALOG } from './ModularAvatar';
import api from '../services/api';

const ALL_HAIR_STYLES = [
  // ── Cortos ──
  { id: 'curtains', label: 'Modern Curtains (Kenny)', cat: 'cortos', desc: 'Raya al medio texturizada' },
  { id: 'fade', label: 'Clean Temple Fade', cat: 'cortos', desc: 'Degradado limpio en sienes' },
  { id: 'undercut', label: 'Textured Undercut', cat: 'cortos', desc: 'Laterales cortos y textura superior' },
  { id: 'pixie', label: 'Pixie Chic Desfilado', cat: 'cortos', desc: 'Capas cortas femeninas y ligeras' },
  { id: 'afro_corto', label: 'Afro Corto Esculpido', cat: 'cortos', desc: 'Bucles 4A densos y redondos' },

  // ── Medios ──
  { id: 'sleek_bob', label: 'Bob Francés Clásico', cat: 'medios', desc: 'Corte pulido a la mandíbula' },
  { id: 'bob_flequillo', label: 'Bob con Flequillo Recto', cat: 'medios', desc: 'Bob chic con fleco francés' },
  { id: 'curly_bob_flequillo', label: 'Bob Rizado con Flequillo', cat: 'medios', desc: 'Rizos 3C elásticos con flequillo' },
  { id: 'wolf_cut', label: 'Wolf Cut Shaggy con Capas', cat: 'medios', desc: 'Capas desfiladas con movimiento' },
  { id: 'ondas_medias', label: 'Ondas Playeras Medias', cat: 'medios', desc: 'Ondas 2A con textura relajada' },
  { id: 'curly_3b_angie', label: 'Rizos Medios Elásticos (Angie)', cat: 'medios', desc: 'Volumen 3B en los costados' },

  // ── Largos ──
  { id: 'rizos_leona', label: 'Rizos Voluminosos Salvajes', cat: 'largos', desc: 'Cascada natural con volumen leona y movimiento libre' },
  { id: 'rizos_definidos', label: 'Rizos Definidos Naturales', cat: 'largos', desc: 'Espirales definidas en sacacorchos con volumen' },
  { id: 'rizos_sueltos', label: 'Rizos Sueltos con Volumen', cat: 'largos', desc: 'Bucles elásticos aireados con textura orgánica' },
  { id: 'rizos_capas', label: 'Rizos en Capas', cat: 'largos', desc: 'Gradiente de rizos en capas con puntas asimétricas' },
  { id: 'rizos_largos_flequillo', label: 'Rizos Largos con Flequillo Curly', cat: 'largos', desc: 'Melena rizada con fleco de bucles' },
  { id: 'ondas_largas', label: 'Ondas Largas Glamour', cat: 'largos', desc: 'Ondas fluidas en S por la espalda' },
  { id: 'liso_largo_sedoso', label: 'Liso Largo Sedoso', cat: 'largos', desc: 'Caída continua brillante por la espalda' },
  { id: 'liso_largo_flequillo', label: 'Liso Largo con Flequillo Recto', cat: 'largos', desc: 'Melena lisa con flequillo pulido' },
  { id: 'liso_cortina', label: 'Liso Largo con Flequillo Cortina', cat: 'largos', desc: 'Fleco abierto que enmarca pómulos' },
  { id: 'afro_voluminoso', label: 'Afro Voluminoso Halo', cat: 'largos', desc: 'Halo 4B esponjoso alrededor de la cabeza' },

  // ── Recogidos & Trenzas ──
  { id: 'chongo_bonito', label: 'Chongo Alto / Moño con Mechas', cat: 'recogidos', desc: 'Dona alta estilizada con mechas suaves' },
  { id: 'high_ponytail', label: 'Coleta Alta Dinámica', cat: 'recogidos', desc: 'Recogido pulido y cola ondeando atrás' },
  { id: 'box_braids', label: 'Box Braids con Cornrows de Raíz', cat: 'recogidos', desc: 'Cuero cabelludo trenzado y cuentas de oro' },
  { id: 'dreadlocks', label: 'Dreadlocks con Raíz Esculpida', cat: 'recogidos', desc: 'Locs definidos con base estructurada' },
  { id: 'afro_corona', label: 'Corona Afro Imperial', cat: 'recogidos', desc: 'Recogido afro alto con diadema dorada' }
];

const HAIR_COLORS = [
  { hex: '#18181b', label: 'Negro Azabache' },
  { hex: '#3d2314', label: 'Castaño Oscuro' },
  { hex: '#5a3825', label: 'Castaño Chocolate' },
  { hex: '#855234', label: 'Avellana Miel' },
  { hex: '#d4a373', label: 'Rubio Dorado' },
  { hex: '#e2c499', label: 'Platino Nórdico' },
  { hex: '#9c381c', label: 'Cobrizo / Pelirrojo' },
  { hex: '#94a3b8', label: 'Gris Plata' },
  { hex: '#ffffff', label: 'Blanco Nieve' },
  { hex: '#7c3aed', label: 'Púrpura EquilibrIA' },
  { hex: '#2563eb', label: 'Azul Eléctrico' },
  { hex: '#ec4899', label: 'Rosa Pastel' },
  { hex: '#059669', label: 'Verde Esmeralda' }
];

const EYE_COLORS = [
  { hex: '#2e1509', label: 'Castaño Profundo' },
  { hex: '#5c3a21', label: 'Avellana Cálido' },
  { hex: '#1e40af', label: 'Azul Zafiro' },
  { hex: '#15803d', label: 'Verde Esmeralda' },
  { hex: '#64748b', label: 'Gris Tormenta' },
  { hex: '#7c3aed', label: 'Violeta Místico' }
];

const TOP_COLORS = [
  // ── Tonos Rosados (Pinks) ──
  { hex: '#fce7f3', label: 'Rosa Bebé / Pastel' },
  { hex: '#f472b6', label: 'Rosa Chicle' },
  { hex: '#ec4899', label: 'Rosa Fucsia Vivo' },
  { hex: '#db2777', label: 'Magenta Intenso' },
  { hex: '#be185d', label: 'Frambuesa Oscuro' },
  { hex: '#e2829c', label: 'Rosa Palo / Vintage' },

  // ── Tonos Rojos (Reds & Burgundies) ──
  { hex: '#f87171', label: 'Rojo Coral' },
  { hex: '#ef4444', label: 'Rojo Brillante' },
  { hex: '#dc2626', label: 'Rojo Carmesí' },
  { hex: '#b91c1c', label: 'Rojo Escarlata' },
  { hex: '#991b1b', label: 'Vino Tinto' },
  { hex: '#7f1d1d', label: 'Borgoña Profundo' },
  { hex: '#c2410c', label: 'Terracota / Ladrillo' },

  // ── Tonos Masculinos & Neutros Clásicos ──
  { hex: '#0f172a', label: 'Azul Marino Medianoche' },
  { hex: '#1e3a8a', label: 'Azul Marino Real' },
  { hex: '#1e293b', label: 'Azul Noche' },
  { hex: '#155e75', label: 'Azul Petróleo / Teal' },
  { hex: '#334155', label: 'Gris Marengo / Carbón' },
  { hex: '#475569', label: 'Gris Pizarra / Acero' },
  { hex: '#64748b', label: 'Gris Perla' },
  { hex: '#3f4f34', label: 'Verde Militar / Oliva' },
  { hex: '#14532d', label: 'Verde Bosque Oscuro' },
  { hex: '#064e3b', label: 'Verde Esmeralda Profundo' },
  { hex: '#3d2314', label: 'Café Cuero / Marrón Oscuro' },
  { hex: '#5c3a21', label: 'Marrón Tabaco' },
  { hex: '#78350f', label: 'Caramelo Tostado' },
  { hex: '#b45309', label: 'Ámbar Cálido' },
  { hex: '#18181b', label: 'Negro Grafito' },
  { hex: '#ffffff', label: 'Blanco Puro' },
  { hex: '#f1f5f9', label: 'Blanco Hielo / Plata' },

  // ── Tonos EquilibrIA ──
  { hex: '#493362', label: 'Púrpura EquilibrIA' },
  { hex: '#7c3aed', label: 'Violeta Brillante' },
  { hex: '#ede9fe', label: 'Lavanda Suave' },
  { hex: '#0284c7', label: 'Azul Cielo' },
  { hex: '#059669', label: 'Verde Calma' },
  { hex: '#10b981', label: 'Menta Fresca' },
  { hex: '#fbbf24', label: 'Amarillo Mostaza' }
];

const BOTTOM_COLORS = [
  // ── Tonos Denim & Mezclilla ──
  { hex: '#60a5fa', label: 'Denim Claro' },
  { hex: '#2563eb', label: 'Denim Índigo' },
  { hex: '#1d4ed8', label: 'Denim Clásico' },
  { hex: '#1e3a8a', label: 'Denim Oscuro' },
  { hex: '#93c5fd', label: 'Denim Deslavado Hielo' },

  // ── Tonos Lona, Tierra & Khaki ──
  { hex: '#d4c3a3', label: 'Arena / Lona Clara' },
  { hex: '#bfa67a', label: 'Khaki Tradicional' },
  { hex: '#8c7653', label: 'Khaki Oliva' },
  { hex: '#3f4f34', label: 'Verde Militar' },
  { hex: '#14532d', label: 'Verde Bosque' },
  { hex: '#3d2314', label: 'Marrón Cuero / Chocolate' },
  { hex: '#78350f', label: 'Caramelo Tabaco' },

  // ── Tonos Masculinos & Neutros ──
  { hex: '#18181b', label: 'Negro Ónix' },
  { hex: '#0f172a', label: 'Azul Marino Noche' },
  { hex: '#1e293b', label: 'Azul Pizarra' },
  { hex: '#334155', label: 'Gris Carbón / Marengo' },
  { hex: '#64748b', label: 'Gris Asfalto' },
  { hex: '#cbd5e1', label: 'Gris Claro' },
  { hex: '#ffffff', label: 'Blanco / Crema' },

  // ── Tonos Vivos & Moda ──
  { hex: '#f472b6', label: 'Rosa Chicle' },
  { hex: '#ec4899', label: 'Fucsia' },
  { hex: '#e2829c', label: 'Rosa Palo' },
  { hex: '#ef4444', label: 'Rojo Brillante' },
  { hex: '#991b1b', label: 'Vino Tinto' },
  { hex: '#7f1d1d', label: 'Borgoña' },
  { hex: '#d8b4e2', label: 'Lila Pastel' }
];

const ACCESSORY_COLORS = [
  '#18181b', '#ffffff', '#7c3aed', '#2563eb', '#dc2626', '#059669', '#f59e0b', '#ec4899', '#64748b'
];

const GLASSES_COLORS = [
  { hex: '#18181b', label: 'Negro Clásico' },
  { hex: '#543824', label: 'Carey Habana' },
  { hex: '#b45309', label: 'Carey Ámbar' },
  { hex: '#d97706', label: 'Dorado Metálico' },
  { hex: '#94a3b8', label: 'Plata / Acero' },
  { hex: '#7c3aed', label: 'Violeta / Púrpura' },
  { hex: '#2563eb', label: 'Azul Real' },
  { hex: '#059669', label: 'Verde Esmeralda' },
  { hex: '#dc2626', label: 'Rojo Carmesí' },
  { hex: '#ec4899', label: 'Rosa Magenta' },
  { hex: '#e08d8d', label: 'Oro Rosa' },
  { hex: '#ffffff', label: 'Blanco Moderno' }
];

const TOP_STYLES = [
  // Playeras & Tops
  { id: 'tshirt', label: 'Playera Básica Cuello Redondo', cat: 'playeras', desc: 'Algodón clásico cómodo' },
  { id: 'polo', label: 'Playera Polo Deportiva con Cuello', cat: 'playeras', desc: 'Estilo sport casual con botones' },
  { id: 'tank_top', label: 'Top Atlético Sin Mangas', cat: 'playeras', desc: 'Silueta deportiva fresca de tirantes' },

  // Camisas & Chalecos
  { id: 'shirt_formal', label: 'Camisa Formal de Botones', cat: 'camisas', desc: 'Cuello camisero y tapeta formal' },
  { id: 'shirt_casual_open', label: 'Camisa Abierta con Playera', cat: 'camisas', desc: 'Look urbano en capas con playera interior' },
  { id: 'chaleco_puffy', label: 'Chaleco Acolchado Puffer', cat: 'camisas', desc: 'Volumen térmico acolchado con cremallera' },
  { id: 'chaleco_lana', label: 'Chaleco de Lana en V', cat: 'camisas', desc: 'Tejido clásico universitario sobre camisa' },

  // Suéteres & Hoodies
  { id: 'sweater_heart', label: 'Suéter con Corazón ❤️', cat: 'sueteres', desc: 'Tejido cálido con corazón bordado en el pecho' },
  { id: 'sweater_equi', label: 'Suéter con Logo de Equi ✨', cat: 'sueteres', desc: 'Emblema oficial de bienestar y sonrisa EquilibrIA' },
  { id: 'sweater_turtleneck', label: 'Suéter de Cuello Alto / Tortuga', cat: 'sueteres', desc: 'Elegante cuello alto acanalado' },
  { id: 'hoodie', label: 'Sudadera / Hoodie con Capucha', cat: 'sueteres', desc: 'Bolsillo canguro y cordones ajustables' },
  { id: 'cardigan', label: 'Cárdigan Tejido con Botones', cat: 'sueteres', desc: 'Apertura frontal suave' },

  // Vestidos
  { id: 'vestido_corto', label: 'Vestido Corto Casual Skater', cat: 'vestidos', desc: 'Falda acampanada juvenil arriba de la rodilla' },
  { id: 'vestido_largo', label: 'Vestido Largo de Gala Elegante', cat: 'vestidos', desc: 'Silueta estilizada hasta el suelo' },
  { id: 'vestido_estampado', label: 'Vestido Floral Estampado', cat: 'vestidos', desc: 'Detalles botánicos y flores de colores' },
  { id: 'vestido_brillos', label: 'Vestido de Noche con Brillos ✨', cat: 'vestidos', desc: 'Destellos luminosos y glitter resplandeciente' },
  { id: 'vestido_tirantes', label: 'Vestido Veraniego de Tirantes', cat: 'vestidos', desc: 'Fresco y ligero de tirantes delgados' }
];

const BOTTOM_STYLES = [
  // Jeans & Denim
  { id: 'jeans_clasicos', label: 'Jeans Denim Rectos', cat: 'jeans', desc: 'Corte clásico con costuras y remaches' },
  { id: 'jeans_rotos', label: 'Jeans de Lona Rasgados', cat: 'jeans', desc: 'Desgastes y rasgaduras urbanas en rodillas' },
  { id: 'jeans_tiro_alto', label: 'Mom Jeans de Tiro Alto', cat: 'jeans', desc: 'Cintura alta con cinturón y hebilla' },
  { id: 'jeans_acampanados', label: 'Jeans Acampanados Flare', cat: 'jeans', desc: 'Estilo retro acampanado hacia los tobillos' },

  // Pantalones & Pants
  { id: 'cargo', label: 'Pantalón Cargo Táctico', cat: 'pantalones', desc: 'Bolsillos laterales 3D con solapas' },
  { id: 'joggers', label: 'Joggers Deportivos de Algodón', cat: 'pantalones', desc: 'Cintura con cordón y puños en tobillos' },
  { id: 'pantalon_vestir', label: 'Pantalón Sastre de Vestir', cat: 'pantalones', desc: 'Línea de planchado y pinzas formales' },
  { id: 'pants_deportivos', label: 'Pants con Franjas Laterales', cat: 'pantalones', desc: 'Doble franja atlética blanca' },
  { id: 'leggings', label: 'Mallas / Leggings Deportivos', cat: 'pantalones', desc: 'Ajuste ceñido de compresión' },

  // Faldas
  { id: 'falda_tablas', label: 'Falda de Tablas Plisada', cat: 'faldas', desc: 'Vuelo escolar/tenis en abanico' },
  { id: 'falda_larga', label: 'Falda Maxi Fluida', cat: 'faldas', desc: 'Caída amplia elegante hasta los tobillos' },
  { id: 'falda_mezclilla', label: 'Minifalda de Mezclilla', cat: 'faldas', desc: 'Botones frontales metálicos y bolsillos' },
  { id: 'falda_tubo', label: 'Falda Tubo / Lápiz Ejecutiva', cat: 'faldas', desc: 'Corte midi entallado formal' },

  // Shorts & Pantalonetas
  { id: 'shorts_casuales', label: 'Pantaloneta / Bermuda de Lona', cat: 'shorts', desc: 'Casual con dobladillo en la basta' },
  { id: 'shorts_deportivos', label: 'Shorts de Running con Ribete', cat: 'shorts', desc: 'Corte curvo atlético con ribete blanco' },
  { id: 'shorts_mezclilla', label: 'Shorts Denim Deshilachados', cat: 'shorts', desc: 'Bajo desflecado y estilo desgastado' },
  { id: 'shorts_biker', label: 'Biker Shorts Ciclistas', cat: 'shorts', desc: 'Mallas a medio muslo elásticas' }
];

const SHOES_STYLES = [
  // Tenis & Sneakers
  { id: 'sneakers_urbanos', label: 'Tenis Urbanos Skate', cat: 'tenis', desc: 'Suela vulcanizada blanca y puntera de goma' },
  { id: 'sneakers_running', label: 'Tenis Deportivos de Running', cat: 'tenis', desc: 'Suela ergonómica con amortiguación atlética' },
  { id: 'sneakers_chunky', label: 'Tenis Chunky de Plataforma', cat: 'tenis', desc: 'Suela gruesa dentada moderna streetwear' },
  { id: 'sneakers_altos', label: 'Tenis Retro de Bota Alta', cat: 'tenis', desc: 'Caña alta al tobillo con parche clásico' },

  // Tacones
  { id: 'tacones_aguja', label: 'Tacones Stilettos de Aguja', cat: 'tacones', desc: 'Silueta afilada con tacón fino elegante' },
  { id: 'tacones_bloque', label: 'Tacones de Bloque Cómodos', cat: 'tacones', desc: 'Tacón cuadrado ancho con pulsera al tobillo' },
  { id: 'sandalias_tacon', label: 'Sandalias de Tacón con Tiras', cat: 'tacones', desc: 'Tiras finas cruzadas en empeine' },
  { id: 'tacones_plataforma', label: 'Tacones con Plataforma Glam', cat: 'tacones', desc: 'Plataforma delantera y tacón alto retro' },

  // Botas
  { id: 'botas_altas', label: 'Botas Altas hasta la Rodilla', cat: 'botas', desc: 'Cuero elegante hasta la rodilla con cremallera' },
  { id: 'botas_malla_red', label: 'Botas con Mallas de Red', cat: 'botas', desc: 'Medias de rejilla seductoras y botines de cuero' },
  { id: 'botines_chelsea', label: 'Botines Chelsea de Cuero', cat: 'botas', desc: 'Caña media con panel elástico lateral' },
  { id: 'botas_militares', label: 'Botas Militares Combat', cat: 'botas', desc: 'Suela de oruga y cordones cruzados' },
  { id: 'botas_vaqueras', label: 'Botas Vaqueras Western', cat: 'botas', desc: 'Bordados tradicionales, corte en V y tacón cubano' },
  { id: 'botines_tacon', label: 'Botines Elegantes de Tacón', cat: 'botas', desc: 'Botín estilizado al tobillo con tacón fino' },

  // Formales & Mocasines
  { id: 'mocasines_clasicos', label: 'Mocasines Loafers con Hebilla', cat: 'formales', desc: 'Cuero refinado con adorno metálico dorado' },
  { id: 'mocasines_chunky', label: 'Mocasines Chunky Suela Track', cat: 'formales', desc: 'Suela gruesa de tractor y lengüeta elevada' },
  { id: 'zapatos_oxford', label: 'Zapatos Oxford de Cordones', cat: 'formales', desc: 'Costuras pespunteadas clásicas inglesas' },
  { id: 'zapatos_charol', label: 'Zapatos de Charol Brillante', cat: 'formales', desc: 'Acabado de charol reluciente con reflejos' },

  // Sandalias & Abiertos
  { id: 'sandalias_planas', label: 'Sandalias Planas de Verano', cat: 'sandalias', desc: 'Tiras cruzadas frescas con suela ligera' }
];

const SHOES_COLORS = [
  // ── Cueros y Neutros ──
  { hex: '#18181b', label: 'Negro Azabache' },
  { hex: '#3d2314', label: 'Café Cuero Oscuro' },
  { hex: '#5c3a21', label: 'Marrón Chocolate' },
  { hex: '#78350f', label: 'Cuero Caramelo / Cognac' },
  { hex: '#bfa67a', label: 'Khaki / Nude Arena' },
  { hex: '#ffffff', label: 'Blanco Puro / Nieve' },
  { hex: '#e5dcd0', label: 'Blanco Hueso / Crema' },
  { hex: '#64748b', label: 'Gris Pizarra' },
  { hex: '#334155', label: 'Gris Antracita' },

  // ── Metálicos de Gala ──
  { hex: '#d97706', label: 'Oro Metálico / Dorado' },
  { hex: '#94a3b8', label: 'Plata / Acero Cromado' },
  { hex: '#e08d8d', label: 'Oro Rosa Brillante' },

  // ── Rojos y Rosados ──
  { hex: '#dc2626', label: 'Rojo Pasión' },
  { hex: '#991b1b', label: 'Vino Tinto / Borgoña' },
  { hex: '#7f1d1d', label: 'Granate Profundo' },
  { hex: '#f472b6', label: 'Rosa Chicle' },
  { hex: '#ec4899', label: 'Rosa Fucsia' },
  { hex: '#db2777', label: 'Magenta Intenso' },
  { hex: '#fce7f3', label: 'Rosa Pastel' },

  // ── Azules y Verdes ──
  { hex: '#0f172a', label: 'Azul Marino Medianoche' },
  { hex: '#1e3a8a', label: 'Azul Real' },
  { hex: '#059669', label: 'Verde Esmeralda' },
  { hex: '#14532d', label: 'Verde Bosque' },
  { hex: '#7c3aed', label: 'Violeta Eléctrico' }
];

const ACCESSORY_SUBTABS = [
  { id: 'sombreros', label: 'Sombreros' },
  { id: 'cuello', label: 'Cuello & Bufandas' },
  { id: 'piercings', label: 'Piercings' },
  { id: 'aretes', label: 'Aretes' },
  { id: 'audio', label: 'Audífonos' },
  { id: 'relojes', label: 'Relojes' },
  { id: 'extras', label: 'Extras' }
];

const HEADWEAR_OPTIONS = [
  { id: 'none', label: 'Sin Sombrero', desc: 'Cabello al descubierto' },
  { id: 'cap', label: 'Gorra Deportiva Urbana', desc: 'Visera curva y ajuste casual' },
  { id: 'beanie', label: 'Gorro Beanie de Lana', desc: 'Dobladillo grueso y pompón' },
  { id: 'bucket_hat', label: 'Gorro Bucket / Pescador', desc: 'Estilo noventero relajado' },
  { id: 'sombrero_fedora', label: 'Sombrero Fedora Elegante', desc: 'Copa doblada con cinta de raso' },
  { id: 'sombrero_vaquero', label: 'Sombrero Vaquero Western', desc: 'Ala curvada estilo cowboy' },
  { id: 'boina', label: 'Boina Francesa Chic', desc: 'Estilo parisino con rabillo' },
  { id: 'tiara', label: 'Tiara / Corona de Princesa', desc: 'Brillo real con gemas deslumbrantes' }
];

const NECK_OPTIONS = [
  { id: 'none', label: 'Sin Accesorio en Cuello', desc: 'Cuello al descubierto' },
  { id: 'bufanda_tejida', label: 'Bufanda Gruesa de Lana', desc: 'Envuelve el cuello con flecos colgantes' },
  { id: 'bufanda_seda', label: 'Pañuelo de Seda Anudado', desc: 'Fular chic con lazada al frente' },
  { id: 'gargantilla_choker', label: 'Gargantilla Choker', desc: 'Cinta oscura con dije de corazón metálico' },
  { id: 'collar_perlas', label: 'Collar de Perlas Doble', desc: 'Hileras de perlas nacaradas de gala' },
  { id: 'cadena_oro', label: 'Cadena de Eslabones Gruesa', desc: 'Eslabones cubanos urbanos brillantes' },
  { id: 'collar_zen', label: 'Collar Zen con Gema', desc: 'Cordón con colgante de energía zen' }
];

const EARRINGS_OPTIONS = [
  { id: 'none', label: 'Sin Aretes', desc: 'Orejas limpias' },
  { id: 'aretes_arracadas', label: 'Arracadas / Aros Grandes', desc: 'Aros circulares llamativos' },
  { id: 'aretes_colgantes', label: 'Aretes con Lágrima de Diamante', desc: 'Brillo colgante elegante' },
  { id: 'aretes_cruces', label: 'Aretes con Dijes de Cruz', desc: 'Cruces estilizadas colgantes' }
];

const HEADPHONES_OPTIONS = [
  { id: 'none', label: 'Sin Audífonos', desc: 'Sin dispositivo de audio' },
  { id: 'headphones_overear', label: 'Diadema Over-Ear Moderna', desc: 'Almohadillas grandes acolchadas' },
  { id: 'headphones_neck', label: 'Audífonos en el Cuello', desc: 'Descansando sobre los hombros' },
  { id: 'airpods', label: 'AirPods Inalámbricos', desc: 'Auriculares in-ear blancos minimalistas' },
  { id: 'gaming_headset', label: 'Diadema Gamer con Micrófono', desc: 'Micrófono de brazo y acentos luminosos' }
];

const WATCH_OPTIONS = [
  { id: 'none', label: 'Sin Accesorio en Muñeca', desc: 'Muñeca al descubierto' },
  { id: 'watch_smart', label: 'Smartwatch Digital Activo', desc: 'Pantalla brillante con métricas' },
  { id: 'watch_clasico', label: 'Reloj Analógico de Cuero', desc: 'Esfera redonda de lujo clásica' },
  { id: 'pulseras_boho', label: 'Set de Pulseras Boho', desc: 'Brazaletes apilados de cuentas y metal' }
];

const JEWELRY_COLORS = [
  { hex: '#d4af37', label: 'Oro Amarillo 18k' },
  { hex: '#e2e8f0', label: 'Plata / Acero Quirúrgico' },
  { hex: '#e08d8d', label: 'Oro Rosa Romántico' },
  { hex: '#18181b', label: 'Negro Ónix / Titanio' },
  { hex: '#b45309', label: 'Cobre / Bronce Vintage' }
];

const ACCESSORY_FABRIC_COLORS = [
  { hex: '#18181b', label: 'Negro Azabache' },
  { hex: '#ffffff', label: 'Blanco Puro' },
  { hex: '#dc2626', label: 'Rojo Carmesí' },
  { hex: '#991b1b', label: 'Vino Tinto' },
  { hex: '#f472b6', label: 'Rosa Chicle' },
  { hex: '#e2829c', label: 'Rosa Palo' },
  { hex: '#0f172a', label: 'Azul Marino' },
  { hex: '#1e3a8a', label: 'Azul Real' },
  { hex: '#3f4f34', label: 'Verde Militar' },
  { hex: '#14532d', label: 'Verde Bosque' },
  { hex: '#bfa67a', label: 'Khaki Arena' },
  { hex: '#3d2314', label: 'Café Cuero' },
  { hex: '#7c3aed', label: 'Púrpura EquilibrIA' },
  { hex: '#fbbf24', label: 'Amarillo Mostaza' }
];

const FACE_SHAPES_EXTENDED = [
  { id: 'oval', label: 'Ovalado Clásico', desc: 'Equilibrado y armónico' },
  { id: 'round', label: 'Redondo Suave', desc: 'Mejillas suaves y tiernas' },
  { id: 'cuadrado', label: 'Cuadrado Marcado', desc: 'Mandíbula angular y fuerte' },
  { id: 'rectangular', label: 'Rectangular Fuerte', desc: 'Rostro largo con mandíbula ancha' },
  { id: 'corazon', label: 'Corazón / Invertido', desc: 'Frente amplia y barbilla fina' },
  { id: 'diamante', label: 'Diamante Anguloso', desc: 'Pómulos prominentes y barbilla en punta' },
  { id: 'alargado', label: 'Alargado Esbelto', desc: 'Estilizado y vertical' },
  { id: 'pera', label: 'Pera / Mandíbula Ancha', desc: 'Mandíbula ancha y sienes suaves' },
  { id: 'hexagonal', label: 'Hexagonal Esculpido', desc: 'Estructura facetada definida' },
  { id: 'trapecio', label: 'Trapecio Definido', desc: 'Base ancha y ángulos masculinos' }
];

const EYE_SHAPES_EXTENDED = [
  { id: 'almendrados', label: 'Almendrados Clásicos' },
  { id: 'grandes', label: 'Grandes Expresivos' },
  { id: 'enfoque', label: 'Enfoque / Decidido' },
  { id: 'rasgados', label: 'Foxy Eyes / Rasgados' },
  { id: 'redondos', label: 'Redondos Kawaii' },
  { id: 'caidos', label: 'Mirada Dulce / Caídos' },
  { id: 'sonadores', label: 'Mirada Soñadora' },
  { id: 'felinos', label: 'Cat-Eye Seductor' },
  { id: 'serena', label: 'Mirada Serena Zen' },
  { id: 'guino', label: 'Guiño Pícaro 😉' }
];

const MOUTH_SHAPES_EXTENDED = [
  { id: 'sonrisa_calida', label: '😊 Sonrisa Cálida' },
  { id: 'sonrisa_amplia', label: '😁 Sonrisa Radiante' },
  { id: 'labios_carnosos', label: '✨ Labios Carnosos' },
  { id: 'labios_serenos', label: '🌿 Labios Serenos' },
  { id: 'sonrisa_picara', label: '😏 Sonrisa Pícara' },
  { id: 'labios_gloss', label: '💄 Labios con Gloss' },
  { id: 'besito', label: '😚 Boquita de Beso' },
  { id: 'sonrisa_abierta', label: '😃 Sonrisa Abierta' },
  { id: 'labios_ombre', label: '💋 Delineado Ombré' },
  { id: 'sonrisa_timida', label: '☺️ Sonrisa Tímida' }
];

const LIPSTICK_COLORS = [
  { hex: '#c27878', label: 'Nude Natural' },
  { hex: '#f472b6', label: 'Rosa Bebé Pastel' },
  { hex: '#e2829c', label: 'Rosa Palo Vintage' },
  { hex: '#ec4899', label: 'Rosa Fucsia Glam' },
  { hex: '#be185d', label: 'Frambuesa Intenso' },
  { hex: '#dc2626', label: 'Rojo Pasión' },
  { hex: '#f87171', label: 'Rojo Coral Cálido' },
  { hex: '#881337', label: 'Vino Tinto / Borgoña' },
  { hex: '#581c87', label: 'Ciruela Profundo' },
  { hex: '#fb923c', label: 'Durazno / Melocotón' },
  { hex: '#a16207', label: 'Nude Canela / Latte' },
  { hex: '#5c3a21', label: 'Marrón Chocolate' },
  { hex: '#fca5a5', label: 'Gloss Nácar Brillante' },
  { hex: '#7c3aed', label: 'Violeta Místico' },
  { hex: '#c2410c', label: 'Terracota Ladrillo' },
  { hex: '#18181b', label: 'Negro Gótico Chic' }
];

const FEMALE_BODY_TYPES = [
  { id: 'mujer_curvilinea', label: 'Curvilíneo', desc: 'Busto modelado, cintura entallada y caderas suaves' },
  { id: 'mujer_promedio', label: 'Clásico', desc: 'Proporciones balanceadas con busto natural' },
  { id: 'mujer_atletica', label: 'Atlético', desc: 'Cintura tonificada, busto firme y piernas fuertes' },
  { id: 'mujer_robusta', label: 'Pleno / Curvas Plus', desc: 'Silueta amplia, busto generoso y caderas armónicas' },
  { id: 'mujer_delgada', label: 'Esbelto', desc: 'Silueta delgada, delicada y ligera' }
];

const MALE_BODY_TYPES = [
  { id: 'hombre_atletico', label: 'Atlético', desc: 'Hombros firmes, pecho definido y brazos atléticos' },
  { id: 'hombre_promedio', label: 'Clásico', desc: 'Proporciones masculinas estándar equilibradas' },
  { id: 'hombre_robusto', label: 'Fuerte & Sólido', desc: 'Envergadura amplia, complexión fuerte y proporcional' },
  { id: 'hombre_delgado', label: 'Esbelto', desc: 'Complexión juvenil, ligera y estilizada' },
  { id: 'hombre_muscular', label: 'Muscular en V', desc: 'Hombros y deltoides muy anchos con cintura firme' }
];

const PREVIEW_POSES = [
  { id: 'neutral', label: '🧍 Neutral', desc: 'Postura base erguida' },
  { id: 'inhale', label: '🫁 Inhalar', desc: 'Expansión de respiración' },
  { id: 'exhale', label: '🌬️ Exhalar', desc: 'Soltado con vapor' },
  { id: 'shoulder_lift', label: '🤷 Hombros arriba', desc: 'Tensión escapular' },
  { id: 'shoulder_roll', label: '🔄 Rotación', desc: 'Círculos hacia atrás' },
  { id: 'neck_right', label: '👤 Inclinación cuello', desc: 'Oreja al hombro' },
  { id: 'chest_open', label: '👐 Apertura Pecho', desc: 'Espalda con manos entrelazadas' },
  { id: 'seated', label: '🧘 Sentado', desc: 'Meditación loto en el suelo' },
  { id: 'celebrate', label: '🎉 ¡Celebración!', desc: 'Victoria con destellos' }
];

export const AvatarCreator = ({ onSavedCallback }) => {
  const { user, setUser, updateUser, loginUser } = useContext(AuthContext);
  const { confirm: confirmDialog } = useDialog();

  const [avatars, setAvatars] = useState([]);
  const [activeAvatarId, setActiveAvatarId] = useState(null);
  const [avatarName, setAvatarName] = useState(user?.avatar_name || 'Mi Avatar');
  const [currentConfig, setCurrentConfig] = useState(user?.avatar_config || DEFAULT_AVATAR_CONFIG);

  const [viewMode, setViewMode] = useState('editor');
  const [activeTab, setActiveTab] = useState('body');
  const [skinFilter, setSkinFilter] = useState('todos'); 
  const [hairLengthFilter, setHairLengthFilter] = useState('todos');
  const [topCategoryFilter, setTopCategoryFilter] = useState('todos');
  const [bottomCategoryFilter, setBottomCategoryFilter] = useState('todos');
    const [accessorySubTab, setAccessorySubTab] = useState('sombreros');
  const [shoesCategoryFilter, setShoesCategoryFilter] = useState('todos'); // 'todos', 'tenis', 'tacones', 'botas', 'formales', 'sandalias'
 // 'todos', 'jeans', 'pantalones', 'faldas', 'shorts'
 // 'todos', 'playeras', 'camisas', 'sueteres', 'vestidos'
 // 'todos', 'cortos', 'medios', 'largos', 'recogidos'
  const [bodyCategory, setBodyCategory] = useState(
    (currentConfig.bodyType || '').startsWith('hombre') ? 'hombre' : 'mujer'
  );
  const [previewPose, setPreviewPose] = useState('neutral');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAvatars = async () => {
    try {
      setLoading(true);
      const res = await api.get('/avatar', { timeout: 15000 });
      if (res.data) {
        setAvatars(res.data.avatars || []);
        if (res.data.active_avatar) {
          setActiveAvatarId(res.data.active_avatar.id);
          setAvatarName(res.data.active_avatar.name || 'Mi Avatar');
          const cfg = res.data.active_avatar.config || DEFAULT_AVATAR_CONFIG;
          setCurrentConfig(cfg);
          setBodyCategory((cfg.bodyType || '').startsWith('hombre') ? 'hombre' : 'mujer');
        }
      }
    } catch (err) {
      console.warn('Cargando configuración local de avatar (servidor en espera):', err?.message);
      if (user?.avatar_config) {
        setCurrentConfig(user.avatar_config);
        setAvatarName(user.avatar_name || 'Mi Avatar');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvatars();
  }, []);

  const updateConfig = (key, value) => {
    setCurrentConfig(prev => {
      const next = { ...prev, [key]: value };
      // Si se selecciona un vestido, la prenda inferior se retira automáticamente
      if (key === 'topType' && typeof value === 'string' && (value === 'vestido' || value.startsWith('vestido_'))) {
        next.bottomType = 'none';
      }
      // Si se selecciona una prenda inferior teniendo puesto un vestido, se cambia a playera
      if (key === 'bottomType' && value !== 'none' && typeof prev.topType === 'string' && (prev.topType === 'vestido' || prev.topType.startsWith('vestido_'))) {
        next.topType = 'tshirt';
      }
      return next;
    });
  };

  const updateAccessory = (accKey, val) => {
    setCurrentConfig(prev => ({
      ...prev,
      accessories: {
        ...(prev.accessories || {}),
        [accKey]: val
      }
    }));
  };

  const handleSaveAvatar = async () => {
    setErrorMsg('');
    const trimmedName = (avatarName || '').trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Por favor escribe un nombre válido para tu avatar (mínimo 2 letras).');
      return;
    }

    try {
      setLoading(true);
      let savedAvatar = null;

      // 1. Intentar actualizar si hay un ID activo existente
      if (activeAvatarId) {
        try {
          const putRes = await api.put(`/avatar/${activeAvatarId}`, {
            name: trimmedName,
            config: currentConfig,
            set_active: true
          });
          if (putRes.data?.avatar) {
            savedAvatar = putRes.data.avatar;
          }
        } catch (putErr) {
          console.warn('PUT /avatar falló, intentando crear con POST:', putErr?.message);
        }
      }

      // 2. Si no había activeAvatarId o falló el PUT, crear nuevo avatar
      if (!savedAvatar) {
        try {
          const postRes = await api.post('/avatar', {
            name: trimmedName,
            config: currentConfig,
            set_active: true
          });
          if (postRes.data?.avatar) {
            savedAvatar = postRes.data.avatar;
            setActiveAvatarId(savedAvatar.id);
          }
        } catch (postErr) {
          console.warn('POST /avatar falló en red:', postErr?.message);
        }
      }

      // 3. Persistir avatar activo para ejercicios en localStorage y contexto de usuario
      localStorage.setItem('active_exercise_avatar_name', trimmedName);
      localStorage.setItem('active_exercise_avatar_config', JSON.stringify(currentConfig));

      const updatedUserData = {
        ...(user || {}),
        avatar_name: trimmedName,
        avatar_config: currentConfig
      };

      if (updateUser) {
        updateUser(updatedUserData);
      } else if (setUser) {
        setUser(updatedUserData);
      }
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);

      try {
        await loadAvatars();
      } catch (loadErr) {
        console.warn('Recarga de avatares secundaria:', loadErr?.message);
      }

      if (onSavedCallback) onSavedCallback();
    } catch (err) {
      console.error('Error general al guardar avatar:', err);
      // Fallback local seguro
      localStorage.setItem('active_exercise_avatar_name', trimmedName);
      localStorage.setItem('active_exercise_avatar_config', JSON.stringify(currentConfig));
      const updatedUserData = {
        ...(user || {}),
        avatar_name: trimmedName,
        avatar_config: currentConfig
      };
      if (updateUser) updateUser(updatedUserData);
      else if (setUser) setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setActiveAvatarId(null);
    setAvatarName(`Nuevo Avatar`);
    setCurrentConfig({ ...DEFAULT_AVATAR_CONFIG });
    setBodyCategory('mujer');
    setViewMode('editor');
  };

  // Función dedicada para SELECCIONAR QUÉ AVATAR SE MUESTRA EN LOS EJERCICIOS
  const handleSelectForExercises = async (avatarItem) => {
    try {
      setLoading(true);
      setActiveAvatarId(avatarItem.id);
      setAvatarName(avatarItem.name);
      setCurrentConfig(avatarItem.config);
      setBodyCategory((avatarItem.config?.bodyType || '').startsWith('hombre') ? 'hombre' : 'mujer');

      // 1. Guardar de inmediato en localStorage para que los ejercicios lo muestren
      localStorage.setItem('active_exercise_avatar_name', avatarItem.name);
      localStorage.setItem('active_exercise_avatar_config', JSON.stringify(avatarItem.config));

      // 2. Actualizar estado del usuario en sesión
      const updatedUser = {
        ...(user || {}),
        avatar_name: avatarItem.name,
        avatar_config: avatarItem.config
      };
      if (updateUser) {
        updateUser(updatedUser);
      } else if (setUser) {
        setUser(updatedUser);
      }
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // 3. Notificar al backend si hay conexión activa
      try {
        await api.post(`/avatar/${avatarItem.id}/activate`);
      } catch (apiErr) {
        console.warn('Activación en backend en espera:', apiErr?.message);
      }

      await loadAvatars();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error al seleccionar avatar para ejercicios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = async (id, e) => {
    e.stopPropagation();
    const isConfirmed = await confirmDialog({
      title: '¿Eliminar avatar?',
      message: '¿Seguro que deseas eliminar este diseño de avatar de tu biblioteca personal?',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    if (!isConfirmed) return;
    try {
      setLoading(true);
      await api.delete(`/avatar/${id}`);
      await loadAvatars();
    } catch (err) {
      setErrorMsg('Error al eliminar avatar.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const isConfirmed = await confirmDialog({
      title: '¿Restablecer avatar?',
      message: '¿Deseas restablecer este diseño a los valores y vestimenta predeterminados?',
      confirmText: 'Sí, restablecer',
      cancelText: 'Cancelar',
      type: 'warning'
    });
    if (isConfirmed) {
      setCurrentConfig({ ...DEFAULT_AVATAR_CONFIG });
      setBodyCategory('mujer');
      setPreviewPose('neutral');
    }
  };

  const filteredSkinTones = skinFilter === 'todos' 
    ? SKIN_TONES_CATALOG 
    : SKIN_TONES_CATALOG.filter(t => t.category === skinFilter);

        const filteredShoesStyles = shoesCategoryFilter === 'todos'
    ? SHOES_STYLES
    : SHOES_STYLES.filter(s => s.cat === shoesCategoryFilter);

  const filteredBottomStyles = bottomCategoryFilter === 'todos'
    ? BOTTOM_STYLES
    : BOTTOM_STYLES.filter(b => b.cat === bottomCategoryFilter);

  const filteredTopStyles = topCategoryFilter === 'todos'
    ? TOP_STYLES
    : TOP_STYLES.filter(t => t.cat === topCategoryFilter);

  const filteredHairStyles = hairLengthFilter === 'todos'
    ? ALL_HAIR_STYLES
    : ALL_HAIR_STYLES.filter(h => h.cat === hairLengthFilter);

  return (
    <div className="avatar-creator-system animate-fade" style={{ width: '100%', maxWidth: '1160px', margin: '0 auto' }}>
      
      {/* ── ENCABEZADO ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '23px', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Smile size={26} style={{ color: 'var(--primary)' }} />
            <span>Mi Avatar</span>
            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '12px' }}>
              Personalizable
            </span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
            Personaliza al compañero que te acompañará en tu experiencia en EquilibrIA.
          </p>
        </div>

        {/* Selector de Modo */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: viewMode === 'editor' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'editor' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Palette size={14} /> Estudio Creativo
          </button>
          <button
            type="button"
            onClick={() => setViewMode('library')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: viewMode === 'library' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'library' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={14} /> Mis Avatares ({avatars.length})
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="animate-fade" style={{ marginBottom: '18px', padding: '12px 18px', borderRadius: '14px', backgroundColor: 'rgba(124, 58, 237, 0.1)', border: '1.5px solid var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '800' }}>
          <Sparkles size={18} />
          <span>¡Listo! Tu avatar ya está preparado para acompañarte en EquilibrIA. 💜</span>
        </div>
      )}

      {errorMsg && (
        <div className="animate-fade" style={{ marginBottom: '18px', padding: '12px 18px', borderRadius: '14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid #ef4444', color: '#ef4444', fontSize: '13px', fontWeight: '700' }}>
          {errorMsg}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══ MODO BIBLIOTECA ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'library' && (
        <div className="animate-fade">
          {/* Banner explicativo del Avatar en Ejercicios */}
          <div style={{
            padding: '14px 18px',
            borderRadius: '16px',
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
            border: '1.5px solid var(--primary)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                  Avatar Activo para Ejercicios de Bienestar
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  El avatar que marques como <strong>"Activo en Ejercicios"</strong> será quien te guíe y realice los movimientos de hombros, cuello y respiración en todas las sesiones y recursos interactivos de EquilibrIA.
                </p>
              </div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', backgroundColor: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--primary-light)' }}>
              Guía Actual: <strong>{user?.avatar_name || localStorage.getItem('active_exercise_avatar_name') || 'Mi Avatar'}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            {/* Card para crear nuevo avatar */}
            <div
              onClick={handleCreateNew}
              style={{
                borderRadius: '20px',
                border: '2px dashed var(--primary)',
                backgroundColor: 'rgba(124, 58, 237, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '28px 18px',
                cursor: 'pointer',
                minHeight: '270px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Plus size={24} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                Crear Nuevo Avatar
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                Diseña otro compañero para ocasiones deportivas, formales o casuales.
              </p>
            </div>

            {/* Listado de Avatares Guardados */}
            {avatars.map((item) => {
              const currentActiveName = user?.avatar_name || localStorage.getItem('active_exercise_avatar_name') || 'Mi Avatar';
              const isExerciseActive = item.is_active || item.name === currentActiveName || activeAvatarId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveAvatarId(item.id);
                    setAvatarName(item.name);
                    setCurrentConfig(item.config);
                    setBodyCategory((item.config?.bodyType || '').startsWith('hombre') ? 'hombre' : 'mujer');
                    setViewMode('editor');
                  }}
                  style={{
                    borderRadius: '20px',
                    border: isExerciseActive ? '2.5px solid var(--primary)' : '1.5px solid var(--border)',
                    backgroundColor: isExerciseActive ? 'rgba(124, 58, 237, 0.03)' : 'var(--bg-secondary)',
                    boxShadow: isExerciseActive ? '0 8px 24px rgba(124, 58, 237, 0.15)' : 'var(--shadow-sm)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Badge Superior */}
                  {isExerciseActive ? (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'var(--primary)', color: '#ffffff', fontSize: '10px', fontWeight: '900', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)' }}>
                      <Sparkles size={11} /> Activo en Ejercicios
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectForExercises(item);
                      }}
                      title="Usar este avatar en los ejercicios interactivos"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '4px 9px',
                        borderRadius: '8px',
                        border: '1px solid var(--primary)',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontSize: '10.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={11} /> Seleccionar
                    </button>
                  )}

                  {/* Vista Previa del Avatar */}
                  <div style={{ width: '130px', height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '10px' }}>
                    <ModularAvatar config={item.config} compact={true} pose="neutral" />
                  </div>

                  {/* Nombre */}
                  <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 10px 0', textAlign: 'center' }}>
                    {item.name}
                  </h4>

                  {/* Acciones de la tarjeta */}
                  <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: 'auto' }}>
                    {isExerciseActive ? (
                      <div style={{
                        flex: 1,
                        padding: '7px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '900',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}>
                        <Sparkles size={12} /> Seleccionado
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectForExercises(item);
                        }}
                        style={{
                          flex: 1,
                          padding: '7px',
                          borderRadius: '10px',
                          border: '1.5px solid var(--primary)',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Check size={12} /> Usar en Ejercicios
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setActiveAvatarId(item.id);
                        setAvatarName(item.name);
                        setCurrentConfig(item.config);
                        setBodyCategory((item.config?.bodyType || '').startsWith('hombre') ? 'hombre' : 'mujer');
                        setViewMode('editor');
                      }}
                      style={{ padding: '7px 11px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Editar
                    </button>

                    {avatars.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteAvatar(item.id, e)}
                        title="Eliminar este avatar"
                        style={{ padding: '7px 9px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══ MODO ESTUDIO CREATIVO ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'editor' && (
        <div className="responsive-split-studio" style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(280px, 0.8fr)', gap: '24px', alignItems: 'flex-start' }}>

          {/* COLUMNA IZQUIERDA: CONTROLES */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '24px', border: '1.5px solid var(--border)', padding: '22px' }}>
            
            {/* Nombre del Avatar */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                NOMBRE DE TU AVATAR COMPAÑERO:
              </label>
              <input
                type="text"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                placeholder="Ej. Mateo, Angie, Kenny, Sofia, Luna..."
                maxLength={40}
                style={{
                  width: '100%',
                  padding: '11px 15px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '14.5px',
                  fontWeight: '800'
                }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '7px' }}>
                {['Mateo', 'Angie', 'Kenny', 'Luna', 'Alex', 'Sofia', 'Sol'].map((presetName) => (
                  <button
                    key={presetName}
                    type="button"
                    onClick={() => setAvatarName(presetName)}
                    style={{ padding: '3px 9px', borderRadius: '7px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {presetName}
                  </button>
                ))}
              </div>
            </div>

            {/* Pestañas de Personalización */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              {[
                { id: 'body', label: 'Cuerpo & Piel', icon: User },
                { id: 'hair', label: 'Cabello', icon: Scissors },
                { id: 'face', label: 'Rostro & Rasgos', icon: Smile },
                { id: 'glasses', label: 'Gafas', icon: Glasses },
                { id: 'top', label: 'Prenda Superior', icon: Shirt },
                { id: 'bottom', label: 'Prenda Inferior', icon: Layers },
                { id: 'shoes', label: 'Calzado', icon: Footprints },
                { id: 'accessories', label: 'Accesorios', icon: Watch }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '7px 11px',
                      borderRadius: '9px',
                      border: `1px solid ${isSel ? 'var(--primary)' : 'transparent'}`,
                      backgroundColor: isSel ? 'var(--primary-light)' : 'transparent',
                      color: isSel ? 'var(--primary)' : 'var(--text-secondary)',
                      fontSize: '11.5px',
                      fontWeight: isSel ? '900' : '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <TabIcon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── 1. CUERPO Y TONOS DE PIEL ── */}
            {activeTab === 'body' && (
              <div className="animate-fade">
                
                {/* Selector de Tono de Piel y Subtonos */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                      Tono de Piel & Subtonos Naturales:
                    </label>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'claro', label: 'Claros' },
                        { id: 'medio', label: 'Medios' },
                        { id: 'profundo', label: 'Profundos' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSkinFilter(f.id)}
                          style={{
                            padding: '2px 7px',
                            borderRadius: '6px',
                            border: `1px solid ${skinFilter === f.id ? 'var(--primary)' : 'var(--border)'}`,
                            backgroundColor: skinFilter === f.id ? 'var(--primary-light)' : 'transparent',
                            color: skinFilter === f.id ? 'var(--primary)' : 'var(--text-muted)',
                            fontSize: '10.5px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid de Tonos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', gap: '8px' }}>
                    {filteredSkinTones.map(item => {
                      const isSelected = currentConfig.skinTone?.toLowerCase() === item.hex.toLowerCase();
                      const isDark = ['#93532c','#7d431f','#693517','#53270f','#3e1b0b','#2f1408'].includes(item.hex);
                      return (
                        <button
                          key={item.hex}
                          type="button"
                          onClick={() => updateConfig('skinTone', item.hex)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '6px 4px',
                            borderRadius: '12px',
                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                            backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: item.hex,
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '4px'
                            }}
                          >
                            {isSelected && <Check size={16} color={isDark ? '#fff' : '#000'} />}
                          </div>
                          <span style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--text-primary)', textAlign: 'center', lineHeight: '1.1' }}>
                            {item.label}
                          </span>
                          <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1px' }}>
                            {item.undertone}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SELECTOR DE ANATOMÍA: FEMENINO / MASCULINO (SIN PARÉNTESIS) */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                      Anatomía:
                    </label>

                    <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setBodyCategory('mujer');
                          if (!(currentConfig.bodyType || '').startsWith('mujer')) {
                            updateConfig('bodyType', 'mujer_curvilinea');
                          }
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: bodyCategory === 'mujer' ? 'var(--primary)' : 'transparent',
                          color: bodyCategory === 'mujer' ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>👩</span>
                        <span>Femenino</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBodyCategory('hombre');
                          if (!(currentConfig.bodyType || '').startsWith('hombre')) {
                            updateConfig('bodyType', 'hombre_atletico');
                          }
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: bodyCategory === 'hombre' ? 'var(--primary)' : 'transparent',
                          color: bodyCategory === 'hombre' ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>👨</span>
                        <span>Masculino</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '8px' }}>
                    {(bodyCategory === 'mujer' ? FEMALE_BODY_TYPES : MALE_BODY_TYPES).map(type => {
                      const isSelected = currentConfig.bodyType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => updateConfig('bodyType', type.id)}
                          style={{
                            padding: '11px 14px',
                            borderRadius: '12px',
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                            backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                            color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: isSelected ? '900' : '700',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: '800' }}>{type.label}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '500' }}>
                              {type.desc}
                            </div>
                          </div>
                          {isSelected && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Altura */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Estatura / Altura Proporcional:
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['baja', 'media-baja', 'media', 'media-alta', 'alta'].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => updateConfig('height', h)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '10px',
                          border: `1.5px solid ${currentConfig.height === h ? 'var(--primary)' : 'var(--border)'}`,
                          backgroundColor: currentConfig.height === h ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                          color: currentConfig.height === h ? 'var(--primary)' : 'var(--text-primary)',
                          fontSize: '11.5px',
                          fontWeight: currentConfig.height === h ? '900' : '700',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {h.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. CABELLO (CON PESTAÑAS CORTOS, MEDIOS, LARGOS Y RECOGIDOS) ── */}
            {activeTab === 'hair' && (
              <div className="animate-fade">
                
                {/* Filtros de Longitud de Cabello */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                    Longitud & Estilo de Cabello:
                  </label>
                  
                  <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {[
                      { id: 'todos', label: 'Todos' },
                      { id: 'cortos', label: 'Cortos' },
                      { id: 'medios', label: 'Medios' },
                      { id: 'largos', label: 'Largos' },
                      { id: 'recogidos', label: 'Recogidos' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setHairLengthFilter(f.id)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: hairLengthFilter === f.id ? 'var(--primary)' : 'transparent',
                          color: hairLengthFilter === f.id ? '#ffffff' : 'var(--text-muted)',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista de Estilos de Cabello */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '7px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                  {filteredHairStyles.map(style => {
                    const isSel = (currentConfig.hairStyle === style.id) || 
                      (style.id === 'curly_3b_angie' && currentConfig.hairStyle === 'curly_shoulder') ||
                      (style.id === 'ondas_largas' && currentConfig.hairStyle === 'wavy_long') ||
                      (style.id === 'chongo_bonito' && currentConfig.hairStyle === 'messy_bun');
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => updateConfig('hairStyle', style.id)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '12px',
                          border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                          backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                          color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: isSel ? '900' : '700',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div>{style.label}</div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '1px' }}>
                            {style.desc}
                          </div>
                        </div>
                        {isSel && <Check size={15} />}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Color de Cabello:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {HAIR_COLORS.map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => updateConfig('hairColor', c.hex)}
                        title={c.label}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: c.hex,
                          border: currentConfig.hairColor === c.hex ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {currentConfig.hairColor === c.hex && <Check size={14} color={['#ffffff','#e2c499'].includes(c.hex) ? '#000' : '#fff'} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. ROSTRO Y RASGOS DETALLADOS ── */}
            {activeTab === 'face' && (
              <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {/* 1. Formas de Cara */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Forma y Estructura Facial:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                    {FACE_SHAPES_EXTENDED.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateConfig('faceShape', f.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: `1.5px solid ${currentConfig.faceShape === f.id ? 'var(--primary)' : 'var(--border)'}`,
                          backgroundColor: currentConfig.faceShape === f.id ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                          color: currentConfig.faceShape === f.id ? 'var(--primary)' : 'var(--text-primary)',
                          fontSize: '11px',
                          fontWeight: currentConfig.faceShape === f.id ? '900' : '700',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div>{f.label}</div>
                        <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Ojos y Mirada */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Ojos y Expresión de la Mirada:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '8px' }}>
                    {EYE_SHAPES_EXTENDED.map(eye => (
                      <button
                        key={eye.id}
                        type="button"
                        onClick={() => updateConfig('eyes', eye.id)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '9px',
                          border: `1.5px solid ${currentConfig.eyes === eye.id ? 'var(--primary)' : 'var(--border)'}`,
                          backgroundColor: currentConfig.eyes === eye.id ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                          color: currentConfig.eyes === eye.id ? 'var(--primary)' : 'var(--text-primary)',
                          fontSize: '11px',
                          fontWeight: currentConfig.eyes === eye.id ? '900' : '700',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {eye.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Color de Iris:</span>
                    {EYE_COLORS.map(ec => (
                      <button
                        key={ec.hex}
                        type="button"
                        onClick={() => updateConfig('eyeColor', ec.hex)}
                        title={ec.label}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: ec.hex,
                          border: currentConfig.eyeColor === ec.hex ? '2.5px solid var(--primary)' : '1.5px solid rgba(0,0,0,0.2)',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Boca y Labios */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Forma de Labios y Sonrisa:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '10px' }}>
                    {MOUTH_SHAPES_EXTENDED.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateConfig('mouth', m.id)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '9px',
                          border: `1.5px solid ${currentConfig.mouth === m.id ? 'var(--primary)' : 'var(--border)'}`,
                          backgroundColor: currentConfig.mouth === m.id ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                          color: currentConfig.mouth === m.id ? 'var(--primary)' : 'var(--text-primary)',
                          fontSize: '11px',
                          fontWeight: currentConfig.mouth === m.id ? '900' : '700',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Selector de Color de Labios / Labial */}
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Color de Labial / Tono de Labios:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {LIPSTICK_COLORS.map(col => {
                        const isSel = (currentConfig.lipstickColor || '#c27878').toLowerCase() === col.hex.toLowerCase();
                        return (
                          <button
                            key={col.hex}
                            type="button"
                            onClick={() => updateConfig('lipstickColor', col.hex)}
                            title={col.label}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: col.hex,
                              border: isSel ? '2.5px solid var(--primary)' : '1.5px solid rgba(0,0,0,0.15)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isSel && <Check size={12} color={['#f472b6', '#fca5a5', '#fb923c'].includes(col.hex) ? '#000' : '#fff'} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Pecas y Rubor */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig.blush)}
                      onChange={(e) => updateConfig('blush', e.target.checked)}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <span>Rubor suave</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig.freckles)}
                      onChange={(e) => updateConfig('freckles', e.target.checked)}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <span>Pecas sutiles</span>
                  </label>
                </div>
              </div>
            )}

            {/* ── 4. GAFAS ── */}
            {activeTab === 'glasses' && (
              <div className="animate-fade">
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Estilo de Montura de Gafas:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'none', label: 'Sin gafas' },
                      { id: 'round', label: 'Redondas Clásicas' },
                      { id: 'square', label: 'Cuadradas Modernas' },
                      { id: 'rectangle', label: 'Rectangulares Finas' },
                      { id: 'aviator', label: 'Aviador Metálicas' },
                      { id: 'cat_eye', label: 'Ojo de Gato (Cat-Eye)' },
                      { id: 'sunglasses_dark', label: 'Gafas de Sol Negras' },
                      { id: 'sunglasses_color', label: 'Gafas de Sol de Color' }
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => updateConfig('glasses', g.id)}
                        style={{
                          padding: '10px',
                          borderRadius: '12px',
                          border: `1.5px solid ${currentConfig.glasses === g.id ? 'var(--primary)' : 'var(--border)'}`,
                          backgroundColor: currentConfig.glasses === g.id ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                          color: currentConfig.glasses === g.id ? 'var(--primary)' : 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: currentConfig.glasses === g.id ? '900' : '700',
                          cursor: 'pointer'
                        }}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {currentConfig.glasses && currentConfig.glasses !== 'none' && (
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Color de Montura / Lentes:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {GLASSES_COLORS.map(col => {
                        const isSel = (currentConfig.glassesColor || '#7c3aed').toLowerCase() === col.hex.toLowerCase();
                        return (
                          <button
                            key={col.hex}
                            type="button"
                            onClick={() => updateConfig('glassesColor', col.hex)}
                            title={col.label}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: col.hex,
                              border: isSel ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.12)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isSel ? '0 0 0 2px var(--primary-light)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isSel && (
                              <Check size={16} color={['#ffffff', '#e2c499', '#94a3b8', '#e08d8d'].includes(col.hex) ? '#000000' : '#ffffff'} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 5. PRENDA SUPERIOR ── */}
            {activeTab === 'top' && (
              <div className="animate-fade">
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                      Estilo de Prenda Superior:
                    </label>
                    <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'playeras', label: 'Playeras' },
                        { id: 'camisas', label: 'Camisas & Chalecos' },
                        { id: 'sueteres', label: 'Suéteres' },
                        { id: 'vestidos', label: 'Vestidos' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setTopCategoryFilter(f.id)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: topCategoryFilter === f.id ? 'var(--primary)' : 'transparent',
                            color: topCategoryFilter === f.id ? '#ffffff' : 'var(--text-muted)',
                            fontSize: '10.5px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista de Estilos de Prenda Superior */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '7px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                    {filteredTopStyles.map(top => {
                      const isSel = currentConfig.topType === top.id ||
                        (top.id === 'shirt_formal' && currentConfig.topType === 'shirt') ||
                        (top.id === 'sweater_heart' && currentConfig.topType === 'sweater') ||
                        (top.id === 'chaleco_puffy' && currentConfig.topType === 'chaleco') ||
                        (top.id === 'tank_top' && currentConfig.topType === 'sport_top') ||
                        (top.id === 'vestido_corto' && currentConfig.topType === 'vestido');
                      return (
                        <button
                          key={top.id}
                          type="button"
                          onClick={() => updateConfig('topType', top.id)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: '12px',
                            border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                            backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                            color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: isSel ? '900' : '700',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div>{top.label}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '1px' }}>
                              {top.desc}
                            </div>
                          </div>
                          {isSel && <Check size={15} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Color de la Prenda Superior:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {TOP_COLORS.map(col => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => updateConfig('topColor', col.hex)}
                        title={col.label}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: col.hex,
                          border: currentConfig.topColor === col.hex ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {currentConfig.topColor === col.hex && <Check size={16} color={col.hex === '#ffffff' ? '#000' : '#fff'} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 6. PRENDA INFERIOR ── */}
            {activeTab === 'bottom' && (
              <div className="animate-fade">
                {typeof currentConfig.topType === 'string' && (currentConfig.topType === 'vestido' || currentConfig.topType.startsWith('vestido_')) && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-light)',
                    border: '1.5px solid var(--primary)',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '22px' }}>👗</span>
                    <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '600', lineHeight: '1.4' }}>
                      <strong>¡Llevas puesto un vestido completo!</strong><br />
                      La falda del vestido ya cubre la parte inferior. Si eliges un pantalón o falda aquí, tu prenda superior volverá automáticamente a playera.
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                      Estilo de Prenda Inferior:
                    </label>
                    <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'jeans', label: 'Jeans' },
                        { id: 'pantalones', label: 'Pantalones' },
                        { id: 'faldas', label: 'Faldas' },
                        { id: 'shorts', label: 'Shorts' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setBottomCategoryFilter(f.id)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: bottomCategoryFilter === f.id ? 'var(--primary)' : 'transparent',
                            color: bottomCategoryFilter === f.id ? '#ffffff' : 'var(--text-muted)',
                            fontSize: '10.5px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista de Estilos de Prenda Inferior */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '7px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                    {filteredBottomStyles.map(bot => {
                      const isSel = currentConfig.bottomType === bot.id ||
                        (bot.id === 'jeans_clasicos' && currentConfig.bottomType === 'jeans') ||
                        (bot.id === 'shorts_casuales' && currentConfig.bottomType === 'shorts');
                      return (
                        <button
                          key={bot.id}
                          type="button"
                          onClick={() => updateConfig('bottomType', bot.id)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: '12px',
                            border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                            backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                            color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: isSel ? '900' : '700',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div>{bot.label}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '1px' }}>
                              {bot.desc}
                            </div>
                          </div>
                          {isSel && <Check size={15} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Color de Prenda Inferior:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {BOTTOM_COLORS.map(col => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => updateConfig('bottomColor', col.hex)}
                        title={col.label}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: col.hex,
                          border: currentConfig.bottomColor === col.hex ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {currentConfig.bottomColor === col.hex && <Check size={16} color={['#ffffff', '#cbd5e1', '#d4c3a3'].includes(col.hex) ? '#000' : '#fff'} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 7. CALZADO ── */}
            {activeTab === 'shoes' && (
              <div className="animate-fade">
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                      Modelo de Calzado:
                    </label>
                    <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                      {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'tenis', label: 'Tenis' },
                        { id: 'tacones', label: 'Tacones' },
                        { id: 'botas', label: 'Botas' },
                        { id: 'formales', label: 'Formales' },
                        { id: 'sandalias', label: 'Sandalias' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setShoesCategoryFilter(f.id)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: shoesCategoryFilter === f.id ? 'var(--primary)' : 'transparent',
                            color: shoesCategoryFilter === f.id ? '#ffffff' : 'var(--text-muted)',
                            fontSize: '10.5px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista de Calzado */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '7px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                    {filteredShoesStyles.map(sh => {
                      const isSel = currentConfig.shoesType === sh.id ||
                        (sh.id === 'sneakers_urbanos' && currentConfig.shoesType === 'skate') ||
                        (sh.id === 'sneakers_running' && currentConfig.shoesType === 'runners') ||
                        (sh.id === 'sneakers_altos' && currentConfig.shoesType === 'high_tops') ||
                        (sh.id === 'botines_chelsea' && currentConfig.shoesType === 'botas') ||
                        (sh.id === 'sandalias_planas' && currentConfig.shoesType === 'sandalias') ||
                        (sh.id === 'zapatos_oxford' && currentConfig.shoesType === 'zapatos_vestir') ||
                        (sh.id === 'mocasines_clasicos' && currentConfig.shoesType === 'mocasines');
                      return (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() => updateConfig('shoesType', sh.id)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: '12px',
                            border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                            backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                            color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: isSel ? '900' : '700',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div>{sh.label}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '1px' }}>
                              {sh.desc}
                            </div>
                          </div>
                          {isSel && <Check size={15} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Color del Calzado:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SHOES_COLORS.map(col => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => updateConfig('shoesColor', col.hex)}
                        title={col.label}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: col.hex,
                          border: currentConfig.shoesColor === col.hex ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {currentConfig.shoesColor === col.hex && (
                          <Check size={16} color={['#ffffff', '#e5dcd0', '#bfa67a', '#94a3b8', '#fce7f3'].includes(col.hex) ? '#000' : '#fff'} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 8. ACCESORIOS CON SELECTOR DE COLOR ── */}
            {activeTab === 'accessories' && (
              <div className="animate-fade">
                {/* Selector de Subcategoría de Accesorios */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '16px', overflowX: 'auto' }}>
                  {ACCESSORY_SUBTABS.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setAccessorySubTab(st.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: accessorySubTab === st.id ? 'var(--primary)' : 'transparent',
                        color: accessorySubTab === st.id ? '#ffffff' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* ── SUBCATEGORÍA 1: SOMBREROS & GORROS ── */}
                {accessorySubTab === 'sombreros' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Modelo de Sombrero o Gorro:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '7px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                      {HEADWEAR_OPTIONS.map(hw => {
                        const cur = currentConfig.accessories?.headwearType || (currentConfig.accessories?.cap ? 'cap' : (currentConfig.accessories?.beanie ? 'beanie' : 'none'));
                        const isSel = cur === hw.id;
                        return (
                          <button
                            key={hw.id}
                            type="button"
                            onClick={() => {
                              updateAccessory('headwearType', hw.id);
                              updateAccessory('cap', hw.id === 'cap');
                              updateAccessory('beanie', hw.id === 'beanie');
                            }}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '12px',
                              border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                              backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                              color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                              fontSize: '12px',
                              fontWeight: isSel ? '900' : '700',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div>{hw.label}</div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{hw.desc}</div>
                            </div>
                            {isSel && <Check size={15} />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Color del Sombrero si no es 'none' */}
                    {(currentConfig.accessories?.headwearType || (currentConfig.accessories?.cap ? 'cap' : (currentConfig.accessories?.beanie ? 'beanie' : 'none'))) !== 'none' && (
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                          Color del Sombrero:
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {ACCESSORY_FABRIC_COLORS.map(col => (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => {
                                updateAccessory('headwearColor', col.hex);
                                updateAccessory('capColor', col.hex);
                                updateAccessory('beanieColor', col.hex);
                              }}
                              title={col.label}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: col.hex,
                                border: (currentConfig.accessories?.headwearColor || currentConfig.accessories?.capColor || '#18181b') === col.hex ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {(currentConfig.accessories?.headwearColor || currentConfig.accessories?.capColor || '#18181b') === col.hex && (
                                <Check size={14} color={['#ffffff', '#bfa67a', '#fbbf24'].includes(col.hex) ? '#000' : '#fff'} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUBCATEGORÍA 2: CUELLO & BUFANDAS ── */}
                {accessorySubTab === 'cuello' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Prenda o Joya de Cuello:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '7px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                      {NECK_OPTIONS.map(nk => {
                        const cur = currentConfig.accessories?.necklaceType || (currentConfig.accessories?.necklace ? 'collar_zen' : 'none');
                        const isSel = cur === nk.id;
                        return (
                          <button
                            key={nk.id}
                            type="button"
                            onClick={() => {
                              updateAccessory('necklaceType', nk.id);
                              updateAccessory('necklace', nk.id !== 'none');
                            }}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '12px',
                              border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                              backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                              color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                              fontSize: '12px',
                              fontWeight: isSel ? '900' : '700',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div>{nk.label}</div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{nk.desc}</div>
                            </div>
                            {isSel && <Check size={15} />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selector de color según sea tela (bufanda) o metal/joya */}
                    {(currentConfig.accessories?.necklaceType || (currentConfig.accessories?.necklace ? 'collar_zen' : 'none')) !== 'none' && (
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                          {['bufanda_tejida', 'bufanda_seda'].includes(currentConfig.accessories?.necklaceType) ? 'Color de la Bufanda / Pañuelo:' : 'Tono del Metal o Joya:'}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(['bufanda_tejida', 'bufanda_seda'].includes(currentConfig.accessories?.necklaceType) ? ACCESSORY_FABRIC_COLORS : JEWELRY_COLORS).map(col => {
                            const isSel = (currentConfig.accessories?.scarfColor || currentConfig.accessories?.jewelryColor || '#dc2626') === col.hex;
                            return (
                              <button
                                key={col.hex}
                                type="button"
                                onClick={() => {
                                  updateAccessory('scarfColor', col.hex);
                                  updateAccessory('jewelryColor', col.hex);
                                }}
                                title={col.label}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: col.hex,
                                  border: isSel ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.1)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {isSel && <Check size={14} color={['#ffffff', '#e2e8f0', '#bfa67a', '#fbbf24'].includes(col.hex) ? '#000' : '#fff'} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUBCATEGORÍA 3: PIERCINGS FACIALES ── */}
                {accessorySubTab === 'piercings' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Piercings Faciales Notorios:
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {[
                        { key: 'piercingNose', label: 'Piercing en la Nariz (Nostril)', desc: 'Aro o brillante metálico en la aleta' },
                        { key: 'piercingSeptum', label: 'Piercing Septum', desc: 'Herradura circular en el tabique' },
                        { key: 'piercingEyebrow', label: 'Piercing en la Ceja', desc: 'Barra curva con doble bola metálica' },
                        { key: 'piercingLip', label: 'Piercing en el Labio (Labret)', desc: 'Brillante centrado debajo del labio' }
                      ].map(p => {
                        const isChecked = Boolean(currentConfig.accessories?.[p.key]);
                        return (
                          <label
                            key={p.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              backgroundColor: isChecked ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                              border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border)'}`,
                              cursor: 'pointer'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: isChecked ? '900' : '700', color: isChecked ? 'var(--primary)' : 'var(--text-primary)' }}>
                                {p.label}
                              </div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{p.desc}</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => updateAccessory(p.key, e.target.checked)}
                              style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                            />
                          </label>
                        );
                      })}
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                        Material / Color de Piercings:
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {JEWELRY_COLORS.map(col => {
                          const isSel = (currentConfig.accessories?.piercingsColor || '#e2e8f0') === col.hex;
                          return (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => updateAccessory('piercingsColor', col.hex)}
                              title={col.label}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: col.hex,
                                border: isSel ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {isSel && <Check size={14} color={col.hex === '#e2e8f0' ? '#000' : '#fff'} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SUBCATEGORÍA 4: ARETES & JOYERÍA ── */}
                {accessorySubTab === 'aretes' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Modelo de Aretes:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '7px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                      {EARRINGS_OPTIONS.map(er => {
                        const cur = currentConfig.accessories?.earringsType || (currentConfig.accessories?.earrings ? 'aretes_arracadas' : 'none');
                        const isSel = cur === er.id;
                        return (
                          <button
                            key={er.id}
                            type="button"
                            onClick={() => {
                              updateAccessory('earringsType', er.id);
                              updateAccessory('earrings', er.id !== 'none');
                            }}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '12px',
                              border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                              backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                              color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                              fontSize: '12px',
                              fontWeight: isSel ? '900' : '700',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div>{er.label}</div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{er.desc}</div>
                            </div>
                            {isSel && <Check size={15} />}
                          </button>
                        );
                      })}
                    </div>

                    {(currentConfig.accessories?.earringsType || (currentConfig.accessories?.earrings ? 'aretes_arracadas' : 'none')) !== 'none' && (
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                          Tono del Metal de Aretes:
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {JEWELRY_COLORS.map(col => {
                            const isSel = (currentConfig.accessories?.jewelryColor || '#d4af37') === col.hex;
                            return (
                              <button
                                key={col.hex}
                                type="button"
                                onClick={() => updateAccessory('jewelryColor', col.hex)}
                                title={col.label}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: col.hex,
                                  border: isSel ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.1)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {isSel && <Check size={14} color={col.hex === '#e2e8f0' ? '#000' : '#fff'} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUBCATEGORÍA 5: AUDÍFONOS & AUDIO ── */}
                {accessorySubTab === 'audio' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Dispositivo de Audio:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '7px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                      {HEADPHONES_OPTIONS.map(hp => {
                        const cur = currentConfig.accessories?.headphonesType || (currentConfig.accessories?.headphones ? 'headphones_overear' : 'none');
                        const isSel = cur === hp.id;
                        return (
                          <button
                            key={hp.id}
                            type="button"
                            onClick={() => {
                              updateAccessory('headphonesType', hp.id);
                              updateAccessory('headphones', hp.id !== 'none');
                            }}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '12px',
                              border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                              backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                              color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                              fontSize: '12px',
                              fontWeight: isSel ? '900' : '700',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div>{hp.label}</div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{hp.desc}</div>
                            </div>
                            {isSel && <Check size={15} />}
                          </button>
                        );
                      })}
                    </div>

                    {(currentConfig.accessories?.headphonesType || (currentConfig.accessories?.headphones ? 'headphones_overear' : 'none')) !== 'none' && (
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                          Color de los Audífonos:
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {ACCESSORY_FABRIC_COLORS.map(col => {
                            const isSel = (currentConfig.accessories?.headphonesColor || '#18181b') === col.hex;
                            return (
                              <button
                                key={col.hex}
                                type="button"
                                onClick={() => updateAccessory('headphonesColor', col.hex)}
                                title={col.label}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: col.hex,
                                  border: isSel ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.1)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {isSel && <Check size={14} color={['#ffffff', '#bfa67a', '#fbbf24'].includes(col.hex) ? '#000' : '#fff'} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUBCATEGORÍA 6: RELOJES & PULSERAS ── */}
                {accessorySubTab === 'relojes' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Accesorio de Muñeca:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '7px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                      {WATCH_OPTIONS.map(wt => {
                        const cur = currentConfig.accessories?.watchType || (currentConfig.accessories?.watch ? 'watch_smart' : 'none');
                        const isSel = cur === wt.id;
                        return (
                          <button
                            key={wt.id}
                            type="button"
                            onClick={() => {
                              updateAccessory('watchType', wt.id);
                              updateAccessory('watch', wt.id !== 'none');
                            }}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '12px',
                              border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                              backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                              color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                              fontSize: '12px',
                              fontWeight: isSel ? '900' : '700',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div>{wt.label}</div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{wt.desc}</div>
                            </div>
                            {isSel && <Check size={15} />}
                          </button>
                        );
                      })}
                    </div>

                    {(currentConfig.accessories?.watchType || (currentConfig.accessories?.watch ? 'watch_smart' : 'none')) !== 'none' && (
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                          Color de la Correa / Pulseras:
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {ACCESSORY_FABRIC_COLORS.map(col => {
                            const isSel = (currentConfig.accessories?.watchColor || '#18181b') === col.hex;
                            return (
                              <button
                                key={col.hex}
                                type="button"
                                onClick={() => updateAccessory('watchColor', col.hex)}
                                title={col.label}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: col.hex,
                                  border: isSel ? '3px solid var(--primary)' : '2px solid rgba(0,0,0,0.1)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {isSel && <Check size={14} color={['#ffffff', '#bfa67a', '#fbbf24'].includes(col.hex) ? '#000' : '#fff'} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUBCATEGORÍA 7: EXTRAS & DETALLES ── */}
                {accessorySubTab === 'extras' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block' }}>
                      Accesorios Especiales y de Moda:
                    </label>

                    {/* Curita en la nariz */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: currentConfig.accessories?.bandaid ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                        border: `1.5px solid ${currentConfig.accessories?.bandaid ? 'var(--primary)' : 'var(--border)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)' }}>
                          🩹 Curita Estética en la Nariz
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          Curita adhesiva kawaii en el tabique con pequeños corazones
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(currentConfig.accessories?.bandaid)}
                        onChange={(e) => updateAccessory('bandaid', e.target.checked)}
                        style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                      />
                    </label>

                    {/* Bolso Bandolera Cruzado */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: currentConfig.accessories?.crossbodyBag ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                        border: `1.5px solid ${currentConfig.accessories?.crossbodyBag ? 'var(--primary)' : 'var(--border)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)' }}>
                          👜 Bolso Bandolera Cruzado
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          Correa diagonal de cuero sobre el pecho con cartera al costado
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(currentConfig.accessories?.crossbodyBag)}
                        onChange={(e) => updateAccessory('crossbodyBag', e.target.checked)}
                        style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* COLUMNA DERECHA: ESCENARIO 3D EN VIVO */}
          <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                background: 'linear-gradient(150deg, var(--bg-primary) 0%, var(--primary-light) 60%, var(--bg-secondary) 100%)',
                border: '1.5px solid var(--border)',
                padding: '24px 20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minHeight: '390px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  width: '220px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg, var(--primary-light) 0%, var(--primary) 100%)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.8)',
                  border: '1.5px solid rgba(255,255,255,0.7)',
                  zIndex: 1
                }}
              />

              <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%', minHeight: '330px' }}>
                <ModularAvatar
                  config={currentConfig}
                  pose={previewPose}
                  duration={4}
                  compact={false}
                />
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PROBADOR DE POSES Y ANIMACIONES:
                </span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>
                  {PREVIEW_POSES.find(p => p.id === previewPose)?.desc}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PREVIEW_POSES.map(pos => {
                  const isSel = previewPose === pos.id;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPreviewPose(pos.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: `1px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                        backgroundColor: isSel ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: isSel ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '11.5px',
                        fontWeight: isSel ? '900' : '700',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {pos.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={loading}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Guardar Avatar</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                title="Restablecer"
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Restablecer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AvatarCreator;
