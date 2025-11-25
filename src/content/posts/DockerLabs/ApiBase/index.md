---
title: "DockerLabs: ApiBase - API Endpoint Enumeration and Privilege Escalation"
tags:
  - DockerLabs
  - API-Testing
  - Endpoint-Enumeration
  - Brute-Force
  - Wireshark
  - PCAP-Analysis
  - SSH
  - Privilege-Escalation
categories:
  - CTF-Writeup
  - API-Security
  - Forensics
date: 2025-03-11
description: "Technical writeup detailing the compromise of a DockerLabs API-based system. Methodology includes Nmap scanning, API endpoint enumeration (GET/POST methods), credential brute-forcing via Caido, file transfer (SCP), and PCAP network analysis using Wireshark to extract critical credentials for root access."
updated: 2025-11-25
abbrlink: apibase
---

## Introduction

Se enumeraron los endpoints de una API, identificando que `/users` exponía información de usuarios y credenciales. Mediante un ataque de fuerza bruta con **Caido**, se logró acceder a una cuenta. Posteriormente, dentro del servicio **SSH**, se encontró un archivo `.pcap` que contenía consultas relevantes. Al analizarlo con **Wireshark**, se identificaron credenciales o patrones que permitieron escalar privilegios y obtener acceso como **root**.

~~~
Platform: DockerLabs
Level: Easy
OS: Linux
~~~

## Scanning

El comando **`nmap -sS -sV -p- -Pn -n -T4 10.10.11.38`** se emplea para escanear de manera agresiva **(`-T4`)** la máquina objetivo con el propósito de identificar puertos abiertos, servicios en ejecución y sus versiones. Esta información es clave para detectar posibles vulnerabilidades.

![Yw4rf ApiBase](apibase-1.png)

## Enumeration

### 22/SSH
El puerto 22 ejecuta el servicio SSH versión **OpenSSH 8.4p1**. De momento no tenemos ninguna vulnerabilidad que aprovechar para esta versión.

### 5000/TCP
El puerto 5000 ejecuta un servidor web HTTP **Werkzeug httpd 1.0.1** (Python 3.9.2). 

Al acceder al sitio nos encontramos con el mensaje **`No endpoint selected. Please use /add to add a user or /users to query users`** 

![Yw4rf ApiBase](apibase-2.png)

Realizo **directory brute-forcing** mediante **`Gobuster`** con el objetivo de encontrar directorios o archivos ocultos:

![Yw4rf ApiBase](apibase-3.png)

Al intentar acceder a **`172.17.0.2:5000/add`** nos indica **`Method Not Allowed. The Method is not allowed for the requested URL`** por lo que es posible inferir que es necesario otro método al realizar la petición al sitio:

![Yw4rf ApiBase](apibase-4.png)

**`Caido`** es una herramienta de **intercepción y análisis de tráfico web**, similar a **Burp Suite** o **ZAP (Zed Attack Proxy)**. Con está herramienta modificamos la petición del método **GET** al método **POST** (en la linea 1).

El error **`KeyError: 'username'`** indica que la aplicación está esperando un parámetro llamado **`"username"`**

![Yw4rf ApiBase](apibase-5.png)

Añado en la linea 10 **`Content-Type: application/x-www-form-urlencoded`** y luego el parámetro con su respectivo valor: **`username=testUser`**

Luego de añadir tal parámetro al enviar otra petición, nuevamente se muestra el error indicando que es necesario añadir el parámetro password **`KeyError: 'password'`**

![Yw4rf ApiBase](apibase-6.png)

Una vez añadidos ambos parámetros al enviar la petición la respuesta nos indica el mensaje **`"User added"`** 

![Yw4rf ApiBase](apibase-7.png)

Es posible utilizar el endpoint de la API **`/users`** para consultar usuarios existentes (Tal como nos indicaba al acceder al sitio en el puerto 5000 **`http://172.17.0.2:5000`**)

Enviamos la petición con el método **GET** y el parámetro añadido anteriormente **`/users?username=testUser`**, la respuesta nos indica **ID**, **Username** y **Password**. 

![Yw4rf ApiBase](apibase-8.png)

Parece ser que somos el **ID 3** por lo que deben existir **2** usuarios existentes creados antes que el nuestro.

## Exploitation

Utilizando **`Caido`** realizamos un **`brute-force attack`** con el fin de encontrar credenciales que nos permitan acceder:  

![Yw4rf ApiBase](apibase-9.png)

Se encontró el usuario **`pingu`** con sus respectivas credenciales:

~~~
1- pingu:your_password
2- pingu:pinguinasio
~~~

![Yw4rf ApiBase](apibase-10.png)

Se accedió correctamente mediante **SSH** con las credenciales **`pingu:pinguinasio`** encontradas anteriormente:  

![Yw4rf ApiBase](apibase-11.png)

## Privilege Escalation

Dentro del directorio **`/home`** se encontró un archivo **.PCAP** 

![Yw4rf ApiBase](apibase-12.png)

Con la herramienta **`scp (Secure Copy Protocol)`** que se usa para copiar archivos de manera segura entre un host remoto y uno local o entre dos ubicaciones remotas. Con **`$(pwd)`** le indico que quiero copiarlo en mi directorio actual.

Procedo a analizar el archivo **.PCAP** con la herramienta **`Wireshark`** 

![Yw4rf ApiBase](apibase-13.png)

Luego de analizar las consultas se encontraron credenciales comprometedoras:

~~~
root:balulero
~~~

![Yw4rf ApiBase](apibase-14.png)

Utilizamos el comando **`su root`** y luego ingresamos la credencial anteriormente hallada:

- `su` (substitute user) permite cambiar de usuario en el sistema.
- `root` es el nombre del usuario al se intenta cambiar.

![Yw4rf ApiBase](apibase-15.png)

**ROOTED**