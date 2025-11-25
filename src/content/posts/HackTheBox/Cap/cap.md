---
title: "HackTheBox: Cap - PCAP Analysis, FTP Credential Disclosure, and cap_setuid Privilege Escalation"
tags:
  - HackTheBox
  - Tshark
  - PCAP-Analysis
  - FTP-Exploitation
  - Credential-Disclosure
  - cap_setuid
  - Linux-Capabilities
  - Privilege-Escalation
  - Python-Exploitation
categories:
  - CTF-Writeup
  - Network-Exploitation
  - Linux-Privesc
date: 2024-10-20
description: "Technical writeup detailing the compromise of the Cap machine. Initial access is achieved by enumerating a web application that provides downloadable .PCAP network capture files. Tshark analysis of a specific PCAP file reveals FTP credentials in plaintext. These credentials are used to gain SSH access as the 'nathan' user. Privilege escalation to root is achieved by exploiting the 'cap_setuid' capability set on the /usr/bin/python3.8 binary, allowing arbitrary user ID change to 0 (root)."
updated: 2025-11-25
abbrlink: cap
---

![Cap yw4rf](cap-hackthebox.png)

## Introduction

**[HackTheBox](https://app.hackthebox.com/profile/2035837)** es una plataforma diseñada para la práctica de hacking ético. En esta ocasión, abordaremos la máquina Cap. Nos encontraremos con varios puertos: 80/HTTP, 21/FTP y 22/SSH. Utilizaremos Tshark para analizar paquetes de archivos .PCAP, Fuzzing web para encontrar subdirectorios y escalaremos privilegios mediante la capabilitie cap_setuid.

~~~
Platform: HackTheBox
Level: Easy
OS: Linux
~~~

## Reconnaissance

~~~
Target: 10.10.10.245
~~~

Inicialmente, usamos el comando **Ping**. Este utiliza el **ICMP (Protocolo de Control de Mensajes de Internet)**. Específicamente, **Ping** envía un mensaje de “echo request” a una **dirección IP** y espera recibir un mensaje de “echo response” en respuesta. Este proceso nos permite verificar si una máquina en la red es accesible y medir el tiempo que tarda en recibir una respuesta (conocido como latencia). Ademas, podemos inferir que es una máquina **Linux** debido al **Time To Leave** (**ttl**) que en este caso es **63** (si fuese en su lugar **128** o un número cercano a este, sería una máquina **Windows**)

![Cap yw4rf](cap-1.png)

## Scanning

Como vemos, el paquete fue recibido por la máquina victima. Una vez verificada la conexión, empezamos a realizar un escaneo de multiples etapas con la herramienta **Nmap**. Primero, hacemos un escaneo de puertos abiertos.

![Cap yw4rf](cap-2.png)

Vemos que tenemos los puertos **21/FTP**, **22/SSH** y **80/HTTP**. Procedemos a hacer un escaneo más detallado de los mismos con el fin de obtener más información. Esto lo haremos con la flag `-sCV`

![Cap yw4rf](cap-3.png)

## Enumeration

##### 21/FTP 

La versión del puerto 21 que ejecuta el servicio FTP es **vsftpd 3.0.3**, no encontramos ninguna vulnerabilidad para está versión de momento.

##### 22/SSH

La versión del puerto 22 que ejecuta el servicio SSH es **OpenSSH 8.2p1**, no encontramos ninguna vulnerabilidad para está versión de momento.

##### 80/HTTP

Por lo visto, el puerto 80 ejecuta HTTP, un servidor web **gunicorn**. Haremos uso de **whatweb** para obtener más información acerca del sitio web. Como vemos, es posible acceder al mismo ya que nos reporta el estado "**200 OK**", además nos reporta que utiliza **JQuery 2.2.4** y **Modernizr 2.8.3.min**.

![Cap yw4rf](cap-4.png)

Accedemos al sitio web para obtener más información

![Cap yw4rf](cap-5.png)

Al ingresar lo primero que nos llama la atención es el nombre de **Nathan**. Podemos inferir que es un posible usuario. Además vemos una especie de **Security Dashboard** que reporta **Security Events**, **Failed Login Attempts** y **Port Scans (Unique IPs)** 

![Cap yw4rf](cap-6.png)

Al abrir la barra de navegación nos encontramos con varias secciones **Dashboard**, **Security Snapshot (5 Second PCAP + Analysis)**, **IP Config** y **Network Status** de todas estas la que más nos llama la atención es la segunda **Security Snapshot**

![Cap yw4rf](cap-7.png)

Al ingresar notamos que la **URL** cambia al subdirectorio **/data/1** además vemos que nos indica ciertos numeros de paquetes, también notamos que es posible descargar estos paquetes en un archivo con extensión **.pcap** al parecer este tipo de archivos se utilizan para determinar el estado de la red. Haremos uso de **Tshark** para averiguar que hay dentro del archivo descargado **1.pcap**

![Cap yw4rf](cap-8.png)

No encontramos mucho dentro del archivo **1.pcap**. Haremos **Web fuzzing** con **Gobuster** para encontrar directorios o archivos ocultos. Vemos que hay varios subdirectorios en el directorio **data/** entre ellos **data/0**, **data/00**, **data/01** 

![Cap yw4rf](cap-9.png)

A la hora de ingresar al subdirectorio **data/0** observamos que el numero de paquetes cambia notablemente.

![Cap yw4rf](cap-10.png)

Al descargar el archivo con la extensión **.pcap** notamos que el nombre del archivo cambia a **0.pcap** y a la hora de analizarlo con **Tshark** nos muestra mucha más información.

![Cap yw4rf](cap-11.png)

Hay demasiada información para analizar por lo que filtraremos la misma. Al filtrar por **"ftp"** notamos que en la **linea 40** hay una posible contraseña, recordamos también que teniamos un posible usuario

## Exploitation 

**user**: **nathan**
**password**: **Buck3tH4TF0RM3!**

![Cap yw4rf](cap-12.png)

Intentamos acceder con la contraseña al servicio **FTP** con el usuario y la contraseña. Al ingresar correctamente listamos y encontramos el archivo **user.txt** el cual descargamos en nuestra máquina local. 

![Cap yw4rf](cap-13.png)

Intentamos acceder al servicio **SSH** con las mismas credenciales y funcionó correctamente

![Cap yw4rf](cap-15.png)

## Privilege Escalation

Ejecutamos el comando `sudo -l` para listar los permisos **sudo** del usuario actual y como vemos nos indica que el usuario nathan no puede ejecutar **sudo**.

Intentamos el comando `find / -perm -4000 2>/dev/null` que nos permite realizar una búsqueda en el sistema de archivos que tengan el bit **SUID (Set User ID)** activado y no tenemos mucha suerte tampoco.

![Cap yw4rf](cap-16.png)

Intentamos por **Capabilities**, mecanismo que en sistemas linux permite a los procesos tener permisos especificos sin ser superusuarios. Encontramos que es posible escalar privilegios al intentar explotar **/usr/bin/python3.8 = cap_setuid**  

![Cap yw4rf](cap-17.png)

Para poder escalar privilegios creamos un archivo **.py** que contenga los siguientes comandos:

- **`import os`**: Esta línea importa el módulo `os`, que proporciona funciones para interactuar con el sistema operativo. 
- **`os.setsuid(0)`**: Cambia el ID del usuario efectivo del proceso a 0, que es el ID del superusuario (root). Esto otorga al proceso los privilegios completos del sistema.
- **`os.system("/bin/bash")`**: Ejecuta una nueva instancia del shell de Bash. Dado que el ID de usuario efectivo ha sido cambiado a 0, este nuevo shell se ejecutará con privilegios de superusuario.

![Cap yw4rf](cap-18.png)

Al ejecutar el script con **python3.8** nos permite escalar privilegios exitosamente

![Cap yw4rf](cap-19.png)

Como vemos, somos **root** y por ende tenemos control total del sistema. Hemos finalizado la máquina. Faltaría encontrar las flags.

![Cap yw4rf](cap-pwnd.png)

<br>