import jwa from 'jwa';

const es256 = jwa('ES256');

export const sign = (message: string, privateKey: string) => es256.sign(message, privateKey);
