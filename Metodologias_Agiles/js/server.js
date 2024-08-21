const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Daniel4178',
    database: 'super_mercado'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL server.');
});

// Products Endpoints
app.post('/addProduct', (req, res) => {
    const { productName, productPrice, productStock, productSupplier } = req.body;
    const query = 'INSERT INTO productos (nombre, precio, existencia, proveedor) VALUES (?, ?, ?, ?)';
    db.query(query, [productName, productPrice, productStock, productSupplier], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Error inserting data');
            return;
        }
        res.status(200).send({ message: 'Product added successfully' });
    });
});

app.get('/getProducts', (req, res) => {
    const query = 'SELECT * FROM productos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        res.status(200).json(results);
    });
});

app.delete('/deleteProduct/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM productos WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
            res.status(500).send({ success: false, message: 'Error deleting data' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send({ success: false, message: 'Product not found' });
        } else {
            res.status(200).send({ success: true, message: 'Product deleted successfully' });
        }
    });
});

// Departments Endpoints
app.post('/addDepartment', (req, res) => {
    const { clave, nombre, responsable } = req.body;

    if (!clave || !nombre || !responsable) {
        return res.status(400).send({ success: false, message: 'Todos los campos son requeridos' });
    }

    const query = 'INSERT INTO departamentos (clave, nombre, responsable) VALUES (?, ?, ?)';
    db.query(query, [clave, nombre, responsable], (err, result) => {
        if (err) {
            console.error('Error inserting department data:', err);
            res.status(500).send({ success: false, message: 'Error inserting department data' });
            return;
        }
        res.status(200).send({ success: true, message: 'Department added successfully' });
    });
});


app.get('/getDepartments', (req, res) => {
    const query = 'SELECT clave AS clave, nombre AS nombre, responsable AS responsable FROM departamentos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving departments:', err);
            res.status(500).send({ success: false, message: 'Error retrieving departments' });
            return;
        }
        res.status(200).send({ success: true, departments: results });
    });
});

app.delete('/deleteDepartment/:key', (req, res) => {
    const departmentKey = req.params.key;
    const query = 'DELETE FROM departamentos WHERE clave = ?';
    db.query(query, [departmentKey], (err, result) => {
        if (err) {
            console.error('Error deleting department:', err);
            res.status(500).send({ success: false, message: 'Error deleting department' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send({ success: false, message: 'Departamento no encontrado' });
        } else {
            res.status(200).send({ success: true, message: 'Department deleted successfully' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


 /*Asignación de productos a departamentos*/

 app.post('/assignProduct', (req, res) => {
    const { producto_id, departamento_clave } = req.body;

    // Verificar si el producto existe
    const productoQuery = 'SELECT * FROM productos WHERE id = ?';
    db.query(productoQuery, [producto_id], (err, productoResult) => {
        if (err) {
            console.error('Error al buscar el producto:', err);
            return res.status(500).send({ success: false, message: 'Error al buscar el producto' });
        }

        if (productoResult.length === 0) {
            return res.status(404).send({ success: false, message: 'El producto no existe' });
        }

        // Verificar si el departamento existe
        const departamentoQuery = 'SELECT * FROM departamentos WHERE clave = ?';
        db.query(departamentoQuery, [departamento_clave], (err, departamentoResult) => {
            if (err) {
                console.error('Error al buscar el departamento:', err);
                return res.status(500).send({ success: false, message: 'Error al buscar el departamento' });
            }

            if (departamentoResult.length === 0) {
                return res.status(404).send({ success: false, message: 'El departamento no existe' });
            }

            // Verificar si el producto ya está asignado a algún departamento
            const asignacionQuery = 'SELECT * FROM productos_departamentos WHERE producto_id = ?';
            db.query(asignacionQuery, [producto_id], (err, asignacionResult) => {
                if (err) {
                    console.error('Error al buscar la asignación:', err);
                    return res.status(500).send({ success: false, message: 'Error al buscar la asignación' });
                }

                if (asignacionResult.length > 0) {
                    const currentDepartamento = asignacionResult[0].departamento_clave;

                    if (currentDepartamento === departamento_clave) {
                        return res.status(400).send({ success: false, message: 'El producto ya está asignado a este departamento' });
                    } else {
                        return res.status(400).send({ success: false, message: `El producto ya está asignado al departamento ${currentDepartamento}` });
                    }
                }

                // Insertar la asignación en la tabla intermedia
                const insertQuery = 'INSERT INTO productos_departamentos (producto_id, departamento_clave) VALUES (?, ?)';
                db.query(insertQuery, [producto_id, departamento_clave], (err, result) => {
                    if (err) {
                        console.error('Error al asignar el producto al departamento:', err);
                        return res.status(500).send({ success: false, message: 'Error al asignar el producto al departamento' });
                    }

                    return res.status(200).send({ success: true, message: 'Producto asignado al departamento con éxito' });
                });
            });
        });
    });
});


/*Asignar producto a departamento */
app.post('/assignProductToDepartment', (req, res) => {
    const { productId, departmentKeyassign } = req.body;

    // Verifica que ambos existan
    const checkProductQuery = 'SELECT * FROM productos WHERE id = ?';
    const checkDepartmentQuery = 'SELECT * FROM departamentos WHERE clave = ?';

    db.query(checkProductQuery, [productId], (err, productResults) => {
        if (err) {
            console.error('Error verificando el producto:', err);
            res.status(500).send({ success: false, message: 'Error en el servidor' });
            return;
        }
        if (productResults.length === 0) {
            res.status(404).send({ success: false, message: 'Producto no encontrado' });
            return;
        }

        db.query(checkDepartmentQuery, [departmentKeyassign], (err, departmentResults) => {
            if (err) {
                console.error('Error verificando el departamento:', err);
                res.status(500).send({ success: false, message: 'Error en el servidor' });
                return;
            }
            if (departmentResults.length === 0) {
                res.status(404).send({ success: false, message: 'Departamento no encontrado' });
                return;
            }

            // Asigna el producto al departamento
            const assignQuery = 'INSERT INTO productos_departamentos (product_id, department_key) VALUES (?, ?)';
            db.query(assignQuery, [productId, departmentKeyassign], (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.status(400).send({ success: false, message: 'El producto ya está asignado a este departamento' });
                    } else {
                        console.error('Error asignando producto al departamento:', err);
                        res.status(500).send({ success: false, message: 'Error en el servidor' });
                    }
                    return;
                }
                res.status(200).send({ success: true, message: 'Producto asignado al departamento con éxito' });
            });
        });
    });
});
