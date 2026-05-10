// A variável global 'products' vem do products.js carregado no HTML
let adminProducts = [];
if (typeof products !== 'undefined') {
    // Clonar para não alterar diretamente o array original na memória (boa prática)
    adminProducts = JSON.parse(JSON.stringify(products));
}

const tableBody = document.getElementById('products-tbody');
const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');

// Elementos do form
const inputId = document.getElementById('product-id');
const inputName = document.getElementById('product-name');
const inputType = document.getElementById('product-type');
const inputCategory = document.getElementById('product-category');
const inputPrice = document.getElementById('product-price');
const inputDesc = document.getElementById('product-description');
const inputBenefits = document.getElementById('product-benefits');
const inputImages = document.getElementById('product-images');
const fileInput = document.getElementById('product-file-input');
const previewContainer = document.getElementById('image-preview-container');

let uploadedImagesBase64 = [];

// Helper para redimensionar imagem antes de salvar
function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Qualidade 0.8 para reduzir o tamanho
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

function addPreviewImage(base64) {
    uploadedImagesBase64.push(base64);
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    
    const imgEl = document.createElement('img');
    imgEl.src = base64;
    imgEl.style.width = '60px';
    imgEl.style.height = '60px';
    imgEl.style.objectFit = 'cover';
    imgEl.style.borderRadius = '8px';
    imgEl.style.border = '1px solid #ddd';
    
    const removeBtn = document.createElement('span');
    removeBtn.innerHTML = '&times;';
    removeBtn.style.position = 'absolute';
    removeBtn.style.top = '-8px';
    removeBtn.style.right = '-8px';
    removeBtn.style.background = '#ff4d4f';
    removeBtn.style.color = 'white';
    removeBtn.style.borderRadius = '50%';
    removeBtn.style.width = '20px';
    removeBtn.style.height = '20px';
    removeBtn.style.textAlign = 'center';
    removeBtn.style.lineHeight = '18px';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.fontSize = '16px';
    removeBtn.style.fontWeight = 'bold';
    
    removeBtn.onclick = () => {
        const idx = uploadedImagesBase64.indexOf(base64);
        if(idx > -1) uploadedImagesBase64.splice(idx, 1);
        wrapper.remove();
    };

    wrapper.appendChild(imgEl);
    wrapper.appendChild(removeBtn);
    previewContainer.appendChild(wrapper);
}

if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        for (let file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    const base64 = await resizeImage(file, 800, 800);
                    addPreviewImage(base64);
                } catch (err) {
                    console.error("Erro ao processar imagem", err);
                    alert("Erro ao ler a imagem.");
                }
            }
        }
        // Limpar o input para permitir selecionar a mesma imagem se for apagada e recolocada
        fileInput.value = '';
    });
}

// Render Table
function renderTable() {
    tableBody.innerHTML = '';
    
    if (adminProducts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
        return;
    }

    adminProducts.forEach(product => {
        const tr = document.createElement('tr');
        
        const mainImage = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/50';

        tr.innerHTML = `
            <td>#${product.id}</td>
            <td><img src="${mainImage}" class="product-img-preview" alt="${product.name}"></td>
            <td><strong>${product.name}</strong></td>
            <td><span style="text-transform: capitalize;">${product.type}</span></td>
            <td>${product.category}</td>
            <td>R$ ${product.price}</td>
            <td class="action-btns">
                <button class="btn btn-edit" onclick="editProduct(${product.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Excluir</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Modal Functions
function openModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    form.reset();
    inputId.value = '';
    modalTitle.textContent = 'Adicionar Produto';
    uploadedImagesBase64 = [];
    previewContainer.innerHTML = '';
}

// Add / Edit Product
function editProduct(id) {
    const product = adminProducts.find(p => p.id === id);
    if (!product) return;

    modalTitle.textContent = 'Editar Produto';
    inputId.value = product.id;
    inputName.value = product.name;
    inputType.value = product.type;
    inputCategory.value = product.category;
    inputPrice.value = product.price;
    inputDesc.value = product.description;
    inputBenefits.value = product.benefits;
    
    uploadedImagesBase64 = [];
    previewContainer.innerHTML = '';
    let urls = [];

    if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
            if (img.startsWith('data:image')) {
                addPreviewImage(img);
            } else {
                urls.push(img);
            }
        });
    }

    inputImages.value = urls.join(', ');

    openModal();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Process images string into array
    const imagesStr = inputImages.value.trim();
    const urlsArray = imagesStr.split(',').map(img => img.trim()).filter(img => img !== '');

    // Juntar URLs com as imagens enviadas da galeria
    const finalImagesArray = [...urlsArray, ...uploadedImagesBase64];

    if (finalImagesArray.length === 0) {
        alert("Por favor, forneça pelo menos uma imagem (URL ou da Galeria).");
        return;
    }

    const productData = {
        name: inputName.value.trim(),
        type: inputType.value,
        category: inputCategory.value.trim(),
        description: inputDesc.value.trim(),
        benefits: inputBenefits.value.trim(),
        price: inputPrice.value.trim(),
        images: finalImagesArray
    };

    const currentId = inputId.value;

    if (currentId) {
        // Atualizar existente
        const index = adminProducts.findIndex(p => p.id == currentId);
        if (index !== -1) {
            productData.id = parseInt(currentId);
            adminProducts[index] = productData;
            alert('Produto atualizado com sucesso!');
        }
    } else {
        // Adicionar novo
        // Generate new ID (max id + 1)
        const maxId = adminProducts.length > 0 ? Math.max(...adminProducts.map(p => p.id)) : 0;
        productData.id = maxId + 1;
        adminProducts.push(productData);
        alert('Produto adicionado com sucesso!');
    }

    closeModal();
    renderTable();
});

// Delete Product
function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        adminProducts = adminProducts.filter(p => p.id !== id);
        renderTable();
    }
}

// Configurações do GitHub
const githubModal = document.getElementById('github-modal');
const githubForm = document.getElementById('github-form');

function openGithubModal() {
    document.getElementById('gh-token').value = localStorage.getItem('gh-token') || '';
    document.getElementById('gh-owner').value = localStorage.getItem('gh-owner') || '';
    document.getElementById('gh-repo').value = localStorage.getItem('gh-repo') || '';
    document.getElementById('gh-branch').value = localStorage.getItem('gh-branch') || 'main';
    githubModal.classList.add('active');
}

function closeGithubModal() {
    githubModal.classList.remove('active');
}

githubForm.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem('gh-token', document.getElementById('gh-token').value.trim());
    localStorage.setItem('gh-owner', document.getElementById('gh-owner').value.trim());
    localStorage.setItem('gh-repo', document.getElementById('gh-repo').value.trim());
    localStorage.setItem('gh-branch', document.getElementById('gh-branch').value.trim());
    alert('Configurações do GitHub salvas no navegador!');
    closeGithubModal();
});

// Sincronização Automática com GitHub (Git-based CMS)
async function syncWithGithub() {
    const token = localStorage.getItem('gh-token');
    const owner = localStorage.getItem('gh-owner');
    const repo = localStorage.getItem('gh-repo');
    const branch = localStorage.getItem('gh-branch') || 'main';

    if (!token || !owner || !repo) {
        alert('Por favor, configure os dados do GitHub primeiro clicando em "⚙️ Configurar GitHub".');
        openGithubModal();
        return;
    }

    const syncBtn = document.getElementById('sync-btn');
    syncBtn.innerHTML = '⏳ Sincronizando...';
    syncBtn.disabled = true;

    try {
        // Formatar o array para o formato JS
        const jsonString = JSON.stringify(adminProducts, null, 4);
        const jsContent = `const products = ${jsonString};\n`;

        // Codificar em Base64 (suporte para caracteres UTF-8)
        const encodedContent = btoa(unescape(encodeURIComponent(jsContent)));
        
        const path = 'products.js';
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        
        // 1. Obter o SHA atual do arquivo (necessário para atualizar)
        let sha = null;
        const getRes = await fetch(`${url}?ref=${branch}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (getRes.ok) {
            const getJson = await getRes.json();
            sha = getJson.sha;
        } else if (getRes.status !== 404) {
            throw new Error(`Erro ao buscar arquivo: ${getRes.statusText}`);
        }

        // 2. Fazer o PUT do novo conteúdo
        const putData = {
            message: "Atualizar catálogo de produtos via Admin",
            content: encodedContent,
            branch: branch
        };
        if (sha) putData.sha = sha;

        const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(putData)
        });

        if (!putRes.ok) {
            const errData = await putRes.json();
            throw new Error(errData.message || 'Erro ao atualizar repositório');
        }

        alert('✅ Loja atualizada com sucesso!\nAguarde de 1 a 2 minutos para que o GitHub Pages aplique a mudança no site principal.');

    } catch (err) {
        console.error(err);
        alert(`❌ Erro ao sincronizar: ${err.message}\nVerifique se o Token, Repositório e Branch estão corretos.`);
    } finally {
        syncBtn.innerHTML = '☁️ Salvar na Loja (Sincronizar)';
        syncBtn.disabled = false;
    }
}

// Inicializar a tabela ao carregar a página
document.addEventListener('DOMContentLoaded', renderTable);
