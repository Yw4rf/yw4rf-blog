---
title: "DockerLabs: FirstHacking - Exploiting vsftpd 2.3.4 Backdoor (CVE-2011-2523)"
tags:
  - DockerLabs
  - FTP
  - vsftpd
  - Backdoor
  - CVE-Exploitation
  - Command-Execution
  - Searchsploit
  - Privilege-Escalation
categories:
  - CTF-Writeup
  - Vulnerability-Exploitation
  - Network-Security
date: 2024-09-16
description: "Technical writeup demonstrating the exploitation of the vsftpd 2.3.4 backdoor (CVE-2011-2523) vulnerability on a DockerLabs environment. Methodology covers Nmap service detection, exploit identification via Searchsploit, remote command execution via the FTP service, and achieving immediate root access."
updated: 2025-11-25
abbrlink: firsthacking
---

## Introducción

DockerLabs es una plataforma gratuita diseñada para la práctica de hacking ético. En esta ocasión, abordaremos la máquina **FirstHacking**, en la cual aprenderemos a explotar una vulnerabilidad conocida en la versión `2.3.4` de **vsftpd**, un servicio FTP que opera en el puerto 21.

~~~
Platform: DockerLabs
Level: Very Easy
~~~

## Desplegando la máquina

Primero, descargamos la máquina desde la página oficial de DockerLabs.

![Yw4rf DockerLabs](firsthacking-2.png)

Una vez descargada, veremos que viene comprimida. Procedemos a extraerla utilizando una herramienta como **unzip**.

![Yw4rf DockerLabs](firsthacking-3.png)

Con los archivos extraídos, ejecutamos la máquina.

![Yw4rf DockerLabs](firsthacking-4.png)

Al iniciar, se nos muestra la **dirección IP** del objetivo. Al finalizar, podemos detener la máquina presionando **CTRL + C**.

## Enumeración

~~~
Target IP: 172.17.0.2
~~~

Verificamos la conectividad con el comando:

~~~bash
ping -c 1 172.17.0.2
~~~

Observamos que se trata de una máquina **Linux**, deducido por el valor `ttl=64` (Time To Live).

![Yw4rf DockerLabs](firsthacking-5.png)

A continuación, realizamos un escaneo de puertos y servicios con **Nmap**:

```bash
sudo nmap -p- --open -vvv -sS -Pn -n --min-rate 5000 172.17.0.2 -oG firstHacking-scan
```

* `-p-`: Escanea todos los puertos.
* `--open`: Muestra solo los puertos abiertos.
* `-sS`: Escaneo TCP SYN (sigiloso).
* `-Pn`: Omite la detección de host.
* `-n`: No resuelve nombres de host.
* `--min-rate 5000`: Aumenta la velocidad del escaneo.
* `-oG`: Guarda el resultado en formato grep.

![Yw4rf DockerLabs](firsthacking-6.png)

Detectamos el puerto **21/tcp** (FTP) abierto. Realizamos un escaneo más específico:

```bash
nmap -p21 -sC -sV 172.17.0.2
```

* `-sC`: Ejecuta scripts predeterminados.
* `-sV`: Detecta la versión del servicio.

![Yw4rf DockerLabs](firsthacking-7.png)

El escaneo revela que el servicio es `vsftpd 2.3.4`, una versión conocida por tener una **puerta trasera (backdoor)**.

![Yw4rf DockerLabs](firsthacking-8.png)

Buscamos un exploit en **Exploit-DB**. Una forma eficiente es usar la herramienta **searchsploit** desde la terminal:

```bash
searchsploit vsftpd 2.3.4
```

![Yw4rf DockerLabs](firsthacking-9.png)

## Explotación

Usaremos el exploit `vsftpd 2.3.4 - Backdoor Command Execution`, disponible en Exploit-DB. Puede utilizarse manualmente o mediante **Metasploit**.

![Yw4rf DockerLabs](firsthacking-10.png)

Para descargar el exploit con `searchsploit`, ejecutamos:

```bash
searchsploit -m unix/remote/49757.py
```

* `-m`: Copia el exploit a nuestro sistema local.


![Yw4rf DockerLabs](firsthacking-11.png)

Con el exploit descargado, lo ejecutamos:

```bash
python3 49757.py 172.17.0.2
```

Esto abrirá una conexión si el servidor es vulnerable. Como resultado, obtenemos acceso como **root**. Una vez dentro, verificamos con:

~~~bash
whoami o id
~~~

![Yw4rf DockerLabs](firsthacking-14.png)

Podemos mejorar la sesión con:

```bash
script /dev/null -c bash
```

Esto lanza una shell de Bash redirigiendo la salida estándar, útil para mejorar la interacción en algunos entornos.

![Yw4rf DockerLabs](firsthacking-15.png)

Con acceso total, damos por completada la máquina.

## Resumen

La máquina expone el puerto **21 (FTP)**. Detectamos que utiliza la versión vulnerable `vsftpd 2.3.4`, que contiene una puerta trasera. Esta se activa al enviar un nombre de usuario que termina en `:)`, lo que permite abrir una shell sin necesidad de autenticación. Usando un exploit conocido, logramos obtener acceso como **root** en el sistema.

```