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
    inputImages.value = product.images.join(', ');

    openModal();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Process images string into array
    const imagesStr = inputImages.value.trim();
    const imagesArray = imagesStr.split(',').map(img => img.trim()).filter(img => img !== '');

    const productData = {
        name: inputName.value.trim(),
        type: inputType.value,
        category: inputCategory.value.trim(),
        description: inputDesc.value.trim(),
        benefits: inputBenefits.value.trim(),
        price: inputPrice.value.trim(),
        images: imagesArray
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

// Export Functionality
function exportProducts() {
    // Formatar o array para uma string JS formatada e bonita
    const jsonString = JSON.stringify(adminProducts, null, 4);
    
    // Substituir a sintaxe JSON por uma sintaxe JS válida para a constante
    const jsContent = `const products = ${jsonString};`;

    // Criar um Blob com o conteúdo
    const blob = new Blob([jsContent], { type: 'text/javascript;charset=utf-8' });
    
    // Criar um link para download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.js';
    
    // Simular o clique
    document.body.appendChild(a);
    a.click();
    
    // Limpar
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Arquivo products.js baixado!\nSubstitua o arquivo antigo na sua pasta por este novo para aplicar as alterações na loja principal.');
}

// Inicializar a tabela ao carregar a página
document.addEventListener('DOMContentLoaded', renderTable);
