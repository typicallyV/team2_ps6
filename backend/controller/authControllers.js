// controllers/authControllers.js
import bcrypt from "bcryptjs";
import Users from "../models/User.js"; // make sure this matches your model file

// POST /api/auth/login
export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email & password required" });

    const user = await Users.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    req.session.isAuth = true;
    // 👇 CONVERT ObjectId to string!
    req.session.user = { 
      id: user._id.toString(), // Convert to string
      name: user.name, 
      email: user.email 
    };
req.session.userId = user._id.toString();
    req.session.save(err => {
  if (err) { console.error("Session save error:", err); return res.status(500).json({ message: "Session save failed" }); }
  return res.json({ message: "Logged in", user: req.session.user });
});

  } catch (err) {
    console.error("postLogin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/register
export const postRegister = async (req, res) => {
  try {
    const { name = "", email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email & password required" });
    }

    const existing = await Users.findOne({ email });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 12);
    const user = new Users({ name, email, password: hashed });
    await user.save();
    req.session.userId = user._id.toString();
    req.session.isAuth = true;
    // 👇 CONVERT ObjectId to string here too!
    req.session.user = { 
      id: user._id.toString(), 
      name: user.name, 
      email: user.email 
    };

    return res.status(201).json({ message: "User created", user: req.session.user });
  } catch (err) {
    console.error("postRegister error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// POST /api/auth/logout
export const postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("sid");
    return res.json({ message: "Logged out" });
  });
};

// GET /api/auth/profile
export const getProfile = (req, res) => {
  return res.json({ user: req.session.user || null });
};
