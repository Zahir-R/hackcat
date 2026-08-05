const ROLES: Record<string, string> = {
  abogado: 'Abogado/a',
  psicologo: 'Psicólogo/a',
  trabajador_social: 'Trabajador/a social',
  traductor: 'Traductor/a',
  paralegal: 'Paralegal',
}

const SPECIALTIES: Record<string, string> = {
  familia: 'Derecho de familia',
  pensiones: 'Pensiones alimenticias',
  laboral: 'Derecho laboral',
  penal: 'Derecho penal',
  violencia: 'Violencia',
  infancia: 'Infancia',
  duelo: 'Duelo',
  familiar: 'Terapia familiar',
  orientacion: 'Orientación',
  proteccion: 'Protección',
  quechua: 'Quechua',
  guarani: 'Guaraní',
  señas: 'Lengua de señas',
  ingles: 'Inglés',
  tramites: 'Trámites',
  documentacion: 'Documentación',
  ventanilla: 'Ventanilla',
}

const LANGUAGES: Record<string, string> = {
  es: 'Español',
  qu: 'Quechua',
  gn: 'Guaraní',
  en: 'Inglés',
  lsa: 'Lengua de señas (LSA)',
}

export const useCatalog = () => {
  const roleLabel = (slug: string) => ROLES[slug] ?? slug
  const specialtyLabel = (slug: string) => SPECIALTIES[slug] ?? slug
  const languageLabel = (code: string) => LANGUAGES[code] ?? code

  return {
    roles: Object.keys(ROLES),
    specialties: Object.keys(SPECIALTIES),
    languages: Object.keys(LANGUAGES),
    roleLabel,
    specialtyLabel,
    languageLabel,
  }
}