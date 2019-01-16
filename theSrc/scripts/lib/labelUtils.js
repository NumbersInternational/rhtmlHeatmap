import _ from 'lodash'

let uniqueId = 0
function getUniqueId () { return uniqueId++ }
function toRadians (degrees) { return degrees * (Math.PI / 180) }

function getLabelDimensionsUsingSvgApproximation ({parentContainer, text, fontSize, fontFamily, rotation = 0}) {
  const uniqueId = `tempLabel-${getUniqueId()}`

  const container = parentContainer.append('g')
    .attr('class', 'tempLabel')
    .attr('id', uniqueId)

  const textElement = container.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', 0)
    .attr('transform', `rotate(${rotation})`)

  textElement.append('tspan')
    .attr('x', 0)
    .attr('y', 0)
    .style('font-size', `${fontSize}px`)
    .style('font-family', fontFamily)
    .style('dominant-baseline', 'text-before-edge')
    .text(text)

  const {x, y, width: unadjustedWidth, height: unadjustedHeight} = textElement.node().getBBox()

  // NB on some window sizes getBBox will return negative y offsets. Add them to returned value for consistent behaviour
  // across all window sizes
  const unrotatedWidth = unadjustedWidth + x
  const unrotatedHeight = unadjustedHeight + y

  parentContainer.selectAll(`#${uniqueId}`).remove()

  const angleInRads = toRadians(Math.abs(rotation))
  const height = Math.sin(angleInRads) * unrotatedWidth + Math.cos(angleInRads) * unrotatedHeight
  const width = Math.cos(angleInRads) * unrotatedWidth + Math.sin(angleInRads) * unrotatedHeight
  const xOffset = unrotatedHeight * Math.sin(angleInRads)
  const yOffset = -1 * (unrotatedHeight - unrotatedHeight * Math.cos(angleInRads))

  return { width, height, xOffset, yOffset }
}

function wordTokenizer (inputString) {
  const inputString2 = inputString.replace(/<br>/g, ' <br> ')
  return inputString2.split(' ').map(_.trim).filter((token) => !_.isEmpty(token))
}

function splitIntoLinesByWord ({parentContainer, text, fontSize = 12, fontFamily = 'sans-serif', maxWidth, maxHeight, maxLines = null, rotation = 0} = {}) {
  let tokens = wordTokenizer(text)
  return _splitIntoLines({
    parentContainer,
    text,
    fontSize,
    fontFamily,
    maxWidth,
    maxHeight,
    maxLines,
    tokens,
    joinCharacter: ' ',
    rotation
  })
}

function splitIntoLinesByCharacter ({parentContainer, text, fontSize = 12, fontFamily = 'sans-serif', maxWidth, maxHeight, maxLines = null, rotation = 0} = {}) {
  let tokens = text.split('')
  return _splitIntoLines({
    parentContainer,
    text,
    fontSize,
    fontFamily,
    maxWidth,
    maxHeight,
    maxLines,
    tokens,
    joinCharacter: '',
    rotation
  })
}

function _splitIntoLines ({parentContainer, text, fontSize = 12, fontFamily = 'sans-serif', maxWidth, maxHeight, maxLines = null, tokens, joinCharacter, rotation} = {}) {
  let currentLine = []
  let lines = []
  let token = null
  while (token = tokens.shift()) { // eslint-disable-line no-cond-assign
    if (token === '<br>') {
      lines.push(`${currentLine.join(joinCharacter)}`)
      currentLine = []
      continue
    }

    currentLine.push(token)

    const { width, height } = getLabelDimensionsUsingSvgApproximation({
      parentContainer,
      text: currentLine.join(joinCharacter),
      fontSize,
      fontFamily,
      rotation
    })
    if ((width > maxWidth || height > maxHeight) && currentLine.length > 1) {
      if (maxLines && lines.length === maxLines - 1) {
        currentLine.pop()
        currentLine.push('...')
        tokens = []
        lines.push(`${currentLine.join(joinCharacter)}`)
        currentLine = []
        break
      } else {
        tokens.unshift(currentLine.pop())
        lines.push(`${currentLine.join(joinCharacter)}`)
        currentLine = []
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(`${currentLine.join(joinCharacter)}`)
  }

  return lines
}

// NB TODO labelUtils is a bad location for this helper. Initially placed here for ease.
// for debugging
function showLine (svg, coords, color = 'black', note = '') {
  const path = 'M' + coords.map(({x, y}) => `${x} ${y}`).join(' L')
  svg.append('path')
    .classed('debug', true)
    .attr('d', path)
    .attr('stroke', color)
    .attr('stroke-width', 1)
    .attr('fill', 'none')
    .style('opacity', 1)
    .style('display', 'inline')
}

module.exports = {
  getLabelDimensionsUsingSvgApproximation,
  splitIntoLinesByWord,
  splitIntoLinesByCharacter,
  showLine
}
