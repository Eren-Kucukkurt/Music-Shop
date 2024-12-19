import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    role: '',
    tax_id: '',
    home_address: '',
  });

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get('http://localhost:8000/api/profile/', { headers });
        setProfile(response.data); // Ensure the response format matches the new backend
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put('http://localhost:8000/api/profile/', profile, { headers });
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
    }
  };

  return (
    <div className="profile-page">
      <h2>Your Profile</h2>
      {feedback && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="first_name">First Name</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={profile.first_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="last_name">Last Name</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={profile.last_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="role">Role</label>
        <input type="text" id="role" name="role" value={profile.role} disabled />

        <label htmlFor="tax_id">Tax ID</label>
        <input
          type="text"
          id="tax_id"
          name="tax_id"
          value={profile.tax_id}
          onChange={handleChange}
        />

        <label htmlFor="home_address">Home Address</label>
        <textarea
          id="home_address"
          name="home_address"
          value={profile.home_address}
          onChange={handleChange}
        ></textarea>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default ProfilePage;
