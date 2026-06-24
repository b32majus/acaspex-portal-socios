export const documentTypeOptions = [
  { value: 'dni', label: 'DNI' },
  { value: 'nie', label: 'NIE' },
  { value: 'passport', label: 'Pasaporte' },
] as const;

export type DocumentType = (typeof documentTypeOptions)[number]['value'];

export const professionalCategoryOptions = [
  { value: '', label: 'Selecciona una categoría' },
  { value: 'Enfermero/a', label: 'Enfermero/a' },
  { value: 'Enfermero/a Especialista', label: 'Enfermero/a Especialista' },
  { value: 'Farmacéutico/a', label: 'Farmacéutico/a' },
  { value: 'Fisioterapeuta', label: 'Fisioterapeuta' },
  { value: 'Logopeda', label: 'Logopeda' },
  { value: 'Médico/a', label: 'Médico/a' },
  { value: 'Odontólogo/a', label: 'Odontólogo/a' },
  { value: 'Personal Administrativo', label: 'Personal Administrativo' },
  { value: 'Psicólogo/a', label: 'Psicólogo/a' },
  { value: 'Residente Formación Sanitaria Especializada', label: 'Residente Formación Sanitaria Especializada' },
  { value: 'Técnico en Cuidados Auxiliares de Enfermería', label: 'Técnico en Cuidados Auxiliares de Enfermería' },
  { value: 'Técnico Especialista', label: 'Técnico Especialista' },
  { value: 'Terapeuta Ocupacional', label: 'Terapeuta Ocupacional' },
  { value: 'Trabajador/a Social', label: 'Trabajador/a Social' },
  { value: 'Veterinario/a', label: 'Veterinario/a' },
  { value: 'Otras', label: 'Otras' },
] as const;

export const organizationOptions = [
  { value: '', label: 'Selecciona una organización' },
  { value: 'Área de Salud de Badajoz', label: 'Área de Salud de Badajoz' },
  { value: 'Área de Salud de Cáceres', label: 'Área de Salud de Cáceres' },
  { value: 'Área de Salud de Coria', label: 'Área de Salud de Coria' },
  { value: 'Área de Salud de Don Benito-Villanueva de la Serena', label: 'Área de Salud de Don Benito-Villanueva de la Serena' },
  { value: 'Área de Salud de Llerena-Zafra', label: 'Área de Salud de Llerena-Zafra' },
  { value: 'Área de Salud de Mérida', label: 'Área de Salud de Mérida' },
  { value: 'Área de Salud de Navalmoral de la Mata', label: 'Área de Salud de Navalmoral de la Mata' },
  { value: 'Área de Salud de Plasencia', label: 'Área de Salud de Plasencia' },
  { value: 'Mutuas Colaboradoras con la Seguridad Social', label: 'Mutuas Colaboradoras con la Seguridad Social' },
  { value: 'Organización de Pacientes', label: 'Organización de Pacientes' },
  { value: 'Sector Privado', label: 'Sector Privado' },
  { value: 'SEPAD', label: 'SEPAD' },
  { value: 'Servicios Centrales SES', label: 'Servicios Centrales SES' },
  { value: 'Universidad de Extremadura', label: 'Universidad de Extremadura' },
  { value: 'Otras', label: 'Otras' },
] as const;

export const memberProfileOptions = [
  { value: 'general', label: 'General (50 €/año)' },
  { value: 'residente', label: 'Residente (30 €/año)' },
  { value: 'estudiante', label: 'Estudiante (30 €/año)' },
  { value: 'jubilado', label: 'Jubilado (30 €/año)' },
] as const;

export type MemberProfile = (typeof memberProfileOptions)[number]['value'];

export const memberStatusOptions = [
  { value: 'pending_review', label: 'Pendiente de revisión' },
  { value: 'active', label: 'Activo' },
  { value: 'expired', label: 'Vencido' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'cancelled', label: 'Baja' },
] as const;

export type MemberStatus = (typeof memberStatusOptions)[number]['value'];
