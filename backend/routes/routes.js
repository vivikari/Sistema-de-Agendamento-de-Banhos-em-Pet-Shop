import express from 'express'
import db from '../db.js'  
import authRoutes from './authRoutes.js'  
import upload from '../uploadConfig.js'  
import fs from 'fs'
import path from 'path'


const router = express.Router()

// Rotas de autenticação
router.use('/auth', authRoutes)  // Adicionei prefixo /auth para organização

// Upload de imagens
router.post('/images', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" })
    }

    try {
        const { filename, path: filepath } = req.file

        // Verifique se a pasta uploads existe
        const uploadDir = path.join(process.cwd(), 'uploads')
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        await db.execute(
            "INSERT INTO pet_fotos (filename, filepath, pet_id) VALUES (?, ?, ?)",
            [filename, filepath, req.body.pet_id]  // Adicionei pet_id para relacionamento
        )

        res.status(201).json({ 
            message: "Imagem enviada com sucesso!",
            filename,
            path: filepath
        })
    } catch (error) {
        console.error("Erro no upload:", error)
        res.status(500).json({ 
            error: "Erro ao processar imagem",
            details: error.message
        })
    }
})

router.get('/images', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM images")
        res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Atualizar imagem
router.put('/images/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params
        const { filename, path: newPath } = req.file

        // Buscar imagem antiga
        const [old] = await db.execute("SELECT * FROM images WHERE id = ?", [id])
        if (old.length === 0) return res.status(404).json({ error: "Imagem não encontrada" })

        const oldPath = old[0].filepath

        // Atualizar no banco
        await db.execute(
            "UPDATE images SET filename = ?, filepath = ? WHERE id = ?",
            [filename, newPath, id]
        )

        // Remover imagem antiga do disco
        fs.unlink(oldPath, (err) => {
            if (err) console.warn("Erro ao remover imagem antiga:", err)
        })

        res.json({ message: "Imagem atualizada com sucesso!" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.delete('/images/:id', async (req, res) => {
    try {
        const { id } = req.params

        // Buscar imagem
        const [rows] = await db.execute("SELECT * FROM images WHERE id = ?", [id])
        if (rows.length === 0) return res.status(404).json({ error: "Imagem não encontrada" })

        const filePath = rows[0].filepath

        // Remover do banco
        await db.execute("DELETE FROM images WHERE id = ?", [id])

        // Remover do disco
        fs.unlink(filePath, (err) => {
            if (err) console.warn("Erro ao remover imagem do disco:", err)
        })

        res.json({ message: "Imagem excluída com sucesso!" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


export default router
