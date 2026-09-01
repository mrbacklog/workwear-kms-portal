export interface KmsAuthResponse {
  access_token: string;
  customer_name: string;
  customer_slug: string;
  refresh_token?: string;
  expires_in?: number;
  is_staff?: boolean;
}

export interface KmsStaffCustomer {
  id: string;
  company_name: string;
  slug: string;
  open_orders: number;
}

export interface KmsRequestBody {
  email: string;
}

export interface KmsVerifyBody {
  token: string;
}

export interface KmsPortalVariant {
  id: string;
  size: string;
  ean: string;
  price_cents: number | null;
}

export interface KmsImage {
  url: string;
  sequence_number: number;
  is_cover: boolean;
}

/** Bestellijst-indeling (groep) waaraan een product is toegewezen. */
export interface KmsPortalProductGroup {
  id: string;
  name: string;
  sort_order: number;
}

export interface KmsPortalProduct {
  /**
   * Stabiele model-identifier. De portal bundelt kleuren van hetzelfde model
   * hierop — nooit op de modelnaam-tekst (identieke namen kunnen naar
   * verschillende modellen wijzen). Null/afwezig bij source === 'gripp'.
   */
  product_model_id?: string | null;
  model_name: string;
  brand_name: string;
  color: string;
  color_primary_hex: string | null;
  color_secondary_hex: string | null;
  color_tertiary_hex: string | null;
  price_from_cents: number | null;
  image: KmsImage | null;
  variants: KmsPortalVariant[];
  /** Stabiele kleur-identifier; sleutel voor de kleurkeuze binnen een modelkaart. */
  color_variant_id?: string | null;
  /** Present for all items from the portal API (backend Task 5/6). */
  source?: 'clothing' | 'gripp';
  /** Set when source === 'gripp'. UUID of the gripp_product row. */
  gripp_product_id?: string | null;
  /** Indelingen waarin dit product voorkomt (leeg = ongegroepeerd). */
  groups?: KmsPortalProductGroup[];
}

export interface KmsPortalProductList {
  products: KmsPortalProduct[];
  customer_name: string;
  customer_has_gripp_id: boolean;
}

export interface CartItem {
  variantId: string;
  modelName: string;
  color: string;
  size: string;
  ean: string;
  quantity: number;
  priceCents: number;
  /** Set for Gripp items (no variant/size/EAN). */
  grippProductId?: string;
  /** Personen getagd aan deze regel (client-side selectie vóór het plaatsen van de order). */
  persons?: KmsPerson[];
}

export interface KmsPerson {
  id: string;
  name: string;
  created_at?: string;
}

/** Eén (ean, maat, persoon)-combinatie uit de bestelhistorie — voor herhaalbestellen/filter. */
export interface KmsPersonHistoryRecord {
  ean: string;
  size: string;
  person_id: string;
  person_name: string;
  qty: number;
  last_ordered_at: string;
}

export interface KmsPersonHistoryResponse {
  history: KmsPersonHistoryRecord[];
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalCents: number;
}

export interface KmsOrderLine {
  /** Set for regular clothing variants. */
  product_variant_id?: string;
  /** Set for Gripp-catalogue items (no EAN/variant). */
  gripp_product_id?: string;
  quantity: number;
  /** Optionele lijst van reeds aangemaakte person-ID's getagd aan deze regel. */
  person_ids?: string[];
}

export interface KmsOrderRequest {
  lines: KmsOrderLine[];
  reference?: string;
  notes?: string;
}

export interface KmsOrderResponse {
  id: string;
  order_number: string;
  reference: string | null;
  notes: string | null;
  total_amount_cents: number;
  gripp_offer_number: string | null;
  gripp_status: 'created' | 'failed' | 'skipped' | null;
  gripp_status_detail: string | null;
  created_at: string;
}
