const firstNames = [
  'Sofia','Marcus','Elena','James','Valeria','Carlos','Natalia','Omar','Daniela',
  'Kevin','Lucia','Andre','Isabela','Ryan','Camila','Diego','Andrea','Ethan',
  'Maria','Luis','Jessica','Roberto','Kayla','Miguel','Sarah','Antonio','Ashley',
  'Fernando','Brianna','Jorge'
]
const lastNames = [
  'Reyes','Chen','Torres','Kim','Mendoza','Patel','Ramirez','Johnson','Flores',
  'Williams','Garcia','Smith','Martinez','Brown','Lopez','Davis','Hernandez',
  'Miller','Gonzalez','Wilson','Perez','Moore','Sanchez','Taylor','Romero',
  'Anderson','Jimenez','Thomas','Morales','Jackson'
]

function pick(arr, seed) {
  return arr[seed % arr.length]
}

const COUNTRIES = ['Perú', 'Chile', 'Colombia', 'Argentina', 'Ecuador', 'México']

// 4 supervisors per country
const COUNTRY_MAP = {
  'SUP-001': 'Colombia', 'SUP-002': 'Colombia', 'SUP-003': 'Colombia', 'SUP-004': 'Colombia',
  'SUP-005': 'México',   'SUP-006': 'México',   'SUP-007': 'México',   'SUP-008': 'México',
  'SUP-009': 'Brasil',   'SUP-010': 'Brasil',   'SUP-011': 'Brasil',   'SUP-012': 'Brasil',
  'SUP-013': 'Perú',     'SUP-014': 'Perú',     'SUP-015': 'Perú',     'SUP-016': 'Perú',
  'SUP-017': 'Chile',    'SUP-018': 'Chile',    'SUP-019': 'Chile',    'SUP-020': 'Chile',
}

export const supervisors = Array.from({ length: 20 }, (_, i) => {
  const fi = (i * 7) % firstNames.length
  const li = (i * 13) % lastNames.length
  const id = `SUP-${String(i + 1).padStart(3, '0')}`
  return {
    id,
    name: `${firstNames[fi]} ${lastNames[li]}`,
    region: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'][i % 5],
    country: COUNTRY_MAP[id],
  }
})

export { COUNTRIES }

// 5 demo users (1 per role, some overlap)
export const demoUsers = [
  {
    id: 'DEMO-REP-01',
    name: 'Sofia Reyes',
    email: 'sofia.reyes@rappi.com',
    role: 'rep',
    supervisorId: 'SUP-001',
    storeId: 'STR-045',
    region: 'Southwest',
  },
  {
    id: 'DEMO-REP-02',
    name: 'Carlos Torres',
    email: 'carlos.torres@rappi.com',
    role: 'rep',
    supervisorId: 'SUP-002',
    storeId: 'STR-022',
    region: 'Northeast',
  },
  {
    id: 'DEMO-MGR-01',
    name: 'Jimena Velasquez',
    email: 'jimena.velasquez@rappi.com',
    role: 'manager',
    supervisorId: null,
    storeId: null,
    region: 'All',
  },
  {
    id: 'DEMO-DATA-01',
    name: 'Ricardo Urzua',
    email: 'ricardo.urzua@rappi.com',
    role: 'data_person',
    supervisorId: null,
    storeId: null,
    region: 'All',
  },
]

// Generate 400 rep employees spread across 20 supervisors
function generateEmployees() {
  const employees = []
  let empNum = 1
  for (let s = 0; s < 20; s++) {
    const sup = supervisors[s]
    const teamSize = 20
    for (let t = 0; t < teamSize; t++) {
      const fi = (empNum * 3) % firstNames.length
      const li = (empNum * 11) % lastNames.length
      const name = `${firstNames[fi]} ${lastNames[li]}`
      employees.push({
        id: `EMP-${String(empNum).padStart(3, '0')}`,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}.${empNum}@rappi.com`,
        role: 'rep',
        supervisorId: sup.id,
        supervisorName: sup.name,
        storeId: `STR-${String((empNum % 80) + 1).padStart(3, '0')}`,
        region: sup.region,
        country: sup.country,
      })
      empNum++
    }
  }
  return employees
}

export const employees = generateEmployees()
export const allUsers = [...employees, ...demoUsers]
