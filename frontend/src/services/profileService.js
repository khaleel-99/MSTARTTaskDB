import api from './api';

const profileService = {
    getProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/profile', profileData);
        return response.data;
    },

    uploadPhoto: async (photoFile) => {
        const formData = new FormData();
        formData.append('photo', photoFile);

        const response = await api.post('/profile/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deletePhoto: async () => {
        const response = await api.delete('/profile/photo');
        return response.data;
    }
};

export default profileService;
