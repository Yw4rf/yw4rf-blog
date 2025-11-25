---
title: "HackTheBox: Crocodile - FTP Anonymous Login and Credential Disclosure"
tags:
  - HackTheBox
  - FTP
  - FTP-Anonymous
  - vsFTPd
  - Credential-Disclosure
  - Information-Disclosure
  - Web-Enumeration
  - Gobuster
  - Linux-Exploitation
categories:
  - CTF-Writeup
  - Network-Exploitation
  - Web-Exploitation
date: 2024-11-20
description: "Technical writeup detailing the compromise of the Crocodile machine. Initial access is achieved by exploiting the Anonymous FTP login vulnerability on the vsFTPd 3.0.3 service (21/tcp) to disclose files containing credentials (allowed.userlist and allowed.userlist.passwd). Web enumeration via Gobuster reveals a hidden '/login.php' endpoint. The disclosed 'admin' credentials are used to access the web panel and retrieve the flag, completing the box."
updated: 2025-11-25
abbrlink: crocodile
---

![Crocodile yw4rf](crocodile-hackthebox.png)

## Introduction

**[HackTheBox](https://app.hackthebox.com)** es una plataforma para practicar hacking ético. En este writeup resolveremos la máquina Crocodile, explorando vulnerabilidades como **Anonymous FTP login allowed** en el servicio FTP y un sitio web HTTP con directorios ocultos. Usaremos herramientas clave como **Nmap** y **Gobuster**, aplicando técnicas básicas de pentesting en sistemas Linux.

~~~
Platform: HackTheBox
Level: VeryEasy
OS: Linux
~~~

## Reconnaissance

~~~
Target IP: 10.129.169.55
~~~

Comenzamos con el comando **ping**, que utiliza el **ICMP (Protocolo de Control de Mensajes de Internet)**. Este comando envía un mensaje de "echo request" a una dirección IP y espera recibir un mensaje de "echo response". Este proceso permite verificar si una máquina en la red es accesible y medir la latencia. Además, se puede inferir que es una máquina **Linux** debido al **TTL = 63**.

![Crocodile yw4rf](crocodile-1.png)

## Scanning 

El paquete fue recibido correctamente por la máquina objetivo. Verificada la conexión, realizamos un escaneo de múltiples etapas con la herramienta **Nmap**. Primero, identificamos los puertos abiertos:

![Crocodile yw4rf](crocodile-2.png)

Los puertos abiertos son **21/tcp** y **80/tcp**. A continuación, realizamos un escaneo más detallado utilizando la bandera `-sCV` para obtener más información:

![Crocodile yw4rf](crocodile-3.png)

## Enumeration

### 21/tcp

El puerto 21 ejecuta `FTP vsFTPd 3.0.3`. Además, observamos que tiene `Anonymous FTP login allowed`, lo que permite acceder sin autenticación. El servidor contiene dos archivos: `allowed.userlist` y `allowed.userlist.passwd`.

### 80/tcp 

El puerto 80 ejecuta un servidor web `Apache httpd 2.4.41 ((Ubuntu))`. Usamos la herramienta **whatweb** para obtener información adicional y encontramos que se ejecutan `jQuery/1.12.4` y `Modernizr/3.7.1`. También se revelan dos correos electrónicos: `hello@ayroui.com` y `support@euideck.com` 

![Crocodile yw4rf](crocodile-4.png)

Accedemos al sitio web en `http://10.129.169.55/` 

![Crocodile yw4rf](crocodile-5.png)

No encontré nada interesante por lo que ingrese directamente al FTP de la máquina objetivo con el comando `ftp 10.129.169.55` aprovechando la vulnerabilidad `FTP Anonymous login allowed`

## Exploitation

> **FTP Anonymous login**: Es una vulnerabilidad que permite ingresar a un servidor FTP sin necesidad de autenticarse con una cuenta y contraseña. Los usuarios se conectan al servidor utilizando el nombre de usuario "anonymous" (o "ftp" en algunos casos) y cualquier contraseña.

![Crocodile yw4rf](crocodile-6.png)

Una vez conectados exitosamente lo primero que hago es listar el directorio actual con el comando `ls` y efectivamente encontramos los archivos `allowed.userlist` y `allowed.userlist.passwd` tal como lo habia reportado el escaneo de Nmap

![Crocodile yw4rf](crocodile-7.png)

Descargamos los archivos con el comando `get [file_name]`:

![Crocodile yw4rf](crocodile-8.png)

Al inspeccionar los archivos descargados con `cat [file_name]`, encontramos listas de **usuarios** y sus respectivas **contraseñas**:

~~~
aron:root
pwnmeow:Supersecretpassword1
egotistcalsw:@BaASD&9032123sADS
admin:rKXM59ESxesUFHAd
~~~

![Crocodile yw4rf](crocodile-9.png)

En la página `http://10.129.169.55/` no habia ningun panel de autenticación, pero aún no he enumerado los directorios ocultos del sitio por lo que procedo a usar **Gobuster** para realizarlo:

![Crocodile yw4rf](crocodile-10.png)

**Gobuster** identifica el directorio `/login.php`. Nos dirigimos a esta página e ingresamos las credenciales `admin:rKXM59ESxesUFHAd`

![Crocodile yw4rf](crocodile-11.png)

Una vez autenticados, accedemos al "server manager" como usuario **admin**. Desde allí, obtenemos la flag, completando así la máquina:

![Crocodile yw4rf](crocodile-12.png)

Una vez encontrada la flag hemos finalizado la máquina Crocodile.