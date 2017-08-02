import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('word-cloud', 'Integration | Component | word cloud', {
  integration: true
});

test('it renders, for now', function(assert) {
  this.render(hbs`{{word-cloud}}`);

  assert.ok(this.$().text(), 'everything is on 🔥');
});
