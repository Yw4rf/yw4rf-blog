---
title: "HackTheBox: Redeemer - Exploiting Unauthenticated Redis Access"
tags:
  - HackTheBox
  - Redis
  - Port-6379
  - Unauthenticated-Access
  - NoAuth-Redis
  - redis-cli
  - Database-Enumeration
categories:
  - CTF-Writeup
  - Network-Exploitation
  - Linux-Services
date: 2024-09-05
description: "Technical writeup detailing the compromise of the Redeemer machine. The methodology focuses on Nmap scanning to identify the exposed Redis service on port 6379, exploiting the lack of required authentication to connect directly using 'redis-cli', enumerating the key-value store with INFO and KEYS *, and retrieving the flag."
updated: 2025-11-25
abbrlink: redeemer
---

---
title: 'Redeemer - HackTheBox'
description: "Análisis de la máquina Redeemer de HackTheBox, centrado en la enumeración del servicio Redis en el puerto 6379 y la extracción de la flag."
pubDate: 'Sep 5 2024'
categories: ['WriteUp', 'HackTheBox']
---

![Redeemer machine complete yw4rf](redeemer-pwnd.png)

## Introducción

En este análisis se evalúa la máquina Redeemer de HackTheBox. El enfoque principal consiste en identificar servicios expuestos mediante Nmap, determinar la superficie de ataque disponible y profundizar en la enumeración del servicio Redis alojado en el puerto 6379. Finalmente, se procede a la obtención de la flag alojada en la base de datos del sistema.

```
Platform: Hack The Box
Level: Very Easy
```

## Enumeración

```
target: 10.129.97.198
```

Iniciamos validando la conectividad hacia el objetivo mediante el comando `ping -c 1 10.129.35.56`.

![Redeemer ping yw4rf](redeemer-1.png)

Una vez confirmada la conectividad, procedemos a realizar un escaneo de puertos y servicios utilizando **Nmap**, con el objetivo de identificar los servicios expuestos.

![Redeemer scan yw4rf](redeemer-2.png)

El escaneo muestra un único puerto abierto: `6379/tcp`, correspondiente al servicio **Redis**. Esto orienta la etapa de enumeración hacia dicho servicio.

<br>

## Redis

Redis es un motor de base de datos en memoria, diseñado para operaciones de alta velocidad mediante estructuras de datos clave-valor. Aunque se utiliza principalmente como almacenamiento en memoria, puede configurarse también para persistencia en disco.

Para interactuar con el servicio utilizamos la interfaz de línea de comandos `redis-cli`. En caso de no tenerla instalada, deberá agregarse al sistema. Una vez disponible, consultamos las opciones mediante:

```
redis-cli --help
```

![Redeemer yw4rf](redeemer-3.png)

Con esta información, establecemos la conexión al servicio del objetivo:

```
redis-cli -h {target ip}
```

![Redeemer yw4rf](redeemer-4.png)

Ya conectados al servidor Redis, utilizamos `INFO` para obtener un diagnóstico detallado de la base de datos.

![Redeemer yw4rf](redeemer-5.png)
![Redeemer yw4rf](redeemer-6.png)

Entre los datos relevantes encontramos:

- Versión del servicio: `redis_version:5.0.7`
- Número total de claves almacenadas: `keys=4`

Este último valor puede verificarse ejecutando:

```
DBSIZE
```

![Redeemer yw4rf](redeemer-7.png)

Para listar todas las claves disponibles utilizamos:

```
KEYS *
```

![Redeemer yw4rf](redeemer-8.png)

Una de las claves corresponde a la flag del desafío. Para visualizar su contenido empleamos:

```
GET flag
```

![Redeemer yw4rf](redeemer-9.png)

Tras recuperar la flag, damos por finalizada la evaluación de la máquina.

![Redeemer pwnd yw4rf](redeemer-last.png)
