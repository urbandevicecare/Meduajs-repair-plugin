
      // Auto-generated index file for Medusa Admin UI extensions
    import WidgetComponent0, { config as WidgetConfig0 } from "/Users/slyb./Documents/Nelly/Medusajs Projects/Meduajs-repair-plugin/src/admin/widgets/repair-ticket-widget.tsx"

const widgetModule = { widgets: [
  {
    Component: WidgetComponent0,
    zone: ["customer.details.before"],
    widgetId: "Widget-8fda"
}
] }
    import RouteComponent0 from "/Users/slyb./Documents/Nelly/Medusajs Projects/Meduajs-repair-plugin/src/admin/routes/repairs/page.tsx"
import RouteComponent1 from "/Users/slyb./Documents/Nelly/Medusajs Projects/Meduajs-repair-plugin/src/admin/routes/repairs/[id]/page.tsx"
import RouteComponent2 from "/Users/slyb./Documents/Nelly/Medusajs Projects/Meduajs-repair-plugin/src/admin/routes/repairs/reports/page.tsx"

const routeModule = { routes: [
    {
    Component: RouteComponent0,
    path: "/repairs"
  },
{
    Component: RouteComponent1,
    path: "/repairs/:id"
  },
{
    Component: RouteComponent2,
    path: "/repairs/reports"
  }
]
 }
    import { config as RouteConfig0 } from "/Users/slyb./Documents/Nelly/Medusajs Projects/Meduajs-repair-plugin/src/admin/routes/repairs/page.tsx"
import { config as RouteConfig2 } from "/Users/slyb./Documents/Nelly/Medusajs Projects/Meduajs-repair-plugin/src/admin/routes/repairs/reports/page.tsx"

const menuItemModule = { menuItems: [
    {
    label: RouteConfig0.label,
    icon: RouteConfig0.icon,
    path: "/repairs",
    nested: undefined,
    rank: undefined,
    translationNs: undefined
  },
{
    label: RouteConfig2.label,
    icon: RouteConfig2.icon,
    path: "/repairs/reports",
    nested: undefined,
    rank: undefined,
    translationNs: undefined
  }
]
 }
    

const formModule = { customFields: {
  
} }
    

const displayModule = { 
    displays: {
      
    }
   }
    import { deepMerge } from "@medusajs/admin-shared"
import i18nTranslations0 from "/Users/slyb./Documents/Nelly/Medusajs Projects/Meduajs-repair-plugin/src/admin/i18n/index.ts"

const i18nModule = { resources: i18nTranslations0 }
    

const layoutModule = { layouts: [
  
] }

    const plugin = {
      widgetModule,
      routeModule,
      menuItemModule,
      formModule,
      displayModule,
      i18nModule,
      layoutModule
    }

    export default plugin
    