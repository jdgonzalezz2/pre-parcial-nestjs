# API REST para Planificación de Viajes - NestJS

API REST desarrollada con NestJS para gestionar países y planes de viaje, utilizando la API externa RestCountries como fuente de datos.

## 📋 Descripción General

Esta aplicación permite:
- **Gestionar países**: Consultar información de países desde la API RestCountries y almacenarla en una base de datos local (caché)
- **Gestionar planes de viaje**: Crear y consultar planes de viaje asociados a países específicos

### Módulos Implementados

1. **CountriesModule**: Módulo encargado de gestionar países
   - Consulta países desde la API RestCountries
   - Almacena países en base de datos local (caché)
   - Implementa lógica de caché: busca primero en BD, si no existe consulta la API externa

2. **TravelPlansModule**: Módulo encargado de gestionar planes de viaje
   - Crea planes de viaje asociados a países
   - Valida que el país exista antes de crear el plan
   - Utiliza el módulo de países para asegurar que el país esté disponible

## 🚀 Cómo Ejecutar el Proyecto

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn

### Instalación

1. Instalar dependencias:
```bash
npm install
```

### Configuración de la Base de Datos

El proyecto utiliza **SQLite** como base de datos, que se crea automáticamente al ejecutar la aplicación. No se requiere configuración adicional.

El archivo de base de datos (`travel-planner.db`) se creará en la raíz del proyecto.

### Ejecutar la API

**Modo desarrollo (con hot-reload):**
```bash
npm run start:dev
```

**Modo producción:**
```bash
npm run build
npm run start:prod
```

La API estará disponible en: `http://localhost:3000`

## 📚 Documentación de Endpoints

### Módulo de Países (`/countries`)

#### 1. Listar todos los países
- **GET** `/countries`
- **Descripción**: Obtiene todos los países almacenados en la base de datos local
- **Respuesta**: Array de países con información completa
- **Ejemplo**:
```bash
GET http://localhost:3000/countries
```

#### 2. Consultar país por código
- **GET** `/countries/:code`
- **Descripción**: Consulta un país por su código alpha-3. Si no existe en caché, lo obtiene de la API externa y lo guarda
- **Parámetros**: 
  - `code`: Código alpha-3 del país (ej: "COL", "FRA", "USA")
- **Respuesta**: Objeto país con campo `source` indicando si viene de "cache" o "external"
- **Ejemplo**:
```bash
GET http://localhost:3000/countries/COL
```

#### 3. Eliminar país por código
- **DELETE** `/countries/:code`
- **Descripción**: Elimina un país de la base de datos local (caché)
- **Parámetros**: 
  - `code`: Código alpha-3 del país (ej: "COL", "FRA", "USA")
- **Respuesta**: Mensaje de confirmación
- **Ejemplo**:
```bash
DELETE http://localhost:3000/countries/COL
```

**Respuesta ejemplo**:
```json
{
  "message": "Country with code COL has been deleted successfully"
}
```

**Respuesta ejemplo**:
```json
{
  "code": "COL",
  "name": "Colombia",
  "region": "Americas",
  "subregion": "South America",
  "capital": "Bogotá",
  "population": 50882884,
  "flagUrl": "https://flagcdn.com/w320/co.png",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "source": "external"
}
```

### Módulo de Planes de Viaje (`/travel-plans`)

#### 1. Crear plan de viaje
- **POST** `/travel-plans`
- **Descripción**: Crea un nuevo plan de viaje. Valida que el país exista (si no existe, lo crea desde la API externa)
- **Body**:
```json
{
  "countryCode": "COL",
  "title": "Viaje a Colombia",
  "startDate": "2024-06-01",
  "endDate": "2024-06-15",
  "notes": "Visitar Bogotá, Medellín y Cartagena"
}
```
- **Validaciones**:
  - `countryCode`: Debe ser exactamente 3 caracteres
  - `title`: Campo obligatorio
  - `startDate`: Debe ser una fecha válida en formato ISO (YYYY-MM-DD)
  - `endDate`: Debe ser una fecha válida y posterior a `startDate`
  - `notes`: Campo opcional
- **Ejemplo**:
```bash
POST http://localhost:3000/travel-plans
Content-Type: application/json

{
  "countryCode": "COL",
  "title": "Viaje a Colombia",
  "startDate": "2024-06-01",
  "endDate": "2024-06-15",
  "notes": "Visitar Bogotá, Medellín y Cartagena"
}
```

#### 2. Listar todos los planes de viaje
- **GET** `/travel-plans`
- **Descripción**: Obtiene todos los planes de viaje registrados
- **Respuesta**: Array de planes de viaje
- **Ejemplo**:
```bash
GET http://localhost:3000/travel-plans
```

#### 3. Consultar plan de viaje por ID
- **GET** `/travel-plans/:id`
- **Descripción**: Obtiene un plan de viaje específico por su ID
- **Parámetros**: 
  - `id`: ID numérico del plan de viaje
- **Ejemplo**:
```bash
GET http://localhost:3000/travel-plans/1
```

#### 4. Eliminar plan de viaje por ID
- **DELETE** `/travel-plans/:id`
- **Descripción**: Elimina un plan de viaje de la base de datos
- **Parámetros**: 
  - `id`: ID numérico del plan de viaje
- **Respuesta**: Mensaje de confirmación
- **Ejemplo**:
```bash
DELETE http://localhost:3000/travel-plans/1
```

**Respuesta ejemplo**:
```json
{
  "message": "Travel plan with ID 1 has been deleted successfully"
}
```

**Respuesta ejemplo**:
```json
{
  "id": 1,
  "countryCode": "COL",
  "title": "Viaje a Colombia",
  "startDate": "2024-06-01",
  "endDate": "2024-06-15",
  "notes": "Visitar Bogotá, Medellín y Cartagena",
  "createdAt": "2024-01-15T10:35:00.000Z"
}
```

## 🔌 Provider Externo

### RestCountries Provider

El sistema utiliza un **provider** especializado para consumir la API externa RestCountries. Este provider:

- **Abstrae** el consumo de la API externa mediante una interfaz (`ICountryProvider`)
- **Encapsula** los detalles de implementación (URLs, formato de respuesta, etc.)
- **Limita** los campos solicitados a la API externa para optimizar la respuesta
- Se **inyecta** en el servicio de países mediante el sistema de inyección de dependencias de NestJS

**Implementación**: `RestCountriesProvider` en `src/countries/providers/external-country.provider.ts`

**API utilizada**: `https://restcountries.com/v3.1/alpha/{code}`

## 📊 Modelo de Datos

### Entidad Country

```typescript
{
  code: string;           // Código alpha-3 (PK) - ej: "COL", "FRA"
  name: string;           // Nombre del país
  region: string;        // Región (ej: "Americas")
  subregion: string;     // Subregión (ej: "South America")
  capital: string;       // Capital del país
  population: number;    // Población
  flagUrl: string;       // URL de la bandera
  createdAt: Date;       // Fecha de creación
  updatedAt: Date;       // Fecha de última actualización
}
```

### Entidad TravelPlan

```typescript
{
  id: number;            // ID único (PK, auto-generado)
  countryCode: string;    // Código alpha-3 del país destino
  title: string;         // Título del viaje
  startDate: Date;       // Fecha de inicio
  endDate: Date;         // Fecha de fin
  notes?: string;        // Notas opcionales
  createdAt: Date;       // Fecha de creación
}
```

## 🧪 Pruebas Básicas Sugeridas

### 1. Consultar un país no cacheado

```bash
# Primera consulta - vendrá de la API externa
GET http://localhost:3000/countries/COL

# Verificar que el campo "source" sea "external"
```

### 2. Consultar un país cacheado

```bash
# Segunda consulta del mismo país - vendrá de la caché
GET http://localhost:3000/countries/COL

# Verificar que el campo "source" sea "cache"
```

### 3. Listar todos los países

```bash
GET http://localhost:3000/countries

# Debe mostrar todos los países almacenados en la BD
```

### 4. Crear un plan de viaje

```bash
POST http://localhost:3000/travel-plans
Content-Type: application/json

{
  "countryCode": "FRA",
  "title": "Tour por Francia",
  "startDate": "2024-07-01",
  "endDate": "2024-07-14",
  "notes": "Visitar París, Lyon y Marsella"
}
```

**Nota**: Si el país "FRA" no existe en caché, se creará automáticamente desde la API externa.

### 5. Listar todos los planes de viaje

```bash
GET http://localhost:3000/travel-plans
```

### 6. Consultar un plan de viaje específico

```bash
GET http://localhost:3000/travel-plans/1
```

### 7. Validación de errores

```bash
# Intentar crear plan con fecha de fin anterior a fecha de inicio
POST http://localhost:3000/travel-plans
Content-Type: application/json

{
  "countryCode": "USA",
  "title": "Viaje inválido",
  "startDate": "2024-08-01",
  "endDate": "2024-07-01"  // Error: fecha fin anterior a inicio
}

# Debe retornar error 400 Bad Request
```

## 🏗️ Estructura del Proyecto

```
src/
├── countries/
│   ├── dto/
│   │   ├── create-country.dto.ts
│   │   └── country-response.dto.ts
│   ├── entities/
│   │   └── country.entity.ts
│   ├── providers/
│   │   └── external-country.provider.ts
│   ├── countries.controller.ts
│   ├── countries.service.ts
│   └── countries.module.ts
├── travel-plans/
│   ├── dto/
│   │   ├── create-travel-plan.dto.ts
│   │   └── travel-plan-response.dto.ts
│   ├── entities/
│   │   └── travel-plan.entity.ts
│   ├── travel-plans.controller.ts
│   ├── travel-plans.service.ts
│   └── travel-plans.module.ts
├── app.module.ts
└── main.ts
```

## 🛠️ Tecnologías Utilizadas

- **NestJS**: Framework para construir aplicaciones Node.js eficientes y escalables
- **TypeORM**: ORM para TypeScript y JavaScript
- **SQLite**: Base de datos relacional ligera
- **class-validator**: Validación de DTOs
- **Axios**: Cliente HTTP para consumir la API RestCountries
- **TypeScript**: Lenguaje de programación

## 📝 Notas Adicionales

- La base de datos se crea automáticamente al iniciar la aplicación
- El sistema implementa un patrón de caché: primero busca en BD local, luego consulta la API externa
- Todos los endpoints incluyen validación de datos mediante DTOs
- El provider externo está completamente desacoplado del servicio de países
- La aplicación está lista para ser probada con Postman, Thunder Client o cualquier cliente HTTP

## 🔍 Ejemplos de Uso con cURL

```bash
# Consultar país
curl -X GET http://localhost:3000/countries/COL

# Crear plan de viaje
curl -X POST http://localhost:3000/travel-plans \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "JPN",
    "title": "Aventura en Japón",
    "startDate": "2024-09-01",
    "endDate": "2024-09-15",
    "notes": "Visitar Tokio, Kioto y Osaka"
  }'

# Listar planes
curl -X GET http://localhost:3000/travel-plans
```

