const User = require('./User');

class Educator extends User {
  constructor(props) {
    super({ ...props, profileType: props.profileType || Educator.profileType });
  }

  static get profileType() {
    return 'educator';
  }
}

module.exports = Educator;

