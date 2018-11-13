import BaseComponent from './baseComponent'
import _ from 'lodash'
import wrap_new from '../heatmapcore/wrap_new'

// TODO preferred dimensions must account for maxes
// TODO combine with other title classes
class XAxis extends BaseComponent {
  constructor ({parentContainer, text, name, padding, fontSize, fontFamily, fontColor, bold, maxWidth}) {
    super()
    _.assign(this, {parentContainer, text, name, padding, fontSize, fontFamily, fontColor, bold, maxWidth})
  }

  computePreferredDimensions () {
    var dummySvg = this.parentContainer.append('svg')
    var dummy_g = dummySvg
      .append('g')
      .classed('dummy_g', true)

    var text_el = dummy_g.append('text')
      .text(this.text)
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', 0)
      .style('font-family', this.fontFamily)
      .style('font-size', this.fontSize)
      .style('fill', this.fontColor)
      .attr('font-weight', this.bold ? 'bold' : 'normal')
      .call(wrap_new, this.maxWidth)

    var bbox = text_el.node().getBBox()
    dummySvg.remove()
    return {width: bbox.width + 2 * this.padding, height: bbox.height}
  }

  draw (bounds) {
    const titleContainer = this.parentContainer
      .append('g')
      .classed('title', true)
      .classed(this.name, true)
      .attr('transform', this.buildTransform(bounds))

    titleContainer.append('text')
      .text(this.text)
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', 0)
      .attr('transform', `translate(${bounds.width / 2},${this.fontSize})`)
      .style('font-weight', (this.bold) ? 'bold' : 'normal')
      .style('font-size', this.fontSize)
      .style('fill', this.fontColor)
      .style('font-family', this.fontFamily)
      .style('text-anchor', 'middle')
      .call(wrap_new, this.maxWidth)
  }
}

module.exports = XAxis
