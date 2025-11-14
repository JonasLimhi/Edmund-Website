// buy.js
// Renders a purchase page for a specific product id and handles Add-to-Cart.

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) {
        window.location.href = 'Website.html';
        return;
    }

    const product = getProductById(productId);
    if (!product) {
        alert('Product not found');
        window.location.href = 'Website.html';
        return;
    }

    renderBuyPage(product);
    updateAuthNav();
});

function renderBuyPage(product) {
    document.getElementById('buyProductName').textContent = product.name;
    document.getElementById('buyProductPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('buyProductDescription').textContent = product.description || 'No description available';
    const img = document.getElementById('buyProductImage');
    img.src = product.image || 'https://via.placeholder.com/400x300?text=No+Image';
    img.alt = product.name;
    img.onerror = () => img.src = 'https://via.placeholder.com/400x300?text=No+Image';

    const container = document.getElementById('buyControls');
    container.innerHTML = '';

    // Color selector
    if (product.colors && product.colors.length) {
        const div = document.createElement('div');
        div.className = 'mb-2';
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = 'Color';
        const select = document.createElement('select');
        select.className = 'form-select';
        select.id = 'selectColor';
        product.colors.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            select.appendChild(opt);
        });
        div.appendChild(label);
        div.appendChild(select);
        container.appendChild(div);
    }

    // Size selector
    if (product.sizes && product.sizes.length) {
        const div = document.createElement('div');
        div.className = 'mb-2';
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = 'Size';
        const select = document.createElement('select');
        select.className = 'form-select';
        select.id = 'selectSize';
        product.sizes.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            select.appendChild(opt);
        });
        div.appendChild(label);
        div.appendChild(select);
        container.appendChild(div);
    }

    // Quantity
    const qtyDiv = document.createElement('div');
    qtyDiv.className = 'mb-2';
    const qtyLabel = document.createElement('label');
    qtyLabel.className = 'form-label';
    qtyLabel.textContent = 'Quantity';
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '1';
    qtyInput.value = '1';
    qtyInput.className = 'form-control';
    qtyInput.id = 'inputQuantity';
    qtyDiv.appendChild(qtyLabel);
    qtyDiv.appendChild(qtyInput);
    container.appendChild(qtyDiv);

    // Add to cart button
    const btn = document.createElement('button');
    btn.className = 'btn btn-success';
    btn.textContent = 'Add to Cart';
    btn.addEventListener('click', () => {
        const colorEl = document.getElementById('selectColor');
        const sizeEl = document.getElementById('selectSize');
        const qtyEl = document.getElementById('inputQuantity');
        const selectedColor = colorEl ? colorEl.value : null;
        const selectedSize = sizeEl ? sizeEl.value : null;
        const qty = parseInt(qtyEl.value, 10) || 1;

        if (qty < 1) return alert('Quantity must be at least 1');

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push({ productId: product.id, name: product.name, price: product.price, color: selectedColor, size: selectedSize, quantity: qty });
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Added to cart');
    });
    container.appendChild(btn);
}
