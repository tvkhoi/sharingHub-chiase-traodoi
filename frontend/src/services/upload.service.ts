import { api } from './api';

export const uploadService = {
  async uploadSingle(file: File): Promise<{ url: string; originalName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<{ url: string; originalName: string }>('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async uploadMultiple(files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await api.post<{ urls: string[] }>('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
