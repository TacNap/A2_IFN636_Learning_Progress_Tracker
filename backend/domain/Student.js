const User = require('./User');

class Student extends User {
  constructor(props) {
    super({ ...props, profileType: props.profileType || Student.profileType });
  }

  static get profileType() {
    return 'student';
  }
}

module.exports = Student;

