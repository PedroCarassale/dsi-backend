# Sistema de Autenticación

## Descripción General

Este backend implementa un sistema de autenticación basado en JWT (JSON Web Tokens) con las siguientes características:

- **Login con email y contraseña**
- **Tokens JWT Bearer** para autenticación de requests
- **Contraseñas hasheadas** con bcrypt (10 rounds)
- **Protección global** de todos los endpoints (excepto los marcados como públicos)
- **Expiración de tokens**: 24 horas

## Endpoints Públicos (No requieren autenticación)

### 1. Registro de Usuario
```http
POST /users
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "contraseña-segura"
}
```

**Respuesta exitosa:**
```json
{
  "message": "User created successfully",
  "id": "uuid-del-usuario"
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "contraseña-segura"
}
```

**Respuesta exitosa:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-del-usuario",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

**Respuesta de error:**
```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas"
}
```

## Endpoints Protegidos

Todos los demás endpoints requieren autenticación. Para acceder a ellos, debes incluir el token JWT en el header `Authorization`:

```http
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Ejemplos de uso con curl

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "contraseña-segura"
  }'
```

**Acceder a un endpoint protegido:**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente variable:

```env
JWT_SECRET=tu-clave-secreta-muy-segura-cambiar-en-produccion
```

**⚠️ IMPORTANTE:** En producción, asegúrate de:
1. Usar una clave secreta fuerte y aleatoria
2. Nunca commitear el archivo `.env` al repositorio
3. Usar variables de entorno del servidor o un gestor de secretos

### Tiempo de Expiración del Token

Por defecto, los tokens expiran en 24 horas. Puedes modificar este valor en `src/auth/auth.module.ts`:

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  signOptions: { expiresIn: '24h' }, // Modificar aquí
}),
```

## Arquitectura

### Archivos Creados

```
src/
├── auth/
│   ├── dto/
│   │   └── login.dto.ts          # DTO para validación de login
│   ├── decorators/
│   │   └── public.decorator.ts   # Decorador para marcar endpoints públicos
│   ├── auth.controller.ts        # Controlador con endpoint de login
│   ├── auth.service.ts           # Lógica de autenticación
│   ├── auth.module.ts            # Módulo de autenticación
│   ├── jwt.strategy.ts           # Estrategia de validación JWT
│   └── jwt-auth.guard.ts         # Guard global de protección
```

### Flujo de Autenticación

1. **Registro**: El usuario se registra con POST /users, la contraseña se hashea automáticamente
2. **Login**: El usuario hace login con POST /auth/login
3. **Token**: El servidor valida las credenciales y devuelve un JWT
4. **Requests**: El cliente incluye el token en el header Authorization de cada request
5. **Validación**: El guard global valida el token antes de permitir el acceso

### Seguridad

- Las contraseñas nunca se almacenan en texto plano
- Se usa bcrypt con 10 rounds de salt
- Los tokens JWT están firmados y tienen expiración
- Todos los endpoints están protegidos por defecto
- Solo los endpoints con el decorador `@Public()` son accesibles sin autenticación

## Marcar Endpoints como Públicos

Si necesitas que algún endpoint adicional sea público, usa el decorador `@Public()`:

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('example')
export class ExampleController {
  
  @Public()  // Este endpoint NO requiere autenticación
  @Get('public-data')
  getPublicData() {
    return { data: 'Información pública' };
  }
  
  @Get('private-data')  // Este endpoint SÍ requiere autenticación
  getPrivateData() {
    return { data: 'Información privada' };
  }
}
```

## Testing

Para probar con Postman o herramientas similares:

1. Haz POST a `/users` para crear un usuario
2. Haz POST a `/auth/login` con las credenciales
3. Copia el `access_token` de la respuesta
4. En las siguientes requests, añade el header:
   - Key: `Authorization`
   - Value: `Bearer <tu-token-aqui>`

## Errores Comunes

### 401 Unauthorized
- **Causa**: Token inválido, expirado o no proporcionado
- **Solución**: Haz login nuevamente y usa el nuevo token

### 403 Forbidden
- **Causa**: Token válido pero sin permisos para el recurso
- **Solución**: Verifica que el usuario tenga los permisos necesarios

### 400 Bad Request (en login)
- **Causa**: Email o password faltantes o con formato inválido
- **Solución**: Verifica que el email sea válido y la contraseña no esté vacía


