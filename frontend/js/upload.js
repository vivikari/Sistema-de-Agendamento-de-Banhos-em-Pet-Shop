const API_URL = "http://localhost:3000/api/images"

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData()
    const fileInput = e.target.elements.image
    const imageId = e.target.elements.imageId.value

    if (!fileInput.files[0]) return alert("Selecione uma imagem!")

    formData.append('image', fileInput.files[0])

    if (imageId) {
        // Atualizar
        await fetch(`${API_URL}/${imageId}`, {
            method: 'PUT',
            body: formData
        })
        e.target.imageId.value = "" // Limpa ID
    } else {
        // Criar
        await fetch(API_URL, {
            method: 'POST',
            body: formData
        })
    }

    e.target.reset()
    loadImages()
})

async function loadImages() {
    const res = await fetch(API_URL)
    const images = await res.json()

    const gallery = document.getElementById('gallery')
    gallery.innerHTML = ''

    images.forEach(img => {
        const container = document.createElement('div')
        container.style.display = "inline-block"
        container.style.margin = "10px"
        container.innerHTML = `
            <img src="http://localhost:3000/${img.filepath}" alt="${img.filename}" style="width:150px; display:block;">
            <button onclick="editImage(${img.id})">Editar</button>
            <button onclick="deleteImage(${img.id})">Excluir</button>
        `
        gallery.appendChild(container)
    })
}

async function editImage(id) {
    document.getElementById('imageId').value = id
    alert("Selecione uma nova imagem para substituir a atual e clique em 'Enviar Imagem'.")
}

async function deleteImage(id) {
    if (!confirm("Deseja realmente excluir esta imagem?")) return
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    })
    loadImages()
}

loadImages()
