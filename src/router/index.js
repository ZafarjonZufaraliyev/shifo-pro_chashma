import { createRouter, createWebHistory } from "vue-router";

// Layout va sahifalar
import Login from "@/views/Login.vue";
import SuperAdminLayout from "@/layouts/SuperAdminLayout.vue";
import MiniAdminLayout from "@/layouts/MiniAdminLayout.vue";

import SuperDashboard from "@/views/SuperDashboard.vue";
import MiniDashboard from "@/views/MiniDashboard.vue";

import Bemorlar from "@/components/Bemorlar.vue";
import Rooms from "@/components/Rooms.vue";
import RegisterPage from "@/views/RegisterPage.vue";
import Takliflar from "@/views/Takliflar.vue";
import Bemor_card from "@/components/PatientCard.vue";
import RoomDetels from "@/components/RoomDetels.vue";
import TaklifDetelis from "@/components/TaklifDetelis.vue";
import Xodimlar from "@/components/Xodimlar.vue";
import BemorSpiska from "@/components/BemorSpiska.vue";
//Oshxona

import OshxonaLayout from "@/layouts/OshxonaLayout.vue";
import OshxonaDashboard from "@/views/OshxonaDashboard.vue";
import RetseptOshxonaOshxona from "@/components/RetseptOshxona.vue";
import ChiqimOshxona from "@/components/ChiqimOshxona.vue";
import MaxsulotlarOshxona from "@/components/MaxsulotlarOshxona.vue";
import OshxonaOvqatlar from "@/components/OshxonaOvqatlar.vue"

// Ombor

import OmborBalans from "@/components/OmborBalans.vue";
import OmborChiqim from "@/components/OmborChiqim.vue";
import OmborKirim from "@/components/OmborKirim.vue";
import OmborMaxsulotlar from "@/components/OmborMaxsulotlar.vue";
import OmborLayout from "@/layouts/OmborLayout.vue";
import OmborDashboard from "@/views/OmborDashboard.vue";

//Col Markaz


import ColMarkazDashboard from "@/views/ColMarkazDashboard.vue";
import ColMarkazLayout from "@/layouts/ColMarkazLayout.vue";

//Kassa

import KassaSahifa from "@/components/KassaSahifa.vue";
import KasaFilter from "@/components/BemorKassa.vue";
import KassaPulQaytarish from "@/components/KassaPulQaytarish.vue";
import KassaStatistika from "@/components/KassaStatistika.vue";
import KassaTolovQoshish from "@/components/KassaTolovQoshish.vue";
import KassaTolovlarJadvali from "@/components/KassaTolovlarJadvali.vue";

//Labaratory

import NatijaLab from "@/components/NatijaLab.vue";
import TaxlilTuriLab from "@/components/TaxlilTuriLab.vue";
import LabaratoryaDashboard from "@/views/LabaratoryaDashboard.vue";
import LabaratoryLatout from "@/layouts/LabaratoryLatout.vue";
import TaxlilPDFlab from "@/components/TaxlilPDFlab.vue";
import taxlilLab from "../components/taxlilLab.vue";
import LabKassa from "@/components/LabKassa.vue";
import LabKassaTolov from "@/components/LabKassaTolov.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/TaklifDetelis", name: "TaklifDetelis", component: TaklifDetelis },
  { path: "/login", component: Login, meta: { public: true } },

  // SUPER
  {
    path: "/admin",
    component: SuperAdminLayout,
    meta: { role: "admin" },
    children: [
      { path: "", name: "adminDashboard", component: SuperDashboard },
      { path: "BemorCard/:id", name: "adminBemor_card", component: Bemor_card,meta: { role: "admin" },},
      { path: "xodimlar", name: "adminXodimlar", component: Xodimlar },

      { path: "bemorSpiska", name: "BemorSpiska", component: BemorSpiska },
      { path: "room/:id", name: "adminRoomDetails", component: RoomDetels },
      { path: "bemorlar", name: "adminBemorlar", component: Bemorlar },
      { path: "rooms", name: "adminRooms", component: Rooms },
      { path: "kassaSahifa", name: "adminkassaSahifa", component: KassaSahifa },
      { path: "kasaFilter", name: "adminkasaFilter", component: KasaFilter },
      { path: "kassaPulQaytarish", name: "adminkassaPulQaytarish", component: KassaPulQaytarish },
      { path: "kassaStatistika", name: "adminkassaStatistika", component: KassaStatistika },
      { path: "kassaTolovQoshish", name: "adminkassaTolovQoshish", component: KassaTolovQoshish },
      { path: "kassaTolovlarJadvali", name: "adminkassaTolovlarJadvali", component: KassaTolovlarJadvali },
      {
        path: "RegisterPage",
        name: "adminRegisterPage",
        component: RegisterPage,
      },
      {
        path: "taklif/:clientId",
        name: "adminTakliflar",
        component: Takliflar,
        props: true,
      },
      { 
        path: "retseptOshxona", 
        name: "AdminKirimOshxona", 
        component: RetseptOshxonaOshxona 
      },
      { 
        path: "oshxonaOvqatlari", 
        name: "AdminoshxonaOvqatlari", 
        component: OshxonaOvqatlar 
      },
      {
        path: "chiqimOshxona",
        name: "AdminchiqimOshxona",
        component: ChiqimOshxona,
      },
      {
        path: "omborBalans",
        name: "AdminomborBalans",
        component: OmborBalans,
      },
      {
        path: "maxsulotlarOshxona",
        name: "AdminmaxsulotlarOshxona",
        component: MaxsulotlarOshxona,
      },
       {
      path: "omborMaxsulotlar",
      name: "adminOmborMaxsulotlar",
      component: OmborMaxsulotlar,
    },
    {
      path: "omborKirim",
      name: "adminOmborKirim",
      component: OmborKirim,
    },
    {
      path: "omborChiqim",
      name: "adminOmborChiqim",
      component: OmborChiqim,
    },
    ],
  },

  // MINI
  {
    path: "/kassa",
    component: MiniAdminLayout,
    meta: { role: "kassa" },
    children: [
      { path: "", name: "MiniDashboard", component: MiniDashboard },
      { path: "BemorCard/:id", name: "miniBemor_card", component: Bemor_card, },

      { path: "kassaSahifa", name: "minikassaSahifa", component: KassaSahifa },
      { path: "kasaFilter", name: "minikasaFilter", component: KasaFilter },
      { path: "bemorSpiska", name: "miniBemorSpiska", component: BemorSpiska },
      { path: "kassaPulQaytarish", name: "minikassaPulQaytarish", component: KassaPulQaytarish },
      { path: "kassaStatistika", name: "minikassaStatistika", component: KassaStatistika },
      { path: "kassaTolovQoshish", name: "minikassaTolovQoshish", component: KassaTolovQoshish },
      { path: "kassaTolovlarJadvali", name: "minikassaTolovlarJadvali", component: KassaTolovlarJadvali },
      { path: "room/:id", name: "miniRoomDetails", component: RoomDetels },
      { path: "bemorlar", name: "MiniBemorlar", component: Bemorlar },
      { path: "rooms", name: "MiniRooms", component: Rooms },
      { path: "RegisterPage", name: "miniRegisterPage", component: RegisterPage,
      },
      {
        path: "taklifmi/:clientId",
        name: "miniTakliflar",
        component: Takliflar,
        props: true,
      },
      
   
    ],
  },
  //OSHXONA
  {
    path: "/oshxona",
    component: OshxonaLayout,
    meta: { role: "oshxona" },
    children: [
      { path: "", name: "OshxonaDashboard", component: OshxonaDashboard },
      { path: "retseptOshxona", name: "KirimOshxona", component: RetseptOshxonaOshxona },
      {
        path: "chiqimOshxona",
        name: "chiqimOshxona",
        component: ChiqimOshxona,
      },
      {
        path: "maxsulotlarOshxona",
        name: "maxsulotlarOshxona",
        component: MaxsulotlarOshxona,
      },
       { 
        path: "oshxonaOvqatlari", 
        name: "OshxonaOvqatlari", 
        component: OshxonaOvqatlar 
      }
    ],
  },
  //OMBOR
  {
  path: "/ombor",
  component: OmborLayout,
  meta: { role: "ombor" },
  children: [
    { path: "", name: "OmborDashboard", component: OmborDashboard },
    { path: "omborKirim", name: "omborKirim", component: OmborKirim },
    { path: "omborChiqim", name: "omborChiqim", component: OmborChiqim },
    { path: "omborMaxsulotlar", name: "omborMaxsulotlar", component: OmborMaxsulotlar },
     {
        path: "omborBalans",
        name: "omborBalans",
        component: OmborBalans,
      },
  ]
  },
  //CAL MARKAZ
  {
    path: "/callCenter",
    component: ColMarkazLayout,
    meta: { role: "call_center" },
    children: [
      { path: "", name: "ColMarkazDashboard", component: ColMarkazDashboard },
      { path: "roomsCallCenter", name: "roomsCallCenter", component: Rooms },
      
    ],
  },

//Labaratory

  {
    path: "/laborant",
    component: LabaratoryLatout,
    meta: { role: "laborant" },
    children: [
      { path: "", name: "LabaratoryaDashboard", component: LabaratoryaDashboard },
      { path: "natijalar", name: "NatijaLab", component: NatijaLab },
      {path: "taxlilTuri",name:"TaxlilTuriLab" , component: TaxlilTuriLab},
      {path: "taxlilBriktrish",name:"TaxlilPDFlab" , component: TaxlilPDFlab},
      {path: "taxlilLab",name:"taxlilLab" , component:taxlilLab },
      {path: "labaratoryaKassa",name:"LabKassa" , component:LabKassa },
      {path: "labaratoryaTolov",name:"LabKassaTolov" , component:LabKassaTolov },
    ],
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("role");

  if (to.meta.public) {
    return next();
  }

  if (to.meta.role) {
    // to.meta.role string yoki array bo‘lishi mumkin
    if (Array.isArray(to.meta.role)) {
      if (!to.meta.role.includes(role)) {
        alert("Sizda ushbu sahifaga kirish ruxsati yo'q.");
        return next('/login'); // yoki login sahifasiga yo'naltirish
      }
    } else {
      if (role !== to.meta.role) {
        alert("Sizda ushbu sahifaga kirish ruxsati yo'q.");
        return next('/login');
      }
    }
  }

  next();
});


export default router;
