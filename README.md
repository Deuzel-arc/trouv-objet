# TROUV'OBJET — démo fonctionnelle de test

Démo front-end statique en français. Toutes les données sont fictives ou créées localement par la personne qui teste.

## Ouvrir la démo
https://deuzel-arc.github.io/trouv-objet/

## Parcours à tester
1. **Acheteur** : publier une recherche avec objet, budget, état, ville et mode de réception.
2. **Vendeur** : consulter les recherches compatibles, ajouter un ou plusieurs objets via des photos, confirmer chaque fiche et proposer un prix.
3. **Offres** : consulter les propositions, enregistrer son intérêt ou masquer une proposition. Le glissement horizontal fonctionne aussi : droite = intéressé, gauche = masquer (confirmation demandée).
4. **Réinitialiser** : le bouton dans l'onglet Offres remet les exemples de départ et efface les données locales de la démo.

## Données et confidentialité
- Trois objets, une recherche et trois offres fictifs sont chargés au premier lancement.
- Les ajouts, recherches, propositions et intérêts sont enregistrés uniquement dans le stockage local du navigateur.
- Les photos sont redimensionnées avant stockage. Le stockage du navigateur reste limité ; en cas de saturation, réduire le nombre ou la taille des photos.
- Aucun compte réel, annonce publique, contact vendeur, achat, paiement ou notification externe n'existe dans cette démo.
- L'assistance de saisie photo n'est pas une reconnaissance IA : le nom proposé vient du nom du fichier et doit être vérifié par la personne qui vend.
- L'état d'un objet est une déclaration du vendeur, pas une évaluation automatique.

## Limites techniques
Cette version est un prototype mono-appareil : les données ne sont pas synchronisées entre utilisateurs ou téléphones. Les correspondances sont des règles simples sur le nom, le budget, l'état, la ville et le mode de réception. Il n'y a pas encore de serveur, de comptes, de messagerie, d'IA de reconnaissance ni de paiement.

## Développement
Le site est publié avec GitHub Pages depuis la branche principale. Les fichiers principaux sont `index.html`, `styles.css` et `app.js`.
