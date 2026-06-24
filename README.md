# EVA3 Frontend

Evaluación Parcial N°3 — ISY1101 Introducción a Herramientas DevOps — Duoc UC

## Descripción

Aplicación React que consume la API del backend, desplegada en Amazon EKS y
expuesta públicamente mediante un Load Balancer.

## Arquitectura

- **Build multi-stage:** la imagen Docker compila la aplicación React (etapa
  `node:20-alpine`) y luego sirve los archivos estáticos con **nginx**
  (etapa `nginx:alpine`).
- **Proxy interno:** nginx redirige cualquier petición a `/api/*` hacia
  `http://backend-service/api/*`, resolviendo el nombre `backend-service` por
  DNS interno de Kubernetes. Esto evita tener que conocer una URL pública del
  backend en tiempo de build — el frontend y el backend se comunican
  exclusivamente dentro del clúster.
- **Exposición pública:** Service de tipo `LoadBalancer`, que provisiona
  automáticamente un Elastic Load Balancer de AWS, asignando una URL pública
  (`*.elb.amazonaws.com`) accesible desde internet.
- **Réplicas:** Deployment con 2 réplicas.

## Cómo correr localmente

```bash
npm install
npm start
```

## Cómo construir y desplegar manualmente

```bash
docker build -t eva3-frontend .
docker tag eva3-frontend:latest <ECR_URI>:latest
docker push <ECR_URI>:latest
kubectl set image deployment/frontend frontend=<ECR_URI>:latest
kubectl rollout status deployment/frontend
```

## Verificar la URL pública

```bash
kubectl get svc frontend-service
```

La columna `EXTERNAL-IP` muestra la URL del Load Balancer. Al abrirla en el
navegador, la página debe mostrar el mensaje obtenido desde el backend,
confirmando la comunicación Front → Back a través del proxy interno de nginx.

## CI/CD

El workflow `.github/workflows/deploy.yml` automatiza:
**build → push a ECR → deploy en EKS** en cada push a la rama `main`.

## Problemas encontrados y solución

1. **Resolución DNS de `backend-service` en build local:** al construir y probar
   la imagen del frontend de forma aislada (fuera del clúster), nginx falla al
   iniciar porque no puede resolver `backend-service` (`host not found in
   upstream`). Esto es esperado: el nombre solo existe dentro del clúster EKS,
   una vez que el Service del backend está desplegado. La validación de la
   comunicación Front → Back se realizó directamente en el clúster.
2. **Credenciales temporales de AWS Academy Learner Lab:** mismo problema
   documentado en el repositorio `eva3-backend` — los Secrets de GitHub Actions
   deben actualizarse manualmente cada vez que la sesión del lab renueva sus
   credenciales.

## Autor

JP González A. — ISY1101, Duoc UC
