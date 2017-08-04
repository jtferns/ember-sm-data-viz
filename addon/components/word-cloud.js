import Ember from 'ember';
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { mouse, select } from 'd3-selection';
import { format } from 'd3-format';
import cloud from 'ember-sm-data-viz/utils/d3-cloud';
import layout from '../templates/components/word-cloud';

const {
  computed,
  get,
  getProperties,
  isPresent,
  run,
  Component,
} = Ember;

export default Component.extend({
  layout,

  words: computed(() => []),
  width: computed(() => 1024),
  height: computed(() => 512),
  padding: computed(() => 2),
  font: computed(() => 'Helvetica'),
  rotate: computed(() => 0),
  format: computed(() => format(',d')),
  fontWeight: computed(() => () => 400),
  fill: computed('colorScale', function() {
    return (d, i) => get(this, 'colorScale')(i);
  }),
  fontSize: computed(() => (word) => Math.sqrt(word.value)),
  colorScale: computed(() => scaleOrdinal(schemeCategory10)),

  didReceiveAttrs() {
    if (isPresent(get(this, 'words'))) {
      run.throttle(this, '_scheduleDraw', 1000, false);
    }
  },

  _scheduleDraw() {
    run.scheduleOnce('afterRender', this, '_drawWordCloud');
  },

  _drawWordCloud() {
    const {
      width, height, font, padding, rotate, format,
    } = getProperties(this, ['width', 'height', 'font', 'padding', 'rotate', 'format']);

    select(this.element).selectAll('*').remove();

    const tooltip = select(this.element).append('div')
      .attr('class', 'word-cloud-tooltip');

    const layout = cloud()
      .size([width, height])
      .font(font)
      .words(get(this, 'words'))
      .padding(padding)
      .rotate(rotate)
      .fontSize((word) => get(this, 'fontSize')(word))
      .fontWeight((word) => get(this, 'fontWeight')(word))
      .on('end', words => {
        select(this.element).append('svg')
          .attr('width', layout.size()[0])
          .attr('height', layout.size()[1])
        .append('g')
          .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`)
        .selectAll('text')
          .data(words)
        .enter().append('text')
          .attr('class', 'word-cloud-text')
          .style('font-size', d => `${d.size}px`)
          .style('font-family', font)
          .style('font-weight', d => d.weight)
          .style('fill', (d, i) => get(this, 'fill')(d, i))
          .attr('text-anchor', 'middle')
          .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
          .text(d => d.text)
        .on('mouseover', d => {
          let [left, top] = mouse(this.element);
          tooltip.text(format(d.value))
            .style('opacity', 1)
            .style("top", (top + 25) + "px")
            .style("left",(left - 50) + "px")
        })
        .on('mouseout', () => tooltip.style('opacity', 0));
      });

    layout.start();
  }
});
