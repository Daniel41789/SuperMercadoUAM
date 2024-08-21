document.getElementById('showFormButton').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('productForm').classList.toggle('hidden');
});

document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productStock = document.getElementById('productStock').value;
    const productSupplier = document.getElementById('productSupplier').value;

    const data = {
        productName: productName,
        productPrice: productPrice,
        productStock: productStock,
        productSupplier: productSupplier
    };

    fetch('http://localhost:3000/addProduct', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert('Producto agregado con éxito');
        document.getElementById('productForm').reset();
        document.getElementById('productForm').classList.add('hidden');
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById('showProductsButton').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('http://localhost:3000/getProducts')
    .then(response => response.json())
    .then(data => {
        const productList = document.getElementById('productList');
        const productItems = document.getElementById('productItems');
        productItems.innerHTML = '';
        data.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.id} - ${product.nombre} - Precio: $${product.precio} - Existencia: ${product.existencia} - Proveedor: ${product.proveedor}`;
            productItems.appendChild(li);
        });
        productList.classList.remove('hidden');
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById('showDeleteFormButton').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('deleteForm').classList.toggle('hidden');
});

document.getElementById('deleteForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const productId = document.getElementById('productId').value;

    fetch(`http://localhost:3000/deleteProduct/${productId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Producto borrado con éxito');
            document.getElementById('deleteForm').reset();
            document.getElementById('deleteForm').classList.add('hidden');
        } else {
            alert('Error al borrar el producto');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

