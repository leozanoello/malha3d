const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

/**
 * Configuração do Passport.js para Login Social
 * Suporta: Google OAuth 2.0
 */

// Serialização: salva apenas o ID do usuário na sessão
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialização: recupera o usuário completo do banco a partir do ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ==========================================
// GOOGLE STRATEGY
// ==========================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL = (process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`) + '/admin/auth/google/callback';

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

      if (!email) {
        return done(null, false, { message: 'Não foi possível obter o e-mail da conta Google.' });
      }

      // 1. Buscar usuário existente pelo e-mail
      let user = await User.findOne({ where: { email } });

      if (user) {
        // Usuário já existe — atualizar dados do provider se ainda não estava vinculado
        if (user.authProvider === 'local' || !user.authProviderId) {
          await user.update({
            authProvider: 'google',
            authProviderId: profile.id,
            avatar: user.avatar || (profile.photos && profile.photos[0] ? profile.photos[0].value : null)
          });
        }
        // Atualizar último login
        await user.update({ lastLogin: new Date() });
        return done(null, user);
      }

      // 2. Criar novo usuário
      const firstName = profile.name ? profile.name.givenName : profile.displayName;
      const lastName = profile.name ? profile.name.familyName : '';
      const name = `${firstName} ${lastName}`.trim();

      user = await User.create({
        name,
        firstName,
        lastName,
        email,
        password: null, // Sem senha — login social
        authProvider: 'google',
        authProviderId: profile.id,
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        role: 'user',
        isActive: true,
        status: 'active',
        isVerified: true // E-mail já verificado pelo Google
      });

      return done(null, user);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      return done(error, null);
    }
  }));

  console.log('✅ Google OAuth Strategy configurada');
} else {
  console.log('⚠️  Google OAuth não configurado (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET não definidos)');
}

module.exports = passport;
