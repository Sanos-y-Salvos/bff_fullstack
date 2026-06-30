/**
 * Sanos y Salvos — Seed script
 * Crea 5 ciudadanos, 5 instituciones y 10 reportes de mascotas.
 *
 * Uso: node seed.mjs
 * Requiere Node 18+ y los servicios corriendo.
 * El gateway debe estar disponible en BASE (por defecto :8080).
 */

// Llama directo al BFF (puerto 3000) para evitar las restricciones de CORS/JWT del gateway.
const BASE = 'http://localhost:3000';

const ok  = (msg) => console.log(`  ✓ ${msg}`);
const skip = (msg) => console.log(`  · ${msg}`);
const fail = (msg) => console.error(`  ✗ ${msg}`);

async function postJson(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, body: json });
  return json?.data ?? json;
}

async function postForm(url, fields, token) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, String(v));
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { method: 'POST', headers, body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, body: json });
  return json?.data ?? json;
}

// ---------------------------------------------------------------------------
// Datos de ciudadanos
// RUNs válidos (verificados con módulo 11)
// ---------------------------------------------------------------------------
const CIUDADANOS = [
  {
    email: 'felipe.ruiz@example.cl', password: 'Test1234!',
    telefono: '912345001', region: '08', comuna: 'Concepción',
    primer_nombre: 'Felipe', segundo_nombre: 'Andrés',
    apellido_paterno: 'Ruiz', apellido_materno: 'Muñoz',
    run: '12.345.678-5', direccion: "Av. O'Higgins 123",
  },
  {
    email: 'maria.gonzalez@example.cl', password: 'Test1234!',
    telefono: '912345002', region: '13', comuna: 'Santiago',
    primer_nombre: 'María', segundo_nombre: 'José',
    apellido_paterno: 'González', apellido_materno: 'Vega',
    run: '9.876.543-3', direccion: 'Calle Nueva 456',
  },
  {
    email: 'carlos.soto@example.cl', password: 'Test1234!',
    telefono: '912345003', region: '05', comuna: 'Valparaíso',
    primer_nombre: 'Carlos', segundo_nombre: 'Eduardo',
    apellido_paterno: 'Soto', apellido_materno: 'Pérez',
    run: '8.123.456-6', direccion: 'Los Carrera 789',
  },
  {
    email: 'valentina.mora@example.cl', password: 'Test1234!',
    telefono: '912345004', region: '09', comuna: 'Temuco',
    primer_nombre: 'Valentina', segundo_nombre: 'Isabel',
    apellido_paterno: 'Mora', apellido_materno: 'Campos',
    run: '15.678.901-1', direccion: 'Arturo Prat 321',
  },
  {
    email: 'diego.lopez@example.cl', password: 'Test1234!',
    telefono: '912345005', region: '01', comuna: 'Iquique',
    primer_nombre: 'Diego', segundo_nombre: 'Sebastián',
    apellido_paterno: 'López', apellido_materno: 'Torres',
    run: '7.654.321-6', direccion: 'Baquedano 654',
  },
];

// ---------------------------------------------------------------------------
// Datos de instituciones
// RUTs válidos (verificados con módulo 11)
// ---------------------------------------------------------------------------
const INSTITUCIONES = [
  {
    email: 'vet.sanjorge@example.cl', password: 'Test1234!',
    telefono: '912346001', region: '08', comuna: 'Concepción',
    nombre_institucion: 'Veterinaria San Jorge',
    razon_social: 'San Jorge Limitada',
    rut: '76.354.771-K', tipo_institucion: 'veterinaria',
    direccion: 'Av. Los Carrera 100',
  },
  {
    email: 'muni.concepcion@example.cl', password: 'Test1234!',
    telefono: '912346002', region: '08', comuna: 'Concepción',
    nombre_institucion: 'Municipalidad de Concepción',
    razon_social: 'Ilustre Municipalidad de Concepcion',
    rut: '77.654.321-7', tipo_institucion: 'municipalidad',
    direccion: 'Plaza de Armas s/n',
  },
  {
    email: 'vet.losandes@example.cl', password: 'Test1234!',
    telefono: '912346003', region: '13', comuna: 'Las Condes',
    nombre_institucion: 'Clínica Veterinaria Los Andes',
    razon_social: 'Los Andes Vet SpA',
    rut: '65.432.198-1', tipo_institucion: 'veterinaria',
    direccion: 'Av. Apoquindo 2000',
  },
  {
    email: 'muni.valparaiso@example.cl', password: 'Test1234!',
    telefono: '912346004', region: '05', comuna: 'Valparaíso',
    nombre_institucion: 'Municipalidad de Valparaíso',
    razon_social: 'Ilustre Municipalidad de Valparaiso',
    rut: '78.901.234-2', tipo_institucion: 'municipalidad',
    direccion: 'Condell 1490',
  },
  {
    email: 'vet.sur@example.cl', password: 'Test1234!',
    telefono: '912346005', region: '09', comuna: 'Temuco',
    nombre_institucion: 'Veterinaria Sur',
    razon_social: 'Vet Sur SpA',
    rut: '79.123.456-5', tipo_institucion: 'veterinaria',
    direccion: 'Manuel Montt 500',
  },
];

// ---------------------------------------------------------------------------
// Reportes de mascotas
// Coordenadas de varias ciudades chilenas
// ---------------------------------------------------------------------------
const REPORTES = [
  {
    nombreMascota: 'Firulais', especie: 'PERRO', color: 'Café', tamanio: 'MEDIANO',
    tipo: 'PERDIDA', ubicacionLatitud: '-36.8261', ubicacionLongitud: '-73.0528',
    direccionReferencia: 'Parque Ecuador, Concepción',
    descripcion: 'Se perdió cerca del parque, muy amigable con personas',
  },
  {
    nombreMascota: 'Misi', especie: 'GATO', color: 'Gris', tamanio: 'PEQUEÑO',
    tipo: 'PERDIDA', ubicacionLatitud: '-33.4489', ubicacionLongitud: '-70.6693',
    direccionReferencia: 'Providencia, Santiago',
    descripcion: 'Gata gris con ojos verdes, lleva collar azul con cascabel',
  },
  {
    nombreMascota: 'Rocky', especie: 'PERRO', color: 'Negro', tamanio: 'GRANDE',
    tipo: 'ENCONTRADA', ubicacionLatitud: '-33.0472', ubicacionLongitud: '-71.6127',
    direccionReferencia: 'Cerro Alegre, Valparaíso',
    descripcion: 'Perro negro encontrado en el cerro, bien cuidado y dócil',
  },
  {
    nombreMascota: 'Luna', especie: 'GATO', color: 'Blanca', tamanio: 'PEQUEÑO',
    tipo: 'PERDIDA', ubicacionLatitud: '-38.7359', ubicacionLongitud: '-72.5904',
    direccionReferencia: 'Barrio Pueblo Nuevo, Temuco',
    descripcion: 'Gata blanca con mancha negra en la cabeza, muy tímida',
  },
  {
    nombreMascota: 'Toby', especie: 'PERRO', color: 'Dorado', tamanio: 'GRANDE',
    tipo: 'PERDIDA', ubicacionLatitud: '-20.2123', ubicacionLongitud: '-70.1500',
    direccionReferencia: 'Centro, Iquique',
    descripcion: 'Labrador dorado, usa collar rojo con placa de identificación',
  },
  {
    nombreMascota: 'Periquito', especie: 'AVE', color: 'Verde y amarillo', tamanio: 'PEQUEÑO',
    tipo: 'PERDIDA', ubicacionLatitud: '-33.4600', ubicacionLongitud: '-70.6800',
    descripcion: 'Periquito verde y amarillo, sabe decir algunas palabras',
  },
  {
    nombreMascota: 'Conchita', especie: 'CONEJO', color: 'Blanca', tamanio: 'PEQUEÑO',
    tipo: 'ENCONTRADA', ubicacionLatitud: '-36.8200', ubicacionLongitud: '-73.0600',
    direccionReferencia: 'Los Presidentes, Concepción',
    descripcion: 'Conejo blanco encontrado en el jardín, muy manso',
  },
  {
    nombreMascota: 'Max', especie: 'PERRO', color: 'Café y blanco', tamanio: 'MEDIANO',
    tipo: 'ENCONTRADA', ubicacionLatitud: '-33.0500', ubicacionLongitud: '-71.6200',
    descripcion: 'Beagle encontrado sin collar, muy sociable y bien alimentado',
  },
  {
    nombreMascota: 'Simba', especie: 'GATO', color: 'Naranja', tamanio: 'MEDIANO',
    tipo: 'PERDIDA', ubicacionLatitud: '-33.4700', ubicacionLongitud: '-70.6500',
    descripcion: 'Gato atigrado naranja, muy cariñoso y acostumbrado a estar adentro',
  },
  {
    nombreMascota: 'Cleo', especie: 'PERRO', color: 'Negro y café', tamanio: 'PEQUEÑO',
    tipo: 'PERDIDA', ubicacionLatitud: '-38.7400', ubicacionLongitud: '-72.5800',
    direccionReferencia: 'Villa Centinela, Temuco',
    descripcion: 'Yorkshire terrier, lleva moño rosa y chip de identificación',
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱  Sanos y Salvos — Seed\n');

  // 1. Ciudadanos
  console.log('👤  Ciudadanos');
  for (const c of CIUDADANOS) {
    try {
      await postForm('/api/users/register/ciudadano', c);
      ok(`${c.primer_nombre} ${c.apellido_paterno} <${c.email}>`);
    } catch (e) {
      const msg = JSON.stringify(e.body ?? {});
      if (e.status === 409 || msg.includes('registrado') || msg.includes('already') || msg.includes('exist')) {
        skip(`ya existe → ${c.email}`);
      } else {
        fail(`${c.email}: ${e.message} — ${msg}`);
      }
    }
  }

  // 2. Instituciones
  console.log('\n🏢  Instituciones');
  for (const i of INSTITUCIONES) {
    try {
      await postForm('/api/users/register/institucion', i);
      ok(`${i.nombre_institucion} <${i.email}>`);
    } catch (e) {
      const msg = JSON.stringify(e.body ?? {});
      if (e.status === 409 || msg.includes('registrado') || msg.includes('already') || msg.includes('exist')) {
        skip(`ya existe → ${i.email}`);
      } else {
        fail(`${i.email}: ${e.message} — ${msg}`);
      }
    }
  }

  // 3. Login con el primer ciudadano para crear reportes
  console.log('\n🔑  Login');
  let token;
  try {
    const auth = await postJson('/api/auth/login', {
      email: CIUDADANOS[0].email,
      password: CIUDADANOS[0].password,
    });
    token = auth.accessToken;
    ok(`Sesión iniciada como ${CIUDADANOS[0].email}`);
  } catch (e) {
    fail(`Login fallido: ${e.message} — ${JSON.stringify(e.body ?? {})}`);
    console.error('\n  ⚠  Asegúrate de que ms-auth haya sincronizado las credenciales (puede tardar unos segundos).');
    process.exit(1);
  }

  // 4. Reportes
  console.log('\n🐾  Reportes');
  for (const r of REPORTES) {
    try {
      await postForm('/api/mascotas/reportes', r, token);
      ok(`${r.tipo.padEnd(11)} ${r.especie.padEnd(8)} "${r.nombreMascota}"`);
    } catch (e) {
      fail(`${r.nombreMascota}: ${e.message} — ${JSON.stringify(e.body ?? {})}`);
    }
  }

  console.log('\n✅  Seed completado.\n');
  console.log('   Nota: si el gráfico de "por mes" muestra un solo punto, es porque');
  console.log('   todos los registros tienen fecha de hoy. Puedes ejecutar seed-history.sql');
  console.log('   directamente en la base de datos para simular datos históricos.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
