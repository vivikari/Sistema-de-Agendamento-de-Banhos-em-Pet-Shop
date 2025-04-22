import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  // Verifica se o token foi fornecido
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      error: 'Token não fornecido'
    })
  }
// Divide o cabeçalho em duas partes: 'Bearer' e o token
  const [bearer, token] = authHeader.split(' ')
// Verifica se o token está no formato correto (Bearer token)
  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ 
      success: false,
      error: 'Token mal formatado' 
    })
  }
// Verifica e decodifica o token usando a chave secreta
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Adiciona os dados do usuário ao objeto de requisição
    req.user = { // Padroniza o objeto user
      id: decoded.id,
      username: decoded.username
    }
    return next()
  } catch (err) {
    // Trata erros de token inválido/expirado
    return res.status(401).json({ 
      success: false,
      error: 'Token inválido ou expirado'
    })
  }
}