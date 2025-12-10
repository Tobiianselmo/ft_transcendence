export const en = {
  navigation: {
    home: "Home",
    englishLang: "English",
    spanishLang: "Spanish",
    frenchLang: "French",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    profile: "Profile",
    chat: "Chat",
    newChat: "New Chat"
  },

  messages: {
    info: {
      waitCode: "Please wait before requesting another code",
    },
    error: {
      no2FA: "No pending 2FA verification found",
      noVerification: "No pending verification found",
      failedToSend: "Failed to resend 2FA code",
      failedToSendVerification: "Failed to resend verification code",
      failedToUpdateUser: "Failed to update username. Please try again.",
      failedtoUpdate2FA: "Failed to update Two-Factor Authentication. Please try again.",
      confirmPermanency: "Please confirm that you understand this action is permanent",
      errorOccurred: "An error occurred. Please try again.",
    },
    success: {
      newCode: "New 2FA code sent to your email",
      newVerificationCode: "New verification code sent to your email",
      userUpdated: "User updated successfully!",
      twoFactorMessage: {
        title: "Two-Factor Authentication",
        enable: "enabled",
        disable: "disabled",
        success: " successfully!",
      },
      deleteAccount: "Account deleted successfully. You will be redirected to the home page.",
      successVerified: "Account verified successfully! You can now log in.",
      passReset: "Password reset successfully! You can now log in with your new password.",
      currentPassNeeded: "Current password is required",
      resetToken: "Reset token sent to your email. Please check your inbox.",
    }
  },

  home: {
    gameContainer: {
      quickMatch: {
        title: "QUICK MATCH",
        subtitle: "Jump into a game instantly"
      },
      tournament: {
        title: "TOURNAMENT",
        subtitle: "Compete in tournaments"
      }
    },
    chat: {
      header: "Game Chat",
      newChatButton: "New Chat"
    }
  },

  chat: {
    header: "Chat",
    newChat: {
      title: "Create New Chat",
      subtitle: "Start a new conversation with your friends",
      usernameLabel: "Enter Username",
      usernamePlaceholder: "Enter the username of your friend",
      createButton: "Create Chat"
    },
    chatUsers: "Chat Users",
    generalChat: "General Chat",
    welcome: "Welcome to the general chat! Start a conversation.",
    sendButton: "Send",
    noMessages: "No messages yet. Start the conversation!",
    inputPlaceholder: "Write a message...",
    blockedPlaceholder: "Chat is blocked.",
    blockBtn: "Block User",
    unblockBtn: "Unblock User",
    blocked: "BLOCKED",
    usersBtn: "Users",
    notifications: {
      newMessage: "New message in chat with",
      success: {
        chatCreated: "Chat created successfully",
        chatCreatedWith: "Chat created with",
      },
      error:{
        searchingUser: "Username doesn't exist in friend list",
        userNotFound: "User not found in friend list",
        creatingChat: "Could not create chat",
        emptyUsername: "Username cannot be empty",
        network: "Network error",
      }
    }
  },

  notifications: {
    userBlocked: "has been blocked",
    userUnblocked: "has been unblocked",
    missingToken: "Missing CSRF token",
    blockedBy: "You are blocked by",
    youCant: "You cannot send messages to them.",
    unblockedBy: "You have been unblocked by",
    youCan: "You can now send messages to them.",
  },

   
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to your PONG account",
      email: "Email",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      submitButton: "Sign In",
      noAccount: "Don't have an account?",
      signupLink: "Sign up here",
      google: "Continue with Google"
    },
    signup: {
      title: "Join PONG",
      subtitle: "Create your account and start playing",
      username: "Username",
      usernamePlaceholder: "Choose a username",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password", 
      passwordPlaceholder: "Create a password",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      displayName: "Display Name",
      submitButton: "Create Account",
      hasAccount: "Already have an account?",
      loginLink: "Log in",
      or: "or",
    },
    profile: {
      title: "Profile",
      displayName: "Display Name",
      email: "Email",
      twoFactorAuth: "Two-Factor Authentication",
      enable: "Enable",
      disable: "Disable"
    },
    verifyYourAccount: {
      title: "Verify Your Account",
      subtitle: "Enter the 6-digit code sent to your email",
      verificationCode: "Verification Code",
      zero: "000000",
      verifyButton: "Verify Account",
      resendCode: "Resend Code",
      backToSignup: "← Back to Sign Up",
      didntReceiveCode: "Didn't receive the code?",
      messages: {
        please: "Please verify your account with the code sent to your email",
        loginFailed: "Login failed. Please try again.",
        invalidCode: "Invalid code. Please try again.",
        accountCreated: "Account created! Please check your email for the verification code.",
      },
    },
    termsAndServices: {
      warning: "You must accept the Terms of Service and Privacy Policy to create an account",
      agree: "I agree to the",
      terms: "Terms of Service",
      and: "and",
      privacy: "Privacy Policy",
      termsText: {
        title: "Terms of Service",
        one: {
          title: "1. Acceptance of Terms",
          content: "By accessing and using PONG, you accept and agree to be bound by the terms and provision of this agreement.",
        },
        two: {
          title: "2. Game Rules",
          content: "Players must follow fair play guidelines. Cheating, exploiting bugs, or unsportsmanlike conduct may result in account suspension.",
        },
        three: {
          title: "3. Account Responsibility",
          content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.",
        },
        four: {
          title: "4. Prohibited Conduct",
          content: "Users may not engage in harassment, spam, or any behavior that disrupts the gaming experience for others.",          
        },
        five: {
          title: "5. Termination",
          content: "We reserve the right to terminate or suspend accounts that violate these terms without prior notice.",
        },
      },
      policyText: {
        title: "Privacy Policy",
        one: {
          title: "1. Information We Collect",
          content: "We collect information you provide directly to us, such as when you create an account, including username, email address, and game statistics.",
        },
        two: {
          title: "2. How We Use Your Information",
          content: "We use the information we collect to provide, maintain, and improve our services, including matchmaking and leaderboards.",
        },
        three: {
          title: "3. Information Sharing",
          content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.",
        },
        four: {
          title: "4. Data Security",
          content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
        },
        five: {
          title: "5. Contact Us",
          content: "If you have any questions about this Privacy Policy, please contact us at transcendence.42malaga@gmail.com",
        },
      },
    },
  },

  doubleFactor: {
    title: "Two-Factor Authentication",
    enter: "Enter the 6-digit code sent to your email",
    verification: "Verification Code",
    verify: "Verify Code",
    didntReceive: "Didn't receive the code?",
    resendCode: "Resend Code",
    backLogin: "← Back to Login",
    sending: "Sending...",
  },

  forgotPassword: {
    title: "Reset Password",
    subTitle: "Enter your email address and we'll send you a reset token.",
    emailPlaceholder: "Enter your email",
    sendResetTokenButton: "Send Reset Token",
    backToLogin: "Back to Login",
    rememberPassword: "Remember your password?",
    didntReceive: "Didn't receive the token? ",
    tryAgain: "Try again",
    resetPassword: {
      title: "Reset Password",
      subtitle: "Enter the reset token from your email and your new password.",
      tokenLabel: "Reset Token",
      enterToken: "Enter reset token from email",
      button: "Reset Password",
    },
    newPassword: {
      title: "New Password",
      placeholder: "Enter new password",
      confirm: "Confirm New Password",
      confirmPlaceholder: "Confirm new password",
    },
  },

   
  errors: {
    network: "Connection error. Please try again.",
    invalidCredentials: "Invalid email or password",
    userNotFound: "User not found",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    passwordTooShort: "Password must be at least 6 characters",
    game: {
      conexion: 'Could not connect. Please check your session and try again.',
      notConnected: "Not connected yet. It will be attempted when creating the room...",
      notCreated: 'Could not create the room. Please try again.',
      tryAgain: 'Could not connect. Please try again.',
      notStarted: 'Could not start the game. Please check the code and try again.'
    },
  },

   
  success: {
    loginSuccess: "Welcome back!",
    signupSuccess: "Account created successfully!",
    profileUpdated: "Profile updated successfully",
    chatCreated: "Chat created successfully"
  },
  
  game: {
    header: "Game Arena",
    backGameArena: "Back to Game Arena",
    backButton: "← Back to Home",
    mainButton: "← Back to Main Menu",
    backToOnlineModes: "← Back to Online Modes",
    backToConfig: "Back to Config",
    joined: "Joined! Waiting to start...",
    joining: "Joining...",
    initializing: "Initializing",
    game: " game",
    settingUp: "Setting up local",
    match: " match",
    localGameInProgress: "Local game setup in progress",
    common: {
      onevsoneTitle: "⚔️ 1 vs 1 Configuration",
      twovstwoTitle: "👥 2 vs 2 Configuration",
      configTitle: "🎯 Game Difficulty",
      scoreLimitTitle: "🏆 Score Limit",
      playUntil: "Play until",
      pointToWin: " to win",
      point: "point",
      points: "points",
      player: "Player",
      pause: "Pause",
      numeric: "Numeric",
      startGameButton: "🎮 Start Game",
      completed: "completed",
      win: "win!",
      wins: "wins!",
      reset: "Press 🔄 Reset to play again",
      resetBtn: "Reset",
      playerLetter: "P",
      getReady: "Get Ready!",
      gamePaused: "⏸️ GAME PAUSED",
      resume: "Press P to resume",
      createMatch: "🛠️ Create Match",
      createMatchDescription: "Create a room with difficulty and score limit like local 1v1.",
      createOneVsOneMatchButton: "Create 1 vs 1 Match",
      configuredGame: {
        configuration: "Game configuration in progress",
        loading: "Loading...",
        starting: "Starting",
        game: " game...",  
        settingUp: "Setting up match with",
        difficulty: "difficulty up to",
      }
    },
    localGame: {
      title: "Local Play",
      game: " Game",  
      type: "Local",
      subtitle: "Play with friends on the same device. Perfect for local tournaments and casual gaming sessions.",
      backButton: "← Back to Local Menu",
      
      onevsoneButton: {
        title: "1 vs 1",
        subtitle: "Classic head-to-head match between two players on the same device.",
      },
      onevsAIButton: {
        title: "1 vs AI",
        subtitle: "Challenge our intelligent AI opponent. Perfect for practice and skill improvement.",
      },
      twovstwoButton: {
        title: "2 vs 2",
        subtitle: "Team up with a friend and face another duo in an epic 4-player battle.",
      },
    },
    onlineGame: {
      title: "Online Play",
      subtitle: "Challenge players from around the world. Compete in ranked matches and climb the leaderboards.",
      backToMenu: "Back to Online Menu",
      backToOneVsOneMenu: "Back to 1 vs 1 Menu",
      joinMatch: {
        title: "Join Match",
        subtitle: "Join a match with a room code.",
        secondTitle: "Join 1 vs 1 Match",
        join: "Join",
      },
      waitingPlayer: "Waiting for another player...",
      roomCode: "Share this room code:",
      enterRoomCode: "Enter Room Code",
      roomNotFound: "Room not found.",
      roomFull: "Room is full.",
      searchingForOpponents: "Searching for opponents...",
      playersFound: "Players found:",
      onevsoneButton: {
        title: "1 vs 1 Online",
        description: "Classic online duel against another player from around the world.",
      },
      chooseFriend: {
        button: "Choose a Friend",
        title: "🎮 Choose a Friend to Invite",
        placeHolder: "Search by username...",
        searchBtn: "🔍 Search Friends",
      },
    },
    ai: {
      config: "🤖 1 vs AI Configuration",
      difficultyTitle: "🎯 AI Difficulty",
      difficulties: {
        easy: {
          title: "Easy AI",
          description: "Slow reactions, high error rate - Perfect for beginners",
        },
        medium: {
          title: "Medium AI",
          description: "Balanced play style - Good challenge for most players",
        },
        hard: {
          title: "Hard AI",
          description: "Fast reactions, low errors - Only for experts",
        },
      },
      about: "🤖 About the AI",
      aboutDescription: "Our AI simulates human behavior with realistic reaction times and occasional mistakes. The difficulty affects reaction speed, accuracy, and prediction capabilities.",
      challenge: "🚀 Challenge AI",
    },
    twovstwo: {
      gameControlTitle: "🎮 Game Controls",
      team: "Team",
      name: " Name",  
      team1Placeholder: "Left Team",
      team2Placeholder: "Right Team",
    },
    difficulty: {
      easy: {
        title: "Easy",
        nextTitle: "easy",
        description: "Slow speed - Ideal for beginners",
      },
      medium: {
        title: "Medium",
        nextTitle: "medium",
        description: "Normal speed - Perfect for most players",
      },
      hard: {
        title: "Hard",
        nextTitle: "hard",
        description: "High speed - Only for experts",
      },
    },
    onevsAi: "1 vs AI Game",
    automatic: "AI: Automatic",
    startingGame: "Starting 1 vs 1 game",
    startingTwo: "Starting 2 vs 2 game",
    startingThree: "Starting 1 vs AI game",
    aiCal: "AI calibration in progress",
    aiTitle: "AI",
    you: "You",
    opponent: "Opponent",
    matchFinished: "Match finished",
    waiting: "Waiting for opponent to resume",
    controls: "Controls",
    online: "Create or Join a match to start Online 1v1",
  },
  google: {
    title: "Processing Google Login...",
    subtitle: "Please wait while we complete your login.",
    loginFailed: "Login failed. Please try again.",
    loginSuccess: "Login successful! Redirecting...",
    verifying: "Verifying authentication...",
    failedAuth: "Authentication failed. Please try again.",
    requiring2FA: "2FA required. Redirecting to verification...",
    errorMsg: "This Google account is already linked to an existing account. Log in with your password or reset it.",
  },

  tournament: {
    startMessage: "Hi! A tournament has started!",
    title: "Tournament",
    leaveTournament: {
      confirm: "⚠️ Are you sure?",
      warning: "Tournament data will be lost if you leave this page.",
      refresh: "Tournament data will be lost if you refresh this page.",
      stayButton: "Stay in Tournament",
      leaveButton: "Leave Tournament",
      note: "Note: Using the browser's reload button may show an additional confirmation.",
    },
    numberLimit: "Bracket not supported for this number of participants",
    bracket: {
      title: "Tournament Bracket",
      participants: "Participants",
      bracket:  "📊 Bracket",
      difficulty: "Difficulty",
      scoreLimit: "Score Limit",
      singleEli: "Single elimination bracket will be shown here.",
    },
    configTitle: "Tournament Configuration",
    numberParticipants: "Number of participants",
    participantsMsg: "tournament supports 2, 4 or 8 players",
    startButton: "🎮 Start Tournament",
    starting: "Starting tournament match...",
    match: "Match",
    startGame: "Start Game",
    round: "Round",
    playingTo: "Playing to",
    difficulty: "difficulty",
    difficultyUpTo: "difficulty up to",
    gameConfigProgress: "Game configuration in progress",
    matchResult: "🏆 Match Result",
    winner: "Winner",
    defeated: "defeated",
    restartTournament: "Restart Tournament",
    nextMatch: "Next Match",
    whoWon: "Who won?",
    tWinner: "Tournament Winner",
    final: "Final Tournament Bracket",
    completed: "Tournament match completed",
    gamePause: "Game Paused - Press P to Resume",
    cantd: "The amount of players must be 2, 4 or 8 players.",
  },

  profile: {
    noUserPage: {
      title: "Error: No user data available",
      please: "Please",
      login: "login",
      toView: "to view your profile."
    },
    wins: "Wins",
    losses: "Losses",
    recentMatches: "Recent Matches",
    loadingMatches: "Loading matches...",
    noMatches: "No matches played yet. Start playing to build your history!",
    social: "Social",
    searchUsers: "🔍 Search Users",
    searchPlaceholder: "Search by username...",
    noFriends: "You have no friends yet.",
    myFriends: "🤝 My Friends",
    loadFriendList: "Loading friends list...",
    failedFriendRequest: "Failed to load friend requests",
    failedFriendsList: "Failed to load friends list",
    noFriendRequests: "No pending friend requests",
    friendRequests: "👥 Friend Requests",
    loadRequests: "Loading requests...",
    searching: "Searching...",
    noUsers: "No users found.",
    acceptButton: "✅ Accept",
    rejectButton: "❌ Reject",
    accountSettings: {
      title: "Account Settings",
      changePassword: {
        title: "🔒 Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password",
        saveButton: "Save Changes"
      },
      twoAuthentication: {
        title: "🛡️ Two-Factor Authentication",
        currentStatus: "Current Status:",
        enable: "Enabled",
        disable: "Disabled",
        enabled: "enabled",
        disabled: "disabled",
        currently: "Two-factor authentication is currently",
        enableAccount: "for your account. You will receive a verification code via email when logging in.",
        disableAccount: "Enable it to add an extra layer of security to your account.",
        disabledButton: "🔓 Disable 2FA",
        enabledButton: "🔒 Enable 2FA",
      },
      deleteAccount: {
        title: "🗑️ Delete Account",
        cantBeUndone: "This action cannot be undone!",
        warningTitle: "Deleting your account will permanently remove:",
        profileInformation: "Your profile and personal information",
        gameStatistics: "All game statistics and match history",
        achievements: "Your achievements and progress",
        preferences: "Any saved preferences",
        confirmChoices: "Are you absolutely sure you want to delete your account?",
        understand: "I understand that this action is permanent and cannot be undone",

      },
      messages: {
        passUpdated: "Password updated successfully!",
        currentPassNeeded: "Current password is required",
        failedUpdate: "Failed to update password. Please try again.",
        passRequired: "Password is required",
        passLength: "Password must be at least 8 characters long",
        passCharacters: "Password must include uppercase, lowercase, and number",
        confirmPass: "Please confirm your password",
        passMismatch: "Passwords don't match",
        userRequired: "Username is required",
        userLength: "Username must be at least 3 characters long",
        userCharacters: "Username can only contain letters, numbers, and underscores",
        verificationCodeRequired: "Verification code is required",
        verificationCodeLength: "Code must be 6 digits",
        verificationCodeNumbers: "Code must contain only numbers",
        teamName: "Team name must be 1-7 letters only",        
      },
    },
    messages: {
      usernameUpdated: "Username updated successfully!",
      failedUpdate: "Failed to update username. Please try again.",
      twoFactorAuth: {
        title: "Two-Factor Authentication",
        enable: "enabled",
        disable: "disabled",
        success: " successfully!",
      },
      failedTwoFactor: "Failed to update Two-Factor Authentication. Please try again."
    },
  },

  publicProfile: {
    loading: "Loading profile...",
    removeFriend: "❌ Remove Friend",
    friendRequestSent: "📤 Friend request sent",
    acceptRequest: "✅ Accept Request",
    reject: "❌ Reject",
    addFriend: "➕ Add Friend",
    noMatches: "No matches played yet.",
    errorLoading: {
      title: "Error loading profile",
      subtitle: "Could not load user profile. The user may not exist or there was a server error.",
    }
  },

   
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    confirm: "Confirm",
    back: "← Back",
    next: "Next",
    submit: "Submit"
  }
}

export type TranslationKeys = typeof en