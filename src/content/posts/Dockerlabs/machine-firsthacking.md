---
title: FirstHacking - DockerLabs
published: 2024-09-16
description: 'En este WriteUp, abordaremos la máquina FirstHacking de la plataforma DockerLabs. Aprenderemos a explotar la vulnerabilidad en la versión 2.3.4 de vsftpd, un servicio FTP que opera en el puerto 21.'
image: '../../../assets/DockerLabs/FirstHacking/firsthacking.jpeg'
tags: [DockerLabs, RedTeam, Pentesting, FTP, Searchsploit, Linux]
category: 'WriteUp'
draft: false 
---

## Introducción

DockerLabs es una plataforma gratuita diseñada para la práctica de hacking ético. En esta ocasión, abordaremos la máquina FirstHacking, en la cual aprenderemos a explotar la vulnerabilidad en la versión 2.3.4 de vsftpd, un servicio FTP que opera en el puerto 21.

```
Platform: DockerLabs
Level: Very Easy
```

## Desplegando la máquina

Primero, descargamos la máquina desde la página oficial de [DockerLabs](https://dockerlabs.es)

![Extracción](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-2.By0ZAWf8_1tkwGc.webp)

Una vez descargada, veremos que está comprimida. Procedemos a la extracción mediante una herramienta de descompresión. En mi caso, usaré **Unzip**.

![Ejecución](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-3.jkIad5Tw_dKyoo.webp)

Una vez extraídos los archivos, ejecutaremos la maquina

![Ping](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-4.Cg94UyrT_CPa76.webp)

Una vez desplegada la máquina, nos indicará la **Dirección IP** objetivo y que, al terminar con la máquina, la eliminemos mediante **CTRL + C**.

## Enumeración
```
Target IP: 172.17.0.2
```
<br>

Primero, verificaremos la conectividad con la máquina objetivo mediante el comando `ping -c 1 172.17.0.2`.

Una vez verificada la conexión, podemos observar que se trata de una máquina **Linux**, esto se debe a que el **ttl=64** (Time To Live es igual a 64).

![Escaneo](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-5.z4SoNvCC_Z2hLzPS.webp)

Procedemos a hacer un escaneo de servicios y puertos abiertos con la herramienta de escaneo de redes **Nmap**.

- `sudo`: Ejecuta el comando con privilegios de superusuario.
- `nmap`: Herramienta de escaneo de redes.
- `-p-`: Escanea todos los puertos (del 1 al 65535).
- `--open`: Muestra solo los puertos que están abiertos.
- `-vvv`: Modo muy detallado (muestra más información durante el escaneo).
- `-sS`: Escaneo TCP SYN, conocido como escaneo "sigiloso" porque no completa el handshake.
- `-Pn`: Omite la detección de host (asume que el host está activo).
- `-n`: No resuelve nombres de host (no intenta convertir IP a nombres).
- `--min-rate 5000`: Establece una tasa mínima de paquetes por segundo (aumenta la velocidad del escaneo).
- `172.17.0.2`: Dirección IP del objetivo.
- `-oG firstHacking-scan`: Guarda los resultados en formato "Grepable" en el archivo `firstHacking-scan`.

![Escaneo FTP](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-6.CFqgcXhM_Z12YIyA.webp)

Como vemos, tenemos el puerto **21/tcp** que corre el servicio **FTP**. Haremos un escaneo específico a ese puerto con las flags `-sC` y `-sV`.

- `-p21`: Escanea solo el puerto 21 (**FTP**).
- `-sC`: Ejecuta **scripts Nmap estándar** (escaneo de scripts predefinidos para **obtener más información sobre el servicio**).
- `-sV`: Detecta la **versión del servicio** que se está ejecutando en el puerto.
- `172.17.0.2`: **Dirección IP** del host objetivo.

![Vulnerabilidad](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-7.DrWk7tZ0_ZLKjKH.webp)

Como vemos, hay información sobre la **versión** del puerto **FTP**. La versión es `vsftpd 2.3.4`. Buscaremos en Google esa versión para encontrar una posible vulnerabilidad.

![Línea de comandos](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-9.DDbfWNWc_ZPcR05.webp)

Encontramos un **Backdoor Command Execution** en la página de **Exploit Database (ExploitDB)**, una base de datos de exploits y técnicas de explotación mantenida por Offensive Security.

![Exploit descargado](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-10.DxryziuS_Z282KQD.webp)

ExploitDB permite buscar exploits y vulnerabilidades en su base de datos desde la **línea de comandos**. Esto lo haremos mediante la herramienta **searchsploit**

![ExploitDB](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-8.Cph0vE6w_dQjzW.webp)

## Explotación

Usaremos el exploit para `vsftpd 2.3.4 - Backdoor Command Execution`, aunque también es posible usar el de **Metasploit**.

Utilizaremos el comando de la herramienta `searchsploit -m unix/remote/49757.py`.

- `searchsploit`: Herramienta que busca exploits en la base de datos Exploit-DB.
- `-m`: Opción para copiar (mirroring) el exploit a tu sistema local.
- `unix/remote/49757.py`: Ruta del exploit específico (en este caso, es un exploit remoto para sistemas Unix) con el ID 49757, que es un script en Python.



Con el script descargado en nuestro sistema, lo ejecutaremos usando **python3**, el **script** y especificando la **dirección IP** del host objetivo.

![Root](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-12.gatnuoYv_ZhPcxO.webp)

Una vez dentro, ejecutamos el comando `whoami` o `id` y, como vemos, somos **root**.

![Root](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-14.BwQP8AIC_Z1PpF1d.webp)

También podríamos utilizar el comando `script /dev/null -c bash`, el cual ejecuta una sesión de `bash` mientras redirige la salida de `script` a `/dev/null`, lo que significa que no guarda el registro de la sesión en un archivo.

![Sesión bash](https://old-blog-yw4rf.vercel.app/_astro/firsthacking-15.DuzWJz3V_ZO4GQh.webp)

Una vez dentro, ya hemos obtenido control total y, por ende, damos por concluida la máquina.
