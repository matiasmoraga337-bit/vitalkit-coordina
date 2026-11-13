import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_PASSWORD ?? "Demo1234!";

if (!url || !serviceRoleKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Usa node --env-file=.env.local scripts/seed.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  {
    email: "familia@demo.vitalkit.cl",
    fullName: "Carolina Rojas",
    role: "family",
  },
  {
    email: "coordinadora@demo.vitalkit.cl",
    fullName: "Valentina Soto",
    role: "coordinator",
  },
  {
    email: "kinesiologo@demo.vitalkit.cl",
    fullName: "Diego Pérez",
    role: "professional",
    discipline: "kinesiologia",
  },
  {
    email: "enfermera@demo.vitalkit.cl",
    fullName: "Andrea Silva",
    role: "professional",
    discipline: "enfermeria",
  },
  {
    email: "nutricionista@demo.vitalkit.cl",
    fullName: "Camila Muñoz",
    role: "professional",
    discipline: "nutricion",
  },
  {
    email: "aseo@demo.vitalkit.cl",
    fullName: "Paula Díaz",
    role: "professional",
    discipline: "aseo",
  },
];

function addDays(days, hour = 10, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function addDaysDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function ensureUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;

  const byEmail = new Map(data.users.map((user) => [user.email, user]));
  const ids = {};

  for (const item of users) {
    let user = byEmail.get(item.email);

    if (!user) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: item.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: item.fullName },
      });
      if (createError) throw createError;
      user = created.user;
    }

    if (!user) throw new Error(`No se pudo crear ${item.email}`);
    ids[item.email] = user.id;

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      role: item.role,
      full_name: item.fullName,
    });
    if (profileError) throw profileError;

    if (item.discipline) {
      const { error: professionalError } = await supabase.from("professionals").upsert({
        id: user.id,
        discipline: item.discipline,
        verification: "verified",
        coverage: ["Puerto Montt", "Alerce"],
      });
      if (professionalError) throw professionalError;
    }
  }

  return {
    family: ids["familia@demo.vitalkit.cl"],
    coordinator: ids["coordinadora@demo.vitalkit.cl"],
    kinesiologo: ids["kinesiologo@demo.vitalkit.cl"],
    enfermera: ids["enfermera@demo.vitalkit.cl"],
    nutricionista: ids["nutricionista@demo.vitalkit.cl"],
    aseo: ids["aseo@demo.vitalkit.cl"],
  };
}

async function resetDemoHousehold() {
  const { data, error } = await supabase
    .from("households")
    .select("id")
    .eq("name", "Familia Rojas Demo");

  if (error) throw error;

  for (const household of data ?? []) {
    const { error: deleteError } = await supabase
      .from("households")
      .delete()
      .eq("id", household.id);
    if (deleteError) throw deleteError;
  }
}

async function main() {
  const ids = await ensureUsers();
  await resetDemoHousehold();

  const { data: household, error: householdError } = await supabase
    .from("households")
    .insert({
      name: "Familia Rojas Demo",
      comuna: "Puerto Montt",
      address: "Villa Los Volcanes, Puerto Montt",
      plan_id: "integral",
      coordinator_id: ids.coordinator,
    })
    .select()
    .single();
  if (householdError) throw householdError;

  const { error: memberError } = await supabase.from("household_members").insert({
    household_id: household.id,
    profile_id: ids.family,
    relationship: "Hija",
  });
  if (memberError) throw memberError;

  const { data: elder, error: elderError } = await supabase
    .from("elders")
    .insert({
      household_id: household.id,
      full_name: "Elena Rojas",
      birth_date: "1948-03-12",
      mobility: "Con apoyo",
      notes: "Post-operada de rodilla derecha. Vive con su hija Carolina.",
    })
    .select()
    .single();
  if (elderError) throw elderError;

  const { error: subscriptionError } = await supabase.from("subscriptions").insert({
    household_id: household.id,
    plan_id: "integral",
    status: "active",
    start_date: addDaysDate(-44),
  });
  if (subscriptionError) throw subscriptionError;

  const { error: carePlanError } = await supabase.from("care_plans").insert({
    household_id: household.id,
    goals: [
      "Recuperar movilidad de rodilla derecha después de la cirugía.",
      "Mantener presión arterial estable y controlar la medicación.",
      "Mejorar la alimentación y la hidratación diaria.",
    ],
    frequency:
      "Kinesiología 2 veces por semana · Enfermería semanal · Nutrición quincenal",
    recommendations: [
      "Caminar 10 minutos dentro de casa, con apoyo, dos veces al día.",
      "Registrar presión arterial tres veces por semana.",
      "Evitar escaleras sin acompañamiento.",
    ],
    next_review: addDaysDate(7),
    created_by: ids.coordinator,
  });
  if (carePlanError) throw carePlanError;

  const { data: completedVisit, error: completedVisitError } = await supabase
    .from("visits")
    .insert({
      household_id: household.id,
      elder_id: elder.id,
      professional_id: ids.kinesiologo,
      discipline: "kinesiologia",
      scheduled_at: addDays(-6, 10, 30),
      duration_min: 60,
      status: "completed",
      address: "Villa Los Volcanes, Puerto Montt",
      created_by: ids.coordinator,
    })
    .select()
    .single();
  if (completedVisitError) throw completedVisitError;

  const { error: reportError } = await supabase.from("visit_reports").insert({
    visit_id: completedVisit.id,
    summary:
      "Elena completó la rutina de movilidad sin dolor. Se ajustaron dos ejercicios para la semana.",
    recommendations: [
      "Mantener el ejercicio de extensión de rodilla dos veces al día.",
      "Usar hielo por 10 minutos si aparece inflamación.",
    ],
    created_by: ids.kinesiologo,
  });
  if (reportError) throw reportError;

  const { error: visitsError } = await supabase.from("visits").insert([
    {
      household_id: household.id,
      elder_id: elder.id,
      professional_id: ids.kinesiologo,
      discipline: "kinesiologia",
      scheduled_at: addDays(1, 10, 30),
      duration_min: 60,
      status: "confirmed",
      address: "Villa Los Volcanes, Puerto Montt",
      created_by: ids.coordinator,
    },
    {
      household_id: household.id,
      elder_id: elder.id,
      professional_id: ids.enfermera,
      discipline: "enfermeria",
      scheduled_at: addDays(4, 9, 0),
      duration_min: 45,
      status: "scheduled",
      address: "Villa Los Volcanes, Puerto Montt",
      created_by: ids.coordinator,
    },
    {
      household_id: household.id,
      elder_id: elder.id,
      professional_id: ids.nutricionista,
      discipline: "nutricion",
      scheduled_at: addDays(6, 11, 0),
      duration_min: 45,
      status: "scheduled",
      address: "Villa Los Volcanes, Puerto Montt",
      created_by: ids.coordinator,
    },
    {
      household_id: household.id,
      elder_id: elder.id,
      professional_id: ids.aseo,
      discipline: "aseo",
      scheduled_at: addDays(8, 15, 0),
      duration_min: 90,
      status: "scheduled",
      address: "Villa Los Volcanes, Puerto Montt",
      created_by: ids.coordinator,
    },
  ]);
  if (visitsError) throw visitsError;

  const { error: requestsError } = await supabase.from("requests").insert([
    {
      household_id: household.id,
      requested_by: ids.family,
      discipline: "kinesiologia",
      preferred_date: addDaysDate(2),
      preferred_time: "10:00",
      reason: "Elena tuvo más dolor de lo habitual en la rodilla derecha.",
      status: "pending",
    },
    {
      household_id: household.id,
      requested_by: ids.family,
      discipline: "enfermeria",
      preferred_date: addDaysDate(-1),
      preferred_time: "18:00",
      reason: "Control de presión y curaciones.",
      status: "approved",
      reviewed_by: ids.coordinator,
      reviewed_at: new Date().toISOString(),
    },
  ]);
  if (requestsError) throw requestsError;

  const { error: messagesError } = await supabase.from("messages").insert([
    {
      household_id: household.id,
      sender_id: ids.family,
      body: "Hola, Elena tuvo más dolor de lo habitual en la rodilla derecha. ¿Podemos sumar una visita de kinesiología?",
    },
    {
      household_id: household.id,
      sender_id: ids.coordinator,
      body: "Hola Carolina, lo reviso ahora. Tengo disponibilidad de Diego el jueves por la mañana.",
    },
  ]);
  if (messagesError) throw messagesError;

  const { error: invoiceError } = await supabase.from("invoices").insert({
    household_id: household.id,
    period: new Date().toISOString().slice(0, 7),
    plan_amount_clp: 236000,
    extras_amount_clp: 0,
    total_clp: 236000,
    status: "pending",
    issued_at: addDaysDate(0),
    due_at: addDaysDate(10),
  });
  if (invoiceError) throw invoiceError;

  const { error: consentError } = await supabase.from("consents").insert({
    household_id: household.id,
    profile_id: ids.family,
    type: "care_services",
    signed_at: new Date().toISOString(),
  });
  if (consentError) throw consentError;

  console.log("Seed listo.");
  console.log("Familia: familia@demo.vitalkit.cl");
  console.log("Coordinación: coordinadora@demo.vitalkit.cl");
  console.log("Profesional: kinesiologo@demo.vitalkit.cl");
  console.log(`Password demo: ${password}`);
  console.log(`Household: ${household.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
