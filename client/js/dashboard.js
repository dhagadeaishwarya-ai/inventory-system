document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userStr);
    
    // UI Elements
    const userNameEl = document.getElementById('user-name');
    const userInitialEl = document.getElementById('user-initial');
    const logoutBtn = document.getElementById('logout-btn');
    
    const tbody = document.getElementById('products-tbody');
    const emptyState = document.getElementById('empty-state');
    
    const totalProductsEl = document.getElementById('total-products');
    const totalCategoriesEl = document.getElementById('total-categories');
    const lowStockCountEl = document.getElementById('low-stock-count');
    
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-btn');
    const addProductBtn = document.getElementById('add-product-btn');
    
    // Modal Elements
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const productForm = document.getElementById('product-form');
    const modalTitle = document.getElementById('modal-title');
    
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    // Initialize UI
    userNameEl.textContent = user.username;
    userInitialEl.textContent = user.username.charAt(0).toUpperCase();

    let allProducts = [];

    // Fetch and render products
    async function loadProducts(query = '') {
        try {
            const response = await window.API.getProducts(query);
            allProducts = response.data;
            renderProducts(allProducts);
            updateSummaryCards(allProducts);
        } catch (error) {
            if (error.message === 'Not authorized, token failed' || error.message === 'Not authorized, no token') {
                localStorage.clear();
                window.location.href = 'index.html';
            } else {
                window.showToast('Failed to load products: ' + error.message, 'error');
            }
        }
    }

    function renderProducts(products) {
        tbody.innerHTML = '';
        
        if (products.length === 0) {
            emptyState.style.display = 'block';
            document.querySelector('table').style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        document.querySelector('table').style.display = 'table';

        products.forEach(product => {
            const isLowStock = product.quantity < 10;
            const tr = document.createElement('tr');
            if (isLowStock) {
                tr.classList.add('row-low-stock');
            }
            
            tr.innerHTML = `
                <td><strong>${product.name}</strong></td>
                <td><span class="badge" style="background-color: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);">${product.category}</span></td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    ${isLowStock ? `<span class="badge badge-danger">${product.quantity}</span>` : `<span class="badge badge-success">${product.quantity}</span>`}
                </td>
                <td>${product.supplier || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon edit-btn" data-id="${product._id}" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        </button>
                        <button class="btn-icon delete delete-btn" data-id="${product._id}" data-name="${product.name}" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to dynamically created buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEditClick);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteClick);
        });
    }

    function updateSummaryCards(products) {
        totalProductsEl.textContent = products.length;
        
        const categories = new Set(products.map(p => p.category));
        totalCategoriesEl.textContent = categories.size;
        
        const lowStock = products.filter(p => p.quantity < 10).length;
        lowStockCountEl.textContent = lowStock;
    }

    // Modal logic
    function openModal(isEdit = false, product = null) {
        productModal.classList.add('active');
        if (isEdit && product) {
            modalTitle.textContent = 'Edit Product';
            document.getElementById('product-id').value = product._id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-quantity').value = product.quantity;
            document.getElementById('product-supplier').value = product.supplier || '';
        } else {
            modalTitle.textContent = 'Add Product';
            productForm.reset();
            document.getElementById('product-id').value = '';
        }
    }

    function closeModal() {
        productModal.classList.remove('active');
        productForm.reset();
    }

    // Event Listeners
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    addProductBtn.addEventListener('click', () => openModal(false));
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('product-id').value;
        const btn = document.getElementById('save-product-btn');
        
        const productData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            quantity: parseInt(document.getElementById('product-quantity').value),
            supplier: document.getElementById('product-supplier').value
        };

        try {
            btn.disabled = true;
            btn.textContent = 'Saving...';
            
            if (id) {
                await window.API.updateProduct(id, productData);
                window.showToast('Product updated successfully');
            } else {
                await window.API.createProduct(productData);
                window.showToast('Product added successfully');
            }
            
            closeModal();
            loadProducts(); // Reload table
        } catch (error) {
            window.showToast(error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Save Product';
        }
    });

    // Delete Logic
    function handleDeleteClick(e) {
        const btn = e.currentTarget;
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        
        document.getElementById('delete-product-id').value = id;
        document.getElementById('delete-product-name').textContent = name;
        
        deleteModal.classList.add('active');
    }

    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        const id = document.getElementById('delete-product-id').value;
        const btn = confirmDeleteBtn;
        
        try {
            btn.disabled = true;
            btn.textContent = 'Deleting...';
            
            await window.API.deleteProduct(id);
            window.showToast('Product deleted successfully');
            
            deleteModal.classList.remove('active');
            loadProducts();
        } catch (error) {
            window.showToast(error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Delete';
        }
    });

    // Edit Logic
    function handleEditClick(e) {
        const btn = e.currentTarget;
        const id = btn.getAttribute('data-id');
        const product = allProducts.find(p => p._id === id);
        
        if (product) {
            openModal(true, product);
        }
    }

    // Search Logic (Debounced client-side for better UX since all data is loaded)
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.category.toLowerCase().includes(searchTerm) ||
                (p.supplier && p.supplier.toLowerCase().includes(searchTerm))
            );
            renderProducts(filtered);
        }, 300);
    });

    // Export Logic
    exportBtn.addEventListener('click', async () => {
        try {
            exportBtn.disabled = true;
            exportBtn.innerHTML = '<span class="loader" style="width: 14px; height: 14px; border-width: 2px; margin-right: 5px;"></span> Exporting...';
            
            const blob = await window.API.exportCSV();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            window.showToast('Export successful');
        } catch (error) {
            window.showToast('Export failed: ' + error.message, 'error');
        } finally {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 0.5rem; fill: currentColor;"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg> Export CSV';
        }
    });

    // Mobile Menu Toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Initial Load
    loadProducts();
});
