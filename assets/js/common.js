function displayBlock(targetId) {
  const parentDiv = document.getElementById('main');

  if (parentDiv) {
    const childDivs = parentDiv.children;

    for (let child of childDivs) {
        if (child.tagName == "DIV") {
            if (child.id !== targetId) {
                child.style.display = 'none';

              } else {
                child.style.display = 'block';
              }
        }
    }
  } else {
    console.error('Родительский элемент не найден');
  }
}