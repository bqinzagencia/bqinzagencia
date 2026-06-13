// lib/stockIndustrias.js
// Items de inventario predefinidos por industria
// Cada empresa arranca con estos items sugeridos que puede editar o ampliar

export const STOCK_INDUSTRIAS = {

  restaurante: {
    labelInventario: 'Inventario de cocina',
    unidadesComunes: ['kg', 'libra', 'unidad', 'litro', 'paquete', 'caja', 'bolsa', 'docena'],
    categorias: ['Carnes y proteínas', 'Verduras y hortalizas', 'Granos y cereales', 'Lácteos', 'Condimentos', 'Bebidas', 'Empaques', 'Utensilios'],
    items: [
      { nombre: 'Carne de res',          categoria: 'Carnes y proteínas', unidad: 'kg',     precioCompra: 18000, precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Pollo entero',          categoria: 'Carnes y proteínas', unidad: 'kg',     precioCompra: 9000,  precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Chicharrón',            categoria: 'Carnes y proteínas', unidad: 'kg',     precioCompra: 14000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Arroz',                 categoria: 'Granos y cereales',  unidad: 'kg',     precioCompra: 2800,  precioVenta: 0,     stockMinimo: 10 },
      { nombre: 'Frijoles',              categoria: 'Granos y cereales',  unidad: 'kg',     precioCompra: 4500,  precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Papa pastusa',          categoria: 'Verduras y hortalizas', unidad: 'kg',  precioCompra: 1800,  precioVenta: 0,     stockMinimo: 10 },
      { nombre: 'Plátano maduro',        categoria: 'Verduras y hortalizas', unidad: 'kg',  precioCompra: 2500,  precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Aguacate',              categoria: 'Verduras y hortalizas', unidad: 'unidad', precioCompra: 2500, precioVenta: 0,   stockMinimo: 10 },
      { nombre: 'Huevos',               categoria: 'Lácteos',            unidad: 'docena', precioCompra: 16000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Aceite vegetal',        categoria: 'Condimentos',        unidad: 'litro',  precioCompra: 8000,  precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Sal',                   categoria: 'Condimentos',        unidad: 'kg',     precioCompra: 1500,  precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Gaseosa 1.5L',          categoria: 'Bebidas',            unidad: 'unidad', precioCompra: 4500,  precioVenta: 6000,  stockMinimo: 12 },
      { nombre: 'Agua 600ml',            categoria: 'Bebidas',            unidad: 'unidad', precioCompra: 1500,  precioVenta: 2500,  stockMinimo: 12 },
      { nombre: 'Vasos desechables',     categoria: 'Empaques',           unidad: 'paquete',precioCompra: 4000,  precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Cajas de cartón domicilio', categoria: 'Empaques',       unidad: 'paquete',precioCompra: 8000,  precioVenta: 0,     stockMinimo: 2  },
    ],
  },

  taller: {
    labelInventario: 'Inventario de repuestos e insumos',
    unidadesComunes: ['unidad', 'litro', 'kg', 'caja', 'par', 'metro'],
    categorias: ['Lubricantes', 'Filtros', 'Frenos', 'Suspensión', 'Eléctrico', 'Herramientas', 'Accesorios'],
    items: [
      { nombre: 'Aceite motor 20W50 1L',    categoria: 'Lubricantes',  unidad: 'litro',  precioCompra: 15000, precioVenta: 22000,  stockMinimo: 10 },
      { nombre: 'Aceite sintético 5W30 1L', categoria: 'Lubricantes',  unidad: 'litro',  precioCompra: 22000, precioVenta: 32000,  stockMinimo: 10 },
      { nombre: 'Aceite de caja',           categoria: 'Lubricantes',  unidad: 'litro',  precioCompra: 12000, precioVenta: 18000,  stockMinimo: 5  },
      { nombre: 'Filtro de aceite genérico',categoria: 'Filtros',      unidad: 'unidad', precioCompra: 8000,  precioVenta: 15000,  stockMinimo: 5  },
      { nombre: 'Filtro de aire',           categoria: 'Filtros',      unidad: 'unidad', precioCompra: 12000, precioVenta: 22000,  stockMinimo: 5  },
      { nombre: 'Filtro de combustible',    categoria: 'Filtros',      unidad: 'unidad', precioCompra: 10000, precioVenta: 18000,  stockMinimo: 5  },
      { nombre: 'Pastillas de freno delanteras', categoria: 'Frenos',  unidad: 'par',    precioCompra: 35000, precioVenta: 60000,  stockMinimo: 3  },
      { nombre: 'Pastillas de freno traseras',   categoria: 'Frenos',  unidad: 'par',    precioCompra: 28000, precioVenta: 50000,  stockMinimo: 3  },
      { nombre: 'Líquido de frenos DOT4',   categoria: 'Frenos',       unidad: 'litro',  precioCompra: 15000, precioVenta: 25000,  stockMinimo: 3  },
      { nombre: 'Amortiguador delantero',   categoria: 'Suspensión',   unidad: 'unidad', precioCompra: 80000, precioVenta: 150000, stockMinimo: 2  },
      { nombre: 'Bujías x4',               categoria: 'Eléctrico',    unidad: 'caja',   precioCompra: 25000, precioVenta: 45000,  stockMinimo: 3  },
      { nombre: 'Batería 45Ah',             categoria: 'Eléctrico',    unidad: 'unidad', precioCompra: 180000,precioVenta: 280000, stockMinimo: 1  },
      { nombre: 'Refrigerante',             categoria: 'Lubricantes',  unidad: 'litro',  precioCompra: 12000, precioVenta: 20000,  stockMinimo: 5  },
      { nombre: 'Silicona líquida',         categoria: 'Accesorios',   unidad: 'unidad', precioCompra: 8000,  precioVenta: 15000,  stockMinimo: 3  },
    ],
  },

  peluqueria: {
    labelInventario: 'Inventario de productos de belleza',
    unidadesComunes: ['unidad', 'ml', 'gr', 'litro', 'caja', 'paquete'],
    categorias: ['Coloración', 'Tratamientos', 'Lavado', 'Estilizado', 'Uñas', 'Insumos'],
    items: [
      { nombre: 'Tinte en crema (varios tonos)', categoria: 'Coloración',    unidad: 'unidad', precioCompra: 12000, precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Oxidante 20 vol 1L',            categoria: 'Coloración',    unidad: 'litro',  precioCompra: 18000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Decolorante en polvo',          categoria: 'Coloración',    unidad: 'paquete',precioCompra: 25000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Keratina líquida 1L',           categoria: 'Tratamientos',  unidad: 'litro',  precioCompra: 85000, precioVenta: 0,     stockMinimo: 1  },
      { nombre: 'Tratamiento hidratación 500ml', categoria: 'Tratamientos',  unidad: 'unidad', precioCompra: 35000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Shampoo profesional 1L',        categoria: 'Lavado',        unidad: 'litro',  precioCompra: 28000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Acondicionador 1L',             categoria: 'Lavado',        unidad: 'litro',  precioCompra: 22000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Mousse fijador',                categoria: 'Estilizado',    unidad: 'unidad', precioCompra: 18000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Laca en spray',                 categoria: 'Estilizado',    unidad: 'unidad', precioCompra: 15000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Esmalte de uñas (surtido)',     categoria: 'Uñas',          unidad: 'unidad', precioCompra: 8000,  precioVenta: 0,     stockMinimo: 10 },
      { nombre: 'Acetona quitaesmalte',          categoria: 'Uñas',          unidad: 'litro',  precioCompra: 8000,  precioVenta: 0,     stockMinimo: 1  },
      { nombre: 'Toallas desechables x50',       categoria: 'Insumos',       unidad: 'paquete',precioCompra: 12000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Guantes de látex x100',         categoria: 'Insumos',       unidad: 'caja',   precioCompra: 28000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Papel aluminio 50m',            categoria: 'Insumos',       unidad: 'unidad', precioCompra: 18000, precioVenta: 0,     stockMinimo: 2  },
    ],
  },

  barbero: {
    labelInventario: 'Inventario de insumos de barbería',
    unidadesComunes: ['unidad', 'ml', 'caja', 'paquete'],
    categorias: ['Productos capilares', 'Productos de barba', 'Higiene y desinfección', 'Insumos'],
    items: [
      { nombre: 'Crema de afeitar',          categoria: 'Productos de barba',  unidad: 'unidad', precioCompra: 12000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Aceite para barba',         categoria: 'Productos de barba',  unidad: 'unidad', precioCompra: 25000, precioVenta: 40000, stockMinimo: 2  },
      { nombre: 'Cera para cabello',         categoria: 'Productos capilares', unidad: 'unidad', precioCompra: 15000, precioVenta: 25000, stockMinimo: 3  },
      { nombre: 'Pomada mate',               categoria: 'Productos capilares', unidad: 'unidad', precioCompra: 18000, precioVenta: 30000, stockMinimo: 3  },
      { nombre: 'Shampoo profesional 1L',    categoria: 'Productos capilares', unidad: 'litro',  precioCompra: 28000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Alcohol 96% 1L',            categoria: 'Higiene y desinfección', unidad: 'litro', precioCompra: 12000, precioVenta: 0,   stockMinimo: 2  },
      { nombre: 'Barbicidas desinfectante',  categoria: 'Higiene y desinfección', unidad: 'litro', precioCompra: 22000, precioVenta: 0,   stockMinimo: 1  },
      { nombre: 'Hojillas x100',             categoria: 'Insumos',             unidad: 'caja',   precioCompra: 18000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Toallas desechables x50',   categoria: 'Insumos',             unidad: 'paquete',precioCompra: 12000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Guardapolvos desechables',  categoria: 'Insumos',             unidad: 'paquete',precioCompra: 15000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Talco para barbería',       categoria: 'Productos capilares', unidad: 'unidad', precioCompra: 8000,  precioVenta: 0,     stockMinimo: 2  },
    ],
  },

  veterinaria: {
    labelInventario: 'Inventario de medicamentos e insumos veterinarios',
    unidadesComunes: ['unidad', 'ml', 'caja', 'frasco', 'ampolla'],
    categorias: ['Medicamentos', 'Vacunas', 'Insumos quirúrgicos', 'Alimentos', 'Antiparasitarios'],
    items: [
      { nombre: 'Amoxicilina 500mg x10',     categoria: 'Medicamentos',        unidad: 'caja',   precioCompra: 18000, precioVenta: 35000, stockMinimo: 5  },
      { nombre: 'Meloxicam inyectable',       categoria: 'Medicamentos',        unidad: 'frasco', precioCompra: 25000, precioVenta: 45000, stockMinimo: 3  },
      { nombre: 'Suero fisiológico 500ml',    categoria: 'Insumos quirúrgicos', unidad: 'unidad', precioCompra: 8000,  precioVenta: 15000, stockMinimo: 5  },
      { nombre: 'Vacuna múltiple canina',     categoria: 'Vacunas',             unidad: 'unidad', precioCompra: 22000, precioVenta: 55000, stockMinimo: 5  },
      { nombre: 'Vacuna antirrabica',         categoria: 'Vacunas',             unidad: 'unidad', precioCompra: 18000, precioVenta: 45000, stockMinimo: 5  },
      { nombre: 'Vacuna triple felina',       categoria: 'Vacunas',             unidad: 'unidad', precioCompra: 25000, precioVenta: 60000, stockMinimo: 3  },
      { nombre: 'Jeringa 10ml x10',           categoria: 'Insumos quirúrgicos', unidad: 'caja',   precioCompra: 8000,  precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Guantes estériles x50',      categoria: 'Insumos quirúrgicos', unidad: 'caja',   precioCompra: 35000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Antiparasitario externo',    categoria: 'Antiparasitarios',    unidad: 'unidad', precioCompra: 15000, precioVenta: 30000, stockMinimo: 5  },
      { nombre: 'Desparasitante oral perros', categoria: 'Antiparasitarios',    unidad: 'unidad', precioCompra: 8000,  precioVenta: 18000, stockMinimo: 5  },
      { nombre: 'Concentrado premium canino 2kg', categoria: 'Alimentos',       unidad: 'unidad', precioCompra: 45000, precioVenta: 75000, stockMinimo: 3  },
    ],
  },

  reposteria: {
    labelInventario: 'Inventario de repostería',
    unidadesComunes: ['kg', 'gr', 'unidad', 'litro', 'paquete', 'caja'],
    categorias: ['Harinas y bases', 'Endulzantes', 'Lácteos', 'Decoración', 'Empaques'],
    items: [
      { nombre: 'Harina de trigo 1kg',       categoria: 'Harinas y bases',  unidad: 'kg',     precioCompra: 3500,  precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Azúcar blanca 1kg',         categoria: 'Endulzantes',      unidad: 'kg',     precioCompra: 3800,  precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Azúcar pulverizada 1kg',    categoria: 'Endulzantes',      unidad: 'kg',     precioCompra: 5000,  precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Mantequilla 250gr',         categoria: 'Lácteos',          unidad: 'unidad', precioCompra: 8500,  precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Huevos x30',               categoria: 'Lácteos',          unidad: 'caja',   precioCompra: 40000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Leche entera 1L',           categoria: 'Lácteos',          unidad: 'litro',  precioCompra: 4200,  precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Crema de leche 500ml',      categoria: 'Lácteos',          unidad: 'unidad', precioCompra: 9000,  precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Chocolate cobertura 1kg',   categoria: 'Harinas y bases',  unidad: 'kg',     precioCompra: 32000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Arequipe 500gr',            categoria: 'Harinas y bases',  unidad: 'unidad', precioCompra: 8000,  precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Colorantes gel x6',         categoria: 'Decoración',       unidad: 'caja',   precioCompra: 25000, precioVenta: 0,     stockMinimo: 1  },
      { nombre: 'Sprinkles decorativos',     categoria: 'Decoración',       unidad: 'unidad', precioCompra: 8000,  precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Cajas para torta',          categoria: 'Empaques',         unidad: 'unidad', precioCompra: 4500,  precioVenta: 0,     stockMinimo: 10 },
      { nombre: 'Cajas para cupcakes x12',   categoria: 'Empaques',         unidad: 'unidad', precioCompra: 3500,  precioVenta: 0,     stockMinimo: 10 },
    ],
  },

  tienda: {
    labelInventario: 'Inventario de productos',
    unidadesComunes: ['unidad', 'par', 'docena', 'caja', 'paquete'],
    categorias: ['Ropa mujer', 'Ropa hombre', 'Calzado', 'Accesorios', 'Otros'],
    items: [
      { nombre: 'Blusas talla S',    categoria: 'Ropa mujer',  unidad: 'unidad', precioCompra: 18000, precioVenta: 45000, stockMinimo: 5  },
      { nombre: 'Blusas talla M',    categoria: 'Ropa mujer',  unidad: 'unidad', precioCompra: 18000, precioVenta: 45000, stockMinimo: 5  },
      { nombre: 'Blusas talla L',    categoria: 'Ropa mujer',  unidad: 'unidad', precioCompra: 18000, precioVenta: 45000, stockMinimo: 5  },
      { nombre: 'Jeans mujer 28',    categoria: 'Ropa mujer',  unidad: 'unidad', precioCompra: 35000, precioVenta: 89000, stockMinimo: 3  },
      { nombre: 'Jeans mujer 30',    categoria: 'Ropa mujer',  unidad: 'unidad', precioCompra: 35000, precioVenta: 89000, stockMinimo: 3  },
      { nombre: 'Camiseta hombre M', categoria: 'Ropa hombre', unidad: 'unidad', precioCompra: 15000, precioVenta: 38000, stockMinimo: 5  },
      { nombre: 'Camiseta hombre L', categoria: 'Ropa hombre', unidad: 'unidad', precioCompra: 15000, precioVenta: 38000, stockMinimo: 5  },
      { nombre: 'Tenis mujer 36',    categoria: 'Calzado',     unidad: 'par',    precioCompra: 45000, precioVenta: 98000, stockMinimo: 2  },
      { nombre: 'Tenis mujer 38',    categoria: 'Calzado',     unidad: 'par',    precioCompra: 45000, precioVenta: 98000, stockMinimo: 2  },
      { nombre: 'Bolso de mano',     categoria: 'Accesorios',  unidad: 'unidad', precioCompra: 25000, precioVenta: 65000, stockMinimo: 3  },
    ],
  },

  farmacia: {
    labelInventario: 'Inventario de medicamentos y productos',
    unidadesComunes: ['caja', 'frasco', 'unidad', 'paquete'],
    categorias: ['Medicamentos', 'Vitaminas', 'Higiene', 'Bebé', 'Cuidado personal'],
    items: [
      { nombre: 'Acetaminofén 500mg x100',   categoria: 'Medicamentos',     unidad: 'caja',   precioCompra: 12000, precioVenta: 18000, stockMinimo: 5  },
      { nombre: 'Ibuprofeno 400mg x20',      categoria: 'Medicamentos',     unidad: 'caja',   precioCompra: 8000,  precioVenta: 14000, stockMinimo: 5  },
      { nombre: 'Loratadina 10mg x10',       categoria: 'Medicamentos',     unidad: 'caja',   precioCompra: 5000,  precioVenta: 9000,  stockMinimo: 5  },
      { nombre: 'Vitamina C 1000mg x30',     categoria: 'Vitaminas',        unidad: 'caja',   precioCompra: 25000, precioVenta: 38000, stockMinimo: 5  },
      { nombre: 'Multivitamínico x60',       categoria: 'Vitaminas',        unidad: 'frasco', precioCompra: 35000, precioVenta: 55000, stockMinimo: 3  },
      { nombre: 'Alcohol antiséptico 500ml', categoria: 'Higiene',          unidad: 'frasco', precioCompra: 8000,  precioVenta: 13000, stockMinimo: 5  },
      { nombre: 'Crema antiséptica',         categoria: 'Higiene',          unidad: 'unidad', precioCompra: 6000,  precioVenta: 11000, stockMinimo: 5  },
      { nombre: 'Pañales talla 2 x30',       categoria: 'Bebé',             unidad: 'paquete',precioCompra: 38000, precioVenta: 55000, stockMinimo: 3  },
      { nombre: 'Crema para bebé',           categoria: 'Bebé',             unidad: 'unidad', precioCompra: 12000, precioVenta: 20000, stockMinimo: 3  },
    ],
  },

  tecnico: {
    labelInventario: 'Inventario de repuestos y materiales',
    unidadesComunes: ['unidad', 'metro', 'caja', 'paquete'],
    categorias: ['Pantallas', 'Baterías', 'Cables y conectores', 'Herramientas', 'Materiales'],
    items: [
      { nombre: 'Pantalla Samsung A32',     categoria: 'Pantallas',           unidad: 'unidad', precioCompra: 120000,precioVenta: 180000,stockMinimo: 2  },
      { nombre: 'Pantalla iPhone 11',       categoria: 'Pantallas',           unidad: 'unidad', precioCompra: 180000,precioVenta: 280000,stockMinimo: 1  },
      { nombre: 'Pantalla genérica 6.5"',   categoria: 'Pantallas',           unidad: 'unidad', precioCompra: 65000, precioVenta: 110000,stockMinimo: 2  },
      { nombre: 'Batería Samsung A50',      categoria: 'Baterías',            unidad: 'unidad', precioCompra: 35000, precioVenta: 60000, stockMinimo: 2  },
      { nombre: 'Batería genérica 4000mAh', categoria: 'Baterías',            unidad: 'unidad', precioCompra: 25000, precioVenta: 45000, stockMinimo: 3  },
      { nombre: 'Cable USB-C',              categoria: 'Cables y conectores', unidad: 'unidad', precioCompra: 8000,  precioVenta: 18000, stockMinimo: 5  },
      { nombre: 'Pin de carga micro USB',   categoria: 'Cables y conectores', unidad: 'unidad', precioCompra: 5000,  precioVenta: 12000, stockMinimo: 5  },
      { nombre: 'Pasta térmica',            categoria: 'Materiales',          unidad: 'unidad', precioCompra: 8000,  precioVenta: 15000, stockMinimo: 3  },
      { nombre: 'Cinta adhesiva doble faz', categoria: 'Materiales',          unidad: 'unidad', precioCompra: 5000,  precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Destornilladores precisión set', categoria: 'Herramientas', unidad: 'unidad', precioCompra: 35000, precioVenta: 0,     stockMinimo: 1  },
    ],
  },

  gimnasio: {
    labelInventario: 'Inventario de suplementos y accesorios',
    unidadesComunes: ['unidad', 'kg', 'caja', 'paquete'],
    categorias: ['Suplementos', 'Accesorios', 'Equipos', 'Bebidas', 'Papelería'],
    items: [
      { nombre: 'Proteína whey 1kg',         categoria: 'Suplementos', unidad: 'unidad', precioCompra: 85000, precioVenta: 140000,stockMinimo: 3  },
      { nombre: 'Creatina 300gr',            categoria: 'Suplementos', unidad: 'unidad', precioCompra: 45000, precioVenta: 75000, stockMinimo: 3  },
      { nombre: 'BCAA 300gr',               categoria: 'Suplementos', unidad: 'unidad', precioCompra: 55000, precioVenta: 90000, stockMinimo: 3  },
      { nombre: 'Guantes de entrenamiento', categoria: 'Accesorios',  unidad: 'par',    precioCompra: 25000, precioVenta: 50000, stockMinimo: 5  },
      { nombre: 'Correa para pesas',        categoria: 'Accesorios',  unidad: 'par',    precioCompra: 18000, precioVenta: 38000, stockMinimo: 5  },
      { nombre: 'Botella deportiva 750ml',  categoria: 'Accesorios',  unidad: 'unidad', precioCompra: 18000, precioVenta: 35000, stockMinimo: 5  },
      { nombre: 'Agua 600ml',              categoria: 'Bebidas',      unidad: 'unidad', precioCompra: 1500,  precioVenta: 3000,  stockMinimo: 24 },
      { nombre: 'Bebida energizante 473ml', categoria: 'Bebidas',     unidad: 'unidad', precioCompra: 5000,  precioVenta: 8000,  stockMinimo: 12 },
    ],
  },

  salud: {
    labelInventario: 'Inventario de insumos médicos',
    unidadesComunes: ['unidad', 'caja', 'frasco', 'par'],
    categorias: ['Material de curación', 'Medicamentos básicos', 'Equipos', 'Laboratorio'],
    items: [
      { nombre: 'Guantes de látex x100',     categoria: 'Material de curación', unidad: 'caja',   precioCompra: 28000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Gasas estériles x50',       categoria: 'Material de curación', unidad: 'caja',   precioCompra: 12000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Jeringa 5ml x10',           categoria: 'Material de curación', unidad: 'caja',   precioCompra: 8000,  precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Jeringa 10ml x10',          categoria: 'Material de curación', unidad: 'caja',   precioCompra: 10000, precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Alcohol antiséptico 1L',    categoria: 'Material de curación', unidad: 'frasco', precioCompra: 12000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Tapabocas x50',             categoria: 'Material de curación', unidad: 'caja',   precioCompra: 18000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Acetaminofén ampollas x10', categoria: 'Medicamentos básicos', unidad: 'caja',   precioCompra: 25000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Suero fisiológico 500ml',   categoria: 'Laboratorio',          unidad: 'unidad', precioCompra: 8000,  precioVenta: 0,     stockMinimo: 5  },
    ],
  },

  educacion: {
    labelInventario: 'Inventario de materiales académicos',
    unidadesComunes: ['unidad', 'paquete', 'caja', 'resma'],
    categorias: ['Papelería', 'Material didáctico', 'Tecnología', 'Libros'],
    items: [
      { nombre: 'Resma papel carta',         categoria: 'Papelería',          unidad: 'resma',  precioCompra: 18000, precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Marcadores borrables x12',  categoria: 'Material didáctico', unidad: 'caja',   precioCompra: 25000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Cuadernos universitarios',  categoria: 'Papelería',          unidad: 'unidad', precioCompra: 4500,  precioVenta: 8000,  stockMinimo: 10 },
      { nombre: 'Fotocopias (resma)',         categoria: 'Papelería',          unidad: 'resma',  precioCompra: 12000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Lapiceros x12',             categoria: 'Papelería',          unidad: 'caja',   precioCompra: 12000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Cartulina x10',             categoria: 'Material didáctico', unidad: 'paquete',precioCompra: 8000,  precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Certificados en blanco x50',categoria: 'Papelería',          unidad: 'paquete',precioCompra: 25000, precioVenta: 0,     stockMinimo: 2  },
    ],
  },

  contador: {
    labelInventario: 'Inventario de insumos de oficina',
    unidadesComunes: ['unidad', 'resma', 'caja', 'paquete'],
    categorias: ['Papelería', 'Tecnología', 'Oficina'],
    items: [
      { nombre: 'Resma papel carta',         categoria: 'Papelería',  unidad: 'resma',  precioCompra: 18000, precioVenta: 0,     stockMinimo: 3  },
      { nombre: 'Carpetas AZ',               categoria: 'Papelería',  unidad: 'unidad', precioCompra: 8000,  precioVenta: 0,     stockMinimo: 5  },
      { nombre: 'Lapiceros x12',             categoria: 'Papelería',  unidad: 'caja',   precioCompra: 12000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Tinta impresora negra',     categoria: 'Tecnología', unidad: 'unidad', precioCompra: 35000, precioVenta: 0,     stockMinimo: 2  },
      { nombre: 'Tinta impresora color',     categoria: 'Tecnología', unidad: 'unidad', precioCompra: 45000, precioVenta: 0,     stockMinimo: 1  },
      { nombre: 'Grapadora + grapas',        categoria: 'Oficina',    unidad: 'unidad', precioCompra: 18000, precioVenta: 0,     stockMinimo: 1  },
    ],
  },

  otro: {
    labelInventario: 'Inventario general',
    unidadesComunes: ['unidad', 'kg', 'litro', 'caja', 'paquete', 'metro'],
    categorias: ['Insumos', 'Productos', 'Herramientas', 'Materiales', 'Otros'],
    items: [
      { nombre: 'Insumo 1', categoria: 'Insumos',   unidad: 'unidad', precioCompra: 0, precioVenta: 0, stockMinimo: 5 },
      { nombre: 'Insumo 2', categoria: 'Materiales',unidad: 'unidad', precioCompra: 0, precioVenta: 0, stockMinimo: 5 },
    ],
  },
};

export function getStockIndustria(industria) {
  return STOCK_INDUSTRIAS[industria] || STOCK_INDUSTRIAS.otro;
}
