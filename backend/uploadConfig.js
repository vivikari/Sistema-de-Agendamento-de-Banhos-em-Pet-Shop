import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configura caminhos absolutos para melhor segurança
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads'); // Pasta fora do src

// Cria a pasta uploads com verificação robusta
const createUploadsDir = () => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`✅ Pasta de uploads criada em: ${uploadDir}`);
    }
  } catch (err) {
    console.error('❌ Erro ao criar pasta de uploads:', err);
    process.exit(1); // Encerra se não conseguir criar a pasta
  }
};
createUploadsDir();

// Configuração segura do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const safeFilename = `${uniqueSuffix}${ext}`.replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, safeFilename);
  }
});

// Filtro de segurança para tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas imagens (JPEG, PNG, GIF) são permitidas.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Apenas 1 arquivo por upload
  }
});

export default upload;