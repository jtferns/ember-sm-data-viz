import Ember from 'ember';
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { select } from 'd3-selection';
import { format } from 'd3-format';
import { hsl } from 'd3-color';
import { transition } from 'd3-transition'; // eslint-disable-line no-unused-vars
import cloud from 'ember-sm-data-viz/utils/d3-cloud';
import layout from '../templates/components/word-cloud';

const {
  computed,
  debug,
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
  wordClickHandler: computed(() => (word) => debug(word.text)),
  redrawDelay: computed(() => 1000),
  unfocusedSaturation: computed(() => .2),
  transitionDuration: computed(() => 100),

  didReceiveAttrs() {
    if (isPresent(get(this, 'words'))) {
      run.throttle(this, '_scheduleDraw', get(this, 'redrawDelay'), false);
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
          .attr('focused', (d, i) => get(this, 'fill')(d, i))
          .attr('unfocused', (d, i) => {
            let hslFill = hsl(get(this, 'fill')(d, i));
            return hsl(hslFill.h, hslFill.s * get(this, 'unfocusedSaturation'), hslFill.l);
          })
          .attr('text-anchor', 'middle')
          .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
          .text(d => d.text)
        .on('mouseover', function (d, i, textElements) {
          let { top, left, width } = this.getBoundingClientRect();
          let { height: tipHeight, width: tipWidth } = tooltip.node().getBoundingClientRect();
          let { top: bodyTop } = document.body.getBoundingClientRect();

          let tooltipTop = (top - bodyTop - tipHeight - 10);
          let tooltipLeft = (left + (width / 2) - (tipWidth / 2));

          tooltip.text(format(d.value))
            .style("top", `${tooltipTop}px`)
            .style("left",  `${tooltipLeft}px`);

          tooltip.transition()
            .duration(get(this, 'transitionDuration'))
            .style('opacity', 1);

          textElements.forEach((w) => {
            if (w === this) { return; }
            select(w).transition()
              .duration(get(this, 'transitionDuration'))
              .style('fill', w.getAttribute('unfocused'))
          });
        })
        .on('mouseout', (d, i, textElements) => {
          tooltip.transition()
            .duration(get(this, 'transitionDuration'))
            .style('opacity', 0);

          textElements
            .forEach((w) => select(w).transition()
              .duration(get(this, 'transitionDuration'))
              .style('fill', w.getAttribute('focused'))
            )
        })
        .on('click', d => get(this, 'wordClickHandler')(d));
      });

    layout.start();
  }
});
