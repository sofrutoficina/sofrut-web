import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export function useUser() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('sofrut-user='));

        if (userCookie) {
          const data = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          setUserData(data);
        }
      } catch (error) {
        console.error('Error leyendo datos de usuario:', error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return { userData, loading };
}
