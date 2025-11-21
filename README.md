# Parcial Nestjs
## Logging de Actividad

La API incluye un middleware de logging que registra todas las peticiones a las rutas `/countries` y `/travel-plans`. Cada petición registra:

- **Método HTTP**: GET, POST, DELETE, etc.
- **Ruta solicitada**: La URL completa de la petición
- **Código de estado**: Código HTTP de la respuesta (200, 401, 404, etc.)
- **Tiempo de procesamiento**: Tiempo total en milisegundos

Los logs se imprimen en la consola con el formato:

```
[2025-11-21T14:45:23.000Z] GET /countries - 200 - 15ms
```

## Descripción General

Esta aplicación permite:

- **Gestionar países**: Consultar información de países desde la API RestCountries y almacenarla en una base de datos local (caché)
- **Gestionar planes de viaje**: Crear y consultar planes de viaje asociados a países específicos

### Módulos Implementados

1. **CountriesModule**: Módulo encargado de gestionar países
   - Consulta países desde la API ApiCountries (https://www.apicountries.com/countries)
   - Almacena países en base de datos local (caché)
   - Implementa lógica de caché: busca primero en BD, si no existe consulta la API externa

2. **TravelPlansModule**: Módulo encargado de gestionar planes de viaje
   - Crea planes de viaje asociados a países
   - Valida que el país exista antes de crear el plan
   - Utiliza el módulo de países para asegurar que el país esté disponible

## Extensiones Implementadas en este Parcial

En esta entrega del parcial, se extendió la API con tres funcionalidades principales para mejorar la seguridad, el control de acceso y el monitoreo de la aplicación.

Se agregó un **endpoint protegido** `DELETE /countries/:code` que permite eliminar países del caché local, implementando validaciones adicionales para prevenir eliminación de países que tienen planes de viaje asociados.

Se implementó un **sistema de autenticación** mediante un guard personalizado que protege endpoints sensibles, requiriendo un API Key válido (`X-API-Key: travel-planner-secret-key-2024`) para operaciones de eliminación.

Finalmente, se incorporó un **middleware de logging** que registra automáticamente todas las peticiones HTTP a las rutas `/countries` y `/travel-plans`, capturando método HTTP, ruta solicitada, código de estado de respuesta y tiempo de procesamiento para facilitar el monitoreo y debugging de la aplicación.

## Funcionamiento y Validación de las Extensiones

### Endpoint Protegido DELETE /countries/:code

**Funcionamiento:**

- Elimina un país específico del caché local de la base de datos
- Requiere autenticación mediante API Key
- Valida que el país no tenga planes de viaje asociados antes de permitir la eliminación
- Retorna confirmación de eliminación exitosa

**Validación:**

- **Sin autenticación:** `DELETE /countries/COL` → `401 Unauthorized: "API key is required"`
- **API Key inválida:** `DELETE /countries/COL -H "X-API-Key: wrong"` → `401 Unauthorized: "Invalid API key"`
- **País no existe:** `DELETE /countries/XYZ` → `404 Not Found: "Country with code XYZ not found"`
- **País con planes asociados:** `DELETE /countries/COL` → `400 Bad Request: "Cannot delete country COL because it has associated travel plans"`
- **Eliminación exitosa:** `DELETE /countries/COL -H "X-API-Key: travel-planner-secret-key-2024"` → `200 OK: "Country with code COL has been deleted successfully"`

### Guard de Autenticación

**Funcionamiento:**

- Implementado en `src/common/guards/auth.guard.ts`
- Verifica la presencia del header `X-API-Key`
- Compara el valor del header con la clave secreta hardcodeada
- Solo se aplica al endpoint `DELETE /countries/:code`
- Bloquea la ejecución del método si la autenticación falla

**Validación:**

```bash
# Prueba sin header
curl -X DELETE http://localhost:3000/countries/COL
# Resultado: 401 Unauthorized

# Prueba con header correcto
curl -X DELETE http://localhost:3000/countries/COL -H "X-API-Key: travel-planner-secret-key-2024"
# Resultado: Pasa al siguiente paso de validación
```

### Middleware de Logging

**Funcionamiento:**

- Implementado en `src/common/middleware/logging.middleware.ts`
- Aplicado únicamente a los módulos `CountriesModule` y `TravelPlansModule`
- Registra cada petición HTTP que llega a estas rutas
- Captura timestamp, método HTTP, ruta, código de estado y tiempo de procesamiento
- Los logs se imprimen directamente en la consola del servidor

**Validación:**

```bash
# Iniciar servidor
npm run start

# En otra terminal, hacer peticiones
curl http://localhost:3000/countries
curl -X POST http://localhost:3000/travel-plans -H "Content-Type: application/json" -d '{"countryCode":"COL","title":"Test","startDate":"2024-01-01","endDate":"2024-01-05"}'

# Logs en consola del servidor:
# [2025-11-21T15:05:20.000Z] GET /countries - 200 - 25ms
# [2025-11-21T15:05:22.000Z] POST /travel-plans - 201 - 45ms
```

## Autenticación

Algunos endpoints requieren autenticación mediante API Key. Debes incluir el siguiente header en las peticiones:

- **Header**: `X-API-Key`
- **Valor**: `travel-planner-secret-key-2024`

**Endpoints que requieren autenticación:**

- `DELETE /countries/:code` - Eliminar país

**Ejemplo de header en diferentes herramientas:**

**cURL:**

```bash
-H "X-API-Key: travel-planner-secret-key-2024"
```

**Postman:**

- Key: `X-API-Key`
- Value: `travel-planner-secret-key-2024`

## Cómo Ejecutar el Proyecto

### Instalación

1. Instalar dependencias:

```bash
npm install
```

### Ejecutar la API

```bash
npm run start:dev
```

La API estará disponible en: `http://localhost:3000`

## Documentación de Endpoints

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
- **Descripción**: Elimina un país de la base de datos local (caché). Requiere autenticación.
- **Parámetros**:
  - `code`: Código alpha-3 del país (ej: "COL", "FRA", "USA")
- **Headers requeridos**:
  - `X-API-Key`: `travel-planner-secret-key-2024`
- **Validaciones adicionales**:
  - El país debe existir en la base de datos
  - No debe tener planes de viaje asociados
- **Respuesta**: Mensaje de confirmación
- **Ejemplo con curl**:

```bash
curl -X DELETE http://localhost:3000/countries/COL \
  -H "X-API-Key: travel-planner-secret-key-2024"
```

- **Ejemplo en Postman**:
  - Método: DELETE
  - URL: `http://localhost:3000/countries/COL`
  - Headers:
    - Key: `X-API-Key`
    - Value: `travel-planner-secret-key-2024`

**Respuesta ejemplo**:

```json
{
  "message": "Country with code COL has been deleted successfully"
}
```

**Errores posibles**:

```json
// País no encontrado
{
  "statusCode": 404,
  "message": "Country with code XYZ not found"
}

// País con planes asociados
{
  "statusCode": 400,
  "message": "Cannot delete country COL because it has associated travel plans"
}

// Sin autenticación
{
  "statusCode": 401,
  "message": "API key is required"
}

// API key inválida
{
  "statusCode": 401,
  "message": "Invalid API key"
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
