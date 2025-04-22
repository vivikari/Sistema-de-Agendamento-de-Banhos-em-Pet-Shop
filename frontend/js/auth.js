//LOGIN
document.getElementById('loginForm')?.addEventListener('submit', async (e) =>{
    e.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const res = await fetch('/api/login', {
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username, password})
    })
    if(res.ok){
        const data = await res.json()
        localStorage.setItem('token', data.token)
        window.location.href = 'private.html'
    } else {
        const msg = await res.text()
        document.getElementById('message').innerText = msg
    }
})

//ROTA PRIVADA
async function acessar() {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/private',{ 
        headers:{Authorization: `Bearer ${token}`}
    })
    const data = await res.json() 
    document.getElementById('dados').innerText = data.message 

    console.log('Token enviado:', token)
}

//DESLOGAR
function logout() {
    // Limpar todos os dados de sessão
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Opcional: invalidar token no servidor
    fetch('/api/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).catch(() => {}); // Não tratar erros
    
    window.location.href = '/login.html';
}