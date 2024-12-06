document.getElementById('addItemForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const itemName = document.getElementById('itemName').value;
    if (itemName) {
        const itemList = document.getElementById('itemList');
        const newItem = document.createElement('li');
        newItem.textContent = itemName;
        newItem.addEventListener('click', function() {
            newItem.classList.toggle('purchased');
        });
        itemList.appendChild(newItem);
        document.getElementById('itemName').value = '';
    }
});

document.getElementById('markPurchased').addEventListener('click', function() {
    const items = document.getElementById('itemList').children;
    for (let item of items) {
        item.classList.toggle('purchased');
    }
});

document.getElementById('clearList').addEventListener('click', function() {
    document.getElementById('itemList').innerHTML = '';
});
