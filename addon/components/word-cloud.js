import Ember from 'ember';
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { select } from 'd3-selection';
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
  fill: computed(() => (d, i) => scaleOrdinal(schemeCategory10)(i)),
  fontSize: computed(() => (word) => Math.sqrt(word.value)),

  didReceiveAttrs() {
    if (isPresent(get(this, 'words'))) {
      run.scheduleOnce('afterRender', this, '_drawWordCloud');
    }
  },

  _drawWordCloud() {
    const {
      width, height, font, padding, rotate,
    } = getProperties(this, ['width', 'height', 'font', 'padding', 'rotate']);

    select(this.element).selectAll('*').remove();

    const layout = cloud()
      .size([width, height])
      .font(font)
      .words(get(this, 'words'))
      .padding(padding)
      .rotate(rotate)
      .fontSize((word) => get(this, 'fontSize')(word))
      .on('end', words => {
        select(this.element).append('svg')
          .attr('width', layout.size()[0])
          .attr('height', layout.size()[1])
        .append('g')
          .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`)
        .selectAll('text')
          .data(words)
        .enter().append('text')
          .style('font-size', d => `${d.size}px`)
          .style('font-family', font)
          .style('fill', (d, i) => get(this, 'fill')(d, i))
          .attr('text-anchor', 'middle')
          .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
          .text(d => d.text);
      });

    layout.start();
  }
});
