import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      error: 'Token não fornecido'
    })
  }

  const [bearer, token] = authHeader.split(' ')

  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ 
      success: false,
      error: 'Token mal formatado' 
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { // Padroniza o objeto user
      id: decoded.id,
      username: decoded.username
    }
    return next()
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      error: 'Token inválido ou expirado'
    })
  }
}