import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Nav": {
        "dashboard": "Operations Hub",
        "trains": "Fleet Registry",
        "tanks": "Storage & Inventory",
        "meters": "Flow Performance",
        "sessions": "Fueling Sessions",
        "reconciliation": "Audit & Recon",
        "alerts": "Incident Desk",
        "settings": "Settings",
        "logout": "Logout",
        "admin_org": "Organization Setup",
        "admin_access": "User Access Control",
        "admin_data": "Data Archives",
        "admin_platform": "Platform Settings",
        "admin_logs": "Activity History"
      },
      "Dashboard": {
        "title": "Command Centre",
        "network_telemetry": "Live Telemetry Stream",
        "active_fleet": "Active Fleet",
        "operational_idle": "Operational IDLE",
        "critical_alarms": "Critical Alarms",
        "fuel_today": "Fuel Today",
        "efficiency": "Efficiency",
        "recent_sessions": "Recent Station Events",
        "incident_desk": "Incident Desk",
        "fleet_overview": "Fleet Overview"
      },
      "Common": {
        "sync": "Initialize Resync",
        "polling": "POLLING",
        "live": "LIVE",
        "confidence": "Confidence",
        "view_all": "View All",
        "search": "Search assets...",
        "filter": "Filter"
      },
      "Trains": {
        "title": "Fleet Registry",
        "subtitle": "Locomotive health, fuel dynamics and real-time telemetry",
        "stat_total": "Total Fleet",
        "stat_active": "In Transit",
        "stat_idle": "Stationary",
        "stat_offline": "Offline",
        "col_id": "Locomotive ID",
        "col_location": "Current Location",
        "col_fuel": "Fuel Level",
        "col_speed": "Current Speed",
        "col_status": "Operational Status",
        "col_actions": "Actions",
        "details_title": "Asset Intelligence",
        "details_telemetry": "Live Telemetry",
        "details_fuel_log": "Recent Fueling",
        "details_activity": "Network Activity",
        "btn_view_telemetry": "View Details",
        "btn_convert": "Log Incident"
      },
      "Organization": {
        "table_headers": ["Company Name", "Registration ID", "Staff Count", "Assigned Assets", "Account Status", "Manage"]
      }
    }
  },
  sw: {
    translation: {
      "Nav": {
        "dashboard": "Kituo cha Udhibiti",
        "trains": "Muhtasari wa Treni",
        "tanks": "Matanki ya Mafuta",
        "meters": "Mita za Mtiririko",
        "sessions": "Vipindi vya Mafuta",
        "reconciliation": "Usawazishaji",
        "alerts": "Tahadhari na Matukio",
        "settings": "Mipangilio",
        "logout": "Toka"
      },
      "Dashboard": {
        "title": "Kituo cha Udhibiti",
        "network_telemetry": "Takwimu za Mtandao",
        "active_fleet": "Treni Amilifu",
        "operational_idle": "Zinasubiri",
        "critical_alarms": "Tahadhari Muhimu",
        "fuel_today": "Mafuta Leo",
        "efficiency": "Ufanisi",
        "recent_sessions": "Vipindi vya Hivi Karibuni",
        "incident_desk": "Dawati la Matukio",
        "fleet_overview": "Maelezo ya Fleet"
      },
      "Common": {
        "sync": "Anzisha Usawazishaji",
        "polling": "INAPOILI",
        "live": "MUBASHARA",
        "confidence": "Kujiamini",
        "view_all": "Angalia Zote",
        "search": "Tafuta rasilimali...",
        "filter": "Chuja"
      },
      "Trains": {
        "title": "Sajili ya Fleet",
        "subtitle": "Afya ya injini, mienendo ya mafuta na telemetria",
        "stat_total": "Jumla ya Fleet",
        "stat_active": "Njia",
        "stat_idle": "Tulia",
        "stat_offline": "Zimefungwa",
        "col_id": "ID ya Injini",
        "col_location": "Sekta ya Sasa",
        "col_fuel": "Hali ya Mafuta",
        "col_speed": "Kasi",
        "col_status": "Hali",
        "col_actions": "Amri",
        "details_title": "Akili ya Rasilimali",
        "details_telemetry": "Takwimu Mubashara",
        "details_fuel_log": "Mafuta ya Hivi Karibuni",
        "details_activity": "Shughuli za Mtandao",
        "btn_view_telemetry": "Angalia HUD",
        "btn_convert": "Rekodi Tukio"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
