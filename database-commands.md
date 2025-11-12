# Comandos PostgreSQL con Docker

## Iniciar la base de datos

```bash
docker-compose up -d
```

## Detener la base de datos

```bash
docker-compose down
```

## Ver logs

```bash
docker-compose logs -f postgres
```

## Conectarse a PostgreSQL desde terminal

```bash
docker exec -it dsi-postgres psql -U postgres -d dsi_backend
```

## Reiniciar la base de datos

```bash
docker-compose restart
```

## Ver estado del contenedor

```bash
docker-compose ps
```

## Eliminar base de datos (incluye datos)

```bash
docker-compose down -v
```

## Comandos SQL útiles dentro de psql

### Listar tablas

```sql
\dt
```

### Ver estructura de una tabla

```sql
\d trabajos
```

### Ver todos los registros

```sql
SELECT * FROM trabajos;
```

### Salir de psql

```sql
\q
```

## Credenciales por defecto

- Host: localhost
- Puerto: 5432
- Usuario: postgres
- Contraseña: postgres
- Base de datos: dsi_backend
