

export const fr = {
  navigation: {
    home: "Accueil",
    englishLang: "Anglais",
    spanishLang: "Espagnol",
    frenchLang: "Français",
    login: "Connexion",
    signup: "Inscription",
    logout: "Déconnexion",
    profile: "Profil",
    chat: "Chat",
    newChat: "Nouveau chat"
  },

  messages: {
    info: {
      waitCode: "Veuillez attendre avant de demander un autre code",
    },
    error: {
      no2FA: "Aucune vérification 2FA en attente",
      noVerification: "Aucune vérification en attente",
      failedToSend: "Échec de l'envoi du code 2FA",
      failedToSendVerification: "Échec de l'envoi du code de vérification",
      failedToUpdateUser: "Échec de la mise à jour du nom d'utilisateur. Veuillez réessayer.",
      failedtoUpdate2FA: "Échec de la mise à jour de l'authentification à deux facteurs. Veuillez réessayer.",
      confirmPermanency: "Veuillez confirmer que vous comprenez que cette action est permanente",
      errorOccurred: "Une erreur s'est produite. Veuillez réessayer.",
    },
    success: {
      newCode: "Nouveau code 2FA envoyé à votre e-mail",
      newVerificationCode: "Nouveau code de vérification envoyé à votre e-mail",
      userUpdated: "Utilisateur mis à jour avec succès!",
      twoFactorMessage: {
        title: "Authentification à Deux Facteurs",
        enable: "activée",
        disable: "désactivée",
        success: " avec succès!",
      },
      deleteAccount: "Compte supprimé avec succès. Vous serez redirigé vers la page d'accueil.",
      successVerified: "Compte vérifié avec succès! Vous pouvez maintenant vous connecter.",
      passReset: "Réinitialisation du mot de passe réussie! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      currentPassNeeded: "Le mot de passe actuel est requis",
      resetToken: "Token de réinitialisation envoyé à votre e-mail. Veuillez vérifier votre boîte de réception.",
    }
  },

  home: {
    gameContainer: {
      quickMatch: {
        title: "MATCH RAPIDE",
        subtitle: "Lancez-vous instantanément"
      },
      tournament: {
        title: "TOURNOI",
        subtitle: "Participez aux tournois"
      }
    },
    chat: {
      header: "Chat de jeu",
      newChatButton: "Nouveau chat"
    }
  },

  chat: {
    header: "Chat",
    newChat: {
      title: "Créer un nouveau chat",
      subtitle: "Démarrez une nouvelle conversation avec vos amis",
      usernameLabel: "Entrez le nom d'utilisateur",
      usernamePlaceholder: "Entrez le nom d'utilisateur de votre ami",
      createButton: "Créer un chat"
    },
    chatUsers: "Utilisateurs du chat",
    generalChat: "Chat général",
    welcome: "Bienvenue dans le chat général ! Démarrez une conversation.",
    sendButton: "Envoyer",
    noMessages: "Aucun message pour l'instant. Démarrez la conversation !",
    inputPlaceholder: "Écrivez un message...",
    blockedPlaceholder: "Le chat est bloqué.",
    blockBtn: "Bloquer l'utilisateur",
    unblockBtn: "Débloquer l'utilisateur",
    blocked: "BLOQUÉ",
    usersBtn: "Utilisateurs",
    notifications: {
      newMessage: "Nouveau message dans le chat avec",
      success: {
        chatCreated: "Chat créé avec succès",
        chatCreatedWith: "Chat créé avec",
      },
      error:{
        searchingUser: "Erreur lors de la recherche de l'utilisateur dans la liste d'amis",
        userNotFound: "Utilisateur non trouvé dans la liste d'amis",
        creatingChat: "Impossible de créer le chat",
        emptyUsername: "Le nom d'utilisateur ne peut pas être vide",
        network: "Erreur réseau",
      }
    }
  },

  notifications: {
    userBlocked: "a été bloqué",
    userUnblocked: "a été débloqué",
    missingToken: "Token CSRF manquant",
    blockedBy: "Vous êtes bloqué par",
    youCant: "Vous ne pouvez pas leur envoyer de messages.",
    unblockedBy: "Vous avez été débloqué par",
    youCan: "Vous pouvez maintenant leur envoyer des messages.",
  },

  auth: {
    login: {
      title: "Bon retour",
      subtitle: "Connectez-vous à votre compte PONG",
      email: "E-mail",
      password: "Mot de passe",
      rememberMe: "Se souvenir de moi",
      forgotPassword: "Mot de passe oublié ?",
      submitButton: "Se connecter",
      noAccount: "Pas de compte ?",
      signupLink: "Inscrivez-vous ici",
      google: "Continuer avec Gugul"
    },
    signup: {
      title: "Rejoindre PONG",
      subtitle: "Créez votre compte et commencez à jouer",
      username: "Nom d'utilisateur",
      usernamePlaceholder: "Choisissez un nom d'utilisateur",
      email: "E-mail",
      emailPlaceholder: "Entrez votre e-mail",
      password: "Mot de passe",
      passwordPlaceholder: "Créez un mot de passe",
      confirmPassword: "Confirmez le mot de passe",
      confirmPasswordPlaceholder: "Confirmez votre mot de passe",
      displayName: "Nom affiché",
      submitButton: "Créer un compte",
      hasAccount: "Vous avez déjà un compte ?",
      loginLink: "Connectez-vous ici",
      or: "ou",
    },
    profile: {
      title: "Profil",
      displayName: "Nom affiché",
      email: "E-mail",
      twoFactorAuth: "Authentification à deux facteurs",
      enable: "Activer",
      disable: "Désactiver"
    },
    verifyYourAccount: {
      title: "Vérifiez votre compte",
      subtitle: "Entrez le code à 6 chiffres envoyé à votre e-mail",
      verificationCode: "Code de vérification",
      zero: "000000",
      verifyButton: "Vérifier le compte",
      resendCode: "Renvoyer le code",
      backToSignup: "← Retour à l'inscription",
      didntReceiveCode: "Vous n'avez pas reçu le code ?",
      messages: {
        please: "Veuillez vérifier votre compte avec le code envoyé à votre e-mail",
        loginFailed: "Échec de la connexion. Veuillez réessayer.",
        invalidCode: "Code invalide. Veuillez réessayer.",
        accountCreated: "Compte créé ! Veuillez vérifier votre e-mail pour le code de vérification.",
      },
    },
    termsAndServices: {
      warning: "Vous devez accepter les Conditions d'utilisation et la Politique de confidentialité pour créer un compte",
      agree: "J'accepte les",
      terms: "Conditions d'utilisation",
      and: "et",
      privacy: "Politique de confidentialité",
      termsText: {
        title: "Conditions d'utilisation",
        one: {
          title: "1. Acceptation des conditions",
          content: "En accédant et en utilisant PONG, vous acceptez d'être lié par les termes de cet accord.",
        },
        two: {
          title: "2. Règles du jeu",
          content: "Les joueurs doivent respecter le fair-play. Tricher, exploiter des bugs ou un comportement antisportif peut entraîner une suspension.",
        },
        three: {
          title: "3. Responsabilité du compte",
          content: "Vous êtes responsable de la confidentialité de votre compte et mot de passe et des activités effectuées sous votre compte.",
        },
        four: {
          title: "4. Conduite interdite",
          content: "Les utilisateurs ne peuvent pas harceler, spammer ou perturber l'expérience de jeu des autres.",
        },
        five: {
          title: "5. Résiliation",
          content: "Nous nous réservons le droit de suspendre les comptes violant ces conditions sans préavis.",
        },
      },
      policyText: {
        title: "Politique de confidentialité",
        one: {
          title: "1. Informations collectées",
          content: "Nous collectons les informations que vous fournissez lors de la création d'un compte (nom d'utilisateur, e-mail, statistiques).",
        },
        two: {
          title: "2. Utilisation des informations",
          content: "Nous les utilisons pour fournir, maintenir et améliorer nos services, y compris matchmaking et classements.",
        },
        three: {
          title: "3. Partage des informations",
          content: "Nous ne vendons ni ne transférons vos données personnelles sans consentement, sauf comme prévu ici.",
        },
        four: {
          title: "4. Sécurité des données",
          content: "Nous appliquons des mesures appropriées pour protéger vos informations d'accès ou divulgation non autorisés.",
        },
        five: {
          title: "5. Contact",
          content: "Questions ? Contactez-nous à transcendence.42malaga@gmail.com",
        },
      },
    },
  },

  doubleFactor: {
    title: "Authentification à Deux Facteurs",
    enter: "Entrez le code à 6 chiffres envoyé à votre e-mail",
    verification: "Code de Vérification",
    verify: "Vérifier le Code",
    didntReceive: "Vous n'avez pas reçu le code ?",
    resendCode: "Renvoyer le Code",
    backLogin: "← Retour à la Connexion",
    sending: "Envoi en cours...",
  },

forgotPassword: {
    title: "Réinitialiser le mot de passe",
    subTitle: "Entrez votre adresse e-mail et nous vous enverrons un code de réinitialisation.",
    emailPlaceholder: "Entrez votre e-mail",
    sendResetTokenButton: "Envoyer le code de réinitialisation",
    backToLogin: "Retour à la connexion",
    rememberPassword: "Vous vous souvenez de votre mot de passe ?",
    didntReceive: "Vous n'avez pas reçu le code ?",
    tryAgain: "Réessayer",
    resetPassword: {
      title: "Réinitialiser le mot de passe",
      subtitle: "Entrez le code de réinitialisation de votre e-mail et votre nouveau mot de passe.",
      tokenLabel: "Code de réinitialisation",
      enterToken: "Entrez le code de réinitialisation de l'e-mail",
      button: "Réinitialiser le mot de passe",
    },
    newPassword: {
      title: "Nouveau mot de passe",
      placeholder: "Entrez un nouveau mot de passe",
      confirm: "Confirmer le nouveau mot de passe",
      confirmPlaceholder: "Confirmer le nouveau mot de passe",
    },
  },

  errors: {
    network: "Erreur de connexion. Veuillez réessayer.",
    invalidCredentials: "E-mail ou mot de passe invalide",
    userNotFound: "Utilisateur introuvable",
    emailRequired: "L'e-mail est requis",
    passwordRequired: "Le mot de passe est requis",
    passwordTooShort: "Le mot de passe doit comporter au moins 6 caractères",
    game: {
      conexion: 'Impossible de se connecter. Veuillez vérifier votre session et réessayer.',
      notConnected: "Pas encore connecté. Cela sera tenté lors de la création de la salle...",
      notCreated: 'Impossible de créer la salle. Veuillez réessayer.',
      tryAgain: 'Impossible de se connecter. Veuillez réessayer.',
      notStarted: 'Impossible de démarrer la partie. Veuillez vérifier le code et réessayer.'
    },
  },

  success: {
    loginSuccess: "Bon retour !",
    signupSuccess: "Compte créé avec succès !",
    profileUpdated: "Profil mis à jour avec succès",
    chatCreated: "Chat créé avec succès"
  },

  game: {
    header: "Arène de jeu",
    backGameArena: "Retour à l'Arène de jeu",
    backButton: "← Retour à l'accueil",
    mainButton: "← Retour au menu principal",
    backToOnlineModes: "Retour aux Modes en Ligne",
    backToConfig: "Retour à la Configuration",
    joined: "Rejoint ! En attente de démarrer...",
    joining: "Rejoindre...",
    initializing: "Initialisation",
    game: " partie",
    settingUp: "Configuration locale en cours",
    match: " match",
    localGameInProgress: "Configuration de la partie locale en cours",
    common: {
      onevsoneTitle: "⚔️ Configuration 1 vs 1",
      twovstwoTitle: "👥 Configuration 2 vs 2",
      configTitle: "🎯 Difficulté du jeu",
      scoreLimitTitle: "🏆 Limite de score",
      playUntil: "Jouer jusqu'à",
      pointToWin: " pour gagner",
      point: "point",
      points: "points",
      completed: "terminé",
      player: "Joueur",
      pause: "Pause",
      numeric: "Numérique",
      startGameButton: "🎮 Lancer la partie",
      wins: "gagne!",
      win: "victoire!",
      reset: "Appuyez sur 🔄 Réinitialiser pour rejouer",
      resetBtn: "Réinitialiser",
      playerLetter: "J",
      getReady: "Préparez-vous !",
      gamePaused: "⏸️ JEU EN PAUSE",
      resume: "Appuyez sur P pour reprendre",
      createMatch: "🛠️ Créer une Partie",
      createMatchDescription: "Créer une salle avec une difficulté et une limite de score comme en local 1v1.",
      createOneVsOneMatchButton: "Créer une Partie 1 vs 1",
      configuredGame: {
        configuration: "Configuration de la partie en cours",
        loading: "Chargement...",
        starting: "Démarrage",
        game: " de la partie...",
        settingUp: "Configuration du match avec",
        difficulty: "difficulté jusqu'à",
      }
    },
    localGame: {
      title: "Jeu local",
      game: " Partie",
      type: "Local",
      subtitle: "Jouez avec des amis sur le même appareil. Parfait pour des tournois et sessions décontractées.",
      backButton: "← Retour au menu local",
      onevsoneButton: {
        title: "1 vs 1",
        subtitle: "Match classique face à face sur le même appareil.",
      },
      onevsAIButton: {
        title: "1 vs IA",
        subtitle: "Affrontez notre IA intelligente. Parfait pour s'entraîner.",
      },
      twovstwoButton: {
        title: "2 vs 2",
        subtitle: "Faites équipe et affrontez un autre duo dans une bataille épique.",
      },
    },
    onlineGame: {
      title: "Jeu en ligne",
      subtitle: "Affrontez des joueurs du monde entier. Grimper dans les classements.",
      backToMenu: "Retour au menu en ligne",
      backToOneVsOneMenu: "Retour au menu 1 vs 1",
      joinMatch: {
        title: "Rejoindre une Partie",
        subtitle: "Rejoignez une partie avec un code de salle.",
        secondTitle: "Rejoindre une Partie 1 vs 1",
        join: "Rejoindre",
      },
      waitingPlayer: "En attente d'un autre joueur...",
      roomCode: "Partagez ce code de salle :",
      enterRoomCode: "Entrez le Code de Salle",
      roomNotFound: "Salle non trouvée.",
      roomFull: "La salle est pleine.",
      searchingForOpponents: "Recherche d'adversaires...",
      playersFound: "Joueurs trouvés:",
      onevsoneButton: {
        title: "1 vs 1 En ligne",
        description: "Duel en ligne classique contre un autre joueur du monde entier.",
      },
      chooseFriend: {
        button: "Choisir un ami",
        title: "🎮 Choisir un ami à inviter",
        placeHolder: "Rechercher par nom d'utilisateur...",
        searchBtn: "🔍 Rechercher des amis",
      },
    },
    ai: {
      config: "🤖 1 vs IA Configuration",
      difficultyTitle: "🎯 IA Difficulté",
      difficulties: {
        easy: {
          title: "IA Facile",
          description: "Réactions lentes, taux d'erreur élevé - Parfait pour les débutants",
        },
        medium: {
          title: "IA Moyenne",
          description: "Style de jeu équilibré - Bon défi pour la plupart des joueurs",
        },
        hard: {
          title: "IA Difficile",
          description: "Réactions rapides, peu d'erreurs - Réservé aux experts",
        },
      },
      about: "🤖 À propos de l'IA",
      aboutDescription: "Notre IA simule le comportement humain avec des temps de réaction réalistes et des erreurs occasionnelles. La difficulté affecte la vitesse de réaction, la précision et les capacités de prédiction.",
      challenge: "🚀 Défi IA",
    },
    twovstwo: {
      gameControlTitle: "🎮 Commandes de jeu",
      team: "Équipe",
      name: " Nom",
      team1Placeholder: "Équipe Gauche",
      team2Placeholder: "Équipe Droite",
    },
    difficulty: {
      easy: {
        title: "Facile",
        nextTitle: "facile",
        description: "Vitesse lente - Idéal pour débutants",
      },
      medium: {
        title: "Moyen",
        nextTitle: "moyen",
        description: "Vitesse normale - Parfait pour la plupart des joueurs",
      },
      hard: {
        title: "Difficile",
        nextTitle: "difficile",
        description: "Vitesse élevée - Pour experts",
      },
     },
    onevsAi: "1 vs IA",
    automatic: "IA : Automatique",
    startingGame: "Démarrage du jeu 1 vs 1",
    startingTwo: "Démarrage du jeu 2 vs 2",
    startingThree: "Démarrage du jeu 1 vs IA",
    aiCal: "Calibration de l'IA en cours",
    aiTitle: "IA",
    you: "Vous",
    opponent: "Adversaire",
    matchFinished: "Match terminé",
    waiting: "En attente que l'adversaire reprenne",
    controls: "Controls",
    online: "Créer ou Rejoindre une partie pour démarrer 1v1 en ligne",
  },
  google: {
    title: "Connexion avec Google...",
    subtitle: "Veuillez patienter pendant que nous complétons votre connexion.",
    loginFailed: "Échec de la connexion. Veuillez réessayer.",
    loginSuccess: "Connexion réussie ! Redirection...",
    verifying: "Vérification de l'authentification...",
    failedAuth: "Échec de l'authentification. Veuillez réessayer.",
    requiring2FA: "2FA requis. Redirection vers la vérification...",
    errorMsg: "Ce compte Google est déjà lié à un compte existant. Connectez-vous avec votre mot de passe ou réinitialisez-le.",
  },

tournament: {
    startMessage: "Salut ! Un tournoi a commencé !",
    title: "Tournoi",
    leaveTournament: {
      confirm: "⚠️ Êtes-vous sûr ?",
      warning: "Les données du tournoi seront perdues si vous quittez cette page.",
      refresh: "Les données du tournoi seront perdues si vous actualisez cette page.",
      stayButton: "Rester dans le tournoi",
      leaveButton: "Quitter le tournoi",
      note: "Remarque : L'utilisation du bouton de rechargement du navigateur peut afficher une confirmation supplémentaire.",
    },
    numberLimit: "Le tableau n'est pas pris en charge pour ce nombre de participants",
    bracket: {
      title: "Tableau du tournoi",
      participants: "👥 Participants",
      bracket:  "📊 Tableau",
      difficulty: "Difficulté",
      scoreLimit: "Limite de score",
      singleEli: "Le tableau à élimination simple sera affiché ici.",
    },
    configTitle: "Configuration du tournoi",
    numberParticipants: "Nombre de participants",
    participantsMsg: "le tournoi prend en charge 2, 4 ou 8 joueurs",
    startButton: "🎮 Démarrer le tournoi",
    starting: "Démarrage du match de tournoi...",
    match: "Match",
    startGame: "Démarrer la partie",
    round: "Manche",
    playingTo: "Jouer jusqu'à",
    difficulty: "difficulté",
    difficultyUpTo: "difficulté jusqu'à",
    gameConfigProgress: "Configuration de la partie en cours",
    matchResult: "🏆 Résultat du match",
    winner: "Gagnant",
    defeated: "a vaincu",
    restartTournament: "Redémarrer le Tournoi",
    nextMatch: "Match Suivant",
    whoWon: "Qui a gagné ?",
    tWinner: "Gagnant du Tournoi",
    final: "Tableau Final du Tournoi",
    completed: "Match du tournoi terminé",
    gamePause: "Jeu en pause - Appuyez sur P pour reprendre",
    cantd: "Le nombre de joueurs doit être de 2, 4 ou 8.",
  },

  profile: {
    noUserPage: {
      title: " Profil non disponible ",
      please: "Veuillez",
      login: "vous connecter",
      toView: "pour voir votre profil."
    },
    wins: "Victoires",
    losses: "Défaites",
    recentMatches: "Matchs Récents",
    loadingMatches: "Chargement des matchs...",
    noMatches: "Aucun match joué pour le moment. Commencez à jouer pour construire votre historique !",
    social: "Social",
    searchUsers: "🔍 Rechercher des Utilisateurs",
    searchPlaceholder: "Rechercher par nom d'utilisateur...",
    noFriends: "Vous n'avez pas encore d'amis.",
    myFriends: "🤝 Mes Amis",
    loadFriendList: "Chargement de la liste d'amis...",
    failedFriendRequest: "Erreur lors du chargement des demandes d'ami",
    failedFriendsList: "Erreur lors du chargement de la liste d'amis",
    noFriendRequests: "Aucune demande d'ami en attente",
    friendRequests: "👥 Demandes d'Amitié",
    loadRequests: "Chargement des demandes...",
    searching: "Recherche...",
    noUsers: "Aucun utilisateur trouvé.",
    acceptButton: "✅ Accepter",
    rejectButton: "❌ Rejeter",
    accountSettings: {
      title: "Paramètres du Compte",
      changePassword: {
        title: "🔒 Changer le Mot de Passe",
        currentPassword: "Mot de Passe Actuel",
        newPassword: "Nouveau Mot de Passe",
        confirmNewPassword: "Confirmer le Nouveau Mot de Passe",
        saveButton: "Sauvegarder les Modifications"
      },
      twoAuthentication: {
        title: "🛡️ Authentification à Deux Facteurs",
        currentStatus: "État Actuel:",
        enable: "Activé",
        disable: "Désactivé",
        enabled: "activé",
        disabled: "désactivé",
        currently: "L'authentification à deux facteurs est actuellement",
        enableAccount: "pour votre compte. Vous recevrez un code de vérification par e-mail lors de la connexion.",
        disableAccount: "Activez-le pour ajouter une couche de sécurité supplémentaire à votre compte.",
        disabledButton: "🔓 Désactiver 2FA",
        enabledButton: "🔒 Activer 2FA",
      },
      deleteAccount: {
        title: "🗑️ Supprimer le Compte",
        cantBeUndone: "Cette action ne peut pas être annulée!",
        warningTitle: "La suppression de votre compte supprimera définitivement:",
        profileInformation: "Votre profil et vos informations personnelles",
        gameStatistics: "Toutes les statistiques de jeu et l'historique des matchs",
        achievements: "Vos réalisations et votre progression",
        preferences: "Toutes les préférences enregistrées",
        confirmChoices: "Êtes-vous absolument sûr de vouloir supprimer votre compte?",
        understand: "Je comprends que cette action est permanente et ne peut pas être annulée",

      },
      messages: {
        passUpdated: "Mot de passe mis à jour avec succès!",
        currentPassNeeded: "Le mot de passe actuel est requis",
        failedUpdate: "Échec de la mise à jour du mot de passe. Veuillez réessayer.",
        passRequired: "Le mot de passe est requis",
        passLength: "Le mot de passe doit comporter au moins 8 caractères",
        passCharacters: "Le mot de passe doit inclure des majuscules, des minuscules et des chiffres",
        confirmPass: "Veuillez confirmer votre mot de passe",
        passMismatch: "Les mots de passe ne correspondent pas",
        userRequired: "Le nom d'utilisateur est requis",
        userLength: "Le nom d'utilisateur doit comporter au moins 3 caractères",
        userCharacters: "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des tirets bas",
        verificationCodeRequired: "Le code de vérification est requis",
        verificationCodeLength: "Le code doit comporter 6 chiffres",
        verificationCodeNumbers: "Le code ne peut contenir que des chiffres",
        teamName: "Le nom de l'équipe doit comporter 1 à 7 lettres uniquement",
      },
    },
    messages: {
      usernameUpdated: "Nom d'utilisateur mis à jour avec succès!",
      failedUpdate: "Échec de la mise à jour du nom d'utilisateur. Veuillez réessayer.",
      twoFactorAuth: {
        title: "Authentification à Deux Facteurs",
        enable: "activée",
        disable: "désactivée",
        success: " avec succès!",
      },
      failedTwoFactor: "Échec de la mise à jour de l'authentification à deux facteurs. Veuillez réessayer."
    },
  },

  publicProfile: {
    loading: "Chargement du profil...",
    removeFriend: "❌ Supprimer l'ami",
    friendRequestSent: "📤 Demande d'ami envoyée",
    acceptRequest: "✅ Accepter la demande",
    reject: "❌ Rejeter",
    addFriend: "➕ Ajouter un ami",
    noMatches: "Aucune partie jouée pour le moment.",
    errorLoading: {
      title: "Erreur lors du chargement du profil",
      subtitle: "Impossible de charger le profil de l'utilisateur. L'utilisateur peut ne pas exister ou il y a eu une erreur serveur.",
    }
  },

  common: {
    loading: "Chargement...",
    save: "Sauvegarder",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    confirm: "Confirmer",
    back: "← Retour",
    next: "Suivant",
    submit: "Envoyer"
  }
}

export type TranslationKeysFR = typeof fr