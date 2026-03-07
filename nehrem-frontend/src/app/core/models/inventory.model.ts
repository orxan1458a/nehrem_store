export interface InventoryBatch {
  id: number;
  productId: number;
  productName: string;
  purchasePrice: number;
  quantity: number;
  dateAdded: string;
}

export interface AddBatchRequest {
  purchasePrice: number;
  quantity: number;
}
