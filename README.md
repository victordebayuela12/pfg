##  Cómo ejecutar el proyecto

### 1. Clonar el repositorio

Abre la terminal y escribe:

```bash
git clone https://github.com/victordebayuela12/pfg.git
cd tfg
npm install
cd ../proyectoGrado
npm install

```

Creamos en la carpeta tfg/ un archivo .env con este contenido: 
PORT=5000
FRONTEND_URL= http://localhost:5173
MONGO_URI=mongodb+srv://victortcatalan:passwordTFG@tfgcluster.pmt6i.mongodb.net/?retryWrites=true&w=majority&appName=TFGCluster
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1d
CLOUDINARY_CLOUD_NAME=dmagfgwc0
CLOUDINARY_API_KEY=868215748292557
CLOUDINARY_API_SECRET=jaNF6N5LN17dwqDkYln8BECqu-4
EMAIL_USER=tfgvictorserious@gmail.com
EMAIL_PASS=mokr raaj geia cuqp

```bash

cd tfg
code .
Abrimos terminal y ejecutamos: npm run dev

cd ..
cd proyectoGrado
code .
Abrimos terminal y ejecutamos: npm run start
```
### 2. Acceder a la web

Accede a http://localhost:5173/
Accede con:
- email: admin@example.com
- password: admin
