document.addEventListener('DOMContentLoaded', animate);

function animate() {

  let circles = document.querySelectorAll('#circles circle');

  circles.forEach((circle, i)=>{
    setTimeout(() => {
      circle.classList.add('animate')
    }, i * 250);
  })

}

//J-C Castagne - Raindrops
//Github @ https://github.com/JCcastagne
