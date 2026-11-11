const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateFullName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Escribe tu nombre completo.';
  if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  if (trimmed.length > 80) return 'El nombre no puede superar los 80 caracteres.';
  return null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Escribe tu correo electrónico.';
  if (!isValidEmail(trimmed)) return 'Escribe un correo electrónico válido.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Escribe una contraseña.';
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (value.length > 72) return 'La contraseña no puede superar los 72 caracteres.';
  return null;
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | null {
  if (!confirmation) return 'Confirma tu contraseña.';
  if (password !== confirmation) return 'Las contraseñas no coinciden.';
  return null;
}

export function validateTaskTitle(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'El título de la tarea es obligatorio.';
  if (trimmed.length < 3) return 'El título debe tener al menos 3 caracteres.';
  if (trimmed.length > 120) return 'El título no puede superar los 120 caracteres.';
  return null;
}

export function validateTaskDescription(value: string): string | null {
  if (value.length > 600) return 'La descripción no puede superar los 600 caracteres.';
  return null;
}
