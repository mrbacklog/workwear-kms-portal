import { kmsApiBase } from './kms-theme'

// ============================================================
// Hardcoded translations
// ============================================================

export const translations = {
  nl: {
    'order.place': 'Bestelling plaatsen',
    'search.placeholder': 'Zoek op merk, model of kleur...',
    'cart.view': 'Bestelling bekijken',
    'order.placed': 'Bestelling geplaatst!',
    'order.quantity': 'Aantal',
    'auth.email.label': 'Uw e-mailadres',
    'auth.submit': 'Verstuur link',
    'auth.welcome': 'Welkom bij uw bestelportaal',
    'products.title': 'Uw assortiment',
    'products.empty': 'Geen producten gevonden',
    'products.detail': 'Productdetails bekijken',
    'confirm.title': 'Bestelling bevestigen',
    'confirm.total': 'Totaalbedrag',
    'confirm.reference': 'Referentie (optioneel)',
    'confirm.notes': 'Opmerkingen (optioneel)',
    'confirm.cancel': 'Annuleren, ga terug',
    'success.title': 'Bestelling geplaatst!',
    'success.message': 'U ontvangt een bevestiging per e-mail. Uw werkkleding wordt zo snel mogelijk verwerkt.',
    'success.new': 'Nieuwe bestelling',
    'cart.items': 'artikelen',
    'cart.item': 'artikel',

    // SizeSelector
    'sizes.swipe_hint': 'swipe voor meer',
    'sizes.subtotal': 'Subtotaal',
    'sizes.detail_link': 'Productdetails bekijken',

    // ProductDetail
    'detail.title': 'Productdetails',
    'detail.close': 'Sluiten',
    'detail.price_from': 'vanaf',
    'detail.available_sizes': 'Beschikbare maten',
    'detail.variants': 'Varianten',
    'detail.sizes_count': 'maten',

    // OrderSummary
    'summary.title': 'Bestelling bevestigen',
    'summary.close': 'Sluiten',
    'summary.size': 'Maat',
    'summary.total': 'Totaalbedrag',
    'summary.pricing_note': 'Alle genoemde prijzen zijn exclusief bedrukking.',
    'summary.reference_label': 'Referentie (optioneel)',
    'summary.reference_placeholder': 'Bijv. afdeling, projectnummer...',
    'summary.notes_label': 'Opmerkingen (optioneel)',
    'summary.notes_placeholder': 'Eventuele opmerkingen bij uw bestelling...',
    'summary.submitting': 'Even geduld...',
    'summary.submit': 'Bestelling plaatsen',
    'summary.cancel': 'Annuleren, ga terug',

    // Auth
    'auth.welcome_prefix': 'Welkom bij ons',
    'auth.welcome_title': 'vernieuwde bestelportaal',
    'auth.subtitle': 'Hier kunt u eenvoudig uw bedrijfskleding nabestellen.',
    'auth.description': 'Voer uw e-mailadres in en we sturen u een toegangslink.',
    'auth.email_label': 'E-mailadres',
    'auth.submitting': 'Versturen...',
    'auth.success': 'Check uw inbox — u ontvangt binnen enkele minuten een link.',
    'auth.no_email_title': 'Geen mail ontvangen?',
    'auth.no_email_body': 'Neem dan contact met ons op',
    'auth.contact_phone': '0113-573237',
    'auth.contact_email': 'kleding@vankruiningen.nl',
    'auth.contact_note': 'Dan zorgen we ervoor dat uw e-mailadres wordt toegevoegd.',

    // Order page
    'order.error_loading': 'Er ging iets mis bij het laden van de producten.',
    'order.error_title': 'Er ging iets mis',
    'order.retry': 'Opnieuw proberen',
    'order.no_results': 'Geen producten gevonden',
    'order.no_products': 'Geen producten beschikbaar',
    'order.no_results_for': 'Geen resultaten voor',
    'order.no_products_assigned': 'Er zijn nog geen producten toegewezen aan uw assortiment.',
    'order.clear_filter': 'Zoekfilter verwijderen',
    'order.clear_search': 'Zoekopdracht wissen',

    // Catalogus indeling-tabs
    'catalog.all_tab': 'Alles',

    // Confirm page
    'confirm.order_number': 'Ordernummer',
    'confirm.total_label': 'Totaal:',
    'confirm.reference_label': 'Referentie:',
    'confirm.back': 'Terug naar startpagina',

    // Verify page
    'verify.loading': 'Link wordt gecontroleerd...',
    'verify.error_default': 'Link is ongeldig of verlopen.',
    'verify.error_params': 'Ongeldige URL parameters.',
    'verify.error_connection': 'Er is een verbindingsfout opgetreden. Probeer het opnieuw.',
    'verify.error_title': 'Link ongeldig',
    'verify.back': 'Terug naar aanmelden',

    // Auth errors
    'auth.error_generic': 'Er is een fout opgetreden. Probeer het opnieuw.',

    // Layout
    'layout.logout': 'Uitloggen',
    'layout.switch_customer': 'Wissel van klant',

    // Customer picker (staff)
    'picker.title': 'Klant selecteren',
    'picker.description': 'Kies een klant om hun assortiment te bekijken',
    'picker.search_placeholder': 'Zoek op bedrijfsnaam...',
    'picker.error': 'Kon klanten niet laden. Probeer het opnieuw.',
    'picker.retry': 'Opnieuw proberen',
    'picker.empty': 'Geen klanten gevonden',
    'picker.no_customers': 'Er zijn nog geen actieve klanten.',

    // PWA install
    'pwa.add': 'Toevoegen',
    'pwa.close': 'Sluiten',

    // ProductCard
    'product.price_from': 'vanaf',

    // SizeSelector aria labels
    'size.decrease': 'Verminder',
    'size.increase': 'Verhoog',

    // Access request (extra account aanvragen)
    'layout.request_access': 'Extra account aanvragen',
    'access_request.title': 'Extra account aanvragen',
    'access_request.email_label': 'E-mailadres',
    'access_request.email_placeholder': 'naam@bedrijf.nl',
    'access_request.submit': 'Versturen',
    'access_request.submitting': 'Versturen...',
    'access_request.cancel': 'Annuleren',
    'access_request.close': 'Sluiten',
    'access_request.success': 'Uw aanvraag is ontvangen en wacht op goedkeuring.',
    'access_request.error': 'Er ging iets mis bij het versturen van uw aanvraag. Probeer het opnieuw.',

    // Herhaalbestellen via persoonsfilter (medewerker-terminologie, code-namen blijven person.*)
    'person.filter_button': 'Filter op medewerker',
    'person.filter_title': 'Filter op medewerker',
    'person.filter_clear': 'Filter wissen',
    'person.search_placeholder': 'Zoek op naam...',
    'person.none_found': 'Geen medewerker gevonden',
    'person.ordered_before_count': 'eerder besteld',
    'person.not_ordered_yet': 'nog niets besteld',
    'person.history_section_title': 'Eerder besteld voor',
    'person.more_tags': 'meer',
    'person.less_tags': 'Toon minder',
  },
  'nl-ZB': {
    // Yerseks / Zuid-Bevelands dialect
    // Klanken: ge-→e-, g→h, ae→î, ui→uu, ij→ie, geen "ao"
    'order.place': "Bestel mî!",
    'search.placeholder': "Wa moe je 'ebbe?",
    'cart.view': "Kiek 's wa je 'eit",
    'order.placed': "'t Is eregeld!",
    'order.quantity': "'oeveel",
    'auth.email.label': "Doe je mail d'rin",
    'auth.submit': "Stier 'm op",
    'auth.welcome': "Welkom bie 't bestelportihl",
    'products.title': "Joen spullen",
    'products.empty': "D'r is niks te vinden",
    'products.detail': "Bekiek 't 's hoed",
    'confirm.title': "Bestelling ofmaeke",
    'confirm.total': "Totihl",
    'confirm.reference': "Referentie (of je wil)",
    'confirm.notes': "Opmerkingen (of je wil)",
    'confirm.cancel': "Lî mî zitte",
    'success.title': "'t Is eregeld!",
    'success.message': "Je kriegt 'n mailtje. Subiet is 't klaer.",
    'success.new': "Noh een bestelling",
    'cart.items': "dingetjes",
    'cart.item': "dingetje",

    // SizeSelector
    'sizes.swipe_hint': "veeg voe mee",
    'sizes.subtotal': "Subtotihl",
    'sizes.detail_link': "Bekiek 't 's hoed",

    // ProductDetail
    'detail.title': "Productdetails",
    'detail.close': "Dicht doen",
    'detail.price_from': "vanof",
    'detail.available_sizes': "Mihten die d'r bin",
    'detail.variants': "Varianten",
    'detail.sizes_count': "mihten",

    // OrderSummary
    'summary.title': "Bestelling ofmaeke",
    'summary.close': "Dicht doen",
    'summary.size': "Miht",
    'summary.total': "Totihl",
    'summary.pricing_note': "Alle enoemde priezen bin zonder bedrukking.",
    'summary.reference_label': "Referentie (of je wil)",
    'summary.reference_placeholder': "Bv. afdeling, projectnommer...",
    'summary.notes_label': "Opmerkingen (of je wil)",
    'summary.notes_placeholder': "Opmerkingen bie de bestelling...",
    'summary.submitting': "'n Moment...",
    'summary.submit': "Bestel mî!",
    'summary.cancel': "Lî mî zitte",

    // Order page
    'order.error_loading': "'t Hink mis bie 't laden van de producten.",
    'order.error_title': "'t Hink mis",
    'order.retry': "Prebeer 't noh 's",

    // Auth
    'auth.welcome_prefix': "Welkom bie ons",
    'auth.welcome_title': "vernieuwde bestelportihl",
    'auth.subtitle': "Hier kunt je emmokkelijk je bedrijfskleding nabestellen.",
    'auth.description': "Doe je mail d'rin en je kriegt een link estiere.",
    'auth.no_email_title': "Hin mail ekregn?",
    'auth.no_email_body': "Nim dan kontakt op",
    'auth.contact_phone': "0113-573237",
    'auth.contact_email': "kleding@vankruiningen.nl",
    'auth.contact_note': "Dan zorgen we d'rvoe dat je mail d'rbie komt.",
    'auth.email_label': "E-mail",
    'auth.submitting': "Stieren...",
    'auth.success': "Kiek in je mail — je kriegt subiet een link.",
    'order.no_results': "Niks evonden",
    'order.no_products': "D'r is niks",
    'order.no_results_for': "Niks evonden voe",
    'order.no_products_assigned': "D'r bin noh hin spullen voe joe.",
    'order.clear_filter': "Filter weg",
    'order.clear_search': "Zoekopdracht wissen",

    // Catalogus indeling-tabs
    'catalog.all_tab': "Alles",

    // Confirm page
    'confirm.order_number': "Ordernommer",
    'confirm.total_label': "Totihl:",
    'confirm.reference_label': "Referentie:",
    'confirm.back': "Vromme ni 't begin",

    // Verify page
    'verify.loading': "Link wor ekeken...",
    'verify.error_default': "Link is nie hoed of te oud.",
    'verify.error_params': "Onheldig, hiht nie hoed.",
    'verify.error_connection': "'t Lukt nie om te verbinden. Prebeer 't noh 's.",
    'verify.error_title': "Link is nie hoed",
    'verify.back': "Vromme ni aanmelden",

    // Auth errors
    'auth.error_generic': "'t Hink mis. Prebeer 't noh 's.",

    // Layout
    'layout.logout': "Uitloggen",
    'layout.switch_customer': "Wissel van klant",

    // Customer picker (staff)
    'picker.title': "Klant kiezen",
    'picker.description': "Kies 'n klant om 't assortiment te bekieken",
    'picker.search_placeholder': "Zoek op bedriefsniem...",
    'picker.error': "'t Lukt nie om klanten te laden. Prebeer 't noh 's.",
    'picker.retry': "Prebeer 't noh 's",
    'picker.empty': "Hin klanten evonden",
    'picker.no_customers': "D'r bin noh hin klanten.",

    // PWA install
    'pwa.add': "Toevoegen",
    'pwa.close': "Dicht doen",

    // ProductCard
    'product.price_from': "vanof",

    // SizeSelector aria labels
    'size.decrease': "Minder",
    'size.increase': "Meer",

    // Access request (extra account aanvragen)
    'layout.request_access': "Extra account eanvraege",
    'access_request.title': "Extra account eanvraege",
    'access_request.email_label': "E-mail",
    'access_request.email_placeholder': "niem@bedriefke.nl",
    'access_request.submit': "Stier op",
    'access_request.submitting': "Stieren...",
    'access_request.cancel': "Lî mî zitte",
    'access_request.close': "Dicht doen",
    'access_request.success': "Je aanvraeg is d'r, wacht noh op oh-keuring.",
    'access_request.error': "'t Hink mis bie 't stieren. Prebeer 't noh 's.",

    // Herhaalbestellen via persoonsfilter (medewerker-terminologie)
    'person.filter_button': 'Voe wie?',
    'person.filter_title': 'Voe wie?',
    'person.filter_clear': "Filter d'r af",
    'person.search_placeholder': 'Zoek op naeme...',
    'person.none_found': 'Gin verkeschapper evonden',
    'person.ordered_before_count': 'eerder ebesteld',
    'person.not_ordered_yet': 'nog niks ebesteld',
    'person.history_section_title': 'Eerder ebesteld voe',
    'person.more_tags': 'mì',
    'person.less_tags': 'Minder',
  },
} as const;

export type TranslationKey = keyof typeof translations.nl;
export type Locale = keyof typeof translations;

// ============================================================
// Remote translation cache
// ============================================================

let remoteTranslationsCache: Record<string, string> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function loadRemoteTranslations(): Promise<void> {
  if (remoteTranslationsCache && Date.now() - cacheTimestamp < CACHE_TTL) return
  try {
    const res = await fetch(`${kmsApiBase}/api/v1/kms/translations?locale=nl-ZB`)
    if (res.ok) {
      const data = (await res.json()) as { locale: string; translations: Record<string, string> }
      remoteTranslationsCache = data.translations
      cacheTimestamp = Date.now()
    }
  } catch {
    // Silently fail — use hardcoded defaults
  }
}

export function getTranslation(key: TranslationKey, locale: Locale): string {
  if (locale === 'nl-ZB' && remoteTranslationsCache?.[key]) {
    return remoteTranslationsCache[key]
  }
  return translations[locale][key]
}
