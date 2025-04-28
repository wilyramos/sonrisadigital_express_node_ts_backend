# 🖥️ Backend - Sonrisa Digital: Gestión de Citas Odontológicas

Este es el backend de la aplicación **Sonrisa Digital**, diseñado para gestionar citas en un centro odontológico. Provee la API necesaria para la gestión de usuarios, citas, información de pacientes, y otros datos relacionados, interactuando con una base de datos PostgreSQL.

## ⚙️ Tecnologías Clave y Dependencias

Este proyecto utiliza las siguientes tecnologías y librerías principales:

* **Node.js & TypeScript:** Entorno de ejecución y lenguaje base con tipado estático.
* **Express:** Framework web minimalista y flexible para construir la API.
* **Sequelize & Sequelize-Typescript:** ORM (Object-Relational Mapper) para interactuar con la base de datos PostgreSQL de forma tipada.
* **PostgreSQL:** Sistema de gestión de base de datos relacional.
* **bcrypt:** Para el hashing seguro de contraseñas de usuarios.
* **jsonwebtoken:** Implementación de JSON Web Tokens para autenticación.
* **dotenv:** Para cargar variables de entorno desde un archivo `.env`.
* **cors:** Middleware para habilitar Cross-Origin Resource Sharing.
* **express-validator:** Middleware para validar los datos de entrada de las solicitudes HTTP.
* **pdfkit:** Librería para generar documentos PDF (posiblemente para reportes o comprobantes).
* **morgan:** Middleware para logging de solicitudes HTTP en desarrollo.
* **nodemon:** Herramienta para recargar automáticamente el servidor durante el desarrollo.

Puedes ver la lista completa en el archivo `package.json`.

## ️ 🛠 Instalación y Configuración

Sigue estos pasos para configurar y ejecutar el backend localmente:

1.  **Clona el repositorio:**
    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd backend # O el nombre de la carpeta donde clonaste
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**

    ```env
    DATABASE_URL=postgresql://ejemplo
    JWT_SECRET=ejemplo
    FRONTEND_URL=http://ejemplo
    ```
¿
4.  **Configura tu base de datos:**
    Asegúrate de tener una instancia de PostgreSQL corriendo y accesible con los datos proporcionados en tu archivo `.env`. Deberás crear la base de datos especificada en `DB_NAME` si no existe. (Dependiendo de cómo hayas configurado Sequelize, podrías necesitar ejecutar migraciones o scripts de inicialización si los tienes definidos en el proyecto).

## ✅ Scripts Disponibles

Puedes usar los siguientes scripts definidos en `package.json`:

* `npm run dev`
* `npm run dev:api`¿
* `npm run build`
* 
## 🤝 Contribución

¡Las contribuciones son bienvenidas!

Si encuentras errores, tienes ideas para mejorar la aplicación o quieres añadir nuevas funcionalidades, por favor, siéntete libre de:

1.  Abrir un **Issue** para reportar un error o sugerir una idea.
2.  Enviar un **Pull Request** con tus cambios.

Por favor, asegúrate de seguir las buenas prácticas de desarrollo y, si es posible, añade pruebas unitarias o de integración para tus contribuciones.

## 📄 Licencia

Este proyecto está bajo la **Licencia ISC**. Puedes usarlo, modificarlo y distribuirlo libremente bajo los términos de esta licencia.

---

**Autor:** wily ramos
