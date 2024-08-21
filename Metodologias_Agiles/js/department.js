document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const addDepartmentForm = document.getElementById('addDepartmentForm');
    const deleteDepartmentForm = document.getElementById('deleteDepartmentForm');
    const departmentList = document.getElementById('departmentList');
    const assignProductForm = document.getElementById('assignProductForm');
    const altaDepartamentoButton = document.getElementById('altaDepartamento');
    const consultarDepartamentoButton = document.getElementById('consultarDepartamento');
    const bajaDepartamentoButton = document.getElementById('bajaDepartamento');
    const asignarProductoButton = document.getElementById('asignarProducto');

    // Toggle visibility of forms
    function toggleVisibility(element) {
        if (element) {
            element.classList.toggle('hidden');
        }
    }

    // Toggle visibility of addDepartmentForm
    if (altaDepartamentoButton) {
        altaDepartamentoButton.addEventListener('click', function(event) {
            event.preventDefault();
            toggleVisibility(addDepartmentForm);
        });
    }

    // Display departments in the list
    function displayDepartments(departments) {
        departmentList.innerHTML = '';
        departments.forEach(department => {
            const departmentItem = document.createElement('div');
            departmentItem.textContent = `Clave: ${department.clave}, Nombre: ${department.nombre}, Responsable: ${department.responsable}`;
            departmentList.appendChild(departmentItem);
        });
        departmentList.classList.remove('hidden');
    }

    // Fetch departments and display them
    async function fetchDepartments() {
        try {
            const response = await fetch('http://localhost:3000/getDepartments');
            const data = await response.json();
            if (data.success) {
                displayDepartments(data.departments);
            } else {
                alert('Error al obtener los departamentos');
            }
        } catch (error) {
            console.error('Error al obtener los departamentos:', error);
            alert('Hubo un problema al obtener los departamentos. Inténtalo de nuevo más tarde.');
        }
    }

    // Add department
    async function addDepartment(departmentData) {
        try {
            const response = await fetch('http://localhost:3000/addDepartment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(departmentData)
            });
            const data = await response.json();
            if (data.success) {
                alert('Departamento agregado con éxito');
                addDepartmentForm.reset();
            } else {
                alert('Error al agregar el departamento');
            }
            toggleVisibility(addDepartmentForm);
        } catch (error) {
            console.error('Error al agregar el departamento:', error);
            alert('Hubo un problema al agregar el departamento. Inténtalo de nuevo más tarde.');
        }
    }

    // Delete department
    async function deleteDepartment(departmentKey) {
        try {
            const response = await fetch(`http://localhost:3000/deleteDepartment/${departmentKey}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                alert('Departamento eliminado con éxito');
            } else {
                alert('Error al eliminar el departamento: ' + data.message);
            }
            toggleVisibility(deleteDepartmentForm);
        } catch (error) {
            console.error('Error al eliminar el departamento:', error);
            alert('Hubo un problema al eliminar el departamento. Inténtalo de nuevo más tarde.');
        }
    }

    // Event listeners
    if (consultarDepartamentoButton) {
        consultarDepartamentoButton.addEventListener('click', function(event) {
            event.preventDefault();
            fetchDepartments();
        });
    }

    if (bajaDepartamentoButton) {
        bajaDepartamentoButton.addEventListener('click', function(event) {
            event.preventDefault();
            toggleVisibility(deleteDepartmentForm);
        });
    }

    if (asignarProductoButton) {
        asignarProductoButton.addEventListener('click', function(event) {
            event.preventDefault();
            toggleVisibility(assignProductForm);
        });
    }

    if (addDepartmentForm) {
        addDepartmentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const departmentData = {
                clave: document.getElementById('departmentKey').value,
                nombre: document.getElementById('departmentName').value,
                responsable: document.getElementById('departmentHead').value
            };

            if (departmentData.clave && departmentData.nombre && departmentData.responsable) {
                addDepartment(departmentData);
            } else {
                alert('Por favor, completa todos los campos.');
            }
        });
    }

    if (deleteDepartmentForm) {
        deleteDepartmentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const departmentKey = document.getElementById('departmentKeyToDelete').value;
            deleteDepartment(departmentKey);
        });
    }

    if (assignProductForm) {
        assignProductForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const productId = document.getElementById('productId').value.trim();
            const departmentKeyassign = document.getElementById('departmentKeyassign').value.trim();

            if (!productId || !departmentKeyassign) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            const assignmentData = {
                producto_id: productId,
                departamento_clave: departmentKeyassign
            };

            fetch('http://localhost:3000/assignProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Producto asignado al departamento con éxito');
                    assignProductForm.reset();
                    toggleVisibility(assignProductForm);
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error al asignar el producto:', error);
                alert('Hubo un problema al asignar el producto. Inténtalo de nuevo más tarde.');
            });
        });
    }
});
