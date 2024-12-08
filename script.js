document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addItemForm');
    const itemList = document.getElementById('itemList');
    const searchInput = document.getElementById('searchInput');
    const listSelector = document.getElementById('listSelector');
    const localStorageKey = 'shoppingLists';
    let currentList = 'default';

    // Load lists and items
    const loadLists = () => {
        const savedLists = JSON.parse(localStorage.getItem(localStorageKey)) || { default: [] };
        if (!savedLists[currentList]) savedLists[currentList] = [];
        return savedLists;
    };

    const saveLists = (lists) => {
        localStorage.setItem(localStorageKey, JSON.stringify(lists));
    };

    const loadItems = () => {
        const lists = loadLists();
        itemList.innerHTML = ''; // Clear current items
        lists[currentList].forEach(addItemToDOM);
    };

    const saveItems = () => {
        const lists = loadLists();
        lists[currentList] = [...itemList.children].map(item => ({
            name: item.querySelector('.name').textContent,
            quantity: item.querySelector('.quantity').textContent.replace(/[()]/g, ''),
            category: item.querySelector('.category').textContent,
            notes: item.dataset.notes || '',
            purchased: item.classList.contains('purchased'),
        }));
        saveLists(lists);
    };

    const addItemToDOM = ({ name, quantity, category, notes = '', purchased = false }) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        li.classList.toggle('purchased', purchased);
        li.dataset.notes = notes; // Store notes in dataset

        li.innerHTML = `
            <div>
                <input type="checkbox" class="mark-purchased me-2" ${purchased ? 'checked' : ''}>
                <span class="name">${name}</span>
                <span class="quantity">(${quantity})</span>
                <span class="category text-muted ms-2">${category}</span>
                ${notes ? `<small class="text-info d-block">Note: ${notes}</small>` : ''}
            </div>
            <div>
                <button class="btn btn-sm btn-info edit-btn"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Mark as Purchased
        li.querySelector('.mark-purchased').addEventListener('change', (e) => {
            li.classList.toggle('purchased', e.target.checked);
            saveItems();
        });

        // Delete Item
        li.querySelector('.delete-btn').addEventListener('click', () => {
            itemList.removeChild(li);
            saveItems();
        });

        // Edit Item
        li.querySelector('.edit-btn').addEventListener('click', () => {
            const newName = prompt('Enter new name:', name);
            const newQuantity = prompt('Enter new quantity:', quantity);
            const newCategory = prompt('Enter new category:', category);
            const newNotes = prompt('Enter new notes:', notes);

            if (newName && newQuantity && newCategory) {
                li.querySelector('.name').textContent = newName;
                li.querySelector('.quantity').textContent = `(${newQuantity})`;
                li.querySelector('.category').textContent = newCategory;
                li.dataset.notes = newNotes;
                li.querySelector('.text-info')?.remove(); // Remove old notes if any
                if (newNotes) {
                    const noteElement = document.createElement('small');
                    noteElement.classList.add('text-info', 'd-block');
                    noteElement.textContent = `Note: ${newNotes}`;
                    li.querySelector('div').appendChild(noteElement);
                }
                saveItems();
            }
        });

        itemList.appendChild(li);
    };

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.itemName.value.trim();
        const quantity = form.itemQuantity.value;
        const category = form.itemCategory.value;
        const notes = form.itemNotes.value.trim();

        if (!name) {
            document.getElementById('itemNameError').hidden = false;
            return;
        }

        document.getElementById('itemNameError').hidden = true;
        addItemToDOM({ name, quantity, category, notes });
        saveItems();
        form.reset();
    });

    // Search Items
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        [...itemList.children].forEach(item => {
            const name = item.querySelector('.name').textContent.toLowerCase();
            item.style.display = name.includes(query) ? '' : 'none';
        });
    });

    // Manage Lists
    const updateListSelector = () => {
        const lists = loadLists();
        listSelector.innerHTML = '';
        Object.keys(lists).forEach(listName => {
            const option = document.createElement('option');
            option.value = listName;
            option.textContent = listName;
            if (listName === currentList) option.selected = true;
            listSelector.appendChild(option);
        });
    };

    listSelector.addEventListener('change', (e) => {
        currentList = e.target.value;
        loadItems();
    });

    document.getElementById('newList').addEventListener('click', () => {
        const newListName = prompt('Enter new list name:');
        if (newListName) {
            const lists = loadLists();
            if (!lists[newListName]) {
                lists[newListName] = [];
                saveLists(lists);
                updateListSelector();
                listSelector.value = newListName;
                currentList = newListName;
                loadItems();
            } else {
                alert('List already exists!');
            }
        }
    });

    // Sort Items
    new Sortable(itemList, {
        animation: 150,
        onEnd: saveItems,
    });

    // Initial Load
    updateListSelector();
    loadItems();
});
