---
title: "HackTheBox Sherlock: UFO-1 - Sandworm Team (APT44) MITRE ATT&CK TTP Analysis"
tags:
  - HackTheBox
  - Sherlocks
  - Threat-Intelligence
  - APT44
  - Sandworm
  - BlackEnergy
  - MITRE-ATTACK
  - ICS-Security
  - Malware-Analysis
categories:
  - CTF-Writeup
  - Threat-Intelligence
  - Blue-Team
date: 2025-01-30
description: "Research writeup focusing on the Sandworm Team (APT44), a highly aggressive Russian APT group, using the MITRE ATT&CK framework. Analysis covers their TTPs, critical infrastructure attacks (e.g., 2016 Ukraine power grid, 2022 SCADA attacks), key malware (e.g., Industroyer2, NotPetya, Exaramel), persistence methods, and specific tools used for code execution and data destruction."
updated: 2025-11-25
abbrlink: ufo-1
---

![UFO-1 HackTheBox](ufo-hackthebox.png)

## Introduction

En este Sherlock, la tarea consistió en investigar al grupo Sandworm Team (también conocido como APT44 o BlackEnergy Group), una amenaza avanzada persistente conocida por sus ataques a infraestructuras críticas. Utilizando el marco MITRE ATT&CK, se analizaron las tácticas, técnicas y procedimientos (TTPs) asociados a este grupo, respondiendo preguntas clave sobre sus campañas más relevantes, las herramientas utilizadas y sus métodos de ataque. Esta experiencia permitió fortalecer habilidades en ciberinteligencia, análisis forense y defensa contra amenazas dirigidas a entornos industriales.

~~~
Platform: HackTheBox
Level: VeryEasy
Type: Research, Threat Intelligence
~~~

### Sherlock  Scenario

> Al estar en la industria de **Sistemas de Control Industrial (ICS)**, tu equipo de seguridad siempre debe estar actualizado y al tanto de las amenazas dirigidas a las organizaciones de tu sector. Acabas de comenzar como pasante de **inteligencia de amenazas**, con algo de experiencia en **SOC**. Tu gerente te ha asignado una tarea para poner a prueba tus habilidades de investigación y evaluar qué tan bien puedes aprovechar **MITRE ATT&CK** a tu favor. Investiga sobre el **equipo Sandworm**, también conocido como **BlackEnergy Group** y **APT44**. Utiliza **MITRE ATT&CK** para comprender cómo mapear el comportamiento y las tácticas del adversario de manera procesable. Domine la evaluación e impresione a su gerente ya que la inteligencia de amenazas es su pasión.

### Key Information

- El **Sandworm Team** es un grupo de amenazas destructivas que ha sido atribuido a la Dirección Principal de Inteligencia del Estado Mayor General de Rusia (GRU), específicamente al Centro Principal de Tecnologías Especiales (GTsST) de la unidad militar 74455. Este grupo ha estado activo desde al menos 2009. [Source](https://attack.mitre.org/groups/G0034/)

### Task 1: 

> According to the sources cited by Mitre, in what year did the Sandworm Team begin operations?

![UFO-1 Yw4rf](ufo-1.png)

![UFO-1 Yw4rf](task-1.png)

### Task 2:

> Mitre notes two credential access techniques used by the BlackEnergy group to access several hosts in the compromised network during a 2016 campaign against the Ukrainian electric power grid. One is LSASS Memory access (T1003.001). What is the Attack ID for the other?

![UFO-1 Yw4rf](ufo-2.png)

![UFO-1 Yw4rf](task-2.png)

### Task 3:

> During the 2016 campaign, the adversary was observed using a VBS script during their operations. What is the name of the VBS file?

![UFO-1 Yw4rf](ufo-3.png)

![UFO-1 Yw4rf](task-3.png)

### Task 4:

> The APT conducted a major campaign in 2022. The server application was abused to maintain persistence. What is the Mitre Att&ck ID for the persistence technique was used by the group to allow them remote access?

![UFO-1 Yw4rf](ufo-4.png)

![UFO-1 Yw4rf](task-4.png)

### Task 5:

> What is the name of the malware / tool used in question 4?

![UFO-1 Yw4rf](ufo-5.png)

![UFO-1 Yw4rf](task-5.png)

### Task 6:

> Which SCADA application binary was abused by the group to achieve code execution on SCADA Systems in the same campaign in 2022?

![UFO-1 Yw4rf](ufo-6.png)

![UFO-1 Yw4rf](task-6.png)

### Task 7:

> Identify the full command line associated with the execution of the tool from question 6 to perform actions against substations in the SCADA environment.

![UFO-1 Yw4rf](ufo-7.png)

![UFO-1 Yw4rf](task-7.png)

### Task 8:

> What malware/tool was used to carry out data destruction in a compromised environment during the same campaign?

![UFO-1 Yw4rf](ufo-8.png)

![UFO-1 Yw4rf](task-8.png)

### Task 9:

> The malware/tool identified in question 8 also had additional capabilities. What is the Mitre Att&ck ID of the specific technique it could perform in Execution tactic?

![UFO-1 Yw4rf](ufo-9.png)

![UFO-1 Yw4rf](task-9.png)

### Task 9:

> The Sandworm Team is known to use different tools in their campaigns. They are associated with an auto-spreading malware that acted as a ransomware while having worm-like features .What is the name of this malware?

![UFO-1 Yw4rf](ufo-10.png)

![UFO-1 Yw4rf](task-10.png)

### Task 11:

> What was the Microsoft security bulletin ID for the vulnerability that the malware from question 10 used to spread around the world?

![UFO-1 Yw4rf](ufo-11.png)

![UFO-1 Yw4rf](task-11.png)

### Task 12:

> What is the name of the malware/tool used by the group to target modems?

![UFO-1 Yw4rf](ufo-12.png)

![UFO-1 Yw4rf](ufo-13.png)

![UFO-1 Yw4rf](task-12.png)

### Task 13:

> Threat Actors also use non-standard ports across their infrastructure for Operational-Security purposes. On which port did the Sandworm team reportedly establish their SSH server for listening?

![UFO-1 Yw4rf](ufo-14.png)

![UFO-1 Yw4rf](task-13.png)

### Task 14: 

> The Sandworm Team has been assisted by another APT group on various operations. Which specific group is known to have collaborated with them?

![UFO-1 Yw4rf](ufo-15.png)

![UFO-1 Yw4rf](task-14.png)

[Verify Achievment](https://labs.hackthebox.com/achievement/sherlock/2035837/840)

![UFO-1 Yw4rf](ufo-pwnd.png)