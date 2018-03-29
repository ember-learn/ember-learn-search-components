import Component from '@ember/component';
import layout from '../../templates/components/search-input/dropdown-result';

import { gt } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Component.extend({
  layout,

  // Public API
  result: {},
  role: 'option',
  groupName: '',
  groupPosition: 0, // Index of this result in the grouped results

  // Private API
  classNames: ['ds-suggestion'],
  attributeBindings: ['role'],

  // Left sidebar should only be displayed for the first result in the group
  _primaryColumn: computed('groupPosition,groupName', function () {
    const { groupName, groupPosition } = this.getProperties('groupName', 'groupPosition');
    return groupPosition === 0? groupName : '';
  }),
  isSecondary: gt('groupPosition', 0)
});
