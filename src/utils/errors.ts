import { AuthError } from '@supabase/supabase-js';

export class AuthFlowCancelledError extends Error {
  constructor(message = 'Inicio de sesión cancelado.') {
    super(message);
    this.name = 'AuthFlowCancelledError';
  }
}

type ErrorLike = {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
} | null | undefined;

const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'El correo o la contraseña no son correctos.',
  invalid_grant: 'El enlace de acceso ya no es válido o expiró. Solicita uno nuevo.',
  email_not_confirmed: 'Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.',
  email_exists: 'Ya existe una cuenta con este correo electrónico.',
  user_already_exists: 'Ya existe una cuenta con este correo electrónico.',
  weak_password: 'La contraseña es demasiado débil. Usa al menos 8 caracteres.',
  same_password: 'La nueva contraseña debe ser diferente a la actual.',
  over_email_send_rate_limit: 'Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo.',
  over_request_rate_limit: 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
  invalid_email: 'El correo electrónico no es válido.',
  signup_disabled: 'El registro está deshabilitado en este momento.',
  provider_disabled: 'El proveedor de inicio de sesión no está habilitado.',
  session_not_found: 'Tu sesión expiró. Inicia sesión de nuevo.',
  refresh_token_not_found: 'Tu sesión expiró. Inicia sesión de nuevo.',
  reauthentication_needed: 'Por seguridad, vuelve a iniciar sesión para continuar.',
};

function normalizeMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes('network request failed') || lower.includes('failed to fetch')) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'El correo o la contraseña no son correctos.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Ya existe una cuenta con este correo electrónico.';
  }
  if (lower.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (lower.includes('rate limit')) {
    return 'Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo.';
  }
  if (lower.includes('token has expired') || lower.includes('invalid or has expired')) {
    return 'El enlace ya no es válido o expiró. Solicita uno nuevo.';
  }
  if (lower.includes('auth session missing')) {
    return 'No hay una sesión activa. Inicia sesión de nuevo.';
  }
  return message;
}

export function getAuthErrorMessage(error: ErrorLike): string {
  if (!error) return 'Ocurrió un error inesperado. Inténtalo de nuevo.';

  if (error instanceof AuthError && error.code && AUTH_MESSAGES[error.code]) {
    return AUTH_MESSAGES[error.code];
  }

  if (error.code && AUTH_MESSAGES[error.code]) {
    return AUTH_MESSAGES[error.code];
  }

  if (error.message) {
    return normalizeMessage(error.message);
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function getTaskErrorMessage(error: ErrorLike): string {
  if (!error) return 'No se pudo completar la operación con las tareas.';

  const lower = (error.message ?? '').toLowerCase();
  if (lower.includes('network request failed') || lower.includes('failed to fetch')) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  if (error.code === '42501' || lower.includes('row-level security') || lower.includes('permission denied')) {
    return 'No tienes permiso para realizar esta acción sobre esta tarea.';
  }
  if (error.code === 'PGRST116') {
    return 'La tarea ya no existe o fue eliminada.';
  }
  if (error.message) {
    return error.message;
  }
  return 'No se pudo completar la operación con las tareas.';
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AuthFlowCancelledError) return error.message;
  if (error instanceof Error) return getAuthErrorMessage(error);
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
