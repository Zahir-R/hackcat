import type { Specialist, AvailabilitySlot, ForumTopic, Booking } from '../../app/types'

export interface I18nText { es: string; qu: string; gn: string; en: string }

export interface FaqItemRaw {
  id: string
  categoryId: string
  categoryLabel: string
  question: I18nText
  answer: I18nText
  keywords: string[]
  targetType: 'PAGE' | 'SPECIALISTS_FILTER' | 'FORUM_TOPIC' | 'PROFILE'
  targetId: string
  ageMode: 'CHILD' | 'ADULT' | 'ELDER' | 'ALL'
}

export interface FaqCategoryRaw {
  id: string
  slug: string
  label: string
  items: FaqItemRaw[]
}

export const CATALOG = {
  roles: [
    { slug: 'abogado', label: { es: 'Abogado', qu: 'Abogado', gn: 'Abogado', en: 'Lawyer' } },
    { slug: 'psicologo', label: { es: 'Psicólogo/a', qu: 'Psicólogo', gn: 'Psicólogo', en: 'Psychologist' } },
    { slug: 'trabajador_social', label: { es: 'Trabajador/a social', qu: 'Trabajador social', gn: 'Trabajador social', en: 'Social worker' } },
    { slug: 'traductor', label: { es: 'Traductor/a', qu: 'Tradúctor', gn: 'Tradúctor', en: 'Translator' } },
    { slug: 'paralegal', label: { es: 'Paralegal', qu: 'Paralegal', gn: 'Paralegal', en: 'Paralegal' } },
  ],
  specialties: {
    abogado: ['familia', 'pensiones', 'laboral', 'penal', 'violencia'],
    psicologo: ['infancia', 'violencia', 'duelo', 'familiar'],
    trabajador_social: ['orientacion', 'familiar', 'proteccion'],
    traductor: ['quechua', 'guarani', 'señas', 'ingles'],
    paralegal: ['tramites', 'documentacion', 'ventanilla'],
  },
  languages: [
    { code: 'es', label: { es: 'Español', en: 'Spanish' } },
    { code: 'qu', label: { es: 'Quechua', en: 'Quechua' } },
    { code: 'gn', label: { es: 'Guaraní', en: 'Guaraní' } },
    { code: 'en', label: { es: 'Inglés', en: 'English' } },
    { code: 'lsa', label: { es: 'Lengua de señas (LSA)', en: 'Sign language (LSA)' } },
  ],
}

export const specialists: Specialist[] = [
  {
    id: 'sp-1', profileId: 'sp-1', name: 'Dra. Ana Condori', status: 'APPROVED',
    headline: 'Abogada en derecho de familia y pensiones alimenticias',
    bio: 'Abogada con 10 años de experiencia en Sucre. Acompaña procesos de pensiones alimenticias, guarda y divorcios. Atención en español y quechua.',
    experienceYears: 10, city: 'Sucre', lat: -19.0333, lng: -65.2627,
    roles: ['abogado'], specialties: ['familia', 'pensiones'], languages: ['es', 'qu'],
  },
  {
    id: 'sp-2', profileId: 'sp-2', name: 'Lic. Marco Villca', status: 'APPROVED',
    headline: 'Psicólogo especializado en infancia y violencia de género',
    bio: 'Psicólogo clínico y comunitario. Acompaña a niños, niñas y mujeres en situación de violencia. Talleres y orientación familiar.',
    experienceYears: 7, city: 'Sucre', lat: -19.0390, lng: -65.2580,
    roles: ['psicologo'], specialties: ['infancia', 'violencia'], languages: ['es', 'qu'],
  },
  {
    id: 'sp-3', profileId: 'sp-3', name: 'Dra. Rosa Quispe', status: 'APPROVED',
    headline: 'Abogada laboral — Ley General del Trabajo',
    bio: 'Asesora en despidos injustificados, salarios impagos y conflictos laborales. Atención presencial y por llamada.',
    experienceYears: 5, city: 'Sucre', lat: -19.0280, lng: -65.2680,
    roles: ['abogado'], specialties: ['laboral'], languages: ['es'],
  },
  {
    id: 'sp-4', profileId: 'sp-4', name: 'Téc. Jorge Mamani', status: 'APPROVED',
    headline: 'Paralegal — trámites en ventanilla',
    bio: 'Especialista en documentación y trámites ante el Tribunal y el Ministerio Público. Acompañamiento en ventanilla.',
    experienceYears: 4, city: 'Sucre', lat: -19.0250, lng: -65.2560,
    roles: ['paralegal'], specialties: ['tramites', 'documentacion'], languages: ['es', 'lsa'],
  },
  {
    id: 'sp-5', profileId: 'sp-5', name: 'Lic. Patricia Aguirre', status: 'APPROVED',
    headline: 'Trabajadora social — orientación y protección',
    bio: 'Orientación psicosocial, gestiones con el SLIM y Defensoría de la Niñez. Atención en quechua y español.',
    experienceYears: 8, city: 'Sucre', lat: -19.0360, lng: -65.2700,
    roles: ['trabajador_social'], specialties: ['orientacion', 'proteccion'], languages: ['es', 'qu'],
  },
  {
    id: 'sp-6', profileId: 'sp-6', name: 'Sra. Elvira Choque', status: 'APPROVED',
    headline: 'Traductora quechua-español y lengua de señas',
    bio: 'Interpretación para trámites legales y audiencias. Apoya la comunicación entre usuarios y profesionales.',
    experienceYears: 6, city: 'Sucre', lat: -19.0310, lng: -65.2600,
    roles: ['traductor'], specialties: ['quechua', 'señas'], languages: ['qu', 'lsa', 'es'],
  },
  {
    id: 'sp-7', profileId: 'sp-7', name: 'Dr. Pablo Siles', status: 'PENDING',
    headline: 'Abogado penalista',
    bio: 'Defensa penal en Sucre. (Solicitud en revisión.)',
    experienceYears: 3, city: 'Sucre', lat: -19.0340, lng: -65.2640,
    roles: ['abogado'], specialties: ['penal'], languages: ['es'],
  },
  {
    id: 'sp-8', profileId: 'sp-8', name: 'Dra. Carmen Roca', status: 'APPROVED',
    headline: 'Abogada en violencia de género — Ley 348',
    bio: 'Acompañamiento legal a mujeres sobrevivientes de violencia. Trabaja con FELCV y SLIM. Inglés disponible.',
    experienceYears: 12, city: 'Sucre', lat: -19.0300, lng: -65.2550,
    roles: ['abogado'], specialties: ['violencia'], languages: ['es', 'en'],
  },
]

const faqItems: FaqItemRaw[] = [
  {
    id: 'fq-1', categoryId: 'cat-familia', categoryLabel: 'Familia y pensiones',
    question: { es: '¿Cómo pido la pensión alimenticia?', qu: '¿Imaynallata mañakuni?', gn: '¿Mba\'éichapa ajeruré?', en: 'How do I request child support?' },
    answer: {
      es: 'La pensión alimenticia se tramita ante el Juzgado de Familia. Reúne: certificado de nacimiento, cédula de identidad y datos del demandado. Un abogado de familia puede guiarte en todo el proceso.',
      qu: 'Pensión alimenticia nisqataqa Juzgado de Familia nisqapi ruwakun. Nacimiento certificadota, cédulaykita apamuy.',
      gn: 'Pensión alimenticia rehegua ojejapóva\'erã Juzgado de Familia-pe.',
      en: 'Child support is filed at the Family Court. Bring the birth certificate, ID and the respondent\'s details.',
    },
    keywords: ['pension', 'alimenticia', 'alimentos', 'hijos', 'manutencion', 'pensión'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"abogado","especialidad":"pensiones"}',
    ageMode: 'ALL',
  },
  {
    id: 'fq-2', categoryId: 'cat-familia', categoryLabel: 'Familia y pensiones',
    question: { es: '¿Qué hago si no me pagan la pensión hace meses?', qu: '¿Imata ruwana mana pensiónta pagaspa?', gn: '¿Mba\'épa ajapo ndohepyme\'ẽiramo?', en: 'What if child support is not paid for months?' },
    answer: {
      es: 'Si la pensión no se paga, puedes denunciar el incumplimiento ante el Juzgado de Familia. Se puede solicitar el apremio. Guarda todos los comprobantes de impago.',
      qu: 'Manam pensionta pagaptinqa, Juzgado de Familiapi denunciakuy.',
      gn: 'Ndohaséiramo ome\'ẽ la pensión, denuncia Juzgado-pe.',
      en: 'You can file a non-compliance complaint at the Family Court. Keep proof of unpaid payments.',
    },
    keywords: ['impago', 'incumplimiento', 'apremio', 'deuda', 'pension'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"abogado","especialidad":"pensiones"}',
    ageMode: 'ALL',
  },
  {
    id: 'fq-3', categoryId: 'cat-familia', categoryLabel: 'Familia y pensiones',
    question: { es: '¿Cómo solicito la guarda de mi hijo?', qu: '¿Imaynallata guarda mañakuni?', gn: '¿Mba\'éichapa ajeruré guarda?', en: 'How do I get custody of my child?' },
    answer: {
      es: 'La guarda se solicita en el Juzgado de Familia considerando el interés superior del niño. Es recomendable contar con apoyo psicológico y legal durante el proceso.',
      qu: 'Guarda nisqataqa Juzgado Familiapi mañakunki.',
      gn: 'Guarda ajejeruréva\'erã Juzgado-pe.',
      en: 'Custody is requested at the Family Court, prioritizing the best interest of the child.',
    },
    keywords: ['guarda', 'custodia', 'hijos', 'tenencia'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"abogado","especialidad":"familia"}',
    ageMode: 'ALL',
  },
  {
    id: 'fq-4', categoryId: 'cat-violencia', categoryLabel: 'Violencia y protección',
    question: { es: '¿Qué hago en caso de violencia?', qu: '¿Imata ruwana violencia kaqpi?', gn: '¿Mba\'épa ajapo violencia oikóramo?', en: 'What should I do in case of violence?' },
    answer: {
      es: 'Si estás en peligro, llama a la Policía (110) o a emergencias médicas (118). Para medidas de protección acude a la FELCV, el SLIM o el Ministerio Público. La Ley 348 protege a las mujeres contra la violencia.',
      qu: 'Peligropi kaspaqa 110 nisqaman waqyay. FELCVman riy.',
      gn: 'Oĩramo peligro, ehenói 110-pe. Tereho FELCV-pe.',
      en: 'If you are in danger, call Police (110) or medical emergencies (118). Go to FELCV, SLIM or the Public Ministry for protective measures. Law 348 protects women from violence.',
    },
    keywords: ['violencia', 'golpes', 'agresion', '348', 'felcv', 'slim', 'proteccion', 'medidas'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"abogado","especialidad":"violencia"}',
    ageMode: 'ADULT',
  },
  {
    id: 'fq-5', categoryId: 'cat-violencia', categoryLabel: 'Violencia y protección',
    question: { es: '¿Qué es la Ley 348?', qu: '¿Imataq Ley 348?', gn: '¿Mba\'épa Ley 348?', en: 'What is Law 348?' },
    answer: {
      es: 'La Ley N° 348 garantiza a las mujeres una vida libre de violencia. Establece medidas de protección, prevención y sanción contra la violencia de género.',
      qu: 'Ley 348 warmikunata amachan violencia nisqamanta.',
      gn: 'Ley 348 omo\'ã kuñanguéra violencia-gui.',
      en: 'Law 348 guarantees women a life free of violence, establishing protection and prevention measures.',
    },
    keywords: ['ley 348', '348', 'ley', 'violencia', 'mujeres'],
    targetType: 'PAGE', targetId: 'emergencias',
    ageMode: 'ADULT',
  },
  {
    id: 'fq-6', categoryId: 'cat-laboral', categoryLabel: 'Derechos laborales',
    question: { es: '¿Me despidieron sin justificación, qué hago?', qu: '¿Despediwanku mana justificaciónwanchu, imata ruwana?', gn: 'Ndoañetéiramo che despido, ¿mba\'épa ajapo?', en: 'I was fired without justification, what do I do?' },
    answer: {
      es: 'Si el despido fue injustificado, puedes reclamar indemnización conforme a la Ley General del Trabajo. Tienes un plazo para acudir al Ministerio de Trabajo o al Juzgado Laboral.',
      qu: 'Despido mana justokaptinqa, indemnizaciónta mañakuy.',
      gn: 'Despido injusto ramo, indemnización ajerure.',
      en: 'If the dismissal was unjustified, you can claim severance under the General Labor Law.',
    },
    keywords: ['despido', 'despedido', 'trabajo', 'laboral', 'indemnizacion'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"abogado","especialidad":"laboral"}',
    ageMode: 'ADULT',
  },
  {
    id: 'fq-7', categoryId: 'cat-laboral', categoryLabel: 'Derechos laborales',
    question: { es: 'No me pagan mi sueldo, ¿a dónde acudo?', qu: 'Sueldota mana pagawankuchu, ¿mayqeman riy?', gn: 'Ndohepyme\'ẽi che sueldo, ¿moõpa aho?', en: 'My salary is not being paid, where do I go?' },
    answer: {
      es: 'Acude al Ministerio de Trabajo para la conciliación o al Juzgado Laboral. Presenta tu contrato y boletas de pago. Un abogado laboralista puede asesorarte.',
      qu: 'Ministerio de Trabajoman riy, contratoykita apay.',
      gn: 'Tereho Ministerio de Trabajo-pe.',
      en: 'Go to the Ministry of Labor or the Labor Court with your contract and pay slips.',
    },
    keywords: ['sueldo', 'salario', 'pago', 'trabajo', 'no me pagan'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"abogado","especialidad":"laboral"}',
    ageMode: 'ADULT',
  },
  {
    id: 'fq-8', categoryId: 'cat-tramites', categoryLabel: 'Trámites y documentos',
    question: { es: '¿Qué documentos necesito para iniciar un trámite?', qu: '¿Ima documentos necesitani?', gn: '¿Mba\'e kuatiajehai aitekotevẽ?', en: 'What documents do I need to start a procedure?' },
    answer: {
      es: 'En general necesitas tu cédula de identidad y, según el trámite, certificados de nacimiento o matrimonio. Un paralegal puede ayudarte a reunir la documentación.',
      qu: 'Cédulaykita necesitanki. Paralegal yanapasunki.',
      gn: 'Tekotevẽ ne cédula. Paralegal-pe eñe\'ẽ.',
      en: 'You generally need your ID and, depending on the procedure, birth or marriage certificates.',
    },
    keywords: ['documentos', 'tramites', 'requisitos', 'cedula', 'papeles'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"paralegal"}',
    ageMode: 'ALL',
  },
  {
    id: 'fq-9', categoryId: 'cat-emergencias', categoryLabel: 'Emergencias',
    question: { es: '¿A qué números llamo en una emergencia?', qu: '¿Mayqin numerokunaman waqyay?', gn: '¿Moõ numerópe ahenói?', en: 'Which numbers do I call in an emergency?' },
    answer: {
      es: 'Policía: 110 · Bomberos: 119 · Emergencias médicas: 118. Usa la página de Emergencias de la app para llamar con un toque.',
      qu: 'Policía: 110. Bomberos: 119. Médicos: 118.',
      gn: 'Policía: 110. Bomberos: 119. Médico: 118.',
      en: 'Police: 110 · Firefighters: 119 · Medical emergencies: 118.',
    },
    keywords: ['emergencia', 'numeros', '110', '119', '118', 'policia', 'bomberos', 'medicos', 'llamar'],
    targetType: 'PAGE', targetId: 'emergencias',
    ageMode: 'ALL',
  },
  {
    id: 'fq-10', categoryId: 'cat-emergencias', categoryLabel: 'Emergencias',
    question: { es: '¿Cómo denuncio un delito?', qu: '¿Imaynallata denunciakuy?', gn: '¿Mba\'éichapa ahechauka peplata?', en: 'How do I report a crime?' },
    answer: {
      es: 'Puedes denunciar ante la FELCV (violencia), la Policía o el Ministerio Público. Para urgencias llama al 110.',
      qu: 'Denunciakuyta atikunki Policiaman.',
      gn: 'Reñandu pukuére eñe\'ẽ Policía-pe.',
      en: 'You can report to FELCV, the Police or the Public Ministry. For urgent cases call 110.',
    },
    keywords: ['denuncia', 'delito', 'robo', 'denunciar'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"abogado","especialidad":"penal"}',
    ageMode: 'ADULT',
  },
  {
    id: 'fq-11', categoryId: 'cat-ninos', categoryLabel: 'Para niños y niñas',
    question: { es: '¿Qué puedo hacer si estoy en peligro?', qu: '¿Imata ruwana peligropi kaspay?', gn: '¿Mba\'épa ajapo peligro-pe?', en: 'What can I do if I am in danger?' },
    answer: {
      es: 'Si estás en peligro, llama al 110 (Policía) o pide ayuda a un adulto de confianza. Tú también tienes derechos y pueden ayudarte en el SLIM o la Defensoría de la Niñez.',
      qu: 'Peligropi kaspayqa 110 nisqaman waqyay.',
      gn: 'Peligro-pe ramo ehenói 110-pe.',
      en: 'If you are in danger, call 110 (Police) or ask a trusted adult for help.',
    },
    keywords: ['peligro', 'niños', 'ayuda', 'miedo', '110'],
    targetType: 'PAGE', targetId: 'emergencias',
    ageMode: 'CHILD',
  },
  {
    id: 'fq-12', categoryId: 'cat-ninos', categoryLabel: 'Para niños y niñas',
    question: { es: '¿Quién me cuida si hay problemas en casa?', qu: '¿Piñataq cuidawanqa?', gn: '¿Máva omo\'ã chéve?', en: 'Who takes care of me if there are problems at home?' },
    answer: {
      es: 'Puedes hablar con un adulto de confianza, un profesor o acudir al SLIM / Defensoría de la Niñez. Ellos te escuchan y te protegen.',
      qu: 'SLIMman riy, paykuna uyarisunkiku.',
      gn: 'Eñe\'ẽ SLIM ndive.',
      en: 'Talk to a trusted adult or go to SLIM / the Child Protection Office.',
    },
    keywords: ['cuidado', 'problemas', 'casa', 'familia', 'niños'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"psicologo","especialidad":"infancia"}',
    ageMode: 'CHILD',
  },
  {
    id: 'fq-13', categoryId: 'cat-mayores', categoryLabel: 'Para personas mayores',
    question: { es: '¿Tengo derechos como persona adulta mayor?', qu: '¿Derechoykuna kanchu?', gn: '¿Aguereko derécho?', en: 'Do I have rights as an older adult?' },
    answer: {
      es: 'Sí. La Ley 369 protege los derechos de las personas adultas mayores: pensión digna, atención en salud y trato preferente. Puedes acudir a la Defensoría del Pueblo.',
      qu: 'Ley 369 amachasunki. Pensiónta charinki.',
      gn: 'Ley 369 omo\'ã nde. Pensión aguereko.',
      en: 'Yes. Law 369 protects older adults: dignified pension, health care and preferential treatment.',
    },
    keywords: ['mayores', 'ancianos', 'derechos', 'pension', 'ley 369', 'adulto mayor'],
    targetType: 'SPECIALISTS_FILTER', targetId: '{"rol":"abogado"}',
    ageMode: 'ELDER',
  },
  {
    id: 'fq-14', categoryId: 'cat-mayores', categoryLabel: 'Para personas mayores',
    question: { es: '¿Cómo reservo una cita con un especialista?', qu: '¿Imaynallata cita reservakuy?', gn: '¿Mba\'éichapa amboaje cita?', en: 'How do I book an appointment with a specialist?' },
    answer: {
      es: 'Entra a la pestaña "Especialistas", elige un profesional y pulsa "Reservar". Puedes elegir visita, llamada o videollamada. Te confirmaremos por correo.',
      qu: 'Especialistas nisqaman riy, cita reservakuy.',
      gn: 'Eho "Especialistas"-pe, emboaje cita.',
      en: 'Go to "Specialists", pick a professional and press "Book". Choose a visit, call or video call.',
    },
    keywords: ['cita', 'reservar', 'agendar', 'especialista', 'mayores'],
    targetType: 'PAGE', targetId: 'especialistas',
    ageMode: 'ELDER',
  },
]

export const faqCategories: FaqCategoryRaw[] = [
  { id: 'cat-familia', slug: 'familia', label: 'Familia y pensiones', items: [] },
  { id: 'cat-violencia', slug: 'violencia', label: 'Violencia y protección', items: [] },
  { id: 'cat-laboral', slug: 'laboral', label: 'Derechos laborales', items: [] },
  { id: 'cat-tramites', slug: 'tramites', label: 'Trámites y documentos', items: [] },
  { id: 'cat-emergencias', slug: 'emergencias', label: 'Emergencias', items: [] },
  { id: 'cat-ninos', slug: 'ninos', label: 'Para niños y niñas', items: [] },
  { id: 'cat-mayores', slug: 'mayores', label: 'Para personas mayores', items: [] },
].map(cat => ({ ...cat, items: faqItems.filter(i => i.categoryId === cat.id) }))

export const forumTopics: ForumTopic[] = [
  {
    id: 'tp-1', title: 'Mi expareja no paga la pensión', status: 'OPEN',
    authorName: 'María L.', createdAt: '2026-07-20T10:00:00Z',
    body: 'Hace 3 meses que no recibo la pensión alimenticia de mis hijos. ¿Qué debo hacer?',
    replies: [
      { id: 'rp-1', authorName: 'Dra. Ana Condori', createdAt: '2026-07-21T15:00:00Z', hidden: false, body: 'Puedes denunciar el incumplimiento ante el Juzgado de Familia y pedir el apremio. Trae los comprobantes de impago.' },
      { id: 'rp-2', authorName: 'Carlos R.', createdAt: '2026-07-22T09:00:00Z', hidden: false, body: 'A mí me ayudó un abogado de familia. Les recomiendo buscar en Especialistas.' },
    ],
  },
  {
    id: 'tp-2', title: '¿Dónde encuentro apoyo psicológico gratuito?', status: 'OPEN',
    authorName: 'Juana P.', createdAt: '2026-07-18T12:00:00Z',
    body: 'Necesito hablar con un psicólogo pero tengo pocos recursos. ¿Qué opciones hay en Sucre?',
    replies: [
      { id: 'rp-3', authorName: 'Lic. Marco Villca', createdAt: '2026-07-19T11:00:00Z', hidden: false, body: 'Puedes acudir al SLIM o a la Defensoría de la Niñez para atención gratuita. También hago sesiones a tarifa social.' },
    ],
  },
  {
    id: 'tp-3', title: 'Me despidieron sin justificación', status: 'OPEN',
    authorName: 'Pedro Q.', createdAt: '2026-07-15T08:00:00Z',
    body: 'Trabajé 5 años y me despidieron sin motivo. ¿Tengo derecho a indemnización?',
    replies: [
      { id: 'rp-4', authorName: 'Dra. Rosa Quispe', createdAt: '2026-07-16T10:00:00Z', hidden: false, body: 'Sí, conforme a la Ley General del Trabajo. Acude al Ministerio de Trabajo dentro del plazo o al Juzgado Laboral.' },
    ],
  },
  {
    id: 'tp-4', title: 'Comparto mi experiencia con la FELCV', status: 'LOCKED',
    authorName: 'Sonia M.', createdAt: '2026-07-10T09:00:00Z',
    body: 'Denuncié y me acompañaron todo el proceso. Se puede salir adelante.',
    replies: [
      { id: 'rp-5', authorName: 'Moderador', createdAt: '2026-07-11T09:00:00Z', hidden: false, body: 'Gracias por compartir. Tema cerrado a nuevas respuestas.' },
    ],
  },
]

export function buildSlots(): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = []
  const pro = ['sp-1', 'sp-2', 'sp-3', 'sp-5', 'sp-8']
  const now = Date.now()
  const day = 86400000
  pro.forEach((p, pi) => {
    for (let d = 1; d <= 4; d++) {
      for (const h of [9, 11, 15, 17]) {
        const start = new Date(now + d * day)
        start.setUTCHours(h, 0, 0, 0)
        const end = new Date(start.getTime() + 60 * 60000)
        slots.push({
          id: `sl-${p}-${d}-${h}`,
          professionalId: p,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          modality: (pi + d + h) % 3 === 0 ? 'VIDEO' : (pi + d) % 2 === 0 ? 'VOICE' : 'VISIT',
          isBooked: false,
        })
      }
    }
  })
  return slots
}

let bookings: Booking[] = [
  {
    id: 'bk-1', clientId: 'demo', professionalId: 'sp-1', professionalName: 'Dra. Ana Condori',
    slotId: 'sl-demo', startsAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    modality: 'VOICE', status: 'CONFIRMED', notes: 'Consulta sobre pensión alimenticia',
  },
]

export function getBookings(): Booking[] { return bookings }
export function addBooking(b: Booking) { bookings = [b, ...bookings] }
