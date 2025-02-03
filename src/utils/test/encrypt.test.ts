import { decrypt, encrypt } from '../encrypt';

describe('encrypt()', () => {
  it('Should encrypt the string', () => {
    const regex = /^.{32}:.{32}$/;
    const plain = 'plain';
    const encrypted = encrypt(plain);
    expect(encrypted).toMatch(regex);
  });
});

describe('decrypt()', () => {
  it('Should decrypt the string', () => {
    const plain = 'plain';
    const encrypted = encrypt(plain);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toEqual(plain);
  });
});
