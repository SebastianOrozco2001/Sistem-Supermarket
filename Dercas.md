Sistema de Gestión para Supermercado "App Supermercado"
Repositorio GitHub: https://github.com/SebastianOrozco2001/Sistem-Supermarket.git
Tablero Trello: https://trello.com/b/689f9983a6d4991dc33feeb9/app-supermercado
Versión del Documento: 1.0
Fecha: 2024-03-01

1. Visión General
Aplicación web para supermercados que permite a los clientes comprar en línea, realizar seguimiento a sus pedidos y a los administradores gestionar el catálogo y el inventario.

2. Objetivos
Digitalizar el proceso de compra para los clientes.

Centralizar la gestión de productos, pedidos y usuarios para los administradores.

Incrementar las ventas mediante una plataforma accesible y fácil de usar.

3. Alcance
3.1. Funcionalidades Incluidas (Módulos Principales)
Módulo de Cliente (Frontend Público): Catálogo, carrito, checkout, seguimiento de pedidos, historial.

Módulo de Administración (Backend Privado): Gestión de productos, categorías, pedidos, usuarios.

Sistema de Autenticación: Registro y login para clientes y admin.

Pasarela de Pagos: Integración con al menos un proveedor (Stripe/PayPal).

3.2. Funcionalidades Excluidas (V1.0)
App móvil nativa (será una PWA responsive).

Sistema de fidelización o puntos.

Gestión de empleados y nómina.

4. Público Objetivo (Stakeholders)
Clientes: Personas que compran productos del supermercado.

Administradores: Personal que gestiona el inventario, precios y pedidos.

Repartidores: (Futuro) Personal que entrega los pedidos y actualiza su estado.

5. Requerimientos Funcionales Detallados
RF01 - Gestión de Catálogo de Productos
Descripción: El administrador debe poder agregar, editar, desactivar y eliminar productos.

Criterios de Aceptación:

Un producto debe tener: nombre, descripción, precio, SKU, imagen, categoría, stock.

La lista de productos debe poder filtrarse y buscarse por nombre y categoría.

El sistema debe mostrar una alerta al administrador cuando el stock de un producto sea bajo (< 10 unidades).

RF02 - Funcionalidad de Carrito de Compras
Descripción: El usuario debe poder agregar productos a un carrito, ver el resumen y proceder al checkout.

Criterios de Aceptación:

El carrito debe persistir durante la sesión del usuario.

El usuario debe poder modificar las cantidades y eliminar productos del carrito.

El sistema debe calcular automáticamente el subtotal, impuestos (si aplican) y el total.

RF03 - Proceso de Checkout y Pago
Descripción: El usuario debe poder finalizar su compra ingresando dirección y datos de pago.

Criterios de Aceptación:

El flujo debe incluir: revisión del carrito → ingreso de dirección de envío → selección de método de pago → pago → confirmación.

La integración con Stripe/PayPal debe ser funcional y segura (ambiente de pruebas).

Tras un pago exitoso, se debe crear un pedido y restar el stock de los productos comprados.

RF04 - Sistema de Autenticación y Autorización
Descripción: Los usuarios (clientes y admin) deben poder registrarse e iniciar sesión.

Criterios de Aceptación:

Los clientes se registran con email y contraseña.

El rol de administrador es asignado manualmente en la base de datos.

Las rutas del panel de administración deben estar protegidas y ser accesibles solo para usuarios con rol admin.

RF05 - Panel de Administración
Descripción: El administrador debe tener un dashboard para gestionar las entidades principales.

Criterios de Aceptación:

Debe mostrar métricas clave: total de ventas, pedidos recientes, productos bajos en stock.

Debe tener secciones CRUD para: Productos, Categorías y Pedidos.

Debe poder cambiar el estado de un pedido (Ej: "En preparación", "En camino", "Entregado").

6. Requerimientos No Funcionales
RNF01 - Usabilidad
La interfaz debe ser intuitiva y seguir principios de diseño UX.

La aplicación debe ser completamente responsive y funcionar correctamente en dispositivos móviles y desktop.

RNF02 - Rendimiento
El tiempo de carga inicial de la aplicación debe ser menor a 3 segundos.

El tiempo de respuesta de la API debe ser menor a 500ms para el 95% de las peticiones.

RNF03 - Seguridad
Las contraseñas deben almacenarse encriptadas (hash + salt).

Todas las comunicaciones deben usar HTTPS.

La aplicación debe ser immune a vulnerabilidades comunes (ej: XSS, inyección SQL).

RNF04 - Compatibilidad
Debe ser compatible con las últimas versiones de Chrome, Firefox, Safari y Edge.

7. Stack Tecnológico Propuesto
Frontend: React.js / Next.js + Tailwind CSS

Backend: Node.js + Express.js

Base de Datos: MongoDB con Mongoose

Autenticación: JSON Web Tokens (JWT)

Pagos: Stripe API (Modo prueba inicial)

Hosting: AWS EC2 o Vercel/Netlify (Frontend) + Railway/Render (Backend)

Control de Versiones: GitHub

8. Metodología y Seguimiento
Metodología: Scrum.

Herramienta de Gestión de Proyectos: Trello (con tablero Scrum: Backlog, To Do, Doing, Review, Done).

Sprints: Iteraciones de 2 semanas.

Entregables: Cada sprint debe terminar con un incremento de software potencialmente desplegable.

9. Criterios de Aceptación del Proyecto (Definition of Done)
El código está integrado en la rama principal (main).

El código ha pasado una revisión por pares (Pull Request).

Las funcionalidades están desplegadas en el ambiente de staging (AWS).

Las funcionalidades cumplen con todos los criterios de aceptación definidos.

La documentación relevante (README, API) ha sido actualizada.
