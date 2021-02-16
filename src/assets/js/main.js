function getUrlVar() {
  const urlVar = window.location.search
  let arrayVar
  let valueAndKey = []
  let resultArray = []
  arrayVar = urlVar.substr(1).split('&')
  if (arrayVar[0] === '') return false
  Array.prototype.forEach.call(arrayVar, (i) => {
    valueAndKey = i.split('=')
    resultArray[valueAndKey[0]] = valueAndKey[1]
  })
  return resultArray
}

const pictures = document.querySelectorAll('.js-picture')
const texts = document.querySelectorAll('.js-text')
const switchers = document.querySelectorAll('.js-switch')
const contentLength = switchers.length
let currentProduct = 1
let currentSwitcher

function hideContent() {
  Array.prototype.forEach.call(pictures, (picture) => {
    picture.classList.remove('is-active')
  })
  Array.prototype.forEach.call(texts, (text) => {
    text.classList.remove('is-active')
  })
}

function hideSwitchers() {
  Array.prototype.forEach.call(switchers, (switcher) => {
    switcher.classList.remove('is-active')
  })
}

// remove all 'is-active' for all contents/controls
function reset() {
  hideContent()
  hideSwitchers()
}

// core function for setting 'is-active' for content
function activation(alias) {
  const text = document.querySelector(`[data-text="${alias}"]`)
  const picture = document.querySelector(`[data-picture="${alias}"]`)
  text.classList.add('is-active')
  picture.classList.add('is-active')
}

// set 'is-active' for content and switcher based on given switcher
function showContent(switcher) {
  const alias = switcher.getAttribute('data-tab-switch')
  switcher.classList.add('is-active')
  activation(alias)
}

// set 'is-active' for content and switcher based on given url param (same as 'alias')
function showContentByUrl(urlParam) {
  const switcher = document.querySelector(`[data-tab-switch="${urlParam}"]`)
  switcher.classList.add('is-active')
  activation(urlParam)
}

// left / right arrows logic
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    if (currentProduct > 1) {
      reset()
      currentProduct--
      const switcher = document.querySelector(`[data-num="${currentProduct}"]`)
      showContent(switcher)
    }
  }
  if (e.key === 'ArrowRight') {
    if (currentProduct < contentLength) {
      reset()
      currentProduct++
      const switcher = document.querySelector(`[data-num="${currentProduct}"]`)
      showContent(switcher)
    }
  }
})

// logic for buttons pressing
Array.prototype.forEach.call(switchers, (switcher) => {
  switcher.addEventListener('click', () => {
    reset()
    showContent(switcher)
    currentProduct = switcher.getAttribute('data-num')
  })
})

// for set content from url
document.addEventListener('DOMContentLoaded', () => {
  const aud_device = getUrlVar()['aud_device']
  if (aud_device) {
    reset()
    showContentByUrl(aud_device)
    const switcher = document.querySelector(`[data-tab-switch="${aud_device}"]`)
    currentProduct = switcher.getAttribute('data-num')
  }
})

