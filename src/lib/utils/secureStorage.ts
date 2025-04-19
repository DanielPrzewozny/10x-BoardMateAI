const ENCRYPTION_KEY = 'boardmate-storage-key'; // To powinno być w zmiennych środowiskowych

const isClient = typeof window !== 'undefined';

export const secureStorage = {
  // Szyfrowanie danych przed zapisem
  encrypt(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      // Używamy Base64 do podstawowego zabezpieczenia i utrudnienia odczytu
      const encoded = btoa(
        encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
          function toSolidBytes(match, p1) {
            return String.fromCharCode(Number('0x' + p1));
          })
      );
      return encoded;
    } catch (e) {
      console.error('Encryption error:', e);
      return '';
    }
  },

  // Deszyfrowanie danych po odczycie
  decrypt(encoded: string): any {
    try {
      const jsonString = decodeURIComponent(
        atob(encoded).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Decryption error:', e);
      return null;
    }
  },

  // Zapisz zaszyfrowane dane
  setItem(key: string, data: any): void {
    if (!isClient) return;
    const encrypted = this.encrypt(data);
    localStorage.setItem(key, encrypted);
  },

  // Odczytaj i odszyfruj dane
  getItem(key: string): any {
    if (!isClient) return null;
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  },

  // Usuń dane
  removeItem(key: string): void {
    if (!isClient) return;
    localStorage.removeItem(key);
  }
}; 