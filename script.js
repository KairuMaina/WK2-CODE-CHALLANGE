document.addEventListener('DOMContentLoaded', function() {
    const addItemForm = document.getElementById('addItemForm');
    const itemList = document.getElementById('itemList');
    const itemNameInput = document.getElementById('itemName');
    const itemQuantityInput = document.getElementById('itemQuantity');
    
    // Load saved items from local storage
    const savedItems = JSON.parse(localStorage.getItem('items')) || [];
    savedItems.forEach(item => addItemToDOM(item.name, item.quantity, item.purchased));

    addItemForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const itemName = itemNameInput.value;
        const itemQuantity = itemQuantityInput.value;
        if (itemName && itemQuantity) {
            addItemToDOM(itemName, itemQuantity, false);
            saveItemToLocalStorage(itemName, itemQuantity, false);
            itemNameInput.value = '';
            itemQuantityInput.value = 1;
        }
    });

    document.getElementById('markPurchased').addEventListener('click', function() {
        const items = itemList.children;
        for (let item of items) {
            item.classList.toggle('purchased');
            updateItemInLocalStorage(item.firstChild.textContent.split(' - ')[0], item.classList.contains('purchased'));
        }
    });

    document.getElementById('clearList').addEventListener('click', function() {
        itemList.innerHTML = '';
        localStorage.removeItem('items');
    });

    function addItemToDOM(name, quantity, purchased) {
        const newItem = document.createElement('li');
        newItem.innerHTML = `${name} - ${quantity} <button class="edit">Edit</button>`;
        newItem.classList.toggle('purchased', purchased);
        newItem.querySelector('.edit').addEventListener('click', function(event) {
            event.stopPropagation();
            const newName = prompt('Edit item name:', name);
            const newQuantity = prompt('Edit item quantity:', quantity);
            if (newName && newQuantity) {
                newItem.firstChild.textContent = `${newName} - ${newQuantity} `;
                updateItemInLocalStorage(name, newQuantity, newItem.classList.contains('purchased'), newName);
                name = newName;  // Update name reference for further edits
            }
        });
        newItem.addEventListener('click', function() {
            newItem.classList.toggle('purchased');
            updateItemInLocalStorage(name, newItem.classList.contains('purchased'));
        });
        itemList.appendChild(newItem);
    }

    function saveItemToLocalStorage(name, quantity, purchased) {
        const items = JSON.parse(localStorage.getItem('items')) || [];
        items.push({ name, quantity, purchased });
        localStorage.setItem('items', JSON.stringify(items));
    }

    function updateItemInLocalStorage(name, purchased, newName = null) {
        let items = JSON.parse(localStorage.getItem('items')) || [];
        items = items.map(item => {
            if (item.name === name) {
                return { name: newName || item.name, quantity: item.quantity, purchased: purchased };
            }
            return item;
        });
        localStorage.setItem('items', JSON.stringify(items));
    }
});
