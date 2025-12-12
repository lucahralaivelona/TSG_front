import DashboardLayout from "../layout/DashboardLayout.vue";
// GeneralViews
import NotFound from "../pages/NotFoundPage.vue";

// Admin pages
import Overview from "src/pages/Overview.vue";
import Employee from "src/pages/Employee.vue";
import Disponible from "src/pages/Disponible.vue";
import Historique from "src/pages/Historique.vue";
import Icons from "src/pages/Icons.vue";
import Reservation from "src/pages/Reservation.vue";
import Utilisateur from "src/pages/Utilisateur.vue";
import Upgrade from "src/pages/Upgrade.vue";
import Department from "src/pages/Department.vue";
import Attendance from "../pages/attendance.vue";
import InfoProfile from "src/pages/EditProfileForm.vue";
import Scoring from "../pages/Scoring.vue";
import login from "../pages/login.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: login,
    meta: { requiresGuest: true } // ← Ajouté
  },
  {
    path: "/",
    component: login,
    redirect: "/login",
    meta: { requiresGuest: true } // ← Ajouté
  },
  {
    path: "/admin",
    component: DashboardLayout,
    redirect: "/admin/overview",
    meta: { requiresAuth: true }, // ← Ajouté
    children: [
      {
        path: "overview",
        name: "Overview",
        component: Overview,
      },
      {
        path: "scoring",
        name: "Scoring",
        component: Scoring,
      },
      {
        path: "employee",
        name: "Employee",
        component: Employee,
      },
      {
        path: "info-profile/:id",
        name: "InfoProfile",
        component: InfoProfile,
        props: true,
      },
      {
        path: "department",
        name: "Department",
        component: Department,
      },
      {
        path: "attendance",
        name: "Attendance",
        component: Attendance,
      },
      {
        path: "historique",
        name: "Historique",
        component: Historique,
      },
      {
        path: "icons",
        name: "Icons",
        component: Icons,
      },
      {
        path: "reservation",
        name: "Reservation",
        component: Reservation,
      },
      {
        path: "utilisateur",
        name: "Utilisateur",
        component: Utilisateur,
      },
      // {
      //   path: 'upgrade',
      //   name: 'Upgrade to PRO',
      //   component: Upgrade
      // }
    ],
  },
  { 
    path: "*", 
    component: NotFound 
  },
];

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes;