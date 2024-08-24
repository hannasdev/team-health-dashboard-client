import { LocalStorageService } from './LocalStorageService';

describe('LocalStorageService', () => {
  let localStorageService: LocalStorageService;

  beforeEach(() => {
    localStorageService = new LocalStorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should get an item from local storage', () => {
    const key = 'testKey';
    const value = 'testValue';
    localStorage.setItem(key, value);

    const retrievedValue = localStorageService.getItem(key);

    expect(retrievedValue).toBe(value);
  });

  it('should return null when getting a non-existent item', () => {
    const key = 'nonExistentKey';

    const retrievedValue = localStorageService.getItem(key);

    expect(retrievedValue).toBeNull();
  });

  it('should set an item in local storage', () => {
    const key = 'testKey';
    const value = 'testValue';

    localStorageService.setItem(key, value);

    const storedValue = localStorage.getItem(key);
    expect(storedValue).toBe(value);
  });

  it('should remove an item from local storage', () => {
    const key = 'testKey';
    const value = 'testValue';
    localStorage.setItem(key, value);

    localStorageService.removeItem(key);

    const storedValue = localStorage.getItem(key);
    expect(storedValue).toBeNull();
  });
});
