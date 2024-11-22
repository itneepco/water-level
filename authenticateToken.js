export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

  if (!token || token !== process.env.STATIC_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next(); // Token is valid, proceed to the next middleware
}