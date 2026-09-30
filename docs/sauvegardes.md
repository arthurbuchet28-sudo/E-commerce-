# Sauvegardes et restauration

Ce document décrit ce qui est sauvegardé, où, comment restaurer, et comment vérifier qu'une
sauvegarde est utilisable. **Une sauvegarde qui n'a jamais été restaurée n'est pas une
sauvegarde** : faites l'exercice de restauration une fois par trimestre (section 5).

## 1. Ce qui est sauvegardé

| Élément                                           | Où il vit                                   | Sauvegarde                                     |
| ------------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Code, guides, glossaire, textes des leçons        | Dépôt GitHub                                | L'historique Git (chaque commit)               |
| Comptes, commandes, factures, progression, quiz   | Base Supabase (Francfort)                   | Supabase (quotidienne) + sauvegarde chiffrée   |
| Fichiers PDF des formations (bucket `ressources`) | Supabase Storage                            | Sauvegarde chiffrée (`BACKUP_INCLUDE_FILES=1`) |
| Vidéos des formations                             | Bunny Stream                                | Conservez les fichiers originaux hors ligne    |
| Abonnés newsletter                                | Base Supabase (Brevo n'en est qu'une copie) | Comme la base                                  |

À savoir (documentation Supabase, consultée le 30/09/2026 :
<https://supabase.com/docs/guides/platform/backups>) :

- les sauvegardes quotidiennes automatiques existent à partir de l'offre **Pro** (conservées
  7 jours ; 14 jours en Team) ; l'offre gratuite n'en a pas ;
- elles **ne contiennent pas les fichiers** du Storage (seulement leurs métadonnées) : d'où le
  script `scripts/storage-files.mjs` ;
- la restauration d'une sauvegarde Supabase rend le projet inaccessible pendant l'opération ;
- la restauration à la minute près (PITR) est une option payante.

## 2. La sauvegarde chiffrée hebdomadaire

En plus de Supabase, une copie indépendante est faite chaque dimanche par GitHub Actions
(`.github/workflows/sauvegarde.yml`) : base de données (rôles, schéma, données) et fichiers des
formations, dans une archive **chiffrée avec [age](https://age-encryption.org)**. GitHub ne voit
que l'archive chiffrée ; elle est conservée 90 jours dans l'onglet _Actions_ du dépôt.

### Mise en place (une fois)

1. Installez `age`, puis créez la paire de clés **sur votre ordinateur** :
   `age-keygen -o premiere-vente-sauvegarde.key`. La ligne `# public key: age1…` est la clé
   publique.
2. Rangez le fichier `.key` (clé privée) **hors ligne, en deux exemplaires** (clé USB dans un
   tiroir + gestionnaire de mots de passe). Sans elle, les sauvegardes sont illisibles ; avec
   elle, elles contiennent toutes les données personnelles du site.
3. Dans GitHub : _Settings → Environments → New environment_ « production », puis ajoutez les
   secrets :
   - `SUPABASE_DB_URL` : Supabase → _Connect_ → _Session pooler_ (chaîne `postgresql://…`,
     mot de passe inclus) ;
   - `BACKUP_AGE_RECIPIENT` : la clé publique `age1…` ;
   - `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (pour les fichiers).
4. Lancez le workflow « Sauvegarde » à la main (_Actions → Sauvegarde → Run workflow_) et
   vérifiez qu'une archive `.tar.age` apparaît.

### À la main, depuis votre ordinateur

```bash
export SUPABASE_DB_URL="postgresql://…"      # Supabase > Connect > Session pooler
export BACKUP_AGE_RECIPIENT="age1…"          # votre clé publique
BACKUP_INCLUDE_FILES=1 pnpm backup:db        # archive dans ./backups (jamais versionnée)
```

Le script a besoin de Docker (pour `supabase db dump`) et de `age`. Les fichiers en clair sont
effacés dès l'archive chiffrée écrite, même en cas d'erreur.

### Durée de conservation

Les sauvegardes contiennent des comptes supprimés entre-temps : elles doivent donc avoir une
durée limitée, indiquée dans le registre des traitements. Proposition : 90 jours pour les
archives GitHub, 7 jours pour Supabase Pro [À VALIDER — durée de conservation des sauvegardes].
Si vous téléchargez une archive, supprimez-la quand elle n'est plus utile.

## 3. Restaurer

### Cas 1 — revenir en arrière de quelques jours (erreur de manipulation)

Supabase → _Database → Backups_ → choisir le jour → _Restore_. Le site est indisponible
pendant l'opération. Les commandes payées depuis ce jour-là sont perdues dans la base : notez
avant l'heure de la sauvegarde choisie, puis retrouvez les paiements récents dans le tableau de
bord Stripe (le webhook peut être rejoué depuis Stripe : _Developers → Webhooks → Événements →
Renvoyer_).

### Cas 2 — nouveau projet à partir d'une archive chiffrée (perte du projet)

1. Créez un projet Supabase **vide** dans la région Francfort ; créez le bucket privé
   `ressources` (_Storage → New bucket_, non public).
2. Placez-vous sur la version du code de la sauvegarde : le script vous indique le commit s'il
   ne correspond pas (`git checkout <commit>`).
3. Restaurez :

   ```bash
   export SUPABASE_DB_URL="postgresql://…"                   # le NOUVEAU projet
   export NEXT_PUBLIC_SUPABASE_URL="https://….supabase.co"   # le NOUVEAU projet (fichiers)
   export SUPABASE_SERVICE_ROLE_KEY="…"                      # le NOUVEAU projet (fichiers)
   scripts/restore-db.sh premiere-vente-AAAAMMJJ-HHMM.tar.age premiere-vente-sauvegarde.key
   ```

   Le script demande de retaper le nom du serveur cible, applique les migrations du dépôt
   (schéma, sécurité, fonctions), charge les données puis renvoie les fichiers PDF.

4. Reconfigurez le nouveau projet comme la première fois (docs/mise-en-production.md, section
   Supabase : adresse du site, e-mails, modèles) et mettez à jour les variables Vercel
   (`NEXT_PUBLIC_SUPABASE_URL`, clés), puis redéployez.
5. Faites les vérifications de la section 4.

Pourquoi les migrations et pas le fichier `schema.sql` de l'archive ? Un export Supabase
n'inclut pas ce que le site crée dans les schémas gérés par Supabase, en particulier le
déclencheur qui crée le profil d'un membre à l'inscription. Sans lui, après restauration, plus
personne ne pourrait s'inscrire ni acheter. `schema.sql` reste dans l'archive pour
comparaison.

## 4. Vérifier une restauration

- `/statut` : tout est « Opérationnel ».
- Connexion avec un compte existant, ouverture d'une formation achetée, téléchargement d'une
  facture et d'une ressource PDF.
- Un achat de test (mode test Stripe sur un environnement de test) : la facture suivante porte
  le numéro qui suit la dernière facture restaurée (numérotation sans trou).
- `/admin` : les chiffres du tableau de bord correspondent à ceux d'avant.

## 5. Exercice de restauration (trimestriel)

Restaurez la dernière archive dans un projet Supabase de test (jamais dans la production),
faites les vérifications ci-dessus, puis supprimez le projet de test. Notez l'exercice ici.

| Date       | Archive                           | Cible                        | Résultat                                                                                                                                                                                                                                           |
| ---------- | --------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 30/09/2026 | Base locale (données de test e2e) | Supabase local vidé (Docker) | ✅ Comptes, commandes, factures, inscriptions, attestations identiques ; 38 politiques RLS et 37 fonctions recréées ; tests RLS verts ; achat, compte et back-office testés ; factures numérotées à la suite. Fichiers PDF : aller-retour vérifié. |

## 6. En cas d'incident

Fuite ou perte de données personnelles : voir la section « Violations de données » de
`docs/registre-traitements.md` (notification à la CNIL si nécessaire).
