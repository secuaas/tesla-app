# TeslaVault

**Application de Monitoring Tesla**

> Spécifications Fonctionnelles & Techniques Complètes  
> Version 3.0 - Janvier 2026

---

## Table des matières

1. [Résumé Exécutif](#1-résumé-exécutif)
2. [Données Accessibles via l'API Tesla](#2-données-accessibles-via-lapi-tesla)
3. [Commandes Disponibles](#3-commandes-disponibles)
4. [Fonctionnalités à Développer](#4-fonctionnalités-à-développer)
5. [Statistiques Détaillées](#5-statistiques-détaillées)
6. [Tarification API Tesla & Optimisations](#6-tarification-api-tesla--optimisations)
7. [Modèle de Données (Prisma)](#7-modèle-de-données-prisma)
8. [Stack Technique](#8-stack-technique)
9. [Roadmap de Développement](#9-roadmap-de-développement)
10. [Structure du Projet](#10-structure-du-projet)
11. [Checklist Claude Code](#11-checklist-claude-code)

---

## 1. Résumé Exécutif

TeslaVault est une PWA multi-utilisateurs permettant de centraliser, visualiser et analyser les données des véhicules Tesla. L'application stocke localement toutes les données pour fournir des statistiques détaillées impossibles à obtenir via l'application Tesla officielle.

> 🎯 **Proposition de valeur**: Tesla ne conserve pas l'historique de vos trajets et charges. TeslaVault le fait pour vous.

### 1.1 Proposition de Valeur

- **Historique complet** - trajets, charges, statistiques conservés indéfiniment
- **Statistiques avancées** - analyses impossibles dans l'app Tesla
- **Coûts de recharge** - suivi précis avec tarifs personnalisés
- **Impact environnemental** - CO2 évité, économies vs essence
- **Export de données** - vos données vous appartiennent

### 1.2 Avertissement Coûts

> 🚨 **IMPORTANT**: Depuis février 2025, l'API Tesla Fleet est payante. Une mauvaise architecture peut coûter >$50/véhicule/mois. Une architecture optimisée coûte <$1/véhicule/mois.

---

## 2. Données Accessibles via l'API Tesla

L'API Tesla Fleet donne accès à plus de 150 champs de données via Fleet Telemetry.

### 2.1 Batterie & Charge

| Champ | Type | Description |
|-------|------|-------------|
| `BatteryLevel` / `Soc` | real | Niveau de batterie (%) |
| `EnergyRemaining` | real | Énergie restante (kWh) |
| `EstBatteryRange` | real | Autonomie estimée (miles) |
| `IdealBatteryRange` | real | Autonomie idéale (miles) |
| `RatedRange` | real | Autonomie officielle (miles) |
| `ChargeLimitSoc` | int | Limite de charge configurée (%) |
| `DetailedChargeState` | enum | État (Charging, Complete, Stopped, Disconnected...) |
| `ChargeAmps` | real | Ampérage actuel (A) |
| `ChargerVoltage` | real | Voltage du chargeur (V) |
| `ACChargingPower` | real | Puissance AC (kW) |
| `DCChargingPower` | real | Puissance DC Supercharger (kW) |
| `ACChargingEnergyIn` | real | Énergie ajoutée AC (kWh) |
| `DCChargingEnergyIn` | real | Énergie ajoutée DC (kWh) |
| `TimeToFullCharge` | real | Temps restant (heures) |
| `ChargeRateMilePerHour` | real | Vitesse de charge (miles/h) |
| `ChargingCableType` | enum | Type de câble (IEC, SAE, GB...) |
| `FastChargerType` | enum | Type Supercharger |
| `FastChargerPresent` | boolean | Supercharger connecté |
| `ChargePortDoorOpen` | boolean | Port de charge ouvert |
| `ChargePortLatch` | enum | État du verrou port |
| `BatteryHeaterOn` | boolean | Chauffage batterie actif |
| `PreconditioningEnabled` | boolean | Préconditionnement actif |
| `ScheduledChargingStartTime` | timestamp | Heure charge programmée |
| `ScheduledChargingPending` | boolean | Charge programmée en attente |

### 2.2 Conduite

| Champ | Type | Description |
|-------|------|-------------|
| `VehicleSpeed` | real | Vitesse instantanée (mph) |
| `Odometer` | real | Kilométrage total (miles) |
| `Gear` | enum | Position (P, R, N, D) |
| `PedalPosition` | real | Position accélérateur (%) |
| `BrakePedal` | boolean | Frein appuyé |
| `BrakePedalPos` | real | Pression frein |
| `CruiseSetSpeed` | real | Vitesse cruise control (mph) |
| `LateralAcceleration` | real | Accélération latérale (m/s²) |
| `LongitudinalAcceleration` | real | Accélération longitudinale (m/s²) |
| `LifetimeEnergyUsed` | real | Énergie totale consommée (kWh) |

### 2.3 Localisation

| Champ | Type | Description |
|-------|------|-------------|
| `Location` | lat/lng | Position GPS actuelle |
| `GpsHeading` | real | Direction (0-360°) |
| `GpsState` | boolean | GPS verrouillé |
| `DestinationLocation` | lat/lng | Destination navigation |
| `DestinationName` | string | Nom destination |
| `MilesToArrival` | real | Distance restante (miles) |
| `MinutesToArrival` | real | Temps restant (min) |
| `RouteLine` | polyline | Tracé route (base64) |
| `OriginLocation` | lat/lng | Point de départ |
| `LocatedAtHome` | boolean | À domicile |
| `LocatedAtWork` | boolean | Au travail |
| `LocatedAtFavorite` | boolean | Lieu favori |

### 2.4 Climat

| Champ | Type | Description |
|-------|------|-------------|
| `InsideTemp` | real | Température intérieure (°C) |
| `OutsideTemp` | real | Température extérieure (°C) |
| `HvacPower` | enum | État HVAC (On/Off) |
| `HvacFanSpeed` | int | Vitesse ventilation |
| `HvacLeftTemperatureRequest` | real | Consigne gauche (°C) |
| `HvacRightTemperatureRequest` | real | Consigne droite (°C) |
| `HvacAutoMode` | enum | Mode auto actif |
| `ClimateKeeperMode` | enum | Mode (Off, Dog, Camp, Keep) |
| `DefrostMode` | enum | État dégivrage |
| `SeatHeaterLeft` | int | Siège chauffant gauche (0-3) |
| `SeatHeaterRight` | int | Siège chauffant droit (0-3) |
| `SeatHeaterRearLeft` | int | Siège arrière gauche (0-3) |
| `SeatHeaterRearRight` | int | Siège arrière droit (0-3) |
| `SeatHeaterRearCenter` | int | Siège arrière centre (0-3) |
| `ClimateSeatCoolingFrontLeft` | int | Ventilation siège gauche |
| `ClimateSeatCoolingFrontRight` | int | Ventilation siège droit |
| `HvacSteeringWheelHeatLevel` | int | Chauffage volant |
| `CabinOverheatProtectionMode` | enum | Protection surchauffe |

### 2.5 État du Véhicule

| Champ | Type | Description |
|-------|------|-------------|
| `DoorState` | string | Portes ouvertes (df, dr, pf, pr, ft, rt) |
| `Locked` | boolean | Véhicule verrouillé |
| `FdWindow` / `FpWindow` | enum | État fenêtres avant |
| `RdWindow` / `RpWindow` | enum | État fenêtres arrière |
| `SentryMode` | enum | Mode Sentinelle |
| `ValetModeEnabled` | boolean | Mode Valet |
| `SpeedLimitMode` | boolean | Limite vitesse active |
| `CurrentLimitMph` | real | Limite actuelle (mph) |
| `PinToDriveEnabled` | boolean | PIN pour conduire |
| `CenterDisplay` | enum | État écran central |
| `HomelinkNearby` | boolean | Homelink à proximité |
| `SoftwareUpdateVersion` | string | Version dispo |
| `SoftwareUpdateDownloadPercentComplete` | int | Téléchargement (%) |

### 2.6 Pneus & Service

| Champ | Type | Description |
|-------|------|-------------|
| `TpmsPressureFl` | real | Pression avant gauche (bar) |
| `TpmsPressureFr` | real | Pression avant droit (bar) |
| `TpmsPressureRl` | real | Pression arrière gauche (bar) |
| `TpmsPressureRr` | real | Pression arrière droit (bar) |
| `TpmsHardWarnings` | enum | Alertes critiques pneus |
| `TpmsSoftWarnings` | enum | Alertes mineures pneus |

### 2.7 Powertrain (Avancé)

| Champ | Type | Description |
|-------|------|-------------|
| `PackVoltage` | real | Voltage pack batterie (V) |
| `PackCurrent` | real | Courant pack (A) |
| `BrickVoltageMax/Min` | int | Voltage cellules |
| `ModuleTempMax/Min` | int | Température modules |
| `DiTorqueActualF/R` | real | Couple moteur (Nm) |
| `DiMotorCurrentF/R` | real | Courant moteur (A) |
| `DiStatorTempF/R` | real | Température stator (°C) |

### 2.8 Configuration Véhicule (Statique)

| Champ | Type | Description |
|-------|------|-------------|
| `VehicleName` | string | Nom personnalisé |
| `CarType` | enum | Modèle (Model 3, Y, S, X...) |
| `Trim` | string | Version (Long Range, Performance...) |
| `ExteriorColor` | string | Couleur extérieure |
| `WheelType` | string | Type de jantes |
| `ChargePort` | enum | Type port (CCS, NACS...) |
| `Version` | string | Version firmware |

### 2.9 Média

| Champ | Type | Description |
|-------|------|-------------|
| `MediaAudioVolume` | real | Volume (0-11) |
| `MediaPlaybackStatus` | enum | État (Playing, Paused...) |
| `MediaPlaybackSource` | string | Source (Spotify, Radio...) |
| `MediaNowPlayingTitle` | string | Titre en cours |
| `MediaNowPlayingArtist` | string | Artiste |
| `MediaNowPlayingAlbum` | string | Album |

---

## 3. Commandes Disponibles

Toutes les commandes requièrent le **Vehicle Command Protocol** avec signature cryptographique.

### 3.1 Verrouillage & Accès

| Commande | Description |
|----------|-------------|
| `door_lock` | Verrouiller le véhicule |
| `door_unlock` | Déverrouiller le véhicule |
| `actuate_trunk` (front) | Ouvrir/fermer coffre avant (frunk) |
| `actuate_trunk` (rear) | Ouvrir/fermer coffre arrière |
| `window_control` | Fenêtres (vent/close) |
| `sun_roof_control` | Toit ouvrant (stop/close/vent) |

### 3.2 Climatisation

| Commande | Description |
|----------|-------------|
| `auto_conditioning_start` | Démarrer climatisation |
| `auto_conditioning_stop` | Arrêter climatisation |
| `set_temps` | Définir température (conducteur/passager) |
| `remote_seat_heater_request` | Chauffage siège (position, niveau 0-3) |
| `remote_seat_cooler_request` | Ventilation siège |
| `remote_steering_wheel_heater_request` | Chauffage volant |
| `set_bioweapon_mode` | Mode Bioweapon (on/off) |
| `set_cabin_overheat_protection` | Protection surchauffe |
| `set_climate_keeper_mode` | Mode (Off/Keep/Dog/Camp) |
| `set_preconditioning_max` | Préconditionnement max |

### 3.3 Charge

| Commande | Description |
|----------|-------------|
| `charge_start` | Démarrer la charge |
| `charge_stop` | Arrêter la charge |
| `set_charge_limit` | Définir limite de charge (%) |
| `set_charging_amps` | Définir ampérage |
| `charge_max_range` | Charger à 100% |
| `charge_standard` | Charger au niveau standard |
| `charge_port_door_open` | Ouvrir port de charge |
| `charge_port_door_close` | Fermer port de charge |
| `add_charge_schedule` | Ajouter programmation charge |
| `remove_charge_schedule` | Supprimer programmation |
| `add_precondition_schedule` | Ajouter préchauffage programmé |
| `remove_precondition_schedule` | Supprimer préchauffage |

### 3.4 Sécurité

| Commande | Description |
|----------|-------------|
| `set_sentry_mode` | Activer/désactiver Sentinelle |
| `set_valet_mode` | Activer mode Valet + PIN |
| `reset_valet_pin` | Réinitialiser PIN Valet |
| `set_pin_to_drive` | Définir PIN pour conduire |
| `speed_limit_activate` | Activer limite vitesse |
| `speed_limit_set_limit` | Définir limite (mph) |
| `flash_lights` | Faire clignoter les phares |
| `honk_horn` | Klaxonner |
| `remote_start_drive` | Démarrage à distance |
| `trigger_homelink` | Déclencher Homelink (garage) |

### 3.5 Navigation & Média

| Commande | Description |
|----------|-------------|
| `navigation_request` | Envoyer adresse au GPS |
| `navigation_gps_request` | Envoyer coordonnées GPS |
| `navigation_sc_request` | Naviguer vers Supercharger |
| `media_toggle_playback` | Play/Pause |
| `media_next_track` | Piste suivante |
| `media_prev_track` | Piste précédente |
| `adjust_volume` | Ajuster volume |
| `remote_boombox` | Son externe (fart, ping) |

### 3.6 Système

| Commande | Description |
|----------|-------------|
| `wake_up` | Réveiller le véhicule |
| `set_vehicle_name` | Renommer le véhicule |
| `schedule_software_update` | Programmer mise à jour |
| `cancel_software_update` | Annuler mise à jour |

---

## 4. Fonctionnalités à Développer

### 4.1 Dashboard Principal

> 🎯 Vue d'ensemble temps réel de tous les véhicules avec indicateurs clés

- **Carte multi-véhicules** - position de tous les Tesla sur une carte
- **Cards véhicules** - batterie, état (garé/conduite/charge), verrouillage
- **Alertes actives** - charge terminée, batterie basse, pneus
- **Statistiques du jour** - km parcourus, énergie consommée, coût
- **Actions rapides** - verrouiller tous, préchauffer

### 4.2 Page Véhicule - Temps Réel

#### 4.2.1 Section Batterie & Charge

- Jauge batterie animée avec % et kWh restants
- Autonomie estimée / idéale / officielle
- Si en charge: puissance, temps restant, énergie ajoutée
- Graphique temps réel de la puissance de charge
- **Contrôles**: Start/Stop charge, modifier limite, modifier ampérage

#### 4.2.2 Section Climat

- Températures intérieure/extérieure
- Schéma véhicule avec sièges chauffants/ventilés cliquables
- Contrôle température avec slider
- **Boutons**: Climatisation, Dégivrage, Dog Mode, Camp Mode

#### 4.2.3 Section État Véhicule

- Schéma 3D/2D du véhicule avec portes/coffres/fenêtres
- État verrouillage avec bouton Lock/Unlock
- Boutons coffres (frunk, trunk)
- État Sentinelle avec toggle
- Pression pneus avec alertes visuelles

#### 4.2.4 Section Localisation

- Carte avec position actuelle
- Si en navigation: destination, ETA, tracé route
- Superchargers à proximité
- **Bouton**: Envoyer adresse au véhicule

### 4.3 Historique des Trajets

> 🎯 Enregistrement automatique de tous les trajets avec analyses détaillées

#### Liste des Trajets

- Calendrier avec trajets par jour
- Filtres: période, distance min, consommation
- Pour chaque trajet: date, départ→arrivée, distance, durée, consommation

#### Détail d'un Trajet

- Carte avec tracé GPS complet
- Graphique altitude sur le parcours
- Graphique vitesse dans le temps
- Graphique consommation instantanée (Wh/km)
- Graphique état de charge pendant le trajet
- Température intérieure/extérieure
- Statistiques: vitesse moyenne/max, consommation moyenne

#### Données Stockées par Trajet

| Donnée | Description |
|--------|-------------|
| `startTime` / `endTime` | Horodatage début/fin |
| `startLocation` / `endLocation` | Coordonnées + nom lieu |
| `startOdometer` / `endOdometer` | Kilométrage |
| `distance` | Distance parcourue (km) |
| `duration` | Durée (minutes) |
| `startBattery` / `endBattery` | Batterie début/fin (%) |
| `energyUsed` | Énergie consommée (kWh) |
| `avgConsumption` | Consommation moyenne (Wh/km) |
| `avgSpeed` / `maxSpeed` | Vitesses (km/h) |
| `avgOutsideTemp` | Température moyenne |
| `hvacUsed` | Climatisation utilisée |
| `routePolyline` | Tracé GPS encodé |
| `elevationGain` / `elevationLoss` | Dénivelé positif/négatif |

### 4.4 Historique des Charges

> 🎯 Suivi complet de toutes les sessions de charge avec calcul des coûts

#### Liste des Charges

- Calendrier/liste avec toutes les sessions
- Filtres: type (domicile, Supercharger, public), période
- Résumé: énergie totale, coût total, nombre de sessions

#### Détail d'une Charge

- Graphique puissance de charge dans le temps
- Graphique progression batterie
- Température batterie pendant la charge
- Carte avec localisation
- Coût calculé selon tarifs configurés

#### Données Stockées par Charge

| Donnée | Description |
|--------|-------------|
| `startTime` / `endTime` | Horodatage début/fin |
| `location` | Coordonnées + nom lieu |
| `chargerType` | Type (home, supercharger, destination, public) |
| `connectorType` | Connecteur (NACS, CCS, Type 2...) |
| `startBattery` / `endBattery` | Batterie début/fin (%) |
| `energyAdded` | Énergie ajoutée (kWh) |
| `rangeAdded` | Autonomie ajoutée (km) |
| `maxPower` / `avgPower` | Puissance max/moyenne (kW) |
| `duration` | Durée totale (minutes) |
| `cost` | Coût calculé ($) |
| `pricePerKwh` | Tarif appliqué ($/kWh) |
| `outsideTemp` | Température extérieure |
| `batteryTempStart` / `batteryTempEnd` | Température batterie |

#### Configuration des Tarifs

- **Tarif domicile**: $/kWh avec heures creuses/pleines
- **Tarif Supercharger**: Automatique via données Tesla
- **Tarifs personnalisés**: Par lieu (travail, parents, etc.)
- **Géofencing**: Appliquer automatiquement selon localisation

---

## 5. Statistiques Détaillées

> C'est la **valeur ajoutée principale** par rapport à l'application Tesla officielle.

### 5.1 Statistiques de Conduite

#### Journalières

| Statistique | Calcul |
|-------------|--------|
| `distanceTotal` | Somme distances tous trajets |
| `drivingTime` | Somme durées trajets |
| `tripCount` | Nombre de trajets |
| `energyConsumed` | Somme énergie consommée (kWh) |
| `avgConsumption` | Wh/km moyen de la journée |
| `avgSpeed` | Vitesse moyenne |
| `maxSpeed` | Vitesse max atteinte |
| `idleTime` | Temps passé à l'arrêt moteur on |

#### Hebdomadaires

| Statistique | Calcul |
|-------------|--------|
| `distanceByDayOfWeek` | Distance par jour de semaine |
| `avgTripDistance` | Distance moyenne par trajet |
| `avgTripsPerDay` | Nombre moyen trajets/jour |
| `peakDrivingHours` | Heures de pointe (histogramme) |
| `weekendVsWeekday` | Comparaison weekend/semaine |

#### Mensuelles

| Statistique | Calcul |
|-------------|--------|
| `monthlyDistance` | Distance totale du mois |
| `monthlyEnergyUsed` | Énergie consommée (kWh) |
| `monthlyCost` | Coût total (trajets + charges) |
| `efficiencyTrend` | Évolution Wh/km vs mois précédent |
| `comparisonToAverage` | vs moyenne historique |
| `seasonalImpact` | Impact température sur conso |

#### Annuelles

| Statistique | Calcul |
|-------------|--------|
| `yearlyDistance` | Distance totale annuelle |
| `yearlyEnergyUsed` | Énergie totale (kWh) |
| `yearlyCost` | Coût total annuel |
| `co2Saved` | CO2 évité vs voiture thermique |
| `fuelEquivalent` | Équivalent litres essence |
| `moneySaved` | Économies vs voiture thermique |
| `efficiencyByMonth` | Graphique Wh/km par mois |
| `distanceByMonth` | Graphique km par mois |

### 5.2 Statistiques de Charge

#### Par Session

| Statistique | Description |
|-------------|-------------|
| `chargingEfficiency` | kWh batterie / kWh facturé |
| `avgChargingSpeed` | kW moyen pendant la session |
| `peakPower` | Puissance max atteinte |
| `timeToTarget` | Temps pour atteindre limite |
| `costPerKm` | Coût par km d'autonomie ajoutée |

#### Agrégées

| Statistique | Description |
|-------------|-------------|
| `totalEnergyCharged` | kWh total chargé (lifetime) |
| `totalChargingCost` | Coût total charges |
| `avgCostPerKwh` | Coût moyen $/kWh |
| `homeVsPublicRatio` | % charges domicile vs public |
| `superchargerUsage` | Fréquence utilisation SC |
| `avgChargingFrequency` | Jours entre charges |
| `preferredChargingTime` | Heure de charge préférée |
| `chargesByLocation` | Répartition par lieu |
| `chargesByDayOfWeek` | Répartition par jour |
| `monthlyChargingCost` | Évolution coût mensuel |

### 5.3 Statistiques Batterie

| Statistique | Description |
|-------------|-------------|
| `batteryDegradation` | Capacité actuelle vs neuve (%) |
| `degradationTrend` | Évolution dégradation dans le temps |
| `avgDailyUsage` | % batterie utilisé par jour |
| `depthOfDischarge` | Profondeur de décharge moyenne |
| `chargingHabits` | Distribution % charge début/fin |
| `timeSpentCharging` | Heures passées à charger |
| `optimalRangeUsage` | Temps passé entre 20-80% |
| `fullChargeCount` | Nombre de charges à 100% |
| `lowBatteryEvents` | Nombre de passages sous 10% |

### 5.4 Statistiques Efficacité

| Statistique | Description |
|-------------|-------------|
| `lifetimeEfficiency` | Wh/km moyen depuis toujours |
| `efficiencyByTemp` | Wh/km par tranche de température |
| `efficiencyBySpeed` | Wh/km par tranche de vitesse |
| `efficiencyByHvac` | Impact climatisation sur conso |
| `efficiencyTrend` | Évolution dans le temps |
| `bestEfficiencyTrip` | Trajet le plus efficace |
| `worstEfficiencyTrip` | Trajet le moins efficace |
| `winterVsSummer` | Comparaison hiver/été |
| `highwayVsCity` | Comparaison autoroute/ville |
| `epaComparison` | vs autonomie EPA officielle |

### 5.5 Statistiques Environnementales

| Statistique | Calcul |
|-------------|--------|
| `co2Avoided` | kg CO2 évité vs voiture essence |
| `treesEquivalent` | Équivalent arbres plantés |
| `fuelNotUsed` | Litres essence économisés |
| `moneySavedVsGas` | $ économisés vs essence |
| `moneySavedVsDiesel` | $ économisés vs diesel |
| `greenEnergyRatio` | % charges énergie verte (si dispo) |

**Paramètres configurables:**
- Prix essence local ($/L)
- Consommation voiture équivalente (L/100km)
- Facteur émission CO2 local (g/kWh)

### 5.6 Statistiques Utilisation

| Statistique | Description |
|-------------|-------------|
| `totalOdometer` | Kilométrage total |
| `odometerByYear` | Km parcourus par an |
| `avgDailyDistance` | Distance moyenne par jour |
| `daysUsed` | Jours avec utilisation |
| `usageRate` | % jours utilisé |
| `longestTrip` | Plus long trajet |
| `longestDayDistance` | Plus grande distance en 1 jour |
| `sentryModeUsage` | Heures Sentinelle activée |
| `climateUsage` | Heures climatisation |
| `softwareUpdates` | Nombre mises à jour installées |

### 5.7 Comparaisons & Benchmarks

- **vs Moyenne propriétaires Tesla**: Si données anonymisées disponibles
- **vs Mois précédent**: Toutes métriques
- **vs Même période année précédente**: Pour voir évolution
- **vs Objectifs personnels**: Configurables par l'utilisateur

---

## 6. Tarification API Tesla & Optimisations

> 🚨 **Section critique pour la viabilité économique de l'application.**

### 6.1 Grille Tarifaire Officielle

| Type de Requête | Coût Unitaire | Rate Limit | Recommandation |
|-----------------|---------------|------------|----------------|
| Streaming Signals | $0.000007 | N/A | ✅ **À PRIVILÉGIER** |
| Commands | $0.001 | 30/min/device | Usage modéré |
| Vehicle Data (REST) | $0.002 | 60/min/device | ❌ **À ÉVITER** |
| Vehicle Wake | $0.02 | 3/min/device | ⚠️ **MINIMISER** |
| Discount mensuel | -$10 | - | Par compte |

### 6.2 Comparaison des Coûts (Cas Réels Tesla)

**Étude de cas Tesla: Application consumer - Session de 30 minutes**

| Métrique | AVANT Optimisation | APRÈS Optimisation |
|----------|--------------------|--------------------|
| Device Data Requests | 384 requêtes | 0 requêtes |
| Commands | 4 commandes | 4 commandes |
| Wakes | 4 wakes | 1 wake |
| Streaming Signals | 0 signals | 300 signals |
| **COÛT TOTAL** | **$0.852** | **$0.026** |
| **ÉCONOMIE** | - | **97%** |

> ✅ **BEST PRACTICE**: Migrer vers Fleet Telemetry permet une réduction de coûts de 94-97% selon Tesla.

### 6.3 Estimation Coûts Mensuels

| Scénario | Coût/véhicule/mois | Note |
|----------|-------------------|------|
| Usage optimisé (streaming) | ~$0.30 | ✅ Recommandé |
| Usage mixte | ~$2-5 | Acceptable |
| Polling vehicle_data | ~$50+ | ❌ À ÉVITER |

> ✅ Avec le discount de $10/mois et une architecture optimisée, vous pouvez gérer **~30 véhicules sans frais supplémentaires**.

### 6.4 Protection Contre les Factures Excessives

> ⚠️ **ATTENTION**: Si le billing limit est dépassé, l'accès API est suspendu ET les configurations Fleet Telemetry sont **SUPPRIMÉES** (non restaurées automatiquement).

1. **Configurer un billing limit**: Par défaut = 0. Définir une limite réaliste.
2. **Configurer une méthode de paiement**: Obligatoire depuis février 2025.
3. **Monitorer l'usage**: Alerte email à 80% du limit.
4. **Implémenter un tracking interne**: Compter les requêtes côté application.

### 6.5 Règles d'Optimisation Implémentées

1. **Fleet Telemetry exclusivement** - Pas de polling vehicle_data
2. **Vérifier connectivité avant action** - Via cache événements telemetry
3. **minimum_delta sur champs numériques** - Évite signaux pour micro-changements
4. **Vérifier virtual key avant commande** - Via cache fleet_status
5. **Tracking interne des coûts** - Alerte avant dépassement billing limit
6. **Analyser erreurs avant retry** - Ne pas re-envoyer commande rejetée

### 6.6 Rate Limits à Respecter

| Type | Limite | Scope |
|------|--------|-------|
| Realtime Data | 60 req/min | Par device, par compte |
| Wakes | 3 req/min | Par device, par compte |
| Device Commands | 30 req/min | Par device, par compte |
| Auth Token Refresh | 20 req/sec | Par application |

> ⚠️ Si plusieurs applications du même compte interagissent avec le même véhicule, les limites sont **PARTAGÉES**.

---

## 7. Modèle de Données (Prisma)

```prisma
// ==================== UTILISATEURS ====================
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  passwordHash    String
  name            String?
  role            Role      @default(USER)
  teslaToken      TeslaToken?
  vehicles        Vehicle[]
  preferences     UserPreferences?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum Role { USER ADMIN }

model UserPreferences {
  id                    String  @id @default(cuid())
  userId                String  @unique
  user                  User    @relation(fields: [userId], references: [id])
  
  // Unités
  distanceUnit          String  @default("km")      // km ou miles
  temperatureUnit       String  @default("celsius") // celsius ou fahrenheit
  currencyCode          String  @default("CAD")
  
  // Tarifs électricité
  homeElectricityRate   Float   @default(0.10)      // $/kWh
  homePeakRate          Float?                       // Heures pleines
  homeOffPeakRate       Float?                       // Heures creuses
  peakHoursStart        Int?                         // 7 = 7h
  peakHoursEnd          Int?                         // 23 = 23h
  
  // Comparaison thermique
  gasPrice              Float   @default(1.50)      // $/L
  equivalentCarMpg      Float   @default(8.0)       // L/100km
  co2FactorGasoline     Float   @default(2.31)      // kg CO2/L
  co2FactorElectricity  Float   @default(0.5)       // kg CO2/kWh (varie par région)
  
  // Notifications
  notifyChargeComplete  Boolean @default(true)
  notifyLowBattery      Boolean @default(true)
  lowBatteryThreshold   Int     @default(20)
  notifyTirePressure    Boolean @default(true)
}

// ==================== TESLA AUTH ====================
model TeslaToken {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  accessToken     String    @db.Text  // Chiffré AES-256
  refreshToken    String    @db.Text  // Chiffré AES-256
  expiresAt       DateTime
  scopes          String[]
  region          String    @default("na")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ==================== VÉHICULES ====================
model Vehicle {
  id                    String    @id @default(cuid())
  teslaId               String    @unique
  vin                   String    @unique
  userId                String
  user                  User      @relation(fields: [userId], references: [id])
  
  // Infos statiques
  displayName           String?
  carType               String?   // Model 3, Model Y, etc.
  trim                  String?   // Long Range, Performance, etc.
  exteriorColor         String?
  wheelType             String?
  year                  Int?
  
  // État Fleet API
  virtualKeyPaired      Boolean   @default(false)
  commandProtocolReq    Boolean   @default(true)
  firmwareVersion       String?
  telemetryVersion      String?
  fleetStatusUpdatedAt  DateTime?
  
  // Données batterie (pour calcul dégradation)
  originalRange         Float?    // Autonomie neuve (km)
  batteryCapacity       Float?    // Capacité nominale (kWh)
  
  // Relations
  telemetrySnapshots    TelemetrySnapshot[]
  driveSessions         DriveSession[]
  chargeSessions        ChargeSession[]
  dailyStats            DailyStats[]
  monthlyStats          MonthlyStats[]
  chargingLocations     ChargingLocation[]
  apiUsage              ApiUsage[]
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

// ==================== TÉLÉMÉTRIE ====================
model TelemetrySnapshot {
  id              String    @id @default(cuid())
  vehicleId       String
  vehicle         Vehicle   @relation(fields: [vehicleId], references: [id])
  timestamp       DateTime
  
  // Batterie
  batteryLevel    Float?
  energyRemaining Float?
  estRange        Float?
  
  // Localisation
  latitude        Float?
  longitude       Float?
  heading         Float?
  
  // Conduite
  speed           Float?
  odometer        Float?
  gear            String?
  
  // Climat
  insideTemp      Float?
  outsideTemp     Float?
  hvacPower       Boolean?
  
  // État
  locked          Boolean?
  sentryMode      Boolean?
  
  // Charge (si en charge)
  chargeState     String?
  chargePower     Float?
  chargeAmps      Float?
  chargerVoltage  Float?
  
  @@index([vehicleId, timestamp])
}

// ==================== SESSIONS DE CONDUITE ====================
model DriveSession {
  id                  String    @id @default(cuid())
  vehicleId           String
  vehicle             Vehicle   @relation(fields: [vehicleId], references: [id])
  
  // Temporel
  startTime           DateTime
  endTime             DateTime?
  duration            Int?      // minutes
  
  // Localisation
  startLatitude       Float
  startLongitude      Float
  startLocationName   String?
  endLatitude         Float?
  endLongitude        Float?
  endLocationName     String?
  routePolyline       String?   @db.Text
  
  // Distance
  startOdometer       Float
  endOdometer         Float?
  distance            Float?    // km
  
  // Énergie
  startBattery        Float     // %
  endBattery          Float?    // %
  startEnergy         Float?    // kWh
  endEnergy           Float?    // kWh
  energyUsed          Float?    // kWh
  
  // Statistiques calculées
  avgSpeed            Float?    // km/h
  maxSpeed            Float?    // km/h
  avgConsumption      Float?    // Wh/km
  
  // Conditions
  avgOutsideTemp      Float?
  hvacUsed            Boolean   @default(false)
  
  // Élévation
  elevationGain       Float?    // m
  elevationLoss       Float?    // m
  
  // Données détaillées (JSON)
  speedProfile        Json?     // [{timestamp, speed}, ...]
  consumptionProfile  Json?     // [{timestamp, consumption}, ...]
  elevationProfile    Json?     // [{distance, elevation}, ...]
  
  @@index([vehicleId, startTime])
}

// ==================== SESSIONS DE CHARGE ====================
model ChargeSession {
  id                  String    @id @default(cuid())
  vehicleId           String
  vehicle             Vehicle   @relation(fields: [vehicleId], references: [id])
  
  // Temporel
  startTime           DateTime
  endTime             DateTime?
  duration            Int?      // minutes
  
  // Localisation
  latitude            Float?
  longitude           Float?
  locationId          String?
  location            ChargingLocation? @relation(fields: [locationId], references: [id])
  locationName        String?
  
  // Type de charge
  chargerType         String?   // home, supercharger, destination, public, work
  connectorType       String?   // NACS, CCS, Type2, etc.
  
  // Batterie
  startBattery        Float     // %
  endBattery          Float?    // %
  startEnergy         Float?    // kWh
  endEnergy           Float?    // kWh
  
  // Énergie
  energyAdded         Float?    // kWh
  rangeAdded          Float?    // km
  
  // Puissance
  maxPower            Float?    // kW
  avgPower            Float?    // kW
  
  // Coût
  pricePerKwh         Float?    // $/kWh
  totalCost           Float?    // $
  
  // Conditions
  outsideTemp         Float?
  batteryTempStart    Float?
  batteryTempEnd      Float?
  
  // Données détaillées
  powerProfile        Json?     // [{timestamp, power, batteryLevel}, ...]
  
  @@index([vehicleId, startTime])
  @@index([locationId])
}

// ==================== LIEUX DE CHARGE ====================
model ChargingLocation {
  id              String    @id @default(cuid())
  vehicleId       String
  vehicle         Vehicle   @relation(fields: [vehicleId], references: [id])
  
  name            String
  latitude        Float
  longitude       Float
  radius          Int       @default(100)  // mètres pour géofencing
  
  locationType    String    // home, work, supercharger, public, other
  pricePerKwh     Float?    // Tarif par défaut
  
  // Tarification avancée (domicile)
  hasPeakPricing  Boolean   @default(false)
  peakPrice       Float?
  offPeakPrice    Float?
  peakHoursStart  Int?
  peakHoursEnd    Int?
  
  chargeSessions  ChargeSession[]
  
  @@unique([vehicleId, latitude, longitude])
}

// ==================== STATISTIQUES JOURNALIÈRES ====================
model DailyStats {
  id              String    @id @default(cuid())
  vehicleId       String
  vehicle         Vehicle   @relation(fields: [vehicleId], references: [id])
  date            DateTime  @db.Date
  
  // Conduite
  distanceKm      Float     @default(0)
  tripCount       Int       @default(0)
  drivingMinutes  Int       @default(0)
  
  // Énergie conduite
  energyUsedKwh   Float     @default(0)
  avgConsumption  Float?    // Wh/km
  
  // Vitesse
  avgSpeed        Float?
  maxSpeed        Float?
  
  // Charge
  chargeCount     Int       @default(0)
  energyAddedKwh  Float     @default(0)
  chargingMinutes Int       @default(0)
  chargingCost    Float     @default(0)
  
  // Batterie
  startBattery    Float?    // % au début de journée
  endBattery      Float?    // % en fin de journée
  minBattery      Float?    // % minimum atteint
  maxBattery      Float?    // % maximum atteint
  
  // Climat
  avgOutsideTemp  Float?
  hvacMinutes     Int       @default(0)
  
  // Odomètre
  startOdometer   Float?
  endOdometer     Float?
  
  @@unique([vehicleId, date])
  @@index([vehicleId, date])
}

// ==================== STATISTIQUES MENSUELLES ====================
model MonthlyStats {
  id              String    @id @default(cuid())
  vehicleId       String
  vehicle         Vehicle   @relation(fields: [vehicleId], references: [id])
  year            Int
  month           Int       // 1-12
  
  // Conduite
  distanceKm      Float     @default(0)
  tripCount       Int       @default(0)
  drivingHours    Float     @default(0)
  
  // Énergie
  energyUsedKwh   Float     @default(0)
  avgConsumption  Float?    // Wh/km
  
  // Charge
  chargeCount     Int       @default(0)
  energyAddedKwh  Float     @default(0)
  chargingHours   Float     @default(0)
  chargingCost    Float     @default(0)
  homeChargeKwh   Float     @default(0)
  publicChargeKwh Float     @default(0)
  superchargeKwh  Float     @default(0)
  
  // Efficacité
  efficiency      Float?    // Wh/km
  
  // Environnement
  co2Avoided      Float?    // kg
  fuelSaved       Float?    // L
  moneySaved      Float?    // $
  
  // Comparaisons
  vsLastMonth     Float?    // % différence distance
  vsLastYear      Float?    // % différence distance
  
  @@unique([vehicleId, year, month])
  @@index([vehicleId, year, month])
}

// ==================== TRACKING COÛTS API ====================
model ApiUsage {
  id                  String    @id @default(cuid())
  vehicleId           String?
  vehicle             Vehicle?  @relation(fields: [vehicleId], references: [id])
  date                DateTime  @db.Date
  
  streamingSignals    Int       @default(0)
  commands            Int       @default(0)
  vehicleDataCalls    Int       @default(0)
  wakes               Int       @default(0)
  
  estimatedCost       Decimal   @db.Decimal(10, 4)
  
  @@unique([vehicleId, date])
  @@index([date])
}
```

---

## 8. Stack Technique

### 8.1 Frontend

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Framework | Next.js 14+ (App Router) | SSR, routing, optimisations |
| UI Library | React 18+ | Composants, hooks, Suspense |
| Styling | Tailwind CSS + shadcn/ui | Responsive, composants accessibles |
| State Management | Zustand + React Query | État global + cache API |
| Charts | Recharts | Visualisations performantes |
| Maps | Leaflet | Localisation véhicule (gratuit) |
| Real-time | Socket.io client | Connexion WebSocket |
| PWA | next-pwa | Installation, offline |

### 8.2 Backend

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Runtime | Node.js 20 LTS | Écosystème, performance |
| Framework | NestJS | Structure, TypeScript natif |
| ORM | Prisma | Type-safe, migrations |
| Auth | Passport.js + JWT | Sessions, OAuth |
| Real-time | Socket.io server | WebSocket bidirectionnel |
| Queue | BullMQ + Redis | Jobs asynchrones |
| Fleet Telemetry | tesla/fleet-telemetry | Server Go officiel Tesla |
| Command Proxy | tesla/vehicle-command | HTTP proxy Go officiel |

### 8.3 Infrastructure

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Database | PostgreSQL 16 | JSONB, TimescaleDB optionnel |
| Cache/Queue | Redis 7 | Sessions, BullMQ, état connectivité |
| Conteneurs | Docker + Docker Compose | Dev local standardisé |
| Orchestration | Kubernetes (OVH Managed) | Production scalable |
| Secrets | OVH Secret Manager | Clé privée Tesla sécurisée |
| Reverse Proxy | Traefik | TLS pour Fleet Telemetry |
| Monitoring | Prometheus + Grafana | Métriques + billing tracking |

---

## 9. Roadmap de Développement

### Phase 1 - Infrastructure (2 semaines)

- [ ] Setup monorepo (Turborepo), Docker Compose
- [ ] Déployer Fleet Telemetry server (Go) + tesla-http-proxy
- [ ] Module Auth (users + OAuth Tesla)
- [ ] Module Connectivity (état véhicules)
- [ ] Module Billing (tracking usage)
- [ ] Schema Prisma complet

### Phase 2 - Core Features (3 semaines)

- [ ] Module Vehicles (avec cache fleet_status)
- [ ] Module Telemetry (WebSocket vers clients)
- [ ] Frontend: Dashboard principal
- [ ] Frontend: Page véhicule temps réel
- [ ] Détection automatique trajets/charges

### Phase 3 - Commandes (2 semaines)

- [ ] Module Commands avec pre-checks complets
- [ ] Frontend: Panel de contrôle véhicule
- [ ] Notifications push

### Phase 4 - Historique (3 semaines)

- [ ] Module History (trajets, charges)
- [ ] Frontend: Liste et détail trajets
- [ ] Frontend: Liste et détail charges
- [ ] Configuration tarifs électricité
- [ ] Lieux de charge avec géofencing

### Phase 5 - Statistiques (3 semaines)

- [ ] Calcul DailyStats automatique (job nocturne)
- [ ] Calcul MonthlyStats
- [ ] Dashboard statistiques complet
- [ ] Statistiques environnementales
- [ ] Export données (CSV, PDF)

### Phase 6 - Admin & Polish (2 semaines)

- [ ] Module Admin (users, système)
- [ ] Dashboard coûts API
- [ ] PWA complète (offline, install)
- [ ] Tests E2E
- [ ] Documentation utilisateur

---

## 10. Structure du Projet

```
teslavault/
├── apps/
│   ├── web/                          # Frontend Next.js
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── tesla-callback/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx              # Dashboard principal
│   │   │   │   ├── vehicles/
│   │   │   │   │   ├── page.tsx          # Liste véhicules
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx      # Temps réel
│   │   │   │   │       ├── trips/        # Historique trajets
│   │   │   │   │       ├── charges/      # Historique charges
│   │   │   │   │       ├── stats/        # Statistiques
│   │   │   │   │       └── controls/     # Commandes
│   │   │   │   ├── stats/
│   │   │   │   │   ├── page.tsx          # Stats globales
│   │   │   │   │   ├── efficiency/
│   │   │   │   │   ├── costs/
│   │   │   │   │   └── environment/
│   │   │   │   └── settings/
│   │   │   │       ├── profile/
│   │   │   │       ├── preferences/
│   │   │   │       └── tariffs/
│   │   │   └── (admin)/
│   │   │       ├── users/
│   │   │       └── system/
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui
│   │   │   ├── vehicle/
│   │   │   │   ├── VehicleCard.tsx
│   │   │   │   ├── BatteryGauge.tsx
│   │   │   │   ├── VehicleSchema.tsx
│   │   │   │   ├── ClimateControls.tsx
│   │   │   │   └── ChargeControls.tsx
│   │   │   ├── charts/
│   │   │   │   ├── ConsumptionChart.tsx
│   │   │   │   ├── ChargePowerChart.tsx
│   │   │   │   ├── EfficiencyTrend.tsx
│   │   │   │   └── CostBreakdown.tsx
│   │   │   ├── maps/
│   │   │   │   ├── VehicleMap.tsx
│   │   │   │   └── TripMap.tsx
│   │   │   └── stats/
│   │   │       ├── StatCard.tsx
│   │   │       ├── ComparisonWidget.tsx
│   │   │       └── EnvironmentImpact.tsx
│   │   ├── hooks/
│   │   │   ├── useVehicle.ts
│   │   │   ├── useTelemetry.ts
│   │   │   ├── useTrips.ts
│   │   │   ├── useCharges.ts
│   │   │   └── useStats.ts
│   │   └── lib/
│   │       ├── api.ts
│   │       └── socket.ts
│   │
│   └── api/                          # Backend NestJS
│       └── src/
│           ├── modules/
│           │   ├── auth/
│           │   │   ├── auth.module.ts
│           │   │   ├── auth.controller.ts
│           │   │   ├── auth.service.ts
│           │   │   ├── tesla-oauth.service.ts
│           │   │   └── strategies/
│           │   ├── users/
│           │   ├── vehicles/
│           │   │   ├── vehicles.module.ts
│           │   │   ├── vehicles.controller.ts
│           │   │   ├── vehicles.service.ts
│           │   │   └── fleet-status.service.ts
│           │   ├── connectivity/
│           │   │   ├── connectivity.module.ts
│           │   │   ├── connectivity.service.ts
│           │   │   └── connectivity.gateway.ts
│           │   ├── telemetry/
│           │   │   ├── telemetry.module.ts
│           │   │   ├── telemetry.gateway.ts
│           │   │   ├── telemetry.service.ts
│           │   │   ├── fleet-telemetry.adapter.ts
│           │   │   └── processors/
│           │   │       ├── drive.processor.ts
│           │   │       └── charge.processor.ts
│           │   ├── commands/
│           │   │   ├── commands.module.ts
│           │   │   ├── commands.controller.ts
│           │   │   ├── commands.service.ts
│           │   │   └── pre-command.guard.ts
│           │   ├── history/
│           │   │   ├── history.module.ts
│           │   │   ├── trips.controller.ts
│           │   │   ├── trips.service.ts
│           │   │   ├── charges.controller.ts
│           │   │   └── charges.service.ts
│           │   ├── stats/
│           │   │   ├── stats.module.ts
│           │   │   ├── stats.controller.ts
│           │   │   ├── stats.service.ts
│           │   │   ├── daily-stats.job.ts
│           │   │   └── monthly-stats.job.ts
│           │   ├── billing/
│           │   │   ├── billing.module.ts
│           │   │   ├── billing.service.ts
│           │   │   └── billing.interceptor.ts
│           │   └── admin/
│           ├── common/
│           │   ├── guards/
│           │   ├── interceptors/
│           │   └── decorators/
│           └── prisma/
│               └── schema.prisma
│
├── packages/
│   ├── shared/                       # Types partagés
│   │   ├── types/
│   │   │   ├── vehicle.ts
│   │   │   ├── telemetry.ts
│   │   │   ├── trip.ts
│   │   │   ├── charge.ts
│   │   │   └── stats.ts
│   │   └── constants/
│   └── tesla-client/                 # Client API Tesla
│       ├── api.ts
│       └── types.ts
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   └── Dockerfile.telemetry
│   ├── kubernetes/
│   │   ├── api/
│   │   ├── web/
│   │   ├── telemetry/
│   │   ├── postgres/
│   │   └── redis/
│   └── terraform/
│
├── docker-compose.yml                # Dev local
├── docker-compose.prod.yml
├── turbo.json
└── package.json
```

---

## 11. Checklist Claude Code

### 11.1 Avant Chaque Requête Tesla API

- [ ] Endpoint gratuit? (`GET /vehicles` = gratuit)
- [ ] Donnée disponible via Fleet Telemetry? → Ne pas appeler `vehicle_data`
- [ ] Véhicule online? → Vérifier via cache connectivité
- [ ] Virtual key présente? → Vérifier via cache `fleet_status`
- [ ] Rate limit OK? → Vérifier compteur interne
- [ ] Billing limit OK? → Vérifier compteur usage
- [ ] Incrémenter compteur après requête

### 11.2 Détection Automatique Sessions

**Trajet (DriveSession):**
- **Début**: Gear passe de P à R/D
- **Fin**: Gear revient à P pendant > 2 minutes
- **Capturer**: Location, Odometer, Battery, Speed à intervalles réguliers

**Charge (ChargeSession):**
- **Début**: `DetailedChargeState` passe à 'Charging'
- **Fin**: `DetailedChargeState` passe à 'Complete' ou 'Stopped'
- **Capturer**: Power, Voltage, Amps, BatteryLevel à intervalles réguliers

### 11.3 Formules Clés

```typescript
// Consommation moyenne (Wh/km)
const avgConsumption = (energyUsedKwh * 1000) / distanceKm;

// Efficacité de charge
const chargingEfficiency = energyAddedToBattery / energyFromGrid;

// CO2 évité (kg)
const co2Avoided = distanceKm * (
  (gasCarConsumption / 100) * co2PerLiterGas - 
  (electricConsumption / 1000) * co2PerKwhElectric
);

// Équivalent essence (L) - 1L essence ≈ 9.7 kWh
const fuelEquivalent = energyUsedKwh / 9.7;

// Économies vs essence ($)
const moneySaved = 
  (distanceKm / 100 * gasCarConsumption * gasPrice) - 
  (energyUsedKwh * electricityPrice);

// Dégradation batterie (%)
const degradation = 100 - (currentMaxRange / originalMaxRange * 100);

// Coût par km ($)
const costPerKm = totalChargingCost / totalDistanceKm;
```

### 11.4 Configuration Fleet Telemetry Optimisée

```json
{
  "hostname": "telemetry.yourdomain.com",
  "port": 443,
  "fields": {
    "Location": { 
      "interval_seconds": 10,
      "minimum_delta": 10
    },
    "Soc": { 
      "interval_seconds": 60,
      "minimum_delta": 1
    },
    "VehicleSpeed": { 
      "interval_seconds": 1,
      "minimum_delta": 1
    },
    "InsideTemp": { 
      "interval_seconds": 60,
      "minimum_delta": 0.5
    },
    "DetailedChargeState": { "interval_seconds": 1 },
    "DoorState": { "interval_seconds": 1 },
    "Locked": { "interval_seconds": 1 },
    "Odometer": { 
      "interval_seconds": 60,
      "minimum_delta": 0.1
    }
  },
  "alert_types": ["connectivity"]
}
```

### 11.5 Ressources

- **Billing & Limits**: https://developer.tesla.com/docs/fleet-api/billing-and-limits
- **Best Practices**: https://developer.tesla.com/docs/fleet-api/getting-started/best-practices
- **Fleet Telemetry**: https://github.com/teslamotors/fleet-telemetry
- **Vehicle Command**: https://github.com/teslamotors/vehicle-command
- **Available Data**: https://developer.tesla.com/docs/fleet-api/fleet-telemetry/available-data

---

## Licence

MIT License - Voir [LICENSE](LICENSE)

---

*Document généré pour le développement avec Claude Code - TeslaVault v3.0*
