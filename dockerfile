#usaremos la imagen de node para correr el proyecto
FROM node:latest

#copiamos el directorio del proyecto
WORKDIR /usr/src/app

#copiamos el package.json
COPY package.json ./
RUN npm install

#copiamos el directorio del proyecto
COPY . .

#exponemos el puerto del servidor
EXPOSE 3000

#ejecutamos el comando para iniciar el servidor
CMD ["npm", "start"]