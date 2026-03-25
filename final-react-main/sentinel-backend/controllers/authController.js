import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../services/mailer.js";
import { generateEmailVerificationToken, hashToken } from "../services/emailVerification.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

function allowedEmailsList() {
  const raw = process.env.AUTH_ALLOWED_EMAILS || "mohamedomor.dghij@isimg.tn";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function allowedDomainsList() {
  const raw = process.env.AUTH_ALLOWED_DOMAINS || "gmail.com";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isRegistrationAllowed(email) {
  const e = String(email || "").toLowerCase().trim();
  const allowedEmails = allowedEmailsList();
  if (allowedEmails.includes(e)) return true;

  const domain = e.split("@")[1] || "";
  const allowedDomains = allowedDomainsList();
  return allowedDomains.includes(domain);
}


async function sendVerificationEmail(user, rawToken) {
  const web = process.env.APP_WEB_URL || "http://localhost:8080";
  const link = `${web}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

  const subject = "[Sentinel] Confirme ton email";
  const text =
    `Bonjour ${user.fullName},\n\n` +
    `Pour activer ton compte, confirme ton email via ce lien :\n${link}\n\n` +
    `Ce lien expire bientôt. Si tu n'es pas à l'origine de cette demande, ignore cet email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h2 style="margin:0 0 8px 0">Confirme ton email</h2>
      <p>Bonjour <b>${user.fullName}</b>,</p>
      <p>Pour activer ton compte, clique sur le bouton :</p>
      <p style="margin: 16px 0">
        <a href="${link}" style="background:#111827;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;display:inline-block">
          Confirmer mon email
        </a>
      </p>
      <p style="color:#6b7280;font-size:12px">Ou copie ce lien : ${link}</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
}
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mohamedomor.dghij@isimg.tn";

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (!isRegistrationAllowed(email)) {
      return res.status(403).json({
        success: false,
        message: "Inscription refusée. Seules les adresses autorisées peuvent s'inscrire.",
      });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const { raw, hash, expires } = generateEmailVerificationToken();

    const user = await User.create({
      email: String(email).toLowerCase().trim(),
      password,
      fullName,
      emailVerified: false,
      emailVerifyTokenHash: hash,
      emailVerifyExpires: expires,
      lastVerifyEmailSentAt: new Date(),
    });

    await sendVerificationEmail(user, raw);

    return res.status(201).json({
      success: true,
      message: "Compte créé. Vérifie ton email pour activer le compte.",
      user: { _id: user._id, email: user.email, fullName: user.fullName, role: user.role, emailVerified: user.emailVerified },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error in Register API",
      error: error.message,
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // ✅ Email verification mandatory
    if (!user.emailVerified) {
      const { raw, hash, expires } = generateEmailVerificationToken();
      user.emailVerifyTokenHash = hash;
      user.emailVerifyExpires = expires;
      user.lastVerifyEmailSentAt = new Date();
      await user.save();

      await sendVerificationEmail(user, raw);

      return res.status(403).json({
        success: false,
        message: "Email non vérifié. Un email de vérification vient d'être envoyé.",
      });
    }

    const token = generateToken(user._id);
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Login Successfully",
      token,
      user,
    });
  } catch (error) {
    console.log("LOGIN ERROR FULL:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

// GET /api/auth/verify-email?token=...&email=...
export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      return res.status(400).json({ success: false, message: "Missing token or email" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.emailVerified) {
      return res.json({ success: true, message: "Email déjà vérifié." });
    }

    if (!user.emailVerifyTokenHash || !user.emailVerifyExpires) {
      return res.status(400).json({ success: false, message: "No verification request found" });
    }

    if (user.emailVerifyExpires.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "Token expiré. Refaire une demande de vérification." });
    }

    const hashed = hashToken(String(token));
    if (hashed !== user.emailVerifyTokenHash) {
      return res.status(400).json({ success: false, message: "Token invalide" });
    }

    user.emailVerified = true;
    user.emailVerifyTokenHash = null;
    user.emailVerifyExpires = null;
    await user.save();

    return res.json({ success: true, message: "Email vérifié avec succès. Tu peux te connecter." });
  } catch (e) {
    console.log("VERIFY EMAIL ERROR:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/auth/resend-verification { email }
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.emailVerified) {
      return res.json({ success: true, message: "Email déjà vérifié." });
    }

    const { raw, hash, expires } = generateEmailVerificationToken();
    user.emailVerifyTokenHash = hash;
    user.emailVerifyExpires = expires;
    user.lastVerifyEmailSentAt = new Date();
    await user.save();

    await sendVerificationEmail(user, raw);

    return res.json({ success: true, message: "Email de vérification renvoyé." });
  } catch (e) {
    console.log("RESEND VERIFY ERROR:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
