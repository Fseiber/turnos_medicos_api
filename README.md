# Turnos médicos — Tu propia API REST

Trabajo práctico individual: una API para que el personal de recepción de un consultorio pueda crear, consultar, reprogramar, actualizar el estado y eliminar turnos médicos. Los usuarios se registran e inician sesión para operar con turnos.

Está desarrollada con Node.js, Express, TypeScript, MongoDB Atlas y Mongoose. Las contraseñas se guardan con Bcrypt y la autenticación usa JWT.

## Instalación y configuración

### Requisitos previos

- Node.js 24 y npm.
- Una cuenta de MongoDB Atlas, un proyecto y un clúster disponible.
- Thunder Client en Visual Studio Code para probar las peticiones.
- Git, si se descarga el proyecto clonando el repositorio.

Clonar este repositorio y abrir una terminal en la carpeta `turnos-medicos-api`, donde está `package.json`. Instalar las dependencias:

```sh
npm install
```

### Configurar MongoDB Atlas

1. Crear un proyecto y un clúster, o usar uno existente.
2. Crear un usuario de base de datos con contraseña y permiso de lectura y escritura sobre `turnos_medicos`. Es distinto de la cuenta con la que se ingresa a Atlas.
3. Agregar la IP pública del equipo a la lista de acceso de red del proyecto. Si cambia la IP, actualizar esa entrada.
4. En el clúster, elegir **Connect → Drivers → Node.js** y copiar la cadena de conexión.
5. Reemplazar los marcadores de usuario y contraseña con las credenciales del usuario de base de datos. Si contienen caracteres especiales, codificarlos para una URI.

El código de `src/db.ts` selecciona la base **`turnos_medicos`** mediante `dbName`, incluso si la URI tiene otro nombre de base. Mongoose crea las colecciones al guardar los primeros documentos. No hace falta instalar MongoDB localmente.

Referencia: [conexión de una aplicación a Atlas](https://www.mongodb.com/docs/atlas/driver-connection/).

### Variables de entorno

Copiar el archivo de ejemplo. En PowerShell:

```powershell
Copy-Item .env.example .env
```

En Linux o macOS:

```sh
cp .env.example .env
```

Completar las tres variables en el archivo local `.env`:

| Variable | Valor a configurar |
|---|---|
| `PORT` | `3001` para usar las URLs de este README. Si está vacío, el código usa `3000`. |
| `MONGO_URI` | La cadena de conexión de Atlas con las credenciales del usuario de base de datos. |
| `JWT_SECRET` | Un secreto aleatorio propio para firmar y verificar los tokens. |

Generar el secreto con:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copiar el resultado como valor de `JWT_SECRET`, sin compartirlo. El mismo secreto se usa para login y para verificar las peticiones protegidas. Cambiarlo invalida los tokens anteriores.

No subir `.env`, credenciales de Atlas ni tokens a la entrega. `.env.example` contiene únicamente los nombres de las variables, sin valores privados.

### Ejecutar el proyecto

```sh
npm run dev
```

El script ejecuta `tsx watch src/app.ts` y reinicia al cambiar el código. Reiniciar manualmente después de cambiar las variables de entorno.

La aplicación primero conecta a MongoDB y después inicia el servidor. Con `PORT=3001`, la URL base es `http://localhost:3001`. Se puede comprobar con `GET http://localhost:3001/api/salud`.

Para verificar los tipos:

```sh
npx tsc
```

`tsconfig.json` tiene `noEmit: true`: este comando verifica TypeScript sin generar JavaScript. No hay scripts de `build` ni `start`. El script `npm test` es el marcador inicial de npm y no ejecuta pruebas automatizadas.

Si la conexión a Atlas falla, comprobar la URI, las credenciales, los permisos y la IP autorizada. Sin conexión a MongoDB, el servidor no comienza a escuchar peticiones.

## Endpoints

Las peticiones con body usan JSON y `Content-Type: application/json`. Los errores de los controladores se responden como `{ "mensaje": "..." }`.

| Método | Ruta | JWT | Respuesta |
|---|---|---|---|
| GET | `/api/salud` | No | 200 con un mensaje de funcionamiento. |
| POST | `/api/usuarios/registro` | No | 201 con `{ id, email }`; 400 por datos inválidos o email repetido; 500 ante un error inesperado. |
| POST | `/api/usuarios/login` | No | 200 con `{ token }`; 400 por datos inválidos; 401 por credenciales incorrectas; 500 ante un error inesperado. |
| POST | `/api/turnos` | Sí | 201 con el turno creado; 400 por datos inválidos; 401 por autenticación; 500 ante un error inesperado. |
| GET | `/api/turnos` | Sí | 200 con un arreglo de turnos, incluido `[]` si no hay registros; 401 por autenticación; 500 ante un error inesperado. |
| GET | `/api/turnos/:id` | Sí | 200 con el turno; 400 por ID inválido; 401 por autenticación; 404 si no existe; 500 ante un error inesperado. |
| PUT | `/api/turnos/:id` | Sí | 200 con el turno actualizado; 400 por ID, datos o transición inválidos; 401 por autenticación; 404 si no existe; 500 ante un error inesperado. |
| DELETE | `/api/turnos/:id` | Sí | 200 con `{ "mensaje": "Turno eliminado" }`; 400 por ID inválido; 401 por autenticación; 404 si no existe; 500 ante un error inesperado. |

Las cinco rutas de turnos pasan por el middleware de autenticación antes del controlador. El DELETE borra definitivamente el documento.

## Ejemplo de uso

Los siguientes datos son ficticios. Elegir otro email si ya se usó en una prueba anterior.

1. Enviar **POST** `http://localhost:3001/api/usuarios/registro`, sin token:

```json
{
  "email": "recepcion.entrega@example.com",
  "password": "Recepcion123!"
}
```

2. Enviar **POST** `http://localhost:3001/api/usuarios/login`, sin token, con el mismo body. La respuesta 200 contiene `token`.

3. Copiar ese valor y configurar en las peticiones de turnos el encabezado:

```text
Authorization: Bearer <TOKEN_OBTENIDO_EN_LOGIN>
```

En Thunder Client también se puede usar **Auth → Bearer Token** y pegar solo el valor del token, sin comillas ni el prefijo `Bearer`. El marcador anterior no es un token real.

4. Enviar **POST** `http://localhost:3001/api/turnos`, con el token y este body:

```json
{
  "paciente": "Lucía Ejemplo",
  "especialidad": "Clínica Médica",
  "fecha": "2027-12-15T15:00:00.000Z"
}
```

La respuesta 201 contiene el turno con `_id` y estado `PENDIENTE`. Guardar ese `_id` para usarlo en GET, PUT y DELETE. La fecha del ejemplo es futura al preparar esta documentación; si se prueba después de esa fecha, reemplazarla por otra futura.

## Validaciones y estados

### Usuarios y autenticación

- El body de registro y login debe ser un objeto JSON con `email` y `password`.
- El email debe tener un formato válido según la validación del servicio. Se eliminan espacios de los extremos y se convierte a minúsculas.
- El email es único. El registro devuelve 400 si ya está registrado; también traduce a 400 el error de clave duplicada de MongoDB al guardar.
- En registro, la contraseña debe tener al menos 8 caracteres y no superar 72 bytes UTF-8. Se guarda únicamente `passwordHash`, calculado con Bcrypt y costo 10.
- En login, la contraseña debe ser un texto no vacío de hasta 72 bytes. Se compara con `bcrypt.compare`.
- Email inexistente y contraseña incorrecta devuelven el mismo 401: `Credenciales inválidas`.
- El JWT usa HS256, el ID del usuario como `sub` y vencimiento de una hora. No contiene la contraseña ni su hash. La respuesta de login contiene solo el token.
- Falta de token, formato de autorización incorrecto, firma inválida o token vencido producen 401 en turnos. Si falta `JWT_SECRET`, login responde 500 y el middleware rechaza el acceso con 401.
- Todos los usuarios autenticados pueden operar sobre todos los turnos; no hay roles ni turnos asociados a un usuario particular.

### Turnos

- Los IDs deben tener 24 caracteres hexadecimales: formato inválido produce 400; formato válido sin documento produce 404.
- `paciente` debe ser un texto no vacío; se recortan los espacios de los extremos.
- `especialidad` debe ser exactamente `Clínica Médica`, `Pediatría` o `Dermatología`.
- En POST se reciben `paciente`, `especialidad` y `fecha`. La fecha debe ser un texto convertible a una fecha válida y futura. El estado inicial es siempre `PENDIENTE`.
- En PUT se requieren los cuatro campos: `paciente`, `especialidad`, `fecha` y `estado`.
- Si PUT cambia el instante de la fecha, la nueva fecha debe ser futura. Si conserva el instante original, puede mantener una fecha pasada y marcar el turno como `ATENDIDO`.
- Los estados admitidos son `PENDIENTE`, `ATENDIDO` y `CANCELADO`.
- Solo `PENDIENTE` puede cambiar a `ATENDIDO` o `CANCELADO`. Estos dos estados son finales: no pueden cambiar a otro estado. Se puede conservar el mismo estado al actualizar otros campos.

Ejemplo de PUT a `/api/turnos/:id`, con JWT:

```json
{
  "paciente": "Lucía Ejemplo",
  "especialidad": "Dermatología",
  "fecha": "2027-12-16T15:00:00.000Z",
  "estado": "ATENDIDO"
}
```

## Organización del código

Los módulos `src/components/turnos` y `src/components/usuarios` siguen el flujo **ruta → controlador → servicio → DAO → modelo**. Las rutas registran los endpoints, los controladores manejan HTTP con `try/catch`, los servicios validan las reglas y los DAO acceden a Mongoose. Los modelos definen los documentos de MongoDB.

`src/app.ts` monta los routers y el endpoint de salud. `src/db.ts` abre la conexión a Atlas. `src/middlewares/autenticacion.ts` protege el router de turnos.

## Verificaciones y evidencia de la entrega

- Revisión de código: se comprobaron las rutas, sus capas, las validaciones, el hash de contraseñas, la firma y verificación JWT y las respuestas 500 de los controladores.
- Durante el desarrollo se ejecutó `npx tsc` sin errores. También se verificó Bcrypt y se comprobó aisladamente el middleware con token ausente, inválido, vencido, firma incorrecta, esquema incorrecto y token válido. Esto no reemplaza las pruebas HTTP.
- El autor confirmó en Thunder Client las pruebas del CRUD de turnos, del registro (válido, email repetido y contraseña inválida) y del login (válido, contraseña incorrecta y usuario inexistente). Las pruebas del CRUD fueron anteriores a la incorporación del middleware JWT.
- Queda pendiente tomar las capturas nuevas de cada endpoint y de los errores 400, 401 y 404, repitiendo las operaciones de turnos con JWT. No se han ejecutado esas pruebas nuevas durante la preparación de este README.
- El manejo de 500 se revisó en código; no se provocaron errores inesperados para probarlo en ejecución. Las capturas de error solicitadas son 400, 401 y 404.
- No hay una suite automatizada de integración. `npm test` no sirve como evidencia de pruebas.
- No se encontró el PDF de la consigna en el proyecto. La documentación se preparó con los requisitos citados por el autor: instalación, ejecución, endpoints y evidencia mediante colección exportada o capturas. Queda pendiente contrastar los diez requisitos completos y la rúbrica con el PDF original.

Para esta entrega se eligieron capturas nuevas en Thunder Client. Cada captura debe mostrar método, URL, body cuando corresponda, código HTTP y respuesta. Ocultar tokens reales y credenciales antes de compartir las imágenes. La colección exportada es la alternativa indicada por la consigna, no una evidencia ya generada en este repositorio.
