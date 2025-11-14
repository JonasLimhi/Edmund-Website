// Simple product manager using localStorage
(function(){
  const form = document.getElementById('product-form');
  const productsEl = document.getElementById('products');
  const clearBtn = document.getElementById('clear-storage');

  function loadProducts(){
    try { return JSON.parse(localStorage.getItem('products')||'[]'); }
    catch(e){ return []; }
  }
  function saveProducts(products){ localStorage.setItem('products', JSON.stringify(products)); }

  function idNow(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function renderProducts(){
    const products = loadProducts();
    if(!products.length){
      productsEl.innerHTML = '<p>No products yet. Add one using the form above.</p>';
      return;
    }
    productsEl.innerHTML = products.map(p => `
      <article class="card">
        ${p.image?`<img src="${p.image}" alt="${p.name}">`:''}
        <h3>${p.name}</h3>
        <p class="price">$${Number(p.price).toFixed(2)}</p>
        <p>${(p.description||'').slice(0,120)}</p>
        <a class="view" href="product.html?id=${p.id}">View product →</a>
      </article>
    `).join('');
  }

  function addSampleIfEmpty(){
    const products = loadProducts();
    if(products.length) return;
    const sample = [
      {id:idNow(),name:'Blue Hoodie',price:49.99,description:'Comfortable hoodie in blue.',image:'https://picsum.photos/seed/hoodie/600/400'},
      {id:idNow(),name:'Wireless Headphones',price:89.00,description:'Noise-cancelling over-ear headphones.',image:'https://picsum.photos/seed/headphones/600/400'}
    ];
    saveProducts(sample);
  }

  function clearAll(){
    if(!confirm('Clear all products?')) return;
    localStorage.removeItem('products');
    renderProducts();
  }

  function onSubmit(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const price = document.getElementById('price').value;
    const image = document.getElementById('image').value.trim();
    const description = document.getElementById('description').value.trim();
    if(!name || !price) return alert('Name and price are required');
    const products = loadProducts();
    const p = {id:idNow(),name,price:parseFloat(price),image,description};
    products.unshift(p);
    saveProducts(products);
    form.reset();
    renderProducts();
    // Navigate to product page for convenience
    location.href = `product.html?id=${p.id}`;
  }

  form.addEventListener('submit', onSubmit);
  clearBtn.addEventListener('click', clearAll);

  // init
  addSampleIfEmpty();
  renderProducts();
})();
