import Component from '@ember/component';
import layout from '../templates/components/search-input';

import { later } from '@ember/runloop';
import { denodeify } from 'rsvp';
import { A } from '@ember/array';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

const SEARCH_DEBOUNCE_PERIOD = 300;

export default Component.extend({
  layout,

  // Public API
  value: '',
  projectVersion: 'v3.0.0',

  _searchClient: service('algolia'),

  // Private API
  classNames: ['search-input'],
  // _projectService: service('project'),
  // _projectVersion: alias('_projectService.standardisedVersion'),
  _results: A(),
  _focused: false,
  _dropdownVisible: computed('_focused', 'value', function() {
    return get(this, '_focused') && isPresent(get(this, 'value'));
  }),
  _resultTetherConstraints: [
    {
      to: 'window',
      pin: ['left','right']
    }
  ],

  search: task(function * (query) {

    yield timeout(SEARCH_DEBOUNCE_PERIOD);

    const client = get(this, '_searchClient');
    // const projectVersion = get(this, '_projectVersion');
    const projectVersion = get(this, 'projectVersion');

    const params = {
      hitsPerPage: 15,
      restrictSearchableAttributes: ['hierarchy.lvl0', 'hierarchy.lvl1', 'hierarchy.lvl2', 'hierarchy.lvl3', 'hierarchy.lvl4'],
      facetFilters: [[`version:${projectVersion}`]]
    };

    const searchObj = {
      indexName: 'emberjs_versions',
      query
    };

    let searchFn = denodeify(client.search.bind(client));
    let res = yield searchFn(searchObj, params);

    const results = get(res, 'hits');
    return get(this, '_results')
      .clear()
      .addObjects(results);
  }).restartable(),

  actions: {
    oninput(value) {
      set(this, 'value', value);
      if(value) {
        get(this, 'search').perform(value);
      }
    },

    onfocus() {
      set(this, '_focused', true);
    },

    onblur() {
      later(this, function () {
        set(this, '_focused', false);
      }, 200);
    }

  }
});
