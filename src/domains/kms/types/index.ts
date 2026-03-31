export interface KmsAuthResponse {
  access_token: string;
  customer_name: string;
  customer_slug: string;
  refresh_token?: string;
  expires_in?: number;
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

export interface KmsPortalProduct {
  model_name: string;
  brand_name: string;
  color: string;
  price_from_cents: number | null;
  image_url: string | null;
  variants: KmsPortalVariant[];
}

export interface KmsPortalProductList {
  products: KmsPortalProduct[];
  customer_name: string;
}

export interface CartItem {
  variantId: string;
  modelName: string;
  color: string;
  size: string;
  ean: string;
  quantity: number;
  priceCents: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalCents: number;
}

export interface KmsOrderLine {
  product_variant_id: string;
  quantity: number;
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
  total_cents: number;
  total_amount_cents: number;
  gripp_offer_number: string | null;
  gripp_status: 'created' | 'failed' | 'skipped' | null;
  gripp_status_detail: string | null;
  created_at: string;
}
