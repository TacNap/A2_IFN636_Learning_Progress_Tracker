import { useEffect, useMemo, useState } from 'react';
import NavigationPanel from '../components/NavigationPanel';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import './Profile.css';

const createInitialState = () => ({
  name: '',
  email: '',
  university: '',
  address: '',
});

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(() => createInitialState());
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const displayName = user?.name || 'there';
  const roleLabel = user?.profileType === 'educator' ? 'Educator' : 'Student';
  const initials = useMemo(() => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return 'NA';
  }, [user]);

  const navItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: 'DB', to: user?.profileType === 'educator' ? '/educator' : '/student' },
      { id: 'module', label: 'Module', icon: 'MD', to: '/modules' },
      { id: 'assignment', label: 'Assignment', icon: 'AS', to: '/assignments' },
      { id: 'certificate', label: 'Certificate', icon: 'CF', to: '/certificates' },
    ],
    [user?.profileType]
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) {
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = response.data || {};
        setFormData({
          name: data.name || '',
          email: data.email || '',
          university: data.university || '',
          address: data.address || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        window.alert('Failed to fetch profile. Please try again.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-main">
          <p className="profile-loading">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.token) return;

    setIsSaving(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      window.alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      window.alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <NavigationPanel
        className="profile-navigation"
        title="Navigation"
        welcomeMessage="Welcome back!"
        initials={initials}
        userName={user?.name}
        userRole={roleLabel}
        items={navItems}
      />

      <main className="profile-main">
        <header className="profile-header">
          <h1>My Account</h1>
          <p>Hello! {displayName}</p>
        </header>

        {isFetching ? (
          <div className="profile-loading">Loading your details...</div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <label className="profile-field">
              <span className="profile-field__icon" aria-hidden="true">
                NM
              </span>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSaving}
              />
            </label>

            <label className="profile-field">
              <span className="profile-field__icon" aria-hidden="true">
                EM
              </span>
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSaving}
              />
            </label>

            <label className="profile-field">
              <span className="profile-field__icon" aria-hidden="true">
                UN
              </span>
              <input
                type="text"
                name="university"
                placeholder="University"
                value={formData.university}
                onChange={handleChange}
                disabled={isSaving}
              />
            </label>

            <label className="profile-field">
              <span className="profile-field__icon" aria-hidden="true">
                AD
              </span>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                disabled={isSaving}
              />
            </label>

            <div className="profile-actions">
              <button type="submit" className="profile-submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Edit Profile'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Profile;
