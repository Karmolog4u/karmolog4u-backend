export function generateUniquePassword(
  length = 12,
  options: {
    includeUppercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {},
): string {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  let characters = lowercaseChars;
  if (options.includeUppercase) characters += uppercaseChars;
  if (options.includeNumbers) characters += numberChars;
  if (options.includeSymbols) characters += symbolChars;

  if (!characters) {
    throw new Error('No character sets selected for password generation.');
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}
