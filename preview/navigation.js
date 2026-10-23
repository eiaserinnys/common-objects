const collectionLink = document.createElement('a');
collectionLink.href = './desk-lamp.html';
collectionLink.className = 'act';
collectionLink.textContent = 'Study lamp ↗';
collectionLink.style.textDecoration = 'none';
document.getElementById('btns').append(collectionLink);
const kitchenLink=collectionLink.cloneNode(true);
kitchenLink.href='./kitchen.html';kitchenLink.textContent='Kitchen rituals ↗';
document.getElementById('btns').append(kitchenLink);
