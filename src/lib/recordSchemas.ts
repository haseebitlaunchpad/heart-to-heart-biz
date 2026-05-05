// Editable field schemas per record type. Used by RecordEditor.
export type FieldDef =
  | { key: string; label: string; type: "text" | "textarea" | "number" | "date" | "datetime" | "checkbox" | "email" | "tel" | "url" }
  | { key: string; label: string; type: "lookup"; table: string; labelKey?: string; orderBy?: string }
  | { key: string; label: string; type: "enum"; options: { value: string; label: string }[] }
  | { key: string; label: string; type: "tags" }; // text[]

export type Section = { title: string; fields: FieldDef[] };

export const schemas: Record<string, Section[]> = {
  leads: [
    { title: "Identity", fields: [
      { key: "lead_name", label: "Lead name", type: "text" },
      { key: "company_name", label: "Company name", type: "text" },
      { key: "lead_type", label: "Lead type", type: "enum", options: [
        { value: "individual", label: "Individual" }, { value: "company", label: "Company" }] },
      { key: "cr_number", label: "CR number", type: "text" },
      { key: "national_id", label: "National ID", type: "text" },
      { key: "nationality_id", label: "Nationality", type: "lookup", table: "countries" },
      { key: "country_of_residence_id", label: "Country of residence", type: "lookup", table: "countries" },
      { key: "city_id", label: "City", type: "lookup", table: "cities" },
      { key: "preferred_language", label: "Preferred language", type: "enum", options: [
        { value: "en", label: "English" }, { value: "ar", label: "Arabic" }] },
    ]},
    { title: "Contact", fields: [
      { key: "email", label: "Email", type: "email" },
      { key: "mobile", label: "Mobile", type: "tel" },
      { key: "whatsapp_number", label: "WhatsApp", type: "tel" },
      { key: "preferred_contact_channel_id", label: "Preferred channel", type: "lookup", table: "communication_channels" },
      { key: "best_time_to_contact", label: "Best time to contact", type: "text" },
      { key: "contact_consent", label: "Contact consent", type: "checkbox" },
    ]},
    { title: "Source", fields: [
      { key: "source_channel_id", label: "Source channel", type: "lookup", table: "lead_source_channels" },
      { key: "source_system", label: "Source system", type: "text" },
      { key: "source_reference_id", label: "Source reference", type: "text" },
    ]},
    { title: "Interest", fields: [
      { key: "sector_id", label: "Sector", type: "lookup", table: "sectors" },
      { key: "sub_sector_id", label: "Sub-sector", type: "lookup", table: "sub_sectors" },
      { key: "investment_size_band_id", label: "Investment size", type: "lookup", table: "investment_size_bands" },
      { key: "preferred_region_id", label: "Preferred region", type: "lookup", table: "regions" },
      { key: "preferred_city_id", label: "Preferred city", type: "lookup", table: "cities" },
      { key: "investment_objective", label: "Investment objective", type: "textarea" },
      { key: "interest_notes", label: "Interest notes", type: "textarea" },
    ]},
    { title: "Qualification", fields: [
      { key: "lead_stage_id", label: "Stage", type: "lookup", table: "lead_stages", orderBy: "sort_order" },
      { key: "lead_status_id", label: "Status", type: "lookup", table: "lead_statuses", orderBy: "sort_order" },
      { key: "qualification_temperature_id", label: "Temperature", type: "lookup", table: "lead_temperatures", orderBy: "sort_order" },
      { key: "lead_score", label: "Lead score", type: "number" },
      { key: "priority", label: "Priority", type: "enum", options: [
        { value: "low", label: "Low" }, { value: "normal", label: "Normal" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" }] },
      { key: "qualification_notes", label: "Qualification notes", type: "textarea" },
      { key: "disqualification_reason_id", label: "Disqualification reason", type: "lookup", table: "lead_disqualification_reasons" },
      { key: "nurture_reason_id", label: "Nurture reason", type: "lookup", table: "lead_nurture_reasons" },
      { key: "next_follow_up_date", label: "Next follow-up", type: "date" },
    ]},
  ],

  accounts: [
    { title: "Identity", fields: [
      { key: "account_name", label: "Account name", type: "text" },
      { key: "company_name", label: "Company name", type: "text" },
      { key: "cr_number", label: "CR number", type: "text" },
      { key: "account_category_id", label: "Category", type: "lookup", table: "account_categories" },
      { key: "investor_type_id", label: "Investor type", type: "lookup", table: "investor_types" },
      { key: "account_status_id", label: "Status", type: "lookup", table: "account_statuses" },
      { key: "nationality_id", label: "Nationality", type: "lookup", table: "countries" },
    ]},
    { title: "Contact", fields: [
      { key: "primary_email", label: "Primary email", type: "email" },
      { key: "primary_mobile", label: "Primary mobile", type: "tel" },
      { key: "country_id", label: "Country", type: "lookup", table: "countries" },
      { key: "city_id", label: "City", type: "lookup", table: "cities" },
      { key: "preferred_language", label: "Preferred language", type: "enum", options: [
        { value: "en", label: "English" }, { value: "ar", label: "Arabic" }] },
    ]},
    { title: "Investment profile", fields: [
      { key: "sector_id", label: "Sector", type: "lookup", table: "sectors" },
      { key: "sub_sector_id", label: "Sub-sector", type: "lookup", table: "sub_sectors" },
      { key: "investment_size_band_id", label: "Investment size", type: "lookup", table: "investment_size_bands" },
      { key: "preferred_region_id", label: "Preferred region", type: "lookup", table: "regions" },
      { key: "estimated_investment_budget", label: "Est. budget", type: "number" },
      { key: "funding_source_id", label: "Funding source", type: "lookup", table: "funding_sources" },
      { key: "funding_status_id", label: "Funding status", type: "lookup", table: "funding_statuses" },
      { key: "investment_timeline_id", label: "Timeline", type: "lookup", table: "investment_timelines" },
      { key: "preferred_financing_support", label: "Preferred financing", type: "text" },
      { key: "financial_notes", label: "Financial notes", type: "textarea" },
    ]},
  ],

  contacts: [
    { title: "Identity", fields: [
      { key: "full_name", label: "Full name", type: "text" },
      { key: "job_title", label: "Job title", type: "text" },
      { key: "contact_role_id", label: "Role", type: "lookup", table: "contact_roles" },
      { key: "nationality_id", label: "Nationality", type: "lookup", table: "countries" },
      { key: "preferred_language", label: "Preferred language", type: "enum", options: [
        { value: "en", label: "English" }, { value: "ar", label: "Arabic" }] },
    ]},
    { title: "Contact", fields: [
      { key: "email", label: "Email", type: "email" },
      { key: "mobile", label: "Mobile", type: "tel" },
      { key: "preferred_channel_id", label: "Preferred channel", type: "lookup", table: "communication_channels" },
      { key: "consent_given", label: "Consent given", type: "checkbox" },
      { key: "consent_notes", label: "Consent notes", type: "textarea" },
    ]},
  ],

  opportunity_catalog: [
    { title: "Overview", fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "journey_area", label: "Journey area", type: "text" },
      { key: "program_service_category", label: "Program / service", type: "text" },
      { key: "strategic_objective", label: "Strategic objective", type: "text" },
      { key: "reference_url", label: "Reference URL", type: "url" },
      { key: "internal_notes", label: "Internal notes", type: "textarea" },
    ]},
    { title: "Classification", fields: [
      { key: "sector_id", label: "Sector", type: "lookup", table: "sectors" },
      { key: "sub_sector_id", label: "Sub-sector", type: "lookup", table: "sub_sectors" },
      { key: "region_id", label: "Region", type: "lookup", table: "regions" },
      { key: "city_id", label: "City", type: "lookup", table: "cities" },
      { key: "site_name", label: "Site name", type: "text" },
      { key: "area_size", label: "Area size", type: "number" },
      { key: "lifecycle_phase_id", label: "Lifecycle phase", type: "lookup", table: "lifecycle_phases" },
    ]},
    { title: "Investment", fields: [
      { key: "min_investment", label: "Min investment", type: "number" },
      { key: "max_investment", label: "Max investment", type: "number" },
      { key: "investment_size_band_id", label: "Size band", type: "lookup", table: "investment_size_bands" },
      { key: "currency_id", label: "Currency", type: "lookup", table: "currencies" },
      { key: "capacity", label: "Capacity", type: "number" },
      { key: "available_from", label: "Available from", type: "date" },
      { key: "expiry_date", label: "Expiry date", type: "date" },
      { key: "expected_benefit", label: "Expected benefit", type: "textarea" },
    ]},
    { title: "TRL/MRL", fields: [
      { key: "trl_min", label: "TRL min", type: "number" },
      { key: "trl_max", label: "TRL max", type: "number" },
      { key: "mrl_min", label: "MRL min", type: "number" },
      { key: "mrl_max", label: "MRL max", type: "number" },
    ]},
    { title: "Eligibility", fields: [
      { key: "required_cr", label: "Requires CR", type: "checkbox" },
      { key: "eligible_investor_type", label: "Eligible investor type", type: "text" },
      { key: "eligible_nationality_type", label: "Eligible nationality", type: "text" },
      { key: "eligible_channels", label: "Eligible channels", type: "tags" },
      { key: "eligible_sectors", label: "Eligible sectors", type: "tags" },
      { key: "eligible_investment_bands", label: "Eligible bands", type: "tags" },
      { key: "required_documents", label: "Required documents", type: "tags" },
      { key: "exclusion_criteria", label: "Exclusion criteria", type: "textarea" },
    ]},
    { title: "Paths", fields: [
      { key: "available_paths", label: "Available paths", type: "tags" },
      { key: "default_path_id", label: "Default path", type: "lookup", table: "investment_paths" },
      { key: "path_a_description", label: "Path A", type: "textarea" },
      { key: "path_b_description", label: "Path B", type: "textarea" },
      { key: "path_c_description", label: "Path C", type: "textarea" },
    ]},
  ],

  opportunity_matches: [
    { title: "Match", fields: [
      { key: "match_type_id", label: "Match type", type: "lookup", table: "match_types" },
      { key: "match_status_id", label: "Status", type: "lookup", table: "match_statuses", orderBy: "sort_order" },
      { key: "eligibility_result", label: "Eligibility result", type: "enum", options: [
        { value: "pending", label: "Pending" }, { value: "eligible", label: "Eligible" }, { value: "ineligible", label: "Ineligible" }] },
      { key: "missing_requirements", label: "Missing requirements", type: "tags" },
      { key: "manual_override_flag", label: "Manual override", type: "checkbox" },
    ]},
    { title: "Path", fields: [
      { key: "selected_path_id", label: "Selected path", type: "lookup", table: "investment_paths" },
      { key: "path_notes", label: "Path notes", type: "textarea" },
      { key: "notes", label: "Notes", type: "textarea" },
    ]},
  ],

  handoffs: [
    { title: "Handoff", fields: [
      { key: "selected_path_id", label: "Selected path", type: "lookup", table: "investment_paths" },
      { key: "handoff_status_id", label: "Status", type: "lookup", table: "handoff_statuses" },
      { key: "integration_status_id", label: "Integration status", type: "lookup", table: "integration_statuses" },
      { key: "failure_reason", label: "Failure reason", type: "textarea" },
    ]},
  ],

  activities: [
    { title: "Activity", fields: [
      { key: "subject", label: "Subject", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "activity_type_id", label: "Type", type: "lookup", table: "activity_types" },
      { key: "status_id", label: "Status", type: "lookup", table: "activity_statuses" },
      { key: "outcome_id", label: "Outcome", type: "lookup", table: "activity_outcomes" },
      { key: "due_date", label: "Due date", type: "datetime" },
      { key: "completed_at", label: "Completed at", type: "datetime" },
      { key: "next_follow_up_date", label: "Next follow-up", type: "date" },
    ]},
  ],
};
