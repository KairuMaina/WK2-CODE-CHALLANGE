document.addEventListener('DOMContentLoaded', function() {
    const addItemForm = document.getElementById('addItemForm');
    const itemList = document.getElementById('itemList');
    const itemNameInput = document.getElementById('itemName');
    const itemQuantityInput = document.getElementById('itemQuantity');
    const itemCategoryInput = document.getElementById('itemCategory');
    const searchInput = document.getElementById('searchInput');
    const listSelector = document.getElementById('listSelector');
    const newListButton = document.getElementById('newList');

    let lists = JSON.parse(localStorage.getItem('lists')) || { default: [] };
    let currentList = 'default';

    // Load current list
    loadList(currentList);

    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    addItemForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const itemName = itemNameInput.value;
        const itemQuantity = itemQuantityInput.value;
        const itemCategory = itemCategoryInput.value;
        if (itemName && itemQuantity && itemCategory) {
            addItemToDOM(itemName, itemQuantity, itemCategory, false);
            saveItemToLocalStorage(itemName, itemQuantity, itemCategory, false);
            showNotification(`${itemName} added to the list!`);
            itemNameInput.value = '';
            itemQuantityInput.value = 1;
            itemCategoryInput.value = 'Other';
        }
    });

    searchInput.addEventListener('input', function() {
        const searchText = searchInput.value.toLowerCase();
        const items = document.querySelectorAll('#itemList li');
        items.forEach(item => {
            const itemName = item.textContent.toLowerCase();
            item.style.display = itemName.includes(searchText) ? '' : 'none';
        });
    });

    listSelector.addEventListener('change', function(event) {
        currentList = event.target.value;
        loadList(currentList);
    });

    newListButton.addEventListener('click', function() {
        const newListName = prompt('Enter new list name:');
        if (newListName && !lists[newListName]) {
            lists[newListName] = [];
            localStorage.setItem('lists', JSON.stringify(lists));
            const option = document.createElement('option');
            option.value = newListName;
            option.textContent = newListName;
            listSelector.appendChild(option);
            currentList = newListName;
            listSelector.value = newListName;
            loadList(currentList);
        } else {
            alert('List already exists or invalid name.');
        }
    });

    document.getElementById('toggleDarkMode').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

    document.getElementById('markPurchased').addEventListener('click', function() {
        const items = itemList.children;
        for (let item of items) {
            item.classList.toggle('purchased');
            updateItemInLocalStorage(item.firstChild.textContent.split(' (')[0], item.classList.contains('purchased'));
        }
    });

    document.getElementById('clearList').addEventListener('click', function() {
        itemList.innerHTML = '';
        lists[currentList] = [];
        localStorage.setItem('lists', JSON.stringify(lists));
        showNotification('Shopping list cleared!');
    });

    document.getElementById('shareList').addEventListener('click', function() {
        const items = document.querySelectorAll('#itemList li');
        let listContent = 'Shopping List:\n';
        items.forEach(item => {
            listContent += `${item.textContent.split(' - ')[0]} (${item.textContent.split(' - ')[1].split(' ')[0]})\n`;
        });

        const mailtoLink = `mailto:?subject=Shopping List&body=${encodeURIComponent(listContent)}`;
        window.location.href = mailtoLink;
    });

    function loadList(listName) {
        itemList.innerHTML = '';
        (lists[listName] || []).forEach(item => addItemToDOM(item.name, item.quantity, item.category, item.purchased, item.notes));
    }

    function addItemToDOM(name, quantity, category, purchased, notes = '') {
        const newItem = document.createElement('li');
        newItem.innerHTML = `${name} (${quantity}) - ${category} <button class="edit">Edit</button><p>${notes}</p>`;
        newItem.classList.toggle('purchased', purchased);
        newItem.querySelector('.edit').addEventListener('click', function(event) {
            event.stopPropagation();
            const newName = prompt('Edit item name:', name);
            const newQuantity = prompt('Edit item quantity:', quantity);
            const newCategory = prompt('Edit item category:', category);
            const newNotes = prompt('Edit item notes:', notes);
            if (newName && newQuantity && newCategory && newNotes) {
                newItem.innerHTML = `${newName} (${newQuantity}) - ${newCategory} <button class="edit">Edit</button><p>${newNotes}</p>`;
                updateItemInLocalStorage(name, newQuantity, newCategory, newItem.classList.contains('purchased'), newName, newNotes);
                name = newName;
                notes = newNotes;
            }
        });
        newItem.addEventListener('click', function() {
            newItem.classList.toggle('purchased');
            updateItemInLocalStorage(name, newItem.classList.contains('purchased'), notes);
        });
        itemList.appendChild(newItem);
    }

    function saveItemToLocalStorage(name, quantity, category, purchased, notes = '') {
        lists[currentList].push({ name, quantity, category, purchased, notes });
        localStorage.setItem('lists', JSON.stringify(lists));
    }

    function updateItemInLocalStorage(name, purchased, notes, newName = null) {
        lists[currentList] = lists[currentList].map(item => {
            if (item.name === name) {
                return { name: newName || item.name, quantity: item.quantity, category: item.category, purchased: purchased, notes: notes };
            }
            return item;
        });
        localStorage.setItem('lists', JSON.stringify(lists));
    }

    function showNotification(message) {
        if (Notification.permission === 'granted') {
            new Notification(message);
        }
    }
});
