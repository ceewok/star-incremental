const tooltip = document.getElementById('cursor-tooltip');
const container = document.getElementById('shopContainer');
//const button = document.querySelector('#button1');
//const rect = button.getBoundingClientRect();

function setHoverText(text){
  tooltip.innerText = text;
}


container.addEventListener('mousemove', (e) => {
  // Offset values (20px) keep the box from being directly under the cursor
  let mouseX = e.clientX;
  let mouseY = e.clientY;
  tooltip.style.left = (mouseX + 20) + 'px';
  tooltip.style.top = (mouseY + 20) + 'px';

  //let x = rect.x;
  //let y = rect.y;

  //console.log(Math.hypot(mouseX - x, mouseY - y));

});
