class User {
  constructor({ id, name, email, university = null, address = null, profileType, createdAt, updatedAt }) {
    if (new.target === User) {
      throw new Error('User is abstract and cannot be instantiated directly');
    }

    if (!name) throw new Error('User name is required');
    if (!email) throw new Error('User email is required');

    this.id = id;
    this.name = name;
    this.email = email;
    this.university = university;
    this.address = address;
    this.profileType = profileType;
    this.createdAt = createdAt ? new Date(createdAt) : undefined;
    this.updatedAt = updatedAt ? new Date(updatedAt) : undefined;
  }

  get type() {
    return this.profileType;
  }

  updateProfile({ name, email, university, address }) {
    if (name !== undefined) this.name = name;
    if (email !== undefined) this.email = email;
    if (university !== undefined) this.university = university;
    if (address !== undefined) this.address = address;
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      university: this.university,
      address: this.address,
      profileType: this.profileType,
    };
  }
}

module.exports = User;

