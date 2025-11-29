---
title: "Sequel - Exploiting Unauthenticated MariaDB Access (A07:2021)"
tags:
  - HackTheBox
  - MariaDB
  - MySQL
  - Port-3306
  - Unauthenticated-Access
  - OWASP-A07
  - Database-Enumeration
  - Linux-Exploitation
categories:
  - CTF-Writeup
  - Network-Exploitation
  - Linux-Services
date: 2024-11-19
description: "Technical writeup detailing the compromise of the Sequel machine. The methodology focuses on Nmap scanning to identify the exposed MariaDB service (version 10.3) on port 3306. The system is exploited due to a critical Identification and Authentication Failure (OWASP A07:2021) allowing unauthenticated root login. The process concludes with database enumeration (SHOW DATABASES, USE htb, SELECT * FROM config) to retrieve the flag."
updated: 2025-11-25
abbrlink: htb/sequel
---

![Sequel](sequel-hackthebox.png)

## Introduction

**[HackTheBox](https://app.hackthebox.com/)** es una plataforma diseñada para la práctica de hacking ético. En esta ocasión nos encontraremos ante una máquina vulnerable con el puerto 3306/tcp que ejecuta una base de datos MariaDB. Explotaremos la vulnerabilidad clasificada como A07:2021 – Identification and Authentication Failures según OWASP.

~~~
Platform: HackTheBox
Level: VeryEasy
OS: Linux
~~~

## Reconnaissance

~~~
Target IP: 10.129.251.139
~~~

Comenzamos con el comando **ping**, que utiliza el **ICMP (Protocolo de Control de Mensajes de Internet)**. Este comando envía un mensaje de "echo request" a una dirección IP y espera recibir un mensaje de "echo response". Este proceso permite verificar si una máquina en la red es accesible y medir la latencia. Además, se puede inferir que es una máquina **Linux** debido al **TTL = 63**.

![Sequel yw4rf](sequel-1.png)

## Scanning

Como vemos, el paquete fue recibido por la máquina víctima. Una vez verificada la conexión, empezamos a realizar un escaneo de múltiples etapas con la herramienta **Nmap**. Primero, haremos un escaneo de puertos abiertos.

![Sequel yw4rf](sequel-2.png)

Vemos que tenemos el puerto **3306/tcp** Procedemos a hacer un escaneo más detallado de los mismos con el fin de obtener más información. Esto lo haremos con la flag `-sCV`

![Sequel yw4rf](sequel-3.png)

## Enumeration

El puerto **3306** está abierto y está corriendo un servicio compatible con MySQL. Basado en la información de la versión (`5.5.5-10.3.27-MariaDB-0+deb10u1`), el servicio es **MariaDB**.

> **MariaDB** es un sistema de gestión de base de datos relacionales **(RDBMS)** y un fork de **MySQL**. Fue creado por los desarrolladores originales de MySQL por la preocupación de que MySQL pasara a ser comercializado después de que Oracle lo adquiriera en 2009.

## Exploitation

Comienzo descargando el cliente de MySQL aunque también es posible usar el de MariaDB `sudo apt update && sudo apt install mysql*`  Luego, intentamos ingresar mediante **credenciales débiles** usando los usuarios: 
 
~~~
admin ✘   
guest ✘
user ✘
root ✔
~~~

![Sequel yw4rf](sequel-4.png)

Al ingresar el usuario `root` notamos que ingresamos sin necesidad de contraseña. Lo que resulta en una vulnerabilidad de **[A07:2021 – Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)** según **[OWASP Top 10](https://yw4rf.vercel.app/posts/ethical-hacking/owasptop10)**

Una vez dentro de la base de datos lo primero que hago es usar el comando `SHOW databases;` para listar todas bases de datos disponibles en el servidor. Notamos 4 bases de datos: `htb`, `information_schema`,`mysql` y `performance_schema`

![Sequel yw4rf](sequel-5.png)

En este caso, la que más llama la atención es `htb` ya que las demas son bases de datos predeterminadas de **MariaDB**. Procedemos a ingresar a la base de datos en específico mediante el comando `USE htb;` Una vez dentro de la misma, procedo a listar todas las tablas disponibles en la base de datos seleccionada con el comando `SHOW tables;` en la cual encontramos dos tablas: `config` y `users`

![Sequel yw4rf](sequel-6.png)

Primero, selecciono todos los datos de la tabla `users` con el comando `SELECT * FROM users;` y nos encontramos con los siguientes datos: `id`, `username` y `email`

![Sequel yw4rf](sequel-7.png)

Luego, reviso la tabla `config` con el mismo comando `SELECT * FROM config;` finalmente encontrando la flag:

![Sequel yw4rf](sequel-8.png)

Una vez con la flag, hemos finalizado la máquina y por ende hemos terminado.