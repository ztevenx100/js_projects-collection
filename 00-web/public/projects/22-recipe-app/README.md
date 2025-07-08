# Aplicación de Recetas de Cocina

Una aplicación web para buscar, filtrar y guardar recetas de cocina favoritas. Diseñada con HTML, CSS y JavaScript vanilla, sin dependencias externas.

![Aplicación de Recetas de Cocina](./screenshot.png)

## Características

- **Búsqueda y filtrado**: Busca recetas por nombre o filtra por tipo de cocina, dieta y tiempo de preparación.
- **Sistema de favoritos**: Guarda tus recetas preferidas para acceder fácilmente después.
- **Vista detallada**: Accede a información detallada de cada receta, incluyendo ingredientes, instrucciones y tiempos de preparación.
- **Diseño responsivo**: Funciona perfectamente en dispositivos móviles, tablets y escritorio.
- **Modo oscuro/claro**: Cambia entre modos oscuro y claro según tus preferencias.
- **Persistencia de datos**: Tus recetas favoritas y preferencias de tema se guardan en el navegador.

## Tecnologías utilizadas

- **HTML5**: Estructura semántica y accesible.
- **CSS3**: Variables CSS, flexbox, grid, transiciones y diseño responsivo.
- **JavaScript**: ES6+, manipulación del DOM, localStorage, y manejo de eventos.

## Aspectos destacados

### Arquitectura de la aplicación

La aplicación sigue un patrón de arquitectura simple pero efectivo, separando:

- **Estado**: Todos los datos y estado de la aplicación están centralizados.
- **Renderizado**: Funciones puras que generan HTML basado en el estado actual.
- **Controladores**: Funciones que manejan eventos y actualizan el estado.

### Sistema de persistencia

Los datos del usuario se guardan automáticamente en localStorage:

- Recetas favoritas
- Preferencia de tema (oscuro/claro)

### Optimización de rendimiento

- Renderizado selectivo de componentes
- Paginación para conjuntos grandes de datos
- Carga diferida de imágenes

## Posibles mejoras futuras

- Conexión a una API real de recetas
- Posibilidad de crear y editar recetas propias
- Compartir recetas vía enlaces o redes sociales
- Sistema de calificación de recetas
- Cálculo de información nutricional
- Ajuste de cantidades según número de personas

## Aprendizajes clave

- **Gestión de estado**: Centralización y actualización consistente del estado de la aplicación.
- **Renderizado dinámico**: Generación de HTML basada en datos y estado.
- **Persistencia de datos**: Uso efectivo de localStorage para guardar preferencias de usuario.
- **Experiencia de usuario**: Diseño de interacciones fluidas y feedback visual claro.

## Créditos

Desarrollado como parte de la colección de proyectos JavaScript.
