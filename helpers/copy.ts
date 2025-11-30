export const  copy = (event: MouseEvent, str: string) => {
  const {clientX, clientY} = event

  const span = document.createElement('span')
  span.appendChild(document.createTextNode('скопировано'))
  span.classList.add('fly-up')
  span.classList.add('copied')
  span.style.cssText = `position:absolute;left:${clientX}px;top:${clientY}px; z-index: 999`
  document.body.appendChild(span)
  setTimeout(() => {
    document.body.removeChild(span)
  }, 1900)



  navigator.clipboard.writeText(str).then(() => {
    // Copied to clipboard
  }, (err) => {
    console.error('Async: Could not copy text: ', err);
  });
}