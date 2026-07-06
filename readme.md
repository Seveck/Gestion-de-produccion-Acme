# ACME - Sistema de Automatización de Producción e Inventario

Este proyecto es una aplicación web SPA (Single Page Application) diseñada para la automatización de procesos, gestión de usuarios, control de inventarios de materia prima y ejecución de órdenes de fabricación en una planta de producción alimentaria.

El sistema se conecta de forma asíncrona a **Firebase Realtime Database** mediante su API REST para garantizar la persistencia de los datos en tiempo real.

## 🚀 Características Principales

- **Módulo de Autenticación (`login.html`):** Control de acceso seguro que valida las credenciales de los usuarios registrados en la base de datos antes de permitir el ingreso a los tableros de control.
- **Gestión de Usuarios (`index.html`):** Panel principal que lista los usuarios de la plataforma, permitiendo registrar nuevos colaboradores, editar sus datos y roles (Administrador, Operario, etc.), o eliminarlos.
- **Control de Inventario (`inventario.html`):** Panel general con buscador en tiempo real por código o nombre. Permite la administración completa (CRUD) de Materias Primas (MP) y Productos Terminados (PT).
- **Planta de Producción (`produccion.html`):** Interfaz para la ejecución de órdenes de fabricación basadas en fórmulas preestablecidas. Cuenta con validación automática que descuenta el stock de materia prima y añade las unidades producidas al inventario de producto terminado.
- **Componentes Web Reutilizables:** Implementación de la barra de navegación superior mediante un *Custom Element* de JavaScript nativo (`<nav-acme>`), centralizando los enlaces y optimizando el mantenimiento del diseño.

## 📁 Estructura del Proyecto

El proyecto está organizado de manera modular, separando la estructura (HTML), la presentación (CSS) y la lógica de negocio (JS) de la siguiente manera:

```text
├── css/
│   ├── login.css          # Estilos exclusivos de la pantalla de acceso
│   ├── prodYinv.css       # Estilos específicos de producción e inventario
│   ├── registro.css       # Estilos para el formulario de registro de usuarios
│   └── style.css          # Estilos globales, tablas, modales y navegación
├── js/
│   ├── authentication.js  # Lógica de validación de sesión y cierre de sesión
│   ├── inventario.js      # CRUD de inventario y buscador de productos
│   ├── login.js           # Validación de credenciales de ingreso
│   ├── main.js            # Lógica del index (CRUD de usuarios) y barra de navegación
│   ├── produccion.js      # Lógica de fórmulas, consumo de stock y órdenes
│   └── registro.js        # Lógica de creación de nuevos usuarios
├── index.html             # Vista principal (Panel de Usuarios)
├── inventario.html        # Vista del Inventario General
├── login.html             # Vista de inicio de sesión
├── produccion.html        # Vista de la Planta de Producción
└── registro.html          # Vista de registro de nuevos usuarios